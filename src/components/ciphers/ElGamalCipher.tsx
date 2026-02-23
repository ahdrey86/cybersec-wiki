import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// Примитивные корни для малых простых
const PRIMITIVE_ROOTS: { [key: number]: number } = {
  23: 5, 29: 2, 31: 3, 37: 2, 41: 6, 43: 3, 47: 5, 53: 2, 59: 2, 61: 2, 67: 2, 71: 7, 73: 5, 79: 3, 83: 2, 89: 3, 97: 5
};

const PRIMES = Object.keys(PRIMITIVE_ROOTS).map(Number);

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

function modInverse(a: number, m: number): number {
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

function generateK(p: number): number {
  // k должен быть взаимно простым с p-1
  let k = 2 + Math.floor(Math.random() * (p - 3));
  while (gcd(k, p - 1) !== 1) {
    k = 2 + Math.floor(Math.random() * (p - 3));
  }
  return k;
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export default function ElGamalCipher(): JSX.Element {
  const [p, setP] = useState(23);
  const [privateKey, setPrivateKey] = useState(6); // x
  const [message, setMessage] = useState(15);
  const [k, setK] = useState(3);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [cipherA, setCipherA] = useState(0);
  const [cipherB, setCipherB] = useState(0);
  
  const g = PRIMITIVE_ROOTS[p] || 2;
  const publicKey = modPow(g, privateKey, p); // y = g^x mod p
  
  let result = 0;
  let steps: string[] = [];
  
  if (mode === 'encrypt') {
    // Шифрование: (a, b) = (g^k mod p, m * y^k mod p)
    const a = modPow(g, k, p);
    const yk = modPow(publicKey, k, p);
    const b = (message * yk) % p;
    
    result = 0;
    steps = [
      `Параметры: p = ${p}, g = ${g}`,
      `Публичный ключ: y = g^x mod p = ${g}^${privateKey} mod ${p} = ${publicKey}`,
      `Случайное k = ${k} (НОД(${k}, ${p-1}) = ${gcd(k, p-1)})`,
      `a = g^k mod p = ${g}^${k} mod ${p} = ${a}`,
      `b = m × y^k mod p = ${message} × ${publicKey}^${k} mod ${p} = ${message} × ${yk} mod ${p} = ${b}`,
      `Шифротекст: (${a}, ${b})`
    ];
    
    // Обновляем для отображения
    if (a !== cipherA || b !== cipherB) {
      setCipherA(a);
      setCipherB(b);
    }
  } else {
    // Расшифрование: m = b * (a^x)^(-1) mod p
    const ax = modPow(cipherA, privateKey, p);
    const axInv = modInverse(ax, p);
    result = (cipherB * axInv) % p;
    
    steps = [
      `Шифротекст: (a, b) = (${cipherA}, ${cipherB})`,
      `Приватный ключ: x = ${privateKey}`,
      `a^x mod p = ${cipherA}^${privateKey} mod ${p} = ${ax}`,
      `(a^x)^(-1) mod p = ${ax}^(-1) mod ${p} = ${axInv}`,
      `m = b × (a^x)^(-1) mod p = ${cipherB} × ${axInv} mod ${p} = ${result}`
    ];
  }
  
  const msgValid = message > 0 && message < p;
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 Шифр Эль-Гамаля (ElGamal)</h4>
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
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Простое p:</label>
          <select
            value={p}
            onChange={(e) => setP(parseInt(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--ifm-color-emphasis-300)' }}
          >
            {PRIMES.map(prime => (
              <option key={prime} value={prime}>{prime}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Генератор g:</label>
          <input type="text" value={g} disabled style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--ifm-color-emphasis-100)' }} />
        </div>
        
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Приватный x:</label>
          <input
            type="number"
            value={privateKey}
            onChange={(e) => setPrivateKey(Math.max(1, Math.min(p - 2, parseInt(e.target.value) || 1)))}
            style={{ padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--ifm-color-emphasis-300)' }}
          />
        </div>
        
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Публичный y:</label>
          <input type="text" value={publicKey} disabled style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--ifm-color-primary)', fontWeight: 'bold' }} />
        </div>
      </div>
      
      {mode === 'encrypt' ? (
        <>
          <div className={styles.inputGroup}>
            <label>Случайное k (НОД(k, p-1) = 1):</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                value={k}
                onChange={(e) => setK(Math.max(2, parseInt(e.target.value) || 2))}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--ifm-color-emphasis-300)' }}
              />
              <button onClick={() => setK(generateK(p))} className={styles.toggleBtn} style={{ marginTop: 0 }}>
                🎲
              </button>
            </div>
            {gcd(k, p - 1) !== 1 && <small style={{ color: '#f44' }}>k должен быть взаимно прост с {p - 1}</small>}
          </div>
          
          <div className={styles.ioGrid}>
            <div className={styles.ioBlock}>
              <label>Сообщение m (0 &lt; m &lt; {p})</label>
              <input
                type="number"
                value={message}
                onChange={(e) => setMessage(parseInt(e.target.value) || 0)}
                style={{ padding: '0.75rem', borderRadius: '10px', border: `2px solid ${msgValid ? 'var(--ifm-color-emphasis-300)' : '#f44'}`, fontSize: '1.2rem' }}
              />
            </div>
            <div className={styles.ioBlock}>
              <label>Шифротекст (a, b)</label>
              <div className={styles.outputBox} style={{ fontSize: '1.2rem' }}>
                ({cipherA}, {cipherB})
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
              <label>Шифротекст a:</label>
              <input
                type="number"
                value={cipherA}
                onChange={(e) => setCipherA(parseInt(e.target.value) || 0)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--ifm-color-emphasis-300)' }}
              />
            </div>
            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
              <label>Шифротекст b:</label>
              <input
                type="number"
                value={cipherB}
                onChange={(e) => setCipherB(parseInt(e.target.value) || 0)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--ifm-color-emphasis-300)' }}
              />
            </div>
          </div>
          
          <div className={styles.outputGroup}>
            <label>Расшифрованное сообщение m:</label>
            <div className={styles.output} style={{ fontSize: '1.5rem', textAlign: 'center' }}>{result}</div>
          </div>
        </>
      )}
      
      <div style={{ 
        background: 'var(--ifm-background-color)', 
        padding: '1rem', 
        borderRadius: '10px',
        border: '1px solid var(--ifm-color-emphasis-200)',
        marginTop: '1rem',
        fontSize: '0.85rem'
      }}>
        <strong>Вычисления:</strong>
        {steps.map((step, i) => (
          <div key={i} style={{ fontFamily: 'monospace', marginTop: '0.25rem' }}>{step}</div>
        ))}
      </div>
      
      <div className={styles.hint}>
        💡 Безопасность основана на сложности дискретного логарифма в конечном поле
      </div>
    </div>
  );
}
