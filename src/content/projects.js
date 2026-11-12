// Content for published portfolio case studies (/projects/<slug>).
//
// Each entry is written from the project's inspected source code and its
// deployed interface (see README "Portfolio project planning"). Only entries
// with `published: true` are rendered; any other slug returns the standard 404.
//
// Rules for every entry (AGENTS.md): describe verified functionality only, and
// never claim measured results, accuracy, adoption, clients, or outcomes. The
// `contribution` wording is approved by the owner and must stay verbatim.

const reentryImages = '/images/projects/reentry-resource-extractor';

// Captured from the deployed application on 2026-11-12 (start screen, no data
// entered). Resized from a 2x capture; metadata stripped.
const reentryStartScreen = {
  base: `${reentryImages}/start-screen`,
  widths: [1600, 800],
  fallbackWidth: 1600,
  width: 1600,
  height: 1000,
  alt: 'Start screen of the Reentry Resource Extractor: the title, a short description, and a three-step pathway labelled Retrieve, Extract, and Review, with the form for a program website address beginning below.',
  caption: 'The start screen of the deployed application, captured on 2026-11-12: the three-step pathway and the form that takes a public website address.',
};

export const projects = [
  {
    slug: 'reentry-resource-extractor',
    published: true,
    approvedOn: '2026-11-12',
    title: 'Reentry Resource Extractor',
    category: 'AI integration',
    description:
      'Case study: Reentry Resource Extractor turns a public reentry-program web page into a structured draft listing, with AI extraction that must cite a quote found on the page and human review of every field.',
    tagline:
      'Turns one public reentry-program web page into a structured draft listing. The model is instructed to use only the page’s text, the server keeps a value only when its quoted evidence appears in that text, and a person reviews every field.',
    audience:
      'Built for managers of transitional housing, halfway houses, and reentry programs who need complete and correct listings assembled from information that already sits on their public websites.',
    status: 'Deployed on Railway. Analyzes one page at a time; reviewed values are not saved.',
    stackSummary: 'JavaScript with Vite, a Node.js server, cheerio, and the OpenAI Responses API, deployed on Railway.',
    // Approved by the owner on 2026-11-12. Do not edit.
    contribution:
      'I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined the interface and human-verification process.',
    contributionHeading: { lead: 'What I', accent: 'contributed.' },
    links: {
      live: { label: 'Open the live application', href: 'https://reentry-resource-extractor-production.up.railway.app/' },
      repo: { label: 'View the repository', href: 'https://github.com/amber-goding/reentry-resource-extractor' },
    },
    card: {
      summary:
        'Turns a public reentry-program web page into a draft listing. The model is instructed to use only the page’s text, the server checks that each evidence quote appears on the page, and a person reviews every field.',
      image: reentryStartScreen,
    },
    problem: {
      heading: { lead: 'Scattered details,', accent: 'real consequences.' },
      paragraphs: [
        'Reentry program listings are hard to create well. The details that matter most to someone leaving incarceration, such as eligibility, cost, length of stay, substance-use and medication policies, and how to apply, are usually scattered across a program’s public website rather than organized in one place. Directory listings end up incomplete, inconsistent, or out of date.',
        'The obvious shortcut, asking an AI model to summarize the site, creates a worse problem: invented or misread details presented as fact. For this audience a wrong policy or phone number has real consequences, so the project treats incorrect program information being mistaken for fact as the main failure to design against. The tool takes on the tedious part, finding and organizing the details, without removing the person who is accountable for them.',
      ],
    },
    workflow: {
      heading: { lead: 'Retrieve, extract,', accent: 'then review.' },
      steps: [
        {
          title: 'Retrieve',
          text: 'The manager enters the address of one public web page. The server fetches it, refuses private and internal addresses, limits the page size and the number of redirects, and reduces the HTML to readable text, which is shown back to the manager before anything else happens.',
        },
        {
          title: 'Extract',
          text: 'That text goes to the OpenAI Responses API with a strict JSON schema covering 21 listing fields, from program name and contact details to eligibility, cost, length of stay, and the application process. The instructions tell the model to use only the supplied text, to treat it as untrusted content rather than commands, and not to guess. Fields the model reports as not found, and values whose evidence quote can’t be matched in the page text, are shown as Not Found.',
        },
        {
          title: 'Review',
          text: 'Each field shows the AI result, the quoted source evidence, and a separate manager-reviewed value. The manager confirms, edits, or clears every field, and its status moves from Unreviewed to Confirmed or Edited. The statuses show which fields a person has checked and which are still unreviewed.',
        },
      ],
    },
    decisions: {
      heading: { lead: 'Built to check the AI,', accent: 'not to trust it.' },
      items: [
        {
          title: 'Evidence has to match the page',
          text: 'The server accepts a value as found only when the quote the model returns as evidence appears verbatim, after whitespace normalization, in the retrieved text. Otherwise the field is downgraded to Not Found. This rejects evidence quotes that do not appear in the retrieved text. A matching quote can still accompany an incorrect interpretation, so every field requires human review.',
        },
        {
          title: 'A strict schema instead of free text',
          text: 'Every response must fit a fixed JSON schema with the same three parts for each field: the value, whether it was found, and the source evidence. Incomplete, malformed, or refused responses are rejected with a plain message instead of being shown as results.',
        },
        {
          title: 'Page text is data, not instructions',
          text: 'The retrieved content is passed to the model as source material with explicit instructions to ignore any commands it contains, to reduce the risk from prompt-injection text embedded in a page. These instructions lower that risk; they don’t eliminate it.',
        },
        {
          title: 'Only public pages, with fetch limits',
          text: 'Before fetching, the server resolves the hostname and blocks loopback, private, and link-local address ranges, to keep the tool from being pointed at internal systems. The page is capped at 5 MB, redirects at three, and the request times out after 8 seconds.',
        },
        {
          title: 'The AI result and the human value stay apart',
          text: 'The interface keeps the AI result and its evidence read-only and gives each field its own manager-reviewed value with an explicit status. What the model said and what the person decided are never blurred into one.',
        },
        {
          title: 'Secrets stay on the server',
          text: 'The OpenAI key is read only from the server’s environment and never reaches the browser. If it isn’t configured, the app says so plainly instead of failing silently.',
        },
      ],
    },
    review: {
      heading: { lead: 'The person has', accent: 'the last word.' },
      paragraphs: [
        'The review screen is where the design shows. Every field carries two badges: a review status (Unreviewed, Confirmed, or Edited) and whether the AI found it at all. Found values appear beside the quote the model cited, which the server has matched in the page text; Not Found fields say so and show no evidence.',
        'The screenshots below use the application’s built-in development sample results, which exist to exercise the interface without analyzing a website. They are labelled as sample data in the app itself, and no extraction was run to produce them.',
      ],
    },
    scope: {
      heading: { lead: 'What it does,', accent: 'and doesn’t.' },
      implemented: [
        'Retrieval of one public HTML page, with the readable text shown before extraction',
        'AI extraction of 21 listing fields through a strict JSON schema, with evidence checked against the page',
        'Per-field review with Unreviewed, Confirmed, and Edited states, keeping the AI result separate from the reviewed value',
        'Clear messages for configuration, retrieval, size, timeout, refusal, and invalid-response failures',
        'Development sample results for checking the interface without an AI call',
        'Production configuration for Railway',
      ],
      limitations: [
        'It analyzes one page at a time. It does not crawl a whole website or follow links.',
        'Nothing is saved, exported, or published. Reviewed values live only in the current browser session.',
        'There are no accounts, and the AI step needs an API key configured on the server.',
        'Evidence matching only confirms that a quote appears in the retrieved text. It can’t tell whether the extracted value or its interpretation is correct; that remains the reviewer’s job.',
        'Checks so far have been manual; the repository has no automated test suite yet.',
      ],
      verification:
        'This write-up is based on the project’s source code and its deployed interface. The start screen and the review interface with development sample data were captured from the live application on 2026-11-12. The screenshots do not show a live extraction run.',
    },
    technologies: [
      { name: 'JavaScript and Vite', detail: 'A framework-free interface written in plain JavaScript and bundled with Vite.' },
      { name: 'Node.js', detail: 'A small HTTP server on Node’s built-in modules, handling retrieval, address checks, and two JSON endpoints.' },
      { name: 'cheerio', detail: 'Strips scripts, styles, and layout from the fetched HTML and keeps the readable text and link targets.' },
      { name: 'OpenAI Responses API', detail: 'Structured outputs against a strict JSON schema, through the official openai library.' },
      { name: 'Railway', detail: 'Production hosting, with the server bound to Railway’s port and serving the built interface.' },
    ],
    screenshots: {
      start: reentryStartScreen,
      // Both review captures show the app's development sample results, which
      // the app renders locally without calling the server. Caption as sample data.
      review: [
        {
          base: `${reentryImages}/review-sample-desktop`,
          widths: [1600, 800],
          fallbackWidth: 1600,
          width: 1600,
          height: 885,
          sizes: '(min-width: 90rem) 54rem, (min-width: 56rem) 60vw, 100vw',
          sample: true,
          alt: 'The review interface on a desktop screen. Field cards for Program name and Website show badges reading Unreviewed and Found, the AI result, the quoted source evidence, an editable manager-reviewed value, and buttons to mark the value confirmed or clear it. A status message says the development sample results are for interface testing only.',
          caption: 'The review interface on a wide screen, showing the application’s development sample results rather than a live extraction.',
        },
        {
          base: `${reentryImages}/review-sample-phone`,
          widths: [780, 390],
          fallbackWidth: 780,
          width: 780,
          height: 1706,
          // A tall phone capture: shown at phone width on narrow screens (styles.css).
          frame: 'phone',
          sizes: '(min-width: 90rem) 27rem, (min-width: 56rem) 30vw, 22rem',
          sample: true,
          alt: 'The review interface on a phone: the Extraction results heading, the note that AI-generated information is a draft, and the Program name field card with its badges, AI result, source evidence, and manager-reviewed value.',
          caption: 'The same screen on a phone, again with sample data.',
        },
      ],
    },
  },
];

