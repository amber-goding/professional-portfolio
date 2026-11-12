# Amber Goding: Professional Portfolio

The source for Amber Goding's professional portfolio and services website. It is a Node.js + Express app that renders HTML pages on the server with EJS templates, styled with plain CSS.

There is **no separate frontend build step**. The server renders templates directly, and files in `public/` are served as they are.

## Requirements

- Node.js **24.x** (an LTS release), declared in `package.json` under `engines.node`
- npm (included with Node.js)

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Installs the exact dependency versions recorded in `package-lock.json` |
| `npm start` | Starts the server (`node server.js`) |
| `npm run dev` | Starts the server, loads `.env` if it exists, and restarts on file changes (`node --watch --env-file-if-exists=.env`) |
| `npm test` | Runs the test suite with Node's built-in test runner (`node --test`) |

To run a single test file: `node --test test/app.test.js`

## Local setup and verification

1. Install dependencies: `npm ci`
2. Run the tests: `npm test`
3. Start the server: `npm start`
4. Open <http://localhost:3000>. The health check is at <http://localhost:3000/healthz> and returns `{"status":"ok"}`.

To use a different port, set the `PORT` environment variable:

```sh
# Git Bash / macOS / Linux
PORT=4000 npm start
```

```powershell
# PowerShell
$env:PORT = "4000"; npm start
```

The site runs without any other variables. Without email configuration, `/contact` shows an honest "temporarily unavailable" notice and nothing is sent.

**Local email configuration:**

1. Copy `.env.example` to `.env`, which Git ignores.
2. Fill in real values in `.env` only. Never paste them into chat, commits, or logs.
3. Start with `npm run dev`, which loads `.env` automatically.
4. Check the startup log for `Contact form: email delivery configured.` It never prints the values themselves.

`npm start` does not read `.env`. Railway supplies variables directly.

## How it works

| Path | Purpose |
| --- | --- |
| `server.js` | Production entry point. Reads `PORT`, listens on `0.0.0.0`, and shuts down cleanly on `SIGTERM`/`SIGINT` |
| `src/app.js` | Builds the Express app (routes, views, static files, 404 and error handling) without starting a listener, so tests can use it directly |
| `src/config.js` | Port parsing and validation |
| `src/content/home.js` | Homepage content: navigation, services overview, project placeholders, and principles |
| `src/content/services.js` | `/services` content: introduction, the three service areas (audience, problems, engagement, illustrative example), and the process steps |
| `views/services.ejs` | Services page |
| `src/content/about.js` | `/about` content: the owner-approved copy, portrait details (files, dimensions, `sizes`), and the LinkedIn and GitHub links |
| `views/about.ejs` | About page |
| `public/images/` | Portrait in WebP at 400, 800, and 1200px, plus an 800px JPEG fallback. Resized from the owner's photo without retouching; metadata stripped |
| `src/content/projects.js` | Case-study content. Only entries marked `published: true` are rendered. Each has the approved contribution wording, links, copy, and screenshot details |
| `views/project.ejs` | Case-study page, shared by every published project |
| `views/partials/picture.ejs` | Responsive image: WebP sources with a JPEG fallback, intrinsic size, lazy loading |
| `public/images/projects/<slug>/` | Project screenshots in WebP at two widths plus a JPEG fallback, captured from the deployed application; metadata stripped |
| `src/contact/` | Contact feature: `router.js` (GET/POST `/contact`), `config.js` (environment), `validation.js`, `form-token.js` (signed timing/submission token), `rate-limit.js`, `resend.js` (Resend HTTPS client) |
| `views/contact.ejs` | Contact page with every form state: form, field errors, alert, success, and unavailable |
| `public/js/contact.js` | Optional enhancement for inline feedback. The form works fully without it |
| `views/` | EJS templates. `partials/header.ejs` and `partials/footer.ejs` are shared by every page |
| `public/` | The **only** directory served as static files |
| `public/css/styles.css` | The whole visual system: brand tokens, typography, layout, components, and reduced-motion rules |
| `public/js/site.js` | Mobile menu enhancement. Without it, the navigation links stay visible and usable |
| `public/fonts/` | Self-hosted Space Grotesk and DM Sans (variable woff2, latin and latin-ext) with their SIL Open Font License files |
| `public/brand/` | AG brand assets as pure vector SVG paths: `ag-monogram.svg`, `ag-logo-horizontal.svg`, and `-reversed` versions for dark backgrounds |
| `public/favicon.svg` | Simplified AG favicon, legible at 16–48px |
| `test/` | Tests that make real HTTP requests to the app |

