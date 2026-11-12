# HuntSomewhere: case-study draft and approval record (internal)

> **INTERNAL.**
> - **Status, 2026-11-12:** approved by the owner and implemented at `/projects/huntsomewhere`, not yet committed. The published copy lives in `src/content/projects.js`, so this file records the review trail and is not the public text.
> - **First version:** written for review in prompt-history entry 15.
> - **This version:** records the owner's decisions and the corrections made before publication (entry 16).

## Owner decisions (confirmed 2026-11-12)

| Decision | Outcome |
| --- | --- |
| Inclusion | **Approved** as the third published project. Homepage order: Reentry Resource Extractor, Catering Concierge, HuntSomewhere. |
| Live URL | **Confirmed:** `https://week-7-build-huntsomewhere-production.up.railway.app/` |
| Repository | `https://github.com/amber-goding/week-7-build-HuntSomewhere`, kept exactly |
| Contribution wording, used verbatim | “I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined how users review suggested trip preferences and understand the limits of the location data.” This replaces the sentence the draft proposed. |
| Demonstration trip | **One** fictional trip was authorized through the manual form, without AI. It was created once, and has **not** been deleted; deleting it needs approval. |
| AI suggestion step | **Not authorized** for live use. It's described from source inspection only, and no AI-result screenshot exists. |
| Landing headline | Not used as evidence and not pictured. Any change to it belongs in the HuntSomewhere repository and is outside this task. |

## Corrections made before publication

The first draft contained claims that went beyond the evidence. Each is corrected in the published copy:

- **"Private link" / "private by design".** Now: saved trips use a randomly generated link that **anyone who has the link can view**. They aren't protected by an account. Note that the live planner's own intro still says "private link"; that wording sits in the HuntSomewhere repository.
- **"A shared AI allowance that can't be overspent".** Now: "**a database-enforced limit on AI requests**". A single conditional update reserves one request and succeeds only while requests remain, so simultaneous requests can't take the count past the limit. Reservations aren't released. No monetary cap is claimed.
- **"Season terms and vague dates never become dates".** Now separated into:
  - the **model instruction**: leave season terms and vague dates unresolved;
  - the **code-enforced check**: dates that aren't real or are out of order become unresolved;
  - and neither was **exercised live**, because AI wasn't run.
- **AI wording generally.** It now distinguishes what the model is instructed to do from what code validates (strict schema, zod against the allowed lists, group expansion by code), and states that the AI step wasn't tested live.
- **The automated check scripts** exist in the repository. They're described as not re-run, and they're no longer listed under "Implemented".

## Evidence

**Repository (read-only, `git --no-optional-locks`, 2026-11-12):**
- `main` = `origin/main` = `5d4c484`, with a clean working tree.
- Clerk sign-in exists only on the unmerged branches `58e3509` and `668444d`, so it's excluded from the implemented scope.

| Claim | Source |
| --- | --- |
| Model instructions, strict schema, zod validation, failure messages, 300 characters, 10 s timeout | `lib/trips/ai.ts` |
| Group expansion and invalid or out-of-order dates made unresolved, both by code | `lib/trips/preferences.ts` (`expand`, `toSuggestion`) |
| Conditional reservation, never released | `lib/trips/store.ts` (`reserveAiCall`); `lib/trips/ai.ts` comment |
| Off switch | `app/plan/actions.ts` (`AI_DISABLED`), plus the allowance `enabled` flag |
| Description not stored; trips under a UUID, validated on save and load | `app/plan/actions.ts`; `lib/trips/store.ts` (`createTrip`, `getTrip`) |
| Link access stated in the app | `app/plan/trip-planner.tsx` (save section); the saved-trip page text |
| Six areas, four counties, source fields only, provenance | `lib/areas/curated.ts`; `data/sources/md-imap-dnr-owned-lands/2026-10-30/` |
| County-only and not-confirmed notices | `app/trips/[id]/areas/page.tsx`; `app/areas/area-card.tsx` |

**Live checks on the confirmed deployment, 2026-11-12 (scratchpad `hunt-capture.mjs`, every request logged):**

- **Pages loaded:** `/areas` (all six areas, coverage and ownership notices), `/sources`, and `/plan`.
- **Demonstration trip:** created once through the manual form:
  - Garrett County, White-tailed deer, Vertical bow, 2026-11-14 to 2026-11-15, with the description left empty and the AI button never pressed;
  - exactly one non-GET request: the save server action (`POST /plan`).
- **Trip link:** `https://week-7-build-huntsomewhere-production.up.railway.app/trips/a708ed60-d49a-4d09-8dd0-4f7cff2b4771`
  - It shows the saved preferences and the app's note that anyone with the link can view them.
  - `/areas` from the trip lists exactly **Mt. Nebo WMA** and **Cunningham Swamp WMA**, with the county-only notice. This matches the source, which places those two areas in Garrett County.

**Not verified:**
- the AI suggestion step (not authorized);
- the no-results and multi-county trip states on the live site;
- the repository's check scripts (not re-run).

## Screenshots used (`public/images/projects/huntsomewhere/`)

| File | Content | Label |
| --- | --- | --- |
| `public-areas-desktop` | `/areas`, real public source data. Used as the homepage card image | Card image, no flag |
| `demo-preferences-desktop` | Planner review and save steps with the demonstration options, before saving | "Demonstration input" |
| `demo-trip-areas-desktop` | County-matched results for the demonstration trip | "Demonstration trip" |
| `demo-trip-phone` | The saved demonstration trip on a phone | "Demonstration trip" |

## Remaining for the owner

- Review the published case-study copy.
- Decide whether to keep or delete the demonstration trip. Deleting it needs approval and a database change in HuntSomewhere.
- Optionally, correct the live planner's "private link" wording in the HuntSomewhere repository.
