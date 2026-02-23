import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

interface FirewallRule {
  id: number;
  chain: 'INPUT' | 'OUTPUT' | 'FORWARD';
  action: 'ACCEPT' | 'DROP' | 'REJECT';
  protocol: 'tcp' | 'udp' | 'icmp' | 'all';
  srcIp: string;
  dstIp: string;
  srcPort: string;
  dstPort: string;
  comment: string;
}

interface Packet {
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: 'tcp' | 'udp' | 'icmp';
}

const PRESET_RULES: FirewallRule[] = [
  { id: 1, chain: 'INPUT', action: 'ACCEPT', protocol: 'tcp', srcIp: 'any', dstIp: 'any', srcPort: 'any', dstPort: '22', comment: 'SSH' },
  { id: 2, chain: 'INPUT', action: 'ACCEPT', protocol: 'tcp', srcIp: 'any', dstIp: 'any', srcPort: 'any', dstPort: '80', comment: 'HTTP' },
  { id: 3, chain: 'INPUT', action: 'ACCEPT', protocol: 'tcp', srcIp: 'any', dstIp: 'any', srcPort: 'any', dstPort: '443', comment: 'HTTPS' },
  { id: 4, chain: 'INPUT', action: 'DROP', protocol: 'all', srcIp: 'any', dstIp: 'any', srcPort: 'any', dstPort: 'any', comment: 'Блокировать остальное' },
];

const COMMON_PORTS: Record<number, string> = {
  20: 'FTP Data',
  21: 'FTP Control',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS',
  445: 'SMB',
  3306: 'MySQL',
  3389: 'RDP',
  5432: 'PostgreSQL',
  6379: 'Redis',
  8080: 'HTTP Alt',
};