**Brand assets:** the AG monogram and name are outlined vector paths. The letterforms were converted from Playfair Display (SIL Open Font License 1.1) glyph outlines, so the logo loads no font. Use the standard files on light backgrounds and the `-reversed` files on dark ones. Colors: charcoal or cream letters, a deep teal or gold flourish, and a gold sparkle.

Fonts come from Google Fonts' official distribution, and the licenses from the [google/fonts](https://github.com/google/fonts) repository. Italic serif accents use the system Georgia font, falling back to Times New Roman and then the generic `serif`. No fonts or scripts load from third-party servers.

Routes:

- `GET /`: homepage (sections `#work`, `#services`, `#about`, `#contact`)
- `GET /services`: Services page (sections `#application-development`, `#ai-integration`, `#workflow-automation`, `#process`)
- `GET /about`: About page (introduction with portrait and professional links, background, "How I work", contact invitation)
- `GET /projects/:slug`: case study for a published project (`src/content/projects.js`). Currently `/projects/reentry-resource-extractor`. Any other slug, including unpublished candidates, returns the standard 404 page.
- `GET /contact`: contact page. `POST /contact` handles submissions and returns HTML, or JSON when the request sends `Accept: application/json`.
- `GET /healthz`: health check returning `{"status":"ok"}`
- Anything else returns an HTML 404 page. Unexpected errors return a generic 500 page. Error details are logged on the server, never shown to visitors.

## Railway deployment (not yet deployed)

Railway builds Node apps with [Railpack](https://railpack.com/languages/node):

- **Node version:** read from `engines.node` in `package.json` (`24.x`).
- **Install:** Railpack installs dependencies with npm based on `package-lock.json`.
- **Build:** there is no `build` script, so no build step runs.
- **Start:** Railpack runs the `start` script, `npm start`.
- **Port:** Railway provides `PORT`, and the server binds to `0.0.0.0` as Railway's public networking requires.
- **Health check:** `/healthz` can be set as the Railway health-check path.

Deployment, paid plans, custom domains, and DNS changes require the owner's approval and have not been done.

## Environment variables

| Name | Status | Purpose |
| --- | --- | --- |
| `PORT` | Optional locally | Port to listen on. Defaults to `3000`. Railway sets it automatically. |
| `RESEND_API_KEY` | Required for email | Resend API key with sending access |
| `CONTACT_TO_EMAIL` | Required for email | Inbox that receives inquiries. Server-side only; never shown on the site |
| `CONTACT_FROM_EMAIL` | Required for email | Sender on a domain verified in Resend, such as `Portfolio Contact <contact@mail.example.com>` |
| `CONTACT_FORM_SECRET` | Recommended | 32+ character secret that signs form tokens. Without it, a random secret is generated at startup, so forms opened before a restart must be resubmitted |
| `CONTACT_ALLOWED_ORIGINS` | Optional | Extra origins allowed to submit (comma-separated). Only needed if a proxy changes the Host header |
| `CLIENT_IP_HEADER` | Optional | Header with the real client IP for rate limiting. Defaults to `x-real-ip` on Railway and to the connection address elsewhere. `none` disables it |

Real values belong in Railway's service variables or a local `.env` file, which Git ignores. Never commit them. On Railway, set them under the service's **Variables** tab.

## Contact form

- **Delivery:** Resend's HTTPS API (Railway's Hobby plan blocks SMTP). The email is plain text, sent **from** `CONTACT_FROM_EMAIL` **to** `CONTACT_TO_EMAIL`, with the visitor's validated address as **Reply-To**. Visitors can't influence From or To.
- **Validation:** done on the server.
  - Name: 1–100 characters, no line breaks.
  - Email: valid format, up to 254 characters.
  - Message: 10–5,000 characters.
  - Only single string values are accepted; request bodies are capped at 64 KB, and only form-encoded bodies are accepted.
