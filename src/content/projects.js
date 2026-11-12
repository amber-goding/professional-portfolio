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
          alt: 'The review interface on a phone: the Extraction results heading, the note that AI-generated information is a draft, and the Program name field card with its badges, AI result, source evidence, and manager-reviewed value.',
          caption: 'The same screen on a phone, again with sample data.',
        },
      ],
    },
  },
];

export const publishedProjects = projects.filter((project) => project.published);

export const findPublishedProject = (slug) => publishedProjects.find((project) => project.slug === slug);
