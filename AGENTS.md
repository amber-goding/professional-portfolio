# AGENTS.md

Shared instructions for AI coding agents working in this repository. This file is authoritative. Tool-specific files (such as `CLAUDE.md`) import it instead of copying it.

## Project

Amber Goding’s professional portfolio and services website showcases her application development, AI integration, and workflow automation capabilities. It serves employers, prospective clients, and collaborators. It will be the long-term professional site at **ambergoding.com**.

**Current status (2026-11-12):**
- **Committed:** Milestone 1, the foundation (`f527181`); Milestone 2, the homepage, visual system, and AG branding (`c305a46`); the private contact form with Resend delivery (`d1582eb`); the `/services` page (`7b3fbaf`); the `/about` page (`ddbba93`); the internal portfolio project inventory (`a010517`); the Reentry Resource Extractor case study with its accuracy correction (`562168a`); the Catering Concierge case study (`2d02143`); and the HuntSomewhere case study (`8d07055`, the latest commit at the start of the Savvy implementation).
- **Contact email, verified locally (owner-reported manual checks, not automated):**
  - The owner created a Resend account and verified the sending domain `mail.ambergoding.com` through Spaceship DNS.
  - A real inquiry submitted through the local contact form arrived in the owner's Gmail inbox, and its Reply-To pointed to the visitor address entered in the form.
- **Still unverified:** email delivery from Railway (production variables, the deployed environment) and the deployment itself. Nothing has been deployed.
- **Implemented, not committed:**
  - The selected **"Cool & savvy" design** across every page, plus the homepage technology section and the motion system (see Design below).
  - The internal design previews in `docs/design-previews/`.
  - Homepage order: Reentry Resource Extractor, Catering Concierge, HuntSomewhere. The development placeholder has been removed.
