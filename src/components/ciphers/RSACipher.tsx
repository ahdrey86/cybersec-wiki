import React, { useState, useEffect } from 'react';
import styles from './CipherStyles.module.css';

// Простые числа для демонстрации
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

function modInverse(a: number, m: number): number | null {
  const m0 = m;
  let [x0, x1] = [0, 1];
  
  if (m === 1) return 0;
  
  while (a > 1) {
    const q = Math.floor(a / m);
    [m, a] = [a % m, m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  
  if (x1 < 0) x1 += m0;
  return x1;
}

function generateKeys(p: number, q: number): { n: number; e: number; d: number; phi: number } | null {
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  
  // Находим e: 1 < e < phi, НОД(e, phi) = 1
  let e = 3;
  while (e < phi) {
    if (gcd(e, phi) === 1) break;
    e += 2;
  }
  
  if (e >= phi) return null;
  
  const d = modInverse(e, phi);
  if (d === null) return null;
  
  return { n, e, d, phi };
}

export default function RSACipher(): JSX.Element {
  const [p, setP] = useState(17);
  const [q, setQ] = useState(23);
  const [message, setMessage] = useState(42);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [customE, setCustomE] = useState<number | null>(null);
  
  const keys = generateKeys(p, q);
  const e = customE || keys?.e || 3;
  const d = keys ? modInverse(e, keys.phi) : null;
  
  let result = 0;
  let steps: string[] = [];
  
  if (keys && d) {
    if (mode === 'encrypt') {
      result = modPow(message, e, keys.n);
      steps = [
        `n = p × q = ${p} × ${q} = ${keys.n}`,
        `φ(n) = (p-1)(q-1) = ${p-1} × ${q-1} = ${keys.phi}`,
        `e = ${e} (НОД(${e}, ${keys.phi}) = 1)`,
        `C = M^e mod n = ${message}^${e} mod ${keys.n} = ${result}`
      ];
    } else {
      result = modPow(message, d, keys.n);
      steps = [
        `n = ${keys.n}, φ(n) = ${keys.phi}`,
        `d = e^(-1) mod φ(n) = ${e}^(-1) mod ${keys.phi} = ${d}`,
        `M = C^d mod n = ${message}^${d} mod ${keys.n} = ${result}`
      ];
    }
  }
  
  const isPrime = (n: number) => PRIMES.includes(n);
  const pValid = isPrime(p);
  const qValid = isPrime(q);
  const msgValid = message > 0 && message < (keys?.n || Infinity);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔑 RSA (Rivest–Shamir–Adleman)</h4>
      </div>
      
      <div className={styles.modeToggle}>
        <button 
          className={`${styles.modeBtn} ${mode === 'encrypt' ? styles.active : ''}`}
          onClick={() => setMode('encrypt')}
        >
          Шифровать (публичный)
        </button>
        <button 
          className={`${styles.modeBtn} ${mode === 'decrypt' ? styles.active : ''}`}
          onClick={() => setMode('decrypt')}
        >
          Расшифровать (приватный)
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Простое p:</label>
          <input
            type="number"
            value={p}
            onChange={(e) => setP(parseInt(e.target.value) || 2)}
            style={{ 
              padding: '0.5rem',
              borderColor: pValid ? undefined : '#f44',
              borderRadius: '8px',
              border: '2px solid var(--ifm-color-emphasis-300)'
            }}
          />
          {!pValid && <small style={{ color: '#f44' }}>Не простое</small>}
        </div>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Простое q:</label>
          <input
            type="number"
            value={q}
            onChange={(e) => setQ(parseInt(e.target.value) || 2)}
            style={{ 
              padding: '0.5rem',
              borderColor: qValid ? undefined : '#f44',
              borderRadius: '8px',
              border: '2px solid var(--ifm-color-emphasis-300)'
            }}
          />
          {!qValid && <small style={{ color: '#f44' }}>Не простое</small>}
        </div>
      </div>
      
      {keys && (
        <div style={{ 
          background: 'var(--ifm-color-emphasis-100)', 
          padding: '1rem', 
          borderRadius: '10px',
          marginBottom: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <div><strong>n</strong> = {keys.n}</div>
          <div><strong>φ(n)</strong> = {keys.phi}</div>
          <div style={{ color: 'green' }}><strong>e (публ.)</strong> = {e}</div>
          <div style={{ color: 'red' }}><strong>d (прив.)</strong> = {d}</div>
        </div>
      )}
      
      <div className={styles.ioGrid}>
        <div className={styles.ioBlock}>
          <label>{mode === 'encrypt' ? 'Сообщение M' : 'Шифротекст C'} (0 &lt; M &lt; {keys?.n || 'n'})</label>
          <input
            type="number"
            value={message}
            onChange={(e) => setMessage(parseInt(e.target.value) || 0)}
            style={{ 
              padding: '0.75rem',
              borderRadius: '10px',
              border: `2px solid ${msgValid ? 'var(--ifm-color-emphasis-300)' : '#f44'}`,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          />
        </div>
        <div className={styles.ioBlock}>
          <label>{mode === 'encrypt' ? 'Шифротекст C' : 'Сообщение M'}</label>
          <div className={styles.outputBox} style={{ fontSize: '1.2rem' }}>
            {keys && d ? result : 'Ошибка ключей'}
          </div>
        </div>
      </div>
      
      {steps.length > 0 && (
        <div style={{ 
          background: 'var(--ifm-background-color)', 
          padding: '1rem', 
          borderRadius: '10px',
          border: '1px solid var(--ifm-color-emphasis-200)',
          marginTop: '1rem'
        }}>
          <strong>Вычисления:</strong>
          {steps.map((step, i) => (
            <div key={i} style={{ fontFamily: 'monospace', marginTop: '0.25rem' }}>{step}</div>
          ))}
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Демонстрация с малыми числами. Реальный RSA использует числа в сотни бит.
      </div>
    </div>
  );
}
