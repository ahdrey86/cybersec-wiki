import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

function cidrToMask(cidr: number): string {
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  return intToIp(mask);
}

function maskToCidr(mask: string): number {
  const num = ipToInt(mask);
  let cidr = 0;
  let temp = num;
  while (temp) {
    cidr += temp & 1;
    temp >>>= 1;
  }
  return cidr;
}

function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const num = parseInt(p);
    return !isNaN(num) && num >= 0 && num <= 255 && p === String(num);
  });
}

function getNetworkClass(ip: string): string {
  const firstOctet = parseInt(ip.split('.')[0]);
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)';
  return '—';
}

function isPrivate(ip: string): boolean {
  const num = ipToInt(ip);
  // 10.0.0.0/8
  if ((num >>> 24) === 10) return true;
  // 172.16.0.0/12
  if ((num >>> 20) === (172 << 4 | 1)) return true;
  // 192.168.0.0/16
  if ((num >>> 16) === (192 << 8 | 168)) return true;
  return false;
}

export default function SubnetCalculator(): JSX.Element {
  const [ip, setIp] = useState('192.168.1.100');
  const [cidr, setCidr] = useState(24);
  
  const isValid = isValidIp(ip);
  
  let network = '', broadcast = '', firstHost = '', lastHost = '';
  let totalHosts = 0, usableHosts = 0;
  let wildcardMask = '', binaryMask = '';
  
  if (isValid) {
    const ipInt = ipToInt(ip);
    const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardInt = ~maskInt >>> 0;
    
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;
    
    network = intToIp(networkInt);
    broadcast = intToIp(broadcastInt);
    firstHost = intToIp(networkInt + 1);
    lastHost = intToIp(broadcastInt - 1);
    wildcardMask = intToIp(wildcardInt);
    
    totalHosts = Math.pow(2, 32 - cidr);
    usableHosts = Math.max(0, totalHosts - 2);
    
    binaryMask = maskInt.toString(2).padStart(32, '0').match(/.{8}/g)?.join('.') || '';
  }
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🌐 Калькулятор подсетей IPv4</h4>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>IP-адрес:</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.100"
            style={{
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              padding: '0.75rem',
              borderColor: isValid ? 'var(--ifm-color-emphasis-300)' : '#f44'
            }}
          />
        </div>
        
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>CIDR (/{cidr}):</label>
          <input
            type="range"
            min="0"
            max="32"
            value={cidr}
            onChange={(e) => setCidr(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '1.2rem' }}>
            /{cidr}
          </div>
        </div>
      </div>
      
      {isValid && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Сеть</div>
              <div className={styles.resultValue}>{network}/{cidr}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Маска</div>
              <div className={styles.resultValue}>{cidrToMask(cidr)}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Wildcard</div>
              <div className={styles.resultValue}>{wildcardMask}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Broadcast</div>
              <div className={styles.resultValue}>{broadcast}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Первый хост</div>
              <div className={styles.resultValue}>{usableHosts > 0 ? firstHost : '—'}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Последний хост</div>
              <div className={styles.resultValue}>{usableHosts > 0 ? lastHost : '—'}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Всего адресов</div>
              <div className={styles.resultValue}>{totalHosts.toLocaleString()}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Доступно хостов</div>
              <div className={styles.resultValue}>{usableHosts.toLocaleString()}</div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div className={styles.infoCard}>
              <span>Класс:</span>
              <strong>{getNetworkClass(ip)}</strong>
            </div>
            <div className={styles.infoCard}>
              <span>Тип:</span>
              <strong style={{ color: isPrivate(ip) ? '#0c0' : '#f80' }}>
                {isPrivate(ip) ? 'Частный' : 'Публичный'}
              </strong>
            </div>
          </div>
          
          <div style={{
            background: 'var(--ifm-color-emphasis-100)',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            overflowX: 'auto'
          }}>
            <div><strong>Маска (binary):</strong></div>
            <div style={{ color: 'var(--ifm-color-primary)' }}>{binaryMask}</div>
          </div>
        </>
      )}
      
      <div className={styles.hint}>
        💡 CIDR /24 = 256 адресов (254 хоста), /16 = 65536 адресов
      </div>
    </div>
  );
}
