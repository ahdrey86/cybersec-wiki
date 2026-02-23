import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// DES S-boxes (упрощённо - первые 2)
const DES_SBOXES = [
  // S1
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
  ],
  // S2
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
  ],
  // S3
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
  ],
  // S4
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
  ],
];

// Начальная перестановка IP
const IP = [
  58, 50, 42, 34, 26, 18, 10, 2,
  60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5,
  63, 55, 47, 39, 31, 23, 15, 7
];

// Расширение E
const E_TABLE = [
  32, 1, 2, 3, 4, 5,
  4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1
];

// Перестановка P
const P_TABLE = [
  16, 7, 20, 21, 29, 12, 28, 17,
  1, 15, 23, 26, 5, 18, 31, 10,
  2, 8, 24, 14, 32, 27, 3, 9,
  19, 13, 30, 6, 22, 11, 4, 25
];

// Симуляция одного раунда DES
const desRound = (r: string, k: string): { expanded: string; xored: string; sboxOut: string; permuted: string } => {
  // E-расширение (32 -> 48 бит) - упрощённо
  const expanded = r.padStart(32, '0').slice(0, 32) + r.slice(0, 16);
  
  // XOR с ключом
  let xored = '';
  for (let i = 0; i < Math.min(expanded.length, k.length); i++) {
    xored += (parseInt(expanded[i], 16) ^ parseInt(k[i] || '0', 16)).toString(16).toUpperCase();
  }
  
  // S-boxes (упрощённо)
  let sboxOut = '';
  for (let i = 0; i < 8; i++) {
    const chunk = parseInt(xored.slice(i * 2, i * 2 + 2) || '0', 16);
    const row = ((chunk & 0x20) >> 4) | (chunk & 0x01);
    const col = (chunk >> 1) & 0x0F;
    const sbox = DES_SBOXES[i % 4];
    sboxOut += sbox[row][col].toString(16).toUpperCase();
  }
  
  // P-перестановка (упрощённо)
  const permuted = sboxOut;
  
  return { expanded, xored, sboxOut, permuted };
};

