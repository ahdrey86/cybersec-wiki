import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

interface SigmaRule {
  title: string;
  status: string;
  description: string;
  author: string;
  logsource: {
    category?: string;
    product?: string;
    service?: string;
  };
  detection: {
    selection: Record<string, string | string[]>;
    condition: string;
  };
  level: string;
  tags: string[];
}

const LOGSOURCE_PRESETS = [
  { name: 'Windows Security', category: 'process_creation', product: 'windows', service: 'security' },
  { name: 'Windows Sysmon', category: 'process_creation', product: 'windows', service: 'sysmon' },
  { name: 'Linux Syslog', category: 'process_creation', product: 'linux', service: 'syslog' },
  { name: 'Web Server', category: 'webserver', product: undefined, service: undefined },
  { name: 'Firewall', category: 'firewall', product: undefined, service: undefined },
  { name: 'DNS', category: 'dns', product: undefined, service: undefined },
  { name: 'Proxy', category: 'proxy', product: undefined, service: undefined },
];

const DETECTION_TEMPLATES = [
  {
    name: 'Suspicious Process',
    selection: { 'Image|endswith': '\\powershell.exe', 'CommandLine|contains': '-enc' },
    condition: 'selection',
  },
  {
    name: 'Failed Login',
    selection: { 'EventID': '4625', 'TargetUserName|not': 'SYSTEM' },
    condition: 'selection',
  },
  {
    name: 'Malicious IP',
    selection: { 'DestinationIp': ['10.10.10.10', '192.168.100.100'] },
    condition: 'selection',
  },
  {
    name: 'Web Shell Access',
    selection: { 'cs-uri-stem|contains': ['.php', '.asp', '.jsp'], 'cs-uri-stem|contains|all': ['cmd', 'shell'] },
    condition: 'selection',
  },
];

const MITRE_TAGS = [
  'attack.execution', 'attack.persistence', 'attack.privilege_escalation',
  'attack.defense_evasion', 'attack.credential_access', 'attack.discovery',
  'attack.lateral_movement', 'attack.collection', 'attack.command_and_control',
  'attack.exfiltration', 'attack.impact',
];

