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

**Outcome:** The user committed Milestone 1 as `f527181` ("Scaffold Railway-ready Express application"). It has not been pushed.

### 5. Milestone 2: visual foundation and homepage

**Asked:** Build the approved visual direction into a polished, responsive homepage:
- Self-hosted Space Grotesk and DM Sans, plus italic serif accents.
- Header with in-page nav and an accessible mobile menu that still works without JS.
- Hero with ribbon art, service band, services overview, and staggered selected-work layout (clearly marked placeholders).
- Cream About teaser and a `mailto:` contact invitation.
- Reduced-motion support, and browser verification at 320, 375, 768, 1024, and 1440px.

Excluded: other pages, case studies, email delivery, new dependencies, commits, and deploys. The prompt counted as approval for this scope.

**Done:**
- **Fonts:** variable woff2 files (latin and latin-ext) from Google Fonts' official CSS API, saved to `public/fonts/` (about 135 KB total). OFL texts copied verbatim from `google/fonts` (`ofl/spacegrotesk`, `ofl/dmsans`). Georgia (a system font) supplies the italic serif accents, as in the reference. Both woff2 files used above the fold are preloaded.
- **`src/content/home.js`:** navigation, services, four project placeholders (`variant`: composition, workflow, signal, layers), and principles. `src/app.js` passes these to the views.
- **Views:**
  - Header partial: monogram, nav with `/#section` links (so the 404 page can link back), a `<button hidden>` menu toggle with `aria-expanded`/`aria-controls`, and the deferred `/js/site.js`.
  - `index.ejs` sections: hero → service band → `#work` → `#services` → `#about` (cream) → `#contact`.
  - Footer: © year, role, and "Back to top" (`#top`).
  - `error.ejs` restyled.
- **`public/js/site.js`:** reveals the toggle and adds `.has-menu`. The menu toggles on click, closes on Escape (returning focus to the button), on link selection, on outside clicks, on focus leaving, and when the window switches to the desktop breakpoint.
- **`public/css/styles.css`, rewritten:**
  - Tokens and type scale with readable label sizes (12px minimum).
  - CSS-only ribbon sculpture (conic gradients and masks, with `-webkit-` prefixes), with `overflow: hidden` on the hero.
  - Staggered 12-column project grid at ≥48rem.
  - Deep teal for accents on cream.
  - Reduced-motion block. No continuous animation.
- **Tests:** replaced the frozen homepage-copy assertions with semantic checks:
  - one h1, skip link target, and nav targets that exist as section ids;
  - menu button attributes, and no empty, `#`, or broken fragment links;
  - hero links, `aria-hidden` artwork, `mailto:` and no `<form>`;
  - every placeholder labeled and unlinked, banned bootcamp/student terms absent, and only local assets;
  - each font, script, and license served with the right type, and woff2 magic bytes checked.
- **Docs:** README layout and status, an explicit "Temporary content" list, and "Remaining before launch". AGENTS.md status updated.

**Browser verification:** No browser tools are connected to this session, so headless Chrome was driven over the DevTools protocol by a scratchpad script (`browser-check.mjs`, not added to the repo). It used Node's built-in WebSocket, started its own server on a random port, and stopped it and Chrome afterward. The first run found:
- The workflow tile's "g" dropped below its box, because the grid layout made the `<span>` its own grid row. Switched to flex.
- The second-row stagger was cramped. Removed the negative margin.
- The service band wrapped on phones with a dangling separator. Separators are now hidden below 40rem.
- The mobile headline felt small. Raised it to `16vw`.
- The art caption was 11px. Raised it to 12px.

After the fixes, the final run showed:
- **Layout:** no horizontal overflow at any width, no text/art overlap, no headline line wrapping, no heading overflow, no text under 12px, and both fonts loaded.
- **Keyboard:** skip link first, visible, and Enter moves focus to `main`. Every focused element shows the 2px turquoise outline and matches `:focus-visible`.
- **Mobile menu:** a click opens it; Escape closes it and returns focus to the button; Enter opens it and Tab reaches "Work"; tabbing out, outside clicks, and link selection all close it (the link lands on `#about`). Closed-menu links are skipped by Tab.
- **No-JS:** the toggle is hidden and all 4 links are visible with no overflow.
- **Reduced motion:** transitions are 0.01ms and `scroll-behavior: auto`. No running animations in either mode.
- **Contrast:** computed against the actual effective background for 113–119 text elements. No real text below 4.5:1; the lowest is 5.69:1 (muted text on cream). The only failures are decorative and `aria-hidden`: the faint "ag." watermark at 1.5:1 (intentional) and the gold ✳ on teal at 3.4:1, which is hidden on phones. The outline headline stroke is 15.9:1.
- **Screenshots** were captured at all widths, plus the open menu, no-JS view, and focus states.

**Decisions:**
- Navigation uses `/#id`, not `#id`, so the same partial works on error pages. On the homepage it stays a same-document scroll.
- The menu toggle uses the HTML `hidden` attribute and is revealed by JS, which keeps links usable if JS fails. The trade-off is a possible brief flash of the expanded nav on slow mobile loads.
- The service band remains readable text (separators `aria-hidden`), not hidden decoration.
- The OFL files keep their upstream trailing whitespace, because license texts are copied verbatim.
- No new dependencies were added.

