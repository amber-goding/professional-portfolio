import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { serviceDetails } from '../src/content/services.js';

// No email configuration and a provider that fails loudly: nothing here may send email.
const noEmail = async () => {
  throw new Error('services tests must not call the email provider');
};

describe('/services', () => {
  let server;
  let baseUrl;
  let html;

  before(async () => {
    server = http.createServer(createApp({ env: {}, fetchImpl: noEmail, logger: { info() {}, warn() {}, error() {} } }));
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    const res = await fetch(`${baseUrl}/services`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);
    html = await res.text();
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  const ids = () => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const sectionFor = (id) => html.match(new RegExp(`<section class="section service-detail" id="${id}"[\\s\\S]*?</section>`))?.[0];

  it('has page-specific metadata', () => {
    assert.match(html, /<title>Services \| Amber Goding<\/title>/);
    assert.match(html, /<meta name="description" content="Application development, AI integration, and workflow automation[^"]{20,}">/);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  });

  it('has one h1, a skip link, and marks Services as the current page', () => {
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.match(html, /<a class="skip-link" href="#main">/);
    assert.match(html, /<a class="nav-link" href="\/services" aria-current="page">Services<\/a>/);
  });

  it('covers exactly the three established services, each in its own labeled section', () => {
    assert.deepEqual(
      serviceDetails.map((s) => s.title),
      ['Application development', 'AI integration', 'Workflow automation'],
    );
    const sections = [...html.matchAll(/<section class="section service-detail" id="([^"]+)" aria-labelledby="([^"]+)"/g)];
    assert.deepEqual(sections.map((m) => m[1]), ['application-development', 'ai-integration', 'workflow-automation']);
    for (const [, id, labelledBy] of sections) {
      assert.match(sectionFor(id), new RegExp(`<h2 id="${labelledBy}">`), `${id} is labelled by its h2`);
    }
  });

  it('explains audience, problems, engagement, and an example for each service', () => {
    for (const { id } of serviceDetails) {
      const section = sectionFor(id);
      for (const heading of ['Who it could help', 'Problems it addresses', 'What an engagement could include', 'Example scenario']) {
        assert.match(section, new RegExp(`<h3>${heading}</h3>`), `${id}: ${heading}`);
      }
      assert.ok((section.match(/<li>/g) ?? []).length >= 7, `${id} has substantive lists`);
    }
  });

  it('labels every use case as an illustrative example, not client work', () => {
    const examples = [...html.matchAll(/<div class="example-card">([\s\S]*?)<\/div>/g)].map((m) => m[1]);
    assert.equal(examples.length, 3);
    for (const example of examples) {
      assert.match(example, /Illustrative example, not completed client work/);
      assert.match(example, /\scould\s/, 'examples describe what could be built, not what was built');
    }
  });

  it('describes the four-step process in order', () => {
    const process = html.match(/<section class="section section--cream process" id="process"[\s\S]*?<\/section>/)?.[0];
    assert.ok(process, 'process section exists');
    const steps = [...process.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
    assert.deepEqual(steps, ['Understand the problem', 'Define the scope', 'Build and verify', 'Hand off']);
  });

  it('uses a logical heading order with no skipped levels', () => {
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i++) {
      assert.ok(levels[i] <= levels[i - 1] + 1, `heading level jumps from h${levels[i - 1]} to h${levels[i]}`);
    }
  });

  it('sends every contact call to action to /contact', () => {
    const contactLinks = [...html.matchAll(/<a[^>]+href="([^"]*)"[^>]*>(?:Start a conversation|Talk about)[^<]*/g)].map((m) => m[1]);
    assert.ok(contactLinks.length >= 5, 'intro, each service, and the closing invitation link to contact');
    assert.ok(contactLinks.every((href) => href === '/contact'));
    assert.doesNotMatch(html, /mailto:/i);
    assert.doesNotMatch(html, /[\w.+-]+@[\w-]+\.[\w.]+/, 'no email address appears');
  });

  it('has working in-page links', () => {
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
      // "#top" is the footer's back-to-top link; browsers scroll to the top for it.
      if (target !== 'top') assert.ok(ids().has(target), `#${target} exists`);
    }
  });

  it('makes no unsupported claims about prices, timelines, guarantees, clients, or results', () => {
    const text = html.replace(/<[^>]+>/g, ' ');
    const banned = [
      /\$\s?\d/,
      /\bpric(e|es|ing)\b/i,
      /\bguarantee/i,
      /\btestimonial/i,
      /\bclients? (say|said|love)/i,
      /\byears? of experience\b/i,
      /\bcertified\b/i,
      /\b\d+\s?(days?|weeks?|months?)\b/i,
      /\b\d+\s?%/,
      /\bsecure\b|\bsecurity\b|\breliab/i,
      // Owner-status terms (an example may still mention a tutoring studio's students).
      /\bbootcamp|curriculum|\bbeginner\b|student status/i,
    ];
    for (const pattern of banned) assert.doesNotMatch(text, pattern);
  });
});

describe('shared navigation destinations', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = http.createServer(createApp({ env: {}, fetchImpl: noEmail, logger: { info() {}, warn() {}, error() {} } }));
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  for (const page of ['/', '/services', '/contact', '/does-not-exist']) {
    it(`every main-navigation link on ${page} reaches a real page and section`, async () => {
      const html = await (await fetch(`${baseUrl}${page}`)).text();
      const nav = html.match(/<nav[^>]*aria-label="Main"[^>]*>([\s\S]*?)<\/nav>/)[1];
      const links = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(links.length, 4);
      for (const link of links) {
        const [path, fragment] = link.split('#');
        const target = await fetch(`${baseUrl}${path || '/'}`);
        assert.equal(target.status, 200, `${link} responds`);
        if (fragment) assert.match(await target.text(), new RegExp(`id="${fragment}"`), `${link} section exists`);
      }
    });
  }
});
