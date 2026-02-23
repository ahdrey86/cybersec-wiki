import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

const ALPHABETS = {
  ru33: { name: 'RU-33 (с Ё)', chars: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' },
  ru32: { name: 'RU-32 (без Ё)', chars: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' },
  en: { name: 'EN-26', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }
};

function atbash(text: string, alphabet: string): string {
  const reversed = alphabet.split('').reverse().join('');
  return text
    .toUpperCase()
    .split('')
    .map(char => {
      // Заменяем Ё на Е если алфавит без Ё
      let c = char;
      if (!alphabet.includes('Ё') && char === 'Ё') c = 'Е';
      
      const index = alphabet.indexOf(c);
      return index !== -1 ? reversed[index] : char;
    })
    .join('');
}

export default function AtbashCipher(): JSX.Element {
  const [input, setInput] = useState('КРИПТОГРАФИЯ');
  const [alphabetKey, setAlphabetKey] = useState<'ru33' | 'ru32' | 'en'>('ru33');
  
  const alphabet = ALPHABETS[alphabetKey].chars;
  const output = atbash(input, alphabet);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Шифратор Атбаш</h4>
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
      
      <div className={styles.inputGroup}>
        <label>Введите текст:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите текст для шифрования..."
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
          <span className={styles.label}>Замена:</span>
          <code>{alphabet.split('').reverse().join('')}</code>
        </div>
      </div>
      
      <div className={styles.hint}>
        💡 Атбаш — инволюция: повторное применение даёт исходный текст
      </div>
    </div>
  );
}
