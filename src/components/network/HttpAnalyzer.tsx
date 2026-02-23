import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<string, string> = {
  GET: '#00d4aa',
  POST: '#f72585',
  PUT: '#ff9f1c',
  DELETE: '#ef476f',
  PATCH: '#9b5de5',
  HEAD: '#00b4d8',
  OPTIONS: '#6c757d',
};

const STATUS_CODES: Record<number, { text: string; color: string; category: string }> = {
  200: { text: 'OK', color: '#00d4aa', category: '2xx Success' },
  201: { text: 'Created', color: '#00d4aa', category: '2xx Success' },
  204: { text: 'No Content', color: '#00d4aa', category: '2xx Success' },
  301: { text: 'Moved Permanently', color: '#00b4d8', category: '3xx Redirect' },
  302: { text: 'Found', color: '#00b4d8', category: '3xx Redirect' },
  304: { text: 'Not Modified', color: '#00b4d8', category: '3xx Redirect' },
  400: { text: 'Bad Request', color: '#ff9f1c', category: '4xx Client Error' },
  401: { text: 'Unauthorized', color: '#ff9f1c', category: '4xx Client Error' },
  403: { text: 'Forbidden', color: '#ff9f1c', category: '4xx Client Error' },
  404: { text: 'Not Found', color: '#ff9f1c', category: '4xx Client Error' },
  405: { text: 'Method Not Allowed', color: '#ff9f1c', category: '4xx Client Error' },
  429: { text: 'Too Many Requests', color: '#ff9f1c', category: '4xx Client Error' },
  500: { text: 'Internal Server Error', color: '#ef476f', category: '5xx Server Error' },
  502: { text: 'Bad Gateway', color: '#ef476f', category: '5xx Server Error' },
  503: { text: 'Service Unavailable', color: '#ef476f', category: '5xx Server Error' },
  504: { text: 'Gateway Timeout', color: '#ef476f', category: '5xx Server Error' },
};

const COMMON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer <token>',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Cache-Control': 'no-cache',
  'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
};

