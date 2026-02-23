import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// AES S-Box
const AES_SBOX = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

// Преобразования AES
const subBytes = (state: number[][]): number[][] => {
  return state.map(row => row.map(b => AES_SBOX[b]));
};

const shiftRows = (state: number[][]): number[][] => {
  return state.map((row, i) => [...row.slice(i), ...row.slice(0, i)]);
};

// Умножение в GF(2^8)
const gmul = (a: number, b: number): number => {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xFF;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
};

const mixColumns = (state: number[][]): number[][] => {
  const result: number[][] = Array(4).fill(null).map(() => Array(4).fill(0));
  for (let c = 0; c < 4; c++) {
    result[0][c] = gmul(2, state[0][c]) ^ gmul(3, state[1][c]) ^ state[2][c] ^ state[3][c];
    result[1][c] = state[0][c] ^ gmul(2, state[1][c]) ^ gmul(3, state[2][c]) ^ state[3][c];
    result[2][c] = state[0][c] ^ state[1][c] ^ gmul(2, state[2][c]) ^ gmul(3, state[3][c]);
    result[3][c] = gmul(3, state[0][c]) ^ state[1][c] ^ state[2][c] ^ gmul(2, state[3][c]);
  }
  return result;
};

const addRoundKey = (state: number[][], key: number[][]): number[][] => {
  return state.map((row, i) => row.map((b, j) => b ^ key[i][j]));
};

