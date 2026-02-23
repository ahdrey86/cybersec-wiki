import React, { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }): JSX.Element {
  const [phase, setPhase] = useState(0);
  // Фазы: 0 - темнота, 1 - матрица появляется, 2 - щит появляется, 3 - текст, 4 - fade out

  useEffect(() => {
    const timings = [
      { delay: 500, nextPhase: 1 },   // Матрица
      { delay: 1500, nextPhase: 2 },  // Щит
      { delay: 2500, nextPhase: 3 },  // Текст
      { delay: 4500, nextPhase: 4 },  // Fade out
      { delay: 5500, nextPhase: 5 },  // Завершение
    ];

    const timeouts = timings.map(({ delay, nextPhase }) =>
      setTimeout(() => {
        if (nextPhase === 5) {
          onComplete();
        } else {
          setPhase(nextPhase);
        }
      }, delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      overflow: 'hidden',
      opacity: phase === 4 ? 0 : 1,
      transition: 'opacity 1s ease',
    }}>
      
      {/* Матрица на фоне */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: phase >= 1 ? 0.15 : 0,
        transition: 'opacity 1.5s ease',
        overflow: 'hidden',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.4',
        color: '#00ff88',
      }}>
        {/* Генерируем колонки матрицы */}
        {Array.from({ length: 40 }).map((_, colIndex) => (
          <div
            key={colIndex}
            style={{
              position: 'absolute',
              left: `${colIndex * 2.5}%`,
              top: 0,
              animation: `matrixRain ${3 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} style={{ opacity: 1 - i * 0.03 }}>
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Центральный контент */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
      }}>
        
        {/* Щит */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <svg
            width="200"
            height="240"
            viewBox="0 0 100 120"
            style={{
              filter: phase >= 2 ? 'drop-shadow(0 0 30px #00ff8866)' : 'none',
              transition: 'filter 1s ease',
            }}
          >
            {/* Щит - контур */}
            <path
              d="M50 8 L88 22 L88 58 C88 88 70 102 50 112 C30 102 12 88 12 58 L12 22 Z"
              fill="none"
              stroke="#00ff88"
              strokeWidth="2"
              style={{
                strokeDasharray: 300,
                strokeDashoffset: phase >= 2 ? 0 : 300,
                transition: 'stroke-dashoffset 1.5s ease',
              }}
            />
            
            {/* Щит - заливка */}
            <path
              d="M50 8 L88 22 L88 58 C88 88 70 102 50 112 C30 102 12 88 12 58 L12 22 Z"
              fill="#00ff88"
              style={{
                opacity: phase >= 2 ? 0.1 : 0,
                transition: 'opacity 1s ease 0.5s',
              }}
            />
            
            {/* Замок - корпус */}
            <rect
              x="32"
              y="52"
              width="36"
              height="28"
              rx="4"
              fill="#000"
              stroke="#00ff88"
              strokeWidth="2"
              style={{
                opacity: phase >= 2 ? 1 : 0,
                transition: 'opacity 0.8s ease 0.8s',
              }}
            />
            
            {/* Замок - дужка */}
            <path
              d="M38 52 L38 40 C38 28 43 22 50 22 C57 22 62 28 62 40 L62 52"
              fill="none"
              stroke="#00ff88"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: phase >= 2 ? 0 : 100,
                transition: 'stroke-dashoffset 1s ease 0.6s',
              }}
            />
            
            {/* Замочная скважина */}
            <circle
              cx="50"
              cy="63"
              r="5"
              fill="#00ff88"
              style={{
                opacity: phase >= 2 ? 1 : 0,
                transition: 'opacity 0.5s ease 1.2s',
              }}
            />
            <rect
              x="47"
              y="63"
              width="6"
              height="12"
              rx="1"
              fill="#00ff88"
              style={{
                opacity: phase >= 2 ? 1 : 0,
                transition: 'opacity 0.5s ease 1.2s',
              }}
            />
          </svg>
        </div>

        {/* Текст приветствия */}
        <div style={{
          textAlign: 'center',
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease',
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 300,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}>
            Добро пожаловать
          </h1>
          
          <div style={{
            marginTop: '1.5rem',
            fontSize: '1rem',
            color: '#00ff88',
            fontWeight: 600,
            letterSpacing: '0.2em',
          }}>
            CYBERSEC WIKI
          </div>
        </div>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes matrixRain {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
}
