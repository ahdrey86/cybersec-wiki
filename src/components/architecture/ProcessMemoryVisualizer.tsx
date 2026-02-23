import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

interface MemorySegment {
  name: string;
  description: string;
  color: string;
  content: string[];
  grows?: 'up' | 'down';
  permissions: string;
}

const MEMORY_SEGMENTS: MemorySegment[] = [
  {
    name: 'Kernel Space',
    description: 'Память ядра ОС. Недоступна пользовательским процессам.',
    color: '#ef476f',
    content: ['Код ядра', 'Драйверы', 'Системные структуры'],
    permissions: '--- (недоступно)'
  },
  {
    name: 'Stack',
    description: 'Стек вызовов. Хранит локальные переменные, адреса возврата, аргументы функций.',
    color: '#f72585',
    content: ['Локальные переменные', 'Адреса возврата', 'Сохранённые регистры', 'Аргументы функций'],
    grows: 'down',
    permissions: 'rw- (чтение/запись)'
  },
  {
    name: 'Memory Mapped',
    description: 'Отображаемые файлы и разделяемая память.',
    color: '#9b5de5',
    content: ['Shared libraries (.so/.dll)', 'mmap() файлы', 'Разделяемая память'],
    permissions: 'r-x / rw-'
  },
  {
    name: 'Heap',
    description: 'Куча. Динамически выделяемая память (malloc, new).',
    color: '#00b4d8',
    content: ['malloc() / new', 'Динамические структуры', 'Объекты'],
    grows: 'up',
    permissions: 'rw- (чтение/запись)'
  },
  {
    name: 'BSS',
    description: 'Неинициализированные глобальные и статические переменные. Заполняется нулями.',
    color: '#00d4aa',
    content: ['static int x;', 'Глобальные без значения'],
    permissions: 'rw- (чтение/запись)'
  },
  {
    name: 'Data',
    description: 'Инициализированные глобальные и статические переменные.',
    color: '#90be6d',
    content: ['int global = 42;', 'static char* str = "hello";', 'Константы'],
    permissions: 'rw- (чтение/запись)'
  },
  {
    name: 'Text (Code)',
    description: 'Исполняемый код программы. Только для чтения.',
    color: '#ff9f1c',
    content: ['main()', 'Функции', 'Машинный код'],
    permissions: 'r-x (чтение/исполнение)'
  },
];

// Пример стека вызовов
const STACK_FRAMES = [
  { func: 'main()', vars: ['argc', 'argv', 'result'], address: '0x7FFF_FFFF_E000' },
  { func: 'calculate()', vars: ['a', 'b', 'temp'], address: '0x7FFF_FFFF_DF80' },
  { func: 'helper()', vars: ['x', 'ptr'], address: '0x7FFF_FFFF_DF00' },
];

