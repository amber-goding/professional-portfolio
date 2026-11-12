import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// A signed token embedded in each rendered form. It proves when the form was
// issued (for the minimum completion time) and carries a unique submission id
// (for duplicate prevention), without any server-side session storage.

function sign(secret, payload) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createFormToken(secret, issuedAt) {
  const nonce = randomBytes(16).toString('base64url');
  const payload = `${issuedAt}.${nonce}`;
  return `${payload}.${sign(secret, payload)}`;
}

/**
 * Returns { ok: true, nonce, issuedAt } or { ok: false, reason } where reason is
 * 'invalid' (missing, malformed, or bad signature), 'expired', or 'too-fast'.
 */
export function verifyFormToken(token, secret, now, { minAgeMs, maxAgeMs }) {
  if (typeof token !== 'string' || token.length > 200) return { ok: false, reason: 'invalid' };
  const parts = token.split('.');
  if (parts.length !== 3 || !/^\d{13}$/.test(parts[0]) || !/^[\w-]{22}$/.test(parts[1])) {
    return { ok: false, reason: 'invalid' };
  }
  const expected = Buffer.from(sign(secret, `${parts[0]}.${parts[1]}`));
  const actual = Buffer.from(parts[2]);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: 'invalid' };
  }
  const issuedAt = Number(parts[0]);
  const age = now - issuedAt;
  if (age > maxAgeMs || age < -60_000) return { ok: false, reason: 'expired' };
  if (age < minAgeMs) return { ok: false, reason: 'too-fast' };
  return { ok: true, nonce: parts[1], issuedAt };
}
