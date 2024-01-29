import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  integrations: [
    starlight({
      title: 'json-origami',
      social: {
        github: 'https://github.com/hacomono-lib/json-origami',
      },
      sidebar: [
        {
          label: 'Home',
          link: '/',
        },
        {
          label: 'Introduction',
          collapsed: false,
          items: [
            { label: 'Getting Started', link: '/guides/start' },
            { label: 'Concepts', link: '/guides/concepts' },
          ],
        },
        {
          label: 'Api',
          collapsed: false,
          autogenerate: { directory: '/api', collapsed: false },
        },
      ],
    }),
  ],
})
