// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const isVercel = process.env.VERCEL === '1';

const config = {
  title: 'Physical AI & Humanoid Robotics Book',
  tagline: 'Bridging Digital AI and Embodied Intelligence in the Physical World',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: isVercel
  ? 'https://physical-ai-book.vercel.app'
  : 'https://ayesha788.github.io',

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub Pages, this is usually '/<projectName>/'
  baseUrl:isVercel ? '/' : '/new_book/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Ayesha788', // Usually your GitHub org/user name.
  projectName: 'new_book', // Usually your repo name.

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn', // Updated to new format
      onBrokenMarkdownImages: 'warn', // Added to handle broken image references
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Ayesha788/new_book/tree/main/',
          // Route base path to avoid conflicts with homepage
          routeBasePath: 'docs',
          // Performance optimizations
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    // Performance optimization plugins
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Configure redirects if needed
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.png',
      navbar: {
        title: 'Physical AI Book',
        logo: {
          alt: 'Physical AI Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Book',
            docsPluginId: 'default', // Explicitly specify the docs plugin
          },
          {
            href: 'https://github.com/Ayesha788/new_book',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Book',
                to: '/docs/intro', // Point to the intro page
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Ayesha788/new_book',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} K TECH. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        // Optimize code block loading
        defaultLanguage: 'python',
        additionalLanguages: ['bash', 'yaml', 'json', 'cpp'],
      },
      // Accessibility compliance for WCAG 2.1 AA
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      // Performance optimizations
      metadata: [
        {name: 'robots', content: 'index, follow'},
        {name: 'googlebot', content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1'},
      ],
    }),
};

export default config;
