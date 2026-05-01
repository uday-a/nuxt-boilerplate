// Example: PUBLIC API route.
//
// No auth check, no session read. Copy this shape for any endpoint that
// should be reachable by anonymous visitors (health checks, marketing
// page lookups, sitemap data, etc.).
//
// Try it:  curl http://localhost:3000/api/ping
export default defineEventHandler(() => {
  return {
    status: 'ok',
    service: 'nuxt-boilerplate',
    timestamp: new Date().toISOString(),
  }
})
