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
| `views/` | EJS templates. `partials/header.ejs` and `partials/footer.ejs` are shared by every page |
| `public/` | The **only** directory served as static files (CSS, icons, and later images) |
| `test/` | Tests that make real HTTP requests to the app |

Routes:

- `GET /`: homepage
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

**Milestone 1 (application foundation) includes:**

- Express server with validated `PORT`, `0.0.0.0` binding, and graceful shutdown
- EJS templates with shared header and footer partials
- A minimal homepage with the approved name, positioning, and colors
- Static files served only from `public/`
- `/healthz`, an HTML 404 page, and safe error handling
- Automated tests for all of the above

**Remaining before launch:**

- Design system, typography, and full visual identity, including the hero artwork
- Services, About, Contact, and project case-study pages, with navigation
- Contact form with server-side validation, spam protection, and email delivery (provider still to be approved)
- Final content, project visuals, and verified project links
- Responsive, keyboard, contrast, and reduced-motion checks in real browsers
- Railway deployment, the `ambergoding.com` and `www` domains, HTTPS, and email sender verification

Project requirements and approved decisions are recorded in [AGENTS.md](AGENTS.md).
