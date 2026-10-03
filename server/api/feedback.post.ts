import { readMultipartFormData } from 'h3'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { recordAudit } from '~~/server/utils/audit'
import { env } from '~~/server/utils/env'
import { sendEmail, feedbackEmail, type EmailAttachment } from '~~/server/utils/mailer'

const FeedbackInput = z.object({
  category: z.enum(['bug', 'idea', 'praise']),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(120, 'Subject must be 120 characters or fewer'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(4000, 'Message must be 4000 characters or fewer'),
})

// Attachments are screenshots, so images only. Client validates first;
// the server re-checks every file because client checks are bypassable.
const MAX_FILES = 3
const MAX_FILE_BYTES = 5 * 1024 * 1024

export default apiHandler(async (event) => {
  const session = await requireAuth(event)

  // Demo sessions are minted by anyone on demand; don't let them relay
  // email through our sender.
  if (session.demo === true) {
    throw apiError('FORBIDDEN', 'Feedback is disabled in demo mode.')
  }

  let category: unknown
  let subject: unknown
  let message: unknown
  let attachments: EmailAttachment[] = []
  let attachmentNames: string[] = []

  const contentType = getHeader(event, 'content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    if (!parts) throw apiError('VALIDATION_FAILED', 'Invalid feedback payload')

    const field = (name: string) =>
      parts.find(p => p.name === name && !p.filename)?.data.toString('utf8')

    category = field('category')
    subject = field('subject')
    message = field('message')

    const fileParts = parts.filter(p => p.filename)
    if (fileParts.length > MAX_FILES) {
      throw apiError('VALIDATION_FAILED', `You can attach up to ${MAX_FILES} images`)
    }
    attachments = fileParts.map((p) => {
      const filename = p.filename ?? 'attachment'
      const mime = p.type ?? ''
      if (!mime.startsWith('image/')) {
        throw apiError('VALIDATION_FAILED', `${filename} is not an image`)
      }
      if (p.data.length > MAX_FILE_BYTES) {
        throw apiError('VALIDATION_FAILED', `${filename} is larger than 5 MB`)
      }
      return {
        filename,
        content: p.data.toString('base64'),
        ...(mime ? { contentType: mime } : {}),
      }
    })
    attachmentNames = attachments.map(a => a.filename)
  }
  else {
    const body = await readBody(event)
    category = body?.category
    subject = body?.subject
    message = body?.message
  }

  const parsed = FeedbackInput.safeParse({ category, subject, message })
  if (!parsed.success) {
    throw apiError('VALIDATION_FAILED', 'Invalid feedback payload', {
      issues: parsed.error.issues,
    })
  }

  // Where to deliver: EMAIL_OPS if set, otherwise EMAIL_FROM so an
  // unconfigured prod doesn't accidentally ship feedback to a random
  // address. Both surfaces print to consola in dev (no Resend key).
  const to = env.EMAIL_OPS ?? env.EMAIL_FROM

  const { id } = await sendEmail(feedbackEmail({
    to,
    reporter: {
      name: session.user.name ?? session.user.login,
      email: session.user.email ?? `${session.user.login}@github.invalid`,
      login: session.user.login,
    },
    category: parsed.data.category,
    subject: parsed.data.subject,
    message: parsed.data.message,
    ...(attachments.length ? { attachments } : {}),
  }))

  // Attribute to the numeric users.id — the session id is the OAuth
  // provider id, so resolve via email (mirrors team/invites). Wrapped so
  // a db-less setup never breaks feedback delivery.
  let auditUserId: number | null = null
  try {
    const db = useDb()
    const sessionEmail = (session.user.email ?? '').toLowerCase()
    if (sessionEmail) {
      const me = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, sessionEmail))
        .limit(1)
      auditUserId = me[0]?.id ?? null
    }
  }
  catch {
    auditUserId = null
  }
  await recordAudit({
    userId: auditUserId,
    action: 'feedback.submit',
    entity: 'feedback',
    metadata: {
      category: parsed.data.category,
      subject: parsed.data.subject,
      attachmentCount: attachmentNames.length,
      ...(attachmentNames.length ? { attachments: attachmentNames } : {}),
    },
  })

  return { delivered: Boolean(id) || !env.RESEND_API_KEY, id }
})
