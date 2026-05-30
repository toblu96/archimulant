// server/domain/auth/user.ts
import { z } from 'zod'
import { AppError } from '~~/server/domain/errors'

export const UserIdSchema = z.string().min(1).brand<'UserId'>()
export type UserId = z.infer<typeof UserIdSchema>

export const UserId = (raw: string): UserId => {
  const parsed = UserIdSchema.safeParse(raw)
  if (!parsed.success) throw new AppError('urn:archimulant:invalid-input', `Invalid user id: ${raw}`)
  return parsed.data
}

export const UserSchema = z.object({
  id: UserIdSchema,
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean()
})
export type User = z.infer<typeof UserSchema>
