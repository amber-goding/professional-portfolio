// Minimal client for Resend's send-email HTTPS API.
// Docs: https://resend.com/docs/api-reference/emails/send-email

export const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const USER_AGENT = 'ambergoding-portfolio/1.0';

/**
 * Send one email. Never throws. Resolves to one of:
 *   { ok: true, id }
 *   { ok: false, kind: 'timeout' | 'network' }
 *   { ok: false, kind: 'provider', status, name }
 * `name` is Resend's error code (for example "validation_error"); the error
 * message is deliberately dropped because it can echo addresses.
 */
export async function sendEmail({ apiKey, payload, idempotencyKey, timeoutMs, fetchImpl = fetch }) {
  const signal = AbortSignal.timeout(timeoutMs);
  let response;
  try {
    response = await fetchImpl(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'User-Agent': USER_AGENT,
      },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    return { ok: false, kind: signal.aborted || error?.name === 'TimeoutError' ? 'timeout' : 'network' };
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    if (signal.aborted) return { ok: false, kind: 'timeout' };
  }

  if (response.ok && body && typeof body.id === 'string' && body.id) {
    return { ok: true, id: body.id };
  }
  return {
    ok: false,
    kind: 'provider',
    status: response.status,
    name: typeof body?.name === 'string' ? body.name.slice(0, 60) : undefined,
  };
}