export default function FirewallSimulator(): JSX.Element {
  const [rules, setRules] = useState<FirewallRule[]>(PRESET_RULES);
  const [testPacket, setTestPacket] = useState<Packet>({
    srcIp: '192.168.1.100',
    dstIp: '10.0.0.1',
    srcPort: 54321,
    dstPort: 80,
    protocol: 'tcp'
  });
  const [testResult, setTestResult] = useState<{ matched: FirewallRule | null; action: string } | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  
  // Проверка соответствия пакета правилу
  const matchRule = (packet: Packet, rule: FirewallRule): boolean => {
    if (rule.protocol !== 'all' && rule.protocol !== packet.protocol) return false;
    if (rule.srcIp !== 'any' && rule.srcIp !== packet.srcIp) return false;
    if (rule.dstIp !== 'any' && rule.dstIp !== packet.dstIp) return false;
    if (rule.srcPort !== 'any' && parseInt(rule.srcPort) !== packet.srcPort) return false;
    if (rule.dstPort !== 'any' && parseInt(rule.dstPort) !== packet.dstPort) return false;
    return true;
  };
  
  // Тестирование пакета
  const testPacketAgainstRules = () => {
    for (const rule of rules.filter(r => r.chain === 'INPUT')) {
      if (matchRule(testPacket, rule)) {
        setTestResult({ matched: rule, action: rule.action });
        return;
      }
    }
    setTestResult({ matched: null, action: 'ACCEPT (default policy)' });
  };
  
  // Генерация iptables команд
  const generateIptables = () => {
    return rules.map(rule => {
      let cmd = `iptables -A ${rule.chain}`;
      if (rule.protocol !== 'all') cmd += ` -p ${rule.protocol}`;
      if (rule.srcIp !== 'any') cmd += ` -s ${rule.srcIp}`;
      if (rule.dstIp !== 'any') cmd += ` -d ${rule.dstIp}`;
      if (rule.srcPort !== 'any') cmd += ` --sport ${rule.srcPort}`;
      if (rule.dstPort !== 'any') cmd += ` --dport ${rule.dstPort}`;
      cmd += ` -j ${rule.action}`;
      if (rule.comment) cmd += ` -m comment --comment "${rule.comment}"`;
      return cmd;
    }).join('\n');
  };
  
  // Добавление правила
  const addRule = () => {
    const newRule: FirewallRule = {
      id: Date.now(),
      chain: 'INPUT',
      action: 'ACCEPT',
      protocol: 'tcp',
      srcIp: 'any',
      dstIp: 'any',
      srcPort: 'any',
      dstPort: '8080',
      comment: 'Новое правило'
    };
    setRules([...rules.slice(0, -1), newRule, rules[rules.length - 1]]);
  };
  
  // Удаление правила
  const removeRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };
  
  const actionColors = {
    ACCEPT: '#00d4aa',
    DROP: '#ef476f',
    REJECT: '#ff9f1c'
  };
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🛡️ Firewall Симулятор</h4>
      </div>
      
      {/* Правила */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <label style={{ fontWeight: 600 }}>Правила фильтрации (INPUT):</label>
          <button
            onClick={addRule}
            style={{
              padding: '0.4rem 1rem',
              background: 'var(--ifm-color-primary)',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            + Добавить
          </button>
        </div>
        
        <div style={{ 
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 70px 60px 100px 100px 70px 70px 1fr 40px',
            gap: '0.5rem',
            padding: '0.5rem',
            background: 'var(--ifm-color-emphasis-200)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <div>Chain</div>
            <div>Action</div>
            <div>Proto</div>
            <div>Src IP</div>
            <div>Dst IP</div>
            <div>Src Port</div>
            <div>Dst Port</div>
            <div>Comment</div>
            <div></div>
          </div>
          
          {/* Rules */}
          {rules.map((rule, idx) => (
            <div key={rule.id} style={{
              display: 'grid',
              gridTemplateColumns: '80px 70px 60px 100px 100px 70px 70px 1fr 40px',
              gap: '0.5rem',
              padding: '0.5rem',
              background: idx % 2 ? 'var(--ifm-color-emphasis-100)' : 'transparent',
              fontSize: '0.8rem',
              alignItems: 'center'
            }}>
              <div>{rule.chain}</div>
              <div style={{ 
                color: actionColors[rule.action],
                fontWeight: 600
              }}>
                {rule.action}
              </div>
              <div>{rule.protocol}</div>
              <div style={{ fontFamily: 'monospace' }}>{rule.srcIp}</div>
              <div style={{ fontFamily: 'monospace' }}>{rule.dstIp}</div>
              <div>{rule.srcPort}</div>
              <div>{rule.dstPort}</div>
              <div style={{ color: 'var(--ifm-color-emphasis-600)' }}>{rule.comment}</div>
              <button
                onClick={() => removeRule(rule.id)}
                style={{
                  padding: '0.2rem 0.5rem',
                  background: '#ef476f',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Тестовый пакет */}
      <div style={{ 
        background: 'var(--ifm-color-emphasis-100)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
          🧪 Тестовый пакет:
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem'
        }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>Src IP:</label>
            <input
              type="text"
              value={testPacket.srcIp}
              onChange={(e) => setTestPacket({...testPacket, srcIp: e.target.value})}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ifm-color-emphasis-300)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>Dst IP:</label>
            <input
              type="text"
              value={testPacket.dstIp}
              onChange={(e) => setTestPacket({...testPacket, dstIp: e.target.value})}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ifm-color-emphasis-300)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>Src Port:</label>
            <input
              type="number"
              value={testPacket.srcPort}
              onChange={(e) => setTestPacket({...testPacket, srcPort: parseInt(e.target.value) || 0})}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ifm-color-emphasis-300)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>Dst Port:</label>
            <input
              type="number"
              value={testPacket.dstPort}
              onChange={(e) => setTestPacket({...testPacket, dstPort: parseInt(e.target.value) || 0})}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ifm-color-emphasis-300)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>Protocol:</label>
            <select
              value={testPacket.protocol}
              onChange={(e) => setTestPacket({...testPacket, protocol: e.target.value as any})}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ifm-color-emphasis-300)' }}
            >
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="icmp">ICMP</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
          <button
            onClick={testPacketAgainstRules}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'linear-gradient(135deg, #00b4d8 0%, #00d4aa 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ▶ Проверить пакет
          </button>
          
          {testPacket.dstPort && COMMON_PORTS[testPacket.dstPort] && (
            <span style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Порт {testPacket.dstPort} = {COMMON_PORTS[testPacket.dstPort]}
            </span>
          )}
        </div>
        
        {/* Результат */}
        {testResult && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: testResult.action === 'ACCEPT' || testResult.action.includes('ACCEPT') 
              ? 'rgba(0, 212, 170, 0.15)' 
              : 'rgba(239, 71, 111, 0.15)',
            borderRadius: '8px',
            borderLeft: `4px solid ${testResult.action === 'ACCEPT' || testResult.action.includes('ACCEPT') ? '#00d4aa' : '#ef476f'}`
          }}>
            <strong>Результат:</strong> {testResult.action}
            {testResult.matched && (
              <span style={{ marginLeft: '1rem', color: 'var(--ifm-color-emphasis-600)' }}>
                (правило: {testResult.matched.comment})
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* iptables команды */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowCommands(!showCommands)}
      >
        {showCommands ? '▼ Скрыть команды iptables' : '▶ Показать команды iptables'}
      </button>
      
      {showCommands && (
        <pre style={{
          marginTop: '1rem',
          background: '#1a1a2e',
          color: '#00d4aa',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          overflowX: 'auto'
        }}>
          # Очистка правил{'\n'}
          iptables -F{'\n\n'}
          # Политика по умолчанию{'\n'}
          iptables -P INPUT DROP{'\n'}
          iptables -P FORWARD DROP{'\n'}
          iptables -P OUTPUT ACCEPT{'\n\n'}
          # Разрешить established/related{'\n'}
          iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT{'\n\n'}
          # Правила:{'\n'}
          {generateIptables()}
        </pre>
      )}
      
      <div className={styles.hint}>
        💡 Правила проверяются сверху вниз. Первое совпавшее правило применяется.
      </div>
    </div>
  );
}
