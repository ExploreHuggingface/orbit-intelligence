/* ============================================================================
   Stateless HMAC session cookies. Web Crypto only — safe for the edge
   middleware and Node server code alike. Password hashing lives in
   lib/auth/password.ts (Node-only).
   ========================================================================== */

export const SESSION_COOKIE = 'orbit_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  uid: string;
  exp: number; // unix seconds
}

/**
 * The dev fallback secret keeps the local demo runnable without configuration.
 * It is only used when ORBIT_SESSION_SECRET is absent; see README.
 */
const DEV_FALLBACK_SECRET = 'orbit-local-demo-secret-not-for-production';

export function getSessionSecret(): string {
  return process.env.ORBIT_SESSION_SECRET || DEV_FALLBACK_SECRET;
}

function b64url(input: string | Uint8Array): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : Buffer.from(input);
  return buf.toString('base64url');
}

function b64urlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

async function hmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return b64url(new Uint8Array(sig));
}

export async function createSessionValue(uid: string): Promise<string> {
  const payload: SessionPayload = {
    uid,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const body = `v1.${b64url(JSON.stringify(payload))}`;
  const sig = await hmac(body, getSessionSecret());
  return `${body}.${sig}`;
}

/** Verify a session cookie value. Web Crypto — safe in edge middleware. */
export async function verifySessionValue(value: string | undefined): Promise<SessionPayload | null> {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = await hmac(body, getSessionSecret());
  if (expected !== parts[2]) return null;
  try {
    const payload = JSON.parse(b64urlDecode(parts[1])) as SessionPayload;
    if (!payload.uid || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
