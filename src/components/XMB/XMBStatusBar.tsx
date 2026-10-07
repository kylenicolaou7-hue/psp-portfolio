'use client';

import { useEffect, useState } from 'react';

export default function XMBStatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '0.9rem',
      right: '1.2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      zIndex: 16, // stays above the info panel, like the PSP
      fontFamily: "'M PLUS Rounded 1c', sans-serif",
      fontSize: '0.6rem',
      fontWeight: 300,
      letterSpacing: '0.05em',
      color: 'rgba(255,255,255,0.75)',
    }}>
      {/* SIGNAL BARS */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
        {[3, 5, 7, 9].map((h, i) => (
          <div key={i} style={{
            width: '3px',
            height: `${h}px`,
            background: i < 3 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
            borderRadius: '1px',
          }} />
        ))}
      </div>

      {/* BATTERY IMAGE */}
      <img
        src="/icons/battery.png"
        alt="battery"
        style={{
          width: '28px',
          height: 'auto',
          objectFit: 'contain',
          opacity: 0.85,
        }}
      />

      {/* TIME */}
      <span style={{ fontSize: '0.65rem', fontWeight: 400 }}>{time}</span>
    </div>
  );
}