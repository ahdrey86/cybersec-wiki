import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CyberSec Wiki',
  tagline: 'База знаний по информационной безопасности',
  favicon: 'img/favicon.ico',

  url: 'https://ahdrey86.github.io',
  baseUrl: '/cybersec-wiki/',

  organizationName: 'ahdrey86',
  projectName: 'cybersec-wiki',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/your-username/cybersec-wiki/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      title: 'CyberSec Wiki',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
      },
      items: [
        // Криптография - dropdown
        {
          type: 'dropdown',
          label: '🔐 Криптография',
          position: 'left',
          items: [
            {
              type: 'doc',
              docId: 'cryptography/intro',
              label: '📖 Обзор раздела',
            },
            {
              type: 'html',
              value: '<hr style="margin: 4px 0;">',
            },
            {
              type: 'doc',
              docId: 'cryptography/classical/intro',
              label: '📜 Классические шифры',
            },
            {
              type: 'doc',
              docId: 'cryptography/modern/aes',
              label: '🔒 AES',
            },
            {
              type: 'doc',
              docId: 'cryptography/modern/des',
              label: '🔓 DES',
            },
            {
              type: 'doc',
              docId: 'cryptography/modern/rsa',
              label: '🔑 RSA',
            },
            {
              type: 'doc',
              docId: 'cryptography/modern/key-exchange',
              label: '🤝 Диффи-Хеллман',
            },
            {
              type: 'html',
              value: '<hr style="margin: 4px 0;">',
            },
            {
              type: 'doc',
              docId: 'cryptography/modern/gost',
              label: '🇷🇺 ГОСТ алгоритмы',
            },
            {
              type: 'doc',
              docId: 'cryptography/modern/hash-functions',
              label: '#️⃣ Хеш-функции',
            },
          ],
        },
        // Сети - dropdown
        {
          type: 'dropdown',
          label: '🌐 Сети',
          position: 'left',
          items: [
            {
              type: 'doc',
              docId: 'networks/osi',
              label: '📊 Модель OSI',
            },
            {
              type: 'doc',
              docId: 'networks/tcp-udp',
              label: '📡 TCP/UDP',
            },
            {
              type: 'html',
              value: '<hr style="margin: 4px 0;">',
            },
            {
              type: 'doc',
              docId: 'networks/ip-addressing',
              label: '🧮 IP калькулятор',
            },
            {
              type: 'doc',
              docId: 'networks/mac-ethernet',
              label: '🔍 MAC анализатор',
            },
            {
              type: 'html',
              value: '<hr style="margin: 4px 0;">',
            },
            {
              type: 'doc',
              docId: 'networks/dns',
              label: '🌍 DNS',
            },
            {
              type: 'doc',
              docId: 'networks/http',
              label: '🌐 HTTP/HTTPS',
            },
            {
              type: 'doc',
              docId: 'networks/firewall',
              label: '🛡️ Firewall',
            },
          ],
        },
        // Архитектура - dropdown
        {
          type: 'dropdown',
          label: '💻 Архитектура',
          position: 'left',
          items: [
            {
              type: 'doc',
              docId: 'computer-architecture/cpu-memory',
              label: '🧠 CPU и память',
            },
            {
              type: 'doc',
              docId: 'computer-architecture/filesystems',
              label: '💾 Файловые системы',
            },
          ],
        },
        // Законодательство - dropdown
        {
          type: 'dropdown',
          label: '⚖️ Право',
          position: 'left',
          items: [
            {
              type: 'doc',
              docId: 'legal/russian',
              label: '🇷🇺 Российское',
            },
            {
              type: 'doc',
              docId: 'legal/international',
              label: '🌍 Международное',
            },
          ],
        },
        // Поиск (справа)
        {
          type: 'search',
          position: 'right',
        },
        // GitHub
        {
          href: 'https://github.com/ahdrey86/cybersec-wiki',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Разделы',
          items: [
            { label: '🔐 Криптография', to: '/docs/cryptography/intro' },
            { label: '🌐 Сети', to: '/docs/networks/osi' },
            { label: '💻 Архитектура', to: '/docs/computer-architecture/cpu-memory' },
            { label: '⚖️ Законодательство', to: '/docs/legal/russian' },
          ],
        },
        {
          title: 'Инструменты',
          items: [
            { label: 'Классические шифры', to: '/docs/cryptography/classical/intro' },
            { label: 'ГОСТ алгоритмы', to: '/docs/cryptography/modern/gost' },
            { label: 'IP калькулятор', to: '/docs/networks/ip-addressing' },
            { label: 'MAC анализатор', to: '/docs/networks/mac-ethernet' },
          ],
        },
        {
          title: 'Ресурсы',
          items: [
            { label: 'ФСТЭК России', href: 'https://fstec.ru' },
            { label: 'ТК26 (криптография)', href: 'https://tc26.ru' },
            { label: 'NIST', href: 'https://nist.gov/cyberframework' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} CyberSec Wiki. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'json'],
    },
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
