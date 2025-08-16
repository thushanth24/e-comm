export const siteConfig = {
  name: 'E-Commerce Store',
  description: 'A modern e-commerce store built with Next.js and Supabase',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  links: {
    twitter: 'https://twitter.com/yourusername',
    github: 'https://github.com/yourusername/e-comm',
  },
} as const;