export default function HttpAnalyzer(): JSX.Element {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.example.com/users/123');
  const [headers, setHeaders] = useState('Content-Type: application/json\nAccept: application/json');
  const [body, setBody] = useState('{\n  "name": "John",\n  "email": "john@example.com"\n}');
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'codes'>('request');
  
  // Парсинг URL
  const parseUrl = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return {
        protocol: parsed.protocol.replace(':', ''),
        host: parsed.host,
        path: parsed.pathname,
        query: parsed.search,
        params: Object.fromEntries(parsed.searchParams),
      };
    } catch {
      return null;
    }
  };
  
  const parsedUrl = parseUrl(url);
  
  // Генерация HTTP запроса
  const generateRequest = () => {
    if (!parsedUrl) return 'Некорректный URL';
    
    let request = `${method} ${parsedUrl.path}${parsedUrl.query} HTTP/1.1\n`;
    request += `Host: ${parsedUrl.host}\n`;
    request += headers.split('\n').filter(h => h.trim()).join('\n');
    
    if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
      request += `\nContent-Length: ${new TextEncoder().encode(body).length}\n`;
      request += `\n${body}`;
    }
    
    return request;
  };
  
  // Генерация примера ответа
  const generateResponse = () => {
    const status = method === 'POST' ? 201 : method === 'DELETE' ? 204 : 200;
    const statusInfo = STATUS_CODES[status];
    
    let response = `HTTP/1.1 ${status} ${statusInfo.text}\n`;
    response += `Date: ${new Date().toUTCString()}\n`;
    response += `Server: nginx/1.18.0\n`;
    response += `Content-Type: application/json\n`;
    response += `X-Request-Id: ${Math.random().toString(36).substr(2, 9)}\n`;
    
    if (status !== 204) {
      const bodyContent = method === 'POST' 
        ? '{\n  "id": 124,\n  "name": "John",\n  "created_at": "2024-01-15T10:30:00Z"\n}'
        : '{\n  "id": 123,\n  "name": "John",\n  "email": "john@example.com"\n}';
      response += `Content-Length: ${bodyContent.length}\n\n`;
      response += bodyContent;
    }
    
    return response;
  };
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🌐 HTTP Анализатор</h4>
      </div>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        borderBottom: '2px solid var(--ifm-color-emphasis-200)',
        paddingBottom: '0.5rem'
      }}>
        {[
          { id: 'request', label: '📤 Запрос' },
          { id: 'response', label: '📥 Ответ' },
          { id: 'codes', label: '📊 Коды' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: activeTab === tab.id ? 'var(--ifm-color-primary)' : 'transparent',
              color: activeTab === tab.id ? '#000' : 'var(--ifm-font-color-base)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'request' && (
        <>
          {/* Method & URL */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: METHOD_COLORS[method],
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              {HTTP_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid var(--ifm-color-emphasis-300)',
                background: 'var(--ifm-background-color)',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
              placeholder="https://api.example.com/endpoint"
            />
          </div>
          
          {/* Parsed URL */}
          {parsedUrl && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--ifm-color-emphasis-100)',
              borderRadius: '8px',
              fontSize: '0.8rem'
            }}>
              <div><strong>Protocol:</strong> {parsedUrl.protocol}</div>
              <div><strong>Host:</strong> {parsedUrl.host}</div>
              <div><strong>Path:</strong> {parsedUrl.path}</div>
              {parsedUrl.query && <div><strong>Query:</strong> {parsedUrl.query}</div>}
            </div>
          )}
          
          {/* Headers */}
          <div className={styles.inputGroup}>
            <label>Заголовки:</label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={3}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              placeholder="Content-Type: application/json"
            />
          </div>
          
          {/* Body */}
          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div className={styles.inputGroup}>
              <label>Тело запроса (Body):</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>
          )}
          
          {/* Generated Request */}
          <div className={styles.outputGroup}>
            <label>Сформированный HTTP запрос:</label>
            <pre style={{
              background: '#1a1a2e',
              color: '#00d4aa',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              overflowX: 'auto',
              margin: 0
            }}>
              {generateRequest()}
            </pre>
          </div>
        </>
      )}
      
      {activeTab === 'response' && (
        <div className={styles.outputGroup}>
          <label>Пример HTTP ответа:</label>
          <pre style={{
            background: '#1a1a2e',
            color: '#e0e0e0',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            overflowX: 'auto',
            margin: 0
          }}>
            {generateResponse().split('\n').map((line, i) => {
              if (line.startsWith('HTTP')) {
                const status = parseInt(line.split(' ')[1]);
                const color = STATUS_CODES[status]?.color || '#fff';
                return <div key={i} style={{ color }}>{line}</div>;
              }
              if (line.includes(':') && !line.startsWith('{') && !line.startsWith('"')) {
                const [key, ...val] = line.split(':');
                return <div key={i}><span style={{ color: '#00b4d8' }}>{key}:</span>{val.join(':')}</div>;
              }
              return <div key={i}>{line}</div>;
            })}
          </pre>
        </div>
      )}
      
      {activeTab === 'codes' && (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {Object.entries(STATUS_CODES).map(([code, info]) => (
            <div key={code} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              background: `${info.color}15`,
              borderLeft: `4px solid ${info.color}`,
              borderRadius: '0 8px 8px 0',
              gap: '1rem'
            }}>
              <span style={{ 
                fontWeight: 700, 
                color: info.color,
                minWidth: '40px'
              }}>
                {code}
              </span>
              <span style={{ flex: 1 }}>{info.text}</span>
              <span style={{ 
                fontSize: '0.75rem',
                color: 'var(--ifm-color-emphasis-600)'
              }}>
                {info.category}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.hint}>
        💡 HTTP/1.1 — текстовый протокол. HTTP/2 и HTTP/3 используют бинарный формат.
      </div>
    </div>
  );
}
