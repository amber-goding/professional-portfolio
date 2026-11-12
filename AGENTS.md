# AGENTS.md

Shared instructions for AI coding agents working in this repository. This file is authoritative. Tool-specific files (such as `CLAUDE.md`) import it instead of copying it.

## Project

Amber Goding’s professional portfolio and services website showcases her application development, AI integration, and workflow automation capabilities. It serves employers, prospective clients, and collaborators. It will be the long-term professional site at **ambergoding.com**.

**Current status (2026-11-12):**
- **Committed:** Milestone 1, the foundation (`f527181`); Milestone 2, the homepage, visual system, and AG branding (`c305a46`); and the private contact form with Resend delivery (`d1582eb`).
- **Contact email, verified locally (owner-reported manual checks, not automated):**
  - The owner created a Resend account and verified the sending domain `mail.ambergoding.com` through Spaceship DNS.
  - A real inquiry submitted through the local contact form arrived in the owner's Gmail inbox, and its Reply-To pointed to the visitor address entered in the form.
- **Still unverified:** email delivery from Railway (production variables, the deployed environment) and the deployment itself. Nothing has been deployed.
- **Implemented, not committed:** the `/services` page.
- Temporary content is listed in README.md under "Temporary content". Paid plans, further DNS changes, and deployment are **not approved**; see [Pending decisions](#pending-decisions).

**Visual presentation is provisional.** The current website styling has **not** received the owner's final approval. The approved palette and the AG branding direction stand, but the overall visual presentation needs another dedicated design review before launch. Until then, don't make unrelated visual changes while working on other tasks.

**Commands:** `npm ci` (install), `npm start` (run), `npm run dev` (watch mode), `npm test` (all tests), `node --test test/<file>.test.js` (one file). See [README.md](README.md) for setup and the project layout.

## Approved direction

**Audience:** employers hiring developers or AI application builders; small businesses, freelancers, and service providers looking for practical applications and automation; potential collaborators.

**Positioning:** a practical application and automation builder who turns real-world problems into useful tools, explains decisions clearly, and uses AI thoughtfully.

**Pages:** Home/Portfolio, Services, About, Contact, and one case-study page per project. **Services (`/services`) and About are approved as separate pages**, not optional extras. The homepage keeps its short overview sections as well.

**Branding:** the website palette below is approved. The logo direction is the **uppercase AG monogram** (revised 2026-11-12; it replaces the earlier lowercase "ag"):
- An elegant, intertwined uppercase A and G in high-contrast serif letterforms, with a refined sweeping flourish and a small, restrained four-point sparkle, plus a spacious, editorial uppercase name treatment ("AMBER GODING").
- Character comes from the brand board at `C:\Users\amber\AppData\Local\Temp\codex-clipboard-690df169-133b-4aa3-8366-1b9a3d45c2b0.png`. Use only its logo character, **not** its blush-pink palette. Logo colors come from the website palette: cream or charcoal letters, a gold flourish on dark backgrounds or deep teal on light, and a gold sparkle.
- Assets are pure vector paths in `public/brand/` (`ag-monogram.svg`, `ag-logo-horizontal.svg`, each with a `-reversed` version for dark backgrounds) and `public/favicon.svg`, which is simplified: heavier letters, a short gold swash, and no sparkle. Letterforms were converted from Playfair Display glyph outlines (SIL OFL 1.1), so no font loads at runtime. Use these files rather than re-creating the monogram in text.
- A linked logo needs an accessible name, such as `alt="Amber Goding, home"`. Decorative monogram placements use `alt=""` inside `aria-hidden` artwork.

| Token | Hex |
| --- | --- |
| Charcoal | `#151A1C` |
| Deep teal | `#176B66` |
| Turquoise | `#35D6CB` |
| Warm cream | `#FAF3E7` |
| Amber-gold (restrained accents) | `#E5B869` |

**Visual reference:** `C:\Users\amber\.codex\visualizations\2026\11\12\01a1cdb7-7b83-78b0-8957-5e063041aa15\teal-cream-gold-studio.html`. It is a visual concept, not production code. Keep its identity and bold direction (its lowercase "ag" monogram is superseded by the uppercase AG monogram above): the sculptural ribbon art in the hero, oversized Space Grotesk headlines with italic serif accents, a charcoal base, a deep-teal service band, a cream about section, and amber-gold details. Its wording and project illustrations are provisional. Its 6–9px label sizes are too small for production and must be raised to readable sizes.

**Design expectations:**
- Distinctive, polished, professional presentation with bold typography, strong visual focal points, and thoughtful layouts.
- Fully responsive across phones, tablets, and desktops.
- Smooth, purposeful transitions that respect `prefers-reduced-motion`.
- Accessible navigation, full keyboard operation, visible focus states, readable contrast (WCAG AA), and a clear content hierarchy.
- No unnecessary animation, dependencies, complexity, or unrelated features.

## Functional requirements

**Contact form:**
- Delivers inquiries to the owner's inbox, set only through the server-side `CONTACT_TO_EMAIL` variable.
- Server-side validation, practical spam protection, and duplicate-submission prevention.
- Clear pending, success, and error states. Entered information is kept when a submission fails.
- Success is shown only after the server confirms the email provider accepted the message. Actual inbox delivery is verified separately before launch.
- Credentials stay server-side. The visitor's address goes in Reply-To, and mail is sent from a properly verified sender identity.

**Privacy (required):** the owner's receiving address must **never** appear in public-facing content or browser-delivered data. That rules out HTML, JavaScript, CSS, form fields, metadata, JSON responses, error messages, browser logs, and `mailto:` links. The recipient (`CONTACT_TO_EMAIL`), the verified sender (`CONTACT_FROM_EMAIL`), and `RESEND_API_KEY` live only in server-side environment configuration: Railway variables, or an untracked local `.env`. Tracked files such as `.env.example`, docs, and tests use example addresses only (`example.com`, `example.test`). Server logs must not include these values or visitors' addresses or message content. `test/contact.test.js` checks every public page, asset, and response for leaks.

**Deployment:**
- Built for Railway, with reproducible build and start commands. The server listens on Railway's `PORT` and binds to all interfaces.
- Custom domain `ambergoding.com` plus `www.ambergoding.com`, served over HTTPS.
- Required environment variables are documented with placeholders only.
- Never deploy, change DNS, create paid resources, or incur charges without the owner's approval.

**Portfolio:**
- Show 3–4 real projects, each with the problem, solution, results, and working app or repository links. Candidates: HuntSomewhere, Ever After Planner, Reentry Resource Extractor, Catering Concierge.
- Plan around the completed versions intended for launch. Track unfinished work in an internal checklist, and reconcile every public description with verified functionality before publishing.
- Follow the content rules below for every project description.

**Launch standard:** Placeholders are allowed during approved development milestones. At launch the site needs complete content, real project visuals, working links, working email delivery, and a verified deployment. Nothing unfinished may be presented as complete.

## Content and communication rules

- Present Amber as an application and automation builder with prior development training and experience.
- Emphasize demonstrated capabilities, project work, problem-solving, and transferable experience.
- Do not mention a bootcamp, curriculum, student status, or beginner status in public-facing content or metadata.
- Never invent experience, credentials, features, metrics, testimonials, clients, or outcomes.
- Explain technical decisions clearly so Amber remains an informed decision-maker.

## Workflow rules

- Work on one clearly scoped task at a time.
- Explain meaningful changes and wait for approval before implementing them.
- Inspect existing code and `git status` before making changes.
- Never overwrite or discard existing work without permission.
- Favor simple, maintainable solutions and avoid scope expansion.
- Verify changes with appropriate checks.
- Report exactly what changed, what was tested, and what remains unverified.
- Never claim a test, integration, or deployment succeeded without evidence.
- Never expose or commit secrets. Do not ask for secrets in chat or print them in logs. Keep real values in untracked `.env` files or Railway variables.
- Do not commit, push, merge, or deploy without explicit approval.
- After each verified implementation milestone, recommend a logical Git checkpoint and a concise commit message.
- Record important approved decisions in [Decisions](#decisions) below or in concise project docs.

## Pending decisions

These are proposed or open items. They are **not approved** until they are recorded under Decisions.

- Final visual presentation (dedicated design review required before launch). The current styling is provisional and needs the owner's final approval.
- Which host is canonical for the site (apex or `www`). DNS for `ambergoding.com` is hosted at Spaceship (owner-reported). Whether Spaceship supports the CNAME flattening or ALIAS record Railway needs for the apex hasn't been checked.
- Railway plan.
- Which 3–4 projects to feature.
- Whether to include a résumé.

## Decisions

Approved decisions, dated. Add new entries at the end.

- 2026-11-12: Website direction, audience, positioning, pages, branding colors, visual reference, and functional and launch requirements approved as recorded above.
- 2026-11-12: Project description and content and communication rules approved as recorded above.
- 2026-11-12: Architecture approved: a supported Node.js LTS release (`engines.node` is `24.x`), Express with server-rendered EJS templates, plain CSS and minimal vanilla JavaScript, no frontend compilation step, and Node's built-in test runner. The email provider, service accounts, paid plans, DNS changes, and deployment remain unapproved.
- 2026-11-12: Branding revised: the uppercase, intertwined serif AG monogram with flourish and sparkle replaces the lowercase "ag". The website palette is unchanged, and the brand board's blush-pink palette is not adopted. See Branding above.
- 2026-11-12: The current visual presentation is **provisional**, not final. The palette and branding direction remain approved, and a dedicated design review is required before launch.
- 2026-11-12: Contact delivery uses **Resend's HTTPS API**, approved for implementation. The recipient is configured only via `CONTACT_TO_EMAIL` and must never reach the browser (see Privacy). Creating a Resend account, verifying a sender domain, and changing DNS still need explicit approval.
- 2026-11-12: Owner-reported: a Resend account was created and the sender domain `mail.ambergoding.com` verified through Spaceship DNS. A real local test inquiry arrived in the owner's Gmail with the correct Reply-To. Railway delivery remains unverified.
- 2026-11-12: Services and About are approved as **separate pages**. `/services` covers only the three established service areas: application development, AI integration, and workflow automation.
