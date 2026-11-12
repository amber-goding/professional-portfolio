import { randomBytes } from 'node:crypto';

// Plain address, or "Display Name <address>" for the sender.
const ADDRESS = /^[^\s@<>()",;:\\]+@[^\s@<>()",;:\\]+\.[^\s@<>()",;:\\]+$/;
const NAMED_ADDRESS = /^[^<>\r\n]{1,100}<([^<>\s]+)>$/;

function isAddress(value) {
  return ADDRESS.test(value);
}

function isSender(value) {
  const named = value.match(NAMED_ADDRESS);
  return isAddress(named ? named[1] : value);
}

/**
 * Read contact-form settings from the environment. Values are never logged.
 * Returns `configured: false` (and a list of missing variable names) when
 * email delivery cannot work, so the site can show an honest unavailable state.
 */
export function readContactConfig(env = process.env) {
  const apiKey = env.RESEND_API_KEY?.trim() ?? '';
  const to = env.CONTACT_TO_EMAIL?.trim() ?? '';
  const from = env.CONTACT_FROM_EMAIL?.trim() ?? '';

  const problems = [];
  if (!apiKey) problems.push('RESEND_API_KEY');
  if (!to || !isAddress(to)) problems.push('CONTACT_TO_EMAIL');
  if (!from || !isSender(from)) problems.push('CONTACT_FROM_EMAIL');

  // Signs form tokens. Without a configured secret a random one is generated,
  // which means forms loaded before a restart must be resubmitted.
  const configuredSecret = env.CONTACT_FORM_SECRET?.trim() ?? '';
  const secret = configuredSecret.length >= 32 ? configuredSecret : randomBytes(32).toString('hex');

  const allowedOrigins = new Set(
    (env.CONTACT_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .flatMap((origin) => {
        try {
          return [new URL(origin).origin];
        } catch {
          return [];
        }
      }),
  );

  // Which header carries the real client IP. Railway's edge sets X-Real-IP;
  // anywhere else, forwarded headers are ignored unless explicitly configured.
  const explicitHeader = env.CLIENT_IP_HEADER?.trim().toLowerCase();
  const clientIpHeader = explicitHeader || (env.RAILWAY_ENVIRONMENT_ID ? 'x-real-ip' : null);

  return {
    configured: problems.length === 0,
    missing: problems,
    apiKey,
    to,
    from,
    secret,
    secretIsEphemeral: configuredSecret.length < 32,
    allowedOrigins,
    clientIpHeader: clientIpHeader === 'none' ? null : clientIpHeader,
  };
}
