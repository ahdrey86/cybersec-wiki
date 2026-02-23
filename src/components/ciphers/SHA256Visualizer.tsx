import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// SHA-256 константы (первые 32 бита дробных частей кубических корней первых 64 простых чисел)
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

// Начальные значения хеша (первые 32 бита дробных частей квадратных корней первых 8 простых чисел)
const H0 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
];

// Функции SHA-256
const rotr = (x: number, n: number): number => ((x >>> n) | (x << (32 - n))) >>> 0;
const ch = (x: number, y: number, z: number): number => ((x & y) ^ (~x & z)) >>> 0;
const maj = (x: number, y: number, z: number): number => ((x & y) ^ (x & z) ^ (y & z)) >>> 0;
const sigma0 = (x: number): number => (rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22)) >>> 0;
const sigma1 = (x: number): number => (rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25)) >>> 0;
const gamma0 = (x: number): number => (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) >>> 0;
const gamma1 = (x: number): number => (rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10)) >>> 0;

// Простой SHA-256 (одного блока для демонстрации)
const sha256Demo = (message: string): { hash: string; steps: any[] } => {
  const steps: any[] = [];
  
  // Преобразуем в байты
  const encoder = new TextEncoder();
  const msgBytes = encoder.encode(message);
  
  // Padding
  const bitLen = msgBytes.length * 8;
  const padded = new Uint8Array(64);
  padded.set(msgBytes.slice(0, Math.min(55, msgBytes.length)));
  padded[msgBytes.length] = 0x80;
  
  // Длина в конец (big-endian)
  const view = new DataView(padded.buffer);
  view.setUint32(60, bitLen, false);
  
  steps.push({
    name: 'Padding',
    data: Array.from(padded).map(b => b.toString(16).padStart(2, '0')).join(' ')
  });
  
  // Разбиваем на 16 слов
  const W: number[] = [];
  for (let i = 0; i < 16; i++) {
    W[i] = view.getUint32(i * 4, false);
  }
  
  // Расширяем до 64 слов
  for (let i = 16; i < 64; i++) {
    W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) >>> 0;
  }
  
  steps.push({
    name: 'Message Schedule (W)',
    data: W.slice(0, 8).map(w => w.toString(16).padStart(8, '0')).join(' ')
  });
  
  // Инициализация
  let [a, b, c, d, e, f, g, h] = H0;
  
  steps.push({
    name: 'Initial Hash (H0)',
    data: `a=${a.toString(16)} b=${b.toString(16)} c=${c.toString(16)} d=${d.toString(16)}`
  });
  
  // 64 раунда
  for (let i = 0; i < 64; i++) {
    const T1 = (h + sigma1(e) + ch(e, f, g) + K[i] + W[i]) >>> 0;
    const T2 = (sigma0(a) + maj(a, b, c)) >>> 0;
    
    h = g;
    g = f;
    f = e;
    e = (d + T1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (T1 + T2) >>> 0;
    
    if (i < 4 || i === 63) {
      steps.push({
        name: `Round ${i}`,
        data: `a=${a.toString(16).padStart(8, '0')} e=${e.toString(16).padStart(8, '0')}`
      });
    }
  }
  
  // Финальный хеш
  const H = [
    (H0[0] + a) >>> 0,
    (H0[1] + b) >>> 0,
    (H0[2] + c) >>> 0,
    (H0[3] + d) >>> 0,
    (H0[4] + e) >>> 0,
    (H0[5] + f) >>> 0,
    (H0[6] + g) >>> 0,
    (H0[7] + h) >>> 0
  ];
  
  const hash = H.map(h => h.toString(16).padStart(8, '0')).join('');
  
  return { hash, steps };
};

export default function SHA256Visualizer(): JSX.Element {
  const [input, setInput] = useState('hello');
  const [showSteps, setShowSteps] = useState(false);
  const [showConstants, setShowConstants] = useState(false);
  
  const result = sha256Demo(input);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔒 SHA-256 визуализация</h4>
      </div>
      
      <div className={styles.inputGroup}>
        <label>Входное сообщение:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите текст для хеширования"
          maxLength={55}
        />
        <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
          Макс. 55 символов (один блок для демонстрации)
        </span>
      </div>
      
      {/* Результат */}
      <div className={styles.outputGroup}>
        <label>SHA-256 хеш (256 бит / 64 hex):</label>
        <div className={styles.output} style={{ 
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          wordBreak: 'break-all',
          letterSpacing: '0.05em'
        }}>
          {result.hash.toUpperCase()}
        </div>
      </div>
      
      {/* Разбивка на слова */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {result.hash.match(/.{8}/g)?.map((word, i) => (
          <div
            key={i}
            style={{
              padding: '0.5rem',
              background: 'var(--ifm-color-emphasis-100)',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-600)' }}>H{i}</div>
            {word.toUpperCase()}
          </div>
        ))}
      </div>
      
      {/* Структура SHA-256 */}
      <div style={{
        padding: '1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <strong>Структура SHA-256:</strong>
        <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ padding: '0.3rem 0.6rem', background: '#00d4aa30', borderRadius: '4px' }}>1. Padding</span>
            <span>→ Добавление 1 + нули + длина (до 512 бит)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ padding: '0.3rem 0.6rem', background: '#00b4d830', borderRadius: '4px' }}>2. Parse</span>
            <span>→ Разбиение на блоки по 512 бит</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ padding: '0.3rem 0.6rem', background: '#9b5de530', borderRadius: '4px' }}>3. Expand</span>
            <span>→ 16 слов → 64 слова (W₀...W₆₃)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '0.3rem 0.6rem', background: '#f7258530', borderRadius: '4px' }}>4. Compress</span>
            <span>→ 64 раунда с 8 переменными (a-h)</span>
          </div>
        </div>
      </div>
      
      {/* Шаги */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSteps(!showSteps)}
      >
        {showSteps ? '▼ Скрыть шаги' : '▶ Показать шаги обработки'}
      </button>
      
      {showSteps && (
        <div style={{ marginTop: '1rem' }}>
          {result.steps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: '0.5rem 1rem',
                background: i % 2 ? 'var(--ifm-color-emphasis-100)' : 'transparent',
                borderLeft: '3px solid var(--ifm-color-primary)',
                marginBottom: '0.25rem',
                fontSize: '0.85rem'
              }}
            >
              <strong>{step.name}:</strong>
              <code style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>{step.data}</code>
            </div>
          ))}
        </div>
      )}
      
      {/* Константы */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowConstants(!showConstants)}
        style={{ marginTop: '0.5rem' }}
      >
        {showConstants ? '▼ Скрыть константы' : '▶ Показать константы K'}
      </button>
      
      {showConstants && (
        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '4px',
            fontSize: '0.7rem',
            fontFamily: 'monospace'
          }}>
            {K.map((k, i) => (
              <div
                key={i}
                style={{
                  padding: '4px',
                  background: 'var(--ifm-color-emphasis-100)',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.6rem', color: 'var(--ifm-color-emphasis-600)' }}>K{i}</div>
                {k.toString(16).padStart(8, '0')}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 SHA-256 всегда выдаёт 256-битный хеш независимо от длины входа
      </div>
    </div>
  );
}
