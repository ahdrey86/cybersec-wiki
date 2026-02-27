import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

interface ParsedLog {
  timestamp?: string;
  hostname?: string;
  facility?: string;
  severity?: string;
  process?: string;
  pid?: string;
  message?: string;
  src_ip?: string;
  dst_ip?: string;
  src_port?: string;
  dst_port?: string;
  user?: string;
  action?: string;
  raw: string;
  format: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  'emerg': '#ff0000',
  'alert': '#ff3333',
  'crit': '#ff6666',
  'err': '#ff9999',
  'error': '#ff9999',
  'warning': '#ffaa00',
  'warn': '#ffaa00',
  'notice': '#00d4aa',
  'info': '#00b4d8',
  'debug': '#9b5de5',
};

const SAMPLE_LOGS = [
  {
    name: 'Syslog (Linux)',
    log: 'Feb 23 14:32:15 webserver01 sshd[12345]: Failed password for invalid user admin from 192.168.1.100 port 52431 ssh2'
  },
  {
    name: 'Apache Access',
    log: '192.168.1.50 - - [23/Feb/2024:14:32:15 +0300] "GET /admin/login.php HTTP/1.1" 404 1234 "-" "Mozilla/5.0"'
  },
  {
    name: 'Windows Event',
    log: '2024-02-23T14:32:15.123Z DESKTOP-ABC Security 4625 An account failed to log on. User: admin Source: 192.168.1.100'
  },
  {
    name: 'Firewall (iptables)',
    log: 'Feb 23 14:32:15 firewall kernel: [UFW BLOCK] IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC=10.0.0.50 DST=192.168.1.1 PROTO=TCP SPT=44231 DPT=22'
  },
  {
    name: 'Nginx Error',
    log: '2024/02/23 14:32:15 [error] 1234#0: *5678 open() "/var/www/html/wp-admin" failed (2: No such file or directory), client: 192.168.1.100'
  },
  {
    name: 'JSON (Elastic)',
    log: '{"@timestamp":"2024-02-23T14:32:15.000Z","level":"ERROR","logger":"auth","message":"Login failed","user":"admin","src_ip":"192.168.1.100"}'
  },
];

const parseLog = (log: string): ParsedLog => {
  const result: ParsedLog = { raw: log, format: 'unknown' };
  
  // Syslog format
  const syslogMatch = log.match(/^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\S+?)(?:\[(\d+)\])?:\s+(.*)$/);
  if (syslogMatch) {
    result.format = 'syslog';
    result.timestamp = syslogMatch[1];
    result.hostname = syslogMatch[2];
    result.process = syslogMatch[3];
    result.pid = syslogMatch[4];
    result.message = syslogMatch[5];
    
    // Extract IPs
    const ipMatch = result.message?.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
    if (ipMatch) {
      result.src_ip = ipMatch[0];
      if (ipMatch[1]) result.dst_ip = ipMatch[1];
    }
    
    // Extract user
    const userMatch = result.message?.match(/user[=:\s]+(\S+)/i);
    if (userMatch) result.user = userMatch[1];
    
    // Detect action
    if (result.message?.toLowerCase().includes('failed')) result.action = 'FAILED';
    else if (result.message?.toLowerCase().includes('accepted')) result.action = 'SUCCESS';
    else if (result.message?.toLowerCase().includes('block')) result.action = 'BLOCKED';
    
    return result;
  }
  
  // Apache/Nginx access log
  const apacheMatch = log.match(/^(\S+)\s+\S+\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)[^"]*"\s+(\d+)\s+(\d+)/);
  if (apacheMatch) {
    result.format = 'apache';
    result.src_ip = apacheMatch[1];
    result.user = apacheMatch[2] === '-' ? undefined : apacheMatch[2];
    result.timestamp = apacheMatch[3];
    result.message = `${apacheMatch[4]} ${apacheMatch[5]} → ${apacheMatch[6]}`;
    result.action = parseInt(apacheMatch[6]) >= 400 ? 'ERROR' : 'OK';
    return result;
  }
  
  // JSON format
  if (log.trim().startsWith('{')) {
    try {
      const json = JSON.parse(log);
      result.format = 'json';
      result.timestamp = json['@timestamp'] || json.timestamp || json.time;
      result.severity = json.level || json.severity;
      result.message = json.message || json.msg;
      result.src_ip = json.src_ip || json.source_ip || json.client_ip;
      result.user = json.user || json.username;
      result.process = json.logger || json.service;
      return result;
    } catch (e) {
      // Not valid JSON
    }
  }
  
  // Windows Event style
  const winMatch = log.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(\S+)\s+(\S+)\s+(\d+)\s+(.*)$/);
  if (winMatch) {
    result.format = 'windows';
    result.timestamp = winMatch[1];
    result.hostname = winMatch[2];
    result.facility = winMatch[3];
    result.message = `Event ${winMatch[4]}: ${winMatch[5]}`;
    
    const ipMatch = log.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    if (ipMatch) result.src_ip = ipMatch[1];
    
    const userMatch = log.match(/User:\s*(\S+)/i);
    if (userMatch) result.user = userMatch[1];
    
    if (log.includes('4625') || log.includes('failed')) result.action = 'FAILED';
    
    return result;
  }
  
  // Firewall/iptables
  const fwMatch = log.match(/SRC=(\S+).*DST=(\S+).*PROTO=(\S+).*SPT=(\d+).*DPT=(\d+)/);
  if (fwMatch) {
    result.format = 'firewall';
    result.src_ip = fwMatch[1];
    result.dst_ip = fwMatch[2];
    result.src_port = fwMatch[4];
    result.dst_port = fwMatch[5];
    result.message = `${fwMatch[3]} ${fwMatch[1]}:${fwMatch[4]} → ${fwMatch[2]}:${fwMatch[5]}`;
    
    if (log.includes('BLOCK') || log.includes('DROP')) result.action = 'BLOCKED';
    else if (log.includes('ALLOW') || log.includes('ACCEPT')) result.action = 'ALLOWED';
    
    const tsMatch = log.match(/^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/);
    if (tsMatch) result.timestamp = tsMatch[1];
    
    return result;
  }
  
  // Generic - try to extract what we can
  result.format = 'generic';
  const genericIp = log.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
  if (genericIp) {
    result.src_ip = genericIp[0];
    if (genericIp[1]) result.dst_ip = genericIp[1];
  }
  result.message = log;
  
  return result;
};

