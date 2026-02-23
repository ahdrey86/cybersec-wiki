import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

const RU_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const EN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateKey(length: number, alphabet: string): string {
  let key = '';
  for (let i = 0; i < length; i++) {
    key += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return key;
}

function otpProcess(text: string, key: string, alphabet: string, decrypt: boolean): { result: string; steps: any[] } {
  const n = alphabet.length;
  const steps: any[] = [];
  let keyIdx = 0;
  
  const result = text
    .toUpperCase()
    .split('')
    .map(char => {
      let c = char;
      if (alphabet === EN_ALPHABET && c === 'Ё') c = 'Е';
      
      const textPos = alphabet.indexOf(c);
      if (textPos !== -1 && keyIdx < key.length) {
        const keyChar = key[keyIdx].toUpperCase();
        const keyPos = alphabet.indexOf(keyChar);
        
        if (keyPos !== -1) {
          const newPos = decrypt 
            ? (textPos - keyPos + n) % n 
            : (textPos + keyPos) % n;
          
          steps.push({
            char: c,
            keyChar,
            textPos,
            keyPos,
            newPos,
            result: alphabet[newPos]
          });
          
          keyIdx++;
          return alphabet[newPos];
        }
      }
      return char;
    })
    .join('');
  
  return { result, steps };
}

export default function OneTimePad(): JSX.Element {
  const [input, setInput] = useState('СЕКРЕТ');
  const [key, setKey] = useState('КЛЮЧЗД');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [showSteps, setShowSteps] = useState(false);
  
  const alphabet = lang === 'ru' ? RU_ALPHABET : EN_ALPHABET;
  const cleanInput = input.toUpperCase().replace(/[^А-ЯЁA-Z]/g, '');
  const { result, steps } = otpProcess(input, key, alphabet, mode === 'decrypt');
  
  const handleGenerate = () => {
    const newKey = generateKey(cleanInput.length || 10, alphabet);
    setKey(newKey);
  };
  
  const keyValid = key.length >= cleanInput.length;
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🎲 Одноразовый блокнот (Шифр Вернама)</h4>
      </div>
      
      <div className={styles.alphabetSelect}>
        <button 
          className={`${styles.alphabetBtn} ${lang === 'ru' ? styles.active : ''}`}
          onClick={() => setLang('ru')}
        >
          Русский
        </button>
        <button 
          className={`${styles.alphabetBtn} ${lang === 'en' ? styles.active : ''}`}
          onClick={() => setLang('en')}
        >
          English
        </button>
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
        <label>Ключ (≥ длины текста):</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={styles.keyInput}
            style={{ flex: 1, borderColor: keyValid ? undefined : '#f44' }}
          />
          <button onClick={handleGenerate} className={styles.toggleBtn} style={{ marginTop: 0 }}>
            🎲 Генерировать
          </button>
        </div>
        {!keyValid && (
          <small style={{ color: '#f44' }}>
            Ключ должен быть не короче текста ({cleanInput.length} символов)
          </small>
        )}
      </div>
      
      <div className={styles.ioGrid}>
        <div className={styles.ioBlock}>
          <label>Текст</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
          />
        </div>
        <div className={styles.ioBlock}>
          <label>Результат</label>
          <div className={styles.outputBox}>{result || '—'}</div>
        </div>
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
                <th>Текст</th>
                <th>Поз.</th>
                <th>Ключ</th>
                <th>Поз.</th>
                <th>{mode === 'encrypt' ? 'Сумма' : 'Разн.'}</th>
                <th>Рез.</th>
              </tr>
            </thead>
            <tbody>
              {steps.slice(0, 12).map((s, i) => (
                <tr key={i}>
                  <td><code>{s.char}</code></td>
                  <td>{s.textPos}</td>
                  <td><code>{s.keyChar}</code></td>
                  <td>{s.keyPos}</td>
                  <td>{s.newPos}</td>
                  <td><code>{s.result}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 При истинно случайном ключе равной длины — абсолютная криптостойкость (теорема Шеннона)
      </div>
    </div>
  );
}
