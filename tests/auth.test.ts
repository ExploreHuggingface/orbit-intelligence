import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSessionValue, verifySessionValue } from '@/lib/auth/session';

describe('password hashing', () => {
  it('roundtrips a password', () => {
    const stored = hashPassword('orbit-demo-2026');
    expect(stored.startsWith('scrypt:')).toBe(true);
    expect(verifyPassword('orbit-demo-2026', stored)).toBe(true);
  });

  it('rejects wrong passwords and malformed hashes', () => {
    const stored = hashPassword('correct horse');
    expect(verifyPassword('battery staple', stored)).toBe(false);
    expect(verifyPassword('x', 'not-a-hash')).toBe(false);
    expect(verifyPassword('x', '')).toBe(false);
  });

  it('salts every hash uniquely', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'));
  });
});

describe('session cookies', () => {
  it('roundtrips a uid', async () => {
    const value = await createSessionValue('usr-123');
    const payload = await verifySessionValue(value);
    expect(payload?.uid).toBe('usr-123');
    expect(payload?.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it('rejects tampered and malformed values', async () => {
    const value = await createSessionValue('usr-123');
    expect(await verifySessionValue(value + 'x')).toBeNull();
    expect(await verifySessionValue('garbage')).toBeNull();
    expect(await verifySessionValue(undefined)).toBeNull();
    expect(await verifySessionValue('v1.notbase64.abc')).toBeNull();
  });

  it('rejects expired sessions', async () => {
    // Craft an expired payload signed with the same secret logic.
    const secret = process.env.ORBIT_SESSION_SECRET || 'orbit-local-demo-secret-not-for-production';
    const b64url = (s: string | Uint8Array) =>
      (typeof s === 'string' ? Buffer.from(s, 'utf8') : Buffer.from(s)).toString('base64url');
    const body = `v1.${b64url(JSON.stringify({ uid: 'u', exp: 1 }))}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))));
    expect(await verifySessionValue(`${body}.${sig}`)).toBeNull();
  });
});
