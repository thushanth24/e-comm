module.exports = {
  title: 'StyleStore - Modern Fashion E-commerce',
  description: 'Discover the latest fashion trends at StyleStore. Shop our curated collection of clothing and accessories for men and women.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-netlify-site-url.netlify.app',
    site_name: 'StyleStore',
    title: 'StyleStore - Modern Fashion E-commerce',
    description: 'Discover the latest fashion trends at StyleStore. Shop our curated collection of clothing and accessories for men and women.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StyleStore - Modern Fashion E-commerce',
      },
    ],
  },
  twitter: {
    handle: '@stylestore',
    site: '@stylestore',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
  ],
};
