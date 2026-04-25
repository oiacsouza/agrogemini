import React, { useEffect, useState } from 'react';

const COLORS = ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#06b6d4', '#60a5fa'];

export function ConfettiBurst({ active, onDone }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) return;

    const generated = Array.from({ length: 46 }).map((_, index) => ({
      id: `${Date.now()}-${index}`,
      color: COLORS[index % COLORS.length],
      x: (Math.random() - 0.5) * 260,
      y: -Math.random() * 30,
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 6,
      duration: 620 + Math.random() * 520,
      delay: Math.random() * 120,
    }));

    setPieces(generated);
    const timer = window.setTimeout(() => {
      setPieces([]);
      onDone?.();
    }, 1300);

    return () => window.clearTimeout(timer);
  }, [active, onDone]);

  if (!pieces.length) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10010, overflow: 'hidden' }}>
      {pieces.map(piece => (
        <span
          key={piece.id}
          style={{
            position: 'fixed',
            left: '50%',
            top: '36%',
            '--start-x': `${piece.x}px`,
            '--start-y': `${piece.y}px`,
            '--start-r': `${piece.rotate}deg`,
            width: `${piece.size}px`,
            height: `${piece.size * 0.66}px`,
            borderRadius: '2px',
            background: piece.color,
            animation: `agConfetti ${piece.duration}ms ease-out ${piece.delay}ms forwards`,
            boxShadow: `0 0 12px ${piece.color}44`,
          }}
        />
      ))}

      <style>{`
        @keyframes agConfetti {
          0%   { opacity: 0; transform: translate(var(--start-x), var(--start-y)) rotate(var(--start-r)); }
          10%  { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(var(--start-x) * 1.35), 290px) rotate(calc(var(--start-r) + 620deg)); }
        }
      `}</style>
    </div>
  );
}
