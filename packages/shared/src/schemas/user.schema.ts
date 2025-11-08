import { z } from 'zod';

export const userRoleSchema = z.enum(['OWNER', 'PARTNER']);

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: userRoleSchema.nullable(),
  familyId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const meResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: userRoleSchema.nullable(),
  familyId: z.string().nullable(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
