import { z } from 'zod';
import { CATEGORIES, MONITOR_SENSITIVITIES } from '@/lib/types';

export const monitorSchema = z.object({
  name: z.string().min(3, 'Give your monitor a name (min 3 characters)').max(80),
  description: z.string().min(10, 'Describe the opportunity in plain language (min 10 characters)').max(1000),
  category: z.enum(CATEGORIES),
  sensitivity: z.enum(MONITOR_SENSITIVITIES),
  frequency_minutes: z.number().int().min(5).max(1440),
  price_min: z.number().nonnegative().nullable(),
  price_max: z.number().positive().nullable(),
  keywords: z.array(z.string().min(1)).max(20),
  excluded_terms: z.array(z.string().min(1)).max(20),
  domain_restriction: z.string().max(120).nullable(),
  notify_in_app: z.boolean(),
  digest_mode: z.boolean(),
  price_drop_only: z.boolean(),
});

export type MonitorFormInput = z.input<typeof monitorSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name').max(80),
  email: z.string().email('Enter a valid email address'),
  company: z.string().max(120).optional().nullable(),
  topic: z.enum(['sales', 'support', 'partnership', 'press']),
  message: z.string().min(10, 'Tell us a bit more (min 10 characters)').max(4000),
});

export const settingsProfileSchema = z.object({
  full_name: z.string().min(2).max(80),
  timezone: z.string().min(2).max(60),
});

export const collectionSchema = z.object({
  name: z.string().min(2, 'Collection name (min 2 characters)').max(60),
});
