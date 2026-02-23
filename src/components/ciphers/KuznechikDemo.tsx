import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// S-блок Кузнечика (π)
const KUZNECHIK_SBOX = [
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

// Обратный S-блок
const KUZNECHIK_SBOX_INV = new Array(256);
for (let i = 0; i < 256; i++) {
  KUZNECHIK_SBOX_INV[KUZNECHIK_SBOX[i]] = i;
}

// Коэффициенты для линейного преобразования L
const L_COEFFS = [148, 32, 133, 16, 194, 192, 1, 251, 1, 192, 194, 16, 133, 32, 148, 1];

// Умножение в поле GF(2^8) с полиномом x^8 + x^7 + x^6 + x + 1 (0x1C3)
function gfMul(a: number, b: number): number {
  let result = 0;
  let hi_bit;
  for (let i = 0; i < 8; i++) {
    if (b & 1) result ^= a;
    hi_bit = a & 0x80;
    a = (a << 1) & 0xFF;
    if (hi_bit) a ^= 0xC3; // x^8 = x^7 + x^6 + x + 1
    b >>= 1;
  }
  return result;
}

// Преобразование S (нелинейная замена)
function transformS(block: number[]): number[] {
  return block.map(b => KUZNECHIK_SBOX[b]);
}

// Обратное преобразование S
function transformSInv(block: number[]): number[] {
  return block.map(b => KUZNECHIK_SBOX_INV[b]);
}

// Преобразование R (циклический сдвиг с умножением)
function transformR(block: number[]): number[] {
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    sum ^= gfMul(block[i], L_COEFFS[i]);
  }
  return [sum, ...block.slice(0, 15)];
}

// Преобразование L (16 итераций R)
function transformL(block: number[]): number[] {
  let result = [...block];
  for (let i = 0; i < 16; i++) {
    result = transformR(result);
  }
  return result;
}

// XOR двух блоков
function xorBlocks(a: number[], b: number[]): number[] {
  return a.map((v, i) => v ^ b[i]);
}

// Преобразование для отображения
function applySubstitution(input: string): { sbox: number[]; result: string } {
  const bytes = input.match(/.{1,2}/g)?.map(h => parseInt(h, 16)) || [];
  const padded = bytes.slice(0, 16);
  while (padded.length < 16) padded.push(0);
  
  const sbox = transformS(padded);
  return {
    sbox,
    result: sbox.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('')
  };
}

export default function KuznechikDemo(): JSX.Element {
  const [input, setInput] = useState('00112233445566778899AABBCCDDEEFF');
  const [showSbox, setShowSbox] = useState(false);
  
  const cleanInput = input.replace(/[^0-9A-Fa-f]/g, '').slice(0, 32).toUpperCase();
  const { sbox, result } = applySubstitution(cleanInput);
  
  // Также покажем L-преобразование
  const afterL = transformL(sbox);
  const resultL = afterL.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🦎 ГОСТ «Кузнечик» (ГОСТ Р 34.12-2015)</h4>
      </div>
      
      <div className={styles.inputGroup}>
        <label>Входной блок (128 бит, HEX):</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 32))}
          placeholder="00112233445566778899AABBCCDDEEFF"
          style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.1em' }}
        />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div className={styles.transformBlock}>
          <div className={styles.transformLabel}>Вход (16 байт)</div>
          <div className={styles.transformValue}>{cleanInput.padEnd(32, '0')}</div>
        </div>
        
        <div className={styles.transformArrow}>↓ S-преобразование (π)</div>
        
        <div className={styles.transformBlock} style={{ borderColor: 'var(--ifm-color-primary)' }}>
          <div className={styles.transformLabel}>После S-блока</div>
          <div className={styles.transformValue} style={{ color: 'var(--ifm-color-primary)' }}>{result}</div>
        </div>
        
        <div className={styles.transformArrow}>↓ L-преобразование (линейное)</div>
        
        <div className={styles.transformBlock} style={{ borderColor: '#9b5de5' }}>
          <div className={styles.transformLabel}>После L-преобразования</div>
          <div className={styles.transformValue} style={{ color: '#9b5de5' }}>{resultL}</div>
        </div>
      </div>
      
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSbox(!showSbox)}
      >
        {showSbox ? '▼ Скрыть таблицу S-блока' : '▶ Показать таблицу S-блока (π)'}
      </button>
      
      {showSbox && (
        <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <table style={{ fontSize: '0.7rem', borderCollapse: 'collapse' }}>
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
                      {KUZNECHIK_SBOX[row * 16 + col].toString(16).toUpperCase().padStart(2, '0')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Кузнечик: 128-битный блок, 256-битный ключ, 10 раундов. Структура SP-сеть (не Фейстель).
      </div>
    </div>
  );
}
