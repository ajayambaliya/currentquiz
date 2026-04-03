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
                    '/favicon.ico?*',
                    '/*?*',
                ],
            },
            {
                userAgent: ['GPTBot', 'OAI-SearchBot'],
                allow: '/',
                disallow: ['/admin/', '/api/'],
            }
        ],
        sitemap: 'https://currentadda.vercel.app/sitemap.xml',
    }
}
