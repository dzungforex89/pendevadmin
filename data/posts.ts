export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
};

export const posts: Post[] = [
  {
    id: '1',
    title: 'Welcome to My Minimal Blog',
    slug: 'welcome-minimal-blog',
    excerpt: 'A short intro to this minimalist personal blog built with Next.js 14 and Tailwind.',
    content: '# Welcome\n\nThis is a sample post in Markdown-like text. Replace with your content.',
    date: '2025-11-19'
  },
  {
    id: '2',
    title: 'Designing Minimal UIs',
    slug: 'designing-minimal-uis',
    excerpt: 'Thoughts on minimal UI approaches for blogs and content sites.',
    content: '# Minimal UI\n\nKeep typography and spacing consistent.',
    date: '2025-11-18'
  }
];
