import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { publishedProjects } from '../src/content/projects.js';
import { buildTools, stackGroups } from '../src/content/stack.js';

// No email configuration and a provider that fails loudly: nothing here may send email.
const noEmail = async () => {
  throw new Error('stack tests must not call the email provider');
};

const textOf = (fragment) => fragment.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

describe('homepage technology section', () => {
  let server;
  let baseUrl;
  let html;
  let section;

  before(async () => {
    server = http.createServer(createApp({ env: {}, fetchImpl: noEmail, logger: { info() {}, warn() {}, error() {} } }));
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    html = await (await fetch(`${baseUrl}/`)).text();
    section = html.match(/<section class="section stack" id="stack"[\s\S]*?<\/aside>\s*<\/div>\s*<\/section>/)?.[0];
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  it('sits after Services and before About', () => {
    assert.ok(section, 'technology section exists');
    const order = ['id="work"', 'id="services"', 'id="stack"', 'id="about"', 'id="contact"'].map((marker) => html.indexOf(marker));
    assert.deepEqual([...order].sort((a, b) => a - b), order);
  });

  it('has the four approved groups, each a labelled panel visible without JavaScript', () => {
    assert.deepEqual(stackGroups.map((group) => group.label), ['Interfaces', 'Data', 'AI & automation', 'Development & delivery']);
    const panels = [...section.matchAll(/<section class="stack-panel" id="stack-panel-([a-z-]+)"[^>]*>([\s\S]*?)<\/section>/g)];
    assert.equal(panels.length, 4);
    for (const [, id, body] of panels) {
      assert.doesNotMatch(panels.find((p) => p[1] === id)[0], /\shidden/, `${id} panel is visible by default`);
      assert.match(body, /<h3 id="stack-panel-[a-z-]+-heading">/, `${id} panel has a visible heading`);
      assert.match(body, /<ul class="stack-tools" role="list">/);
      assert.match(body, /<p class="stack-usage">/);
    }
    // Tabs are enhancement only: hidden until site.js turns them on.
    assert.match(section, /<div class="stack-tabs" data-stack-tabs hidden>/);
    const tabs = [...section.matchAll(/<button class="stack-tab" type="button" id="stack-tab-([a-z-]+)" aria-controls="stack-panel-\1"/g)];
    assert.equal(tabs.length, 4);
  });

  it('lists only evidenced tools, mapped to the right case studies', () => {
    const tools = Object.fromEntries(stackGroups.map((group) => [group.id, group.tools]));
    assert.deepEqual(tools.interfaces, ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS']);
    assert.deepEqual(tools.data, ['PostgreSQL', 'Neon', 'Prisma']);
    assert.deepEqual(tools['ai-automation'], ['OpenAI API', 'Zapier']);
    assert.deepEqual(tools.delivery, ['GitHub', 'Node.js', 'Vite', 'Railway', 'Resend']);
    const projects = Object.fromEntries(stackGroups.map((group) => [group.id, group.projects]));
    assert.deepEqual(projects.data, ['catering-concierge', 'huntsomewhere'], 'Reentry Resource Extractor has no database');
    const published = publishedProjects.map((project) => project.slug);
    for (const group of stackGroups) {
      for (const slug of group.projects) assert.ok(published.includes(slug), `${group.id} links a published project: ${slug}`);
    }
  });

  it('links every group to case studies that exist', async () => {
    const links = [...section.matchAll(/<p class="stack-projects">[\s\S]*?<\/p>/g)].flatMap((m) => [...m[0].matchAll(/href="([^"]+)"/g)].map((l) => l[1]));
    assert.ok(links.length >= 8);
    for (const href of new Set(links)) {
      assert.match(href, /^\/projects\/[a-z-]+$/);
      assert.equal((await fetch(`${baseUrl}${href}`)).status, 200, href);
    }
  });

  it('distinguishes Zapier-based AI from direct OpenAI calls and places Resend in this site’s contact form', () => {
    const ai = textOf(section.match(/id="stack-panel-ai-automation"[\s\S]*?<\/section>/)[0]);
    assert.match(ai, /call the OpenAI API directly/);
    assert.match(ai, /AI review runs inside Zapier/);
    assert.match(ai, /makes no AI calls of its own/);
    const delivery = textOf(section.match(/id="stack-panel-delivery"[\s\S]*?<\/section>/)[0]);
    assert.match(delivery, /Resend delivers the messages sent through this portfolio’s contact form/);
  });

  it('keeps AI development assistants separate from the shipped technologies', () => {
    assert.match(section, /<aside class="build-tools" aria-labelledby="build-tools-heading"/);
    assert.deepEqual(buildTools.tools, ['Claude Code', 'Codex']);
    const aside = textOf(section.match(/<aside class="build-tools"[\s\S]*?<\/aside>/)[0]);
    assert.match(aside, /Tools I build with/);
    assert.match(aside, /they aren’t part of them/);
    for (const group of stackGroups) {
      for (const tool of buildTools.tools) assert.ok(!group.tools.includes(tool), `${tool} is not listed as a shipped technology`);
    }
  });

  it('makes no ratings, percentages, or experience claims', () => {
    const text = textOf(section);
    assert.doesNotMatch(text, /\d+\s?%|\b\d+\s?(years?|yrs)\b|expert|proficien|advanced|beginner|certified|★/i);
  });
});
