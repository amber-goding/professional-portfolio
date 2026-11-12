# Prompt History — professional-portfolio

A record of how this project has been built with Claude Code: what was asked, how plans changed, what was built and why, and how it was checked. It is not a transcript. Git commits remain the source of truth for *what* changed. This file keeps the context they don't: rejected approaches, changes of direction, and the reasons behind decisions.

Maintained by the `prompt-history` skill (turned on in [CLAUDE.md](CLAUDE.md)).

---

## Session — 2026-11-12

### 1. Project setup: CLAUDE.md and prompt history

**Asked:** Start maintaining prompt history (`/prompt-history`), then generate a CLAUDE.md (`/init`).

**Redirections:**
- The first `/prompt-history` run stopped before writing anything. The repo had no CLAUDE.md, so the skill wasn't turned on, and the skill's `reference.md` (entry template and header format) was missing. The user declined the clarifying question and ran `/init` instead.
- After `/init`, the user ran `/prompt-history` again with explicit permission to proceed.

**Done:**
- `/init`: the repo was empty (only `.git`, no commits), so CLAUDE.md is a placeholder. It says the project has no stack, commands, or architecture yet and lists what to add once scaffolding exists.
- Added the `prompt-history` opt-in line to CLAUDE.md and created this file.
- Spotted a `~/.codex/config.toml` and told the user about `/import`. Its contents were not read or imported.

**Decisions:**
- No commands or architecture went into CLAUDE.md. With an empty repo there was nothing real to document, and making it up would mislead future sessions.
- This file's header and entry format were inferred from `SKILL.md` because `reference.md` is missing. Reformat it if `reference.md` is restored and says otherwise.

**Verification:** Checked by listing files that the repo held only `.git` before these changes. No build or tests exist to run. Nothing has been committed.

### 2. Planning assignment: project instructions and implementation plan

**Asked:** Set up shared project instructions, inspect the repo, and recommend an architecture, email service, Railway approach, milestones, and launch checks. No application code. Only `AGENTS.md` and `CLAUDE.md` could change.

**Done:**
- **Inspection:** branch `main`, no commits, remote `origin` set to `https://github.com/amber-goding/professional-portfolio.git`. No app code or other instruction files. The approved visual reference (`teal-cream-gold-studio.html` in `~/.codex/visualizations/...`) was read in full.
- **New [AGENTS.md](AGENTS.md):** the authoritative shared instructions, with approved direction, branding tokens, requirements, workflow rules, pending decisions, and a dated decisions log.
- **[CLAUDE.md](CLAUDE.md):** cut down to `@AGENTS.md` plus the Claude-only `prompt-history` opt-in line.
- **Plan presented** (all proposed, none approved):
  - **Architecture:** Node.js + Express, EJS server-rendered templates, plain CSS, minimal vanilla JS, no build step, `node:test`. Astro was the runner-up. It was not chosen because a build step and extra concepts add little for about eight pages.
  - **Contact form:**
    - Works without JS and is enhanced with fetch.
    - Spam: honeypot, minimum fill time, and in-memory per-IP rate limit.
    - Duplicates: a per-form submission ID sent as Resend's `Idempotency-Key`.
    - Success only after the provider returns a 2xx.
    - Inquiries are not stored.
  - **Email:** Resend, because Railway docs say outbound SMTP is Pro-only and recommend Resend. Free plan: 3,000/month, 100/day, 3 domains. Proposed sending subdomain `mail.ambergoding.com`, a DMARC record on the main domain, and the visitor address as Reply-To.
  - **Railway:**
    - Build `npm ci`, start `npm start` (`node server.js`), listening on `process.env.PORT` and bound to `0.0.0.0`, with a `/healthz` route.
    - Env vars: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `NODE_ENV`.
    - Hobby ($5/month) allows 2 custom domains per service; Trial cannot use both apex and www.
    - The apex domain needs a DNS host with CNAME flattening or ALIAS records. If the host lacks it, move DNS to Cloudflare and use SSL mode "Full".
    - Proposed canonical host: the apex, with a 301 redirect from www.
  - **Milestones:** (1) scaffold, (2) design foundation, (3) home, (4) services/about/contact layouts, (5) contact backend, (6) case-study template, (7) content fill, (8) QA polish, (9) Railway deploy, (10) domain and launch.
  - **Recommended first task:** Milestone 1, the scaffold.
- **Contrast ratios** (calculated from the palette):
  - Gold on charcoal ≈ 9.5:1, passes.
  - Cream on deep teal ≈ 5.7:1, passes.
  - Deep teal on charcoal ≈ 2.8:1, fails for text.
  - Turquoise or gold on cream ≈ 1.6:1, fails for text. Use deep teal for accents on cream.

**Decisions:** The prompt-history opt-in stayed in CLAUDE.md rather than AGENTS.md because the skill exists only in Claude Code. This entry was not written during the assignment because of its two-file limit. It was added in entry 3 at the user's request.

**Verification:** Railway and Resend facts came from their official docs pages. Not verified: whether Resend can send before a domain is verified, the exact Resend DNS records, the DNS host for `ambergoding.com`, and whether Railway's Free plan supports custom domains. No code exists, so nothing was run.

### 3. Correction: project description and content rules

**Asked:** Remove the beginner, bootcamp, and Week 9 framing from AGENTS.md, use a supplied project description, record content rules, keep architecture and email decisions marked proposed, and log entries 2 and 3 here. Only `AGENTS.md` and `PROMPT-HISTORY.md` could change.

**Done:**
- **AGENTS.md Project section:** replaced with the user's description. It now presents the site as showcasing application development, AI integration, and workflow automation for employers, prospective clients, and collaborators.
- **New "Content and communication rules" section:**
  - Present Amber as a builder with prior development training and experience.
  - Emphasize demonstrated capability.
  - No bootcamp, curriculum, student, or beginner references in public content or metadata.
  - Never invent anything.
  - Explain technical decisions so Amber stays the informed decision-maker.
