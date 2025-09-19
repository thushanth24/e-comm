/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://sriramselection.site',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/api/*', '/test-*', '/server-sitemap.xml'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  // Add any other sitemap configuration options here
}
