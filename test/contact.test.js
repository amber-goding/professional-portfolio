import { after, afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { RESEND_ENDPOINT } from '../src/contact/resend.js';

// Obviously fake values. The tests assert none of them reach the browser.
const ENV = {
  RESEND_API_KEY: 're_test_SECRET_KEY_123',
  CONTACT_TO_EMAIL: 'owner-inbox@example.test',
  CONTACT_FROM_EMAIL: 'Portfolio Contact <sender@mail.example.test>',
  CONTACT_FORM_SECRET: 'test-form-secret-that-is-at-least-32-characters-long',
};
const SECRETS = [ENV.RESEND_API_KEY, ENV.CONTACT_TO_EMAIL, 'sender@mail.example.test'];
// The only email-like text allowed in browser-delivered content is the
// example in the email validation message. Any other address is a leak.
const ALLOWED_ADDRESS = /^name@example\.com$/;

const VALID = { name: 'Test Visitor', email: 'visitor@example.com', message: 'Hello Amber, I would like to talk about a project.' };

/** A controllable clock so tests can satisfy the minimum completion time instantly. */
function createClock(start = Date.UTC(2026, 10, 12, 12, 0, 0)) {
  let time = start;
  return { now: () => time, advance: (ms) => (time += ms) };
}

/** Mock of the Resend API that records calls. `respond` decides each reply. */
function createProvider(respond = () => jsonResponse(200, { id: `email_${Math.random().toString(36).slice(2)}` })) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, payload: JSON.parse(init.body) });
    return respond(init, calls.length);
  };
  return { calls, fetchImpl };
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function start(options = {}) {
  const clock = options.clock ?? createClock();
  const provider = options.provider ?? createProvider();
  const logs = [];
  const logger = { info: (m) => logs.push(m), warn: (m) => logs.push(m), error: (m) => logs.push(String(m)) };
  const app = createApp({
    env: options.env ?? ENV,
    fetchImpl: provider.fetchImpl,
    now: clock.now,
    logger,
    contactOptions: options.contactOptions,
  });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return { server, baseUrl, clock, provider, logs, close: () => new Promise((r) => server.close(r)) };
}

/** Load the form and return its token, then advance the clock past the minimum time. */
async function getToken(ctx, { advance = 5_000 } = {}) {
  const html = await (await fetch(`${ctx.baseUrl}/contact`)).text();
  const token = html.match(/name="form_token" value="([^"]+)"/)?.[1];
  assert.ok(token, 'form token is rendered');
  ctx.clock.advance(advance);
  return token;
}

