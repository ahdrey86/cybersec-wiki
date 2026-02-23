import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

// Популярные OUI (первые 3 байта MAC)
const VENDOR_OUI: { [key: string]: string } = {
  '00:00:0C': 'Cisco',
  '00:1A:2B': 'Cisco',
  '00:50:56': 'VMware',
  '00:0C:29': 'VMware',
  '00:15:5D': 'Microsoft Hyper-V',
  '08:00:27': 'Oracle VirtualBox',
  '52:54:00': 'QEMU/KVM',
  'AC:DE:48': 'Apple',
  '00:1C:B3': 'Apple',
  '00:03:93': 'Apple',
  '00:23:12': 'Apple',
  '3C:22:FB': 'Apple',
  'A4:83:E7': 'Apple',
  'FC:FC:48': 'Apple',
  '00:1B:63': 'Apple',
  '00:E0:4C': 'Realtek',
  '52:54:AB': 'Realtek',
  '00:24:D7': 'Intel',
  '00:1E:67': 'Intel',
  '00:15:17': 'Intel',
  '00:1F:3B': 'Intel',
  '3C:97:0E': 'Intel',
  '00:24:E8': 'Dell',
  '00:14:22': 'Dell',
  '00:1E:C9': 'Dell',
  '00:1D:09': 'Dell',
  '00:25:64': 'Dell',
  '00:18:8B': 'Dell',
  '00:1A:A0': 'Dell',
  '00:22:19': 'Dell',
  '18:A9:05': 'Hewlett Packard',
  '00:1E:0B': 'Hewlett Packard',
  '00:17:A4': 'Hewlett Packard',
  '00:1B:78': 'Hewlett Packard',
  '00:26:55': 'Hewlett Packard',
  '00:1C:C4': 'Hewlett Packard',
  '00:15:60': 'Hewlett Packard',
  '00:14:C2': 'Hewlett Packard',
  '00:21:5A': 'Hewlett Packard',
  '00:1F:29': 'Hewlett Packard',
  'F0:DE:F1': 'TP-Link',
  '00:23:CD': 'TP-Link',
  '14:CF:92': 'TP-Link',
  '50:C7:BF': 'TP-Link',
  'C0:25:E9': 'TP-Link',
  '08:86:3B': 'Belkin',
  '00:1C:DF': 'Belkin',
  '00:17:3F': 'Belkin',
  '94:10:3E': 'Belkin',
  '00:22:75': 'Belkin',
  '00:1E:58': 'D-Link',
  '00:17:9A': 'D-Link',
  '00:1B:11': 'D-Link',
  '1C:7E:E5': 'D-Link',
  '28:10:7B': 'D-Link',
  '00:24:01': 'D-Link',
  'BC:F6:85': 'D-Link',
  '00:50:BA': 'D-Link',
  'C8:D3:A3': 'D-Link',
  '1C:AF:F7': 'D-Link',
  '34:08:04': 'D-Link',
  '00:1F:33': 'Netgear',
  '00:22:3F': 'Netgear',
  '00:1B:2F': 'Netgear',
  '00:24:B2': 'Netgear',
  '20:4E:7F': 'Netgear',
  'C0:3F:0E': 'Netgear',
  'A4:2B:8C': 'Netgear',
  '00:26:F2': 'Netgear',
  '30:46:9A': 'Netgear',
  '00:18:4D': 'Netgear',
  '84:1B:5E': 'Netgear',
  'E0:91:F5': 'Netgear',
  '00:1E:2A': 'Netgear',
  'E4:F4:C6': 'Netgear',
  '9C:D3:6D': 'Netgear',
  'C4:04:15': 'Netgear',
  '28:C6:8E': 'Netgear',
  '00:14:6C': 'Netgear',
  '44:94:FC': 'Netgear',
  '00:17:94': 'Cisco-Linksys',
  '00:1A:70': 'Cisco-Linksys',
  '00:1C:10': 'Cisco-Linksys',
  '00:1D:7E': 'Cisco-Linksys',
  '00:1E:E5': 'Cisco-Linksys',
  '00:21:29': 'Cisco-Linksys',
  '00:22:6B': 'Cisco-Linksys',
  '00:23:69': 'Cisco-Linksys',
  '00:25:9C': 'Cisco-Linksys',
  'C0:C1:C0': 'Cisco-Linksys',
  '20:AA:4B': 'Cisco-Linksys',
  '58:6D:8F': 'Cisco-Linksys',
  '68:7F:74': 'Cisco-Linksys',
  'E8:94:F6': 'Samsung',
  '00:17:C9': 'Samsung',
  '00:1A:8A': 'Samsung',
  '00:1D:F6': 'Samsung',
  '00:1E:7D': 'Samsung',
  '00:21:4C': 'Samsung',
  '00:23:39': 'Samsung',
  '00:23:D6': 'Samsung',
  '00:23:99': 'Samsung',
  '00:24:54': 'Samsung',
  '00:24:90': 'Samsung',
  '00:25:66': 'Samsung',
  '00:26:37': 'Samsung',
  'D0:DF:9A': 'Samsung',
  '5C:A3:9D': 'Samsung',
  '78:D6:F0': 'Samsung',
  'A8:F2:74': 'Samsung',
  'CC:07:AB': 'Samsung',
  'F4:7B:5E': 'Huawei',
  '00:18:82': 'Huawei',
  '00:1E:10': 'Huawei',
  '00:21:E8': 'Huawei',
  '00:22:A1': 'Huawei',
  '00:25:68': 'Huawei',
  '00:25:9E': 'Huawei',
  '00:46:4B': 'Huawei',
  '00:66:4B': 'Huawei',
  '00:9A:CD': 'Huawei',
  '00:E0:FC': 'Huawei',
  '04:02:1F': 'Huawei',
  '04:BD:70': 'Huawei',
  '04:C0:6F': 'Huawei',
  '04:F9:38': 'Huawei',
  '04:FE:8D': 'Huawei',
  '08:19:A6': 'Huawei',
  '08:63:61': 'Huawei',
  '08:7A:4C': 'Huawei',
  '08:E8:4F': 'Huawei',
  '0C:37:DC': 'Huawei',
  '0C:45:BA': 'Huawei',
  '0C:96:BF': 'Huawei',
  '10:1B:54': 'Huawei',
  '10:44:00': 'Huawei',
  '10:47:80': 'Huawei',
  '10:C6:1F': 'Huawei',
};

