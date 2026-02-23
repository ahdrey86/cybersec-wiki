import React, { useState, useEffect } from 'react';
import styles from './CipherStyles.module.css';

// Быстрое модульное возведение в степень
const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
};

// Простые числа для демонстрации
const PRIMES = [23, 47, 97, 199, 401, 797, 1597, 3191];
const GENERATORS: Record<number, number[]> = {
  23: [5, 7, 10, 11, 14, 15, 17, 19, 20, 21],
  47: [5, 10, 11, 13, 15, 19, 20, 22],
  97: [5, 7, 10, 13, 14, 15, 17, 21],
  199: [3, 5, 11, 13, 14, 17, 19, 21],
  401: [3, 7, 11, 13, 17, 19, 21, 23],
  797: [2, 3, 5, 7, 11, 13, 17, 19],
  1597: [3, 5, 7, 11, 13, 17, 19, 23],
  3191: [7, 11, 13, 17, 19, 23, 29, 31]
};

export default function DiffieHellman(): JSX.Element {
  const [p, setP] = useState(23);
  const [g, setG] = useState(5);
  const [alicePrivate, setAlicePrivate] = useState(6);
  const [bobPrivate, setBobPrivate] = useState(15);
  const [showSteps, setShowSteps] = useState(true);
  
  // Вычисления
  const alicePublic = modPow(BigInt(g), BigInt(alicePrivate), BigInt(p));
  const bobPublic = modPow(BigInt(g), BigInt(bobPrivate), BigInt(p));
  const aliceShared = modPow(bobPublic, BigInt(alicePrivate), BigInt(p));
  const bobShared = modPow(alicePublic, BigInt(bobPrivate), BigInt(p));
  
  const sharedSecret = aliceShared; // Должны совпадать
  
  // Случайные значения
  const randomize = () => {
    const newP = PRIMES[Math.floor(Math.random() * PRIMES.length)];
    const gens = GENERATORS[newP] || [2];
    const newG = gens[Math.floor(Math.random() * gens.length)];
    setP(newP);
    setG(newG);
    setAlicePrivate(Math.floor(Math.random() * (newP - 2)) + 2);
    setBobPrivate(Math.floor(Math.random() * (newP - 2)) + 2);
  };
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔑 Обмен ключами Диффи-Хеллмана</h4>
      </div>
      
      {/* Параметры */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>p (простое число):</label>
          <select
            value={p}
            onChange={(e) => {
              const newP = parseInt(e.target.value);
              setP(newP);
              const gens = GENERATORS[newP] || [2];
              setG(gens[0]);
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid var(--ifm-color-emphasis-300)',
              background: 'var(--ifm-background-color)',
              width: '100%'
            }}
          >
            {PRIMES.map(prime => (
              <option key={prime} value={prime}>{prime}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>g (генератор):</label>
          <select
            value={g}
            onChange={(e) => setG(parseInt(e.target.value))}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid var(--ifm-color-emphasis-300)',
              background: 'var(--ifm-background-color)',
              width: '100%'
            }}
          >
            {(GENERATORS[p] || [2]).map(gen => (
              <option key={gen} value={gen}>{gen}</option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        onClick={randomize}
        style={{
          padding: '0.5rem 1.5rem',
          background: 'var(--ifm-color-primary)',
          border: 'none',
          borderRadius: '8px',
          color: '#000',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1.5rem'
        }}
      >
        🎲 Случайные значения
      </button>
      
      {/* Алиса и Боб */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Алиса */}
        <div style={{
          padding: '1rem',
          background: 'rgba(247, 37, 133, 0.1)',
          borderRadius: '12px',
          border: '2px solid #f72585'
        }}>
          <h4 style={{ color: '#f72585', margin: '0 0 1rem 0', textAlign: 'center' }}>
            👩 Алиса
          </h4>
          
          <div className={styles.inputGroup} style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem' }}>Секретный ключ (a):</label>
            <input
              type="number"
              value={alicePrivate}
              onChange={(e) => setAlicePrivate(Math.max(2, Math.min(p - 1, parseInt(e.target.value) || 2)))}
              min={2}
              max={p - 1}
              style={{ background: 'rgba(247, 37, 133, 0.1)' }}
            />
          </div>
          
          <div style={{
            padding: '0.75rem',
            background: 'rgba(247, 37, 133, 0.2)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Публичный ключ A = g^a mod p
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              A = {alicePublic.toString()}
            </div>
          </div>
        </div>
        
        {/* Стрелки */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{ color: '#f72585', fontWeight: 700 }}>A →</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
            публичные
          </div>
          <div style={{ color: '#00b4d8', fontWeight: 700 }}>← B</div>
        </div>
        
        {/* Боб */}
        <div style={{
          padding: '1rem',
          background: 'rgba(0, 180, 216, 0.1)',
          borderRadius: '12px',
          border: '2px solid #00b4d8'
        }}>
          <h4 style={{ color: '#00b4d8', margin: '0 0 1rem 0', textAlign: 'center' }}>
            👨 Боб
          </h4>
          
          <div className={styles.inputGroup} style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem' }}>Секретный ключ (b):</label>
            <input
              type="number"
              value={bobPrivate}
              onChange={(e) => setBobPrivate(Math.max(2, Math.min(p - 1, parseInt(e.target.value) || 2)))}
              min={2}
              max={p - 1}
              style={{ background: 'rgba(0, 180, 216, 0.1)' }}
            />
          </div>
          
          <div style={{
            padding: '0.75rem',
            background: 'rgba(0, 180, 216, 0.2)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Публичный ключ B = g^b mod p
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              B = {bobPublic.toString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Общий секрет */}
      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.2) 0%, rgba(155, 93, 229, 0.2) 100%)',
        borderRadius: '12px',
        border: '2px solid var(--ifm-color-primary)',
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          🔐 Общий секретный ключ
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>
          K = {sharedSecret.toString()}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.5rem' }}>
          Алиса: B^a mod p = {bobPublic.toString()}^{alicePrivate} mod {p} = {aliceShared.toString()}
          <br />
          Боб: A^b mod p = {alicePublic.toString()}^{bobPrivate} mod {p} = {bobShared.toString()}
        </div>
      </div>
      
      {/* Шаги протокола */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSteps(!showSteps)}
      >
        {showSteps ? '▼ Скрыть протокол' : '▶ Показать протокол'}
      </button>
      
      {showSteps && (
        <div style={{ marginTop: '1rem' }}>
          {[
            { step: '1. Публичные параметры', desc: `Выбирают простое p=${p} и генератор g=${g}`, color: '#6c757d' },
            { step: '2. Алиса генерирует', desc: `Секретный a=${alicePrivate}, публичный A = ${g}^${alicePrivate} mod ${p} = ${alicePublic}`, color: '#f72585' },
            { step: '3. Боб генерирует', desc: `Секретный b=${bobPrivate}, публичный B = ${g}^${bobPrivate} mod ${p} = ${bobPublic}`, color: '#00b4d8' },
            { step: '4. Обмен', desc: `Алиса отправляет A=${alicePublic}, Боб отправляет B=${bobPublic}`, color: '#ff9f1c' },
            { step: '5. Вычисление секрета', desc: `Алиса: ${bobPublic}^${alicePrivate} = ${aliceShared}, Боб: ${alicePublic}^${bobPrivate} = ${bobShared}`, color: '#00d4aa' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '0.75rem 1rem',
                background: `${item.color}15`,
                borderLeft: `4px solid ${item.color}`,
                marginBottom: '0.5rem',
                borderRadius: '0 8px 8px 0'
              }}
            >
              <strong>{item.step}:</strong> {item.desc}
            </div>
          ))}
        </div>
      )}
      
      {/* Безопасность */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(239, 71, 111, 0.1)',
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        <strong>⚠️ Безопасность:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li>Злоумышленник видит: p, g, A, B</li>
          <li>Не может узнать: a, b, K (задача дискретного логарифма)</li>
          <li>Уязвим к MITM без аутентификации</li>
          <li>В реальности: p ~2048 бит, эллиптические кривые (ECDH)</li>
        </ul>
      </div>
      
      <div className={styles.hint}>
        💡 DH используется в TLS, SSH, IPsec для согласования сессионных ключей
      </div>
    </div>
  );
}
