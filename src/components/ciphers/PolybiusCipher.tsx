import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// Квадраты Полибия по образцу
const SQUARES = {
  ru32: {
    name: 'RU 6×6 (32 символа)',
    size: 6,
    chars: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ-',
    note: 'Без Ё, с дефисом'
  },
  ru30: {
    name: 'RU 6×5 (30 букв)',
    size: 6,
    rows: 5,
    chars: 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ',
    note: 'Без Ё, Й, Ъ'
  },
  en25: {
    name: 'EN 5×5 (I=J)',
    size: 5,
    chars: 'ABCDEFGHIKLMNOPQRSTUVWXYZ',
    note: 'J заменяется на I'
  }
};

function createSquare(chars: string, cols: number): string[][] {
  const square: string[][] = [];
  for (let i = 0; i < chars.length; i += cols) {
    square.push(chars.slice(i, i + cols).split(''));
  }
  return square;
}

function findPosition(char: string, square: string[][]): [number, number] | null {
  for (let row = 0; row < square.length; row++) {
    for (let col = 0; col < square[row].length; col++) {
      if (square[row][col] === char) {
        return [row, col];
      }
    }
  }
  return null;
}

function polybiusEncrypt(text: string, chars: string, cols: number): string {
  const square = createSquare(chars, cols);
  
  return text
    .toUpperCase()
    .split('')
    .map(char => {
      let c = char;
      // Замены для неподдерживаемых символов
      if (!chars.includes('Ё') && c === 'Ё') c = 'Е';
      if (!chars.includes('Й') && c === 'Й') c = 'И';
      if (!chars.includes('Ъ') && c === 'Ъ') c = 'Ь';
      if (c === 'J') c = 'I';
      
      const pos = findPosition(c, square);
      if (pos) {
        return `${pos[0] + 1}${pos[1] + 1}`;
      }
      return char === ' ' ? ' ' : '';
    })
    .join(' ');
}

function polybiusDecrypt(text: string, chars: string, cols: number): string {
  const square = createSquare(chars, cols);
  const result: string[] = [];
  
  const cleaned = text.replace(/[^0-9 ]/g, '');
  const pairs = cleaned.trim().split(/\s+/);
  
  for (const pair of pairs) {
    if (pair.length >= 2) {
      const row = parseInt(pair[0]) - 1;
      const col = parseInt(pair[1]) - 1;
      
      if (row >= 0 && row < square.length && col >= 0 && col < square[0].length) {
        result.push(square[row][col]);
      }
    }
  }
  
  return result.join('');
}

export default function PolybiusCipher(): JSX.Element {
  const [input, setInput] = useState('КРИПТОГРАФИЯ');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [squareKey, setSquareKey] = useState<'ru32' | 'ru30' | 'en25'>('ru32');
  
  const squareConfig = SQUARES[squareKey];
  const square = createSquare(squareConfig.chars, squareConfig.size);
  
  const output = mode === 'encrypt'
    ? polybiusEncrypt(input, squareConfig.chars, squareConfig.size)
    : polybiusDecrypt(input, squareConfig.chars, squareConfig.size);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Квадрат Полибия</h4>
      </div>
      
      <div className={styles.alphabetSelect}>
        {Object.entries(SQUARES).map(([key, val]) => (
          <button 
            key={key}
            className={`${styles.alphabetBtn} ${squareKey === key ? styles.active : ''}`}
            onClick={() => setSquareKey(key as any)}
          >
            {val.name}
          </button>
        ))}
      </div>
      
      <div className={styles.modeToggle}>
        <button 
          className={`${styles.modeBtn} ${mode === 'encrypt' ? styles.active : ''}`}
          onClick={() => setMode('encrypt')}
        >
          Шифровать
        </button>
        <button 
          className={`${styles.modeBtn} ${mode === 'decrypt' ? styles.active : ''}`}
          onClick={() => setMode('decrypt')}
        >
          Расшифровать
        </button>
      </div>
      
      <div className={styles.ioGrid}>
        <div className={styles.ioBlock}>
          <label>{mode === 'encrypt' ? 'Текст' : 'Числа'}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encrypt' ? 'Введите текст...' : '11 12 13...'}
            rows={2}
          />
        </div>
        
        <div className={styles.ioBlock}>
          <label>Результат</label>
          <div className={styles.outputBox}>{output || '—'}</div>
        </div>
      </div>
      
      <div className={styles.polybiusSquare}>
        <table>
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: squareConfig.size }, (_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {square.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <th>{rowIdx + 1}</th>
                {row.map((char, colIdx) => (
                  <td key={colIdx}>{char}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className={styles.hint}>
        💡 {squareConfig.note}
      </div>
    </div>
  );
}
