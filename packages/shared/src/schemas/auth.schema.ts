import { z } from 'zod';

export const magicLinkRequestSchema = z.object({
  email: z.string().email(),
  callbackUrl: z.string().url().optional(),
});

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;
