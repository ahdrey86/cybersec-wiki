import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

// Симуляция DNS записей
const DNS_DATABASE: Record<string, Record<string, string[]>> = {
  'google.com': {
    A: ['142.250.185.46'],
    AAAA: ['2a00:1450:4010:c08::65'],
    MX: ['10 smtp.google.com', '20 smtp2.google.com'],
    NS: ['ns1.google.com', 'ns2.google.com'],
    TXT: ['v=spf1 include:_spf.google.com ~all'],
  },
  'yandex.ru': {
    A: ['5.255.255.70', '77.88.55.88'],
    AAAA: ['2a02:6b8::2:242'],
    MX: ['10 mx.yandex.ru'],
    NS: ['ns1.yandex.ru', 'ns2.yandex.ru'],
    TXT: ['v=spf1 redirect=_spf.yandex.ru'],
  },
  'example.com': {
    A: ['93.184.216.34'],
    AAAA: ['2606:2800:220:1:248:1893:25c8:1946'],
    MX: ['0 .'],
    NS: ['a.iana-servers.net', 'b.iana-servers.net'],
    TXT: ['v=spf1 -all'],
  },
  'github.com': {
    A: ['140.82.121.4'],
    MX: ['1 aspmx.l.google.com', '5 alt1.aspmx.l.google.com'],
    NS: ['dns1.p08.nsone.net', 'dns2.p08.nsone.net'],
    TXT: ['v=spf1 include:_netblocks.google.com'],
  },
  'mail.ru': {
    A: ['94.100.180.70', '217.69.139.70'],
    MX: ['10 mxs.mail.ru'],
    NS: ['ns1.mail.ru', 'ns2.mail.ru'],
    TXT: ['v=spf1 include:_spf.mail.ru ~all'],
  },
};

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'PTR'];

const RECORD_DESCRIPTIONS: Record<string, string> = {
  A: 'IPv4 адрес хоста',
  AAAA: 'IPv6 адрес хоста',
  MX: 'Почтовый сервер (Mail Exchange)',
  NS: 'Авторитетный DNS сервер',
  TXT: 'Текстовая запись (SPF, DKIM)',
  CNAME: 'Каноническое имя (алиас)',
  SOA: 'Start of Authority',
  PTR: 'Обратная запись (IP → имя)',
};

// Иерархия DNS
const DNS_HIERARCHY = [
  { level: 'Root', servers: '. (корневые серверы a-m.root-servers.net)', color: '#f72585' },
  { level: 'TLD', servers: '.com, .ru, .org, .net', color: '#9b5de5' },
  { level: 'Authoritative', servers: 'ns1.example.com', color: '#00b4d8' },
  { level: 'Recursive', servers: '8.8.8.8, 1.1.1.1', color: '#00d4aa' },
];

export default function DnsResolver(): JSX.Element {
  const [domain, setDomain] = useState('google.com');
  const [recordType, setRecordType] = useState('A');
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [querySteps, setQuerySteps] = useState<string[]>([]);
  
  const normalizedDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  
  const performQuery = () => {
    const steps: string[] = [];
    steps.push(`1. Клиент → Recursive DNS (8.8.8.8): "Где ${normalizedDomain}?"`);
    steps.push(`2. Recursive → Root (.): "Кто отвечает за .${normalizedDomain.split('.').pop()}?"`);
    steps.push(`3. Root → Recursive: "Спроси TLD сервер .${normalizedDomain.split('.').pop()}"`);
    steps.push(`4. Recursive → TLD: "Кто отвечает за ${normalizedDomain}?"`);
    steps.push(`5. TLD → Recursive: "Спроси ns1.${normalizedDomain}"`);
    steps.push(`6. Recursive → Authoritative: "Дай ${recordType} для ${normalizedDomain}"`);
    steps.push(`7. Authoritative → Recursive → Клиент: Ответ получен!`);
    setQuerySteps(steps);
  };
  
  const records = DNS_DATABASE[normalizedDomain];
  const result = records?.[recordType] || null;
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🌍 DNS Резолвер</h4>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Доменное имя:</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
          />
        </div>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Тип записи:</label>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            style={{ 
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid var(--ifm-color-emphasis-300)',
              background: 'var(--ifm-background-color)',
              width: '100%'
            }}
          >
            {RECORD_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={{ 
        padding: '0.5rem 1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.85rem'
      }}>
        <strong>{recordType}:</strong> {RECORD_DESCRIPTIONS[recordType]}
      </div>
      
      <button 
        onClick={performQuery}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#000',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1rem',
          width: '100%'
        }}
      >
        🔍 Выполнить запрос
      </button>
      
      {/* Результат */}
      <div className={styles.outputGroup}>
        <label>Результат запроса {recordType} для {normalizedDomain}:</label>
        <div className={styles.output} style={{ minHeight: '60px' }}>
          {result ? (
            result.map((r, i) => (
              <div key={i} style={{ 
                padding: '0.5rem',
                background: 'rgba(0, 212, 170, 0.1)',
                borderRadius: '6px',
                marginBottom: i < result.length - 1 ? '0.5rem' : 0,
                fontFamily: 'monospace'
              }}>
                {r}
              </div>
            ))
          ) : (
            <span style={{ color: 'var(--ifm-color-emphasis-600)' }}>
              {normalizedDomain ? `Запись ${recordType} не найдена для ${normalizedDomain}` : 'Введите домен'}
            </span>
          )}
        </div>
      </div>
      
      {/* Шаги запроса */}
      {querySteps.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
            📋 Этапы DNS-запроса:
          </label>
          <div style={{ 
            background: 'var(--ifm-color-emphasis-100)',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            {querySteps.map((step, i) => (
              <div key={i} style={{ 
                padding: '0.5rem',
                borderLeft: `3px solid ${DNS_HIERARCHY[Math.min(i, 3)].color}`,
                marginBottom: '0.5rem',
                paddingLeft: '1rem',
                fontSize: '0.85rem'
              }}>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowHierarchy(!showHierarchy)}
        style={{ marginTop: '1rem' }}
      >
        {showHierarchy ? '▼ Скрыть иерархию DNS' : '▶ Показать иерархию DNS'}
      </button>
      
      {showHierarchy && (
        <div style={{ marginTop: '1rem' }}>
          {DNS_HIERARCHY.map((level, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              background: `${level.color}15`,
              borderLeft: `4px solid ${level.color}`,
              marginBottom: '0.5rem',
              borderRadius: '0 8px 8px 0'
            }}>
              <div style={{ 
                width: '120px',
                fontWeight: 700,
                color: level.color
              }}>
                {level.level}
              </div>
              <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                {level.servers}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Попробуйте: google.com, yandex.ru, github.com, mail.ru, example.com
      </div>
    </div>
  );
}
