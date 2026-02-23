import React, { useState } from 'react';
import styles from './CipherStyles.module.css';

// Простая хеш-функция для демонстрации (не криптографическая!)
const simpleHash = (data: string, rounds: number = 64): string => {
  let hash = new Array(32).fill(0);
  const bytes = new TextEncoder().encode(data);
  
  for (let i = 0; i < bytes.length; i++) {
    hash[i % 32] ^= bytes[i];
    hash[(i + 1) % 32] ^= (bytes[i] * 7) & 0xFF;
    hash[(i + 7) % 32] ^= (bytes[i] * 13) & 0xFF;
  }
  
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < 32; i++) {
      hash[i] = (hash[i] + hash[(i + 1) % 32] * 3 + r) & 0xFF;
    }
  }
  
  return hash.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

// HMAC
const hmac = (key: string, message: string): { 
  keyPadded: string; 
  ipad: string; 
  opad: string;
  innerHash: string;
  outerHash: string;
} => {
  const blockSize = 64; // байт
  
  // Подготовка ключа
  let keyBytes = new TextEncoder().encode(key);
  if (keyBytes.length > blockSize) {
    keyBytes = new TextEncoder().encode(simpleHash(key).slice(0, 32));
  }
  
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(keyBytes);
  
  // ipad и opad
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5C;
  }
  
  // Внутренний хеш: H(K ⊕ ipad || message)
  const innerData = new TextDecoder().decode(ipad) + message;
  const innerHash = simpleHash(innerData);
  
  // Внешний хеш: H(K ⊕ opad || inner_hash)
  const outerData = new TextDecoder().decode(opad) + innerHash;
  const outerHash = simpleHash(outerData);
  
  return {
    keyPadded: Array.from(paddedKey.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(''),
    ipad: Array.from(ipad.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(''),
    opad: Array.from(opad.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(''),
    innerHash,
    outerHash
  };
};

export default function HMACDemo(): JSX.Element {
  const [key, setKey] = useState('secret-key');
  const [message, setMessage] = useState('Hello, World!');
  const [showSteps, setShowSteps] = useState(true);
  
  const result = hmac(key, message);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔐 HMAC (Hash-based MAC)</h4>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Секретный ключ:</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="secret-key"
          />
        </div>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Сообщение:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hello, World!"
          />
        </div>
      </div>
      
      {/* Результат */}
      <div className={styles.outputGroup}>
        <label>HMAC (256 бит):</label>
        <div className={styles.output} style={{ 
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          wordBreak: 'break-all'
        }}>
          {result.outerHash}
        </div>
      </div>
      
      {/* Формула */}
      <div style={{
        padding: '1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <strong>HMAC(K, m) = H((K' ⊕ opad) || H((K' ⊕ ipad) || m))</strong>
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.5rem' }}>
          ipad = 0x36 повторяется • opad = 0x5C повторяется
        </div>
      </div>
      
      {/* Шаги */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowSteps(!showSteps)}
      >
        {showSteps ? '▼ Скрыть шаги' : '▶ Показать шаги'}
      </button>
      
      {showSteps && (
        <div style={{ marginTop: '1rem' }}>
          {[
            { 
              step: '1. Подготовка ключа', 
              desc: `K' = pad(K) до размера блока`,
              value: result.keyPadded + '...',
              color: '#6c757d'
            },
            { 
              step: '2. K\' ⊕ ipad', 
              desc: 'XOR ключа с 0x36...36',
              value: result.ipad + '...',
              color: '#f72585'
            },
            { 
              step: '3. Внутренний хеш', 
              desc: 'H((K\' ⊕ ipad) || message)',
              value: result.innerHash.slice(0, 32) + '...',
              color: '#00b4d8'
            },
            { 
              step: '4. K\' ⊕ opad', 
              desc: 'XOR ключа с 0x5C...5C',
              value: result.opad + '...',
              color: '#9b5de5'
            },
            { 
              step: '5. Внешний хеш (результат)', 
              desc: 'H((K\' ⊕ opad) || inner_hash)',
              value: result.outerHash.slice(0, 32) + '...',
              color: '#00d4aa'
            },
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
              <div><strong>{item.step}:</strong> {item.desc}</div>
              <code style={{ fontSize: '0.8rem' }}>{item.value}</code>
            </div>
          ))}
        </div>
      )}
      
      {/* Диаграмма */}
      <div style={{
        padding: '1rem',
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <strong>Схема HMAC:</strong>
        <pre style={{ 
          fontSize: '0.75rem', 
          margin: '0.5rem 0 0 0',
          overflow: 'auto'
        }}>
{`
    K'           K'
    |            |
  ⊕ ipad      ⊕ opad
    |            |
    v            v
  ┌───┐        ┌───┐
  │   │        │   │
  │ H │◄─ m    │ H │◄── inner_hash
  │   │        │   │
  └───┘        └───┘
    |            |
    v            v
 inner_hash    HMAC
`}
        </pre>
      </div>
      
      {/* Применение */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(0, 212, 170, 0.1)',
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        <strong>📌 Применение HMAC:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li><strong>JWT</strong> — подпись токенов (HS256 = HMAC-SHA256)</li>
          <li><strong>API</strong> — аутентификация запросов</li>
          <li><strong>TLS</strong> — проверка целостности</li>
          <li><strong>HKDF</strong> — выведение ключей</li>
        </ul>
      </div>
      
      <div className={styles.hint}>
        ⚠️ Демонстрационная хеш-функция. В реальности используйте HMAC-SHA256.
      </div>
    </div>
  );
}
