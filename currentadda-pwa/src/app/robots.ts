import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/auth/',
                    '/profile',
                ],
            },
        ],
        sitemap: 'https://currentadda.vercel.app/sitemap.xml',
    }
}