**Verification:**
- `npm test`: 62 tests, 61 passed, 0 failed, 1 skipped (the Windows SIGTERM test).
- `git diff --check` is clean apart from LF→CRLF warnings. The untracked-file check flags only the verbatim OFL trailing whitespace.
- A `node server.js` process on port 3000 (PID 54720, started by `npm start` at 12:52 AM, after the M1 commit) was not started by this session and was left running.
- **Not verified:** real devices (only emulated widths in headless Chrome), screen reader output, Safari/Firefox rendering (Chrome only), and production deployment.

### 6. Fix: terminal preview link

**Asked:** The startup message printed `http://0.0.0.0:<port>`, which VS Code's terminal link can't open. Change it to `Local: http://localhost:<actual port>` while keeping the `0.0.0.0` bind and Railway's `PORT` handling. Update the startup test to check the usable URL, with a separate check that the server still binds to `0.0.0.0`. Change nothing else, and leave the uncommitted Milestone 2 work untouched.

**Done:**
- **`server.js`:** the listen callback now logs `Local: http://localhost:${server.address().port}`, using the port actually bound rather than the requested value. `HOST` (`0.0.0.0`) and `parsePort` are unchanged.
- **`test/server.test.js`:**
  - `waitForListening` now parses and returns the printed `Local:` URL.
  - The first test checks the URL equals `http://localhost:<PORT>`, that stdout no longer shows `0.0.0.0`, and fetches `<printed URL>/healthz` (200).
  - A new separate test checks the bind for real: the server must answer on both `127.0.0.1` and a non-loopback IPv4 address of this machine (from `os.networkInterfaces()`). A loopback-only bind would refuse the latter. The test is skipped only if no such interface exists.

**Verification:**
- `npm test`: 63 tests, 62 passed, 0 failed, 1 skipped (Windows SIGTERM). The bind test ran rather than being skipped.
- **Manual runs:** `npm start` (PORT=4174) and `npm run dev` (PORT=4175) each printed `Local: http://localhost:<port>`, the printed URL returned HTTP 200 for `/`, and `netstat` showed `0.0.0.0:<port>`.
- **Leftover process:** stopping the `npm run dev` check killed the listening child, but its `node --watch server.js` parent (PID 31976, under cmd PID 45896, started 1:01:50 AM by this session) stayed running and idle. Stopping it was blocked by the permission classifier, so the user was told how to stop it. The user's own server (PID 54720, port 3000) was not touched.
- No other files reference the old message. Nothing was committed.

### 7. Branding revision: uppercase AG monogram, logo, and favicon

**Asked:** Replace the lowercase "ag" with the user's intended branding: an intertwined, high-contrast serif uppercase **A and G** with a sweeping flourish, a small sparkle, and a spacious editorial name. The source was a brand board PNG at `C:\Users\amber\AppData\Local\Temp\codex-clipboard-690df169-…png`. Keep the website palette and do **not** adopt the board's blush pink. Deliverables:
- Reusable vector SVGs: a full monogram, a horizontal logo, and a simplified favicon (no cropping of the image, no runtime fonts).
- Every existing placement updated, with accessible names on linked logos and decorative copies hidden.
- AGENTS.md and the prompt history updated.

No other features, no commits.

**Done:**
- **Reference read:** brand board "Blush Editorial Elegance" (Playfair Display + Montserrat, rose-gold). Only the logo character was taken.
- **Generator** (scratchpad only, not in repo): `brandtools/generate.py`, run in an isolated venv with fontTools 4.68.
  - Playfair Display variable TTF and OFL from `google/fonts`. Weights set with `instancer`, glyphs exported as paths with `SVGPathPen`.
  - Monogram: A at weight 500, horizontally compressed to 0.84; G at 0.6 scale, overlapping the A's right leg.
  - Flourish: a generated tapered elliptical-spiral swash, smoothed with Catmull-Rom into cubic Béziers, drawn behind the letters.
  - Sparkle: a four-point star.
  - Name: "AMBER GODING" outlined at weight 560 with 0.2em tracking, after a thin divider.
  - Favicon: weight 900, a cream outline (stroke 1.8% of the tile) to thicken hairlines, only the upper sweep of the swash in gold, no sparkle, on a charcoal rounded square.
- **Iterations:**
  1. The viewBox was wrong because the naive number-pair parser broke on H/V commands. Switched to fontTools `parse_path` with `BoundsPen`.
  2. Opened up the flourish and tilted it more to match the reference.
  3. Ended the swash behind the letters; its hairline tail had been crossing the G.
  4. The favicon's full loop was noise at 16px, so it was simplified.
  5. Enlarged the name in the horizontal logo (cap height 0.24 → 0.27 of the monogram height) after seeing it too thin in the header.
- **Files:** `public/brand/ag-monogram.svg` (charcoal, deep-teal flourish, gold sparkle), `ag-monogram-reversed.svg` (cream, gold), `ag-logo-horizontal.svg` and `ag-logo-horizontal-reversed.svg`, and `public/favicon.svg` (replaced). Paths only: no `<text>`, fonts, `<image>`, scripts, `href`, or `url()`.
- **Placements:**
  - Header: `<img class="brand-logo" alt="Amber Goding, home">`, reversed logo, height `clamp(1.875rem, 8vw, 3rem)`.
  - Footer: `.footer-mark`, `alt=""`.
  - Hero sculpture: centered reversed monogram, counter-rotated, `alt=""` inside the `aria-hidden` art.
  - First project preview: watermark `.preview-stamp` at 0.16 opacity.
  - Workflow tile: `.preview-core img`.
  - Removed `.brand-mark`, `.brand-name`, `.brand-period`, and the text-based `.sculpture-mark` styles.
  - Header column gap reduced from 1.5rem to 0.75rem so the menu button stays on the logo's row at 320px. The `space-between` layout is unchanged at wider sizes.
