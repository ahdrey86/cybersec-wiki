import React, { useState } from 'react';
import styles from '../ciphers/CipherStyles.module.css';

type Base = 2 | 8 | 10 | 16;

const BASE_NAMES: Record<Base, string> = {
  2: 'Двоичная (BIN)',
  8: 'Восьмеричная (OCT)',
  10: 'Десятичная (DEC)',
  16: 'Шестнадцатеричная (HEX)'
};

const BASE_PREFIXES: Record<Base, string> = {
  2: '0b',
  8: '0o',
  10: '',
  16: '0x'
};

const BASE_REGEX: Record<Base, RegExp> = {
  2: /^[01]*$/,
  8: /^[0-7]*$/,
  10: /^[0-9]*$/,
  16: /^[0-9A-Fa-f]*$/
};

export default function NumberConverter(): JSX.Element {
  const [inputBase, setInputBase] = useState<Base>(10);
  const [inputValue, setInputValue] = useState('255');
  const [showBitOperations, setShowBitOperations] = useState(false);
  
  // Валидация и конвертация
  const isValid = inputValue === '' || BASE_REGEX[inputBase].test(inputValue);
  const decimalValue = isValid && inputValue ? parseInt(inputValue, inputBase) : 0;
  const isOverflow = decimalValue > Number.MAX_SAFE_INTEGER;
  
  // Конвертация в другие системы
  const convert = (base: Base): string => {
    if (!isValid || inputValue === '' || isOverflow) return '—';
    return decimalValue.toString(base).toUpperCase();
  };
  
  // Форматирование двоичного числа
  const formatBinary = (bin: string): string => {
    const padded = bin.padStart(Math.ceil(bin.length / 8) * 8, '0');
    return padded.match(/.{1,8}/g)?.join(' ') || bin;
  };
  
  // Побитовые операции
  const [secondOperand, setSecondOperand] = useState('15');
  const secondDec = parseInt(secondOperand, 10) || 0;
  
  const handleInputChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^0-9A-F]/gi, '');
    if (BASE_REGEX[inputBase].test(cleaned) || cleaned === '') {
      setInputValue(cleaned);
    }
  };
  
  return (
    <div className={styles.cipherContainer}>
      <div className={styles.cipherHeader}>
        <h4>🔢 Конвертер систем счисления</h4>
      </div>
      
      {/* Выбор входной системы */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {([2, 8, 10, 16] as Base[]).map(base => (
          <button
            key={base}
            onClick={() => {
              // Конвертируем текущее значение в новую систему
              if (isValid && inputValue) {
                setInputValue(decimalValue.toString(base).toUpperCase());
              }
              setInputBase(base);
            }}
            style={{
              padding: '0.5rem 1rem',
              background: inputBase === base ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
              color: inputBase === base ? '#000' : 'var(--ifm-font-color-base)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            {BASE_NAMES[base]}
          </button>
        ))}
      </div>
      
      {/* Ввод числа */}
      <div className={styles.inputGroup}>
        <label>Введите число ({BASE_NAMES[inputBase]}):</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ 
            fontFamily: 'monospace',
            color: 'var(--ifm-color-emphasis-600)',
            fontSize: '1.1rem'
          }}>
            {BASE_PREFIXES[inputBase]}
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              letterSpacing: inputBase === 2 ? '0.2em' : '0.1em',
              borderColor: isValid ? undefined : '#ef476f'
            }}
            placeholder={inputBase === 16 ? 'FF' : inputBase === 2 ? '11111111' : '255'}
          />
        </div>
        {!isValid && (
          <div style={{ color: '#ef476f', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Недопустимые символы для {BASE_NAMES[inputBase]}
          </div>
        )}
      </div>
      
      {/* Результаты конвертации */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {([2, 8, 10, 16] as Base[]).map(base => (
          <div
            key={base}
            style={{
              padding: '1rem',
              background: inputBase === base ? 'rgba(0, 212, 170, 0.15)' : 'var(--ifm-color-emphasis-100)',
              borderRadius: '8px',
              border: inputBase === base ? '2px solid var(--ifm-color-primary)' : '2px solid transparent'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.25rem' }}>
              {BASE_NAMES[base]}
            </div>
            <div style={{ 
              fontFamily: 'monospace',
              fontSize: base === 2 ? '0.9rem' : '1.1rem',
              fontWeight: 600,
              wordBreak: 'break-all'
            }}>
              <span style={{ color: 'var(--ifm-color-emphasis-500)' }}>{BASE_PREFIXES[base]}</span>
              {base === 2 ? formatBinary(convert(base)) : convert(base)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Байтовое представление */}
      {isValid && inputValue && decimalValue <= 255 && (
        <div style={{
          padding: '1rem',
          background: 'var(--ifm-color-emphasis-100)',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <strong>Побитовое представление (8 бит):</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
            {decimalValue.toString(2).padStart(8, '0').split('').map((bit, i) => (
              <div
                key={i}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: bit === '1' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
                  color: bit === '1' ? '#000' : 'var(--ifm-font-color-base)',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}
              >
                {bit}
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{Math.pow(2, 7 - i)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Побитовые операции */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setShowBitOperations(!showBitOperations)}
      >
        {showBitOperations ? '▼ Скрыть побитовые операции' : '▶ Показать побитовые операции'}
      </button>
      
      {showBitOperations && isValid && inputValue && (
        <div style={{ marginTop: '1rem' }}>
          <div className={styles.inputGroup}>
            <label>Второй операнд (DEC):</label>
            <input
              type="number"
              value={secondOperand}
              onChange={(e) => setSecondOperand(e.target.value)}
              style={{ width: '150px' }}
            />
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginTop: '1rem'
          }}>
            {[
              { op: 'AND', symbol: '&', result: decimalValue & secondDec },
              { op: 'OR', symbol: '|', result: decimalValue | secondDec },
              { op: 'XOR', symbol: '^', result: decimalValue ^ secondDec },
              { op: 'NOT', symbol: '~', result: (~decimalValue >>> 0) & 0xFF },
              { op: 'Сдвиг <<', symbol: '<<', result: (decimalValue << (secondDec % 32)) >>> 0 },
              { op: 'Сдвиг >>', symbol: '>>', result: decimalValue >> (secondDec % 32) },
            ].map(({ op, symbol, result }) => (
              <div
                key={op}
                style={{
                  padding: '0.75rem',
                  background: 'var(--ifm-color-emphasis-100)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>
                  {decimalValue} {symbol} {op === 'NOT' ? '' : secondDec}
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {op}: {result} <span style={{ color: 'var(--ifm-color-emphasis-500)' }}>(0x{result.toString(16).toUpperCase()})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.hint}>
        💡 Поддерживаются числа до 2⁵³ - 1 (Number.MAX_SAFE_INTEGER)
      </div>
    </div>
  );
}
