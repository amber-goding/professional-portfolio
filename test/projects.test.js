import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { projects, publishedProjects } from '../src/content/projects.js';

// No email configuration and a provider that fails loudly: nothing here may send email.
const noEmail = async () => {
  throw new Error('project tests must not call the email provider');
};

// Approved by the owner on 2026-11-12. Written out here independently of the
// content file so any drift from the approved wording or URLs fails a test.
const APPROVED = {
  slug: 'reentry-resource-extractor',
  title: 'Reentry Resource Extractor',
  contribution:
    'I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined the interface and human-verification process.',
  live: 'https://reentry-resource-extractor-production.up.railway.app/',
  repo: 'https://github.com/amber-goding/reentry-resource-extractor',
};

// Approved by the owner on 2026-11-12, written out independently of the content file.
const CATERING = {
  slug: 'catering-concierge',
  title: 'Catering Concierge',
  contribution: APPROVED.contribution,
  live: 'https://week-8-build-catering-concierge-production.up.railway.app/',
  repo: 'https://github.com/amber-goding/week-8-build-catering-concierge',
};

// Approved by the owner on 2026-11-12, written out independently of the content file.
const HUNT = {
  slug: 'huntsomewhere',
  title: 'HuntSomewhere',
  contribution:
    'I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined how users review suggested trip preferences and understand the limits of the location data.',
  live: 'https://week-7-build-huntsomewhere-production.up.railway.app/',
  repo: 'https://github.com/amber-goding/week-7-build-HuntSomewhere',
};

const textOf = (fragment) => fragment.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/** Reads pixel dimensions from a simple (VP8) WebP or a baseline/progressive JPEG. */
function imageSize(buffer) {
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 16) === 'WEBPVP8 ') {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    for (let i = 2; i < buffer.length; ) {
      const marker = buffer[i + 1];
      if (marker === 0xc0 || marker === 0xc2) return { width: buffer.readUInt16BE(i + 7), height: buffer.readUInt16BE(i + 5) };
      i += 2 + buffer.readUInt16BE(i + 2);
    }
  }
  throw new Error('unrecognized image format');
}