- **Tests (`test/app.test.js`):** added header logo link with an accessible name; every `<img>` has `alt`, with decorative monograms `alt=""`; the retired `a<span>g</span>` markup is absent; the 4 brand SVGs are served as `image/svg+xml`; and each brand SVG and the favicon are pure vector with no font or external references. No existing assertion needed loosening.
- **Docs:** AGENTS.md Branding section rewritten for the uppercase direction (brand-board path, palette mapping, asset locations, Playfair outline provenance, accessibility rule). The visual-reference line notes its lowercase "ag" is superseded, and a dated decision was added. README gained a layout table row for `public/brand/` and `favicon.svg`, plus a "Brand assets" note.

**Verification:**
- `npm test`: 75 tests, 74 passed, 0 failed, 1 skipped (Windows SIGTERM).
- **Headless Chrome:**
  - Preview sheet (project files at actual px on cream and charcoal): logo at 64/48/30, monogram at 160 down to 24, favicon at 16/32/48 actual plus pixelated enlargements.
  - Full homepage inspection: no overflow at 320–1440, menu, keyboard, and no-JS checks still pass, no real-text contrast failures (lowest 5.69:1).
  - Accessibility tree: link "Amber Goding, home"; the only exposed image is the logo; decorative monograms are ignored.
  - Header geometry: logo and menu on one row at 320 (18px gap), 360, 375, and 768.
- `git diff --check` clean, untracked text files clean. A user-started `npm start` server (PID 55808, port 3000) and the earlier leftover watcher (PID 31976) were left untouched.
- **Not verified:** a real browser tab's favicon rendering (headless Chrome has no tab strip), Safari (historically limited SVG favicon support; no PNG/ICO fallback or `apple-touch-icon` was added), Firefox, real devices, and printing. The brand board lives in a Temp folder and may be cleaned up by the OS.

**Outcome:** The user committed Milestone 2 and the branding as `c305a46` ("Build branded homepage and improve local preview"). It has not been pushed.

### 8. Contact form with Resend, privacy correction, and provisional-styling note

**Asked:**
- **Styling:** record in AGENTS.md that the current visual styling is **provisional** (palette and branding stay approved; a dedicated design review is needed before launch) and avoid unrelated visual changes.
- **Contact feature:** implement the full contact form using Resend's HTTPS API (implementation approved; accounts, DNS, charges, commits, and deploys not approved). The recipient comes only from `CONTACT_TO_EMAIL`.
- **Privacy correction:** remove the visible address and every `mailto:`; the receiving address must never reach the browser.
- **Required behavior:**
  - A `/contact` page whose form works without JavaScript and is enhanced with it.
  - Validation, honeypot, server-verifiable minimum time, Railway-aware rate limits, and CSRF/origin checks.
  - Duplicate prevention plus Resend idempotency, and a bounded timeout.
  - Every state shown accessibly: honest "unavailable" when unconfigured, success only after provider acceptance, worded as "submitted".
- **Tests:** mocked provider only, plus browser checks. Then guide the user through Resend setup, with approval before account or DNS changes.

**Research (official docs):**
- **Resend:** `POST https://api.resend.com/emails`, Bearer auth, `reply_to` (snake_case), and a required `User-Agent`.
- **Idempotency:** `Idempotency-Key` lasts 24h (max 256 chars). Reusing it with the same payload replays the original response; a different payload returns `409 invalid_idempotent_request`; a request still in progress returns `409 concurrent_idempotent_requests`.
- **Railway:** the edge sets **`X-Real-IP`**, `X-Forwarded-Proto`, and `X-Forwarded-Host`. `X-Forwarded-For` behavior is undocumented, so it is not relied on. Railway provides `RAILWAY_ENVIRONMENT_ID` and related variables (`RAILWAY_ENVIRONMENT` is *not* documented).

**Done:**
- **`src/contact/`:**
  - `config.js`: reads the three required variables, validates the recipient/sender format, and reports missing ones by name only. It also handles the optional `CONTACT_FORM_SECRET` (random per process if unset), `CONTACT_ALLOWED_ORIGINS`, and `CLIENT_IP_HEADER` (defaults to `x-real-ip` when `RAILWAY_ENVIRONMENT_ID` is set, otherwise the socket address; `none` disables it).
  - `validation.js`: name 1–100 with no CR/LF or control characters; email format and ≤254; message 10–5000; repeated or non-string fields rejected.
  - `form-token.js`: HMAC-signed `issuedAt.nonce.sig`. It enforces at least 3s and at most 2h, and the nonce is the submission id.
  - `rate-limit.js`: fixed-window, in memory.
  - `resend.js`: fetch with `AbortSignal.timeout`. It never throws, and it keeps Resend's error `name` but drops `message` (which can echo addresses).
  - `router.js`: GET/POST `/contact`. The POST pipeline, in order:
    1. Form-encoded content only (415); 64 KB cap (413); at most 10 fields.
    2. Origin or Referer must match Host, `X-Forwarded-Host`, or the allowed origins (403).
    3. Configured? Otherwise 503 unavailable.
    4. Attempts limit: 20 per 10 min per client (429 + Retry-After).
    5. Field types; honeypot `contact_url` (400 rejected, never fake success).
    6. Token: expired or invalid returns a fresh token; too fast keeps the same token.
    7. Validation.
    8. Idempotency key `contact-` + sha256(nonce, name, email, message). In-memory single-flight: pending waits on the same promise, sent is remembered for 24h, failures are cleared.
    9. Send limits: 5/h per client and 30/h globally.
    10. Plain-text payload `{from, to:[to], reply_to, subject, text}` with no timestamp, so retries are byte-identical.
    11. Outcome mapping: timeout 504, failure 502, quota 503, concurrent 409 busy.
  - Responses are JSON when `Accept: application/json`, otherwise the rendered page. `Cache-Control: no-store`.
