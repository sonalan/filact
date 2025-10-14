import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Filact',
  description: 'A React admin panel library inspired by FilamentPHP, built with shadcn/ui',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'Examples', link: '/examples/basic-crud' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Resources', link: '/guide/resources' },
            { text: 'Forms', link: '/guide/forms' },
            { text: 'Tables', link: '/guide/tables' },
            { text: 'Actions', link: '/guide/actions' },
          ],
        },
        {
          text: 'Components',
          items: [
            { text: 'Form Fields', link: '/guide/form-fields' },
            { text: 'Table Columns', link: '/guide/table-columns' },
            { text: 'Widgets', link: '/guide/widgets' },
            { text: 'Layout', link: '/guide/layout' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Data Providers', link: '/guide/data-providers' },
            { text: 'Authorization', link: '/guide/authorization' },
            { text: 'Theming', link: '/guide/theming' },
            { text: 'CLI Tools', link: '/guide/cli' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Resources', link: '/api/resources' },
            { text: 'Forms', link: '/api/forms' },
            { text: 'Tables', link: '/api/tables' },
            { text: 'Actions', link: '/api/actions' },
            { text: 'Widgets', link: '/api/widgets' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic CRUD', link: '/examples/basic-crud' },
            { text: 'Advanced Forms', link: '/examples/advanced-forms' },
            { text: 'Custom Actions', link: '/examples/custom-actions' },
            { text: 'Dashboard Widgets', link: '/examples/dashboard' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sonalan/filact' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Sonalan',
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],
})
