import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

const ALPHABETS = {
  ru33: { name: 'RU-33 (с Ё)', chars: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' },
  ru32: { name: 'RU-32 (без Ё)', chars: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' },
  en: { name: 'EN-26', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }
};

function caesarEncrypt(text: string, shift: number, alphabet: string): string {
  const n = alphabet.length;
  return text
    .toUpperCase()
    .split('')
    .map(char => {
      let c = char;
      if (!alphabet.includes('Ё') && char === 'Ё') c = 'Е';
      
      const index = alphabet.indexOf(c);
      if (index !== -1) {
        const newIndex = (index + shift + n) % n;
        return alphabet[newIndex];
      }
      return char;
    })
    .join('');
}

export default function CaesarCipher(): JSX.Element {
  const [input, setInput] = useState('КРИПТОГРАФИЯ');
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [alphabetKey, setAlphabetKey] = useState<'ru33' | 'ru32' | 'en'>('ru33');
  
  const alphabet = ALPHABETS[alphabetKey].chars;
  const effectiveShift = mode === 'encrypt' ? shift : -shift;
  const output = caesarEncrypt(input, effectiveShift, alphabet);
  
  const shiftedAlphabet = alphabet
    .split('')
    .map((_, i) => alphabet[(i + shift) % alphabet.length])
    .join('');
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Шифратор Цезаря</h4>
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
        
        <div className={styles.shiftControl}>
          <label>Сдвиг: <strong>{shift}</strong></label>
          <input
            type="range"
            min="1"
            max={alphabet.length - 1}
            value={shift}
            onChange={(e) => setShift(parseInt(e.target.value))}
          />
        </div>
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
      
      <div className={styles.outputGroup}>
        <label>Результат:</label>
        <div className={styles.output}>{output || '—'}</div>
      </div>
      
      <div className={styles.alphabetDisplay}>
        <div className={styles.alphabetRow}>
          <span className={styles.label}>Исходный:</span>
          <code>{alphabet}</code>
        </div>
        <div className={styles.alphabetRow}>
          <span className={styles.label}>Сдвиг +{shift}:</span>
          <code>{shiftedAlphabet}</code>
        </div>
      </div>
      
      <div className={styles.hint}>
        💡 ROT13 — сдвиг на 13 для английского алфавита (инволюция)
      </div>
    </div>
  );
}