- **Merged rules:** the Portfolio section's "never invent" bullet was folded into the new no-invention rule, so metrics, testimonials, and clients are still covered. The Portfolio bullet now points to the content rules.
- **Pending decisions:** now shows the proposed architecture and the proposed Resend provider, each labeled *Proposed*.
- **Decisions log:** new dated entry for the description and content rules.

**Decisions:** Entry 2 still mentions the original bootcamp framing. This file is an internal record, not website content, so historical entries are kept as written.

**Verification:** See the final report for this task. All files are untracked, so diffs were produced with `git diff --no-index` against pre-edit copies. Nothing was committed.

### 4. Milestone 1: application foundation

**Asked:** Implement the approved foundation: Node LTS, Express + EJS, plain CSS and minimal JS, no frontend build, and `node:test`. It needed to run locally, be compatible with Railway, and keep application creation separate from server startup. It also called for:
- A minimal homepage and `/healthz`.
- A 404 page and safe error handling.
- Static files from `public/` only.
- `.gitignore`, `.env.example`, and README.
- The architecture decision recorded in AGENTS.md.

The email provider, accounts, paid plans, DNS, and deployment remain unapproved. The pasted prompt was cut off partway through its Constraints list ("Do not create the contact integration, other…"). The rest was read as the evident intent: no other pages, no contact form, no deploy, and no commit.

**Done:**
- **Versions:** checked against official sources. The nodejs.org dist index showed Node 26 "Lithium" and Node 24 "Krypton" as LTS lines; the local machine has v24.18.0. Express 5.3.0 (needs Node ≥18) and EJS 7.0.2 were the current releases on npm, so `engines.node` is `24.x`.
- **Docs consulted:** Railpack's Node docs show the version is read from `engines.node`, the `start` script is used, and a build runs only if a `build` script exists. Express 5's migration guide shows `dotfiles` defaults to `"ignore"`. EJS publishes no changelog; its README says it "complies with the Express view system", and the render tests confirm EJS 7 works.
- **Order and dependencies:** `.gitignore` was written before `npm install`. Dependencies are `express` and `ejs` only, pinned exactly; `npm audit` reported 0 vulnerabilities.
- **App and server:**
  - `src/app.js` exports `createApp({ extendRoutes })`. Static files are served from `public/` with `dotfiles: 'ignore'` and `index: false`. `x-powered-by` is disabled.
  - Routes: `/` and `/healthz` (`{"status":"ok"}`, `no-store`).
  - The 404 handler renders `views/error.ejs`. The error handler sends a generic page, logs 5xx errors server-side, and keeps 4xx status codes.
  - `src/config.js` provides `parsePort`, which uses 3000 by default, accepts whole numbers from 1 to 65535, and gives an error message that leaves out the value.
  - `server.js` uses `http.createServer` and binds to `0.0.0.0`. It reports `EADDRINUSE` clearly, closes gracefully on SIGTERM/SIGINT, and force-exits after 10s.
- **Views and styles:**
  - `views/partials/header.ejs` and `footer.ejs`.
  - `views/index.ejs`: name, role, and the approved positioning sentence only. No nav.
  - `public/css/styles.css`: brand tokens, skip link, focus outline.
  - `public/favicon.svg`: a simple "ag" monogram.
- **Tests:** `test/app.test.js`, `test/config.test.js`, `test/server.test.js` (spawns `server.js` as a real child process).
- **Docs:** README and `.env.example`. Future contact variables are commented out and marked not implemented.
- **AGENTS.md:** updated the status, added a commands line, removed architecture from Pending decisions, and added a dated approval to Decisions.

**Redirections:** A test that expected Express 5 to answer a malformed URL (`/%E0%A4%A`) with a 400 failed, because Express 5 actually returns a 404. The test now accepts 400 or 404 and still checks that no details leak. The application was not changed.

**Decisions:**
- `extendRoutes` exists so tests can mount routes that throw before the 404 and error handlers. Production code doesn't use it.
- The server is started with `http.createServer`, not `app.listen`, so listen errors are handled explicitly.
- No `dotenv` package was added, because no environment variable other than `PORT` is used yet.
- No `.gitattributes` was added; CRLF warnings may still appear on Windows.
- `README.md` is not in the private-path list in the plan, but the tests confirm it is not served.

**Verification:**
- **`npm test`:** 43 tests: 42 passed, 0 failed, 1 skipped. The skipped test is SIGTERM shutdown, which can't be run on Windows.
- **Covered by tests:**
  - Homepage rendered through EJS (title, description, viewport, skip link, footer partial, no raw `<%` tags).
  - `/healthz` JSON.
  - 404 for unknown routes, and real CSS and SVG assets served.
  - 16 private paths return 404; 6 raw traversal paths return 400, 403, or 404 and leak nothing.
  - Synchronous and async route errors produce a generic 500 with no message or stack.
  - Invalid `PORT` exits with code 1 without echoing the value.
  - `server.js` honors an explicit `PORT`.
- **Manual `npm start` runs** on the default port 3000 and on `PORT=4173`: `/` returned 200 with the correct title, `/healthz` returned 200 `{"status":"ok"}`, and `/AGENTS.md` returned 404. The log showed `Server listening on http://0.0.0.0:<port>`. Only the node PIDs listening on those ports, confirmed to be `node server.js`, were stopped, and both ports were released.
- **Not verified:** graceful shutdown on a real signal (Windows can't send one to a child process; it will be checkable on Railway/Linux), browser rendering, responsiveness, accessibility and contrast in a browser, and any Railway build or deploy.
