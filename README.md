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
| `npm run dev` | Starts the server and restarts it when files change (`node --watch`) |
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

The app doesn't need any other environment variables yet. `.env.example` lists the planned names using placeholders only.

## How it works

| Path | Purpose |
| --- | --- |
| `server.js` | Production entry point. Reads `PORT`, listens on `0.0.0.0`, and shuts down cleanly on `SIGTERM`/`SIGINT` |
| `src/app.js` | Builds the Express app (routes, views, static files, 404 and error handling) without starting a listener, so tests can use it directly |
| `src/config.js` | Port parsing and validation |
| `src/content/home.js` | Homepage content: navigation, services, project placeholders, and principles |
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
| `PORT` | Used now (optional locally) | Port to listen on. Defaults to `3000`. Railway sets it automatically. |
| `RESEND_API_KEY` | **Not implemented**. Provider not yet approved | Email provider API key for the contact form |
| `CONTACT_TO_EMAIL` | **Not implemented** | Inbox that receives contact-form inquiries |
| `CONTACT_FROM_EMAIL` | **Not implemented** | Verified sender address for contact-form email |

Real values belong in Railway's service variables or a local `.env` file, which Git ignores. Never commit them.

## Project status

**Milestone 1 (application foundation):** Express server with validated `PORT`, `0.0.0.0` binding, and graceful shutdown; EJS partials; static files served only from `public/`; `/healthz`; HTML 404 page; safe error handling; tests.

**Milestone 2 (visual foundation and homepage):**

- Self-hosted fonts and a shared visual system built from the approved palette
- Header with the AG logo (uppercase serif monogram and spaced name; see "Brand assets"), in-page navigation (Work, Services, About, Contact), and a mobile menu button. The button has the correct `aria-expanded` state, closes with Escape, returns focus, and falls back to visible links without JavaScript.
- Hero with the bold headline, the CSS ribbon sculpture (decorative, hidden from assistive technology), and links to Work and Contact
- Service band, staggered selected-work layout (placeholders only), services overview, cream About teaser, contact invitation with a working `mailto:` link, and footer
- Hover, focus, and menu transitions, all disabled under `prefers-reduced-motion`. No continuous animation.

### Temporary content (must be replaced or confirmed before launch)

- **Hero wording** (provisional, from the visual reference): "Human insight. Technical possibility.", "Make complex feel simple.", "Useful applications. Thoughtful AI. Connected workflows. Built around people.", "Designed with intention. Built to be used."
- **Hero artwork labels:** "Idea", "Reality", "The space between idea & execution"
- **Selected work:** all four project slots are development placeholders, labeled on the page, with concept art rather than screenshots, no links, and invented headings ("Purpose in every detail." and the others). They are defined in `src/content/home.js`.
- **Work introduction:** "Less friction. More possibility." and the paragraph below it
- **Services:** the heading "Practical tools for real work." and the three capability descriptions
- **About:** the heading "Curiosity meets follow-through.", the two introductory sentences, and the three principles. These are drawn from the approved positioning but still need Amber's own biography.
- **Contact:** the heading "Let's make it happen." and its supporting sentence. The `mailto:` link is the interim contact method only.

### Remaining before launch

- Real projects (3–4) with verified descriptions, visuals, live/repository links, and case-study pages
- Services, About, and Contact pages, if kept separate from the homepage sections
- Final biography, photo, and professional links
- Contact form with server-side validation, spam protection, duplicate prevention, and confirmed email delivery (provider still to be approved)
- Social/Open Graph metadata, `robots.txt`, and a sitemap
- Manual checks on real phones and with a screen reader
- Railway deployment, the `ambergoding.com` and `www` domains, HTTPS, and email sender verification

Project requirements and approved decisions are recorded in [AGENTS.md](AGENTS.md).
