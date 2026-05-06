import { logger } from '~~/server/utils/logger'

// Flush pending Axiom events on graceful shutdown so we don't lose the
// last few seconds of logs when the container restarts or scales down.
// No-op when Axiom isn't configured (the logger handles that internally).
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    await logger.flush()
  })
})
