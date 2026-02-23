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

function vigenereProcess(
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

// Простой анализ для попытки взлома
function analyzeFrequency(text: string, alphabet: string): Map<string, number> {
  const freq = new Map<string, number>();
  let total = 0;
  
  for (const char of text.toUpperCase()) {
    if (alphabet.indexOf(char) !== -1) {
      freq.set(char, (freq.get(char) || 0) + 1);
      total++;
    }
  }
  
  // Преобразуем в проценты
  for (const [key, value] of freq) {
    freq.set(key, Math.round((value / total) * 1000) / 10);
  }
  
  return freq;
}

export default function VigenereCipher(): JSX.Element {
  const [input, setInput] = useState('СЕКРЕТНАЯ ИНФОРМАЦИЯ');
  const [key, setKey] = useState('ШИФР');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [alphabetKey, setAlphabetKey] = useState<'ru33' | 'ru32' | 'en'>('ru33');
  const [showSteps, setShowSteps] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const alphabet = ALPHABETS[alphabetKey].chars;
  const { result, steps } = vigenereProcess(input, key, alphabet, mode === 'decrypt');
  const freq = analyzeFrequency(result, alphabet);
  
  const topFreq = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Шифратор Виженера</h4>
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
        <div className={styles.keyStrength}>
          Длина ключа: <strong>{key.length}</strong> | 
          Пространство: <strong>{Math.pow(alphabet.length, key.length).toLocaleString()}</strong> вариантов
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
      
      <div className={styles.buttonRow}>
        <button 
          className={styles.toggleBtn}
          onClick={() => setShowSteps(!showSteps)}
        >
          {showSteps ? '▼ Скрыть шаги' : '▶ Показать шаги'}
        </button>
        
        <button 
          className={styles.toggleBtn}
          onClick={() => setShowAnalysis(!showAnalysis)}
        >
          {showAnalysis ? '▼ Скрыть анализ' : '📊 Частотный анализ'}
        </button>
      </div>
      
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
      
      {showAnalysis && topFreq.length > 0 && (
        <div className={styles.analysisBlock}>
          <h5>Топ-5 частых букв в результате:</h5>
          <div className={styles.freqBars}>
            {topFreq.map(([char, percent]) => (
              <div key={char} className={styles.freqItem}>
                <span className={styles.freqChar}>{char}</span>
                <div className={styles.freqBar}>
                  <div 
                    className={styles.freqFill} 
                    style={{ width: `${Math.min(percent * 5, 100)}%` }}
                  />
                </div>
                <span className={styles.freqPercent}>{percent}%</span>
              </div>
            ))}
          </div>
          <p className={styles.analysisNote}>
            В русском тексте: О ≈ 11%, Е ≈ 8%, А ≈ 8%
          </p>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Чем длиннее ключ, тем сложнее взлом методом Касиски
      </div>
    </div>
  );
}
