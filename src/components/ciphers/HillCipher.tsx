import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

const RU_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const EN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function extendedGcd(a: number, b: number): [number, number, number] {
  if (a === 0) return [b, 0, 1];
  const [gcd, x1, y1] = extendedGcd(b % a, a);
  return [gcd, y1 - Math.floor(b / a) * x1, x1];
}

function modInverse(a: number, m: number): number | null {
  const [gcd, x] = extendedGcd(((a % m) + m) % m, m);
  if (gcd !== 1) return null;
  return ((x % m) + m) % m;
}

function determinant(matrix: number[][]): number {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  
  let det = 0;
  for (let j = 0; j < n; j++) {
    det += (j % 2 === 0 ? 1 : -1) * matrix[0][j] * determinant(minor(matrix, 0, j));
  }
  return det;
}

function minor(matrix: number[][], row: number, col: number): number[][] {
  return matrix.filter((_, i) => i !== row).map(r => r.filter((_, j) => j !== col));
}

function cofactorMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const cofactors: number[][] = [];
  for (let i = 0; i < n; i++) {
    cofactors[i] = [];
    for (let j = 0; j < n; j++) {
      cofactors[i][j] = ((i + j) % 2 === 0 ? 1 : -1) * determinant(minor(matrix, i, j));
    }
  }
  return cofactors;
}

function transpose(matrix: number[][]): number[][] {
  const n = matrix.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => matrix[j][i]));
}

function inverseMatrix(matrix: number[][], mod: number): number[][] | null {
  const det = determinant(matrix);
  const detMod = ((det % mod) + mod) % mod;
  const detInv = modInverse(detMod, mod);
  if (detInv === null) return null;
  
  const adj = transpose(cofactorMatrix(matrix));
  return adj.map(row => row.map(val => ((val * detInv) % mod + mod) % mod));
}

function multiplyMatrixVector(matrix: number[][], vector: number[], mod: number): number[] {
  return matrix.map(row => {
    const sum = row.reduce((acc, val, j) => acc + val * vector[j], 0);
    return ((sum % mod) + mod) % mod;
  });
}

function hillEncrypt(text: string, matrix: number[][], alphabet: string): string {
  const n = matrix.length;
  const m = alphabet.length;
  
  let cleanText = text.toUpperCase().split('').filter(c => alphabet.includes(c)).join('');
  while (cleanText.length % n !== 0) cleanText += alphabet[0];
  
  let result = '';
  for (let i = 0; i < cleanText.length; i += n) {
    const block = cleanText.slice(i, i + n).split('').map(c => alphabet.indexOf(c));
    result += multiplyMatrixVector(matrix, block, m).map(idx => alphabet[idx]).join('');
  }
  return result;
}

function hillDecrypt(text: string, matrix: number[][], alphabet: string): string | null {
  const invMatrix = inverseMatrix(matrix, alphabet.length);
  return invMatrix ? hillEncrypt(text, invMatrix, alphabet) : null;
}

function generateRandomMatrix(size: number, mod: number): number[][] {
  const matrix = Array.from({ length: size }, () => 
    Array.from({ length: size }, () => Math.floor(Math.random() * mod))
  );
  const det = determinant(matrix);
  const detMod = ((det % mod) + mod) % mod;
  return modInverse(detMod, mod) !== null ? matrix : generateRandomMatrix(size, mod);
}

