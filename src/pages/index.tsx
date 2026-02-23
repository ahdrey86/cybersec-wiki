import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';

// Основные разделы
const sections = [
  {
    title: 'Криптография',
    emoji: '🔐',
    link: '/docs/cryptography/intro',
    description: 'Классические и современные шифры, ГОСТ, AES, DES, SHA-256, DH',
    color: '#00d4aa',
    stats: '20 алгоритмов',
    topics: ['AES', 'RSA', 'SHA-256', 'ГОСТ'],
  },
  {
    title: 'Сети',
    emoji: '🌐',
    link: '/docs/networks/osi',
    description: 'OSI/TCP-IP, адресация, протоколы, DNS, HTTP, Firewall',
    color: '#00b4d8',
    stats: '9 тем',
    topics: ['OSI', 'TCP/UDP', 'DNS', 'Firewall'],
  },
  {
    title: 'Архитектура',
    emoji: '💻',
    link: '/docs/computer-architecture/cpu-memory',
    description: 'Процессоры, память, кэш, системы счисления, файловые системы',
    color: '#9b5de5',
    stats: '4 инструмента',
    topics: ['CPU', 'RAM', 'Cache', 'FS'],
  },
  {
    title: 'Законодательство',
    emoji: '⚖️',
    link: '/docs/legal/russian',
    description: 'ФЗ-152, ФЗ-187, ГОСТ, ISO 27001, GDPR',
    color: '#f72585',
    stats: '2 темы',
    topics: ['РФ', 'Международное'],
  },
];

// Инструменты по категориям
const toolCategories = [
  {
    name: 'Классические шифры',
    icon: '📜',
    tools: [
      { name: 'Атбаш', link: '/docs/cryptography/classical/atbash' },
      { name: 'Цезарь', link: '/docs/cryptography/classical/caesar' },
      { name: 'Виженер', link: '/docs/cryptography/classical/vigenere' },
      { name: 'Тритемий', link: '/docs/cryptography/classical/tritemius' },
      { name: 'Белазо', link: '/docs/cryptography/classical/belaso' },
      { name: 'Полибий', link: '/docs/cryptography/classical/polybius' },
      { name: 'Плейфер', link: '/docs/cryptography/classical/playfair' },
      { name: 'Хилл 10×10', link: '/docs/cryptography/classical/hill' },
      { name: 'Перестановка', link: '/docs/cryptography/classical/vertical' },
      { name: 'Шифр Вернама', link: '/docs/cryptography/classical/otp' },
    ]
  },
  {
    name: 'Асимметричные',
    icon: '🔑',
    tools: [
      { name: 'RSA', link: '/docs/cryptography/modern/rsa' },
      { name: 'Эль-Гамаль', link: '/docs/cryptography/modern/elgamal' },
      { name: 'Диффи-Хеллман', link: '/docs/cryptography/modern/key-exchange' },
    ]
  },
  {
    name: 'Блочные шифры',
    icon: '🧱',
    tools: [
      { name: 'AES', link: '/docs/cryptography/modern/aes' },
      { name: 'DES', link: '/docs/cryptography/modern/des' },
      { name: 'ГОСТ Магма', link: '/docs/cryptography/modern/magma' },
      { name: 'ГОСТ Кузнечик', link: '/docs/cryptography/modern/gost' },
    ]
  },
  {
    name: 'Хеш-функции',
    icon: '#️⃣',
    tools: [
      { name: 'SHA-256', link: '/docs/cryptography/modern/hash-functions' },
      { name: 'HMAC', link: '/docs/cryptography/modern/hash-functions#hmac' },
      { name: 'Стрибог', link: '/docs/cryptography/modern/gost#гост-р-3411-2012-стрибог' },
    ]
  },
  {
    name: 'Сетевые утилиты',
    icon: '🛠️',
    tools: [
      { name: 'IP калькулятор', link: '/docs/networks/ip-addressing' },
      { name: 'MAC анализатор', link: '/docs/networks/mac-ethernet' },
      { name: 'OSI модель', link: '/docs/networks/osi' },
      { name: 'DNS резолвер', link: '/docs/networks/dns' },
      { name: 'HTTP анализатор', link: '/docs/networks/http' },
      { name: 'Firewall симулятор', link: '/docs/networks/firewall' },
    ]
  },
  {
    name: 'Архитектура',
    icon: '💻',
    tools: [
      { name: 'Иерархия памяти', link: '/docs/computer-architecture/cpu-memory#иерархия-памяти' },
      { name: 'Конвертер систем', link: '/docs/computer-architecture/cpu-memory#конвертер-систем-счисления' },
      { name: 'Размеры данных', link: '/docs/computer-architecture/cpu-memory#калькулятор-размеров-данных' },
      { name: 'Память процесса', link: '/docs/computer-architecture/cpu-memory#память-процесса' },
    ]
  },
];

