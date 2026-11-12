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
| `src/content/home.js` | Homepage content: navigation, services overview, and the hero sticker tags |
| `src/content/stack.js` | Homepage technology section: the four tool groups, how each is used, project mappings, and the separate "Tools I build with" list |
| `src/content/services.js` | `/services` content: introduction, the three service areas (audience, problems, engagement, illustrative example), and the process steps |
| `views/services.ejs` | Services page |
| `src/content/about.js` | `/about` content: the approved heading and "How I work" copy, the introduction and three-part "My story" section (reworded from the owner's bio), portrait details, and the LinkedIn and GitHub links |
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
| `public/css/styles.css` | The whole visual system in the selected "Cool & savvy" design: palette tokens, typography, layout, components for every page, and the motion system with reduced-motion rules |
| `public/js/site.js` | Optional enhancements: scroll reveals, the ticker's pause control, and the technology-section tabs. Without it, all content stays visible, the ticker stays still, and every technology group is shown |
| `public/fonts/` | Self-hosted Space Grotesk and DM Sans (variable woff2, latin and latin-ext) and Playfair Display (variable woff2, latin subset), with their SIL Open Font License files |
| `public/brand/` | The earlier AG monogram assets, kept intact but **not used** by the current design. The final logo is pending |
| `public/favicon.svg` | Favicon matching the Savvy wordmark: a bone "ag" with a coral full stop on an ink circle, as vector paths outlined from Space Grotesk Bold (no font at runtime) |
| `public/apple-touch-icon.png` | 180×180 home-screen icon for iPhone and iPad, rendered from the favicon |
| `docs/design-previews/` | Internal design previews (not served by the app). `savvy.html` and its screenshots are the approved reference for the current design. Run `node docs/design-previews/serve.mjs` to view them |
| `test/` | Tests that make real HTTP requests to the app |

**Branding:** the header uses the Savvy design's wordmark, built in HTML and CSS: a bone circle with "ag", then "amber goding" with a coral full stop. The favicon and Apple touch icon match it. The earlier AG monogram was rejected; its files remain in `public/brand/` but are unused.

Fonts come from Google Fonts' official distribution, and the licenses from the [google/fonts](https://github.com/google/fonts) repository. Playfair Display is a Latin subset of the variable font made with fontTools. As in the approved preview, its italics are the browser's oblique rendering. No fonts or scripts load from third-party servers.

Routes:

- `GET /`: homepage (sections `#work`, `#services`, `#stack`, `#about`, `#contact`)
- `GET /services`: Services page (sections `#application-development`, `#ai-integration`, `#workflow-automation`, `#process`)
- `GET /about`: About page (introduction with portrait and professional links, background, "How I work", contact invitation)
- `GET /projects/:slug`: case study for a published project (`src/content/projects.js`). Currently `/projects/reentry-resource-extractor`, `/projects/catering-concierge`, and `/projects/huntsomewhere`. Any other slug, including unpublished candidates, returns the standard 404 page.
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
- **Health check:** `/healthz` returns `{"status":"ok"}` with `Cache-Control: no-store`. Set it as the Railway health-check path.
- **Proxy awareness:** on Railway (detected through `RAILWAY_ENVIRONMENT_ID`), contact rate limiting reads the client IP from the edge's `X-Real-IP`. The contact form's same-origin check accepts the edge's `X-Forwarded-Host`, so the Railway domain, `ambergoding.com`, and `www` all work without extra settings.
- **Security headers:** every response sends `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: DENY`, and omits `X-Powered-By`.
- **Shutdown:** `SIGTERM` closes the server cleanly, with a 10-second fallback, so redeploys don't cut requests off abruptly.

### Deployment readiness (checked 2026-11-12)

- **Dependencies:** `npm ls --omit=dev` is clean (`express` 5.3.0, `ejs` 7.0.2, matching `package-lock.json`), and `npm audit --omit=dev` found 0 vulnerabilities.
- **Tests:** `npm test` passes with email disabled or mocked.
- **Railway-like smoke test:** `npm start` with `PORT`, `NODE_ENV=production`, and `RAILWAY_ENVIRONMENT_ID` set.
  - Every page and asset returned 200; unknown paths returned 404.
  - `/.env`, `/package.json`, and `/src/app.js` returned 404.
  - `/healthz` and the security headers were present.
  - The startup log names missing email variables without printing values.
- **Not done:** an actual Railway deployment. It needs the owner's approval.

### Deploy checklist (owner, in the Railway dashboard)

1. Create a service from the GitHub repository and deploy the `main` branch. Railpack detects Node 24 from `engines.node`.
2. Under **Variables**, set:
   - `RESEND_API_KEY`;
   - `CONTACT_TO_EMAIL`;
   - `CONTACT_FROM_EMAIL` (an address on the verified `mail.ambergoding.com` domain);
   - `CONTACT_FORM_SECRET` (32+ random characters; see `.env.example`).

   Don't set `PORT`, because Railway provides it. Never paste these values into chat, commits, or logs.
3. Under **Settings**, set the health-check path to `/healthz`.
4. Generate a Railway domain and confirm:
   - the startup log says `Contact form: email delivery configured.`;
   - every page loads;
   - a real test inquiry arrives with the correct Reply-To.
5. Custom domains (`ambergoding.com` and `www`) need a decision on which one is canonical, plus DNS records at Spaceship. Check that Spaceship supports the record Railway needs for the root domain.

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

**Milestone 2 (visual foundation and homepage; its visual design is superseded by "Cool & savvy", below):**

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

**About page (first committed in `ddbba93`):** `/about` shows the portrait and LinkedIn and GitHub links, the approved heading and "How I work" copy, and a headed, three-part "My story" section (the path, the mindset, the craft). That section is reworded from the owner's own bio and replaces the earlier background paragraphs (AGENTS.md, Decisions).
- **Portrait:** responsive WebP sources with a JPEG fallback, intrinsic dimensions, and alt text "Portrait of Amber Goding". It is not lazy-loaded because it sits near the top of the page.
- **Navigation:** the main navigation's About link now goes to `/about` and is marked as the current page there.
- **Homepage:** the `#about` teaser stays and links to the page ("More about Amber").

**First case study (committed in `562168a`):** `/projects/reentry-resource-extractor`, the owner-approved Reentry Resource Extractor (AGENTS.md, Decisions, 2026-11-12).
- **Structure:** a reusable content file (`src/content/projects.js`) and template (`views/project.ejs`): problem and audience, the retrieve → extract → review workflow, implementation decisions, the review interface, scope and limitations, the approved contribution wording, technologies, links to the live application and repository, and a contact invitation.
- **Honesty rules in the copy:** missing details stay "Not Found"; extracted information needs human review; matching quoted evidence is not proof an interpretation is correct; no measured results, accuracy, adoption, or client outcomes; saving, exporting, publishing, and site crawling are listed as not implemented.
- **Screenshots:** captured from the deployed application on 2026-11-12 without changing it. The start screen is a plain capture. The two review-interface captures use the app's own "Show development sample results" button, which renders test data in the browser without any server or AI call, and are captioned as sample data. "Analyze Program" was not submitted.
- **Homepage:** the first selected-work slot is this project (real title, summary, screenshot, and link).
- **Accuracy correction (included in `562168a`):** the copy describes what the model is instructed to do and what the server checks. It doesn't claim extracted values are supported or correct.

**Second case study (committed in `2d02143`):** `/projects/catering-concierge`, the owner-approved Catering Concierge (AGENTS.md, Decisions, 2026-11-12).
- **Sources:** that repository's committed `main` (`67f03bc`, the deployed branch) and its deployed interface, viewed signed out. Its working tree holds uncommitted manual-entry work on a feature branch, which the case study treats as in development.
- **Content:**
  - the multi-channel intake problem;
  - Zapier preparing each record and writing the AI review (the app calls no AI service);
  - the bearer-token import endpoint: server-fixed restaurant and table, exactly three fields, a 128 KiB limit, checks before the database, and duplicate handling backed by a unique index;
  - the session-scoped, read-only Inquiries screen;
  - scope and limitations, the approved contribution, technologies, links, and a contact invitation.
- **Screenshots:** captured signed out on 2026-11-12 with navigation only. They show the dashboard on desktop and phone (its fictional sample data, flagged "Sample data") and the sign-in page. The sign-in-only Inquiries screen isn't pictured.
- **Template changes:**
  - Sample-data flags now follow each screenshot's `sample` field.
  - The fourth section's label can be set per project.
  - The flag uses deep teal on cream sections, because gold failed contrast there.
  - Homepage screenshot cards keep their ratio in every staggered slot.
- **Homepage:** the second slot (formerly the Automation placeholder) is this project.

**Third case study (implemented, not committed):** `/projects/huntsomewhere`, the owner-approved HuntSomewhere (AGENTS.md, Decisions, 2026-11-12). The review trail is in `docs/huntsomewhere-case-study-draft.md`.
- **Sources:** committed `main` (`5d4c484`, clean tree) and the owner-confirmed deployment.
- **Live checks:**
  - `/areas`, `/sources`, and `/plan` loaded.
  - One fictional demonstration trip was saved through the manual form, with one POST and no AI: `/trips/a708ed60-d49a-4d09-8dd0-4f7cff2b4771`.
  - Its county results showed exactly Mt. Nebo WMA and Cunningham Swamp WMA.
  - The AI suggestion step wasn't run (not authorized) and is described from source.
- **Content:**
  - describe or set preferences, review, save, and discover;
  - link-access saved trips (anyone with the link can view);
  - a database-enforced AI request limit;
  - six curated areas in four counties with official-source attribution;
  - county-only matching and its limits;
  - planned features kept separate.
- **Screenshots:** the `/areas` list (real public data) is the homepage card image. The planner with demonstration options and the demonstration trip's pages carry "Demonstration input" or "Demonstration trip" flags.
- **Template changes:**
  - A screenshot's flag text can be set per image (`flagLabel`, default "Sample data").
  - Case-study titles have a lower minimum size, so "HuntSomewhere" fits at 320px without breaking mid-word.
- **Homepage:** the third slot (formerly the Application placeholder) is this project. One development placeholder remains.

**Selected design, "Cool & savvy" (implemented, not committed):** the owner selected the Savvy preview, and it is now implemented across every page (AGENTS.md, Decisions).
- **Homepage,** matching `docs/design-previews/screenshots/savvy-desktop.webp` and `savvy-phone.webp`:
  - sticker tags, the oversized "Make complex / feel simple." hero, and the portrait intro;
  - the coral ticker (with a pause button);
  - the three projects with tilted screenshots;
  - bone services cards;
  - the new technology section;
  - the About section with the large portrait and "Hi, I'm Amber" sticker;
  - the coral contact invitation.
- **Other pages:** Services, About, Contact, the three case studies, and the error pages use the same palette, type, rounded controls, card treatments, and section contrast. Copy, contribution statements, claims, screenshots, and demonstration labels are unchanged.
- **Technology section** (`#stack`, after Services):
  - four groups (Interfaces, Data, AI & automation, Development & delivery), each with its tools, how they are used, and links to the case studies that use them;
  - a separate "Tools I build with" block for Claude Code and Codex;
  - with JavaScript: an accessible tab set (click, touch, arrow keys, Home and End). On phones it is a 2×2 grid, one column below 352px. Without JavaScript, all four groups are shown.
- **Motion:**
  - a staggered hero entrance (about 0.5s);
  - gentle scroll reveals, which only hide content after the script confirms motion is allowed;
  - project hovers: image scale, untilt, title colour, and arrow travel;
  - 180ms button and navigation transitions;
  - smooth anchor scrolling;
  - a panel and chip entrance when switching technology groups.
  - All of it is disabled under `prefers-reduced-motion`. The ticker only moves once its pause button is active.
- **Navigation:** the pill stays visible on every width, as in the phone reference. There is no hidden menu, so the old menu toggle was removed.
- **Visual review:** the owner's final visual review is still pending.

### Temporary content (must be replaced or confirmed before launch)

- **Hero wording:** "Make complex feel simple." and the sticker tags "AI, used thoughtfully" and "Decisions, explained" (drawn from the approved positioning)
- **Technology section wording:** the heading "What I build with." and its introduction (tool lists and usage are evidence-based, but the wording is new)
- **Selected work:** the three approved projects, Reentry Resource Extractor, Catering Concierge, and HuntSomewhere. The development placeholder was removed.
- **Work introduction:** "Less friction. More possibility."
- **Services:** the heading "Practical tools for real work." and the three capability descriptions
- **Homepage About section:** uses approved `/about` copy (the heading, a quoted sentence from "How I work", and its first paragraph) with the "Hi, I'm Amber" sticker. The pairing is new.
- **Contact:** the heading "Let's make it happen." and its supporting sentence, on the homepage, `/contact`, and the closing invitation on `/about`
- **Services page:** all wording in `src/content/services.js` is provisional, including the three illustrative example scenarios (home cleaning, tutoring, and property maintenance), which are hypothetical by design

### Remaining before launch

- Owner review of the Reentry Resource Extractor case-study copy, and an end-to-end extraction check of the live app by the owner (the write-up is based on source inspection and the deployed interface, not a live AI run)
- Owner review of the Catering Concierge case-study copy, and a signed-in check of the deployed Inquiries screen by the owner (it wasn't viewed for the case study)
- Owner review of the HuntSomewhere case-study copy; a decision on keeping or deleting the demonstration trip; optionally, correcting the live planner's "private link" intro in the HuntSomewhere repository
- Possibly one more project (owner-approved) with verified descriptions, screenshots, links, and case-study pages, replacing the remaining placeholders
- Owner review of the Services page wording and the homepage About teaser
- Decide whether to include a résumé
- Contact in production: set the Railway variables and confirm a real inquiry sent from the deployed site arrives with the correct Reply-To. The local check is already done (owner-reported).
- Owner's final visual review of the implemented "Cool & savvy" design
- Final logo confirmation (the "ag." wordmark and matching favicon are in place)
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

**Status (2026-11-12): approved as the third portfolio entry, and its case study is implemented** at `/projects/huntsomewhere` (not yet committed). Approvals, corrections, live evidence, and the demonstration trip are recorded in `docs/huntsomewhere-case-study-draft.md`.

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

**Status (2026-11-12): approved as the second portfolio entry, and its case study is implemented** at `/projects/catering-concierge` (not yet committed).
- **Owner-supplied:** live application `https://week-8-build-catering-concierge-production.up.railway.app/`, and the contribution wording recorded in AGENTS.md.
- **Checked for this task (read-only):**
  - **Repository:** `main` = `origin/main` = `67f03bc`. The working tree is on `codex/manual-inquiry-entry`, with manual entry uncommitted.
  - **Source:** the committed code has no AI SDK, and the in-app banner states the app calls no AI service.
  - **Live app:** `/`, `/sign-in`, `/quotes`, and `/api/health` (`{"status":"ok"}`) load signed out, and `/inquiries` redirects to `/sign-in`. The capture made 177 requests, all GET, with no `/api/` calls.
- **Not verified here:** the signed-in Inquiries screen, any import, separation between two accounts, and live duplicate handling. The project's own records note a live duplicate check, which wasn't repeated.

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

### Recommendation (Reentry Resource Extractor, Catering Concierge, and HuntSomewhere approved; Ever After Planner not approved)

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
