import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// S-блоки из разных наборов параметров
const SBOX_SETS = {
  'id-tc26-gost-28147-param-Z': {
    name: 'ТК26 (Z)',
    sbox: [
      [12, 4, 6, 2, 10, 5, 11, 9, 14, 8, 13, 7, 0, 3, 15, 1],
      [6, 8, 2, 3, 9, 10, 5, 12, 1, 14, 4, 7, 11, 13, 0, 15],
      [11, 3, 5, 8, 2, 15, 10, 13, 14, 1, 7, 4, 12, 9, 6, 0],
      [12, 8, 2, 1, 13, 4, 15, 6, 7, 0, 10, 5, 3, 14, 9, 11],
      [7, 15, 5, 10, 8, 1, 6, 13, 0, 9, 3, 14, 11, 4, 2, 12],
      [5, 13, 15, 6, 9, 2, 12, 10, 11, 7, 8, 1, 4, 3, 14, 0],
      [8, 14, 2, 5, 6, 9, 1, 12, 15, 4, 11, 0, 13, 10, 3, 7],
      [1, 7, 14, 13, 0, 5, 8, 3, 4, 15, 10, 6, 9, 12, 11, 2]
    ]
  },
  'id-GostR3411-94-CryptoProParamSet': {
    name: 'КриптоПро',
    sbox: [
      [10, 4, 5, 6, 8, 1, 3, 7, 13, 12, 14, 0, 9, 2, 11, 15],
      [5, 15, 4, 0, 2, 13, 11, 9, 1, 7, 6, 3, 12, 14, 10, 8],
      [7, 15, 12, 14, 9, 4, 1, 0, 3, 11, 5, 2, 6, 10, 8, 13],
      [4, 10, 7, 12, 0, 15, 2, 8, 14, 1, 6, 5, 13, 11, 9, 3],
      [7, 6, 4, 11, 9, 12, 2, 10, 1, 8, 0, 14, 15, 13, 3, 5],
      [7, 6, 2, 4, 13, 9, 15, 0, 10, 1, 5, 11, 8, 14, 12, 3],
      [13, 14, 4, 1, 7, 0, 5, 10, 3, 12, 8, 15, 6, 2, 9, 11],
      [1, 3, 10, 9, 5, 11, 4, 15, 8, 6, 7, 14, 13, 0, 2, 12]
    ]
  },
  'id-Gost28147-89-CryptoPro-A-ParamSet': {
    name: 'ЦБ РФ',
    sbox: [
      [9, 6, 3, 2, 8, 11, 1, 7, 10, 4, 14, 15, 12, 0, 13, 5],
      [3, 7, 14, 9, 8, 10, 15, 0, 5, 2, 6, 12, 11, 4, 13, 1],
      [14, 4, 6, 2, 11, 3, 13, 8, 12, 15, 5, 10, 0, 7, 1, 9],
      [14, 7, 10, 12, 13, 1, 3, 9, 0, 2, 11, 4, 15, 8, 5, 6],
      [11, 5, 1, 9, 8, 13, 15, 0, 14, 4, 2, 3, 12, 7, 10, 6],
      [3, 10, 13, 12, 1, 2, 0, 11, 7, 5, 9, 4, 8, 15, 14, 6],
      [1, 13, 2, 9, 7, 10, 6, 0, 8, 12, 4, 5, 15, 3, 11, 14],
      [11, 10, 15, 5, 0, 12, 14, 8, 6, 2, 3, 9, 1, 7, 13, 4]
    ]
  }
};

// Функция g (преобразование t)
function gostG(a: number, k: number, sbox: number[][]): number {
  const sum = (a + k) >>> 0;
  
  let result = 0;
  for (let i = 0; i < 8; i++) {
    const nibble = (sum >> (i * 4)) & 0xF;
    result |= (sbox[i][nibble] << (i * 4));
  }
  
  // Циклический сдвиг влево на 11 бит
  return ((result << 11) | (result >>> 21)) >>> 0;
}

// Один раунд ГОСТ
function gostRound(left: number, right: number, key: number, sbox: number[][]): [number, number] {
  const newLeft = right;
  const newRight = left ^ gostG(right, key, sbox);
  return [newLeft, newRight];
}