export default function DESVisualizer(): JSX.Element {
  const [input, setInput] = useState('0123456789ABCDEF');
  const [key, setKey] = useState('133457799BBCDFF1');
  const [currentRound, setCurrentRound] = useState(0);
  const [showSbox, setShowSbox] = useState(false);
  
  // Разбиваем на L и R
  const cleanInput = input.replace(/[^0-9A-Fa-f]/g, '').padEnd(16, '0').slice(0, 16).toUpperCase();
  const cleanKey = key.replace(/[^0-9A-Fa-f]/g, '').padEnd(16, '0').slice(0, 16).toUpperCase();
  
  const L0 = cleanInput.slice(0, 8);
  const R0 = cleanInput.slice(8, 16);
  
  // Вычисляем раунд
  const roundResult = desRound(R0, cleanKey.slice(0, 12));
  
  // XOR L с результатом
  let newR = '';
  for (let i = 0; i < 8; i++) {
    newR += (parseInt(L0[i], 16) ^ parseInt(roundResult.permuted[i] || '0', 16)).toString(16).toUpperCase();
  }
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔒 DES (Data Encryption Standard)</h4>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Plaintext (64 бит, HEX):</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 16).toUpperCase())}
            style={{ fontFamily: 'monospace' }}
            placeholder="0123456789ABCDEF"
          />
        </div>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Key (64 бит, HEX):</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 16).toUpperCase())}
            style={{ fontFamily: 'monospace' }}
            placeholder="133457799BBCDFF1"
          />
        </div>
      </div>
      
      {/* Структура Фейстеля */}
      <div style={{
        padding: '1.5rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>Сеть Фейстеля (1 раунд)</h4>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(247, 37, 133, 0.2)',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>L₀ (32 бит)</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{L0}</div>
          </div>
          
          <div style={{
            padding: '1rem',
            background: 'rgba(0, 180, 216, 0.2)',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>R₀ (32 бит)</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{R0}</div>
          </div>
        </div>
        
        {/* Функция F */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div></div>
          
          <div style={{
            padding: '1rem',
            background: 'rgba(155, 93, 229, 0.2)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Функция F(R₀, K₁)</div>
            
            <div style={{ fontSize: '0.75rem', textAlign: 'left' }}>
              <div>E-расширение: <code>{roundResult.expanded.slice(0, 12)}...</code></div>
              <div>XOR с K₁: <code>{roundResult.xored.slice(0, 8)}...</code></div>
              <div>S-boxes: <code>{roundResult.sboxOut}</code></div>
              <div>P-перестановка: <code>{roundResult.permuted}</code></div>
            </div>
          </div>
          
          <div></div>
        </div>
        
        {/* Результат раунда */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '2px dashed var(--ifm-color-emphasis-300)'
        }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(0, 180, 216, 0.2)',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>L₁ = R₀</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{R0}</div>
          </div>
          
          <div style={{
            padding: '1rem',
            background: 'rgba(0, 212, 170, 0.2)',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>R₁ = L₀ ⊕ F</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>{newR}</div>
          </div>
        </div>
      </div>
      
      {/* Структура DES */}
      <div style={{
        padding: '1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <strong>Структура DES:</strong>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginTop: '0.75rem',
          flexWrap: 'wrap',
          fontSize: '0.85rem'
        }}>
          <span style={{ padding: '0.4rem', background: '#ff9f1c30', borderRadius: '6px' }}>IP</span>
          <span>→</span>
          <span style={{ padding: '0.4rem', background: '#9b5de530', borderRadius: '6px' }}>16 раундов Фейстеля</span>
          <span>→</span>
          <span style={{ padding: '0.4rem', background: '#00d4aa30', borderRadius: '6px' }}>Swap</span>
          <span>→</span>
          <span style={{ padding: '0.4rem', background: '#00b4d830', borderRadius: '6px' }}>IP⁻¹</span>
        </div>
      </div>
      
      {/* Функция F детально */}
      <div style={{
        padding: '1rem',
        background: 'rgba(155, 93, 229, 0.1)',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.9rem'
      }}>
        <strong>Функция F(R, K):</strong>
        <ol style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li><strong>E-расширение:</strong> 32 бит → 48 бит</li>
          <li><strong>XOR</strong> с 48-битным подключом</li>
          <li><strong>S-boxes:</strong> 8 блоков по 6 бит → 8 блоков по 4 бит (48 → 32)</li>
          <li><strong>P-перестановка:</strong> 32 бит → 32 бит</li>
        </ol>
      </div>
      
      {/* S-box */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSbox(!showSbox)}
      >
        {showSbox ? '▼ Скрыть S-Box' : '▶ Показать S-Box 1'}
      </button>
      
      {showSbox && (
        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <table style={{ fontSize: '0.75rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '4px', border: '1px solid var(--ifm-color-emphasis-300)' }}>Row\Col</th>
                {Array.from({ length: 16 }, (_, i) => (
                  <th key={i} style={{ padding: '4px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'var(--ifm-color-primary)', color: '#000' }}>
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DES_SBOXES[0].map((row, r) => (
                <tr key={r}>
                  <th style={{ padding: '4px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'var(--ifm-color-primary)', color: '#000' }}>
                    {r}
                  </th>
                  {row.map((val, c) => (
                    <td key={c} style={{ 
                      padding: '4px', 
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      textAlign: 'center'
                    }}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(239, 71, 111, 0.1)',
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        <strong>⚠️ DES устарел:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li>56-битный ключ (слишком короткий)</li>
          <li>Взломан брутфорсом в 1999</li>
          <li>Заменён на 3DES, затем на AES</li>
        </ul>
      </div>
      
      <div className={styles.hint}>
        💡 DES: 64-битный блок, 56-битный ключ (+ 8 бит чётности), 16 раундов
      </div>
    </div>
  );
}