- **Templates:**
  - `views/contact.ejs`: labeled fields, error summary (focusable), `role="alert"` alert, `role="status"` region, an `aria-hidden` honeypot with `tabindex="-1"`, a hidden token, and success and unavailable panels.
  - Header nav gets `aria-current="page"`.
- **`public/js/contact.js`:** fetch submit with a pending state (`aria-disabled`, `aria-busy`, read-only fields, "Sending…"), field errors with `aria-invalid`/`aria-describedby` and summary focus, an alert on failure, focus on the success heading, and a 20s client timeout with honest copy.
- **Homepage:** removed `contactEmail` (from `home.js` and `app.locals`) and the `mailto:` link. Nav Contact, the hero "Start a conversation", and the contact section CTA now go to `/contact`. `.contact-email` was renamed `.contact-cta` with the same look.
- **Form CSS:** added using existing tokens only, plus a global `[hidden]{display:none!important}` because class `display` rules were overriding `hidden`.
- **Startup and scripts:**
  - `server.js` logs contact readiness by variable name only.
  - `npm run dev` now uses `--env-file-if-exists=.env`; `npm start` is unchanged for Railway.
- **Docs:**
  - `.env.example` rewritten with example addresses.
  - README: contact section, env table, local `.env` steps, single-instance limitations, status.
  - AGENTS.md: provisional-styling notice, explicit **Privacy** requirement, recipient via env only, Pending decisions updated, two dated decisions.

**Redirections and fixes during the work:**
- The first browser run showed that disabling the submit button during pending dropped keyboard focus to `<body>`, so a user lost their place after a failure. Switched to `aria-disabled` plus the pending guard; focus now stays on the button.
- No-JS failure pages now get an "Error:" title prefix for any failure, not only field errors.
- The leak-check test first hard-coded the real address as a forbidden string, which would have put it in a tracked file. Replaced it with a generic rule: the only email-like text allowed in delivered content is `name@example.com`. The real address is now absent from every working-tree file.

**Verification:**
- `npm test`: 114 tests, 113 passed, 0 failed, 1 skipped (Windows SIGTERM). `test/contact.test.js` uses a mocked fetch and an injected clock, so it sends no real email. It covers:
  - form semantics, honeypot, and that only name/email/message are collected;
  - the privacy crawl of every public page and asset, and of POST responses;
  - payload shape, headers, and From/To immune to visitor input;
  - no-JS success; validation with escaping, lengths, CR/LF, and repeated fields;
  - 413, 415, honeypot, too fast, forged/tampered/expired tokens, and CSRF (cross-site, `null`, missing);
  - allowed Referer, `X-Forwarded-Host`, and configured origins;
  - attempt, per-client, and global limits, and spoofed `X-Forwarded-For`/`X-Real-IP` ignored unless on Railway;
  - sequential and concurrent duplicates (one provider call), stable versus changed idempotency keys with byte-identical retries;
  - 500, 403 validation, 429 quota, 409 concurrent, malformed success, and network error, each keeping values with logs free of secrets and provider messages;
  - a 100ms timeout; missing or invalid configuration (unavailable, no provider call, `/healthz` OK).
- **Headless Chrome, in-process app with a mocked provider** (scratchpad `contact-browser.mjs`):
  - 375/1440 layouts with no overflow; tab order skip → logo → nav → name → email → message → submit (honeypot skipped).
  - An empty submit is blocked natively with focus on Name and no request.
  - A server-side email error focuses the summary with `aria-invalid` and `describedby`.
  - A failure shows the `role="alert"` message, keeps values, and keeps focus on the button.
  - The pending state is announced, and a second Enter while pending did not resubmit (provider calls = 2: one failure, one success).
  - Success focuses the confirmation heading.
  - Phone failure state; no-JS failure re-render with values and an "Error:" title; no-JS success page.
  - The delivered page and the browser console contain no recipient, sender, or key.
- Homepage regression run: no overflow at 320–1440, menu/no-JS OK, no real-text contrast failures.
- **Not verified:**
  - **Live delivery.** No Resend account or verified domain exists yet, so no real email was sent or received. The feature is **not launch-ready**.
  - Railway behavior (`X-Real-IP`, Host/`X-Forwarded-Host`) in a real deployment; Safari/Firefox; real screen readers.
- **Privacy note:** the real address remains in the local commits `f527181` (AGENTS.md) and `c305a46` (`src/content/home.js`). They have not been pushed. Removing it from history before the first push would require rewriting history, which is the user's decision.

**Outcome:** The user committed the contact feature as `d1582eb` ("Add private contact form with Resend delivery"). Afterwards the user created a Resend account, verified `mail.ambergoding.com` through Spaceship DNS, and confirmed that a real local test inquiry arrived in Gmail with the correct Reply-To. These are owner-reported manual checks, recorded in entry 9.