- **Spam and abuse controls:**
  - A hidden honeypot field, invisible to people and assistive technology.
  - A signed form token that enforces a minimum completion time of 3 seconds and a maximum form age of 2 hours.
  - Same-origin checks on `Origin`/`Referer` (CSRF protection for this session-less form).
  - Rate limits: 20 attempts per 10 minutes per client, 5 delivered messages per hour per client, and 30 per hour overall to protect the Resend quota.
- **Client IP:** on Railway it comes from the edge's `X-Real-IP`. Other forwarded headers are ignored unless configured.
- **Duplicates:** each form carries a unique submission ID. Identical retries, double-clicks, and concurrent requests share one in-flight delivery and one Resend `Idempotency-Key`, so a message is delivered once. If the visitor edits the message, it gets a new key.
- **Failures:** the provider call times out after 10 seconds. Timeouts, provider errors, and quota limits show an honest error and keep the visitor's text. Success is shown only after Resend accepts the message, and the wording says "submitted", not "delivered".
- **Single-instance limitations:** rate limits and the duplicate-delivery memory are held in process memory. They reset on restart or redeploy and aren't shared between replicas. Resend's 24-hour idempotency still blocks duplicate delivery of identical retries across restarts. Run one instance, or move this state to a shared store before scaling out.

## Project status

**Milestone 1 (application foundation):** Express server with validated `PORT`, `0.0.0.0` binding, and graceful shutdown; EJS partials; static files served only from `public/`; `/healthz`; HTML 404 page; safe error handling; tests.

**Milestone 2 (visual foundation and homepage):**

- Self-hosted fonts and a shared visual system built from the approved palette
- Header with the AG logo (uppercase serif monogram and spaced name; see "Brand assets"), in-page navigation (Work, Services, About, Contact), and a mobile menu button. The button has the correct `aria-expanded` state, closes with Escape, returns focus, and falls back to visible links without JavaScript.
- Hero with the bold headline, the CSS ribbon sculpture (decorative, hidden from assistive technology), and links to Work and Contact
- Service band, staggered selected-work layout (placeholders only), services overview, cream About teaser, contact invitation linking to `/contact`, and footer
- Hover, focus, and menu transitions, all disabled under `prefers-reduced-motion`. No continuous animation.

**Contact feature (committed in `d1582eb`):** `/contact` page with Resend delivery, validation, spam and rate limits, duplicate prevention, and every state, with or without JavaScript.
- **Verified locally, as owner-reported manual checks** (not automated):
  - A Resend account was created and the sending domain `mail.ambergoding.com` was verified through Spaceship DNS.
  - A real inquiry sent from the local site arrived in the owner's Gmail inbox, with Reply-To set to the visitor address entered in the form.
- **Not yet verified:** delivery from Railway (production variables, the deployed environment) and the deployment itself.

**Services page (committed in `7b3fbaf`):** `/services` covers the three service areas. For each: who it could help, the problems it addresses, what an engagement could include, and an illustrative example clearly marked as not client work. It also has a four-step process and links to `/contact`. The main navigation's Services link now goes to `/services`; the homepage keeps its `#services` overview, which links to the page. Services and About are approved as separate pages.

**About page (committed in `ddbba93`):** `/about` uses the owner-approved copy, portrait, and LinkedIn and GitHub links (recorded in AGENTS.md under Decisions).
- **Portrait:** responsive WebP sources with a JPEG fallback, intrinsic dimensions, and alt text "Portrait of Amber Goding". It is not lazy-loaded because it sits near the top of the page.
- **Navigation:** the main navigation's About link now goes to `/about` and is marked as the current page there.
- **Homepage:** the `#about` teaser stays and links to the page ("More about Amber").

