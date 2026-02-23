import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

interface DataUnit {
  name: string;
  short: string;
  bytes: number;
  binary: boolean;
}

const UNITS: DataUnit[] = [
  { name: 'Бит', short: 'bit', bytes: 1/8, binary: false },
  { name: 'Байт', short: 'B', bytes: 1, binary: false },
  { name: 'Килобайт', short: 'KB', bytes: 1000, binary: false },
  { name: 'Кибибайт', short: 'KiB', bytes: 1024, binary: true },
  { name: 'Мегабайт', short: 'MB', bytes: 1000000, binary: false },
  { name: 'Мебибайт', short: 'MiB', bytes: 1048576, binary: true },
  { name: 'Гигабайт', short: 'GB', bytes: 1000000000, binary: false },
  { name: 'Гибибайт', short: 'GiB', bytes: 1073741824, binary: true },
  { name: 'Терабайт', short: 'TB', bytes: 1000000000000, binary: false },
  { name: 'Тебибайт', short: 'TiB', bytes: 1099511627776, binary: true },
  { name: 'Петабайт', short: 'PB', bytes: 1000000000000000, binary: false },
  { name: 'Пебибайт', short: 'PiB', bytes: 1125899906842624, binary: true },
];

const DATA_EXAMPLES = [
  { name: 'Символ ASCII', bytes: 1 },
  { name: 'Символ UTF-8 (кириллица)', bytes: 2 },
  { name: 'Пиксель RGB', bytes: 3 },
  { name: 'Пиксель RGBA', bytes: 4 },
  { name: 'Сектор диска', bytes: 512 },
  { name: 'Страница памяти', bytes: 4096 },
  { name: 'Ethernet MTU', bytes: 1500 },
  { name: 'Фото 12 Мп (JPEG)', bytes: 4000000 },
  { name: 'Фото 12 Мп (RAW)', bytes: 25000000 },
  { name: 'Минута MP3 (320 kbps)', bytes: 2400000 },
  { name: 'Минута видео 1080p', bytes: 150000000 },
  { name: 'Минута видео 4K', bytes: 400000000 },
];

export default function DataSizeCalculator(): JSX.Element {
  const [inputValue, setInputValue] = useState('1');
  const [inputUnit, setInputUnit] = useState('GiB');
  const [showBinaryOnly, setShowBinaryOnly] = useState(false);
  
  const selectedUnit = UNITS.find(u => u.short === inputUnit) || UNITS[1];
  const totalBytes = parseFloat(inputValue) * selectedUnit.bytes;
  
  const formatNumber = (num: number): string => {
    if (num < 0.01) return num.toExponential(2);
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  };
  
  const filteredUnits = showBinaryOnly 
    ? UNITS.filter(u => u.binary || u.short === 'B' || u.short === 'bit')
    : UNITS;
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>💾 Калькулятор размеров данных</h4>
      </div>
      
      {/* Ввод */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className={styles.inputGroup} style={{ flex: '1', minWidth: '150px', marginBottom: 0 }}>
          <label>Значение:</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            min="0"
            step="any"
            style={{ fontSize: '1.1rem' }}
          />
        </div>
        <div className={styles.inputGroup} style={{ flex: '1', minWidth: '150px', marginBottom: 0 }}>
          <label>Единица:</label>
          <select
            value={inputUnit}
            onChange={(e) => setInputUnit(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid var(--ifm-color-emphasis-300)',
              background: 'var(--ifm-background-color)',
              fontSize: '1rem',
              width: '100%'
            }}
          >
            {UNITS.map(unit => (
              <option key={unit.short} value={unit.short}>
                {unit.name} ({unit.short})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showBinaryOnly}
            onChange={(e) => setShowBinaryOnly(e.target.checked)}
          />
          <span>Только двоичные единицы (IEC)</span>
        </label>
      </div>
      
      {/* Результаты */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {filteredUnits.map(unit => {
          const value = totalBytes / unit.bytes;
          const isInput = unit.short === inputUnit;
          
          return (
            <div
              key={unit.short}
              style={{
                padding: '0.75rem',
                background: isInput ? 'rgba(0, 212, 170, 0.15)' : 
                           unit.binary ? 'rgba(155, 93, 229, 0.1)' : 'var(--ifm-color-emphasis-100)',
                borderRadius: '8px',
                border: isInput ? '2px solid var(--ifm-color-primary)' : 
                       unit.binary ? '1px solid rgba(155, 93, 229, 0.3)' : '1px solid transparent'
              }}
            >
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--ifm-color-emphasis-600)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{unit.name}</span>
                <span style={{ 
                  color: unit.binary ? '#9b5de5' : 'var(--ifm-color-emphasis-500)',
                  fontSize: '0.7rem'
                }}>
                  {unit.binary ? 'IEC' : 'SI'}
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.1rem' }}>
                {formatNumber(value)} <span style={{ color: 'var(--ifm-color-emphasis-500)' }}>{unit.short}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Точное значение в байтах */}
      <div style={{
        padding: '1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>Точное значение:</div>
        <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 600 }}>
          {Math.floor(totalBytes).toLocaleString('ru-RU')} байт
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.25rem' }}>
          = {(Math.floor(totalBytes) * 8).toLocaleString('ru-RU')} бит
        </div>
      </div>
      
      {/* Примеры */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>📦 Сколько поместится:</div>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.5rem'
        }}>
          {DATA_EXAMPLES.filter(ex => totalBytes / ex.bytes >= 1).slice(0, 6).map(example => {
            const count = Math.floor(totalBytes / example.bytes);
            return (
              <div
                key={example.name}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'var(--ifm-color-emphasis-100)',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem'
                }}
              >
                <span>{example.name}</span>
                <strong>{count.toLocaleString('ru-RU')}</strong>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Справка */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(155, 93, 229, 0.1)',
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        <strong>📚 SI vs IEC:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li><strong>SI (десятичные):</strong> KB = 1000 B, MB = 1000 KB — используются производителями HDD/SSD</li>
          <li><strong>IEC (двоичные):</strong> KiB = 1024 B, MiB = 1024 KiB — используются ОС и программами</li>
          <li>Поэтому диск "500 ГБ" в системе показывает ~465 ГиБ</li>
        </ul>
      </div>
      
      <div className={styles.hint}>
        💡 1 GiB = 1024 MiB = 1 073 741 824 байт
      </div>
    </div>
  );
}
