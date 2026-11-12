// Content for /about. The page title, headings, body copy, portrait, and
// professional links were approved by the owner on 2026-11-12. Change them only
// with the owner's approval, and don't add claims or anecdotes. The closing
// contact invitation reuses the homepage wording, which is still provisional
// (see README "Temporary content").

export const aboutPage = {
  title: 'About Amber',
  heading: { lead: 'Thoughtful tools start with', accent: 'understanding people.' },
  intro:
    'I’m Amber Goding, an application and automation builder who enjoys turning complicated problems into tools that make everyday work easier.',
  background: [
    'My background includes customer-facing work, training, and team coordination. Those experiences shaped how I approach development: listen carefully, understand what someone needs, organize the details, and follow through. They also made me interested in the processes behind the work—where information gets lost, which steps repeat, and what could work better.',
    'Software development brings together the things I enjoy: creative thinking, practical problem-solving, and understanding how systems connect. My experience spans frontend interfaces, databases, APIs, and backend functionality, developed through structured coursework, independent study, and hands-on projects.',
    'I build with technologies including JavaScript, React, Next.js, and Tailwind CSS, alongside tools such as Prisma, Neon, and Railway. I also work with AI integrations and workflow automation, using tools including the OpenAI API and Zapier.',
  ],
  howIWork: {
    heading: 'How I work',
    paragraphs: [
      'I start by asking questions and clarifying the problem before suggesting a solution. From there, I break the work into manageable steps, communicate progress, and explain the decisions along the way.',
      'I welcome feedback because a useful application needs to make sense to the people using it. When I include AI, I consider where it can help, where its limits matter, and where a person should remain involved.',
      'I’m interested in opportunities to contribute to a development team, build practical applications, and help businesses simplify repetitive work. Whether it’s a clearer interface, easier access to information, or a better-connected workflow, I want the result to be something people can use with confidence.',
    ],
  },
};

// Resized from the owner-supplied portrait without retouching (square, sRGB,
// metadata stripped). Files live in public/images/.
export const portrait = {
  alt: 'Portrait of Amber Goding',
  width: 800,
  height: 800,
  fallback: '/images/amber-goding-portrait-800.jpg',
  webp: [400, 800, 1200].map((w) => ({ src: `/images/amber-goding-portrait-${w}.webp`, width: w })),
  // Matches the rendered width in styles.css (.about-portrait).
  sizes: '(min-width: 56rem) 28rem, 22rem',
};

// Supplied by the owner. Used as links only; their contents were not reviewed.
export const profileLinks = [
  { label: 'LinkedIn profile', href: 'https://www.linkedin.com/in/amber-goding/' },
  { label: 'GitHub profile', href: 'https://github.com/amber-goding' },
];