export default function ProcessMemoryVisualizer(): JSX.Element {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'segments' | 'stack' | 'addresses'>('segments');
  
  const selected = MEMORY_SEGMENTS.find(s => s.name === selectedSegment);
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🗺️ Память процесса</h4>
      </div>
      
      {/* Режимы */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'segments', label: '📊 Сегменты' },
          { id: 'stack', label: '📚 Стек вызовов' },
          { id: 'addresses', label: '🔢 Адреса' },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id as any)}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === mode.id ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
              color: viewMode === mode.id ? '#000' : 'var(--ifm-font-color-base)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>
      
      {viewMode === 'segments' && (
        <>
          {/* Визуализация сегментов */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            marginBottom: '1rem'
          }}>
            {MEMORY_SEGMENTS.map((segment, idx) => (
              <div
                key={segment.name}
                onClick={() => setSelectedSegment(selectedSegment === segment.name ? null : segment.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: selectedSegment === segment.name ? `${segment.color}30` : `${segment.color}15`,
                  borderLeft: `4px solid ${segment.color}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: segment.color }}>{segment.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
                    {segment.permissions}
                  </div>
                </div>
                {segment.grows && (
                  <div style={{ 
                    fontSize: '1.5rem',
                    color: segment.color,
                    marginRight: '1rem'
                  }}>
                    {segment.grows === 'up' ? '↑' : '↓'}
                  </div>
                )}
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--ifm-color-emphasis-500)',
                  textAlign: 'right'
                }}>
                  {idx === 0 ? '0xFFFF...' : idx === MEMORY_SEGMENTS.length - 1 ? '0x0000...' : ''}
                </div>
              </div>
            ))}
          </div>
          
          {/* Детали выбранного сегмента */}
          {selected && (
            <div style={{
              padding: '1rem',
              background: `${selected.color}15`,
              borderRadius: '8px',
              border: `1px solid ${selected.color}50`
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: selected.color }}>{selected.name}</h4>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>{selected.description}</p>
              
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Содержимое:</strong>
                <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                  {selected.content.map((item, i) => (
                    <li key={i}><code>{item}</code></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
      
      {viewMode === 'stack' && (
        <div>
          <div style={{ 
            fontSize: '0.85rem', 
            color: 'var(--ifm-color-emphasis-600)',
            marginBottom: '1rem'
          }}>
            Пример стека при вызове: main() → calculate() → helper()
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {STACK_FRAMES.map((frame, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: idx === STACK_FRAMES.length - 1 
                    ? 'rgba(0, 212, 170, 0.2)' 
                    : 'var(--ifm-color-emphasis-100)',
                  borderRadius: '8px',
                  border: idx === STACK_FRAMES.length - 1 
                    ? '2px solid var(--ifm-color-primary)' 
                    : '1px solid var(--ifm-color-emphasis-200)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: idx === STACK_FRAMES.length - 1 ? 'var(--ifm-color-primary)' : 'inherit' }}>
                    {frame.func}
                    {idx === STACK_FRAMES.length - 1 && ' ← текущая'}
                  </strong>
                  <code style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
                    {frame.address}
                  </code>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {frame.vars.map((v, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'var(--ifm-color-emphasis-200)',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      {v}
                    </span>
                  ))}
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(247, 37, 133, 0.2)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}>
                    ret addr
                  </span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(255, 159, 28, 0.2)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}>
                    saved RBP
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(247, 37, 133, 0.1)',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            <strong>⚠️ Stack Overflow:</strong> Когда стек растёт слишком сильно (рекурсия, большие массивы),
            он может столкнуться с другими сегментами памяти.
          </div>
        </div>
      )}
      
      {viewMode === 'addresses' && (
        <div>
          <div style={{ 
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: '0.5rem'
            }}>
              <div style={{ fontWeight: 600, padding: '0.5rem', background: 'var(--ifm-color-emphasis-200)' }}>Диапазон</div>
              <div style={{ fontWeight: 600, padding: '0.5rem', background: 'var(--ifm-color-emphasis-200)' }}>Назначение</div>
              
              <div style={{ padding: '0.5rem', background: '#ef476f20' }}>0xFFFF_8000_0000_0000+</div>
              <div style={{ padding: '0.5rem', background: '#ef476f20' }}>Kernel Space (верхние адреса)</div>
              
              <div style={{ padding: '0.5rem', background: '#f7258520' }}>0x7FFF_FFFF_F000</div>
              <div style={{ padding: '0.5rem', background: '#f7258520' }}>Stack (начало, растёт вниз)</div>
              
              <div style={{ padding: '0.5rem', background: '#9b5de520' }}>0x7F00_0000_0000</div>
              <div style={{ padding: '0.5rem', background: '#9b5de520' }}>Shared libraries (mmap)</div>
              
              <div style={{ padding: '0.5rem', background: '#00b4d820' }}>0x0000_5555_5555_0000</div>
              <div style={{ padding: '0.5rem', background: '#00b4d820' }}>Heap (brk, растёт вверх)</div>
              
              <div style={{ padding: '0.5rem', background: '#90be6d20' }}>0x0000_5555_5555_4000</div>
              <div style={{ padding: '0.5rem', background: '#90be6d20' }}>BSS + Data</div>
              
              <div style={{ padding: '0.5rem', background: '#ff9f1c20' }}>0x0000_5555_5555_5000</div>
              <div style={{ padding: '0.5rem', background: '#ff9f1c20' }}>Text (код программы)</div>
              
              <div style={{ padding: '0.5rem', background: 'var(--ifm-color-emphasis-100)' }}>0x0000_0000_0000_0000</div>
              <div style={{ padding: '0.5rem', background: 'var(--ifm-color-emphasis-100)' }}>NULL (защищённая область)</div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'var(--ifm-color-emphasis-100)',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            <strong>📝 Примечания:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
              <li><strong>ASLR</strong> — рандомизация адресов для защиты от эксплойтов</li>
              <li><strong>PIE</strong> — позиционно-независимый код</li>
              <li><strong>NX bit</strong> — запрет исполнения в сегментах данных</li>
              <li><strong>Stack canary</strong> — защита от переполнения стека</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Адреса виртуальные. Каждый процесс имеет своё адресное пространство.
      </div>
    </div>
  );
}