function startServer() {
  const server = http.createServer(createApp({ env: {}, fetchImpl: noEmail, logger: { info() {}, warn() {}, error() {} } }));
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` })));
}

describe('/projects/reentry-resource-extractor', () => {
  let server;
  let baseUrl;
  let html;
  let main;

  before(async () => {
    ({ server, baseUrl } = await startServer());
    const res = await fetch(`${baseUrl}/projects/${APPROVED.slug}`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);
    html = await res.text();
    main = html.match(/<main[\s\S]*<\/main>/)[0];
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  it('publishes only the approved projects, Reentry first', () => {
    assert.ok(publishedProjects.every((project) => project.published));
    // Update this when the owner approves another project (AGENTS.md, Decisions).
    assert.deepEqual(publishedProjects.map((project) => project.slug), [APPROVED.slug, CATERING.slug, HUNT.slug]);
    assert.ok(projects.every((project) => /^[a-z0-9-]+$/.test(project.slug)));
  });

  it('has page-specific metadata, one h1, and sections in order without skipped heading levels', () => {
    assert.match(html, /<title>Reentry Resource Extractor \| Amber Goding<\/title>/);
    assert.match(html, /<meta name="description" content="Case study: Reentry Resource Extractor[^"]{20,}">/);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(h1s.length, 1);
    assert.equal(textOf(h1s[0][1]), APPROVED.title);
    const headings = [...main.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => [Number(m[1]), textOf(m[2])]);
    for (let i = 1; i < headings.length; i++) {
      assert.ok(headings[i][0] <= headings[i - 1][0] + 1, `heading jumps from h${headings[i - 1][0]} to h${headings[i][0]}`);
    }
    const h2s = headings.filter(([level]) => level === 2).map(([, text]) => text);
    assert.deepEqual(h2s, [
      'Scattered details, real consequences.',
      'Retrieve, extract, then review.',
      'Built to check the AI, not to trust it.',
      'The person has the last word.',
      'What it does, and doesn’t.',
      'What I contributed.',
      'Let’s talk it through.',
    ]);
    assert.doesNotMatch(html, /aria-current="page"/, 'no main-navigation item matches a project page');
  });

  it('states the approved contribution wording verbatim', () => {
    assert.ok(textOf(main).includes(APPROVED.contribution));
    assert.equal(projects.find((project) => project.slug === APPROVED.slug).contribution, APPROVED.contribution);
  });

  it('links to the live application and repository with the approved URLs', () => {
    const live = main.match(new RegExp(`<a[^>]+href="${escapeRe(APPROVED.live)}"[^>]*>`, 'g')) ?? [];
    const repo = main.match(new RegExp(`<a[^>]+href="${escapeRe(APPROVED.repo)}"[^>]*>`, 'g')) ?? [];
    assert.ok(live.length >= 2, 'live link in the introduction and the closing section');
    assert.ok(repo.length >= 2, 'repository link in the introduction and the closing section');
    const external = [...main.matchAll(/<a[^>]+href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual([...new Set(external)].sort(), [APPROVED.repo, APPROVED.live].sort(), 'no other external links');
    assert.doesNotMatch(html, /target="_blank"/);
  });

  it('explains Not Found, human review, and the limits of evidence matching', () => {
    const text = textOf(main);
    assert.match(text, /Not Found/);
    assert.match(text, /a person reviews every field/i);
    assert.match(text, /every field requires human review/);
    assert.match(text, /A matching quote can still accompany an incorrect interpretation/);
    assert.match(text, /only confirms that a quote appears in the retrieved text/);
    assert.match(text, /does not crawl a whole website/i);
    assert.match(text, /Nothing is saved, exported, or published/);
    assert.match(text, /sample data rather than a real extraction/);
  });

  it('makes no unsupported claims', () => {
    const text = textOf(main);
    const banned = [
      /\d+\s?%/,
      /\baccura(cy|te|tely)\b/i,
      /\b(save|saves|saved|saving)\s+(time|hours|\d)/i,
      /\bhours (saved|per)\b/i,
      /\bclients?\b/i,
      /\bcustomers?\b/i,
      /\badopt(ed|ion)\b/i,
      /\btestimonial/i,
      /\busers? (love|report|say)/i,
      /\bbootcamp|curriculum|\bstudent\b|\bbeginner\b|\bweek \d/i,
      // Overstated guarantees about evidence matching or the model's behavior.
      /only what the page supports/i,
      /catches fabricated/i,
      /can’t quietly guess|never to guess/i,
      /evidence-backed/i,
    ];
    for (const pattern of banned) assert.doesNotMatch(text, pattern);
  });

  it('serves every screenshot at its declared size with no metadata, and captions sample data', async () => {
    const images = [...main.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    assert.equal(images.length, 3);
    for (const img of images) {
      assert.match(img, /\salt="[^"]{40,}"/, `descriptive alt: ${img}`);
      assert.match(img, /\swidth="\d+" height="\d+"/, `intrinsic size: ${img}`);
      assert.match(img, /\sloading="lazy"/);
      const [, src] = img.match(/\ssrc="([^"]+)"/);
      const [, width] = img.match(/\swidth="(\d+)"/);
      const [, height] = img.match(/\sheight="(\d+)"/);
      const res = await fetch(`${baseUrl}${src}`);
      assert.equal(res.status, 200, `${src} is served`);
      assert.match(res.headers.get('content-type'), /^image\/jpeg/);
      const buffer = Buffer.from(await res.arrayBuffer());
      assert.deepEqual(imageSize(buffer), { width: Number(width), height: Number(height) }, `${src} dimensions`);
      assert.ok(buffer.length < 250_000, `${src} is optimized (${buffer.length} bytes)`);
    }
    const sources = [...main.matchAll(/<source type="image\/webp" srcset="([^"]+)" sizes="[^"]+">/g)].map((m) => m[1]);
    assert.equal(sources.length, 3);
    for (const srcset of sources) {
      for (const entry of srcset.split(',')) {
        const [src, descriptor] = entry.trim().split(' ');
        const res = await fetch(`${baseUrl}${src}`);
        assert.equal(res.status, 200, `${src} is served`);
        assert.match(res.headers.get('content-type'), /^image\/webp/);
        const buffer = Buffer.from(await res.arrayBuffer());
        assert.equal(imageSize(buffer).width, Number(descriptor.replace('w', '')), `${src} matches its width descriptor`);
        const raw = buffer.toString('latin1');
        for (const marker of ['EXIF', 'XMP ', 'ICCP']) assert.ok(!raw.includes(marker), `${src} carries no ${marker} chunk`);
      }
    }
    const figures = [...main.matchAll(/<figure class="([^"]+)">([\s\S]*?)<\/figure>/g)].map((m) => ({ classes: m[1], body: m[2] }));
    assert.equal(figures.length, 3);
    const samples = figures.filter((f) => f.classes.includes('project-figure--sample'));
    assert.equal(samples.length, 2);
    for (const figure of samples) {
      assert.match(figure.body, /<span class="figure-flag">Sample data<\/span>/);
      assert.match(figure.body, /review-sample-/);
      assert.match(figure.body, /sample/i);
    }
    const start = figures.find((f) => !f.classes.includes('project-figure--sample'));
    assert.match(start.body, /start-screen-/);
    assert.match(start.body, /deployed application/);
    assert.doesNotMatch(start.body, /figure-flag/);
  });

  it('invites contact through /contact without exposing an email address', () => {
    const contact = main.match(/<section class="section contact"[\s\S]*?<\/section>/)?.[0];
    assert.ok(contact, 'contact invitation exists');
    assert.match(contact, /<a class="contact-cta" href="\/contact">/);
    assert.doesNotMatch(html, /mailto:/i);
    assert.doesNotMatch(html, /[\w.+-]+@[\w-]+\.[\w.]+/, 'no email address appears');
  });

  it('labels each region and resolves in-page references', () => {
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, labelledBy] of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
      assert.ok(ids.has(labelledBy), `#${labelledBy} exists`);
    }
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
      if (target !== 'top') assert.ok(ids.has(target), `#${target} exists`);
    }
  });
});

