import { defineNuxtRouteMiddleware } from '#app'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  ;(window as any)['QueueIt']?.validateUser(true)
})
