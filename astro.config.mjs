// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import starlightBlog from 'starlight-blog'

// https://astro.build/config
export default defineConfig({
    site: 'https://chorusstudio.org',
    integrations: [
        starlight({
            title: 'Chorus',
            description:
                'Enhance Spotify with snips, auto-skip, speed control, EQ, reverb, and more.',
            logo: {
                src: './src/assets/logo.png',
                alt: 'Chorus Logo'
            },
            social: [
                {
                    icon: 'github',
                    label: 'GitHub',
                    href: 'https://github.com/chorus-studio/chorus'
                }
            ],
            customCss: ['./src/styles/global.css'],
            sidebar: [
                {
                    label: 'Getting Started',
                    items: [
                        { label: 'Installation', slug: 'getting-started/installation' },
                        { label: 'Quick Start', slug: 'getting-started/quick-start' }
                    ]
                },
                {
                    label: 'Features',
                    autogenerate: { directory: 'features' }
                },
                {
                    label: 'FAQ',
                    slug: 'faq'
                }
            ],
            head: [
                {
                    tag: 'link',
                    attrs: {
                        rel: 'icon',
                        href: '/icon/32.png',
                        sizes: '32x32',
                        type: 'image/png'
                    }
                }
            ],
            plugins: [
                starlightBlog({
                    title: 'Blog',
                    authors: {
                        cdrani: {
                            name: 'Charles Drani',
                            url: 'https://github.com/cdrani'
                        }
                    }
                })
            ]
        }),
        svelte(),
        sitemap()
    ],
    vite: {
        plugins: [tailwindcss()]
    }
})
