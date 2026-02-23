import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

function verticalEncrypt(text: string, key: string): { result: string; grid: string[][]; order: number[]; keyOrder: {char: string, pos: number}[] } {
  const cleanText = text.toUpperCase().replace(/[^А-ЯЁA-Z0-9]/g, '');
  const keyUpper = key.toUpperCase();
  const cols = keyUpper.length;
  
  if (cols === 0) return { result: '', grid: [], order: [], keyOrder: [] };
  
  // Определяем порядок столбцов
  const keyOrder = keyUpper
    .split('')
    .map((char, idx) => ({ char, idx, sortKey: char }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'ru'));
  
  const order = keyUpper
    .split('')
    .map((char, idx) => ({ char, idx }))
    .sort((a, b) => a.char.localeCompare(b.char, 'ru'))
    .map((item, newIdx) => ({ oldIdx: item.idx, newIdx }))
    .sort((a, b) => a.oldIdx - b.oldIdx)
    .map(item => item.newIdx);
  
  // Заполняем таблицу
  const rows = Math.ceil(cleanText.length / cols);
  const grid: string[][] = [];
  
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      row.push(idx < cleanText.length ? cleanText[idx] : '·');
    }
    grid.push(row);
  }
  
  // Читаем по столбцам
  const resultParts: string[] = [];
  for (let sortedCol = 0; sortedCol < cols; sortedCol++) {
    const actualCol = order.indexOf(sortedCol);
    let colText = '';
    for (let r = 0; r < rows; r++) {
      if (grid[r][actualCol] !== '·') {
        colText += grid[r][actualCol];
      }
    }
    resultParts.push(colText);
  }
  
  return { 
    result: resultParts.join(' '), 
    grid, 
    order,
    keyOrder: keyOrder.map((k, i) => ({ char: k.char, pos: i + 1 }))
  };
}

function verticalDecrypt(text: string, key: string): { result: string; grid: string[][] } {
  const cleanText = text.toUpperCase().replace(/[^А-ЯЁA-Z0-9]/g, '');
  const keyUpper = key.toUpperCase();
  const cols = keyUpper.length;
  
  if (cols === 0) return { result: '', grid: [] };
  
  const rows = Math.ceil(cleanText.length / cols);
  
  const order = keyUpper
    .split('')
    .map((char, idx) => ({ char, idx }))
    .sort((a, b) => a.char.localeCompare(b.char, 'ru'))
    .map((item, newIdx) => ({ oldIdx: item.idx, newIdx }))
    .sort((a, b) => a.oldIdx - b.oldIdx)
    .map(item => item.newIdx);
  
  // Распределяем по столбцам
  const columns: string[] = Array(cols).fill('');
  let pos = 0;
  
  for (let sortedCol = 0; sortedCol < cols; sortedCol++) {
    const actualCol = order.indexOf(sortedCol);
    const colLen = rows;
    columns[actualCol] = cleanText.slice(pos, pos + colLen);
    pos += colLen;
  }
  
  // Читаем по строкам
  const grid: string[][] = [];
  const result: string[] = [];
  
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      const char = columns[c][r] || '·';
      row.push(char);
      if (char !== '·') result.push(char);
    }
    grid.push(row);
  }
  
  return { result: result.join(''), grid };
}

export default function VerticalPermutation(): JSX.Element {
  const [input, setInput] = useState('КРИПТОГРАФИЯ');
  const [key, setKey] = useState('КЛЮЧ');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  
  const encryptResult = mode === 'encrypt' 
    ? verticalEncrypt(input, key)
    : { ...verticalDecrypt(input, key), order: [], keyOrder: [] };
  
  const { result, grid, order } = encryptResult;
  const keyChars = key.toUpperCase().split('');
  
  // Порядок чтения столбцов
  const readOrder = mode === 'encrypt' ? 
    keyChars.map((char, idx) => ({ char, idx, order: order[idx] + 1 }))
      .sort((a, b) => a.order - b.order) : [];
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔀 Вертикальная перестановка</h4>
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
      
      <div className={styles.inputGroup}>
        <label>Ключ (слово):</label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className={styles.keyInput}
          placeholder="КЛЮЧ"
        />
      </div>
      
      <div className={styles.ioGrid}>
        <div className={styles.ioBlock}>
          <label>ТЕКСТ</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
          />
        </div>
        <div className={styles.ioBlock}>
          <label>РЕЗУЛЬТАТ</label>
          <div className={styles.outputBox}>{result || '—'}</div>
        </div>
      </div>
      
      {mode === 'encrypt' && readOrder.length > 0 && (
        <div className={styles.orderDisplay}>
          <span className={styles.orderLabel}>Порядок чтения:</span>
          {readOrder.map((item, idx) => (
            <span key={idx} className={styles.orderItem}>
              Столбец <strong>{item.char}</strong> ({item.order}-й)
              {idx < readOrder.length - 1 ? ' → ' : ''}
            </span>
          ))}
        </div>
      )}
      
      {grid.length > 0 && key.length > 0 && (
        <div className={styles.polybiusSquare}>
          <table>
            <thead>
              <tr>
                {keyChars.map((char, idx) => (
                  <th key={idx}>
                    <div>{char}</div>
                    {mode === 'encrypt' && (
                      <div className={styles.orderBadge}>{order[idx] + 1}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((char, colIdx) => (
                    <td key={colIdx} className={char === '·' ? styles.emptyCell : ''}>
                      {char}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Текст записывается в таблицу по строкам, читается по столбцам в алфавитном порядке букв ключа
      </div>
    </div>
  );
}
