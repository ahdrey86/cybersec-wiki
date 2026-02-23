import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

const OSI_LAYERS = [
  {
    num: 7,
    name: 'Прикладной',
    nameEn: 'Application',
    pdu: 'Данные',
    protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'SSH', 'Telnet', 'SNMP'],
    equipment: '—',
    color: '#e74c3c',
    description: 'Интерфейс между сетью и пользовательскими приложениями',
    example: 'Браузер запрашивает веб-страницу'
  },
  {
    num: 6,
    name: 'Представления',
    nameEn: 'Presentation',
    pdu: 'Данные',
    protocols: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII', 'EBCDIC'],
    equipment: '—',
    color: '#e67e22',
    description: 'Преобразование форматов данных, шифрование, сжатие',
    example: 'Шифрование HTTPS, кодирование изображений'
  },
  {
    num: 5,
    name: 'Сеансовый',
    nameEn: 'Session',
    pdu: 'Данные',
    protocols: ['NetBIOS', 'RPC', 'PPTP', 'SAP'],
    equipment: '—',
    color: '#f1c40f',
    description: 'Управление сеансами связи между приложениями',
    example: 'Установка и поддержание соединения'
  },
  {
    num: 4,
    name: 'Транспортный',
    nameEn: 'Transport',
    pdu: 'Сегмент / Датаграмма',
    protocols: ['TCP', 'UDP', 'SCTP', 'DCCP'],
    equipment: '—',
    color: '#2ecc71',
    description: 'Надёжная доставка данных, управление потоком',
    example: 'TCP гарантирует доставку, UDP — нет'
  },
  {
    num: 3,
    name: 'Сетевой',
    nameEn: 'Network',
    pdu: 'Пакет',
    protocols: ['IP', 'ICMP', 'ARP', 'OSPF', 'BGP', 'RIP'],
    equipment: 'Маршрутизатор',
    color: '#3498db',
    description: 'Логическая адресация и маршрутизация',
    example: 'IP-адрес 192.168.1.1'
  },
  {
    num: 2,
    name: 'Канальный',
    nameEn: 'Data Link',
    pdu: 'Кадр',
    protocols: ['Ethernet', 'Wi-Fi (802.11)', 'PPP', 'HDLC'],
    equipment: 'Коммутатор, Мост',
    color: '#9b59b6',
    description: 'Физическая адресация (MAC), контроль ошибок',
    example: 'MAC-адрес 00:1A:2B:3C:4D:5E'
  },
  {
    num: 1,
    name: 'Физический',
    nameEn: 'Physical',
    pdu: 'Биты',
    protocols: ['Ethernet (физ.)', 'USB', 'Bluetooth', 'DSL'],
    equipment: 'Хаб, Кабели, Разъёмы',
    color: '#1abc9c',
    description: 'Передача битов по физической среде',
    example: 'Витая пара Cat6, оптоволокно'
  }
];

export default function OsiVisualizer(): JSX.Element {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [showEncapsulation, setShowEncapsulation] = useState(false);
  
  const selected = selectedLayer !== null ? OSI_LAYERS.find(l => l.num === selectedLayer) : null;
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>📚 Модель OSI — Интерактивная визуализация</h4>
      </div>
      
      <div className={styles.modeToggle} style={{ marginBottom: '1rem' }}>
        <button
          className={`${styles.modeBtn} ${!showEncapsulation ? styles.active : ''}`}
          onClick={() => setShowEncapsulation(false)}
        >
          Уровни
        </button>
        <button
          className={`${styles.modeBtn} ${showEncapsulation ? styles.active : ''}`}
          onClick={() => setShowEncapsulation(true)}
        >
          Инкапсуляция
        </button>
      </div>
      
      {!showEncapsulation ? (
        <div className={styles.osiStack}>
          {OSI_LAYERS.map(layer => (
            <div
              key={layer.num}
              className={`${styles.osiLayer} ${selectedLayer === layer.num ? styles.osiLayerActive : ''}`}
              style={{ '--layer-color': layer.color } as any}
              onClick={() => setSelectedLayer(selectedLayer === layer.num ? null : layer.num)}
            >
              <div className={styles.osiLayerNum}>{layer.num}</div>
              <div className={styles.osiLayerName}>
                <strong>{layer.name}</strong>
                <span>{layer.nameEn}</span>
              </div>
              <div className={styles.osiLayerPdu}>{layer.pdu}</div>
              <div className={styles.osiLayerProtocols}>
                {layer.protocols.slice(0, 3).join(', ')}
                {layer.protocols.length > 3 && '...'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.encapsulation}>
          <div className={styles.encapTitle}>Инкапсуляция данных</div>
          <div className={styles.encapLayers}>
            <div className={styles.encapLayer} style={{ background: '#e74c3c' }}>
              <span>Данные приложения</span>
            </div>
            <div className={styles.encapLayer} style={{ background: '#2ecc71' }}>
              <span className={styles.encapHeader}>TCP/UDP</span>
              <span>Данные</span>
              <span className={styles.encapLabel}>→ Сегмент</span>
            </div>
            <div className={styles.encapLayer} style={{ background: '#3498db' }}>
              <span className={styles.encapHeader}>IP</span>
              <span>TCP</span>
              <span>Данные</span>
              <span className={styles.encapLabel}>→ Пакет</span>
            </div>
            <div className={styles.encapLayer} style={{ background: '#9b59b6' }}>
              <span className={styles.encapHeader}>Ethernet</span>
              <span>IP</span>
              <span>TCP</span>
              <span>Данные</span>
              <span className={styles.encapTrailer}>CRC</span>
              <span className={styles.encapLabel}>→ Кадр</span>
            </div>
            <div className={styles.encapLayer} style={{ background: '#1abc9c' }}>
              <span>0110110101...</span>
              <span className={styles.encapLabel}>→ Биты</span>
            </div>
          </div>
        </div>
      )}
      
      {selected && !showEncapsulation && (
        <div className={styles.osiDetails} style={{ borderColor: selected.color }}>
          <h5 style={{ color: selected.color }}>
            Уровень {selected.num}: {selected.name} ({selected.nameEn})
          </h5>
          <p>{selected.description}</p>
          <div className={styles.osiDetailGrid}>
            <div>
              <strong>PDU:</strong> {selected.pdu}
            </div>
            <div>
              <strong>Оборудование:</strong> {selected.equipment}
            </div>
          </div>
          <div>
            <strong>Протоколы:</strong> {selected.protocols.join(', ')}
          </div>
          <div className={styles.osiExample}>
            <strong>Пример:</strong> {selected.example}
          </div>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Кликните на уровень для подробностей. Мнемоника: «Пожалуйста Перестаньте Слать Такие Сырые Колбасы Филиппу»
      </div>
    </div>
  );
}
