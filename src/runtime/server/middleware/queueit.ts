import { createHmac } from 'node:crypto'
import type {
  IConnectorContextProvider,
  IHttpClientProvider,
} from '@queue-it/connector-javascript'
import {
  KnownUser,
} from '@queue-it/connector-javascript'
import { getRequestURL } from 'h3'
import {
  defineEventHandler,
  useRuntimeConfig,
  getRequestHeader,
  sendRedirect,
  setResponseHeaders,
  parseCookies,
  getRequestIP,
  readBody,
  setCookie as setCookieOnEvent,
  getQuery,
} from '#imports'

const QUEUEIT_CONNECTOR_HEADER_NAME = 'x-queueit-connector'
const QUEUEIT_CONNECTOR_NAME = 'nodejs'
const QUEUEIT_CONNECTOR_FAILED_HEADER_NAME = 'x-queueit-failed'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    [QUEUEIT_CONNECTOR_HEADER_NAME]: QUEUEIT_CONNECTOR_NAME,
  })

  const { queueit: {
    apiKey,
    customerId,
    customerSecretKey,
    ignoreHttpMethods,
    ignoreHttpPaths,
    cookiePath,
  } } = useRuntimeConfig(event)
  if (!customerId || !customerSecretKey || !apiKey) {
    console.warn(
      '[Queue-IT] One of the credentials is not provided. Middleware check will be not executed',
    )
    return
  }

  try {
    if (isIgnored(event, { ignoreHttpMethods, ignoreHttpPaths })) {
      return
    }

    const body = await readBody(event)
    const queries = getQuery(event)
    const queueitToken = queries[KnownUser.QueueITTokenKey]
    const contextProvider = buildContextProvider(event, { cookiePath, body })
    const configuration = await getIntegrationConfiguration({
      apiKey,
      customerId,
    })
    const requestUrlWithoutToken = getRequestWithoutToken(event)

    const validationResult = await KnownUser.validateRequestByIntegrationConfig(
      requestUrlWithoutToken,
      queueitToken?.toString() || '',
      configuration,
      customerId,
      customerSecretKey,
      contextProvider,
      apiKey,
    )

    if (validationResult.doRedirect()) {
      setResponseHeaders(event, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': 'Fri, 01 Jan 1990 00:00:00 GMT',
      })

      if (validationResult.isAjaxResult) {
        const headerName = validationResult.getAjaxQueueRedirectHeaderKey()
        setResponseHeaders(event, {
          [headerName]: validationResult.getAjaxRedirectUrl(),
          'Access-Control-Expose-Headers': headerName,
        })
        return
      }
      else {
        return sendRedirect(event, validationResult.redirectUrl)
      }
    }
    else {
      const requestUrl = getAbsoluteRequestUrl(event)
      // Remove Queue-IT token and redirect
      if (
        requestUrl !== requestUrlWithoutToken
        && validationResult.actionType === 'Queue'
      ) {
        return sendRedirect(event, requestUrlWithoutToken)
      }
    }
  }
  catch (err) {
    console.error('[Queue-IT] middleware connector', err)
    setResponseHeaders(event, {
      [QUEUEIT_CONNECTOR_FAILED_HEADER_NAME]: 'true',
    })
  }
})

function isIgnored(
  event: any,
  {
    ignoreHttpMethods,
    ignoreHttpPaths,
  }: {
    ignoreHttpMethods: string[]
    ignoreHttpPaths: string[] | { path: string, contains?: boolean }[]
  },
) {
  if (ignoreHttpMethods.includes(event.method)) {
    return true
  }

  const { path } = event
  const anyPathMatch = ignoreHttpPaths.filter((it: any) => {
    if (typeof it === 'string' || it instanceof String) {
      return it === path
    }
    if (it.contains) {
      return !path.includes(it.path)
    }
    return path === it.path
  })

  return anyPathMatch
}

async function getIntegrationConfiguration({
  apiKey,
  customerId,
}: {
  apiKey: string
  customerId: string
}): Promise<string> {
  const endpoint = `https://${customerId}.api2.queue-it.net`

  const versions = await $fetch<QueueItVersionsResponse>(
    `${endpoint}/2_0/integration/versions`,
    { method: 'get', headers: { 'api-key': apiKey } },
  )
  if (versions.length == 0) {
    throw { message: 'No integration defined on account' }
  }

  const latestVersion = versions.reduce((highest, current) => {
    return current.Version > highest.Version ? current : highest
  })

  const version = await $fetch(
    `${endpoint}/2_0/integration/${latestVersion.Version}`,
    { method: 'get', headers: { 'api-key': apiKey } },
  )
  return JSON.stringify(version)
}

function buildContextProvider(
  event: any,
  { cookiePath, body }: { cookiePath: string, body: any | undefined },
): IConnectorContextProvider {
  const bodyAsString = body ? JSON.stringify(body) : ''

  return {
    getHttpClientProvider(): IHttpClientProvider {
      return {
        post(queueDomain, options) {
          return $fetch(queueDomain, options)
        },
      }
    },
    getCryptoProvider() {
      return {
        getSha256Hash(secretKey: any, plaintext: any) {
          return createHmac('sha256', secretKey).update(plaintext).digest('hex')
        },
      }
    },
    getEnqueueTokenProvider() {
      return {
        getEnqueueToken() {
          // TODO: If you need to use an enqueue token when enqueuing, you need to return it here.
          return null
        },
      }
    },
    getHttpRequest() {
      return {
        getUserAgent() {
          return getRequestHeader(event, 'user-agent') || ''
        },
        getHeader(headerName: string) {
          return getRequestHeader(event, headerName) || ''
        },
        getAbsoluteUri() {
          return getRequestURL(event).toString()
        },
        getUserHostAddress() {
          return (
            getRequestIP(event, { xForwardedFor: true })
            || event.node.req.socket.remoteAddress
          )
        },
        getCookieValue(cookieKey: string) {
          const cookies = parseCookies(event)
          return cookies[cookieKey]
        },
        getRequestBodyAsString() {
          return bodyAsString
        },
      }
    },
    getHttpResponse() {
      return {
        setCookie(
          cookieName: string,
          cookieValue: string,
          domain: string | undefined,
          expiration: number,
          isCookieHttpOnly: boolean,
          isCookieSecure: boolean,
        ) {
          if (domain === '') {
            domain = undefined
          }

          const expirationDate = new Date(expiration * 1000)

          setCookieOnEvent(event, cookieName, cookieValue, {
            expires: expirationDate,
            path: cookiePath,
            domain: domain,
            secure: isCookieSecure,
            httpOnly: isCookieHttpOnly,
          })
        },
      }
    },
  }
}

function getAbsoluteRequestUrl(event: any): string {
  const absoluteUrl = getRequestURL(event)
  return absoluteUrl.toString()
}

function getRequestWithoutToken(event: any): string {
  const url = getRequestURL(event)
  try {
    const params = new URLSearchParams(url.searchParams)

    params.delete(KnownUser.QueueITTokenKey)
    url.search = params.toString()
    return url.toString()
  }
  catch (err) {
    console.error('[Queue-It] Couldn\'t remove token in URL', err)
    return url.toString()
  }
}

type QueueItVersionsResponse = {
  AccountId: string
  PublishDescription: string
  PublishDate: string
  Version: number
}[]
