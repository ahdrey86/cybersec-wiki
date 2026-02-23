import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

interface MemoryLevel {
  name: string;
  size: string;
  latency: string;
  latencyNs: number;
  bandwidth: string;
  color: string;
  description: string;
}

const MEMORY_HIERARCHY: MemoryLevel[] = [
  {
    name: 'Регистры',
    size: '~1 КБ',
    latency: '<1 такт',
    latencyNs: 0.3,
    bandwidth: '—',
    color: '#f72585',
    description: 'Сверхбыстрая память внутри CPU. RAX, RBX, RCX... Мгновенный доступ.'
  },
  {
    name: 'L1 Cache',
    size: '32-64 КБ/ядро',
    latency: '3-4 такта',
    latencyNs: 1,
    bandwidth: '~1 ТБ/с',
    color: '#ff6b6b',
    description: 'Кэш первого уровня. Разделён на L1d (данные) и L1i (инструкции).'
  },
  {
    name: 'L2 Cache',
    size: '256-512 КБ/ядро',
    latency: '10-12 тактов',
    latencyNs: 4,
    bandwidth: '~500 ГБ/с',
    color: '#ff9f1c',
    description: 'Кэш второго уровня. Обычно выделенный для каждого ядра.'
  },
  {
    name: 'L3 Cache',
    size: '8-64 МБ',
    latency: '30-40 тактов',
    latencyNs: 12,
    bandwidth: '~200 ГБ/с',
    color: '#00b4d8',
    description: 'Кэш третьего уровня. Общий для всех ядер процессора.'
  },
  {
    name: 'RAM (DDR5)',
    size: '8-128 ГБ',
    latency: '80-100 нс',
    latencyNs: 80,
    bandwidth: '50-70 ГБ/с',
    color: '#00d4aa',
    description: 'Оперативная память. Энергозависимая, требует постоянного обновления.'
  },
  {
    name: 'NVMe SSD',
    size: '256 ГБ - 8 ТБ',
    latency: '10-20 мкс',
    latencyNs: 15000,
    bandwidth: '3-7 ГБ/с',
    color: '#9b5de5',
    description: 'Твердотельный накопитель. Быстрый случайный доступ, нет механики.'
  },
  {
    name: 'SATA SSD',
    size: '128 ГБ - 4 ТБ',
    latency: '50-100 мкс',
    latencyNs: 75000,
    bandwidth: '500-550 МБ/с',
    color: '#7b68ee',
    description: 'SSD с интерфейсом SATA. Ограничен пропускной способностью шины.'
  },
  {
    name: 'HDD',
    size: '500 ГБ - 20 ТБ',
    latency: '5-10 мс',
    latencyNs: 7000000,
    bandwidth: '100-200 МБ/с',
    color: '#6c757d',
    description: 'Жёсткий диск. Механический, медленный случайный доступ.'
  }
];

export default function MemoryHierarchy(): JSX.Element {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  
  const maxLatency = Math.log10(MEMORY_HIERARCHY[MEMORY_HIERARCHY.length - 1].latencyNs);
  
  const getBarWidth = (latencyNs: number) => {
    const logLatency = Math.log10(Math.max(latencyNs, 0.1));
    return Math.max(5, (logLatency / maxLatency) * 100);
  };
  
  const selected = selectedLevel !== null ? MEMORY_HIERARCHY[selectedLevel] : null;
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🧠 Иерархия памяти</h4>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => setCompareMode(e.target.checked)}
          />
          <span>Показать сравнение задержек (логарифмическая шкала)</span>
        </label>
      </div>
      
      {/* Пирамида памяти */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {MEMORY_HIERARCHY.map((level, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedLevel(selectedLevel === idx ? null : idx)}
            style={{
              display: 'grid',
              gridTemplateColumns: compareMode ? '140px 1fr 100px 100px' : '140px 100px 100px 1fr',
              gap: '1rem',
              padding: '0.75rem 1rem',
              background: selectedLevel === idx ? `${level.color}25` : 'var(--ifm-color-emphasis-100)',
              borderLeft: `4px solid ${level.color}`,
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer',
              transition: 'all 0.2s',
              alignItems: 'center'
            }}
          >
            <div style={{ fontWeight: 600, color: level.color }}>{level.name}</div>
            
            {compareMode ? (
              <>
                <div style={{ 
                  height: '20px',
                  background: `linear-gradient(90deg, ${level.color} 0%, ${level.color}50 100%)`,
                  width: `${getBarWidth(level.latencyNs)}%`,
                  borderRadius: '4px',
                  minWidth: '20px'
                }} />
                <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>{level.latency}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>{level.size}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.85rem' }}>{level.size}</div>
                <div style={{ fontSize: '0.85rem' }}>{level.latency}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>{level.bandwidth}</div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Детали выбранного уровня */}
      {selected && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: `${selected.color}15`,
          borderRadius: '8px',
          border: `1px solid ${selected.color}50`
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: selected.color }}>{selected.name}</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{selected.description}</p>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>Размер</div>
              <div style={{ fontWeight: 600 }}>{selected.size}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>Задержка</div>
              <div style={{ fontWeight: 600 }}>{selected.latency}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>Пропускная способность</div>
              <div style={{ fontWeight: 600 }}>{selected.bandwidth}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Сравнительная статистика */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        <strong>📊 Соотношение задержек:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li>L1 → RAM: в <strong>~80×</strong> медленнее</li>
          <li>RAM → SSD: в <strong>~200×</strong> медленнее</li>
          <li>SSD → HDD: в <strong>~500×</strong> медленнее</li>
          <li>Регистры → HDD: в <strong>~23 000 000×</strong> медленнее</li>
        </ul>
      </div>
      
      <div className={styles.hint}>
        💡 Кликните на уровень для подробной информации
      </div>
    </div>
  );
}