**First case study (implemented, not committed):** `/projects/reentry-resource-extractor`, the owner-approved Reentry Resource Extractor (AGENTS.md, Decisions, 2026-11-12).
- **Structure:** a reusable content file (`src/content/projects.js`) and template (`views/project.ejs`): problem and audience, the retrieve → extract → review workflow, implementation decisions, the review interface, scope and limitations, the approved contribution wording, technologies, links to the live application and repository, and a contact invitation.
- **Honesty rules in the copy:** missing details stay "Not Found"; extracted information needs human review; matching quoted evidence is not proof an interpretation is correct; no measured results, accuracy, adoption, or client outcomes; saving, exporting, publishing, and site crawling are listed as not implemented.
- **Screenshots:** captured from the deployed application on 2026-11-12 without changing it. The start screen is a plain capture. The two review-interface captures use the app's own "Show development sample results" button, which renders test data in the browser without any server or AI call, and are captioned as sample data. "Analyze Program" was not submitted.
- **Homepage:** the first selected-work slot is now this project (real title, summary, screenshot, and link). The other three slots remain development placeholders.

**Visual presentation is provisional.** The palette and AG branding are approved; the overall styling still needs the owner's final approval in a dedicated design review before launch.

### Temporary content (must be replaced or confirmed before launch)

- **Hero wording** (provisional, from the visual reference): "Human insight. Technical possibility.", "Make complex feel simple.", "Useful applications. Thoughtful AI. Connected workflows. Built around people.", "Designed with intention. Built to be used."
- **Hero artwork labels:** "Idea", "Reality", "The space between idea & execution"
- **Selected work:** the first slot is the approved Reentry Resource Extractor. The other three slots are development placeholders, labeled on the page, with concept art rather than screenshots, no links, and invented headings ("Connect the moving parts." and the others). They are defined in `src/content/home.js`.
- **Work introduction:** "Less friction. More possibility.", the paragraph below it (reworded when the first real project arrived), and the "More projects in development" note
- **Services:** the heading "Practical tools for real work." and the three capability descriptions
- **Homepage About teaser:** the heading "Curiosity meets follow-through.", the two introductory sentences, and the three principles. These are drawn from the approved positioning. The `/about` page copy itself is approved and not temporary.
- **Contact:** the heading "Let's make it happen." and its supporting sentence, on the homepage, `/contact`, and the closing invitation on `/about`
- **Services page:** all wording in `src/content/services.js` is provisional, including the three illustrative example scenarios (home cleaning, tutoring, and property maintenance), which are hypothetical by design

### Remaining before launch

- Owner review of the Reentry Resource Extractor case-study copy, and an end-to-end extraction check of the live app by the owner (the write-up is based on source inspection and the deployed interface, not a live AI run)
- Further projects (2–3 more, each owner-approved) with verified descriptions, screenshots, links, and case-study pages, replacing the remaining placeholders
- Owner review of the Services page wording and the homepage About teaser
- Decide whether to include a résumé
- Contact in production: set the Railway variables and confirm a real inquiry sent from the deployed site arrives with the correct Reply-To. The local check is already done (owner-reported).
- Dedicated design review of the overall visual presentation
- Social/Open Graph metadata, `robots.txt`, and a sitemap
- Manual checks on real phones and with a screen reader
- Railway deployment, the `ambergoding.com` and `www` domains, and HTTPS. DNS is at Spaceship; check that it supports the apex record Railway needs.

## Portfolio project planning (internal)

An internal inventory, prepared before any case-study page is built. **None of it is public content, and no project is approved for the site yet** (AGENTS.md lists the project choice as a pending decision). It is based on a read-only inspection of each repository's docs, source, and Git history on 2026-11-12. No dependencies were installed, no apps were run, and no environment files were opened.

**Evidence labels:**
- **Source:** the code exists in the repository.
- **Repo-recorded:** stated in the project's own README, plan, or history. This includes owner-reported checks and checks observed by an agent in that project.
- **Unverified:** not checked by running anything.

