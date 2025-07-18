import { z } from 'zod';

const envSchema = z.object({
  APP_BASE_PATH: z.string(),
  MOCK_API: z.string().optional()
});

// export const env = envSchema.parse(process.env);
export const env = envSchema.parse(import.meta.env);
