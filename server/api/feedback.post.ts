import { z } from 'zod'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { env } from '~~/server/utils/env'
import { sendEmail, feedbackEmail } from '~~/server/utils/mailer'

const FeedbackInput = z.object({
  category: z.enum(['bug', 'idea', 'praise']),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(120, 'Subject must be 120 characters or fewer'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(4000, 'Message must be 4000 characters or fewer'),
})

export default apiHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)

  const parsed = FeedbackInput.safeParse(body)
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
  }))

  return { delivered: Boolean(id) || !env.RESEND_API_KEY, id }
})