**Applies to every project:**
- **Contribution:** all commits are authored "Amber Goding", and the histories show work done with AI coding agents (Claude Code, Codex). Amber's exact contribution and how to describe that collaboration publicly **need owner confirmation**. Don't infer either from the commit author.
- **Links:** the GitHub URLs below are the recorded `origin` remotes, and each returned HTTP 200 without signing in on 2026-11-12. Their pages weren't reviewed. **No repository records a deployed URL.** The owner later supplied Reentry Resource Extractor's URL (see its section).
- **Repository names and contents:** names like `week-5-build`, and in-repo docs, refer to the original build schedule. Decide whether to rename the repositories or review their public docs before linking them from the site.
- **Visual assets:** no project has app screenshots or recordings. `Projects/Ever After Ornamental Wedding Planner.png` is a design concept board (palette and "detail view" callouts), not a screenshot.

### Folder mapping (confirmed from files)

| Project | Folder in `C:\Users\amber\Desktop\Projects` | Evidence | Branch and state at inspection |
| --- | --- | --- | --- |
| Reentry Resource Extractor | `reentry-resource-extractor` | `README.md`, `project-plan.md` | `main` at `60f5d35`, clean |
| Ever After Planner | `week-5-build` | `app/layout.tsx` (title "Ever After Planner") | `feature/user-authentication` at `cbe0699`. Uncommitted: `ownerId` schema change and a migration draft |
| HuntSomewhere | `week-7-build-HuntSomewhere` | `README.md`, `package.json` (`huntsomewhere`) | `main` at `5d4c484`, clean |
| Catering Concierge | `week-8-build-catering-concierge` | `README.md`, `AGENTS.md` | `codex/manual-inquiry-entry` at `67f03bc`. Uncommitted: manual inquiry entry (19 paths) |

### Reentry Resource Extractor

**Status (2026-11-12): approved as the first portfolio entry, and its case study is implemented** at `/projects/reentry-resource-extractor` (not yet committed).
- **Owner-supplied:** live application `https://reentry-resource-extractor-production.up.railway.app/`, and the contribution wording recorded in AGENTS.md (Decisions). Codex confirmed the interface loads; no AI extraction was run.
- **Screenshots:** the deployed start screen, and the review interface with the app's development sample results (captioned as sample data).
- **Remaining:** owner review of the case-study copy; an end-to-end extraction check by the owner; confirmation that the repository's public name and README are what the owner wants linked.

- **Problem and audience:** reentry program listings are hard to create when the details are scattered across public websites. The audience is managers of transitional housing and reentry programs (`project-plan.md`).
- **Launch scope (plan):** enter a public URL → retrieve the page → AI extracts set fields → missing fields shown as "Not Found" → the manager reviews and edits. A listing is complete only after review.
- **Source:**
  - `server.js`:
    - fetches one public HTML page (links are kept as text, not followed), blocking private and local addresses (DNS resolution check), with an 8 s timeout, 3 redirects, and a 5 MB page cap;
    - extracts text with cheerio;
    - calls the OpenAI Responses API with a strict JSON schema of 21 fields;
    - instructs the model to treat page text as untrusted;
    - keeps a value only if its quoted evidence appears in the retrieved text.
  - `src/main.js`: per-field review controls (Unreviewed / Confirmed / Edited) with source evidence shown.
  - Railway start configuration (`60f5d35`).
- **Planned or unfinished:** no saving, export, or publishing of reviewed listings. No database and no automated tests. Only one page per analysis.
- **Technologies:** vanilla JavaScript, Vite, Node `http`, cheerio, `openai` SDK; Railway-ready.
- **Links:** repository `https://github.com/amber-goding/reentry-resource-extractor` (recorded and reachable). Deployment: not recorded in the repository; the owner supplied `https://reentry-resource-extractor-production.up.railway.app/` (loads; interface confirmed by Codex).
- **Needs checking:**
  - A runtime walk-through with a real program site (by the owner; not run for the case study).
  - Which model is used in production (the code defaults to `gpt-5` unless `OPENAI_EXTRACTION_MODEL` is set). The case study doesn't name a model.
  - Contribution: approved wording recorded in AGENTS.md.
