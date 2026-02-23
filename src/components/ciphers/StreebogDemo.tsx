import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// S-блок Стрибога (такой же как у Кузнечика)
const STREEBOG_SBOX = [
  0xFC, 0xEE, 0xDD, 0x11, 0xCF, 0x6E, 0x31, 0x16, 0xFB, 0xC4, 0xFA, 0xDA, 0x23, 0xC5, 0x04, 0x4D,
  0xE9, 0x77, 0xF0, 0xDB, 0x93, 0x2E, 0x99, 0xBA, 0x17, 0x36, 0xF1, 0xBB, 0x14, 0xCD, 0x5F, 0xC1,
  0xF9, 0x18, 0x65, 0x5A, 0xE2, 0x5C, 0xEF, 0x21, 0x81, 0x1C, 0x3C, 0x42, 0x8B, 0x01, 0x8E, 0x4F,
  0x05, 0x84, 0x02, 0xAE, 0xE3, 0x6A, 0x8F, 0xA0, 0x06, 0x0B, 0xED, 0x98, 0x7F, 0xD4, 0xD3, 0x1F,
  0xEB, 0x34, 0x2C, 0x51, 0xEA, 0xC8, 0x48, 0xAB, 0xF2, 0x2A, 0x68, 0xA2, 0xFD, 0x3A, 0xCE, 0xCC,
  0xB5, 0x70, 0x0E, 0x56, 0x08, 0x0C, 0x76, 0x12, 0xBF, 0x72, 0x13, 0x47, 0x9C, 0xB7, 0x5D, 0x87,
  0x15, 0xA1, 0x96, 0x29, 0x10, 0x7B, 0x9A, 0xC7, 0xF3, 0x91, 0x78, 0x6F, 0x9D, 0x9E, 0xB2, 0xB1,
  0x32, 0x75, 0x19, 0x3D, 0xFF, 0x35, 0x8A, 0x7E, 0x6D, 0x54, 0xC6, 0x80, 0xC3, 0xBD, 0x0D, 0x57,
  0xDF, 0xF5, 0x24, 0xA9, 0x3E, 0xA8, 0x43, 0xC9, 0xD7, 0x79, 0xD6, 0xF6, 0x7C, 0x22, 0xB9, 0x03,
  0xE0, 0x0F, 0xEC, 0xDE, 0x7A, 0x94, 0xB0, 0xBC, 0xDC, 0xE8, 0x28, 0x50, 0x4E, 0x33, 0x0A, 0x4A,
  0xA7, 0x97, 0x60, 0x73, 0x1E, 0x00, 0x62, 0x44, 0x1A, 0xB8, 0x38, 0x82, 0x64, 0x9F, 0x26, 0x41,
  0xAD, 0x45, 0x46, 0x92, 0x27, 0x5E, 0x55, 0x2F, 0x8C, 0xA3, 0xA5, 0x7D, 0x69, 0xD5, 0x95, 0x3B,
  0x07, 0x58, 0xB3, 0x40, 0x86, 0xAC, 0x1D, 0xF7, 0x30, 0x37, 0x6B, 0xE4, 0x88, 0xD9, 0xE7, 0x89,
  0xE1, 0x1B, 0x83, 0x49, 0x4C, 0x3F, 0xF8, 0xFE, 0x8D, 0x53, 0xAA, 0x90, 0xCA, 0xD8, 0x85, 0x61,
  0x20, 0x71, 0x67, 0xA4, 0x2D, 0x2B, 0x09, 0x5B, 0xCB, 0x9B, 0x25, 0xD0, 0xBE, 0xE5, 0x6C, 0x52,
  0x59, 0xA6, 0x74, 0xD2, 0xE6, 0xF4, 0xB4, 0xC0, 0xD1, 0x66, 0xAF, 0xC2, 0x39, 0x4B, 0x63, 0xB6
];

// Тестовые векторы из ГОСТ
const TEST_VECTORS = {
  empty512: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
  m1_512: '486F64C1917879417FEF082B3381A4E211C324F074654C38823A7B76F830AD00FA1FBAE42B1285C0352F227524BC9AB16254288DD6863DCCD5B9F54A1AD0541B',
  m1_256: '00557BE5E584FD52A449B16B0251D05D27F94AB76CBAA6DA890B59D8EF1E159D'
};