function post(ctx, fields, { json = true, headers = {}, rawBody } = {}) {
  return fetch(`${ctx.baseUrl}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: ctx.baseUrl,
      ...(json ? { Accept: 'application/json' } : {}),
      ...headers,
    },
    body: rawBody ?? new URLSearchParams(fields),
  });
}

function assertNoSecrets(text, where) {
  for (const secret of SECRETS) {
    assert.ok(!text.includes(secret), `${where} must not contain ${secret}`);
  }
}

function assertNoRealAddresses(text, where) {
  for (const [address] of text.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) {
    assert.match(address, ALLOWED_ADDRESS, `${where} exposes an email address`);
  }
}

describe('contact page', () => {
  let ctx;
  before(async () => (ctx = await start()));
  after(() => ctx.close());

  it('renders an accessible form with labeled fields', async () => {
    const res = await fetch(`${ctx.baseUrl}/contact`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const html = await res.text();
    assert.match(html, /<form class="contact-form" method="post" action="\/contact"/);
    for (const [id, name] of [['field-name', 'name'], ['field-email', 'email'], ['field-message', 'message']]) {
      assert.match(html, new RegExp(`<label for="${id}">`), `${name} has a label`);
      assert.match(html, new RegExp(`id="${id}" name="${name}"[^>]*required`), `${name} is required`);
    }
    assert.match(html, /id="field-email" name="email" type="email" autocomplete="email"/);
    assert.match(html, /<button class="button button-primary" type="submit"/);
    assert.match(html, /role="status"/);
    assert.match(html, /<title>Contact \| Amber Goding<\/title>/);
    assert.match(html, /<a class="nav-link nav-cta" href="\/contact" aria-current="page">/);
  });

  it('includes a honeypot that is hidden from people and assistive technology', async () => {
    const html = await (await fetch(`${ctx.baseUrl}/contact`)).text();
    assert.match(html, /<div class="form-trap" aria-hidden="true">[\s\S]*?name="contact_url" type="text" tabindex="-1" autocomplete="off"/);
  });

  it('collects only name, email, and message', async () => {
    const html = await (await fetch(`${ctx.baseUrl}/contact`)).text();
    const names = [...html.matchAll(/<(?:input|textarea|select)[^>]*\sname="([^"]+)"/g)].map((m) => m[1]).sort();
    assert.deepEqual(names, ['contact_url', 'email', 'form_token', 'message', 'name']);
  });
});

describe('contact privacy', () => {
  let ctx;
  before(async () => (ctx = await start()));
  after(() => ctx.close());

  it('keeps the recipient, sender, and API key out of every browser-delivered page and asset', async () => {
    const publicDir = fileURLToPath(new URL('../public', import.meta.url));
    const assetPaths = fs
      .readdirSync(publicDir, { recursive: true })
      .filter((p) => fs.statSync(path.join(publicDir, p)).isFile())
      .map((p) => `/${p.split(path.sep).join('/')}`);
    for (const url of ['/', '/services', '/about', '/projects/reentry-resource-extractor', '/projects/catering-concierge', '/contact', '/does-not-exist', ...assetPaths]) {
      const res = await fetch(`${ctx.baseUrl}${url}`);
      const body = Buffer.from(await res.arrayBuffer()).toString('latin1');
      assertNoSecrets(body, url);
      // Compressed binaries (fonts, images) contain random byte runs that can
      // look like short addresses. The exact-secret check above still covers them.
      if (!/\.(woff2|webp|jpe?g|png)$/i.test(url)) assertNoRealAddresses(body, url);
      assert.doesNotMatch(body, /mailto:/i, `${url} has no mailto link`);
    }
  });

  it('keeps them out of JSON and HTML responses for every outcome', async () => {
    const token = await getToken(ctx);
    const responses = [
      await post(ctx, { ...VALID, form_token: token }),
      await post(ctx, { ...VALID, form_token: token }, { json: false }),
      await post(ctx, { ...VALID, email: 'bad', form_token: token }),
      await post(ctx, { ...VALID, form_token: 'forged' }, { json: false }),
    ];
    for (const res of responses) assertNoSecrets(await res.text(), `POST response ${res.status}`);
  });
});

describe('successful submission', () => {
  let ctx;
  before(async () => (ctx = await start()));
  after(() => ctx.close());

  it('sends one plain-text email through Resend with safe From, To, and Reply-To', async () => {
    const token = await getToken(ctx);
    const res = await post(ctx, { ...VALID, form_token: token });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'sent');
    assert.match(body.message, /submitted/i);
    assert.doesNotMatch(body.message, /deliver|inbox|received/i, 'does not claim inbox delivery');
    assert.notEqual(body.formToken, token, 'a fresh token is issued for another message');

    assert.equal(ctx.provider.calls.length, 1);
    const [call] = ctx.provider.calls;
    assert.equal(call.url, RESEND_ENDPOINT);
    assert.equal(call.init.method, 'POST');
    assert.equal(call.init.headers.Authorization, `Bearer ${ENV.RESEND_API_KEY}`);
    assert.match(call.init.headers['User-Agent'], /\S/);
    assert.match(call.init.headers['Idempotency-Key'], /^contact-[0-9a-f]{64}$/);
    assert.ok(call.init.signal instanceof AbortSignal, 'request has a timeout signal');
    assert.equal(call.payload.from, ENV.CONTACT_FROM_EMAIL);
    assert.deepEqual(call.payload.to, [ENV.CONTACT_TO_EMAIL]);
    assert.equal(call.payload.reply_to, VALID.email);
    assert.equal(call.payload.subject, `Portfolio inquiry from ${VALID.name}`);
    assert.match(call.payload.text, new RegExp(VALID.message));
    assert.equal(call.payload.html, undefined, 'plain text only');
  });

  it('ignores visitor attempts to set From, To, or other fields', async () => {
    const token = await getToken(ctx);
    const res = await post(ctx, {
      ...VALID,
      message: 'Trying to change the recipient of this message.',
      to: 'attacker@example.com',
      from: 'spoof@example.com',
      form_token: token,
    });
    assert.equal(res.status, 200);
    const { payload } = ctx.provider.calls.at(-1);
    assert.deepEqual(payload.to, [ENV.CONTACT_TO_EMAIL]);
    assert.equal(payload.from, ENV.CONTACT_FROM_EMAIL);
  });

  it('renders a success page for ordinary (no-JavaScript) submissions', async () => {
    const token = await getToken(ctx);
    const res = await post(ctx, { ...VALID, message: 'A no-JavaScript submission to check.', form_token: token }, { json: false });
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<div class="form-success" data-contact-success>/);
    assert.match(html, /Your message was submitted/);
    assert.match(html, /<form class="contact-form"[^>]* hidden>/);
  });
});

describe('validation', () => {
  let ctx;
  before(async () => (ctx = await start()));
  after(() => ctx.close());
  afterEach(() => assert.equal(ctx.provider.calls.length, 0, 'invalid input never reaches the provider'));

  it('reports each invalid field and preserves entered values (JSON)', async () => {
    const token = await getToken(ctx);
    const res = await post(ctx, { name: '', email: 'not-an-email', message: 'short', form_token: token });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'invalid');
    assert.deepEqual(Object.keys(body.errors).sort(), ['email', 'message', 'name']);
    assert.equal(body.formToken, token, 'the same token is kept for the corrected retry');
  });

  it('re-renders the form with errors, escaped values, and an error title (no JavaScript)', async () => {
    const token = await getToken(ctx);
    const res = await post(ctx, { name: '<script>alert(1)</script>', email: 'nope', message: 'A message that is long enough.', form_token: token }, { json: false });
    assert.equal(res.status, 400);
    const html = await res.text();
    assert.match(html, /<title>Error: Contact \| Amber Goding<\/title>/);
    assert.match(html, /value="&lt;script&gt;alert\(1\)&lt;\/script&gt;"/);
    assert.doesNotMatch(html, /<script>alert/);
    assert.match(html, />A message that is long enough\.<\/textarea>/);
    assert.match(html, /id="field-email"[^>]*aria-invalid="true" aria-describedby="field-email-error"/);
    assert.match(html, /<a href="#field-email">Enter a valid email address/);
  });

  it('enforces maximum lengths', async () => {
    const token = await getToken(ctx);
    const res = await post(ctx, { name: 'n'.repeat(101), email: `${'e'.repeat(250)}@example.com`, message: 'm'.repeat(5001), form_token: token });
    const { errors } = await res.json();
    assert.match(errors.name, /100 characters or fewer/);
    assert.match(errors.email, /254 characters or fewer/);
    assert.match(errors.message, /5,000 characters or fewer/);
  });

  it('rejects line breaks in the name (header-injection guard)', async () => {
    const token = await getToken(ctx);
    const { errors } = await (await post(ctx, { ...VALID, name: 'Visitor\r\nBcc: x@example.com', form_token: token })).json();
    assert.ok(errors.name);
  });

  it('rejects repeated fields and other unexpected input types', async () => {
    const token = await getToken(ctx);
    const res = await post(ctx, null, {
      rawBody: `name=a&name=b&email=${encodeURIComponent(VALID.email)}&message=${encodeURIComponent(VALID.message)}&form_token=${token}`,
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).status, 'invalid-request');
  });

  it('rejects oversize requests with 413', async () => {
    const res = await post(ctx, { ...VALID, message: 'x'.repeat(70_000), form_token: 'x' });
    assert.equal(res.status, 413);
    assert.equal((await res.json()).status, 'too-large');
  });

  it('rejects non-form content types with 415', async () => {
    const res = await fetch(`${ctx.baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: ctx.baseUrl },
      body: JSON.stringify(VALID),
    });
    assert.equal(res.status, 415);
  });
});

