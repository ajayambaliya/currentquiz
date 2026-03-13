import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/auth/login'],
            disallow: ['/admin/', '/api/', '/auth/forgot-password', '/auth/reset-password'],
        },
        sitemap: 'https://currentadda.vercel.app/sitemap.xml',
    }
}
