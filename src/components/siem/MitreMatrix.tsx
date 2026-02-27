import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

interface Technique {
  id: string;
  name: string;
  description: string;
  examples: string[];
  detection: string[];
  mitigations: string[];
}

interface Tactic {
  id: string;
  name: string;
  shortName: string;
  color: string;
  techniques: Technique[];
}

const MITRE_MATRIX: Tactic[] = [
  {
    id: 'TA0001',
    name: 'Initial Access',
    shortName: 'Начальный доступ',
    color: '#ef476f',
    techniques: [
      {
        id: 'T1566',
        name: 'Phishing',
        description: 'Фишинговые атаки через email с вредоносными вложениями или ссылками',
        examples: ['Spear phishing attachment', 'Spear phishing link', 'Spear phishing via service'],
        detection: ['Email gateway logs', 'DNS queries', 'Proxy logs'],
        mitigations: ['User training', 'Email filtering', 'Antivirus'],
      },
      {
        id: 'T1190',
        name: 'Exploit Public-Facing App',
        description: 'Эксплуатация уязвимостей в публичных веб-приложениях',
        examples: ['SQL injection', 'RCE в CMS', 'Log4Shell'],
        detection: ['WAF logs', 'Application logs', 'IDS/IPS'],
        mitigations: ['Patching', 'WAF', 'Input validation'],
      },
    ],
  },
  {
    id: 'TA0002',
    name: 'Execution',
    shortName: 'Выполнение',
    color: '#ff6b6b',
    techniques: [
      {
        id: 'T1059',
        name: 'Command and Scripting Interpreter',
        description: 'Использование интерпретаторов команд для выполнения кода',
        examples: ['PowerShell', 'Bash', 'Python', 'VBScript'],
        detection: ['Process monitoring', 'Script logging', 'Command-line audit'],
        mitigations: ['Disable scripting', 'Application whitelisting', 'Code signing'],
      },
      {
        id: 'T1204',
        name: 'User Execution',
        description: 'Пользователь запускает вредоносный код',
        examples: ['Открытие вложения', 'Клик по ссылке', 'Запуск макроса'],
        detection: ['Process creation', 'File execution events'],
        mitigations: ['User training', 'Restrict macros'],
      },
    ],
  },
  {
    id: 'TA0003',
    name: 'Persistence',
    shortName: 'Закрепление',
    color: '#ff9f1c',
    techniques: [
      {
        id: 'T1053',
        name: 'Scheduled Task/Job',
        description: 'Использование планировщика задач для закрепления',
        examples: ['Windows Task Scheduler', 'Cron', 'At'],
        detection: ['Scheduled task creation events', 'Registry monitoring'],
        mitigations: ['Restrict task creation', 'Audit scheduled tasks'],
      },
      {
        id: 'T1547',
        name: 'Boot or Logon Autostart',
        description: 'Автозапуск при загрузке или входе пользователя',
        examples: ['Registry Run keys', 'Startup folder', 'systemd'],
        detection: ['Registry monitoring', 'Startup folder monitoring'],
        mitigations: ['Restrict registry access', 'GPO'],
      },
    ],
  },
  {
    id: 'TA0004',
    name: 'Privilege Escalation',
    shortName: 'Повышение привилегий',
    color: '#00d4aa',
    techniques: [
      {
        id: 'T1068',
        name: 'Exploitation for Privilege Escalation',
        description: 'Эксплуатация уязвимостей для повышения привилегий',
        examples: ['Kernel exploits', 'SUID binaries', 'Token manipulation'],
        detection: ['Process monitoring', 'Exploit detection signatures'],
        mitigations: ['Patching', 'Least privilege'],
      },
      {
        id: 'T1548',
        name: 'Abuse Elevation Control',
        description: 'Обход механизмов контроля повышения привилегий',
        examples: ['UAC bypass', 'Sudo caching', 'setuid/setgid'],
        detection: ['UAC bypass detection', 'Sudo logging'],
        mitigations: ['UAC enforcement', 'Sudo timeout'],
      },
    ],
  },
  {
    id: 'TA0005',
    name: 'Defense Evasion',
    shortName: 'Обход защиты',
    color: '#00b4d8',
    techniques: [
      {
        id: 'T1070',
        name: 'Indicator Removal',
        description: 'Удаление следов активности атакующего',
        examples: ['Clear logs', 'Delete files', 'Timestomp'],
        detection: ['Log deletion events', 'File deletion monitoring'],
        mitigations: ['Remote logging', 'Immutable logs'],
      },
      {
        id: 'T1027',
        name: 'Obfuscated Files or Information',
        description: 'Обфускация вредоносного кода',
        examples: ['Base64 encoding', 'Encryption', 'Packing'],
        detection: ['Content inspection', 'Entropy analysis'],
        mitigations: ['Deobfuscation tools', 'Sandboxing'],
      },
    ],
  },
  {
    id: 'TA0006',
    name: 'Credential Access',
    shortName: 'Доступ к учётным данным',
    color: '#9b5de5',
    techniques: [
      {
        id: 'T1003',
        name: 'OS Credential Dumping',
        description: 'Извлечение учётных данных из ОС',
        examples: ['LSASS dump', 'SAM', '/etc/shadow', 'Mimikatz'],
        detection: ['LSASS access', 'Registry access to SAM'],
        mitigations: ['Credential Guard', 'Protected Users group'],
      },
      {
        id: 'T1110',
        name: 'Brute Force',
        description: 'Перебор паролей',
        examples: ['Password spraying', 'Dictionary attack', 'Credential stuffing'],
        detection: ['Failed login attempts', 'Account lockouts'],
        mitigations: ['Account lockout', 'MFA', 'Rate limiting'],
      },
    ],
  },
  {
    id: 'TA0007',
    name: 'Discovery',
    shortName: 'Разведка',
    color: '#7b68ee',
    techniques: [
      {
        id: 'T1087',
        name: 'Account Discovery',
        description: 'Обнаружение учётных записей в системе',
        examples: ['net user', 'Get-ADUser', 'cat /etc/passwd'],
        detection: ['Command-line monitoring', 'AD query logging'],
        mitigations: ['Restrict AD queries', 'Audit logging'],
      },
      {
        id: 'T1046',
        name: 'Network Service Discovery',
        description: 'Сканирование сети для обнаружения сервисов',
        examples: ['Nmap', 'Port scanning', 'Service enumeration'],
        detection: ['Network traffic analysis', 'IDS alerts'],
        mitigations: ['Network segmentation', 'Firewall rules'],
      },
    ],
  },
  {
    id: 'TA0008',
    name: 'Lateral Movement',
    shortName: 'Боковое перемещение',
    color: '#ff69b4',
    techniques: [
      {
        id: 'T1021',
        name: 'Remote Services',
        description: 'Использование удалённых сервисов для перемещения',
        examples: ['RDP', 'SSH', 'SMB', 'WinRM'],
        detection: ['Remote login events', 'Network connections'],
        mitigations: ['MFA', 'Network segmentation', 'JIT access'],
      },
      {
        id: 'T1570',
        name: 'Lateral Tool Transfer',
        description: 'Передача инструментов между системами',
        examples: ['SMB copy', 'SCP', 'HTTP download'],
        detection: ['File transfer monitoring', 'Network traffic'],
        mitigations: ['Application whitelisting', 'Network monitoring'],
      },
    ],
  },
];

