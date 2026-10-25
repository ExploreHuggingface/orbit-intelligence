import { describe, expect, it } from 'vitest';
import { signUpSchema, signInSchema } from '@/lib/validations/auth';
import { monitorSchema, contactSchema } from '@/lib/validations/entities';

describe('signUpSchema', () => {
  it('accepts a valid signup and coerces terms to literal true', () => {
    const parsed = signUpSchema.safeParse({
      full_name: 'Demo Operator',
      email: 'demo@orbit.test',
      password: 'orbit-demo-2026',
      accept_terms: true,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects short passwords and missing terms', () => {
    const parsed = signUpSchema.safeParse({
      full_name: 'Demo',
      email: 'demo@orbit.test',
      password: 'short',
      accept_terms: false,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((i) => i.path.includes('password'))).toBe(true);
      expect(parsed.error.issues.some((i) => i.path.includes('accept_terms'))).toBe(true);
    }
  });

  it('rejects invalid email', () => {
    const parsed = signUpSchema.safeParse({
      full_name: 'Demo',
      email: 'not-an-email',
      password: 'longenough',
      accept_terms: true,
    });
    expect(parsed.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('requires both fields', () => {
    expect(signInSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(signInSchema.safeParse({ email: 'a@b.co' }).success).toBe(false);
  });
});

describe('monitorSchema', () => {
  const valid = {
    name: 'Berlin apartments',
    description: 'Apartments in Berlin under €350k with yield above 5.5%',
    category: 'real_estate' as const,
    sensitivity: 'balanced' as const,
    frequency_minutes: 30,
    price_min: null,
    price_max: 350000,
    keywords: ['apartment'],
    excluded_terms: [],
    domain_restriction: null,
    notify_in_app: true,
    digest_mode: false,
    price_drop_only: false,
  };

  it('accepts a valid monitor', () => {
    expect(monitorSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a too-short description', () => {
    expect(monitorSchema.safeParse({ ...valid, description: 'too short' }).success).toBe(false);
  });

  it('rejects unknown categories and sensitivities', () => {
    expect(monitorSchema.safeParse({ ...valid, category: 'boats' }).success).toBe(false);
    expect(monitorSchema.safeParse({ ...valid, sensitivity: 'loose' }).success).toBe(false);
  });

  it('rejects out-of-range frequency', () => {
    expect(monitorSchema.safeParse({ ...valid, frequency_minutes: 1 }).success).toBe(false);
    expect(monitorSchema.safeParse({ ...valid, frequency_minutes: 9999 }).success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('accepts a valid message', () => {
    expect(
      contactSchema.safeParse({
        name: 'Ada',
        email: 'ada@example.com',
        company: null,
        topic: 'support',
        message: 'A sufficiently long message body.',
      }).success
    ).toBe(true);
  });

  it('rejects unknown topics and short messages', () => {
    expect(
      contactSchema.safeParse({ name: 'Ada', email: 'ada@example.com', topic: 'other', message: 'long enough message here' }).success
    ).toBe(false);
    expect(
      contactSchema.safeParse({ name: 'Ada', email: 'ada@example.com', topic: 'sales', message: 'hi' }).success
    ).toBe(false);
  });
});
