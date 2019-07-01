/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const siteConfig = {
  title: 'Panoptes',
  tagline: 'Open Source device monitoring at scale',
  url: 'http://getpanoptes.io', // Your website URL
  baseUrl: '/', // Base URL for your project */

  // Used for publishing and more
  projectName: 'panoptes_documentation',
  organizationName: 'yahoo',

  // For no header links in the top nav bar -> headerLinks: [],
  // doc: refers to markdown pages in the docs directory
  // replace doc: with page: if you want to link to additional static pages
  headerLinks: [
    {doc: 'getting-started', label: 'Docs'},
    {doc: 'concepts', label: 'Concepts'},
    {doc: 'support', label: 'Get Help'},
    {doc: 'contribute', label: 'Contributing'},
  ],

  /* path to images for header/footer */
  headerIcon: 'img/panoptes_eye_black.svg',
  footerIcon: 'img/panoptes_eye_white.svg',
  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#2E8555',
    secondaryColor: '#205C3B',
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright ${new Date().getFullYear()} Oath Inc.`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'zenburn',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/ogImage.png',
  twitterImage: 'img/site_logo.png',

  // Show documentation's last contributor's name.
  enableUpdateBy: true,
  // Show documentation's last update time.
  enableUpdateTime: true,

};

module.exports = siteConfig;
