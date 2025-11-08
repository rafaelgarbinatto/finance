import { z } from 'zod';
import { userRoleSchema } from './user.schema';

export const createInviteSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema,
});

export const inviteResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  familyId: z.string(),
  token: z.string(),
  expiresAt: z.string().datetime(),
  acceptedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateInvite = z.infer<typeof createInviteSchema>;
export type InviteResponse = z.infer<typeof inviteResponseSchema>;
