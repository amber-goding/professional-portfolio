import { createHash } from 'node:crypto';
import net from 'node:net';
import express from 'express';
import { readContactConfig } from './config.js';
import { createFormToken, verifyFormToken } from './form-token.js';
import { createRateLimiter } from './rate-limit.js';
import { sendEmail } from './resend.js';
import { FIELDS, LIMITS, hasOnlyStringFields, validateSubmission } from './validation.js';

export const CONTACT_DEFAULTS = {
  minCompletionMs: 3_000, // humans need at least a few seconds to fill the form
  tokenMaxAgeMs: 2 * 60 * 60 * 1000, // a form stays valid for two hours
  providerTimeoutMs: 10_000,
  attempts: { windowMs: 10 * 60 * 1000, max: 20 }, // all POSTs per client
  sendsPerClient: { windowMs: 60 * 60 * 1000, max: 5 }, // delivered messages per client
  sendsGlobal: { windowMs: 60 * 60 * 1000, max: 30 }, // protects the provider quota
  dedupeTtlMs: 24 * 60 * 60 * 1000, // matches Resend's idempotency window
  bodyLimit: '64kb',
};

const OUTCOMES = {
  sent: [200, 'Thank you. Your message was submitted.'],
  invalid: [400, 'Please correct the highlighted fields and submit again.'],
  'invalid-request': [400, 'This submission could not be processed. Please reload the page and try again.'],
  expired: [400, 'This form expired before it was sent. Please review your message and submit again.'],
  'too-fast': [400, 'That was quick. Please wait a few seconds, then submit again.'],
  rejected: [400, 'This submission could not be accepted.'],
  forbidden: [403, 'This submission could not be verified. Please reload the page and try again.'],
  busy: [409, 'Your message is still being processed. Please wait a moment before trying again.'],
  'too-large': [413, 'This submission is too large. Please shorten your message and try again.'],
  unsupported: [415, 'This submission format is not supported. Please use the contact form.'],
  'rate-limited': [429, 'Too many attempts. Your message has not been sent. Please wait a while before trying again.'],
  failed: [502, 'Your message could not be sent right now. Please try again later.'],
  unavailable: [503, 'The contact form is temporarily unavailable. Your message has not been sent. Please try again later.'],
  timeout: [
    504,
    'We couldn’t confirm that your message was sent. Please try again. Resubmitting the same message will not send it twice.',
  ],
};

const asString = (value) => (typeof value === 'string' ? value : '');

