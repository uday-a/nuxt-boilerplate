// Nuxt's renderer stamps `X-Powered-By: Nuxt` on every HTML response; there
// is no config switch, so strip it once the response is ready. The rest of
// the security headers live in `routeRules` (nuxt.config.ts).
import { defineNitroPlugin } from 'nitropack/runtime'
import { removeResponseHeader } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response) => {
    delete response.headers?.['x-powered-by']
  })
  nitroApp.hooks.hook('beforeResponse', (event) => {
    removeResponseHeader(event, 'x-powered-by')
  })
})
