// Homepage content. Wording marked provisional in README.md ("Temporary content")
// must be replaced or confirmed before launch.

export const navigation = [
  { href: '/#work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/#about', label: 'About' },
  { href: '/contact', label: 'Contact', cta: true },
];

// Capability descriptions only, with no client results or claimed experience.
export const services = [
  {
    title: 'Application development',
    summary:
      'Web applications designed around the people who use them, from the first problem statement and data model to a working tool.',
  },
  {
    title: 'AI integration',
    summary:
      'AI used where it genuinely helps, such as extracting, summarizing, and organizing information, with clear limits and human review built in.',
  },
  {
    title: 'Workflow automation',
    summary:
      'Connecting the tools and steps behind repetitive work so information moves where it needs to go with less manual effort.',
  },
];

// DEVELOPMENT PLACEHOLDERS. These are not real projects. Each slot will be
// replaced by a verified project (title, preview, case-study link) in a later
// milestone. Placeholders must never link anywhere or describe features.
export const projectPlaceholders = [
  { category: 'Featured application', heading: 'Purpose in every detail.', variant: 'composition' },
  { category: 'Automation', heading: 'Connect the moving parts.', variant: 'workflow' },
  { category: 'AI integration', heading: 'Clarity from complexity.', variant: 'signal' },
  { category: 'Application', heading: 'Built to be used.', variant: 'layers' },
];

// Working principles drawn directly from the approved positioning.
export const principles = [
  { title: 'Start with the real problem', text: 'Useful tools begin with how people actually work.' },
  { title: 'Explain the decisions', text: 'Clear reasoning, so you always know what was built and why.' },
  { title: 'Use AI thoughtfully', text: 'Applied where it helps, with its limits stated plainly.' },
];