export function createContactRouter({ env, fetchImpl, now, logger, options = {} }) {
  const config = readContactConfig(env);
  const opts = { ...CONTACT_DEFAULTS, ...options };
  const attempts = createRateLimiter(opts.attempts);
  const clientSends = createRateLimiter(opts.sendsPerClient);
  const globalSends = createRateLimiter(opts.sendsGlobal);
  // Idempotency key -> { state: 'pending', promise } | { state: 'sent', expiresAt }
  const deliveries = new Map();
  const router = express.Router();

  const newToken = () => createFormToken(config.secret, now());

  function clientIp(req) {
    if (config.clientIpHeader) {
      const first = req.get(config.clientIpHeader)?.split(',')[0]?.trim();
      if (first && net.isIP(first)) return first;
    }
    return req.socket.remoteAddress ?? 'unknown';
  }

  // CSRF protection for a session-less form: the browser-supplied Origin (or
  // Referer) must match this site. Cross-site pages cannot forge these headers.
  function originAllowed(req) {
    let source = req.get('origin');
    if (!source || source === 'null') {
      try {
        source = new URL(req.get('referer') ?? '').origin;
      } catch {
        return false;
      }
    }
    let origin;
    try {
      origin = new URL(source);
    } catch {
      return false;
    }
    if (config.allowedOrigins.has(origin.origin)) return true;
    const hosts = [req.get('host'), req.get('x-forwarded-host')].filter(Boolean).map((h) => h.toLowerCase());
    return hosts.includes(origin.host.toLowerCase());
  }

  function pageLocals({ status, message, values = {}, errors = {}, formToken }) {
    const hasErrors = Object.keys(errors).length > 0;
    const sent = status === 'sent';
    // An "Error:" title prefix is announced on page load, which helps no-JS visitors.
    const failed = Boolean(status) && !sent;
    return {
      title: sent ? 'Message submitted | Amber Goding' : `${failed ? 'Error: ' : ''}Contact | Amber Goding`,
      description: 'Contact Amber Goding about an application, AI integration, or workflow automation project.',
      configured: config.configured,
      status,
      alertMessage: status && !sent && !hasErrors ? message : '',
      values: { name: '', email: '', message: '', ...values },
      errors,
      fields: FIELDS,
      limits: LIMITS,
      formToken: formToken ?? newToken(),
    };
  }

  function respond(req, res, status, details = {}) {
    const [code, message] = OUTCOMES[status];
    res.set('Cache-Control', 'no-store');
    if (details.retryAfter) res.set('Retry-After', String(details.retryAfter));
    if (req.get('accept')?.includes('application/json')) {
      const body = { status, message, formToken: details.formToken ?? newToken() };
      if (details.errors && Object.keys(details.errors).length) body.errors = details.errors;
      return res.status(code).json(body);
    }
    return res.status(code).render('contact', pageLocals({ status, message, ...details }));
  }

  function pruneDeliveries() {
    const time = now();
    for (const [key, entry] of deliveries) {
      if (entry.state === 'sent' && entry.expiresAt <= time) deliveries.delete(key);
    }
  }

  router.get('/contact', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.render('contact', pageLocals({}));
  });

  router.post(
    '/contact',
    (req, res, next) => (req.is('application/x-www-form-urlencoded') ? next() : respond(req, res, 'unsupported')),
    express.urlencoded({ extended: false, limit: opts.bodyLimit, parameterLimit: 10 }),
    async (req, res) => {
      const body = req.body ?? {};
      const token = typeof body.form_token === 'string' ? body.form_token : undefined;
      const tokenCheck = verifyFormToken(token, config.secret, now(), {
        minAgeMs: opts.minCompletionMs,
        maxAgeMs: opts.tokenMaxAgeMs,
      });
      // Keep the same token for retries of this submission while it is still valid.
      const retryToken = tokenCheck.ok || tokenCheck.reason === 'too-fast' ? token : newToken();
      const entered = { name: asString(body.name), email: asString(body.email), message: asString(body.message) };
      const keep = { values: entered, formToken: retryToken };

      if (!originAllowed(req)) {
        logger.warn('contact: rejected (origin check failed)');
        return respond(req, res, 'forbidden', keep);
      }
      if (!config.configured) return respond(req, res, 'unavailable', keep);

      const attempt = attempts.take(clientIp(req), now());
      if (!attempt.allowed) return respond(req, res, 'rate-limited', { ...keep, retryAfter: attempt.retryAfterSeconds });

      if (!hasOnlyStringFields(body, [...FIELDS, 'form_token', 'contact_url'])) {
        return respond(req, res, 'invalid-request', { formToken: retryToken });
      }
      if (asString(body.contact_url) !== '') {
        logger.warn('contact: rejected (honeypot filled)');
        return respond(req, res, 'rejected', keep);
      }
      if (!tokenCheck.ok) {
        if (tokenCheck.reason === 'too-fast') logger.warn('contact: rejected (submitted too quickly)');
        return respond(req, res, tokenCheck.reason === 'too-fast' ? 'too-fast' : 'expired', keep);
      }

      const { values, errors } = validateSubmission(body);
      if (Object.keys(errors).length) return respond(req, res, 'invalid', { values: entered, errors, formToken: retryToken });

      // Same form + same content => same key, so retries and double-clicks are
      // delivered once. Edited content produces a new key (Resend rejects a
      // reused key with a different payload).
      const key = `contact-${createHash('sha256')
        .update([tokenCheck.nonce, values.name, values.email, values.message].join('\u0000'))
        .digest('hex')}`;

      pruneDeliveries();
      const existing = deliveries.get(key);
      let outcome;
      if (existing?.state === 'sent') {
        outcome = { ok: true, duplicate: true };
      } else if (existing?.state === 'pending') {
        outcome = await existing.promise;
      } else {
        const perClient = clientSends.take(clientIp(req), now());
        const global = perClient.allowed ? globalSends.take('all', now()) : perClient;
        if (!global.allowed) {
          logger.warn('contact: rejected (send rate limit)');
          return respond(req, res, 'rate-limited', { ...keep, retryAfter: global.retryAfterSeconds });
        }
        const promise = sendEmail({
          apiKey: config.apiKey,
          idempotencyKey: key,
          timeoutMs: opts.providerTimeoutMs,
          fetchImpl,
          payload: {
            from: config.from,
            to: [config.to],
            reply_to: values.email,
            subject: `Portfolio inquiry from ${values.name}`,
            text: [
              'New inquiry from the ambergoding.com contact form.',
              '',
              `Name: ${values.name}`,
              `Email: ${values.email}`,
              '',
              'Message:',
              values.message,
              '',
              '--',
              'Reply to this email to respond. Reply-To is set to the visitor’s address.',
            ].join('\n'),
          },
        });
        deliveries.set(key, { state: 'pending', promise });
        outcome = await promise;
        if (outcome.ok) {
          deliveries.set(key, { state: 'sent', expiresAt: now() + opts.dedupeTtlMs });
          logger.info(`contact: message accepted by Resend (id ${outcome.id})`);
        } else {
          deliveries.delete(key);
          const detail = [outcome.kind, outcome.status, outcome.name].filter(Boolean).join(' ');
          logger.warn(`contact: delivery failed (${detail})`);
        }
      }

      if (outcome.ok) return respond(req, res, 'sent', { formToken: newToken() });
      if (outcome.kind === 'timeout') return respond(req, res, 'timeout', keep);
      if (outcome.status === 409 && outcome.name === 'concurrent_idempotent_requests') return respond(req, res, 'busy', keep);
      if (outcome.status === 429) return respond(req, res, 'unavailable', keep);
      return respond(req, res, 'failed', keep);
    },
  );

  // Body-parser errors (oversize, too many fields, malformed encoding).
  router.use('/contact', (err, req, res, next) => {
    if (err.type === 'entity.too.large') return respond(req, res, 'too-large');
    if (err.status >= 400 && err.status < 500) return respond(req, res, 'invalid-request');
    return next(err);
  });

  return router;
}
