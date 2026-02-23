import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// S-блоки ГОСТ Р 34.12-2015 "Магма" (id-tc26-gost-28147-param-Z)
const MAGMA_SBOX = [
  [12, 4, 6, 2, 10, 5, 11, 9, 14, 8, 13, 7, 0, 3, 15, 1],  // S0
  [6, 8, 2, 3, 9, 10, 5, 12, 1, 14, 4, 7, 11, 13, 0, 15], // S1
  [11, 3, 5, 8, 2, 15, 10, 13, 14, 1, 7, 4, 12, 9, 6, 0], // S2
  [12, 8, 2, 1, 13, 4, 15, 6, 7, 0, 10, 5, 3, 14, 9, 11], // S3
  [7, 15, 5, 10, 8, 1, 6, 13, 0, 9, 3, 14, 11, 4, 2, 12], // S4
  [5, 13, 15, 6, 9, 2, 12, 10, 11, 7, 8, 1, 4, 3, 14, 0], // S5
  [8, 14, 2, 5, 6, 9, 1, 12, 15, 4, 11, 0, 13, 10, 3, 7], // S6
  [1, 7, 14, 13, 0, 5, 8, 3, 4, 15, 10, 6, 9, 12, 11, 2]  // S7
];

function applySubstitution(value: number): { result: number; steps: any[] } {
  const steps: any[] = [];
  let result = 0;
  
  for (let i = 0; i < 8; i++) {
    const nibble = (value >> (i * 4)) & 0xF;
    const substituted = MAGMA_SBOX[i][nibble];
    result |= (substituted << (i * 4));
    
    steps.push({
      block: i,
      input: nibble.toString(16).toUpperCase(),
      output: substituted.toString(16).toUpperCase()
    });
  }
  
  return { result, steps };
}

function rotateLeft11(value: number): number {
  return ((value << 11) | (value >>> (32 - 11))) >>> 0;
}

export default function MagmaSBox(): JSX.Element {
  const [input, setInput] = useState('FEDCBA98');
  const [showAllSboxes, setShowAllSboxes] = useState(false);
  
  const inputNum = parseInt(input, 16) || 0;
  const { result, steps } = applySubstitution(inputNum);
  const rotated = rotateLeft11(result);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔲 S-блок замены ГОСТ «Магма»</h4>
      </div>
      
      <div className={styles.inputGroup}>
        <label>Входное значение (32 бита, HEX):</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 8))}
          className={styles.keyInput}
          placeholder="FEDCBA98"
          style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}
        />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          background: 'var(--ifm-color-emphasis-100)', 
          padding: '1rem', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>Вход</div>
          <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
            {inputNum.toString(16).toUpperCase().padStart(8, '0')}
          </div>
        </div>
        <div style={{ 
          background: 'rgba(0, 212, 170, 0.1)', 
          padding: '1rem', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>После S-блока</div>
          <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {result.toString(16).toUpperCase().padStart(8, '0')}
          </div>
        </div>
        <div style={{ 
          background: 'rgba(155, 93, 229, 0.1)', 
          padding: '1rem', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>После ROL11</div>
          <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#9b5de5' }}>
            {rotated.toString(16).toUpperCase().padStart(8, '0')}
          </div>
        </div>
      </div>
      
      <div className={styles.stepsTable}>
        <table>
          <thead>
            <tr>
              <th>Блок (4 бита)</th>
              <th>S0</th>
              <th>S1</th>
              <th>S2</th>
              <th>S3</th>
              <th>S4</th>
              <th>S5</th>
              <th>S6</th>
              <th>S7</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Вход</strong></td>
              {steps.map((s, i) => (
                <td key={i}><code>{s.input}</code></td>
              ))}
            </tr>
            <tr>
              <td><strong>Выход</strong></td>
              {steps.map((s, i) => (
                <td key={i}><code style={{ color: 'var(--ifm-color-primary)' }}>{s.output}</code></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowAllSboxes(!showAllSboxes)}
      >
        {showAllSboxes ? '▼ Скрыть S-блоки' : '▶ Показать все S-блоки'}
      </button>
      
      {showAllSboxes && (
        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <table className={styles.stepsTable} style={{ fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th>Вход</th>
                {Array.from({ length: 16 }, (_, i) => (
                  <th key={i}>{i.toString(16).toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MAGMA_SBOX.map((row, i) => (
                <tr key={i}>
                  <th>S{i}</th>
                  {row.map((val, j) => (
                    <td key={j}>{val.toString(16).toUpperCase()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 S-блок + циклический сдвиг влево на 11 бит = нелинейное преобразование t в функции g
      </div>
    </div>
  );
}