- **Case-study outline:**
  - **Problem:** scattered program details.
  - **Approach:** AI limited to extraction from retrieved text, with a person confirming every field.
  - **Solution:** URL → fields whose evidence quotes are matched in the page text → human review.
  - **Decisions:** strict schema, evidence must match the source, the private-address block, prompt-injection instructions.
  - **Verifiable result:** pending a runtime check and screenshots.

### Ever After Planner

- **Problem and audience:** couples planning a wedding, keeping tasks and details in one place (`app/layout.tsx` description). The project's intended audience and launch scope are not written down; **owner confirmation needed**.
- **Source:**
  - Wedding task create, edit, and delete (title, 15 alphabetical categories, status, due date, notes) through server actions and Prisma on PostgreSQL (Neon).
  - "BrideZilla", an AI planning chat (`app/api/bridezilla/route.ts`):
    - calls the OpenAI Responses API;
    - input and output limits, a 30 s timeout, and safe error mapping;
    - requires Clerk sign-in (`cbe0699`).
  - Clerk email and Google sign-in.
  - `tests/bridezilla-auth.test.mjs`: 8 tests with a mocked provider.
- **Planned or unfinished:**
  - **Tasks aren't scoped to a user.** The committed schema has no owner, and page and actions don't check sign-in, so every visitor shares the same tasks. The ownership migration exists only as an uncommitted draft, with backup preparation recorded in `prompt-history.md` (entries 49–56).
  - No deployment recorded.
- **Technologies:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7 (`adapter-pg`), Neon PostgreSQL, Clerk, OpenAI Responses API.
- **Links:** repository `https://github.com/amber-goding/week-5-build` (recorded and reachable). Deployment: none recorded.
- **Needs checking:**
  - The intended launch version.
  - Per-user tasks completed and verified.
  - Deployment.
  - Screenshots of the real app.
  - Contribution.
- **Case-study outline:**
  - **Problem:** scattered wedding tasks.
  - **Approach:** a focused task planner plus an AI assistant that doesn't claim bookings or availability.
  - **Solution:** CRUD planner, AI chat, sign-in.
  - **Decisions:** server-only AI, input and output guardrails, sign-in required for AI.
  - **Verifiable result:** blocked until tasks are per-user.

### HuntSomewhere

- **Problem and audience:** Maryland hunters looking for public and private land and access; landowners managing listings and requests (`README.md`, `project-plan.md`).
- **Launch scope (plan):** a large marketplace with milestones M1–M14 covering listings, access requests, permission documents, email, and further AI features. **Almost all of it is planned, not built.**
- **Source:**
  - `/plan`: describe a trip → AI-suggested preferences you can edit (strict JSON schema, validated with zod) → manual editing. A shared 10-call AI allowance is reserved atomically, with an off switch.
  - `/trips/[id]`: the trip saved to Neon and reopened by an unguessable link.
  - `/areas`: 6 curated wildlife management areas from Maryland iMAP/DNR, with byte-for-byte source copies and `PROVENANCE.md`.
  - `/trips/[id]/areas`: matching by county only, labelled as not confirmed.
  - `/sources`: source attribution.
  - Check scripts: `scripts/check-gate.ts` and `scripts/check-areas.ts`. The repo records 35/35 and 22/22 passing; they weren't run here.
- **Repo-recorded (owner-reported, not verified here):** `main` deployed on Railway, and three people tried the deployed app (no tester details recorded). Whether the area-discovery deploy succeeded is not verified (`PROMPT-HISTORY.md` entries 28 and 30).
- **Planned or unfinished:** accounts (Clerk work is on unmerged branches), private listings, access requests, maps, and the other milestones.
- **Technologies:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7 with the Neon adapter, zod, OpenAI Responses API (`fetch`), Railway.
- **Links:** repository `https://github.com/amber-goding/week-7-build-HuntSomewhere` (recorded and reachable). Deployment URL: not recorded.
- **Needs checking:**
  - The deployed URL and a live walk-through.
  - Which scope the case study should present: the launch version, against what is built today.
  - Screenshots.
  - Contribution.