describe('spam and abuse controls', () => {
  let ctx;
  before(async () => (ctx = await start()));
  after(() => ctx.close());
  afterEach(() => assert.equal(ctx.provider.calls.length, 0, 'blocked submissions never reach the provider'));

  it('rejects a filled honeypot without claiming success', async () => {
    const token = await getToken(ctx);
    const res = await post(ctx, { ...VALID, contact_url: 'http://spam.example', form_token: token });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'rejected');
    assert.doesNotMatch(body.message, /submitted/i);
  });

  it('rejects submissions faster than the minimum completion time', async () => {
    const token = await getToken(ctx, { advance: 1_000 });
    const res = await post(ctx, { ...VALID, form_token: token });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'too-fast');
    assert.equal(body.formToken, token, 'the same token works once enough time has passed');
  });

  it('rejects missing, forged, and tampered tokens and issues a fresh one', async () => {
    const token = await getToken(ctx);
    const tampered = token.replace(/^\d{13}/, String(ctx.clock.now() - 60_000));
    for (const formToken of [undefined, 'forged', tampered]) {
      const fields = { ...VALID };
      if (formToken) fields.form_token = formToken;
      const body = await (await post(ctx, fields)).json();
      assert.equal(body.status, 'expired');
      assert.match(body.formToken, /^\d{13}\.[\w-]{22}\.[\w-]+$/);
    }
  });

  it('rejects expired forms', async () => {
    const token = await getToken(ctx, { advance: 3 * 60 * 60 * 1000 });
    assert.equal((await (await post(ctx, { ...VALID, form_token: token })).json()).status, 'expired');
  });

  it('rejects cross-site and origin-less submissions (CSRF protection)', async () => {
    const token = await getToken(ctx);
    for (const headers of [{ Origin: 'https://evil.example' }, { Origin: 'null' }, { Origin: '', Referer: '' }]) {
      const res = await post(ctx, { ...VALID, form_token: token }, { headers });
      assert.equal(res.status, 403);
      assert.equal((await res.json()).status, 'forbidden');
    }
  });

  it('logs rejections without addresses or message content', async () => {
    const joined = ctx.logs.join('\n');
    assert.match(joined, /honeypot/);
    assertNoSecrets(joined, 'logs');
    assert.ok(!joined.includes(VALID.email) && !joined.includes(VALID.message));
  });
});

