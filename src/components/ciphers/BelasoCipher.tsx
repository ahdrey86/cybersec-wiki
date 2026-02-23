import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

const ALPHABETS = {
  ru33: { name: 'RU-33 (с Ё)', chars: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' },
  ru32: { name: 'RU-32 (без Ё)', chars: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' },
  en: { name: 'EN-26', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }
};

interface StepInfo {
  char: string;
  keyChar: string;
  shift: number;
  result: string;
}

function belasoProcess(
  text: string, 
  key: string,
  alphabet: string, 
  decrypt: boolean = false
): { result: string; steps: StepInfo[] } {
  const n = alphabet.length;
  const steps: StepInfo[] = [];
  const upperKey = key.toUpperCase();
  let keyIndex = 0;
  
  const result = text
    .toUpperCase()
    .split('')
    .map(char => {
      let c = char;
      if (!alphabet.includes('Ё') && char === 'Ё') c = 'Е';
      
      const index = alphabet.indexOf(c);
      if (index !== -1) {
        let keyChar = upperKey[keyIndex % upperKey.length];
        if (!alphabet.includes('Ё') && keyChar === 'Ё') keyChar = 'Е';
        
        const shift = alphabet.indexOf(keyChar);
        
        if (shift === -1) {
          return char;
        }
        
        const newIndex = decrypt 
          ? (index - shift + n) % n 
          : (index + shift) % n;
        const newChar = alphabet[newIndex];
        
        steps.push({
          char: c,
          keyChar,
          shift,
          result: newChar
        });
        
        keyIndex++;
        return newChar;
      }
      return char;
    })
    .join('');
  
  return { result, steps };
}

export default function BelasoCipher(): JSX.Element {
  const [input, setInput] = useState('КРИПТОГРАФИЯ');
  const [key, setKey] = useState('КЛЮЧ');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [alphabetKey, setAlphabetKey] = useState<'ru33' | 'ru32' | 'en'>('ru33');
  const [showSteps, setShowSteps] = useState(false);
  
  const alphabet = ALPHABETS[alphabetKey].chars;
  const { result, steps } = belasoProcess(input, key, alphabet, mode === 'decrypt');
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Шифратор Белазо</h4>
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
          value={key}
          onChange={(e) => setKey(e.target.value)}
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
      
      <div className={styles.outputGroup}>
        <label>Результат:</label>
        <div className={styles.output}>{result || '—'}</div>
      </div>
      
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSteps(!showSteps)}
      >
        {showSteps ? '▼ Скрыть шаги' : '▶ Показать шаги'}
      </button>
      
      {showSteps && steps.length > 0 && (
        <div className={styles.stepsTable}>
          <table>
            <thead>
              <tr>
                <th>Символ</th>
                <th>Ключ</th>
                <th>Сдвиг</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {steps.slice(0, 15).map((step, i) => (
                <tr key={i}>
                  <td><code>{step.char}</code></td>
                  <td><code>{step.keyChar}</code></td>
                  <td>{mode === 'decrypt' ? `-${step.shift}` : `+${step.shift}`}</td>
                  <td><code>{step.result}</code></td>
                </tr>
              ))}
              {steps.length > 15 && (
                <tr>
                  <td colSpan={4} style={{textAlign: 'center', opacity: 0.7}}>
                    ... ещё {steps.length - 15} символов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Каждая буква ключа задаёт сдвиг (А=0, Б=1, В=2, ...)
      </div>
    </div>
  );
}