- Temporary content is listed in README.md under "Temporary content". Paid plans, further DNS changes, and deployment are **not approved**; see [Pending decisions](#pending-decisions).

**Design: "Cool & savvy" is the selected direction (2026-11-12).** The owner chose it from the design previews.
- **What governs:** `docs/design-previews/savvy.html` with its screenshots `docs/design-previews/screenshots/savvy-desktop.webp` and `savvy-phone.webp`. These take precedence over older visual instructions (the teal-cream-gold reference and the earlier palette).
- **Final review still pending:** the owner's final visual review of the implemented site, and confirmation of the "ag." wordmark as the final logo (see [Pending decisions](#pending-decisions)). The favicon already matches the wordmark.
- **Scope discipline:** don't make unrelated visual changes while working on other tasks.

**Commands:** `npm ci` (install), `npm start` (run), `npm run dev` (watch mode), `npm test` (all tests), `node --test test/<file>.test.js` (one file). See [README.md](README.md) for setup and the project layout.

## Approved direction

**Audience:** employers hiring developers or AI application builders; small businesses, freelancers, and service providers looking for practical applications and automation; potential collaborators.

**Positioning:** a full-stack developer and AI-augmented builder (the owner's own wording, from her bio, 2026-11-12) who turns real-world problems into useful tools, explains decisions clearly, and uses AI thoughtfully. Service areas stay application development, AI integration, and workflow automation.

**Pages:** Home/Portfolio, Services, About, Contact, and one case-study page per project. **Services (`/services`) and About are approved as separate pages**, not optional extras. The homepage keeps its short overview sections as well.

**Design and palette ("Cool & savvy", selected 2026-11-12):** match `docs/design-previews/savvy.html` and its two screenshots.
- **What to keep:**
  - the oversized Space Grotesk hero with italic Playfair accents;
  - rounded navigation and buttons;
  - sticker tags;
  - the coral ticker;
  - tilted project screenshots with outlined numerals;
  - bone services cards with hard ink shadows;
  - the portrait in the hero intro and the About section;
  - contrasting dark, bone, and coral sections;
  - the full-width coral contact invitation.
- **Supersedes:** the previous charcoal, teal, turquoise, cream, and gold palette, and the teal-cream-gold reference.

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#0E0E12` | Page background |
| Ink 2 | `#17171D` | Raised dark surfaces, technology section |
| Bone | `#F2EDE4` | Text on dark, light sections |
| Coral | `#FF5F45` | Signature accent on dark, fills (ink text on coral) |
| Coral dark | `#B3321E` | Coral text on bone |
| Lilac | `#B9A8FF` | Secondary accent on dark |
| Violet | `#5A3FD1` | Lilac's counterpart on bone |
| Muted / muted bone | `#A9A6B2` / `#55525C` | Secondary text on dark / on bone |

- **Type:** Space Grotesk (display), DM Sans (body), Playfair Display (italic accents). All are self-hosted, under the SIL OFL.
- **Branding (provisional):** the site uses the Savvy preview's wordmark: a bone circle with a lowercase "ag", then "amber goding" with a coral full stop. It's built in HTML and CSS, and the brand link carries `aria-label="Amber Goding, home"`.
  - The intertwined AG monogram was rejected, and no animated replacement has been selected.
  - **Favicon:** `public/favicon.svg` (with `public/apple-touch-icon.png`) matches the wordmark: a bone "ag" and coral full stop on an ink circle, as vector paths. Confirming the wordmark as the final logo is still pending. The `public/brand/` files stay intact and unused.

**Design expectations:**
- Distinctive, polished, professional presentation with bold typography, strong visual focal points, and thoughtful layouts.
- Fully responsive across phones, tablets, and desktops.
- Smooth, purposeful transitions that respect `prefers-reduced-motion`. Use transform and opacity: about 150–250ms for small interactions and 350–600ms for entrances, with short travel. Content stays visible if JavaScript fails. No scroll hijacking, custom cursors, or loading gates.
- Accessible navigation, full keyboard operation, visible focus states, readable contrast (WCAG AA), and a clear content hierarchy.
- No unnecessary animation, dependencies, complexity, or unrelated features.

**Technology section (homepage):** content lives in `src/content/stack.js`. Every tool and project mapping must be backed by repository evidence.
- **Groups:** Interfaces, Data, AI & automation, Development & delivery.
- **Zapier vs OpenAI:** Zapier's AI review (Catering Concierge) stays distinct from the direct OpenAI API calls (Reentry Resource Extractor, HuntSomewhere).
- **Resend** is identified as this portfolio's contact system.
- **AI development assistants** (Claude Code, Codex) appear only in the separate "Tools I build with" block, never as technologies in the applications.
- **No claims:** no ratings, percentages, or experience claims.

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
- Show 3–4 real projects, each with the problem, solution, results, and working app or repository links. Candidates: HuntSomewhere, Ever After Planner, Reentry Resource Extractor, Catering Concierge. **Approved so far: Reentry Resource Extractor, Catering Concierge, and HuntSomewhere** (see [Decisions](#decisions)). Ever After Planner is not approved. The others stay unapproved until the owner records them there.
- Case studies live at `/projects/<slug>`, generated from `src/content/projects.js`. Only entries marked `published: true` render; every other slug returns the standard 404. Screenshots come from the deployed application, and any screenshot that uses an app's own sample or demonstration data is captioned as sample data, never presented as a live result.
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

- Final visual review of the implemented "Cool & savvy" design across all pages.
- **Final logo confirmation.**
  - The site uses Savvy's "ag." wordmark, and the favicon now matches it (owner request, 2026-11-12).
  - The rejected AG monogram files remain unused in `public/brand/`.
- Which host is canonical for the site (apex or `www`). DNS for `ambergoding.com` is hosted at Spaceship (owner-reported). Whether Spaceship supports the CNAME flattening or ALIAS record Railway needs for the apex hasn't been checked.
- Railway plan.
- Whether to feature a fourth project. Reentry Resource Extractor, Catering Concierge, and HuntSomewhere are approved; Ever After Planner is not. The internal inventory in README.md recommends a set, but it isn't approved.
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
- 2026-11-12: **About page content approved** by the owner:
  - **Copy:** the page title "About Amber", the heading "Thoughtful tools start with understanding people.", the introduction and background paragraphs, and the "How I work" section, exactly as stored in `src/content/about.js`. Don't edit, extend, or add claims to it without approval. The owner chose not to include a specific past-work anecdote.
  - **Portrait:** the owner-supplied photo, resized for the web without retouching, with metadata stripped (`public/images/amber-goding-portrait-*`). Don't retouch, regenerate, or replace it.
  - **Professional links:** LinkedIn `https://www.linkedin.com/in/amber-goding/` and GitHub `https://github.com/amber-goding`. They are used as links only; their contents have not been reviewed, so don't describe them.
  - The homepage About teaser and the About page's closing contact invitation reuse earlier wording that remains provisional. The overall styling remains provisional.
- 2026-11-12: **Reentry Resource Extractor approved as the first portfolio entry.**
  - **Live application:** `https://reentry-resource-extractor-production.up.railway.app/`. **Repository:** `https://github.com/amber-goding/reentry-resource-extractor`. The owner supplied the deployment URL. Codex opened the site and confirmed the interface loads; no AI extraction was run.
  - **Approved contribution wording, verbatim:** “I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined the interface and human-verification process.”
  - **Case study:** `/projects/reentry-resource-extractor`, written from the inspected source and the deployed interface (README "Portfolio project planning"). It states that missing details stay "Not Found", that extracted information needs human review, and that matching quoted evidence is not proof an interpretation is correct. It claims no measured time savings, accuracy, adoption, or client outcomes, and does not present saving, exporting, publishing, or site crawling as implemented.
  - **Screenshots:** captured from the deployed application on 2026-11-12 without modifying it: the start screen, and the review interface showing the app's own development sample results (captioned as sample data, not a live extraction). "Analyze Program" was not submitted and no personal information was entered.
  - **Homepage:** the first project slot now shows this project with a real screenshot and a link to the case study. The remaining three slots are still development placeholders.
  - The other three candidates are **not** approved. Styling remains provisional.
- 2026-11-12: **Catering Concierge approved as the second portfolio entry.**
  - **Live application:** `https://week-8-build-catering-concierge-production.up.railway.app/`. **Repository:** `https://github.com/amber-goding/week-8-build-catering-concierge`. Keep this exact URL, but don't use the repository name in public prose.
  - **Approved contribution wording, verbatim:** the same sentence as for Reentry Resource Extractor: “I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined the interface and human-verification process.”
  - **Case study:** `/projects/catering-concierge`, written from the committed source on that repository's `main` (`67f03bc`) and the deployed interface viewed signed out.
    - It states that the AI review runs in Zapier and the app makes no AI calls.
    - It presents the import endpoint's controls as specific checks, not guarantees.
    - It lists menus, quotes, email, events, settings, and analytics as planned.
    - It describes manual inquiry entry as in development: that work is uncommitted on a feature branch and not deployed.
    - Live checks recorded in that repository's history are labelled as historical.
  - **Screenshots:** captured signed out from the deployed app on 2026-11-12 with navigation only (no clicks, inputs, sign-in, Zapier triggers, or AI calls).
    - The dashboard on desktop and phone, showing its built-in fictional sample data, captioned as sample data.
    - The sign-in page.
    - The sign-in-only Inquiries screen couldn't be captured and isn't pictured.
  - **Homepage:** the second slot (formerly the Automation placeholder) shows this project and links to the case study.
  - HuntSomewhere and Ever After Planner remain **unapproved**. Styling remains provisional.
- 2026-11-12: **HuntSomewhere approved as the third portfolio entry.**
  - **Live application (owner-confirmed):** `https://week-7-build-huntsomewhere-production.up.railway.app/`. **Repository:** `https://github.com/amber-goding/week-7-build-HuntSomewhere`. Keep this exact URL, but don't use the repository name in public prose.
  - **Approved contribution wording, verbatim:** “I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined how users review suggested trip preferences and understand the limits of the location data.”
  - **Authorized:** ONE fictional demonstration trip through the deployed manual form, without AI. It was created once, on 2026-11-12, at `/trips/a708ed60-d49a-4d09-8dd0-4f7cff2b4771` (Garrett County, white-tailed deer, vertical bow, 2026-11-14 to 2026-11-15). Don't create more, and don't delete it without approval.
  - **Not authorized:** live use of the AI suggestion feature, or any paid AI call. The AI step is described from source inspection only.
  - **Case study:** `/projects/huntsomewhere`, written from the committed `main` (`5d4c484`) and the confirmed deployment.
    - Saved trips are described as reachable by anyone with the link, not as private.
    - The AI control is described as a database-enforced request limit, not a spending cap.
    - Model instructions, code checks, and live-verified behavior are kept distinct.
    - Matching is county only and doesn't establish access, eligibility, seasons, or species and method suitability.
    - Accounts, maps, private listings, permission requests, and messaging are listed as planned.
    - The review trail is in `docs/huntsomewhere-case-study-draft.md`.
  - **Screenshots:** from the deployed app.
    - The `/areas` list (real public data) is the homepage card image.
    - The planner with the demonstration options, captioned "Demonstration input".
    - The demonstration trip and its county results, captioned "Demonstration trip".
  - Ever After Planner remains **unapproved**. Styling remains provisional.
- 2026-11-12: **"Cool & savvy" selected as the site design**, from the internal design previews.
  - **References:** `docs/design-previews/savvy.html` plus `savvy-desktop.webp` and `savvy-phone.webp`. They take precedence over older visual instructions.
  - **Palette and type:** Savvy's palette and typography replace the charcoal, teal, turquoise, cream, and gold palette.
  - **Implemented** across the homepage, Services, About, Contact, all three case studies, shared navigation, footer, and error pages, with:
    - a homepage technology section (after Services, before About);
    - a cohesive motion system that respects reduced motion.
  - **Logo:** the intertwined AG monogram was rejected and no animated replacement was selected. Savvy's "ag." wordmark is used provisionally; the final logo and favicon remain pending.
  - **Portrait:** Amber's portrait appears in the homepage hero and About section, and on `/about`.
  - **Still to do:** the owner's final visual review.
- 2026-11-12: **Owner-requested refinements to the Savvy site.**
  - **Favicon:** replaced to match the wordmark. A bone "ag" with a coral full stop on an ink circle, as pure vector paths outlined from Space Grotesk Bold, plus a 180×180 `apple-touch-icon.png`. The `public/brand/` files are untouched.
  - **About bio:** replaced with the owner's own bio, reworded to the site's voice. It's now a headed "My story" section with three chapters (the path, the mindset, the craft) and no added claims. The approved heading and "How I work" copy are unchanged.
  - **Role wording:** "Full-Stack Developer & AI-Augmented Builder" (from the bio) is used site-wide: titles, footer, homepage and About introductions, and descriptions.
  - **Case studies:** public verification notes ("This write-up is based on…") were removed. Sample-data and demonstration labels remain on screenshots; the verification evidence stays in README and these Decisions.
  - **Copy pass:** every page was reviewed for clarity. One unsupported capability ("search across your own documents") was removed from the AI integration building blocks.
  - **Deployment readiness:** baseline security headers were added, and a deploy checklist recorded in README. Deployment itself still needs approval.