### 9. Services page and recorded email progress

**Asked:**
- Record the owner-reported progress in AGENTS.md and README: the Resend account; `mail.ambergoding.com` verified via Spaceship DNS; a real local inquiry received in Gmail with the correct Reply-To; Railway delivery and deployment still unverified. Services and About are approved separate pages, and styling stays provisional. No credentials or private addresses.
- Build a substantive `/services` page covering only application development, AI integration, and workflow automation. For each service: who it could help, problems, a possible engagement, and an illustrative example clearly marked as not client work.
- Include a four-step process (understand the problem, define the scope, build and verify, hand off) and links to `/contact`.
- Point the nav's Services link at `/services` and keep the homepage `#services` overview.
- Use the existing visual system only, with no invented prices, timelines, guarantees, clients, credentials, or results, and no security or reliability claims.
- Mocked email only; don't touch `.env`, email settings, contact logic, DNS, or deployment.

**Done:**
- **AGENTS.md:**
  - Status now lists all three commits and the owner-reported email verification, with Railway delivery and deployment explicitly unverified.
  - The Pages line states that Services and About are approved separate pages.
  - Pending decisions: the Resend/sender item was removed; the final visual approval is kept; DNS is noted as at Spaceship, with apex ALIAS/flattening support for Railway unchecked.
  - Two dated decisions were added.
- **README:** layout rows for `src/content/services.js` and `views/services.ejs`; the `/services` route and its anchors; contact status (local verified by the owner, production unverified); a Services page status note; temporary content covering the Services wording and its hypothetical examples; and an updated "Remaining before launch" list (About page, production contact check, Spaceship apex check).
- **`src/content/services.js`:** intro, three service objects (`id`, `title`, `contactLabel`, `summary`, `buildingBlocks`, `audience`, `problems`, `engagement`, `example`), and `processSteps`. The examples (home-cleaning, tutoring, property maintenance) were chosen to avoid overlapping the four real candidate projects (HuntSomewhere, Ever After Planner, Reentry Resource Extractor, Catering Concierge). Each example is phrased with "could".
- **`views/services.ejs`:**
  - `.page-hero` with h1, lede, note, a "Start a conversation" link to `/contact`, a "How a project works" link to `#process`, and an "On this page" nav.
  - Three `section.service-detail` blocks, each labelled by its h2, with h3 groups and a dashed `.example-card` labelled "Illustrative example, not completed client work", plus a per-service "Talk about …" link to `/contact`.
  - A cream `#process` section reusing `.principles` (4 columns at ≥56rem).
  - A closing invitation reusing the homepage `.contact` block.
- **`src/app.js`:** `GET /services` with a page-specific title and description.
- **Navigation:** `home.js` Services nav link now goes to `/services`. The homepage `#services` overview gained an "Explore services in detail →" link (wrapped in `.services-intro`).
- **CSS:**
  - Existing selectors were extended instead of duplicated: `.page-hero/.page-title/.page-lede/.page-note` share the contact-page rules, and `.section--cream` shares the `.about` cream rules.
  - New rules cover the TOC, service detail layout, detail lists (gold markers), example card, and process columns.
  - An unused rule added by mistake was removed.
- **Tests:**
  - `test/app.test.js`: nav expectation updated to `['/#work','/services','/#about','/contact']`, both pages fetched, and a new check that the homepage `#services` overview remains and links to `/services`.
  - New `test/services.test.js` uses `env: {}` and a fetch that throws if called:
    - metadata, one h1, skip link, and `aria-current` on Services;
    - exactly the three sections with h2 labels, the four h3 groups each, and substantive lists;
    - examples labelled illustrative and using "could";
    - process steps in order and no skipped heading levels;
    - every "Start a conversation"/"Talk about" link goes to `/contact`, with no `mailto:` and no addresses;
    - in-page anchors resolve;
    - a banned-claims scan (prices, `$`, guarantees, testimonials, years of experience, certified, durations, percentages, security/reliability, bootcamp/beginner);
    - every main-nav link on `/`, `/services`, `/contact`, and the 404 page reaches a 200 page and its fragment.

**Redirections and fixes during the work:**
- Test fixes: `#top` was exempted (the footer back-to-top link, as in the homepage test), and the banned-word check was narrowed because "student" appears legitimately in the tutoring example.
- The browser run showed "Talk about ai integration" (lowercased title). Added an explicit `contactLabel` per service.
- The TOC jump first measured −46px. A clean probe showed the section lands exactly 16px from the top (`scroll-margin-top`) with and without smooth scroll. The offset came from the harness's earlier `focus()` scroll, not the page.

**Verification:**
- `npm test`: 129 tests, 128 passed, 0 failed, 1 skipped (Windows SIGTERM). Contact tests use the mocked provider, and no real email was sent.
- **Headless Chrome (scratchpad `services-browser.mjs`, real server without email variables):**
  - At 320/375/768/1024/1440: no overflow, no heading overflow, no text under 12px. Single column below 56rem; two columns and a 4-column process at 1024+.
  - Contrast across 108–111 text elements: no failures (lowest 5.69:1).
  - Desktop tab order: skip → logo → nav → Start a conversation → How a project works → TOC ×3 → Talk about ×3, each with a 2px focus outline.
  - Mobile (375) menu: Enter opens it, Escape closes it and returns focus, and Services carries `aria-current`. The tablet (768) menu opens.
  - Reduced motion: `scroll-behavior: auto`, transitions about 0. No JS: the toggle is hidden and the four links are visible.
