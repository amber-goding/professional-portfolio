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

  describe('homepage', () => {
    let html;

    before(async () => {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type'), /^text\/html/);
      html = await res.text();
    });

    const ids = () => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const hrefs = () => [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => m[1]);

    it('renders through EJS with document metadata and shared partials', () => {
      assert.match(html, /^<!doctype html>/i);
      assert.match(html, /<html lang="en">/);
      assert.match(html, /<title>[^<]*Amber Goding[^<]*<\/title>/);
      assert.match(html, /<meta name="description" content="[^"]{50,}">/);
      assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
      assert.match(html, new RegExp(`&copy; ${new Date().getFullYear()} amber goding`));
      assert.doesNotMatch(html, /<%|%>/);
    });

    it('has one h1 and a skip link that targets main', () => {
      assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
      assert.match(html, /<a class="skip-link" href="#main">/);
      assert.match(html, /<main id="main"/);
    });

    it('has main navigation to the work section and the Services, About, and Contact pages', async () => {
      const nav = html.match(/<nav[^>]*aria-label="Main"[^>]*>([\s\S]*?)<\/nav>/);
      assert.ok(nav, 'main navigation landmark is present');
      const navLinks = [...nav[1].matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      assert.deepEqual(navLinks, ['/#work', '/services', '/about', '/contact']);
      for (const link of navLinks.filter((l) => l.startsWith('/#'))) {
        assert.ok(ids().has(link.slice(2)), `section ${link} exists`);
      }
      for (const page of ['/services', '/about', '/contact']) {
        assert.equal((await fetch(`${baseUrl}${page}`)).status, 200, `${page} responds`);
      }
    });

    it('keeps the services overview section and links it to the Services page', () => {
      const overview = html.match(/<section class="section services" id="services"[\s\S]*?<\/section>/);
      assert.ok(overview, 'homepage keeps the #services overview');
      assert.match(overview[0], /href="\/services"/);
    });

    it('keeps the About teaser section and links it to the About page', () => {
      const teaser = html.match(/<section class="section about" id="about"[\s\S]*?<\/section>/);
      assert.ok(teaser, 'homepage keeps the #about teaser');
      assert.match(teaser[0], /<a class="button-text" href="\/about">More about Amber/);
    });

    it('keeps every navigation link visible in the pill, with no hidden menu', () => {
      // The Savvy design shows the full navigation pill on phones too.
      assert.doesNotMatch(html, /class="nav-toggle"/);
      const nav = html.match(/<nav class="site-nav" id="site-nav" aria-label="Main">([\s\S]*?)<\/nav>/);
      assert.ok(nav, 'navigation landmark is present');
      assert.doesNotMatch(nav[0], /\shidden/);
      assert.equal((nav[1].match(/<a class="nav-link/g) ?? []).length, 4);
      assert.match(nav[1], /<a class="nav-link nav-cta" href="\/contact">Let’s talk<\/a>/);
    });

    it('has no empty, placeholder, or broken in-page links', () => {
      const pageIds = ids();
      for (const href of hrefs()) {
        assert.ok(href !== '' && href !== '#', `link has a real destination: "${href}"`);
        const fragment = href.match(/^\/?#(.+)$/);
        if (fragment && fragment[1] !== 'top') {
          assert.ok(pageIds.has(fragment[1]), `fragment target #${fragment[1]} exists`);
        }
      }
    });

    it('links the hero to the work section and the contact page', () => {
      const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)[0];
      assert.match(hero, /href="#work"/);
      assert.match(hero, /href="\/contact"/);
    });

    it('gives the linked header logo an accessible name', () => {
      // Provisional Savvy wordmark; the final logo is pending (AGENTS.md).
      const brand = html.match(/<a class="brand" href="\/" aria-label="Amber Goding, home">([\s\S]*?)<\/a>/);
      assert.ok(brand, 'header wordmark links home with an accessible name');
      assert.match(brand[1], /<span class="brand-ag" aria-hidden="true">ag<\/span>/);
      assert.match(brand[1], /amber goding<span class="brand-dot">\.<\/span>/);
    });

    it('gives every image an alt attribute and shows the real portrait in the hero and About section', () => {
      const images = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
      assert.ok(images.length > 0);
      for (const img of images) {
        assert.match(img, /\salt="[^"]*"/, `image has alt: ${img}`);
      }
      const portraits = images.filter((img) => /amber-goding-portrait-/.test(img));
      assert.equal(portraits.length, 2);
      for (const img of portraits) assert.match(img, /\salt="Portrait of Amber Goding"/);
    });

    it('no longer renders the retired lowercase text monogram', () => {
      assert.doesNotMatch(html, /a<span>g<\/span>/);
    });

    it('keeps decorative stickers and the moving ticker text out of the accessibility tree', () => {
      assert.match(html, /<ul class="stickers" role="list" aria-hidden="true">/);
      assert.match(html, /<div class="ticker-track" aria-hidden="true">/);
      // The pause control is revealed by site.js, which also wires it up.
      assert.match(html, /<button class="ticker-toggle" type="button" aria-pressed="false" data-ticker-toggle hidden>Pause motion<\/button>/);
    });

    it('invites contact through the contact page without exposing any email address', () => {
      const contact = html.match(/<section class="section contact"[\s\S]*?<\/section>/)[0];
      assert.match(contact, /href="\/contact"/);
      assert.doesNotMatch(html, /mailto:/i);
      assert.doesNotMatch(html, /[\w.+-]+@[\w-]+\.[\w.]+/, 'no email address appears in the page');
    });

    it('shows the three published projects in order, with no development placeholder', () => {
      const projects = [...html.matchAll(/<article class="project-card[^"]*"[\s\S]*?<\/article>/g)].map((m) => m[0]);
      assert.equal(projects.length, 3);
      const [reentry, catering, hunt] = projects;
      assert.doesNotMatch(html, /Development placeholder|not an application screenshot/i);
      assert.match(catering, /Screenshot shows the app’s fictional sample data\./);
      assert.match(hunt, /<a class="project-link" href="\/projects\/huntsomewhere">HuntSomewhere/);
      assert.match(hunt, /<img[^>]+src="\/images\/projects\/huntsomewhere\/public-areas-desktop-1600\.jpg"[^>]+alt="[^"]{20,}"/);
      assert.doesNotMatch(hunt, /Development placeholder|not an application screenshot/i);
      assert.match(reentry, /<a class="project-link" href="\/projects\/reentry-resource-extractor">Reentry Resource Extractor/);
      assert.match(reentry, /<img[^>]+src="\/images\/projects\/reentry-resource-extractor\/start-screen-1600\.jpg"[^>]+alt="[^"]{20,}"/);
      assert.match(catering, /<a class="project-link" href="\/projects\/catering-concierge">Catering Concierge/);
      assert.match(catering, /<img[^>]+src="\/images\/projects\/catering-concierge\/dashboard-sample-desktop-1600\.jpg"[^>]+alt="[^"]*fictional[^"]*"/);
      for (const featured of [reentry, catering]) {
        assert.doesNotMatch(featured, /Development placeholder|not an application screenshot/i);
      }
    });

    it('does not mention a bootcamp, curriculum, or student status', () => {
      assert.doesNotMatch(html, /bootcamp|curriculum|student|beginner|week 9/i);
    });

    it('loads only local stylesheets, scripts, and fonts', () => {
      const assets = [...html.matchAll(/<(?:link|script)[^>]+(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
      for (const asset of assets) {
        assert.match(asset, /^\//, `asset is local: ${asset}`);
      }
    });
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
    // Shared navigation on other pages points back to homepage sections.
    assert.match(html, /href="\/#work"/);
  });

  const publicAssets = [
    ['/css/styles.css', /^text\/css/, /--coral: #ff5f45;/],
    ['/js/site.js', /^(text|application)\/javascript/, /aria-selected/],
    ['/favicon.svg', /^image\/svg\+xml/],
    ['/brand/ag-monogram.svg', /^image\/svg\+xml/],
    ['/brand/ag-monogram-reversed.svg', /^image\/svg\+xml/],
    ['/brand/ag-logo-horizontal.svg', /^image\/svg\+xml/],
    ['/brand/ag-logo-horizontal-reversed.svg', /^image\/svg\+xml/],
    ['/fonts/space-grotesk-latin.woff2', /^font\/woff2/],
    ['/fonts/space-grotesk-latin-ext.woff2', /^font\/woff2/],
    ['/fonts/dm-sans-latin.woff2', /^font\/woff2/],
    ['/fonts/dm-sans-latin-ext.woff2', /^font\/woff2/],
    ['/fonts/playfair-display-latin.woff2', /^font\/woff2/],
    ['/fonts/PlayfairDisplay-OFL.txt', /^text\/plain/, /SIL Open Font License/],
    ['/fonts/SpaceGrotesk-OFL.txt', /^text\/plain/, /SIL Open Font License/],
    ['/fonts/DMSans-OFL.txt', /^text\/plain/, /SIL Open Font License/],
  ];

  for (const [assetPath, type, content] of publicAssets) {
    it(`serves ${assetPath} from the public directory`, async () => {
      const res = await fetch(`${baseUrl}${assetPath}`);
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type'), type);
      const body = Buffer.from(await res.arrayBuffer());
      if (content) assert.match(body.toString('utf8'), content);
      if (assetPath.endsWith('.woff2')) assert.equal(body.subarray(0, 4).toString('latin1'), 'wOF2');
    });
  }

  for (const brandPath of [
    '/favicon.svg',
    '/brand/ag-monogram.svg',
    '/brand/ag-monogram-reversed.svg',
    '/brand/ag-logo-horizontal.svg',
    '/brand/ag-logo-horizontal-reversed.svg',
  ]) {
    it(`${brandPath} is pure vector paths with no font or external dependency`, async () => {
      const svg = await (await fetch(`${baseUrl}${brandPath}`)).text();
      assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="[-\d. ]+"/);
      assert.match(svg, /<path\b/);
      assert.doesNotMatch(svg, /<text\b|font-family|@font-face|<image\b|<script\b|\shref=|url\(/);
    });
  }

  it('references only font files that exist', async () => {
    const css = await (await fetch(`${baseUrl}/css/styles.css`)).text();
    const fontUrls = [...css.matchAll(/url\("([^"]+\.woff2)"\)/g)].map((m) => m[1]);
    assert.equal(fontUrls.length, 5);
    for (const url of fontUrls) {
      assert.equal((await fetch(`${baseUrl}${url}`)).status, 200, url);
    }
  });

  it('does not expose the X-Powered-By header', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  it('sends baseline security headers on pages, assets, and JSON', async () => {
    for (const path of ['/', '/css/styles.css', '/healthz', '/does-not-exist']) {
      const res = await fetch(`${baseUrl}${path}`);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff', path);
      assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin', path);
      assert.equal(res.headers.get('x-frame-options'), 'DENY', path);
    }
  });

  it('serves the favicon and Apple touch icon in the Savvy style', async () => {
    const html = await (await fetch(`${baseUrl}/`)).text();
    assert.match(html, /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">/);
    assert.match(html, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/);
    const svg = await (await fetch(`${baseUrl}/favicon.svg`)).text();
    assert.match(svg, /fill="#0E0E12"/, 'ink circle');
    assert.match(svg, /fill="#F2EDE4"/, 'bone letters');
    assert.match(svg, /fill="#FF5F45"/, 'coral dot');
    const png = await fetch(`${baseUrl}/apple-touch-icon.png`);
    assert.equal(png.status, 200);
    assert.match(png.headers.get('content-type'), /^image\/png/);
    const bytes = Buffer.from(await png.arrayBuffer());
    assert.equal(bytes.readUInt32BE(16), 180, 'width');
    assert.equal(bytes.readUInt32BE(20), 180, 'height');
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
