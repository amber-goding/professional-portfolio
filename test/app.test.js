import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';

// Starts the app on a temporary port and returns its base URL.
async function startServer(app) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

// Sends a raw request path without URL normalization, for traversal tests.
function rawGet(baseUrl, rawPath) {
  const { hostname, port } = new URL(baseUrl);
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname, port, path: rawPath, method: 'GET' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

describe('application routes', () => {
  let server;
  let baseUrl;

  before(async () => {
    ({ server, baseUrl } = await startServer(createApp()));
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  it('renders the homepage through EJS with metadata and shared partials', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);

    const html = await res.text();
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>Amber Goding \| Application &amp; Automation Builder<\/title>/);
    assert.match(html, /<meta name="description" content="Amber Goding builds practical applications/);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    assert.match(html, /<a class="skip-link" href="#main">/);
    assert.match(html, /<main id="main"/);
    assert.match(html, /<h1 id="intro-heading">Amber Goding<\/h1>/);
    assert.match(html, /practical application and automation builder/);
    // Footer partial rendered with server-side data
    assert.match(html, new RegExp(`&copy; ${new Date().getFullYear()} Amber Goding`));
    // No raw EJS tags leaked
    assert.doesNotMatch(html, /<%/);
    // No navigation to pages that do not exist yet
    assert.doesNotMatch(html, /<nav/);
  });

  it('returns a small JSON health response', async () => {
    const res = await fetch(`${baseUrl}/healthz`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^application\/json/);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await res.json(), { status: 'ok' });
  });

  it('returns a 404 page for unknown routes', async () => {
    const res = await fetch(`${baseUrl}/does-not-exist`);
    assert.equal(res.status, 404);
    const html = await res.text();
    assert.match(html, /Page not found/);
    assert.match(html, /<a class="skip-link" href="#main">/);
  });

  it('serves real files from the public directory', async () => {
    const css = await fetch(`${baseUrl}/css/styles.css`);
    assert.equal(css.status, 200);
    assert.match(css.headers.get('content-type'), /^text\/css/);
    assert.match(await css.text(), /--color-charcoal: #151a1c;/);

    const icon = await fetch(`${baseUrl}/favicon.svg`);
    assert.equal(icon.status, 200);
    assert.match(icon.headers.get('content-type'), /^image\/svg\+xml/);
  });

  it('does not expose the X-Powered-By header', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  const privatePaths = [
    '/AGENTS.md',
    '/CLAUDE.md',
    '/PROMPT-HISTORY.md',
    '/README.md',
    '/package.json',
    '/package-lock.json',
    '/server.js',
    '/src/app.js',
    '/src/config.js',
    '/views/index.ejs',
    '/test/app.test.js',
    '/.env',
    '/.env.example',
    '/.gitignore',
    '/node_modules/express/package.json',
    '/public/css/styles.css',
  ];

  for (const privatePath of privatePaths) {
    it(`does not serve ${privatePath}`, async () => {
      const res = await fetch(`${baseUrl}${privatePath}`);
      assert.equal(res.status, 404);
    });
  }

  const traversalPaths = [
    '/../package.json',
    '/css/../../package.json',
    '/..%2fpackage.json',
    '/css/..%2f..%2fserver.js',
    '/%2e%2e/AGENTS.md',
    '/css/%2e%2e%2f%2e%2e%2f.env.example',
  ];

  for (const rawPath of traversalPaths) {
    it(`blocks path traversal: ${rawPath}`, async () => {
      const { status, body } = await rawGet(baseUrl, rawPath);
      assert.notEqual(status, 200);
      assert.ok([400, 403, 404].includes(status), `unexpected status ${status}`);
      assert.doesNotMatch(body, /"dependencies"|import http|# AGENTS\.md|RESEND_API_KEY/);
    });
  }
});

describe('error handling', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = createApp({
      extendRoutes(app) {
        app.get('/boom', () => {
          throw new Error('secret internal detail');
        });
        app.get('/async-boom', async () => {
          throw new Error('secret async detail');
        });
      },
    });
    ({ server, baseUrl } = await startServer(app));
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  for (const route of ['/boom', '/async-boom']) {
    it(`returns a generic 500 page without stack traces for ${route}`, async (t) => {
      const logged = t.mock.method(console, 'error', () => {});
      const res = await fetch(`${baseUrl}${route}`);
      assert.equal(res.status, 500);
      const html = await res.text();
      assert.match(html, /Something went wrong/);
      assert.doesNotMatch(html, /secret|Error:|\bat .+:\d+:\d+/);
      // The full error still reaches the server log.
      assert.equal(logged.mock.callCount(), 1);
    });
  }

  it('handles a malformed URL safely without exposing details', async () => {
    const { status, body } = await rawGet(baseUrl, '/%E0%A4%A');
    // Express 5 treats an undecodable path that matches no route as not found.
    assert.ok([400, 404].includes(status), `unexpected status ${status}`);
    assert.doesNotMatch(body, /URIError|\bat .+:\d+:\d+/);
  });
});
