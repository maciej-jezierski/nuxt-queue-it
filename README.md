# nuxt-queue-it

## Features

- 👌 Zero-code required
- 🔥 Run high-traffic sales & registrations without crashes or bots
- ⚡️ Control traffic on your website

## Quick setup

1. Install `nuxt-queue-it`!

```npm
 npm add -S nuxt-queue-it
```

```yarn
 yarn add nuxt-queue-it
```

```pnpm
pnpm add nuxt-queue-it
```

```bun
bun add nuxt-queue-it
```

2. Add it to the `modules` section of `nuxt.config.ts`

   ```js
   export default defineNuxtConfig({
     modules: ["nuxt-queue-it"],
   });
   ```

## Configuration

Queue-IT supports a number of options, which you can pass in your `nuxt.config.ts` file:

```js
export default defineNuxtConfig({
  // ...
  queueit: {
    /**
     * API Key from QueueIT console
     * @default null
     */
    apiKey: null,
    /**
     * Customer ID from QueueIT console
     * @default null
     */
    customerId: null,
    /**
     * Customer Secret from QueueIT console
     * @default null
     */
    customerSecretKey: null,
    /**
     * Disable integation
     * @default false
     */
    disabled: false,
    /**
     * Cookie queue-it token with be created with this path
     * @default /
     */
    cookiePath: "/",
    /**
     * Which HTTP methods should be ignored and not checked during server calls
     * @default ['OPTIONS', 'HEAD']
     */
    ignoreHttpMethods: ["OPTIONS", "HEAD"],
    /**
     * Enable SPA tracking to extend cookie queueit token
     * @default true
     */
    enableSpaScript: true,
    /**
     * Enable validation of the cookie on middleware when route changes
     * @default true
     */
    enableMiddlewareSessionRefresh: true,
    /**
     * Static files should be excluded from the check
     * @default  [{ path: '/css/', contains: true },
      { path: '/fonts/', contains: true },
      { path: '/scripts/', contains: true },
      { path: '/_nuxt/', contains: true },
      { path: '/icons/', contains: true },
      { path: '/_ipx/', contains: true },
      { path: '_loading/sse' }]
     */
    ignoreHttpPaths: [
      { path: "/css/", contains: true },
      { path: "/fonts/", contains: true },
      { path: "/scripts/", contains: true },
      { path: "/_nuxt/", contains: true },
      { path: "/icons/", contains: true },
      { path: "/_ipx/", contains: true },
      { path: "_loading/sse" },
    ],
  },
});
```

## Development

- Run `bun prepare` to generate type stubs.
- Use `bun dev` to start [playground](./playground) in development mode.

## Licence

[Apache 2.0](./LICENCE)
