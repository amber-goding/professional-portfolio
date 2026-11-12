// Content for /about.
// - The page title, heading, portrait, professional links, and "How I work"
//   copy were approved by the owner on 2026-11-12.
// - The introduction and "My story" section are reworded, with the owner's
//   approval, from her own bio (2026-11-12). Don't add claims or anecdotes.
// The closing contact invitation reuses the homepage wording.

export const aboutPage = {
  title: 'About Amber',
  heading: { lead: 'Thoughtful tools start with', accent: 'understanding people.' },
  intro:
    'I’m Amber Goding, a full-stack developer and AI-augmented builder who loves bringing ideas to life with technology.',
  story: {
    kicker: 'My story',
    heading: { lead: 'Not the usual route.', accent: 'The right one.' },
    chapters: [
      {
        title: 'The path',
        text: 'My way into technology wasn’t a straight line. I gave myself a second chance, started something entirely new, and kept discovering I was capable of more than I’d imagined.',
      },
      {
        title: 'The mindset',
        text: 'That path shaped how I take on problems: resourceful, adaptable, quick to take initiative, and willing to look at things from a different angle.',
      },
      {
        title: 'The craft',
        text: 'Great software brings together logic and creativity, function and experience, technology and human understanding. I take the engineering seriously, and I still leave room for imagination, experimentation, and a little magic.',
      },
    ],
  },
  howIWork: {
    kicker: 'Approach',
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
  sizes: '(min-width: 56rem) 28rem, 90vw',
};

// Supplied by the owner. Used as links only; their contents were not reviewed.
export const profileLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/amber-goding/' },
  { label: 'GitHub', href: 'https://github.com/amber-goding' },
];
