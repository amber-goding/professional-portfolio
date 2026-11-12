import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';

// No email configuration and a provider that fails loudly: nothing here may send email.
const noEmail = async () => {
  throw new Error('about tests must not call the email provider');
};

// Owner-approved wording (2026-11-12), written out here independently of
// src/content/about.js. The heading and "How I work" are locked verbatim; the
// story (reworded from the owner's bio) is checked by structure and key phrases.
const APPROVED = {
  heading: 'Thoughtful tools start with understanding people.',
  howIWork: [
    'I start by asking questions and clarifying the problem before suggesting a solution. From there, I break the work into manageable steps, communicate progress, and explain the decisions along the way.',
    'I welcome feedback because a useful application needs to make sense to the people using it. When I include AI, I consider where it can help, where its limits matter, and where a person should remain involved.',
    'I’m interested in opportunities to contribute to a development team, build practical applications, and help businesses simplify repetitive work. Whether it’s a clearer interface, easier access to information, or a better-connected workflow, I want the result to be something people can use with confidence.',
  ],
};

const textOf = (fragment) => fragment.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

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

describe('/about', () => {
  let server;
  let baseUrl;
  let html;

  before(async () => {
    server = http.createServer(createApp({ env: {}, fetchImpl: noEmail, logger: { info() {}, warn() {}, error() {} } }));
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    const res = await fetch(`${baseUrl}/about`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);
    html = await res.text();
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  const portraitTag = () => html.match(/<img[^>]+alt="Portrait of Amber Goding"[^>]*>/)?.[0];

  it('has page-specific metadata', () => {
    assert.match(html, /<title>About Amber \| Amber Goding<\/title>/);
    assert.match(html, /<meta name="description" content="Amber Goding is a full-stack developer and AI-augmented builder[^"]{20,}">/);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  });

  it('has one h1 with the approved heading, a skip link, and marks About as the current page', () => {
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(h1s.length, 1);
    assert.equal(textOf(h1s[0][1]), APPROVED.heading);
    assert.match(html, /<a class="skip-link" href="#main">/);
    assert.match(html, /<a class="nav-link" href="\/about" aria-current="page">About<\/a>/);
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  });

  it('introduces Amber with her role and tells her story in a headed, three-part section', () => {
    const main = html.match(/<main[\s\S]*<\/main>/)[0];
    assert.match(textOf(main.match(/<p class="page-lede">([\s\S]*?)<\/p>/)[1]), /^I’m Amber Goding, a full-stack developer and AI-augmented builder/);
    const story = main.match(/<section class="section about-story" aria-labelledby="story-heading">[\s\S]*?<\/section>/)?.[0];
    assert.ok(story, 'story section is labelled by its heading');
    assert.match(story, /<p class="kicker">My story<\/p>/);
    assert.match(story, /<h2 id="story-heading">[^<]+<br> <em>[^<]+<\/em><\/h2>/);
    const chapters = [...story.matchAll(/<li class="story-card"[^>]*>[\s\S]*?<h3>([^<]+)<\/h3>\s*<p>([^<]+)<\/p>/g)].map((m) => [m[1], m[2]]);
    assert.deepEqual(chapters.map(([title]) => title), ['The path', 'The mindset', 'The craft']);
    const storyText = chapters.map(([, text]) => text).join(' ');
    assert.match(storyText, /second chance/);
    assert.match(storyText, /resourceful, adaptable/);
    assert.match(storyText, /logic and creativity/);
    assert.match(storyText, /a little magic/);
  });

  it('keeps the approved "How I work" copy and a logical heading order', () => {
    const main = html.match(/<main[\s\S]*<\/main>/)[0];
    const approach = main.match(/<section class="section section--cream about-approach"[\s\S]*?<\/section>/)[0];
    const paragraphs = [...approach.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => textOf(m[1]));
    assert.deepEqual(paragraphs, APPROVED.howIWork);
    const headings = [...main.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => `h${m[1]} ${textOf(m[2])}`);
    assert.equal(headings[0], `h1 ${APPROVED.heading}`);
    assert.deepEqual(headings.slice(1).map((h) => h.slice(0, 2)), ['h2', 'h3', 'h3', 'h3', 'h2', 'h2']);
    assert.ok(headings.includes('h2 How I work'));
    assert.equal(headings.at(-1), 'h2 Let’s make it happen.');
  });

  it('shows the portrait with alt text, intrinsic dimensions, and responsive sources', () => {
    const img = portraitTag();
    assert.ok(img, 'portrait has descriptive alt text');
    assert.match(img, /\ssrc="\/images\/amber-goding-portrait-800\.jpg"/);
    assert.match(img, /\swidth="800" height="800"/);
    assert.doesNotMatch(img, /loading="lazy"/, 'the portrait is near the top of the page, so it is not lazy-loaded');
    const source = html.match(/<source type="image\/webp" srcset="([^"]+)" sizes="([^"]+)">/);
    assert.ok(source, 'WebP sources are offered');
    assert.equal(source[1], '/images/amber-goding-portrait-400.webp 400w, /images/amber-goding-portrait-800.webp 800w, /images/amber-goding-portrait-1200.webp 1200w');
    assert.equal(source[2], '(min-width: 56rem) 28rem, 90vw');
  });

  it('serves every portrait file at its declared size, square, with no embedded metadata', async () => {
    const files = { 'amber-goding-portrait-400.webp': 400, 'amber-goding-portrait-800.webp': 800, 'amber-goding-portrait-1200.webp': 1200, 'amber-goding-portrait-800.jpg': 800 };
    for (const [name, width] of Object.entries(files)) {
      const res = await fetch(`${baseUrl}/images/${name}`);
      assert.equal(res.status, 200, `${name} is served`);
      assert.match(res.headers.get('content-type'), name.endsWith('.webp') ? /^image\/webp/ : /^image\/jpeg/);
      const buffer = Buffer.from(await res.arrayBuffer());
      assert.deepEqual(imageSize(buffer), { width, height: width }, `${name} dimensions`);
      assert.ok(buffer.length < 200_000, `${name} is optimized (${buffer.length} bytes)`);
      const raw = buffer.toString('latin1');
      for (const marker of ['Exif', 'EXIF', 'XMP', 'http://ns.adobe.com', 'ICC_PROFILE', 'ICCP']) {
        assert.ok(!raw.includes(marker), `${name} carries no ${marker} metadata`);
      }
    }
    // Only the published portrait sizes are shipped at the top level. Project
    // screenshots live in subdirectories and are checked by their own tests.
    const dir = fileURLToPath(new URL('../public/images', import.meta.url));
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const portraitFiles = entries.filter((entry) => entry.isFile() && entry.name.startsWith('amber-goding-portrait-')).map((entry) => entry.name);
    assert.deepEqual(portraitFiles.sort(), Object.keys(files).sort());
    const otherFiles = entries.filter((entry) => entry.isFile() && !entry.name.startsWith('amber-goding-portrait-')).map((entry) => entry.name);
    assert.deepEqual(otherFiles, [], 'files other than the portrait belong in a subdirectory');
  });

  it('links to the supplied LinkedIn and GitHub profiles with clear labels', () => {
    const list = html.match(/<ul class="profile-links" role="list" aria-label="Professional profiles">([\s\S]*?)<\/ul>/);
    assert.ok(list, 'profile links are grouped and labelled');
    const links = [...list[1].matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [m[1], textOf(m[2].replace(/<span aria-hidden="true">[^<]*<\/span>/, ''))]);
    assert.deepEqual(links, [
      ['https://www.linkedin.com/in/amber-goding/', 'LinkedIn'],
      ['https://github.com/amber-goding', 'GitHub'],
    ]);
  });

  it('invites contact through /contact without exposing an email address', () => {
    const contact = html.match(/<section class="section contact"[\s\S]*?<\/section>/)?.[0];
    assert.ok(contact, 'contact invitation exists');
    assert.match(contact, /<a class="contact-cta" href="\/contact">/);
    assert.doesNotMatch(html, /mailto:/i);
    assert.doesNotMatch(html, /[\w.+-]+@[\w-]+\.[\w.]+/, 'no email address appears');
  });

  it('labels each region and has working in-page links', () => {
    for (const [, labelledBy] of html.matchAll(/<section[^>]+aria-labelledby="([^"]+)"/g)) {
      assert.match(html, new RegExp(`id="${labelledBy}"`), `#${labelledBy} exists`);
    }
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
      if (target !== 'top') assert.ok(ids.has(target), `#${target} exists`);
    }
  });

  it('avoids owner-status terms and unsupported claims', () => {
    const text = textOf(html);
    const banned = [
      /\bbootcamp|curriculum|\bbeginner\b|\bstudent\b/i,
      /\btestimonial/i,
      /\byears? of experience\b/i,
      /\bcertified\b/i,
      /\bguarantee/i,
      /\b\d+\s?%/,
    ];
    for (const pattern of banned) assert.doesNotMatch(text, pattern);
  });
});
