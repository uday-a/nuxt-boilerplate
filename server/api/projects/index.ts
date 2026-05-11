import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { logger } from '~~/server/utils/logger'

// H3-style flexible handler: one file, multiple HTTP methods. Nitro
// routes any method to this file because the filename has no `.get` /
// `.post` suffix. Branch on `event.method` to dispatch.
//
// Benefit over `index.get.ts` + `index.post.ts`: shared auth/db setup
// runs once; logic stays adjacent. Cost: each method's body is harder
// to grep for in isolation — fine for ~5 methods, painful past 10.

const slug = z
  .string()
  .trim()
  .min(2, 'Slug must be at least 2 characters')
  .max(64, 'Slug must be 64 characters or fewer')
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Slug must be kebab-case (a-z, 0-9, hyphen)')

const CreateProject = z.object({
  slug,
  name: z.string().trim().min(1).max(128),
  description: z.string().trim().max(2000).optional(),
})

export default apiHandler(async (event) => {
  const session = await requireAuth(event)
  const method = event.method

  // Demo session has no DB row; surface a deterministic empty list / fake
  // success so the UI is clickable without polluting real data. Production
  // (NUXT_DEMO_MODE=false) takes the normal path.
  const isDemo = session.demo === true

  // ─── GET /api/projects ─────────────────────────────────────────────
  if (method === 'GET') {
    if (isDemo) return { projects: demoProjects() }
    const db = useDb()
    const rows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.ownerId, session.user.id))
      .orderBy(schema.projects.createdAt)
    return { projects: rows }
  }

  // ─── POST /api/projects ────────────────────────────────────────────
  if (method === 'POST') {
    const body = await readBody(event)
    const parsed = CreateProject.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid project payload', {
        issues: parsed.error.issues,
      })
    }

    if (isDemo) {
      // Demo: echo back without persisting.
      return {
        project: {
          id: 0,
          ownerId: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
          ...parsed.data,
        },
      }
    }

    const db = useDb()
    try {
      const [project] = await db
        .insert(schema.projects)
        .values({
          slug: parsed.data.slug,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          ownerId: session.user.id,
        })
        .returning()
      logger.info('projects.created', { ownerId: session.user.id, slug: parsed.data.slug })
      return { project }
    }
    catch (e) {
      // Drizzle + postgres-js bubble pg's unique_violation as code '23505'.
      if ((e as { code?: string }).code === '23505') {
        throw apiError('VALIDATION_FAILED', `A project with slug '${parsed.data.slug}' already exists`, { field: 'slug' })
      }
      throw e
    }
  }

  throw apiError('NOT_FOUND', `Method ${method} not supported on /api/projects`)
})

// Deterministic demo data so the UI looks populated in demo mode.
function demoProjects() {
  return [
    { id: 1, slug: 'design-engineering', name: 'Design Engineering', description: 'Frontend platform, design system, UX research.', ownerId: 0, createdAt: new Date('2026-01-12'), updatedAt: new Date('2026-04-30') },
    { id: 2, slug: 'sales-marketing', name: 'Sales & Marketing', description: 'GTM ops, campaigns, pipeline analytics.', ownerId: 0, createdAt: new Date('2026-02-04'), updatedAt: new Date('2026-05-12') },
    { id: 3, slug: 'travel', name: 'Travel', description: 'Trip planning, expense tracking, traveler ops.', ownerId: 0, createdAt: new Date('2026-03-19'), updatedAt: new Date('2026-05-15') },
  ]
}
