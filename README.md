# nuxt-queue-it

### Support it

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/woomoo)

## Features

- 👌 Zero-code required
- 🔥 Run high-traffic sales & registrations without crashes or bots
- ⚡️ Control traffic on your website

## Overview

It's an unofficial module to Nuxt3 framework. It's still under development and require testing. Stable version will be released once those actions will be done. Nuxt2 is not supported, but seprate release will be created if testing on this one pass.

## 🔗 Links

- 📘 [Offical](https://queue-it.com/)
- 👁️‍🗨️ [Preview](https://nuxt-queue-it.nuxt.dev)

## Quick setup

1. Install `nuxt-queue-it`!

NPM based

```bash
npm add -S nuxt-queue-it
```

Yarn based

```bash
yarn add nuxt-queue-it
```

PNPM based

```bash
pnpm add nuxt-queue-it
```

Bun based

```bash
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

## Licence

[Apache 2.0](./LICENCE)
