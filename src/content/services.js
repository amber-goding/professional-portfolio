// Content for /services. Provisional wording: confirm before launch (see README
// "Temporary content"). Every use case is an illustrative scenario, not completed
// client work. No prices, timelines, guarantees, clients, or results are stated.

export const servicesIntro = {
  heading: { lead: 'Useful software,', accent: 'built around your work.' },
  lede:
    'I help small businesses, freelancers, and teams turn everyday problems into working tools: applications people can use, AI applied where it genuinely helps, and automations that take repetitive steps off your plate.',
  note: 'Every project starts with how the work happens today and aims to leave you with something you can run, understand, and maintain.',
};

export const serviceDetails = [
  {
    id: 'application-development',
    title: 'Application development',
    contactLabel: 'Talk about application development',
    summary: 'Web applications designed around the people who use them.',
    buildingBlocks:
      'Forms, dashboards, search, user accounts, databases, and connections to tools you already use.',
    audience: [
      'Small businesses that have outgrown spreadsheets and email threads',
      'Service providers who need a simple tool for clients or staff',
      'Teams whose process lives in several disconnected places',
    ],
    problems: [
      'Information scattered across spreadsheets, documents, and inboxes',
      'The same details typed in again and again',
      'No single place to see what is happening and what comes next',
      'Off-the-shelf software that is too broad, too rigid, or a poor fit',
    ],
    engagement: [
      'Clarifying who will use the application and what they need to do',
      'Planning the data and the screens before building',
      'Building the application in small, reviewable steps',
      'Testing it against the scenarios agreed at the start',
      'Deployment, written documentation, and a walkthrough',
    ],
    example:
      'A home-cleaning company schedules jobs through text messages and a shared spreadsheet. A small web application could give staff one place to see upcoming jobs, record what was completed, and flag follow-ups, replacing the spreadsheet as the place everyone checks.',
  },
  {
    id: 'ai-integration',
    title: 'AI integration',
    contactLabel: 'Talk about AI integration',
    summary: 'AI applied where it genuinely helps, with clear limits and people in the loop.',
    buildingBlocks:
      'Large language model APIs, structured outputs that are checked before use, and human review steps.',
    audience: [
      'Organizations that handle a lot of written information, such as forms, emails, or documents',
      'Teams curious about AI but unsure where it fits',
      'Existing applications that could summarize, sort, or extract information',
    ],
    problems: [
      'Hours spent reading, summarizing, or retyping details from documents',
      'Incoming requests sorted inconsistently',
      'Useful information that is hard to find in long text',
    ],
    engagement: [
      'Identifying where AI adds value and where a simpler approach works better',
      'Prototyping with real, representative examples of your data',
      'Designing prompts and output formats that can be checked',
      'Adding human review and stating the limits plainly',
      'Integrating the result into your application or workflow',
      'Documenting how it behaves, what it costs to run, and where it can be wrong',
    ],
    example:
      'A tutoring studio receives intake forms written as free text. An AI step could pull out each student’s grade, subjects, and availability into structured fields, with a staff member reviewing every result before it is saved.',
  },
  {
    id: 'workflow-automation',
    title: 'Workflow automation',
    contactLabel: 'Talk about workflow automation',
    summary: 'Connecting the tools and steps behind repetitive work.',
    buildingBlocks:
      'APIs, webhooks, scheduled jobs, and notifications, with a record of what ran and when.',
    audience: [
      'Anyone repeating the same multi-step task across different tools',
      'Small teams copying information between forms, spreadsheets, email, and calendars',
    ],
    problems: [
      'Copying and pasting between systems',
      'Follow-ups that slip through the cracks',
      'Notifications and reports assembled by hand',
      'Mistakes introduced by retyping',
    ],
    engagement: [
      'Mapping the current workflow step by step',
      'Deciding what to automate and what should stay with a person',
      'Building the automation that connects your tools',
      'Alerts for anything that needs human attention',
      'Testing with realistic cases, including unusual ones',
      'Documentation, so you know what runs and how to pause it',
    ],
    example:
      'A property-maintenance company copies repair requests from a web form into a spreadsheet, then emails the right contractor. An automation could log each request, route it by category, and send a confirmation, flagging anything unusual for a person to handle.',
  },
];

export const processSteps = [
  {
    title: 'Understand the problem',
    text: 'We talk through how the work happens today, who is involved, and what a better outcome would look like.',
  },
  {
    title: 'Define the scope',
    text: 'We agree in writing on what will be built, what will not, and how we will know it works, before building starts.',
  },
  {
    title: 'Build and verify',
    text: 'The work happens in small, reviewable steps, each checked against the agreed scenarios, with progress shared along the way.',
  },
  {
    title: 'Hand off',
    text: 'You receive the working tool with documentation and a walkthrough, so you understand how it works and what it needs.',
  },
];