// Catering Concierge: written from the committed source on `main` (67f03bc),
// which the deployment runs, and from the deployed interface viewed signed out.
// Manual inquiry entry exists only as uncommitted work in that repository, so
// it is described as in development, never as deployed.
const cateringImages = '/images/projects/catering-concierge';

const cateringDashboard = {
  base: `${cateringImages}/dashboard-sample-desktop`,
  widths: [1600, 800],
  fallbackWidth: 1600,
  width: 1600,
  height: 1000,
  sample: true,
  alt: 'The Catering Concierge dashboard on a desktop screen. A demonstration-mode banner states that its inquiries, names, and figures are fictional. The sidebar lists Dashboard, Inquiries marked Limited, and Email, Menu, Quotes, Events, and Settings marked Planned. Summary cards and an inquiry pipeline are labelled Sample and Fictional.',
  caption: 'The deployed dashboard, viewable without signing in. Everything on it is fictional sample data, and the sidebar marks each module as Limited or Planned. Imported inquiries appear on the separate Inquiries page, which requires sign-in and isn’t shown.',
};

projects.push({
  slug: 'catering-concierge',
  published: true,
  approvedOn: '2026-11-12',
  title: 'Catering Concierge',
  category: 'Workflow automation',
  description:
    'Case study: Catering Concierge brings catering inquiries, prepared and reviewed in Zapier, into a restaurant-scoped review screen through an authenticated, duplicate-aware import endpoint.',
  tagline:
    'A catering operations app for independent restaurants. Its working pilot connects a Zapier workflow to the app: Zapier packages each inquiry with an AI-written review, an authenticated endpoint stores it once for the configured restaurant, and signed-in owners read their restaurant’s inquiries in one place.',
  audience:
    'Built for independent restaurants that receive catering requests through several channels and need one place to see what has come in.',
  status:
    'Deployed demonstration on Railway with fictional data. Inquiry import and review work as a limited pilot; menus, quotes, email, and events are planned.',
  stackSummary:
    'Next.js, React, and TypeScript with Prisma on Neon PostgreSQL, Google sign-in through Better Auth, and Zapier, deployed on Railway.',
  // Approved by the owner on 2026-11-12. Do not edit.
  contribution:
    'I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined the interface and human-verification process.',
  contributionHeading: { lead: 'What I', accent: 'contributed.' },
  links: {
    live: { label: 'Open the live application', href: 'https://week-8-build-catering-concierge-production.up.railway.app/' },
    repo: { label: 'View the repository', href: 'https://github.com/amber-goding/week-8-build-catering-concierge' },
  },
  card: {
    summary:
      'Connects a Zapier workflow to a restaurant app: Zapier prepares each catering inquiry with an AI review, an authenticated endpoint stores it once for the configured restaurant, and signed-in owners review it in one place.',
    image: cateringDashboard,
  },
  problem: {
    heading: { lead: 'Many channels,', accent: 'one kitchen.' },
    paragraphs: [
      'Catering requests reach an independent restaurant through different routes: email, website forms, and conversations someone types up later. Each arrives in its own format, with the event date, headcount, and dietary needs buried in free text, and each has to be found, read, and checked for missing details before anyone can respond.',
      'Catering Concierge is planned as a complete catering workflow, from first contact to a confirmed event. The first working piece is intake: moving inquiries out of the tools where they arrive and into one place, attached to the right restaurant, without creating duplicates, and designed so each owner reads only their own restaurant’s inquiries.',
    ],
  },
  workflow: {
    heading: { lead: 'Prepare in Zapier,', accent: 'review in the app.' },
    steps: [
      {
        title: 'Prepare in Zapier',
        text: 'A published Zap watches a Zapier table of fictional pilot inquiries. For each new record, an AI by Zapier step writes a review of the request, and a code step packages the record ID, the original message, and that review as JSON. The AI step runs inside Zapier; the application itself calls no AI service.',
      },
      {
        title: 'Deliver to the app',
        text: 'Zapier sends the JSON to the application’s import endpoint with a bearer token. The server checks its own configuration, the token, the content type, the size, and the exact fields before it touches the database, then stores the inquiry for the restaurant named in server configuration, labelled as demonstration data.',
      },
      {
        title: 'Review in one place',
        text: 'A signed-in owner opens Inquiries and sees their restaurant’s latest inquiries, newest first. Each shows the original request and Zapier’s AI review under separate labels. The screen is read-only for now: nothing is approved, edited, or sent from it.',
      },
    ],
  },
  decisions: {
    heading: { lead: 'Narrow by design,', accent: 'strict at the edges.' },
    items: [
      {
        title: 'The server decides where data goes',
        text: 'The destination restaurant and source table come from server configuration, never from the request. The endpoint accepts exactly three fields: the record ID, the inquiry message, and the AI review. Anything else, including an attempt to name a restaurant or mark a record as real, is rejected.',
      },
      {
        title: 'Checks run before the database',
        text: 'Requests are checked in a fixed order: configuration, bearer token, content type, body size (a 128 KiB limit enforced while the body is read), and then the payload. A request that fails any of them never reaches the database. The token check hashes both values and compares them in constant time.',
      },
      {
        title: 'One record, one inquiry',
        text: 'A repeat delivery of the same Zapier record returns the existing inquiry instead of creating another or overwriting it. A unique database index on the restaurant, table, and record ID backs this up: if two deliveries arrive together, the database rejects the second and the endpoint returns the first. Simultaneous deliveries are covered by automated tests against a simulated database rather than a live test.',
      },
      {
        title: 'Restaurant scope comes from the session',
        text: 'The Inquiries screen takes its restaurant only from the signed-in user’s membership, never from a URL or form, and every query filters by it. Signed-out visitors are sent to sign-in and users without a restaurant to setup. If loading fails, the page shows an unavailable notice instead of data.',
      },
      {
        title: 'Imported text stays untrusted',
        text: 'Line endings are normalized and unsupported control characters are refused, but the message and the AI review are otherwise stored as received and displayed as plain text. Responses never echo submitted content, and logs record error types without request bodies or tokens.',
      },
      {
        title: 'Labelled, not dressed up',
        text: 'Every imported record is stored and shown as demonstration data. The dashboard pipeline is a separate fictional preview, and modules that aren’t built are marked Planned in the navigation instead of being filled with convincing screens.',
      },
    ],
  },
  review: {
    label: 'The interface',
    heading: { lead: 'What’s public,', accent: 'what’s behind sign-in.' },
    paragraphs: [
      'The dashboard and the planned module pages can be viewed without an account. Sign-in uses Google, and the sign-in page says plainly what signing in does today: it confirms identity, lets the owner set up one restaurant, and gives access to that restaurant’s imported inquiries.',
      'The Inquiries screen itself requires a restaurant account, so it isn’t pictured here. The screenshots were taken from the deployed application while signed out, and the dashboard images show its built-in fictional sample data.',
    ],
  },
  scope: {
    heading: { lead: 'What it does,', accent: 'and doesn’t.' },
    implemented: [
      'Google sign-in with seven-day sessions, and setup of one restaurant per account with an owner membership',
      'An authenticated Zapier import endpoint with payload validation, a size limit, and duplicate handling',
      'A restaurant-scoped, read-only Inquiries screen showing each original request with its Zapier AI review',
      'A dashboard and pipeline preview built on clearly labelled fictional sample data',
      'A health endpoint and production configuration for Railway',
      'Automated tests for the sign-in wiring, restaurant setup, the import endpoint, and inquiry reads, using a simulated database where needed',
    ],
    limitations: [
      'It is a demonstration on fictional data, running against a development database, not a production restaurant service.',
      'The import is a single-restaurant pilot: one configured restaurant, one Zapier table, and one shared token.',
      'The app makes no AI calls of its own. The review text comes from Zapier and is shown as received; the app doesn’t check whether it is correct.',
      'Inquiries can be read, but not edited, approved, quoted, or answered, and nothing is extracted from them into structured fields.',
      'The Email, Menu, Quotes, Events, and Settings pages describe planned scope only. Business analytics is also planned.',
      'Entering an inquiry by hand is in development and isn’t part of the deployed version.',
      'Restaurant scoping and simultaneous duplicate deliveries are covered by automated tests against a simulated database. Separation between two real restaurant accounts hasn’t been tested live.',
    ],
    verification:
      'This write-up is based on the project’s committed source code and its deployed interface. The screenshots were captured from the live application on 2026-11-12 while signed out, without submitting anything. The project’s own records note a live Zapier test in which a first delivery was accepted and a repeat returned the same inquiry as a duplicate; that check wasn’t repeated for this case study.',
  },
  technologies: [
    { name: 'Next.js and React', detail: 'App Router pages with server-side data loading, written in TypeScript.' },
    { name: 'Tailwind CSS', detail: 'Interface styling and theme tokens.' },
    { name: 'Prisma and Neon PostgreSQL', detail: 'The data model, migrations, and the unique index behind duplicate handling.' },
    { name: 'Better Auth', detail: 'Google sign-in and database-backed sessions.' },
    { name: 'Zapier', detail: 'Tables, AI by Zapier, Code by Zapier, and an authenticated API request that delivers each inquiry.' },
    { name: 'Node.js test runner', detail: 'Automated tests for the import endpoint, sign-in wiring, and restaurant scope.' },
    { name: 'Railway', detail: 'Hosting for the demonstration deployment.' },
  ],
  screenshots: {
    start: cateringDashboard,
    review: [
      {
        base: `${cateringImages}/sign-in-desktop`,
        widths: [1600, 800],
        fallbackWidth: 1600,
        width: 1600,
        height: 1000,
        sizes: '(min-width: 90rem) 54rem, (min-width: 56rem) 60vw, 100vw',
        alt: 'The Catering Concierge sign-in page on a desktop screen, with a Continue with Google button and a panel titled What signing in does today that lists identity confirmation through Google, seven-day sessions, no Gmail access, and setting up one restaurant to read its imported pilot inquiries.',
        caption: 'The deployed sign-in page, captured signed out. It explains what signing in does today, including that it doesn’t connect Gmail.',
      },
      {
        base: `${cateringImages}/dashboard-sample-phone`,
        widths: [780, 390],
        fallbackWidth: 780,
        width: 780,
        height: 1688,
        sample: true,
        frame: 'phone',
        sizes: '(min-width: 90rem) 27rem, (min-width: 56rem) 30vw, 22rem',
        alt: 'The dashboard on a phone: the menu button, the demonstration-mode banner, the Catering overview heading with a Sample data label, and the first summary card marked Sample.',
        caption: 'The dashboard on a phone, with its fictional sample data and demonstration banner.',
      },
    ],
  },
});