describe('project routing', () => {
  let server;
  let baseUrl;

  before(async () => ({ server, baseUrl } = await startServer()));
  after(() => new Promise((resolve) => server.close(resolve)));

  it('shows no internal verification notes on any published case study', async () => {
    for (const { slug } of publishedProjects) {
      const page = await (await fetch(`${baseUrl}/projects/${slug}`)).text();
      assert.doesNotMatch(page, /This write-up is based on|class="scope-note"|checked on 2026|captured on 2026/, slug);
    }
  });

  it('returns the standard 404 page for unknown and unpublished slugs', async () => {
    for (const path of ['/projects', '/projects/', '/projects/does-not-exist', '/projects/ever-after-planner', '/projects/HuntSomewhere', '/projects/huntsomewhere/extra', '/projects/Reentry-Resource-Extractor', '/projects/reentry-resource-extractor/extra', '/projects/Catering-Concierge', '/projects/catering-concierge/extra']) {
      const res = await fetch(`${baseUrl}${path}`);
      assert.equal(res.status, 404, path);
      assert.match(res.headers.get('content-type'), /^text\/html/);
      assert.match(await res.text(), /<h1 id="error-heading">Page not found<\/h1>/, `${path} renders the standard 404 page`);
    }
  });

  it('reaches the case study from the first homepage project card', async () => {
    const home = await (await fetch(`${baseUrl}/`)).text();
    const first = home.match(/<article class="project-card[^"]*"[\s\S]*?<\/article>/)[0];
    const [, href] = first.match(/<a class="project-link" href="([^"]+)">/);
    assert.equal(href, `/projects/${APPROVED.slug}`);
    const res = await fetch(`${baseUrl}${href}`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /<h1 class="page-title project-title" id="project-heading">Reentry Resource Extractor<\/h1>/);
    for (const [, src] of first.matchAll(/(?:src|srcset)="([^"\s,]+)/g)) {
      assert.equal((await fetch(`${baseUrl}${src}`)).status, 200, `${src} is served`);
    }
  });

  it('links the three homepage cards to their case studies, in order', async () => {
    const home = await (await fetch(`${baseUrl}/`)).text();
    const cards = [...home.matchAll(/<article class="project-card[^"]*"[\s\S]*?<\/article>/g)].map((m) => m[0]);
    const hrefs = cards.map((card) => card.match(/<a class="project-link" href="([^"]+)">/)?.[1] ?? null);
    assert.deepEqual(hrefs, [`/projects/${APPROVED.slug}`, `/projects/${CATERING.slug}`, `/projects/${HUNT.slug}`]);
    for (const [index, href] of hrefs.slice(0, 3).entries()) {
      assert.equal((await fetch(`${baseUrl}${href}`)).status, 200, href);
      for (const [, src] of cards[index].matchAll(/(?:src|srcset)="([^"\s,]+)/g)) {
        assert.equal((await fetch(`${baseUrl}${src}`)).status, 200, `${src} is served`);
      }
    }
  });
});