export default function SigmaBuilder(): JSX.Element {
  const [rule, setRule] = useState<SigmaRule>({
    title: 'Suspicious PowerShell Execution',
    status: 'experimental',
    description: 'Detects suspicious PowerShell command execution',
    author: 'Security Analyst',
    logsource: {
      category: 'process_creation',
      product: 'windows',
      service: 'sysmon',
    },
    detection: {
      selection: {
        'Image|endswith': '\\\\powershell.exe',
        'CommandLine|contains': '-enc',
      },
      condition: 'selection',
    },
    level: 'high',
    tags: ['attack.execution', 'attack.t1059.001'],
  });
  
  const [newField, setNewField] = useState({ key: '', value: '' });
  const [newTag, setNewTag] = useState('');
  
  const generateYaml = (): string => {
    let yaml = `title: ${rule.title}\n`;
    yaml += `status: ${rule.status}\n`;
    yaml += `description: ${rule.description}\n`;
    yaml += `author: ${rule.author}\n`;
    yaml += `logsource:\n`;
    if (rule.logsource.category) yaml += `    category: ${rule.logsource.category}\n`;
    if (rule.logsource.product) yaml += `    product: ${rule.logsource.product}\n`;
    if (rule.logsource.service) yaml += `    service: ${rule.logsource.service}\n`;
    yaml += `detection:\n`;
    yaml += `    selection:\n`;
    Object.entries(rule.detection.selection).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        yaml += `        ${key}:\n`;
        value.forEach(v => yaml += `            - '${v}'\n`);
      } else {
        yaml += `        ${key}: '${value}'\n`;
      }
    });
    yaml += `    condition: ${rule.detection.condition}\n`;
    yaml += `level: ${rule.level}\n`;
    if (rule.tags.length > 0) {
      yaml += `tags:\n`;
      rule.tags.forEach(tag => yaml += `    - ${tag}\n`);
    }
    return yaml;
  };
  
  const addDetectionField = () => {
    if (newField.key && newField.value) {
      setRule(prev => ({
        ...prev,
        detection: {
          ...prev.detection,
          selection: {
            ...prev.detection.selection,
            [newField.key]: newField.value.includes(',') 
              ? newField.value.split(',').map(v => v.trim())
              : newField.value,
          },
        },
      }));
      setNewField({ key: '', value: '' });
    }
  };
  
  const removeDetectionField = (key: string) => {
    setRule(prev => {
      const newSelection = { ...prev.detection.selection };
      delete newSelection[key];
      return {
        ...prev,
        detection: { ...prev.detection, selection: newSelection },
      };
    });
  };
  
  const addTag = (tag: string) => {
    if (tag && !rule.tags.includes(tag)) {
      setRule(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setNewTag('');
  };
  
  const removeTag = (tag: string) => {
    setRule(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };
  
  const applyTemplate = (template: typeof DETECTION_TEMPLATES[0]) => {
    setRule(prev => ({
      ...prev,
      detection: {
        selection: template.selection as Record<string, string | string[]>,
        condition: template.condition,
      },
    }));
  };
  
  const applyLogsource = (preset: typeof LOGSOURCE_PRESETS[0]) => {
    setRule(prev => ({
      ...prev,
      logsource: {
        category: preset.category,
        product: preset.product,
        service: preset.service,
      },
    }));
  };
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>📜 Конструктор SIGMA правил</h4>
      </div>
      
      {/* Основные поля */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Название правила:</label>
          <input
            type="text"
            value={rule.title}
            onChange={(e) => setRule(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Автор:</label>
          <input
            type="text"
            value={rule.author}
            onChange={(e) => setRule(prev => ({ ...prev, author: e.target.value }))}
          />
        </div>
      </div>
      
      <div className={styles.inputGroup}>
        <label>Описание:</label>
        <input
          type="text"
          value={rule.description}
          onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Статус:</label>
          <select
            value={rule.status}
            onChange={(e) => setRule(prev => ({ ...prev, status: e.target.value }))}
            style={{ padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--ifm-color-emphasis-300)', width: '100%' }}
          >
            <option value="experimental">experimental</option>
            <option value="test">test</option>
            <option value="stable">stable</option>
          </select>
        </div>
        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
          <label>Уровень:</label>
          <select
            value={rule.level}
            onChange={(e) => setRule(prev => ({ ...prev, level: e.target.value }))}
            style={{ padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--ifm-color-emphasis-300)', width: '100%' }}
          >
            <option value="informational">informational</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </div>
      </div>
      
      {/* Logsource */}
      <div style={{ 
        padding: '1rem', 
        background: 'var(--ifm-color-emphasis-100)', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>📁 Log Source</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {LOGSOURCE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyLogsource(preset)}
              style={{
                padding: '0.3rem 0.6rem',
                background: 'var(--ifm-color-emphasis-200)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          <input
            placeholder="category"
            value={rule.logsource.category || ''}
            onChange={(e) => setRule(prev => ({ ...prev, logsource: { ...prev.logsource, category: e.target.value } }))}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)' }}
          />
          <input
            placeholder="product"
            value={rule.logsource.product || ''}
            onChange={(e) => setRule(prev => ({ ...prev, logsource: { ...prev.logsource, product: e.target.value } }))}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)' }}
          />
          <input
            placeholder="service"
            value={rule.logsource.service || ''}
            onChange={(e) => setRule(prev => ({ ...prev, logsource: { ...prev.logsource, service: e.target.value } }))}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)' }}
          />
        </div>
      </div>
      
      {/* Detection */}
      <div style={{ 
        padding: '1rem', 
        background: 'var(--ifm-color-emphasis-100)', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>🔍 Detection</div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {DETECTION_TEMPLATES.map((template, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(template)}
              style={{
                padding: '0.3rem 0.6rem',
                background: 'var(--ifm-color-emphasis-200)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {template.name}
            </button>
          ))}
        </div>
        
        {/* Current fields */}
        <div style={{ marginBottom: '0.75rem' }}>
          {Object.entries(rule.detection.selection).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                background: 'var(--ifm-color-emphasis-200)',
                borderRadius: '6px',
                marginBottom: '0.25rem',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: '#00d4aa' }}>{key}:</span>
              <span>{Array.isArray(value) ? value.join(', ') : value}</span>
              <button
                onClick={() => removeDetectionField(key)}
                style={{
                  marginLeft: 'auto',
                  background: 'rgba(239, 71, 111, 0.2)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  cursor: 'pointer',
                  color: '#ef476f',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        {/* Add new field */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            placeholder="Field (e.g., CommandLine|contains)"
            value={newField.key}
            onChange={(e) => setNewField(prev => ({ ...prev, key: e.target.value }))}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)' }}
          />
          <input
            placeholder="Value (comma for list)"
            value={newField.value}
            onChange={(e) => setNewField(prev => ({ ...prev, value: e.target.value }))}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)' }}
          />
          <button
            onClick={addDetectionField}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--ifm-color-primary)',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Tags */}
      <div style={{ 
        padding: '1rem', 
        background: 'var(--ifm-color-emphasis-100)', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>🏷️ MITRE ATT&CK Tags</div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {rule.tags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                padding: '0.25rem 0.5rem',
                background: 'rgba(155, 93, 229, 0.2)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef476f', padding: 0 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {MITRE_TAGS.filter(t => !rule.tags.includes(t)).slice(0, 6).map((tag, idx) => (
            <button
              key={idx}
              onClick={() => addTag(tag)}
              style={{
                padding: '0.25rem 0.5rem',
                background: 'var(--ifm-color-emphasis-200)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* Generated YAML */}
      <div className={styles.outputGroup}>
        <label>Сгенерированное SIGMA правило:</label>
        <pre style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.85rem',
          maxHeight: '300px',
        }}>
          {generateYaml()}
        </pre>
      </div>
      
      <button
        onClick={() => navigator.clipboard.writeText(generateYaml())}
        style={{
          padding: '0.75rem 2rem',
          background: 'var(--ifm-color-primary)',
          border: 'none',
          borderRadius: '8px',
          color: '#000',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        📋 Копировать YAML
      </button>
      
      <div className={styles.hint}>
        💡 SIGMA — универсальный формат правил детекции для SIEM систем
      </div>
    </div>
  );
}