- Homepage regression run: no overflow, menu/no-JS OK, no contrast failures. The private address appears in no working-tree file (`.env` excluded from the search and never opened).
- **Not verified:** Safari/Firefox, real devices and screen readers, Railway. The current page in the open mobile menu has no *visual* marker beyond `aria-current` (left as is to avoid unrelated visual changes).

**Outcome:** The user committed the Services page as `7b3fbaf` ("Add Services page and record verified email setup"). It has not been pushed.

### 10. About page with approved copy, portrait, and professional links

**Asked:** Build `/about` from owner-approved copy (page title "About Amber", heading, four introductory/background paragraphs, and a "How I work" section). Use the supplied portrait unretouched as optimized local assets with metadata stripped, and link to the supplied LinkedIn and GitHub URLs without claiming to have reviewed them. Point the About nav link to `/about`, keep the homepage `#about` teaser and link it to the page, reuse existing components, and record the approval in the docs. No anecdote, no new claims, no `.env`, email, DNS, or deployment changes, and no staging or committing.

**Done:**
- **Portrait:** the source PNG (1254×1254 RGB, no ICC profile or metadata) was resized with Pillow (Lanczos) in a scratchpad venv, so Pillow is not a project dependency. Output: `public/images/amber-goding-portrait-{400,800,1200}.webp` (simple VP8, no EXIF/XMP/ICC chunks) and an 800px progressive JPEG fallback. Size: 19–126 KB, down from 2.5 MB. The source file's SHA-256 is unchanged.
- **`src/content/about.js`:** `aboutPage` (approved copy verbatim; the heading split into lead and `em` accent for styling only), `portrait` (alt "Portrait of Amber Goding", 800×800, WebP srcset, `sizes="(min-width: 56rem) 28rem, 22rem"`), and `profileLinks`.
- **`views/about.ejs`:**
  - A `.page-hero` with copy and a `<picture>` portrait side by side at ≥56rem. The portrait has a decorative offset gold frame and is not lazy-loaded.
  - "LinkedIn profile ↗" and "GitHub profile ↗" in a list labelled "Professional profiles". They open in the same tab.
  - The background paragraphs, then a cream "How I work" section, then a contact invitation that reuses the homepage's provisional "Let's make it happen." wording and links to `/contact`.
- **Route:** `GET /about` with the title "About Amber | Amber Goding" and a description paraphrasing the approved first sentence.
- **Navigation:** nav About now goes to `/about`, and the homepage teaser gained a "More about Amber →" link.
- **CSS:** a new "About page" block. Cream-section text links get a deep-teal arrow and underline, because gold on cream lacks contrast. The `.about-title` is smaller than other page titles so "understanding" never breaks mid-word.
- **Tests:**
  - New `test/about.test.js`:
    - the approved copy hard-coded independently of the content file;
    - metadata, a single h1, `aria-current`, and copy order and headings;
    - portrait markup and served files (dimensions parsed from the WebP/JPEG headers, content types, size under 200 KB, no metadata markers, and only the published files present);
    - profile link URLs and labels, the contact link, no email addresses, and banned terms.
  - `app.test.js` nav expectation is now `/about`, with a new teaser-link test. The nav-destination loop and the privacy scan now include `/about` (and `/services`).
- **Docs:** AGENTS.md records the status (Services committed in `7b3fbaf`, About uncommitted) and a dated decision approving the copy, portrait, and links. README has layout rows, the route, the status, and updated temporary-content and pre-launch lists.

**Verification:**
- `npm test`: 140 tests, 139 passed, 0 failed, 1 skipped (Windows SIGTERM). The email provider is mocked or disabled, and no email was sent.
- **Headless Chrome (scratchpad `about-browser.mjs`):**
  - At 320/375/768/1024/1440: no overflow, no mid-word heading breaks (checked with `overflow-wrap: normal`), no text under 12px. The portrait renders square at 274/324/352/330/448px, using the 400w WebP on phones and tablet and the 800w at 1024+.
  - Contrast: no failures on `/about`.
  - Keyboard: tab order runs skip → logo → nav → LinkedIn → GitHub → Send a message → Back to top, with visible outlines.
  - 375 menu: Enter opens it, About is current, Escape closes it and returns focus. The 768 menu opens.
  - Reduced motion: transitions about 0. No JS: the nav stays visible and the portrait loads.
  - Homepage: the teaser link is 48px tall, with a deep-teal focus outline when reached by Tab.
- The homepage contrast probe flags the outlined hero word "complex" at a ratio of 1. That is a probe limitation (transparent fill with a cream text stroke), and the hero is unchanged.
- **Not verified:** Safari/Firefox, real devices, screen readers, the external profile pages (not opened), and Railway.

**Outcome:** The user committed the About page as `ddbba93` ("Add About page with approved copy and portrait"). Push status not recorded.

### 11. Portfolio project inventory (read-only research)

**Asked:** Before any case-study page is built, inventory the four candidate projects (HuntSomewhere, Ever After Planner, Reentry Resource Extractor, Catering Concierge) under `C:\Users\amber\Desktop\Projects`, mapping folders from the files themselves. For each project, report:
- problem and audience;
- launch scope;
- what the source supports;
- planned work;
- technologies;
- recorded and verified links;
- visual assets;
- outstanding checks;
- a case-study outline.

