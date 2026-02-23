import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

const ALPHABETS = {
  ru32: {
    name: 'RU 6×6 (без Ё, Ъ)',
    size: 6,
    baseChars: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ_',
    filler: 'Х',
    replace: { 'Ё': 'Е', 'Ъ': 'Ь' }
  },
  en25: {
    name: 'EN 5×5 (I=J)',
    size: 5,
    baseChars: 'ABCDEFGHIKLMNOPQRSTUVWXYZ',
    filler: 'X',
    replace: { 'J': 'I' }
  }
};

function createPlayfairSquare(keyword: string, config: typeof ALPHABETS.ru32): string[][] {
  const seen = new Set<string>();
  const chars: string[] = [];
  
  // Сначала добавляем ключ
  for (let char of keyword.toUpperCase()) {
    // Применяем замены
    if (config.replace[char]) char = config.replace[char];
    if (config.baseChars.includes(char) && !seen.has(char)) {
      seen.add(char);
      chars.push(char);
    }
  }
  
  // Затем остальные буквы алфавита
  for (const char of config.baseChars) {
    if (!seen.has(char)) {
      seen.add(char);
      chars.push(char);
    }
  }
  
  // Создаём квадрат
  const square: string[][] = [];
  const size = config.size;
  for (let i = 0; i < size; i++) {
    square.push(chars.slice(i * size, (i + 1) * size));
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

function prepareText(text: string, config: typeof ALPHABETS.ru32): string[] {
  let prepared = text.toUpperCase().replace(/[^А-ЯA-Z]/g, '');
  
  // Применяем замены
  for (const [from, to] of Object.entries(config.replace)) {
    prepared = prepared.replace(new RegExp(from, 'g'), to);
  }
  
  // Разбиваем на биграммы, вставляя заполнитель между повторами
  const bigrams: string[] = [];
  let i = 0;
  
  while (i < prepared.length) {
    const first = prepared[i];
    const second = prepared[i + 1] || config.filler;
    
    if (first === second) {
      bigrams.push(first + config.filler);
      i++;
    } else {
      bigrams.push(first + second);
      i += 2;
    }
  }
  
  // Если нечётная длина, добавляем заполнитель
  if (bigrams.length > 0) {
    const last = bigrams[bigrams.length - 1];
    if (last.length === 1) {
      bigrams[bigrams.length - 1] = last + config.filler;
    }
  }
  
  return bigrams;
}

function playfairProcess(
  bigrams: string[],
  square: string[][],
  decrypt: boolean = false
): string {
  const size = square.length;
  const shift = decrypt ? -1 : 1;
  
  return bigrams.map(bigram => {
    const pos1 = findPosition(bigram[0], square);
    const pos2 = findPosition(bigram[1], square);
    
    if (!pos1 || !pos2) return bigram;
    
    const [row1, col1] = pos1;
    const [row2, col2] = pos2;
    
    let newChar1: string, newChar2: string;
    
    if (row1 === row2) {
      // Одна строка — сдвиг по столбцам
      newChar1 = square[row1][(col1 + shift + size) % size];
      newChar2 = square[row2][(col2 + shift + size) % size];
    } else if (col1 === col2) {
      // Один столбец — сдвиг по строкам
      newChar1 = square[(row1 + shift + size) % size][col1];
      newChar2 = square[(row2 + shift + size) % size][col2];
    } else {
      // Прямоугольник — меняем столбцы
      newChar1 = square[row1][col2];
      newChar2 = square[row2][col1];
    }
    
    return newChar1 + newChar2;
  }).join(' ');
}

export default function PlayfairCipher(): JSX.Element {
  const [input, setInput] = useState('КРИПТОГРАФИЯ');
  const [keyword, setKeyword] = useState('КЛЮЧ');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [alphabetKey, setAlphabetKey] = useState<'ru32' | 'en25'>('ru32');
  const [showSquare, setShowSquare] = useState(true);
  
  const config = ALPHABETS[alphabetKey];
  const square = createPlayfairSquare(keyword, config);
  
  let output = '';
  let bigrams: string[] = [];
  
  if (mode === 'encrypt') {
    bigrams = prepareText(input, config);
    output = playfairProcess(bigrams, square, false);
  } else {
    // При расшифровке парсим биграммы из ввода
    bigrams = input.toUpperCase().replace(/[^А-ЯA-Z]/g, '').match(/.{1,2}/g) || [];
    output = playfairProcess(bigrams, square, true);
  }
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Шифр Плейфера</h4>
        <div className={styles.languageToggle}>
          {Object.entries(ALPHABETS).map(([key, val]) => (
            <button 
              key={key}
              className={`${styles.langBtn} ${alphabetKey === key ? styles.active : ''}`}
              onClick={() => setAlphabetKey(key as any)}
            >
              {val.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.controls}>
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
      </div>
      
      <div className={styles.inputGroup}>
        <label>Ключевое слово:</label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Введите ключ..."
          className={styles.keyInput}
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label>Введите текст:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите текст..."
          rows={3}
        />
      </div>
      
      {mode === 'encrypt' && bigrams.length > 0 && (
        <div className={styles.bigramsDisplay}>
          <label>Биграммы:</label>
          <code>{bigrams.join(' ')}</code>
        </div>
      )}
      
      <div className={styles.outputGroup}>
        <label>Результат:</label>
        <div className={styles.output}>{output || '—'}</div>
      </div>
      
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSquare(!showSquare)}
      >
        {showSquare ? '▼ Скрыть квадрат' : '▶ Показать квадрат'}
      </button>
      
      {showSquare && (
        <div className={styles.polybiusSquare}>
          <table>
            <tbody>
              {square.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((char, colIdx) => (
                    <td 
                      key={colIdx}
                      className={keyword.toUpperCase().includes(char) ? styles.keyChar : ''}
                    >
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
        💡 Правила: одна строка → сдвиг вправо, один столбец → сдвиг вниз, прямоугольник → замена углов
      </div>
    </div>
  );
}