// Быстрые ссылки
const quickLinks = [
  { name: 'Начать с основ', link: '/docs/intro', icon: '📚' },
  { name: 'Классические шифры', link: '/docs/cryptography/classical/intro', icon: '🏛️' },
  { name: 'Модель OSI', link: '/docs/networks/osi', icon: '📡' },
  { name: 'ГОСТ алгоритмы', link: '/docs/cryptography/modern/gost', icon: '🔒' },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroBackground}></div>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>🛡️</div>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          
          {/* Быстрые ссылки */}
          <div className={styles.quickLinks}>
            {quickLinks.map((item, idx) => (
              <Link key={idx} to={item.link} className={styles.quickLink}>
                <span className={styles.quickLinkIcon}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function SectionCard({title, emoji, description, link, color, stats, topics}) {
  return (
    <Link to={link} className={styles.sectionCard} style={{'--card-color': color} as any}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionEmoji}>{emoji}</div>
        <div className={styles.sectionStats}>{stats}</div>
      </div>
      <Heading as="h3" className={styles.sectionTitle}>{title}</Heading>
      <p className={styles.sectionDesc}>{description}</p>
      <div className={styles.sectionTopics}>
        {topics.map((topic, idx) => (
          <span key={idx} className={styles.topicTag}>{topic}</span>
        ))}
      </div>
      <span className={styles.sectionArrow}>→</span>
    </Link>
  );
}

function ToolsSection() {
  return (
    <section className={styles.toolsSection}>
      <div className="container">
        <Heading as="h2" className={styles.toolsSectionTitle}>
          🔧 Интерактивные инструменты
        </Heading>
        <p className={styles.toolsSectionDesc}>
          20+ инструментов для изучения криптографии и сетей
        </p>
        
        <div className={styles.toolCategories}>
          {toolCategories.map((category, idx) => (
            <div key={idx} className={styles.toolCategory}>
              <h3 className={styles.categoryHeader}>
                <span>{category.icon}</span> {category.name}
              </h3>
              <div className={styles.categoryTools}>
                {category.tools.map((tool, tidx) => (
                  <Link key={tidx} to={tool.link} className={styles.toolCard}>
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>20+</div>
            <div className={styles.statLabel}>Интерактивных инструментов</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>14</div>
            <div className={styles.statLabel}>Криптографических алгоритмов</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>4</div>
            <div className={styles.statLabel}>ГОСТ алгоритма</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>7</div>
            <div className={styles.statLabel}>Уровней OSI</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Проверяем, была ли уже показана заставка в этой сессии
    const hasSeenIntro = sessionStorage.getItem('cybersec-intro-seen');
    if (hasSeenIntro) {
      setIsLoading(false);
      setShowContent(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('cybersec-intro-seen', 'true');
    setIsLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div style={{ 
      opacity: showContent ? 1 : 0, 
      transition: 'opacity 0.5s ease',
    }}>
      <Layout
        title="Главная"
        description="База знаний по информационной безопасности — криптография, сети, ГОСТ алгоритмы">
        <HomepageHeader />
        <main>
          <StatsSection />
          
          <section className={styles.sectionsArea}>
            <div className="container">
              <Heading as="h2" className={styles.areaTitle}>
                📂 Разделы базы знаний
              </Heading>
              <div className={styles.sectionsGrid}>
                {sections.map((props, idx) => (
                  <SectionCard key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
          
          <ToolsSection />
        </main>
      </Layout>
    </div>
  );
}