describe('origin handling', () => {
  it('accepts a same-site Referer, the proxy X-Forwarded-Host, and configured origins', async () => {
    const ctx = await start({ env: { ...ENV, CONTACT_ALLOWED_ORIGINS: 'https://ambergoding.com, https://www.ambergoding.com' } });
    try {
      const cases = [
        { Origin: '', Referer: `${ctx.baseUrl}/contact` },
        { Origin: 'https://portfolio.up.railway.app', 'X-Forwarded-Host': 'portfolio.up.railway.app' },
        { Origin: 'https://www.ambergoding.com' },
      ];
      for (const [i, headers] of cases.entries()) {
        const token = await getToken(ctx);
        const res = await post(ctx, { ...VALID, message: `Origin case number ${i}`, form_token: token }, { headers });
        assert.equal(res.status, 200, JSON.stringify(headers));
      }
    } finally {
      await ctx.close();
    }
  });
});

describe('rate limiting', () => {
  it('limits attempts per client and returns Retry-After', async () => {
    const ctx = await start({ contactOptions: { attempts: { windowMs: 60_000, max: 3 } } });
    try {
      const statuses = [];
      for (let i = 0; i < 4; i++) statuses.push((await post(ctx, { ...VALID, email: 'bad', form_token: 'x' })).status);
      assert.deepEqual(statuses, [400, 400, 400, 429]);
      const res = await post(ctx, { ...VALID });
      assert.equal(res.status, 429);
      assert.match(res.headers.get('retry-after'), /^\d+$/);
      ctx.clock.advance(61_000);
      assert.notEqual((await post(ctx, { ...VALID })).status, 429, 'the window resets');
    } finally {
      await ctx.close();
    }
  });

  it('limits delivered messages per client and globally', async () => {
    const ctx = await start({ contactOptions: { sendsPerClient: { windowMs: 3_600_000, max: 2 } } });
    try {
      const statuses = [];
      for (let i = 0; i < 3; i++) {
        const token = await getToken(ctx);
        statuses.push((await post(ctx, { ...VALID, message: `Distinct message number ${i}`, form_token: token })).status);
      }
      assert.deepEqual(statuses, [200, 200, 429]);
      assert.equal(ctx.provider.calls.length, 2);
    } finally {
      await ctx.close();
    }
    const global = await start({ contactOptions: { sendsGlobal: { windowMs: 3_600_000, max: 1 } } });
    try {
      const first = await getToken(global);
      assert.equal((await post(global, { ...VALID, form_token: first })).status, 200);
      const second = await getToken(global);
      const res = await post(global, { ...VALID, message: 'Another distinct message here.', form_token: second }, { headers: { 'X-Real-IP': '203.0.113.9' } });
      assert.equal(res.status, 429);
    } finally {
      await global.close();
    }
  });

  it('ignores spoofed forwarded headers unless a client-IP header is configured', async () => {
    const unconfigured = await start({ contactOptions: { attempts: { windowMs: 60_000, max: 1 } } });
    try {
      await post(unconfigured, { ...VALID }, { headers: { 'X-Forwarded-For': '198.51.100.1', 'X-Real-IP': '198.51.100.1' } });
      const res = await post(unconfigured, { ...VALID }, { headers: { 'X-Forwarded-For': '198.51.100.2', 'X-Real-IP': '198.51.100.2' } });
      assert.equal(res.status, 429, 'forged headers do not create new rate-limit buckets');
    } finally {
      await unconfigured.close();
    }

    const railway = await start({ env: { ...ENV, RAILWAY_ENVIRONMENT_ID: 'env-123' }, contactOptions: { attempts: { windowMs: 60_000, max: 1 } } });
    try {
      await post(railway, { ...VALID }, { headers: { 'X-Real-IP': '198.51.100.1' } });
      const other = await post(railway, { ...VALID }, { headers: { 'X-Real-IP': '198.51.100.2' } });
      assert.notEqual(other.status, 429, "on Railway, clients are told apart by the edge's X-Real-IP");
      const same = await post(railway, { ...VALID }, { headers: { 'X-Real-IP': '198.51.100.1' } });
      assert.equal(same.status, 429);
    } finally {
      await railway.close();
    }
  });
});