Then record an internal planning section in the portfolio README and recommend 3–4 projects and which to build first. Candidate repositories were read-only: no env files, installs, app runs, migrations, database connections, paid calls, or Git changes. Only README.md and PROMPT-HISTORY.md could change, and public pages had to stay untouched.

**Done:**
- **Folder mapping:**
  - Each mapping was confirmed from file contents: `reentry-resource-extractor`; `week-5-build` = Ever After Planner (title in `app/layout.tsx`); `week-7-build-HuntSomewhere`; `week-8-build-catering-concierge`.
  - The other folders (`week-1-builld`, `week-4-build`, `seascape-whispering-wicks`) are not candidates.
- **Read:** READMEs, plans, handoffs, agent files, prompt histories (treated as evidence of direction only), key source and schema files, and `git log`. Git was read with `--no-optional-locks`, so nothing was written to the repositories.
- **Links:** the recorded GitHub remotes each returned HTTP 200 to an unauthenticated HEAD request. No repository records a deployed URL.
- **README:** a new "Portfolio project planning (internal)" section with evidence labels (source / repo-recorded / unverified), a per-project inventory, the recommendation, and outstanding checks.

**Key findings:**
- **Ever After Planner:** tasks have no owner in the committed schema, and the page and actions don't check sign-in, so everyone shares one task list. Ownership exists only as an uncommitted draft.
- **Catering Concierge:** has the most agent-observed live evidence (the idempotent Zapier import on the Railway demo). Its broader modules are planned only.
- **Reentry Resource Extractor:** its source matches its planned launch scope, including evidence-checked AI extraction and human review. There's no deployment record and no tests.
- **HuntSomewhere:** a small built flow (AI trip preferences, saved trips, 6 sourced public areas) set against a large plan. Its deployment and user testing are owner-reported.
- **All projects:**
  - No app screenshots. The Ever After PNG in `Projects/` is a design concept board.
  - Amber's exact contribution and the role of AI coding agents need owner confirmation.
  - The `week-N` repository names and in-repo docs need review before linking publicly.

**Recommendation (proposed):**
- Feature Reentry (AI integration), Catering Concierge (workflow automation), and HuntSomewhere (application development). Ever After is optional, after per-user tasks are verified.
- Build Reentry's case study first: its scope is complete in source and it has no auth or database dependencies.

**Verification:** documentation-only change. `git diff --check` was run, and the portfolio app was not changed. **Not verified:** any app at runtime, deployments, the contents of the GitHub pages, and the check counts recorded inside each project.

**Outcome:** The user committed the inventory as `a010517` ("Record portfolio project inventory and case-study plan"). Push status not recorded.

### 12. First case study: Reentry Resource Extractor

**Asked:** Implement `/projects/reentry-resource-extractor` as a reusable case-study structure, and replace only the first homepage placeholder with the real project (title, summary, authentic screenshot, case-study link).
- **Owner-approved:** the project; the live URL `https://reentry-resource-extractor-production.up.railway.app/`; the repository link; and the contribution wording, used verbatim.
- **Copy rules:** explain "Not Found" and human review, and distinguish quoted-evidence matching from proving an interpretation correct. No time-savings, accuracy, adoption, or client claims. Don't imply saving, exporting, publishing, or crawling.
- **Screenshots:** from the deployed app, using "Show development sample results" only, captioned as sample data. Never submit "Analyze Program", make paid AI calls, or enter personal data.
- **Not allowed:** no `.env`, other repos, DNS, emails, staging, committing, or deploying.

**Done:**
- **Screenshots (scratchpad `reentry-capture.mjs`):**
  - Before capturing, confirmed in the Reentry source and the deployed bundle that the sample button renders hard-coded test data in the browser without calling `/api/*`.
  - Headless Chrome at 2x, with every network request logged. Result: 7 GETs, all to the app's own host, zero `/api/` calls, no non-GET requests, and the URL field left empty.
  - Captured the start screen (1280px viewport) and the review interface with sample data (desktop 1280px; phone 390px).
  - Resized with Pillow to WebP (two widths each) plus a JPEG fallback in `public/images/projects/reentry-resource-extractor/`, with metadata stripped (26–163 KB each).
- **Content:** `src/content/projects.js` holds a `projects` array with `published` flags, plus `publishedProjects` and `findPublishedProject`. The Reentry entry covers:
  - problem and audience;
  - the three-step workflow;
  - six implementation decisions, each checked against `server.js` and `src/main.js` (evidence-match rule with whitespace-only normalization, strict schema, prompt-injection instructions, private-address blocking with 5 MB / 3 redirects / 8 s limits, separate AI and reviewed values, server-only key);
  - the review section;
  - scope with implemented items and limitations (one page, no crawling, nothing saved/exported/published, no accounts, evidence matching ≠ correctness, no automated tests);
  - a verification note;
  - technologies;
  - the contribution wording, verbatim.
- **Templates:**
  - `views/project.ejs`: hero with links and facts, six numbered sections, and a closing contact invitation linking to `/contact`.
  - New `views/partials/picture.ejs`: responsive WebP + JPEG with dimensions and lazy loading.
  - Sample-data figures carry a visible "Sample data" flag in the caption. The tall phone capture is capped at 22rem until it gets its own column.
- **Route:** `GET /projects/:slug` renders only published slugs; everything else falls through to the existing 404.
- **Homepage:**
  - `index.ejs` renders published projects first (a screenshot card with a stretched link), then the placeholders. The first placeholder was removed from `home.js`, leaving three.
  - The work intro sentence was reworded ("Real projects … will appear here" no longer fit), and the status note now reads "More projects in development". Both are listed as provisional in the README.