export default function LogAnalyzer(): JSX.Element {
  const [logInput, setLogInput] = useState(SAMPLE_LOGS[0].log);
  const [parsed, setParsed] = useState<ParsedLog | null>(null);
  
  const handleParse = () => {
    setParsed(parseLog(logInput));
  };
  
  const handleSample = (log: string) => {
    setLogInput(log);
    setParsed(parseLog(log));
  };
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>📋 Анализатор логов</h4>
      </div>
      
      {/* Примеры */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-600)' }}>
          Примеры логов:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SAMPLE_LOGS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSample(sample.log)}
              style={{
                padding: '0.4rem 0.8rem',
                background: 'var(--ifm-color-emphasis-200)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Ввод */}
      <div className={styles.inputGroup}>
        <label>Лог-запись:</label>
        <textarea
          value={logInput}
          onChange={(e) => setLogInput(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '2px solid var(--ifm-color-emphasis-300)',
            background: 'var(--ifm-background-color)',
            resize: 'vertical',
          }}
          placeholder="Вставьте лог-запись для анализа..."
        />
      </div>
      
      <button
        onClick={handleParse}
        style={{
          padding: '0.75rem 2rem',
          background: 'var(--ifm-color-primary)',
          border: 'none',
          borderRadius: '8px',
          color: '#000',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        🔍 Анализировать
      </button>
      
      {/* Результат */}
      {parsed && (
        <div style={{
          background: 'var(--ifm-color-emphasis-100)',
          borderRadius: '12px',
          padding: '1rem',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--ifm-color-emphasis-200)'
          }}>
            <span style={{ fontWeight: 600 }}>Формат: {parsed.format.toUpperCase()}</span>
            {parsed.action && (
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: parsed.action === 'FAILED' || parsed.action === 'BLOCKED' || parsed.action === 'ERROR'
                  ? 'rgba(239, 71, 111, 0.2)'
                  : 'rgba(0, 212, 170, 0.2)',
                color: parsed.action === 'FAILED' || parsed.action === 'BLOCKED' || parsed.action === 'ERROR'
                  ? '#ef476f'
                  : '#00d4aa',
              }}>
                {parsed.action}
              </span>
            )}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}>
            {parsed.timestamp && (
              <Field label="Timestamp" value={parsed.timestamp} icon="🕐" />
            )}
            {parsed.hostname && (
              <Field label="Hostname" value={parsed.hostname} icon="🖥️" />
            )}
            {parsed.src_ip && (
              <Field label="Source IP" value={parsed.src_ip} icon="📤" highlight />
            )}
            {parsed.dst_ip && (
              <Field label="Dest IP" value={parsed.dst_ip} icon="📥" />
            )}
            {parsed.src_port && (
              <Field label="Src Port" value={parsed.src_port} icon="🔌" />
            )}
            {parsed.dst_port && (
              <Field label="Dst Port" value={parsed.dst_port} icon="🎯" />
            )}
            {parsed.user && (
              <Field label="User" value={parsed.user} icon="👤" highlight />
            )}
            {parsed.process && (
              <Field label="Process" value={parsed.process} icon="⚙️" />
            )}
            {parsed.pid && (
              <Field label="PID" value={parsed.pid} icon="🔢" />
            )}
            {parsed.severity && (
              <Field 
                label="Severity" 
                value={parsed.severity} 
                icon="⚠️"
                color={SEVERITY_COLORS[parsed.severity.toLowerCase()]}
              />
            )}
          </div>
          
          {parsed.message && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.25rem' }}>
                📝 Message
              </div>
              <div style={{
                padding: '0.75rem',
                background: 'var(--ifm-color-emphasis-200)',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                wordBreak: 'break-word',
              }}>
                {parsed.message}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Поддерживает: Syslog, Apache/Nginx, Windows Event, iptables, JSON
      </div>
    </div>
  );
}

function Field({ label, value, icon, highlight, color }: { 
  label: string; 
  value: string; 
  icon: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div style={{
      padding: '0.5rem 0.75rem',
      background: highlight ? 'rgba(0, 212, 170, 0.1)' : 'var(--ifm-color-emphasis-200)',
      borderRadius: '6px',
      border: highlight ? '1px solid rgba(0, 212, 170, 0.3)' : 'none',
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-600)' }}>
        {icon} {label}
      </div>
      <div style={{ 
        fontFamily: 'monospace', 
        fontWeight: 600,
        color: color || 'inherit',
      }}>
        {value}
      </div>
    </div>
  );
}
