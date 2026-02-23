import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

const ALPHABETS = {
  ru33: { name: 'RU-33 (с Ё)', chars: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' },
  ru32: { name: 'RU-32 (без Ё)', chars: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' },
  en: { name: 'EN-26', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }
};

interface StepInfo {
  char: string;
  position: number;
  shift: number;
  result: string;
}

function tritemiusProcess(
  text: string, 
  alphabet: string, 
  decrypt: boolean = false
): { result: string; steps: StepInfo[] } {
  const n = alphabet.length;
  const steps: StepInfo[] = [];
  let position = 0;
  
  const result = text
    .toUpperCase()
    .split('')
    .map(char => {
      let c = char;
      if (!alphabet.includes('Ё') && char === 'Ё') c = 'Е';
      
      const index = alphabet.indexOf(c);
      if (index !== -1) {
        const shift = position;
        const newIndex = decrypt 
          ? (index - shift + n) % n 
          : (index + shift) % n;
        const newChar = alphabet[newIndex];
        
        steps.push({
          char: c,
          position,
          shift,
          result: newChar
        });
        
        position++;
        return newChar;
      }
      return char;
    })
    .join('');
  
  return { result, steps };
}

export default function TritemiusCipher(): JSX.Element {
  const [input, setInput] = useState('КРИПТОГРАФИЯ');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [alphabetKey, setAlphabetKey] = useState<'ru33' | 'ru32' | 'en'>('ru33');
  const [showSteps, setShowSteps] = useState(false);
  
  const alphabet = ALPHABETS[alphabetKey].chars;
  const { result, steps } = tritemiusProcess(input, alphabet, mode === 'decrypt');
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Шифратор Тритемия</h4>
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
                <th>Поз.</th>
                <th>Символ</th>
                <th>Сдвиг</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {steps.slice(0, 15).map((step, i) => (
                <tr key={i}>
                  <td>{step.position}</td>
                  <td><code>{step.char}</code></td>
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
        💡 Сдвиг прогрессивно увеличивается: 0, 1, 2, 3, ...
      </div>
    </div>
  );
}
