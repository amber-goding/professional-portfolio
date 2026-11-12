// Technology section on the homepage ("Tech stack & tools").
//
// Every tool and project mapping here is backed by repository evidence (see the
// README's "Portfolio project planning" inventory and the published case
// studies). Don't add tools, ratings, percentages, or experience claims that
// the projects don't support.

export const stackIntro = {
  heading: { lead: 'What I build', accent: 'with.' },
  lede: 'The tools behind the projects above, grouped by the job they do, with where each one shows up.',
};

// `projects` lists case-study slugs in the homepage order.
export const stackGroups = [
  {
    id: 'interfaces',
    label: 'Interfaces',
    tools: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS'],
    usage:
      'Reentry Resource Extractor’s interface is framework-free JavaScript. Catering Concierge and HuntSomewhere are Next.js and React applications written in TypeScript and styled with Tailwind CSS. This site is server-rendered HTML with plain CSS and a little JavaScript.',
    projects: ['reentry-resource-extractor', 'catering-concierge', 'huntsomewhere'],
  },
  {
    id: 'data',
    label: 'Data',
    tools: ['PostgreSQL', 'Neon', 'Prisma'],
    usage:
      'Catering Concierge and HuntSomewhere keep their data in PostgreSQL hosted on Neon, with Prisma for the schema, migrations, and queries. A unique index lets Catering Concierge return the existing inquiry when Zapier repeats a delivery, and HuntSomewhere enforces its limit on AI requests in the database.',
    projects: ['catering-concierge', 'huntsomewhere'],
  },
  {
    id: 'ai-automation',
    label: 'AI & automation',
    tools: ['OpenAI API', 'Zapier'],
    usage:
      'Reentry Resource Extractor and HuntSomewhere call the OpenAI API directly from the server, ask for output that matches a strict JSON schema, and check every response before using it. In Catering Concierge the AI review runs inside Zapier (AI by Zapier); the app receives the result and makes no AI calls of its own.',
    projects: ['reentry-resource-extractor', 'huntsomewhere', 'catering-concierge'],
  },
  {
    id: 'delivery',
    label: 'Development & delivery',
    tools: ['GitHub', 'Node.js', 'Vite', 'Railway', 'Resend'],
    usage:
      'All three projects are hosted on Railway, with their source on GitHub. Reentry Resource Extractor is built with Vite and served by a small Node.js server. Resend delivers the messages sent through this portfolio’s contact form.',
    projects: ['reentry-resource-extractor', 'catering-concierge', 'huntsomewhere'],
  },
];

// AI development assistants, documented in the project histories. They help
// build the software; they are not part of the showcased applications.
export const buildTools = {
  heading: 'Tools I build with',
  tools: ['Claude Code', 'Codex'],
  note:
    'AI coding assistants I work with to plan, implement, and review changes. I define the problem, direct the work, and review the results. They help build the applications; they aren’t part of them.',
};