describe('duplicate prevention', () => {
  it('delivers a repeated submission of the same form and content once', async () => {
    const ctx = await start();
    try {
      const token = await getToken(ctx);
      const first = await post(ctx, { ...VALID, form_token: token });
      const second = await post(ctx, { ...VALID, form_token: token });
      assert.equal(first.status, 200);
      assert.equal(second.status, 200);
      assert.equal((await second.json()).status, 'sent');
      assert.equal(ctx.provider.calls.length, 1);
    } finally {
      await ctx.close();
    }
  });

  it('delivers concurrent identical submissions once', async () => {
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    const provider = createProvider(async () => {
      await gate;
      return jsonResponse(200, { id: 'email_concurrent' });
    });
    const ctx = await start({ provider });
    try {
      const token = await getToken(ctx);
      const requests = Array.from({ length: 3 }, () => post(ctx, { ...VALID, form_token: token }));
      setTimeout(release, 50);
      const results = await Promise.all(requests);
      assert.deepEqual(results.map((r) => r.status), [200, 200, 200]);
      assert.equal(provider.calls.length, 1);
    } finally {
      await ctx.close();
    }
  });

  it('keeps the idempotency key stable for retries and changes it when content changes', async () => {
    const provider = createProvider((init, n) => (n === 1 ? jsonResponse(500, { name: 'application_error' }) : jsonResponse(200, { id: `email_${n}` })));
    const ctx = await start({ provider });
    try {
      const token = await getToken(ctx);
      assert.equal((await post(ctx, { ...VALID, form_token: token })).status, 502);
      assert.equal((await post(ctx, { ...VALID, form_token: token })).status, 200);
      const edited = await post(ctx, { ...VALID, message: `${VALID.message} (edited)`, form_token: token });
      assert.equal(edited.status, 200);
      const keys = provider.calls.map((c) => c.init.headers['Idempotency-Key']);
      assert.equal(keys[0], keys[1], 'retry of the same submission reuses the key');
      assert.notEqual(keys[1], keys[2], 'edited content gets a new key');
      assert.equal(provider.calls[0].init.body, provider.calls[1].init.body, 'retry payload is byte-identical');
    } finally {
      await ctx.close();
    }
  });
});