export default function HillCipher(): JSX.Element {
  const [input, setInput] = useState('ТЕСТ');
  const [size, setSize] = useState(2);
  const [matrix, setMatrix] = useState<number[][]>([[3, 5], [2, 7]]);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  
  const alphabet = lang === 'ru' ? RU_ALPHABET : EN_ALPHABET;
  const m = alphabet.length;
  
  const det = determinant(matrix);
  const detMod = ((det % m) + m) % m;
  const isInvertible = modInverse(detMod, m) !== null;
  
  let result = '', error = '';
  if (mode === 'encrypt') {
    result = hillEncrypt(input, matrix, alphabet);
  } else if (isInvertible) {
    result = hillDecrypt(input, matrix, alphabet) || '';
  } else {
    error = `Необратима: НОД(${detMod}, ${m}) ≠ 1`;
  }
  
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    const newMatrix = Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) => matrix[i]?.[j] ?? (i === j ? 1 : 0))
    );
    setMatrix(newMatrix);
  };
  
  const handleMatrixChange = (row: number, col: number, value: string) => {
    const num = parseInt(value) || 0;
    const newMatrix = matrix.map(r => [...r]);
    newMatrix[row][col] = ((num % m) + m) % m;
    setMatrix(newMatrix);
  };
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>📐 Матричный шифр (Хилла)</h4>
      </div>
      
      <div className={styles.alphabetSelect}>
        <button className={`${styles.alphabetBtn} ${lang === 'ru' ? styles.active : ''}`} onClick={() => setLang('ru')}>RU-33</button>
        <button className={`${styles.alphabetBtn} ${lang === 'en' ? styles.active : ''}`} onClick={() => setLang('en')}>EN-26</button>
      </div>
      
      <div className={styles.modeToggle}>
        <button className={`${styles.modeBtn} ${mode === 'encrypt' ? styles.active : ''}`} onClick={() => setMode('encrypt')}>Шифровать</button>
        <button className={`${styles.modeBtn} ${mode === 'decrypt' ? styles.active : ''}`} onClick={() => setMode('decrypt')}>Расшифровать</button>
      </div>
      
      <div className={styles.inputGroup}>
        <label>Размер матрицы:</label>
        <div className={styles.sizeSelector}>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
            <button key={s} className={`${styles.sizeBtn} ${size === s ? styles.active : ''}`} onClick={() => handleSizeChange(s)}>
              {s}×{s}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.inputGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ margin: 0 }}>Матрица (mod {m}):</label>
          <button onClick={() => setMatrix(generateRandomMatrix(size, m))} className={styles.toggleBtn} style={{ margin: 0, padding: '0.3rem 0.8rem' }}>
            🎲 Случайная
          </button>
        </div>
        
        <div className={styles.matrixWrapper}>
          <div className={styles.matrixContainer} style={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gap: '4px',
            padding: '8px',
            border: `2px solid ${isInvertible ? 'var(--ifm-color-primary)' : '#f44'}`,
            borderRadius: '8px',
            maxWidth: `${Math.min(size * 50 + 20, 400)}px`
          }}>
            {matrix.map((row, i) => row.map((val, j) => (
              <input
                key={`${i}-${j}`}
                type="number"
                value={val}
                onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                style={{
                  width: '100%',
                  padding: size > 5 ? '4px' : '8px',
                  textAlign: 'center',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '4px',
                  fontSize: size > 6 ? '0.8rem' : '1rem',
                  fontWeight: 'bold'
                }}
              />
            )))}
          </div>
          
          <div style={{ marginLeft: '1rem', fontSize: '0.85rem' }}>
            <div>det = {det}</div>
            <div>mod {m} = {detMod}</div>
            <div style={{ color: isInvertible ? '#0c0' : '#f44', fontWeight: 'bold' }}>
              {isInvertible ? '✅ OK' : '❌ Ошибка'}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.ioGrid}>
        <div className={styles.ioBlock}>
          <label>ТЕКСТ</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} />
        </div>
        <div className={styles.ioBlock}>
          <label>РЕЗУЛЬТАТ</label>
          <div className={styles.outputBox} style={{ color: error ? '#f44' : undefined }}>{error || result || '—'}</div>
        </div>
      </div>
      
      <div className={styles.hint}>
        💡 Блок шифрования = {size} букв. Матрица должна быть обратима по модулю {m}.
      </div>
    </div>
  );
}
