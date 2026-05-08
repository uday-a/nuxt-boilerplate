import { hasAxiom } from '~~/server/utils/env'
import { logger } from '~~/server/utils/logger'

// Flush pending Axiom events on graceful shutdown so we don't lose the
// last few seconds of logs when the container restarts or scales down.
//
// Convention (see CLAUDE.md → "Gating modules and plugins on env"):
// plugins tied to an external service short-circuit when that service
// isn't configured. Without an Axiom token the logger is consola-only
// and there's nothing to flush — skip registering the hook entirely.
export default defineNitroPlugin((nitroApp) => {
  if (!hasAxiom) return

  nitroApp.hooks.hook('close', async () => {
    await logger.flush()
  })
})