describe('provider failures', () => {
  const cases = [
    ['server error', () => jsonResponse(500, { name: 'application_error', message: 'boom' }), 502, 'failed'],
    ['unverified sender', () => jsonResponse(403, { name: 'validation_error', message: 'The example.test domain is not verified' }), 502, 'failed'],
    ['quota exceeded', () => jsonResponse(429, { name: 'daily_quota_exceeded' }), 503, 'unavailable'],
    ['concurrent idempotent request', () => jsonResponse(409, { name: 'concurrent_idempotent_requests' }), 409, 'busy'],
    ['malformed success', () => new Response('not json', { status: 200 }), 502, 'failed'],
    ['network error', () => Promise.reject(new TypeError('fetch failed')), 502, 'failed'],
  ];

  for (const [label, respond, code, status] of cases) {
    it(`handles ${label} safely and keeps the visitor's values`, async () => {
      const ctx = await start({ provider: createProvider(respond) });
      try {
        const token = await getToken(ctx);
        const res = await post(ctx, { ...VALID, form_token: token });
        assert.equal(res.status, code);
        const body = await res.json();
        assert.equal(body.status, status);
        assert.doesNotMatch(body.message, /submitted\./i);
        assert.equal(body.formToken, token, 'retry keeps the same submission id');
        const html = await (await post(ctx, { ...VALID, form_token: token }, { json: false })).text();
        assert.match(html, new RegExp(`value="${VALID.name}"`));
        assert.match(html, new RegExp(`>${VALID.message}</textarea>`));
        assert.match(html, /<div class="form-alert" role="alert" data-form-alert>[^<]+<\/div>/);
        const logs = ctx.logs.join('\n');
        assertNoSecrets(logs, 'logs');
        assert.doesNotMatch(logs, /not verified|boom/, 'provider error messages are not logged');
      } finally {
        await ctx.close();
      }
    });
  }

  it('times out a hung provider request with a bounded timeout', async () => {
    const provider = createProvider(
      (init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason))),
    );
    const ctx = await start({ provider, contactOptions: { providerTimeoutMs: 100 } });
    try {
      const token = await getToken(ctx);
      const startedAt = Date.now();
      const res = await post(ctx, { ...VALID, form_token: token });
      assert.ok(Date.now() - startedAt < 2_000, 'returns promptly');
      assert.equal(res.status, 504);
      const body = await res.json();
      assert.equal(body.status, 'timeout');
      assert.match(body.message, /couldn’t confirm/);
      assert.equal(body.formToken, token);
    } finally {
      await ctx.close();
    }
  });
});

describe('missing configuration', () => {
  let ctx;
  before(async () => (ctx = await start({ env: {} })));
  after(() => ctx.close());

  it('shows an honest unavailable state instead of the form', async () => {
    const html = await (await fetch(`${ctx.baseUrl}/contact`)).text();
    assert.match(html, /temporarily unavailable/);
    assert.doesNotMatch(html, /<form class="contact-form"/);
  });

  it('never simulates success and never calls the provider', async () => {
    const res = await post(ctx, { ...VALID, form_token: 'anything' });
    assert.equal(res.status, 503);
    assert.equal((await res.json()).status, 'unavailable');
    assert.equal(ctx.provider.calls.length, 0);
  });

  it('keeps the rest of the site and /healthz working', async () => {
    assert.equal((await fetch(`${ctx.baseUrl}/`)).status, 200);
    const health = await fetch(`${ctx.baseUrl}/healthz`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok' });
  });

  it('treats an invalid recipient or sender as unconfigured', async () => {
    const bad = await start({ env: { ...ENV, CONTACT_TO_EMAIL: 'not-an-address' } });
    try {
      assert.match(await (await fetch(`${bad.baseUrl}/contact`)).text(), /temporarily unavailable/);
    } finally {
      await bad.close();
    }
  });
});