- **CSS:** a new "Project case studies" block only; no unrelated pages changed.
- **Tests:**
  - New `test/projects.test.js`, with the approved wording and URLs hard-coded independently. It checks:
    - published set, metadata, a single h1, ordered h2s with no skipped levels;
    - the contribution verbatim, and only the two approved external links;
    - the Not Found, review, evidence-limit, and scope statements;
    - banned claims;
    - every screenshot served at its declared size, with srcset widths matching and no metadata;
    - sample captions, the contact link, no addresses, and labelled regions;
    - 404 for unknown, unpublished, mis-cased, and nested slugs;
    - the first homepage card reaching the case study.
  - Updates to existing tests:
    - `app.test.js`: the first card is the real project, and the remaining three are unlinked placeholders.
    - `about.test.js`: the portrait checks are kept, with project screenshots allowed in subdirectories.
    - Nav-destination loop and privacy scan: now include the case study.
- **Docs:** AGENTS.md records the dated approval (live URL, verbatim contribution, screenshot method, other candidates not approved), the case-study rules, and the updated status and pending decision. README has layout rows, the route, status, temporary content, pre-launch items, and the planning section's Reentry status.

**Redirections and fixes:**
- Sixteen edits were rejected once by a transient auto-mode check (no verdict) and retried in smaller batches.
- The privacy scan's address regex matched a random byte run (`d@U.R`) inside a WebP. Binary images are now skipped by the address-pattern check, like fonts; the exact-secret check still covers them.
- The first browser run hung waiting for off-screen lazy images, so it was stopped and the wait capped at 4 s.
- The phone screenshot rendered 691×1509 at tablet width, so it's now capped at phone width.

**Verification:**
- `npm test`: 152 tests, 151 passed, 0 failed, 1 skipped (Windows SIGTERM). The email provider is disabled or mocked, and no email was sent.
- **Headless Chrome (scratchpad `project-browser.mjs`):**
  - At 320/375/768/1024/1440: no overflow, no mid-word heading breaks, no text under 12px, all images loaded and within the viewport.
  - Contrast: no failures on the case study (lowest 5.69:1).
  - Keyboard: tab order skip → nav → live/repo links → closing links → contact → back to top, all with visible focus.
  - 375 menu opens and closes (no nav item is marked current on project pages). Reduced motion and no-JS both OK.
  - Homepage card: the image click hits the link, Tab reaches it with a visible outline, and Enter opens the case study. The three placeholders remain.
- **External links:** the live URL and repository each returned HTTP 200, and the live app loaded in Chrome with its sample review working.
- **Not verified:** a live AI extraction (deliberately not run), so the write-up rests on source inspection plus the deployed interface. Also not verified: Safari/Firefox, real devices, screen readers.

### 13. Accuracy correction: what evidence matching guarantees

**Asked:** Correct case-study and homepage-card copy that overstated what evidence matching guarantees. Replace "This catches fabricated quotes and values" with the owner's exact wording. Review the tagline, card summary, description, and headings for similar guarantees, describing what the model is *instructed* to do and what the server *checks*. Keep the contribution wording, the screenshot captions, and the scope accurate. Change tests only where the wording requires it. No behavior, styling, dependency, or other-repo changes.

**Done (`src/content/projects.js`, 12 exact replacements):**
- **Evidence decision:** now uses the owner's wording: "This rejects evidence quotes that do not appear in the retrieved text. A matching quote can still accompany an incorrect interpretation, so every field requires human review."
- **Tagline, card summary, and description:** "The AI fills in / extracts only what the page supports" and "evidence-backed" became statements of the instruction ("the model is instructed to use only the page's text") and of the server check (a value is kept only when its evidence quote appears in the page text).
- **Decisions h2:** "Designed so the AI can't quietly guess." became "Built to check the AI, not to trust it."
- **Extract step:** "never to guess. Anything the page doesn't support comes back as Not Found" now describes the two actual paths to Not Found: the model reports not found, or the quote can't be matched.
- **Review step:** "Nothing is treated as final until a person has reviewed it" became "The statuses show which fields a person has checked…". The app has no "final" state.
- **Prompt injection:** now "reduce the risk… lower that risk; they don't eliminate it".
- **Fetch limits:** "fetched safely" / "can't be pointed at internal systems" became "with fetch limits" / "to keep the tool from being pointed at…".
- **Review paragraph:** "beside the exact text they came from" became "beside the quote the model cited, which the server has matched in the page text".
- **Limitation:** "reduces fabrication" became "only confirms that a quote appears in the retrieved text…".
- **Unchanged:** the contribution wording (verified verbatim), screenshot captions and labels, links, and scope items.
- **README:** the internal outline phrase "evidence-backed fields" was reworded to match.
- **Tests (`test/projects.test.js`):** the h2 expectation was updated, and the evidence-limit assertions now check the new sentences. Overstated phrases ("only what the page supports", "catches fabricated", "can't quietly guess / never to guess", "evidence-backed") were added to the banned-claims list.

**Verification:** `node --test test/projects.test.js`: 11/11 passed. `npm test`: 152 tests, 151 passed, 0 failed, 1 skipped (Windows SIGTERM), with email mocked or disabled. `git diff --check` was clean, and a phrase scan of `src`, `views`, README, and AGENTS found no remaining overstated wording. No browser re-run, because only text changed and no layout or styling did. No extraction run, no email, no commit.
