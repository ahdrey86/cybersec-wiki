import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  const clean = hex.replace(/\s/g, '');
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.substr(i, 2), 16) || 0);
  }
  return bytes;
}

function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

function textToBytes(text: string): number[] {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(text));
}

function bytesToText(bytes: number[]): string {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    return '[не UTF-8]';
  }
}

function xorBytes(data: number[], gamma: number[]): number[] {
  return data.map((byte, i) => byte ^ gamma[i % gamma.length]);
}

// Простой LFSR для генерации гаммы (демонстрация)
function generateGammaLFSR(seed: number, length: number): number[] {
  const gamma: number[] = [];
  let state = seed || 0x12345678;
  
  for (let i = 0; i < length; i++) {
    // Простой 32-bit LFSR
    const bit = ((state >> 0) ^ (state >> 2) ^ (state >> 3) ^ (state >> 5)) & 1;
    state = (state >> 1) | (bit << 31);
    gamma.push(state & 0xFF);
  }
  
  return gamma;
}

export default function GammaCipher(): JSX.Element {
  const [inputMode, setInputMode] = useState<'text' | 'hex'>('text');
  const [input, setInput] = useState('СЕКРЕТ');
  const [gammaMode, setGammaMode] = useState<'manual' | 'generate'>('manual');
  const [gamma, setGamma] = useState('AB CD EF 12 34 56');
  const [seed, setSeed] = useState(305419896); // 0x12345678
  const [showSteps, setShowSteps] = useState(false);
  
  // Преобразуем входные данные
  const inputBytes = inputMode === 'text' ? textToBytes(input) : hexToBytes(input);
  
  // Получаем гамму
  const gammaBytes = gammaMode === 'manual' 
    ? hexToBytes(gamma) 
    : generateGammaLFSR(seed, inputBytes.length);
  
  // XOR
  const resultBytes = xorBytes(inputBytes, gammaBytes);
  
  // Шаги для отображения
  const steps = inputBytes.slice(0, 12).map((byte, i) => ({
    input: byte.toString(16).padStart(2, '0').toUpperCase(),
    gamma: (gammaBytes[i % gammaBytes.length] || 0).toString(16).padStart(2, '0').toUpperCase(),
    result: resultBytes[i].toString(16).padStart(2, '0').toUpperCase()
  }));
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>⚡ Гаммирование (XOR)</h4>
      </div>
      
      <div className={styles.alphabetSelect}>
        <button 
          className={`${styles.alphabetBtn} ${inputMode === 'text' ? styles.active : ''}`}
          onClick={() => setInputMode('text')}
        >
          Текст
        </button>
        <button 
          className={`${styles.alphabetBtn} ${inputMode === 'hex' ? styles.active : ''}`}
          onClick={() => setInputMode('hex')}
        >
          HEX
        </button>
      </div>
      
      <div className={styles.inputGroup}>
        <label>{inputMode === 'text' ? 'Входной текст:' : 'Входные данные (HEX):'}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder={inputMode === 'text' ? 'Введите текст...' : 'AB CD EF...'}
          style={{ fontFamily: inputMode === 'hex' ? 'monospace' : undefined }}
        />
        {inputMode === 'text' && (
          <small style={{ color: 'var(--ifm-color-emphasis-600)' }}>
            HEX: {bytesToHex(inputBytes)}
          </small>
        )}
      </div>
      
      <div className={styles.alphabetSelect} style={{ marginBottom: '0.5rem' }}>
        <button 
          className={`${styles.alphabetBtn} ${gammaMode === 'manual' ? styles.active : ''}`}
          onClick={() => setGammaMode('manual')}
        >
          Ручная гамма
        </button>
        <button 
          className={`${styles.alphabetBtn} ${gammaMode === 'generate' ? styles.active : ''}`}
          onClick={() => setGammaMode('generate')}
        >
          LFSR генератор
        </button>
      </div>
      
      {gammaMode === 'manual' ? (
        <div className={styles.inputGroup}>
          <label>Гамма (HEX):</label>
          <input
            type="text"
            value={gamma}
            onChange={(e) => setGamma(e.target.value)}
            style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
            placeholder="AB CD EF..."
          />
        </div>
      ) : (
        <div className={styles.inputGroup}>
          <label>Начальное значение (seed):</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 1)}
              style={{ flex: 1 }}
            />
            <button 
              onClick={() => setSeed(Math.floor(Math.random() * 0xFFFFFFFF))} 
              className={styles.toggleBtn} 
              style={{ marginTop: 0 }}
            >
              🎲
            </button>
          </div>
          <small style={{ color: 'var(--ifm-color-emphasis-600)', fontFamily: 'monospace' }}>
            Гамма: {bytesToHex(gammaBytes.slice(0, 8))}...
          </small>
        </div>
      )}
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem',
        marginBottom: '1rem' 
      }}>
        <div style={{ 
          background: 'rgba(0, 212, 170, 0.1)', 
          padding: '1rem', 
          borderRadius: '10px' 
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
            Результат (HEX)
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
            {bytesToHex(resultBytes)}
          </div>
        </div>
        <div style={{ 
          background: 'var(--ifm-color-emphasis-100)', 
          padding: '1rem', 
          borderRadius: '10px' 
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
            Результат (текст)
          </div>
          <div style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
            {bytesToText(resultBytes)}
          </div>
        </div>
      </div>
      
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSteps(!showSteps)}
      >
        {showSteps ? '▼ Скрыть XOR' : '▶ Показать XOR побайтно'}
      </button>
      
      {showSteps && (
        <div className={styles.stepsTable}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Данные</th>
                <th>⊕</th>
                <th>Гамма</th>
                <th>=</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, i) => (
                <tr key={i}>
                  <td>{i}</td>
                  <td><code>{s.input}</code></td>
                  <td>⊕</td>
                  <td><code>{s.gamma}</code></td>
                  <td>=</td>
                  <td><code style={{ color: 'var(--ifm-color-primary)' }}>{s.result}</code></td>
                </tr>
              ))}
              {inputBytes.length > 12 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', opacity: 0.7 }}>
                    ... ещё {inputBytes.length - 12} байт
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 XOR симметричен: повторное применение с той же гаммой восстанавливает данные
      </div>
    </div>
  );
}
