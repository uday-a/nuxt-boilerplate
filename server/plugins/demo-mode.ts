// The client reads runtimeConfig.public.demoMode to show /login's demo
// button, but nuxt.config bakes it at BUILD time while the server decides
// `isDemoMode` at RUNTIME. Overwrite the per-request config (a mutable
// clone that becomes the SSR payload) so UI and server always agree.
import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
import { isDemoMode } from '~~/server/utils/env'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    useRuntimeConfig(event).public.demoMode = isDemoMode
  })
})
