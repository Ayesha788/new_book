// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const isVercel = process.env.VERCEL === '1';

const config = {
  title: 'Physical AI & Humanoid Robotics Book',
  tagline: 'Bridging Digital AI and Embodied Intelligence in the Physical World',
  favicon: 'img/favicon.ico',

  // URLs
  url: isVercel
    ? 'https://physical-ai-book.vercel.app'
    : 'https://ayesha788.github.io',
  baseUrl: '/', // Vercel root
  trailingSlash: false, // Fix for Vercel

  // GitHub Pages config
  organizationName: 'Ayesha788',
  projectName: 'new_book',

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: 'docs', // Docs load at /docs/intro
          editUrl: 'https://github.com/Ayesha788/new_book/tree/main/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {},
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.png',
    navbar: {
      title: 'Physical AI Book',
      logo: { alt: 'Physical AI Logo', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Book' },
        { href: 'https://github.com/Ayesha788/new_book', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [{ label: 'Book', to: '/docs/intro' }],
        },
        {
          title: 'Community',
          items: [
            { label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/docusaurus' },
            { label: 'Discord', href: 'https://discordapp.com/invite/docusaurus' },
            { label: 'Twitter', href: 'https://twitter.com/docusaurus' },
          ],
        },
        {
          title: 'More',
          items: [{ label: 'GitHub', href: 'https://github.com/Ayesha788/new_book' }],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} K TECH. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      defaultLanguage: 'python',
      additionalLanguages: ['bash', 'yaml', 'json', 'cpp'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    metadata: [
      { name: 'robots', content: 'index, follow' },
      { name: 'googlebot', content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1' },
    ],
  },
};

export default config;