// HuntSomewhere: written from the committed source on `main` (5d4c484), which the
// deployment runs, and from the confirmed deployment. The AI step is described from
// source inspection only; no live AI request was made (not authorized). One
// fictional demonstration trip was created through the manual form on 2026-11-12.
const huntImages = '/images/projects/huntsomewhere';

projects.push({
  slug: 'huntsomewhere',
  published: true,
  approvedOn: '2026-11-12',
  title: 'HuntSomewhere',
  category: 'Application development',
  description:
    'Case study: HuntSomewhere turns a hunter’s trip description into editable search preferences, saves them in PostgreSQL behind a unique link, and lists curated Maryland public areas that match by county, with official sources and clear limits.',
  tagline:
    'A trip planner for hunters in Maryland. Describe a trip or set preferences by hand, review and edit them, save the trip to a unique link, and see which curated public wildlife management areas fall in the counties you chose, each with its official source and a clear note on what hasn’t been confirmed.',
  audience:
    'Built for Maryland hunters who want a quicker start on where to look, without being told that a place is open or legal to hunt when the data doesn’t say so.',
  status:
    'Deployed on Railway. Trip planning, saved trips, and county-based discovery of six curated public areas work today. Accounts, private-land listings, access requests, and maps are planned.',
  stackSummary:
    'Next.js, React, and TypeScript with Prisma on Neon PostgreSQL, zod validation, and the OpenAI Responses API, deployed on Railway.',
  // Approved by the owner on 2026-11-12. Do not edit.
  contribution:
    'I defined the problem and application workflow, guided AI-assisted implementation, reviewed the results, and refined how users review suggested trip preferences and understand the limits of the location data.',
  contributionHeading: { lead: 'What I', accent: 'contributed.' },
  links: {
    live: { label: 'Open the live application', href: 'https://week-7-build-huntsomewhere-production.up.railway.app/' },
    repo: { label: 'View the repository', href: 'https://github.com/amber-goding/week-7-build-HuntSomewhere' },
  },
  card: {
    summary:
      'A trip planner for Maryland hunters: describe or set trip preferences, edit them, save the trip to a unique link, and see curated public wildlife management areas in matching counties, each with its official source and a note on what isn’t confirmed.',
    image: {
      base: `${huntImages}/public-areas-desktop`,
      widths: [1600, 800],
      fallbackWidth: 1600,
      width: 1600,
      height: 1000,
      alt: 'The HuntSomewhere public areas page: a statement that it includes six wildlife management areas in Garrett, Allegany, Washington, and Montgomery counties from Maryland DNR data, a limited-coverage notice saying public ownership does not by itself mean hunting is allowed, and the first area cards, each marked Not confirmed by HuntSomewhere.',
    },
  },
  problem: {
    heading: { lead: 'Where to look,', accent: 'and what’s really known.' },
    paragraphs: [
      'Planning a hunt in Maryland means piecing together where public land is, which county it’s in, what you’re after, and how you’ll hunt, from sources that weren’t built to answer those questions together. Public ownership records say who owns a parcel, not whether hunting is allowed there, which species are present, or when seasons run.',
      'HuntSomewhere’s longer-term goal is a hub connecting hunters with public areas and willing private landowners. The working version takes on the first step: turning a hunter’s intentions into clear search preferences and pointing to public areas in the right counties, while stating plainly what the data doesn’t establish.',
    ],
  },
  workflow: {
    heading: { lead: 'Describe, review,', accent: 'save, discover.' },
    steps: [
      {
        title: 'Describe or set preferences',
        text: 'A hunter can write a short description, up to 300 characters, and ask the AI step to suggest counties, species, methods, and dates. Or they can skip AI entirely and choose the same options from lists. The description is sent for that one request and isn’t stored.',
      },
      {
        title: 'Review and save',
        text: 'Every preference appears as a choice the hunter can remove or add to. Saving validates the selections on the server and stores them in PostgreSQL under a randomly generated link. Anyone who has that link can view the trip; it isn’t protected by an account.',
      },
      {
        title: 'Discover public areas',
        text: 'From a saved trip, the hunter can list curated wildlife management areas in the trip’s counties. Matching is by county only, and the results page says that species, methods, dates, and hunting access aren’t confirmed. A result is not a recommendation or a confirmed place to hunt.',
      },
    ],
  },
  decisions: {
    heading: { lead: 'Clear about', accent: 'what the data says.' },
    items: [
      {
        title: 'The AI suggests; code validates',
        text: 'The model is instructed to extract only what the description states, to treat it as untrusted text, and not to infer seasons, bag limits, permission, or access. Its reply must match a strict JSON schema and is validated again against the allowed counties, species, and methods; a reply that doesn’t validate isn’t applied. Broad terms such as “deer” are expanded into specific options by code, so each one is visible and removable.',
      },
      {
        title: 'Uncertain terms stay unresolved',
        text: 'The model is instructed to leave season terms and vague dates, such as “opening day” or “early November”, as unresolved notes rather than dates. Code adds a check of its own: dates that aren’t real or are out of order become unresolved instead of being applied.',
      },
      {
        title: 'A database-enforced limit on AI requests',
        text: 'Before each AI request, a single conditional database update reserves one request from a fixed allowance. The update only succeeds while requests remain, so simultaneous requests can’t take the count past the limit. Reservations aren’t released, even if a request fails or times out. An environment switch or a database flag can turn AI off, and the manual form keeps working either way.',
      },
      {
        title: 'Source data kept with its provenance',
        text: 'The six areas come from the State of Maryland’s protected-lands dataset (MD iMAP / Maryland DNR). The source files are kept unchanged with recorded checksums and a provenance note, and each area carries only what the source establishes: its name, county, and DNR page link. The pages show the data credit, the retrieval date, that the source’s update date is unknown, the source’s as-is disclaimer, and a notice that public ownership doesn’t by itself mean hunting is allowed.',
      },
    ],
  },
  review: {
    label: 'The interface',
    heading: { lead: 'A demonstration trip,', accent: 'start to finish.' },
    paragraphs: [
      'These screens come from the deployed application. The trip shown was created for this case study through the manual form, with Garrett County, white-tailed deer, vertical bow, and two November dates. It contains no personal information, and no AI request was made. Garrett County returns the two curated areas the source places there.',
      'The AI suggestion step is described here from the source code. It wasn’t exercised for this case study, so no AI result is pictured.',
    ],
  },
  scope: {
    heading: { lead: 'What it does,', accent: 'and doesn’t.' },
    implemented: [
      'AI-suggested county, species, method, and date preferences from a short description, with unresolved terms shown separately',
      'A manual preference form that works without AI',
      'Saved trips in PostgreSQL behind a randomly generated link, validated when saved and again when loaded',
      'A list of six curated wildlife management areas in four counties (Garrett, Allegany, Washington, and Montgomery), each with its source and DNR page link',
      'County-based discovery of those areas from a saved trip, with uncertainty and coverage notices',
      'A data-sources page with attribution and the source’s published reuse terms',
      'AI safeguards: input limits, a 10-second timeout, a database-enforced request limit, an off switch, and a specific message for each failure',
    ],
    limitations: [
      'There are no accounts. Anyone who has a trip’s link can view it.',
      'Coverage is six areas in four counties, not a statewide inventory.',
      'Matching uses county only. It doesn’t establish hunting access, eligibility, seasons, or suitability for a species or method.',
      'Maps, private-land listings, access requests, permission documents, and messaging are planned, not built.',
      'Automated checks for the planner and the area data exist in the repository; they weren’t re-run for this case study.',
    ],
    verification:
      'This write-up is based on the project’s committed source code and its deployed interface, checked on 2026-11-12. The public pages were viewed, and one fictional demonstration trip was saved through the manual form and its county results confirmed. The AI suggestion step was reviewed in the source but not run.',
  },
  technologies: [
    { name: 'Next.js and React', detail: 'App Router pages and server actions, written in TypeScript.' },
    { name: 'Tailwind CSS', detail: 'Interface styling, with light and dark themes.' },
    { name: 'Prisma and Neon PostgreSQL', detail: 'Models and migrations for trips, the AI request allowance, and data sources.' },
    { name: 'zod', detail: 'Validation of trip preferences and of the AI’s structured output.' },
    { name: 'OpenAI Responses API', detail: 'Structured output against a strict JSON schema, called from the server.' },
    { name: 'Railway', detail: 'Hosting for the deployed application.' },
  ],
  screenshots: {
    start: {
      base: `${huntImages}/demo-preferences-desktop`,
      widths: [1600, 800],
      fallbackWidth: 1600,
      width: 1600,
      height: 1000,
      sample: true,
      flagLabel: 'Demonstration input',
      alt: 'The HuntSomewhere planner’s review step with Garrett County, White-tailed deer, and Vertical bow chosen as removable options, dates of November 14 and 15, 2026, and a save section stating that saving creates a random link and anyone with the link can view the preferences.',
      caption: 'The deployed planner after choosing the demonstration trip’s options by hand, without AI. The save section states that anyone with the link can view the preferences.',
    },
    review: [
      {
        base: `${huntImages}/demo-trip-areas-desktop`,
        widths: [1600, 800],
        fallbackWidth: 1600,
        width: 1600,
        height: 1000,
        sample: true,
        flagLabel: 'Demonstration trip',
        sizes: '(min-width: 90rem) 54rem, (min-width: 56rem) 60vw, 100vw',
        alt: 'Public areas for the demonstration trip: the trip’s county is Garrett County, a notice says the results match county only and that species, methods, dates, and hunting access are not confirmed, and two area cards, Mt. Nebo WMA and Cunningham Swamp WMA, each show an official DNR page link and a Not confirmed by HuntSomewhere label.',
        caption: 'County-matched results for the demonstration trip. The area details are real public source data; the trip itself is fictional.',
      },
      {
        base: `${huntImages}/demo-trip-phone`,
        widths: [780, 390],
        fallbackWidth: 780,
        width: 780,
        height: 1688,
        sample: true,
        flagLabel: 'Demonstration trip',
        frame: 'phone',
        sizes: '(min-width: 90rem) 27rem, (min-width: 56rem) 30vw, 22rem',
        alt: 'The saved demonstration trip on a phone: a note that anyone with the link can view the preferences and that they don’t confirm seasons, legality, permission, availability, or any property, followed by Garrett County, White-tailed deer, Vertical bow, the dates, and a Discover public areas button.',
        caption: 'The saved demonstration trip on a phone, with the app’s note about link access.',
      },
    ],
  },
});

export const publishedProjects = projects.filter((project) => project.published);

export const findPublishedProject = (slug) => publishedProjects.find((project) => project.slug === slug);