// Демонстрация одного раунда
function demonstrateRound(input: string, key: string, sboxKey: string): {
  left: number;
  right: number;
  keyVal: number;
  afterAdd: number;
  afterSbox: number;
  afterShift: number;
  newLeft: number;
  newRight: number;
} {
  const inputNum = parseInt(input.replace(/[^0-9A-Fa-f]/g, '').padEnd(16, '0').slice(0, 16), 16) || 0;
  const keyNum = parseInt(key.replace(/[^0-9A-Fa-f]/g, '').padEnd(8, '0').slice(0, 8), 16) || 0;
  
  const left = (inputNum / 0x100000000) >>> 0;
  const right = inputNum >>> 0;
  
  const sum = (right + keyNum) >>> 0;
  
  const sbox = SBOX_SETS[sboxKey]?.sbox || SBOX_SETS['id-tc26-gost-28147-param-Z'].sbox;
  
  let afterSbox = 0;
  for (let i = 0; i < 8; i++) {
    const nibble = (sum >> (i * 4)) & 0xF;
    afterSbox |= (sbox[i][nibble] << (i * 4));
  }
  
  const afterShift = ((afterSbox << 11) | (afterSbox >>> 21)) >>> 0;
  
  return {
    left,
    right,
    keyVal: keyNum,
    afterAdd: sum,
    afterSbox,
    afterShift,
    newLeft: right,
    newRight: left ^ afterShift
  };
}

export default function Gost28147Demo(): JSX.Element {
  const [input, setInput] = useState('FEDCBA9876543210');
  const [subkey, setSubkey] = useState('12345678');
  const [sboxSet, setSboxSet] = useState<string>('id-tc26-gost-28147-param-Z');
  
  const result = demonstrateRound(input, subkey, sboxSet);
  const sbox = SBOX_SETS[sboxSet]?.sbox || SBOX_SETS['id-tc26-gost-28147-param-Z'].sbox;
  
  const toHex = (n: number, len: number = 8) => n.toString(16).toUpperCase().padStart(len, '0');
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔒 ГОСТ 28147-89 (раунд)</h4>
      </div>
      
      <div className={styles.inputGroup}>
        <label>Набор S-блоков:</label>
        <select
          value={sboxSet}
          onChange={(e) => setSboxSet(e.target.value)}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '8px', 
            border: '2px solid var(--ifm-color-emphasis-300)',
            background: 'var(--ifm-background-color)',
            width: '100%'
          }}
        >
          {Object.entries(SBOX_SETS).map(([key, val]) => (
            <option key={key} value={key}>{val.name}</option>
          ))}
        </select>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Входной блок (64 бит, HEX):</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 16))}
            style={{ fontFamily: 'monospace' }}
            placeholder="FEDCBA9876543210"
          />
        </div>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Подключ Ki (32 бит, HEX):</label>
          <input
            type="text"
            value={subkey}
            onChange={(e) => setSubkey(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 8))}
            style={{ fontFamily: 'monospace' }}
            placeholder="12345678"
          />
        </div>
      </div>
      
      <div className={styles.gostDiagram}>
        <div className={styles.gostStep}>
          <div className={styles.gostHalf}>
            <span className={styles.gostLabel}>L</span>
            <code>{toHex(result.left)}</code>
          </div>
          <div className={styles.gostHalf}>
            <span className={styles.gostLabel}>R</span>
            <code>{toHex(result.right)}</code>
          </div>
        </div>
        
        <div className={styles.gostArrow}>
          <span>R + K = {toHex(result.afterAdd)}</span>
        </div>
        
        <div className={styles.gostStep}>
          <div className={styles.gostBox} style={{ background: 'rgba(0, 212, 170, 0.2)' }}>
            S-блок → {toHex(result.afterSbox)}
          </div>
        </div>
        
        <div className={styles.gostArrow}>
          <span>ROL 11 → {toHex(result.afterShift)}</span>
        </div>
        
        <div className={styles.gostStep}>
          <div className={styles.gostBox} style={{ background: 'rgba(155, 93, 229, 0.2)' }}>
            XOR с L → {toHex(result.newRight)}
          </div>
        </div>
        
        <div className={styles.gostArrow}>↓ Swap</div>
        
        <div className={styles.gostStep}>
          <div className={styles.gostHalf} style={{ borderColor: 'var(--ifm-color-primary)' }}>
            <span className={styles.gostLabel}>L'</span>
            <code style={{ color: 'var(--ifm-color-primary)' }}>{toHex(result.newLeft)}</code>
          </div>
          <div className={styles.gostHalf} style={{ borderColor: '#9b5de5' }}>
            <span className={styles.gostLabel}>R'</span>
            <code style={{ color: '#9b5de5' }}>{toHex(result.newRight)}</code>
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '1rem',
        padding: '0.75rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        <strong>Выход раунда:</strong>{' '}
        <code style={{ color: 'var(--ifm-color-primary)' }}>
          {toHex(result.newLeft)}{toHex(result.newRight)}
        </code>
      </div>
      
      <div className={styles.hint}>
        💡 ГОСТ 28147-89: 64-битный блок, 256-битный ключ, 32 раунда (сеть Фейстеля)
      </div>
    </div>
  );
}