- **Case-study outline:**
  - **Problem:** finding huntable land is fragmented.
  - **Approach:** sourced public data with honest uncertainty labels; AI only proposes preferences, which a person can edit.
  - **Solution:** trip planner → saved trip → areas in matching counties.
  - **Decisions:** provenance kept byte for byte, county-only matching stated plainly, an atomic AI allowance, no raw trip text stored.
  - **Verifiable result:** pending a live check.

### Catering Concierge

- **Problem and audience:** independent restaurants managing catering inquiries from first contact to a confirmed event (`README.md`).
- **Launch scope (plan):** inbox, web-form, and manual intake; AI extraction; menus; deterministic quotes; drafted replies; bookings; analytics. **These modules are planned, not implemented.**
- **Source (committed at `67f03bc`):**
  - Better Auth Google sign-in, plus restaurant setup with owner membership.
  - A Zapier import endpoint:
    - bearer token with timing-safe comparison;
    - strict payload rules and a 128 KiB cap;
    - duplicates resolved by a unique index.
  - A restaurant-scoped `/inquiries` review screen.
  - Offline tests with a mocked database.
  - The dashboard uses fictional sample data. The app makes no AI calls itself; the AI review is produced in Zapier.
- **Repo-recorded:**
  - **Observed by Codex on the deployed demo:** `/api/health` returned OK; a Zapier test returned 201 `created`, and a repeat returned 200 `duplicate`; fictional inquiries appeared with their AI reviews.
  - **Owner-reported:** the Railway deploy, migrations, Google sign-in on the Railway domain, and the published five-step Zap.
- **Planned or unfinished:**
  - Manual inquiry entry is uncommitted and not verified live.
  - Isolation between two accounts and concurrent deliveries are not tested live.
  - Email, menu, quotes, events, and settings exist as routes only.
  - It uses the Neon development branch; there is no production database.
- **Technologies:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7 with the Neon adapter, Better Auth, Zapier (Tables, AI by Zapier, Code, API), Railway, Node test runner.
- **Links:** repository `https://github.com/amber-goding/week-8-build-catering-concierge` (recorded and reachable). Deployment URL: not recorded (the README uses `<railway-domain>`).
- **Needs checking:**
  - The deployed URL and whether the demo stays online.
  - Which scope to present.
  - Screenshots, which need demo data only.
  - Contribution.
- **Case-study outline:**
  - **Problem:** catering inquiries scattered across channels.
  - **Approach:** connect existing tools before building more; keep AI output reviewable.
  - **Solution:** Zap with AI review → authenticated, idempotent import → restaurant-scoped review screen.
  - **Decisions:** server-fixed scope, a timing-safe token, the unique index for duplicates, logs without content.
  - **Verifiable result:** the observed 201 and 200 duplicate behaviour on the demo.

### Recommendation (Reentry Resource Extractor approved; the rest proposed, not approved)

**Feature three projects:**
- **Reentry Resource Extractor** for AI integration.
- **Catering Concierge** for workflow automation.
- **HuntSomewhere** for full-stack application development with public data.

Together they cover the three service areas with little overlap: careful extraction backed by evidence, an automation pipeline with idempotent delivery, and a database-backed app with clear data provenance.

**Ever After Planner** is a possible fourth once per-user tasks are finished and verified. Until then it has a privacy gap, and its stack overlaps HuntSomewhere.

**Build Reentry Resource Extractor's case study first:**
- Its source matches its own planned launch scope.
- It has no database or sign-in dependencies.
- It shows the "AI used thoughtfully" positioning most directly.
- It needs only a deployment or runtime check, screenshots, and contribution wording.

### Outstanding checks before any case study is published

1. The owner chooses which projects to feature and how to describe Amber's contribution and the use of AI coding agents.
2. For each chosen project: a working deployed URL or a decision to link only the repository, a live walk-through, real screenshots, and the repository naming and public docs review.
3. Every public statement is checked against verified functionality. Planned modules are described only as planned, or left out.

Project requirements and approved decisions are recorded in [AGENTS.md](AGENTS.md).