export default function MitreMatrix(): JSX.Element {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [selectedTactic, setSelectedTactic] = useState<Tactic | null>(null);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🎯 MITRE ATT&CK Matrix</h4>
      </div>
      
      {/* Матрица */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${MITRE_MATRIX.length}, 1fr)`,
        gap: '4px',
        marginBottom: '1rem',
        overflowX: 'auto',
      }}>
        {/* Заголовки тактик */}
        {MITRE_MATRIX.map((tactic) => (
          <div
            key={tactic.id}
            onClick={() => {
              setSelectedTactic(tactic);
              setSelectedTechnique(null);
            }}
            style={{
              padding: '0.5rem',
              background: tactic.color,
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem',
              textAlign: 'center',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
            }}
          >
            {tactic.shortName}
          </div>
        ))}
        
        {/* Техники */}
        {MITRE_MATRIX.map((tactic) => (
          <div key={`tech-${tactic.id}`} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tactic.techniques.map((tech) => (
              <div
                key={tech.id}
                onClick={() => {
                  setSelectedTechnique(tech);
                  setSelectedTactic(tactic);
                }}
                style={{
                  padding: '0.4rem',
                  background: selectedTechnique?.id === tech.id 
                    ? `${tactic.color}40` 
                    : 'var(--ifm-color-emphasis-100)',
                  border: selectedTechnique?.id === tech.id 
                    ? `2px solid ${tactic.color}`
                    : '2px solid transparent',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 600, color: tactic.color }}>{tech.id}</div>
                <div style={{ fontSize: '0.6rem', marginTop: '2px' }}>{tech.name}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Детали выбранной техники */}
      {selectedTechnique && selectedTactic && (
        <div style={{
          padding: '1rem',
          background: `${selectedTactic.color}15`,
          borderRadius: '8px',
          border: `2px solid ${selectedTactic.color}50`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <h4 style={{ margin: 0, color: selectedTactic.color }}>
                {selectedTechnique.id}: {selectedTechnique.name}
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
                {selectedTactic.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedTechnique(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: 'var(--ifm-color-emphasis-600)',
              }}
            >
              ✕
            </button>
          </div>
          
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            {selectedTechnique.description}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                💥 Примеры
              </div>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.85rem' }}>
                {selectedTechnique.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                🔍 Обнаружение
              </div>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.85rem' }}>
                {selectedTechnique.detection.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                🛡️ Защита
              </div>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.85rem' }}>
                {selectedTechnique.mitigations.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ifm-color-emphasis-200)' }}>
            <a 
              href={`https://attack.mitre.org/techniques/${selectedTechnique.id}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.85rem', color: selectedTactic.color }}
            >
              📖 Подробнее на MITRE ATT&CK →
            </a>
          </div>
        </div>
      )}
      
      {!selectedTechnique && (
        <div style={{
          padding: '1rem',
          background: 'var(--ifm-color-emphasis-100)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'var(--ifm-color-emphasis-600)',
        }}>
          👆 Кликните на технику для просмотра деталей
        </div>
      )}
      
      <div className={styles.hint}>
        💡 MITRE ATT&CK — база знаний о тактиках и техниках атакующих
      </div>
    </div>
  );
}
