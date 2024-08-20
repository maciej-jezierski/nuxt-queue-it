import {
  defineNuxtModule,
  addServerHandler,
  createResolver,
  addRouteMiddleware,
} from '@nuxt/kit'
import { defu } from 'defu';

export interface ModuleOptions {
  customerId: string | null
  customerSecretKey: string | null
  apiKey: string | null
  disabled: boolean
  cookiePath: string
  ignoreHttpMethods: string[]
  ignoreHttpPaths: string[] | { path: string, contains?: boolean }[] // all cached or static files should be excluded
  enableSpaScript: boolean
  enableMiddlewareSessionRefresh: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-queue-it',
    configKey: 'queueit',
  },
  defaults: {
    apiKey: null,
    customerId: null,
    customerSecretKey: null,
    disabled: false,
    cookiePath: '/',
    ignoreHttpMethods: ['OPTIONS', 'HEAD'],
    enableSpaScript: true,
    enableMiddlewareSessionRefresh: true,
    ignoreHttpPaths: [
      { path: '/css/', contains: true },
      { path: '/fonts/', contains: true },
      { path: '/scripts/', contains: true },
      { path: '/_nuxt/', contains: true },
      { path: '/icons/', contains: true },
      { path: '/_ipx/', contains: true },
      { path: '_loading/sse' },
    ],
  },
  setup(_options, _nuxt) {
    if (_options.disabled) {
      return
    }

    _nuxt.options.runtimeConfig.queueit = defu(_nuxt.options.runtimeConfig, {
      ..._options
    });
    _nuxt.options.runtimeConfig.public.queueit = defu(_nuxt.options.runtimeConfig.public, {
      customerId: _options.customerId
    })



    const resolver = createResolver(import.meta.url)

    addServerHandler({
      handler: resolver.resolve('runtime/server/middleware/queueit'),
      middleware: true,
    })

    const head = _nuxt.options.app.head
    head.script = head.script ?? []

    if (_options.enableSpaScript || _options.enableMiddlewareSessionRefresh) {
      head.script.push({
        src: `//static.queue-it.net/script/queueclient.min.js`,
      })
    }

    if (_options.enableSpaScript && _options.customerId) {
      head.script.push({
        'src': `//static.queue-it.net/script/queueconfigloader.min.js`,
        'data-queueit-spa': true,
        'data-queueit-c': _options.customerId,
      })
    }

    if (_options.enableMiddlewareSessionRefresh) {
      addRouteMiddleware({
        name: 'global-queue-it',
        path: resolver.resolve('runtime/middleware/queueit-route.global'),
        global: true,
      })
    }
  },
})
