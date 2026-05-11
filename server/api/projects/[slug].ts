import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { logger } from '~~/server/utils/logger'

// H3-style flexible handler for a single resource: GET, PUT, DELETE all
// in this file. See server/api/projects/index.ts for the convention.

const UpdateProject = z.object({
  name: z.string().trim().min(1).max(128).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
})

export default apiHandler(async (event) => {
  const session = await requireAuth(event)
  const isDemo = session.demo === true
  const slug = getRouterParam(event, 'slug')

  if (!slug) throw apiError('VALIDATION_FAILED', 'Missing slug')

  const method = event.method

  // ─── GET /api/projects/:slug ───────────────────────────────────────
  if (method === 'GET') {
    if (isDemo) {
      const demo = demoBySlug(slug)
      if (!demo) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
      return { project: demo }
    }
    const db = useDb()
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(and(eq(schema.projects.slug, slug), eq(schema.projects.ownerId, session.user.id)))
      .limit(1)
    if (!project) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
    return { project }
  }

  // ─── PUT /api/projects/:slug ───────────────────────────────────────
  if (method === 'PUT') {
    const body = await readBody(event)
    const parsed = UpdateProject.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid project payload', {
        issues: parsed.error.issues,
      })
    }

    if (isDemo) {
      const demo = demoBySlug(slug)
      if (!demo) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
      return { project: { ...demo, ...parsed.data, updatedAt: new Date() } }
    }

    const db = useDb()
    const [project] = await db
      .update(schema.projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(schema.projects.slug, slug), eq(schema.projects.ownerId, session.user.id)))
      .returning()
    if (!project) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
    logger.info('projects.updated', { ownerId: session.user.id, slug })
    return { project }
  }

  // ─── DELETE /api/projects/:slug ────────────────────────────────────
  if (method === 'DELETE') {
    if (isDemo) return { deleted: true }
    const db = useDb()
    const [project] = await db
      .delete(schema.projects)
      .where(and(eq(schema.projects.slug, slug), eq(schema.projects.ownerId, session.user.id)))
      .returning({ id: schema.projects.id })
    if (!project) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
    logger.info('projects.deleted', { ownerId: session.user.id, slug })
    return { deleted: true }
  }

  throw apiError('NOT_FOUND', `Method ${method} not supported on /api/projects/${slug}`)
})

function demoBySlug(slug: string) {
  const demos = [
    { id: 1, slug: 'design-engineering', name: 'Design Engineering', description: 'Frontend platform, design system, UX research.', ownerId: 0, createdAt: new Date('2026-01-12'), updatedAt: new Date('2026-04-30') },
    { id: 2, slug: 'sales-marketing', name: 'Sales & Marketing', description: 'GTM ops, campaigns, pipeline analytics.', ownerId: 0, createdAt: new Date('2026-02-04'), updatedAt: new Date('2026-05-12') },
    { id: 3, slug: 'travel', name: 'Travel', description: 'Trip planning, expense tracking, traveler ops.', ownerId: 0, createdAt: new Date('2026-03-19'), updatedAt: new Date('2026-05-15') },
  ]
  return demos.find(d => d.slug === slug)
}