export default function AESVisualizer(): JSX.Element {
  const [input, setInput] = useState('00112233445566778899AABBCCDDEEFF');
  const [key, setKey] = useState('000102030405060708090A0B0C0D0E0F');
  const [currentStep, setCurrentStep] = useState(0);
  const [showSbox, setShowSbox] = useState(false);
  
  // Парсинг входа в матрицу состояния 4x4
  const parseToState = (hex: string): number[][] => {
    const bytes = hex.match(/.{1,2}/g)?.map(h => parseInt(h, 16)) || [];
    while (bytes.length < 16) bytes.push(0);
    const state: number[][] = [[], [], [], []];
    for (let i = 0; i < 16; i++) {
      state[i % 4].push(bytes[i]);
    }
    return state;
  };
  
  const stateToHex = (state: number[][]): string => {
    let result = '';
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        result += state[r][c].toString(16).toUpperCase().padStart(2, '0');
      }
    }
    return result;
  };
  
  const initialState = parseToState(input);
  const keyState = parseToState(key);
  
  // Выполняем шаги
  const steps = [
    { name: 'Вход', state: initialState },
    { name: 'AddRoundKey (начальный)', state: addRoundKey(initialState, keyState) },
    { name: 'SubBytes', state: subBytes(addRoundKey(initialState, keyState)) },
    { name: 'ShiftRows', state: shiftRows(subBytes(addRoundKey(initialState, keyState))) },
    { name: 'MixColumns', state: mixColumns(shiftRows(subBytes(addRoundKey(initialState, keyState)))) },
  ];
  
  const currentState = steps[Math.min(currentStep, steps.length - 1)];
  
  const renderState = (state: number[][], highlight?: string) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '4px',
      maxWidth: '200px',
      margin: '0 auto'
    }}>
      {state.map((row, i) => 
        row.map((byte, j) => (
          <div
            key={`${i}-${j}`}
            style={{
              padding: '8px 4px',
              background: highlight === 'row' && i === currentStep - 3 
                ? 'rgba(247, 37, 133, 0.3)'
                : 'var(--ifm-color-emphasis-200)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              textAlign: 'center',
              fontWeight: 600
            }}
          >
            {byte.toString(16).toUpperCase().padStart(2, '0')}
          </div>
        ))
      )}
    </div>
  );
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 AES (Rijndael) визуализация</h4>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Plaintext (128 бит, HEX):</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 32).toUpperCase())}
            style={{ fontFamily: 'monospace' }}
          />
        </div>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Key (128 бит, HEX):</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 32).toUpperCase())}
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      </div>
      
      {/* Шаги */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            style={{
              padding: '0.5rem 1rem',
              background: currentStep === idx ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
              color: currentStep === idx ? '#000' : 'var(--ifm-font-color-base)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            {idx + 1}. {step.name}
          </button>
        ))}
      </div>
      
      {/* Визуализация текущего шага */}
      <div style={{
        padding: '1.5rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {currentState.name}
        </h4>
        
        {renderState(currentState.state)}
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          <strong>HEX:</strong> {stateToHex(currentState.state)}
        </div>
      </div>
      
      {/* Описание операции */}
      <div style={{
        padding: '1rem',
        background: 'rgba(0, 212, 170, 0.1)',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.9rem'
      }}>
        {currentStep === 0 && (
          <p style={{ margin: 0 }}>
            <strong>Вход:</strong> 128-битный блок данных, организованный как матрица 4×4 байт (столбец за столбцом).
          </p>
        )}
        {currentStep === 1 && (
          <p style={{ margin: 0 }}>
            <strong>AddRoundKey:</strong> XOR состояния с раундовым ключом. Применяется перед первым раундом и после каждого раунда.
          </p>
        )}
        {currentStep === 2 && (
          <p style={{ margin: 0 }}>
            <strong>SubBytes:</strong> Нелинейная замена каждого байта через S-Box. Обеспечивает путаницу (confusion).
          </p>
        )}
        {currentStep === 3 && (
          <p style={{ margin: 0 }}>
            <strong>ShiftRows:</strong> Циклический сдвиг строк влево. Строка 0 — без сдвига, строка 1 — на 1, строка 2 — на 2, строка 3 — на 3.
          </p>
        )}
        {currentStep === 4 && (
          <p style={{ margin: 0 }}>
            <strong>MixColumns:</strong> Умножение каждого столбца на фиксированную матрицу в GF(2⁸). Обеспечивает диффузию.
          </p>
        )}
      </div>
      
      {/* Структура AES */}
      <div style={{
        padding: '1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <strong>Структура раунда AES:</strong>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '0.75rem',
          flexWrap: 'wrap',
          fontSize: '0.85rem'
        }}>
          <span style={{ padding: '0.5rem', background: '#00d4aa30', borderRadius: '6px' }}>SubBytes</span>
          <span>→</span>
          <span style={{ padding: '0.5rem', background: '#00b4d830', borderRadius: '6px' }}>ShiftRows</span>
          <span>→</span>
          <span style={{ padding: '0.5rem', background: '#9b5de530', borderRadius: '6px' }}>MixColumns*</span>
          <span>→</span>
          <span style={{ padding: '0.5rem', background: '#f7258530', borderRadius: '6px' }}>AddRoundKey</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.5rem', marginBottom: 0 }}>
          * MixColumns не выполняется в последнем раунде
        </p>
      </div>
      
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSbox(!showSbox)}
      >
        {showSbox ? '▼ Скрыть S-Box' : '▶ Показать S-Box'}
      </button>
      
      {showSbox && (
        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <table style={{ fontSize: '0.65rem', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '4px', border: '1px solid var(--ifm-color-emphasis-300)' }}></th>
                {Array.from({ length: 16 }, (_, i) => (
                  <th key={i} style={{ padding: '4px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'var(--ifm-color-primary)', color: '#000' }}>
                    {i.toString(16).toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }, (_, row) => (
                <tr key={row}>
                  <th style={{ padding: '4px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'var(--ifm-color-primary)', color: '#000' }}>
                    {row.toString(16).toUpperCase()}
                  </th>
                  {Array.from({ length: 16 }, (_, col) => (
                    <td key={col} style={{ 
                      padding: '4px', 
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      fontFamily: 'monospace',
                      textAlign: 'center'
                    }}>
                      {AES_SBOX[row * 16 + col].toString(16).toUpperCase().padStart(2, '0')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 AES-128: 10 раундов, AES-192: 12 раундов, AES-256: 14 раундов
      </div>
    </div>
  );
}