function normalizeMac(mac: string): string {
  // Удаляем все разделители и приводим к верхнему регистру
  const clean = mac.replace(/[:\-\.]/g, '').toUpperCase();
  if (clean.length !== 12 || !/^[0-9A-F]+$/.test(clean)) return '';
  
  // Форматируем как XX:XX:XX:XX:XX:XX
  return clean.match(/.{2}/g)?.join(':') || '';
}

function getOui(mac: string): string {
  const normalized = normalizeMac(mac);
  if (!normalized) return '';
  return normalized.slice(0, 8);
}

function isMulticast(mac: string): boolean {
  const normalized = normalizeMac(mac);
  if (!normalized) return false;
  const firstByte = parseInt(normalized.slice(0, 2), 16);
  return (firstByte & 1) === 1;
}

function isLocallyAdministered(mac: string): boolean {
  const normalized = normalizeMac(mac);
  if (!normalized) return false;
  const firstByte = parseInt(normalized.slice(0, 2), 16);
  return (firstByte & 2) === 2;
}

export default function MacAnalyzer(): JSX.Element {
  const [mac, setMac] = useState('00:1A:2B:3C:4D:5E');
  
  const normalized = normalizeMac(mac);
  const isValid = normalized.length === 17;
  const oui = getOui(mac);
  const vendor = VENDOR_OUI[oui] || 'Неизвестный производитель';
  
  const multicast = isValid && isMulticast(mac);
  const localAdmin = isValid && isLocallyAdministered(mac);
  
  // Разные форматы
  const formats = isValid ? {
    colon: normalized,
    dash: normalized.replace(/:/g, '-'),
    dot: normalized.replace(/:/g, '').match(/.{4}/g)?.join('.') || '',
    bare: normalized.replace(/:/g, ''),
  } : null;
  
  // Бинарное представление
  const binary = isValid ? 
    normalized.split(':').map(b => parseInt(b, 16).toString(2).padStart(8, '0')).join(' ') : '';
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>📡 Анализатор MAC-адресов</h4>
      </div>
      
      <div className={styles.inputGroup}>
        <label>MAC-адрес:</label>
        <input
          type="text"
          value={mac}
          onChange={(e) => setMac(e.target.value)}
          placeholder="00:1A:2B:3C:4D:5E"
          style={{
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            padding: '0.75rem',
            textTransform: 'uppercase',
            borderColor: isValid ? 'var(--ifm-color-emphasis-300)' : mac ? '#f44' : 'var(--ifm-color-emphasis-300)'
          }}
        />
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
              <div className={styles.resultLabel}>Производитель (OUI)</div>
              <div className={styles.resultValue} style={{ fontSize: '1rem' }}>{vendor}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>OUI</div>
              <div className={styles.resultValue}>{oui}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Тип</div>
              <div className={styles.resultValue} style={{ color: multicast ? '#f80' : '#0c0' }}>
                {multicast ? 'Multicast' : 'Unicast'}
              </div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Администрирование</div>
              <div className={styles.resultValue} style={{ fontSize: '0.9rem' }}>
                {localAdmin ? 'Локальное (LAA)' : 'Универсальное (UAA)'}
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Форматы записи:</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.5rem'
            }}>
              {formats && Object.entries(formats).map(([name, value]) => (
                <div key={name} className={styles.formatCard}>
                  <span className={styles.formatLabel}>{name}:</span>
                  <code>{value}</code>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{
            background: 'var(--ifm-color-emphasis-100)',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            overflowX: 'auto'
          }}>
            <div><strong>Binary:</strong></div>
            <div style={{ color: 'var(--ifm-color-primary)' }}>{binary}</div>
          </div>
        </>
      )}
      
      <div className={styles.hint}>
        💡 OUI (первые 3 байта) идентифицирует производителя. Бит 0 первого байта: 0=unicast, 1=multicast
      </div>
    </div>
  );
}