describe('/projects/huntsomewhere', () => {
  let server;
  let baseUrl;
  let html;
  let main;

  before(async () => {
    ({ server, baseUrl } = await startServer());
    const res = await fetch(`${baseUrl}/projects/${HUNT.slug}`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);
    html = await res.text();
    main = html.match(/<main[\s\S]*<\/main>/)[0];
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  it('has page-specific metadata, one h1, and no skipped heading levels', () => {
    assert.match(html, /<title>HuntSomewhere \| Amber Goding<\/title>/);
    assert.match(html, /<meta name="description" content="Case study: HuntSomewhere[^"]{20,}">/);
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(h1s.length, 1);
    assert.equal(textOf(h1s[0][1]), HUNT.title);
    const levels = [...main.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `heading jumps to h${levels[i]}`);
  });

  it('states the approved contribution wording verbatim', () => {
    assert.ok(textOf(main).includes(HUNT.contribution));
    assert.equal(projects.find((project) => project.slug === HUNT.slug).contribution, HUNT.contribution);
  });

  it('links only to the approved live application and repository', () => {
    const external = [...main.matchAll(/<a[^>]+href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual([...new Set(external)].sort(), [HUNT.repo, HUNT.live].sort());
    assert.doesNotMatch(html, /target="_blank"/);
  });

  it('describes link access, county-only matching, and the AI-free demonstration trip accurately', () => {
    const text = textOf(main);
    assert.match(text, /Anyone who has (that|a trip’s) link can view/);
    assert.doesNotMatch(text, /private link|private by design|secure link/i, 'saved trips are not described as private');
    assert.match(text, /database-enforced limit on AI requests/i);
    assert.doesNotMatch(text, /can’t be overspent|spending cap|budget cap/i);
    assert.match(text, /doesn’t establish hunting access, eligibility, seasons, or suitability for a species or method/);
    assert.match(text, /six curated wildlife management areas in four counties/i);
    assert.match(text, /fictional example entered through the manual form, with no AI involved/);
  });

  it('keeps planned features out of the implemented scope', () => {
    const scope = main.match(/<section class="section section--cream project-scope"[\s\S]*?<\/section>/)[0];
    const [implemented, limitations] = [...scope.matchAll(/<ul>([\s\S]*?)<\/ul>/g)].map((m) => textOf(m[1]));
    assert.doesNotMatch(implemented, /\b(accounts?|maps?|private-land|listings?|access requests?|permission|messaging|statewide)\b/i);
    assert.match(limitations, /no accounts/i);
    assert.match(limitations, /planned, not built/);
    assert.match(limitations, /not a statewide inventory/);
  });

  it('makes no unsupported claims or schedule references', () => {
    const text = textOf(main);
    const banned = [
      /\d+\s?%/,
      /\baccura(cy|te|tely)\b/i,
      /\b(saves?|saved|saving)\s+(time|hours|\d)/i,
      /\bclients?\b|\bcustomers?\b|\btestimonial/i,
      /\b\d+ (users|people|testers)\b/i,
      /\bguarantee/i,
      /\bsecure\b/i,
      /\bbootcamp|curriculum|\bstudent\b|\bbeginner\b|\bweek[ -]?\d/i,
    ];
    for (const pattern of banned) assert.doesNotMatch(text, pattern);
  });

  it('serves its screenshots at declared sizes and labels every demonstration image', async () => {
    const figures = [...main.matchAll(/<figure class="([^"]+)">([\s\S]*?)<\/figure>/g)].map((m) => ({ classes: m[1], body: m[2] }));
    assert.equal(figures.length, 3);
    for (const figure of figures) {
      assert.ok(figure.classes.includes('project-figure--sample'), 'each figure shows demonstration input');
      assert.match(figure.body, /<span class="figure-flag">Demonstration (input|trip)<\/span>/);
      assert.match(figure.body, /\/images\/projects\/huntsomewhere\/demo-/);
      const img = figure.body.match(/<img\b[^>]*>/)[0];
      assert.match(img, /\salt="[^"]{40,}"/);
      const [, src] = img.match(/\ssrc="([^"]+)"/);
      const [, width] = img.match(/\swidth="(\d+)"/);
      const [, height] = img.match(/\sheight="(\d+)"/);
      const buffer = Buffer.from(await (await fetch(`${baseUrl}${src}`)).arrayBuffer());
      assert.deepEqual(imageSize(buffer), { width: Number(width), height: Number(height) }, `${src} dimensions`);
      const [, srcset] = figure.body.match(/<source type="image\/webp" srcset="([^"]+)"/);
      for (const entry of srcset.split(',')) {
        const [webp, descriptor] = entry.trim().split(' ');
        const res = await fetch(`${baseUrl}${webp}`);
        assert.equal(res.status, 200, `${webp} is served`);
        const webpBuffer = Buffer.from(await res.arrayBuffer());
        assert.equal(imageSize(webpBuffer).width, Number(descriptor.replace('w', '')));
        for (const marker of ['EXIF', 'XMP ', 'ICCP']) assert.ok(!webpBuffer.toString('latin1').includes(marker));
      }
    }
    assert.match(main, /real public source data; the trip itself is fictional/);
    assert.doesNotMatch(main, /AI (result|suggestion) screenshot/i);
  });

  it('invites contact through /contact without exposing an email address', () => {
    assert.match(main, /<a class="contact-cta" href="\/contact">/);
    assert.doesNotMatch(html, /mailto:/i);
    assert.doesNotMatch(html, /[\w.+-]+@[\w-]+\.[\w.]+/);
  });
});

describe('/projects/catering-concierge', () => {
  let server;
  let baseUrl;
  let html;
  let main;

  before(async () => {
    ({ server, baseUrl } = await startServer());
    const res = await fetch(`${baseUrl}/projects/${CATERING.slug}`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);
    html = await res.text();
    main = html.match(/<main[\s\S]*<\/main>/)[0];
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  it('has page-specific metadata, one h1, and no skipped heading levels', () => {
    assert.match(html, /<title>Catering Concierge \| Amber Goding<\/title>/);
    assert.match(html, /<meta name="description" content="Case study: Catering Concierge[^"]{20,}">/);
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(h1s.length, 1);
    assert.equal(textOf(h1s[0][1]), CATERING.title);
    const levels = [...main.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `heading jumps to h${levels[i]}`);
    assert.ok(levels.filter((level) => level === 2).length >= 6, 'has the shared case-study sections');
  });

  it('states the approved contribution wording verbatim', () => {
    assert.ok(textOf(main).includes(CATERING.contribution));
    assert.equal(projects.find((project) => project.slug === CATERING.slug).contribution, CATERING.contribution);
  });

  it('links only to the approved live application and repository', () => {
    const external = [...main.matchAll(/<a[^>]+href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual([...new Set(external)].sort(), [CATERING.repo, CATERING.live].sort());
    assert.ok(external.filter((href) => href === CATERING.live).length >= 2);
    assert.doesNotMatch(html, /target="_blank"/);
  });

  it('places the AI review in Zapier and keeps planned or undeployed work out of the implemented scope', () => {
    const text = textOf(main);
    assert.match(text, /application itself calls no AI service/);
    assert.match(text, /AI by Zapier/);
    const scope = main.match(/<section class="section section--cream project-scope"[\s\S]*?<\/section>/)[0];
    const [implemented, limitations] = [...scope.matchAll(/<ul>([\s\S]*?)<\/ul>/g)].map((m) => textOf(m[1]));
    assert.match(implemented, /import endpoint/);
    assert.match(implemented, /read-only Inquiries screen/);
    assert.doesNotMatch(implemented, /\b(menus?|quotes?|email|bookings?|analytics|by hand|manual)\b/i, 'planned or undeployed work is not listed as implemented');
    assert.match(limitations, /planned scope only/);
    assert.match(limitations, /in development and isn’t part of the deployed version/);
    assert.match(limitations, /hasn’t been tested live/);
  });

  it('carries no internal verification notes', () => {
    assert.doesNotMatch(main, /This write-up is based on|class="scope-note"|wasn’t repeated for this case study/);
  });

  it('makes no unsupported claims or schedule references', () => {
    const text = textOf(main);
    const banned = [
      /\d+\s?%/,
      /\baccura(cy|te|tely)\b/i,
      /\b(saves?|saved|saving)\s+(time|hours|\d)/i,
      /\bclients?\b/i,
      /\bcustomers?\b/i,
      /\badopt(ed|ion)\b/i,
      /\btestimonial/i,
      /\bguarantee/i,
      /\bsecure\b|\bcomplete (tenant )?isolation\b|\bfully isolated\b/i,
      /\bbootcamp|curriculum|\bstudent\b|\bbeginner\b|\bweek[ -]?\d/i,
    ];
    for (const pattern of banned) assert.doesNotMatch(text, pattern);
  });

  it('serves its screenshots at declared sizes and flags exactly the sample-data images', async () => {
    const figures = [...main.matchAll(/<figure class="([^"]+)">([\s\S]*?)<\/figure>/g)].map((m) => ({ classes: m[1], body: m[2] }));
    assert.equal(figures.length, 3);
    for (const figure of figures) {
      const isSample = /dashboard-sample-/.test(figure.body);
      assert.equal(figure.classes.includes('project-figure--sample'), isSample, 'sample class follows the image');
      assert.equal(/<span class="figure-flag">Sample data<\/span>/.test(figure.body), isSample, 'sample flag follows the image');
      const img = figure.body.match(/<img\b[^>]*>/)[0];
      assert.match(img, /\salt="[^"]{40,}"/);
      const [, src] = img.match(/\ssrc="([^"]+)"/);
      const [, width] = img.match(/\swidth="(\d+)"/);
      const [, height] = img.match(/\sheight="(\d+)"/);
      const buffer = Buffer.from(await (await fetch(`${baseUrl}${src}`)).arrayBuffer());
      assert.deepEqual(imageSize(buffer), { width: Number(width), height: Number(height) }, `${src} dimensions`);
      const [, srcset] = figure.body.match(/<source type="image\/webp" srcset="([^"]+)"/);
      for (const entry of srcset.split(',')) {
        const [webp, descriptor] = entry.trim().split(' ');
        const res = await fetch(`${baseUrl}${webp}`);
        assert.equal(res.status, 200, `${webp} is served`);
        const webpBuffer = Buffer.from(await res.arrayBuffer());
        assert.equal(imageSize(webpBuffer).width, Number(descriptor.replace('w', '')));
        for (const marker of ['EXIF', 'XMP ', 'ICCP']) assert.ok(!webpBuffer.toString('latin1').includes(marker));
      }
    }
    assert.equal(figures.filter((figure) => figure.classes.includes('project-figure--sample')).length, 2);
    assert.match(main, /isn’t pictured here/, 'explains why the sign-in-only screen is not shown');
  });

  it('invites contact through /contact without exposing an email address', () => {
    assert.match(main, /<a class="contact-cta" href="\/contact">/);
    assert.doesNotMatch(html, /mailto:/i);
    assert.doesNotMatch(html, /[\w.+-]+@[\w-]+\.[\w.]+/);
  });
});