// Упрощённая демонстрация S-преобразования
function demonstrateS(input: string): { bytes: number[]; result: number[] } {
  const bytes: number[] = [];
  const hex = input.replace(/[^0-9A-Fa-f]/g, '');
  
  for (let i = 0; i < Math.min(hex.length, 128); i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16) || 0);
  }
  
  while (bytes.length < 64) bytes.push(0);
  
  const result = bytes.map(b => STREEBOG_SBOX[b]);
  return { bytes, result };
}

// Простое хеширование для демонстрации (НЕ полная реализация)
function simpleHash(text: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Это упрощённая демонстрация, не настоящий Стрибог
  let hash = new Array(64).fill(0);
  
  for (let i = 0; i < data.length; i++) {
    hash[i % 64] ^= STREEBOG_SBOX[data[i]];
    hash[(i + 1) % 64] ^= STREEBOG_SBOX[(data[i] + i) % 256];
  }
  
  // Несколько раундов перемешивания
  for (let round = 0; round < 12; round++) {
    hash = hash.map((b, i) => STREEBOG_SBOX[(b + hash[(i + 1) % 64]) % 256]);
  }
  
  return hash.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export default function StreebogDemo(): JSX.Element {
  const [input, setInput] = useState('Привет, мир!');
  const [hashSize, setHashSize] = useState<256 | 512>(256);
  const [showDetails, setShowDetails] = useState(false);
  
  const hash = simpleHash(input);
  const displayHash = hashSize === 256 ? hash.slice(0, 64) : hash;
  
  const { bytes, result } = demonstrateS(
    Array.from(new TextEncoder().encode(input.slice(0, 32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Стрибог (ГОСТ Р 34.11-2012)</h4>
      </div>
      
      <div className={styles.alphabetSelect}>
        <button 
          className={`${styles.alphabetBtn} ${hashSize === 256 ? styles.active : ''}`}
          onClick={() => setHashSize(256)}
        >
          256 бит
        </button>
        <button 
          className={`${styles.alphabetBtn} ${hashSize === 512 ? styles.active : ''}`}
          onClick={() => setHashSize(512)}
        >
          512 бит
        </button>
      </div>
      
      <div className={styles.inputGroup}>
        <label>Входное сообщение:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Введите текст для хеширования..."
        />
      </div>
      
      <div className={styles.outputGroup}>
        <label>Хеш-значение ({hashSize} бит):</label>
        <div className={styles.output} style={{ 
          fontSize: '0.85rem', 
          wordBreak: 'break-all',
          lineHeight: 1.6
        }}>
          {displayHash || '—'}
        </div>
      </div>
      
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? '▼ Скрыть детали' : '▶ Показать S-преобразование'}
      </button>
      
      {showDetails && (
        <div style={{ marginTop: '1rem' }}>
          <div className={styles.transformBlock}>
            <div className={styles.transformLabel}>Первые байты входа</div>
            <div className={styles.transformValue} style={{ fontSize: '0.8rem' }}>
              {bytes.slice(0, 16).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}
            </div>
          </div>
          
          <div className={styles.transformArrow}>↓ S-блок (π)</div>
          
          <div className={styles.transformBlock} style={{ borderColor: 'var(--ifm-color-primary)' }}>
            <div className={styles.transformLabel}>После S-преобразования</div>
            <div className={styles.transformValue} style={{ fontSize: '0.8rem', color: 'var(--ifm-color-primary)' }}>
              {result.slice(0, 16).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}
            </div>
          </div>
        </div>
      )}
      
      <div style={{ 
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        <strong>Параметры Стрибог:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li>Размер блока: 512 бит</li>
          <li>Размер хеша: 256 или 512 бит</li>
          <li>Раундов сжатия: 12</li>
          <li>Основа: функция сжатия g на базе шифра Кузнечик</li>
        </ul>
      </div>
      
      <div className={styles.hint}>
        ⚠️ Демонстрационная версия. Для криптографии используйте библиотеки с полной реализацией ГОСТ.
      </div>
    </div>
  );
}
