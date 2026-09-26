import { useCallback, useRef } from 'react';

export function useXMBSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playClick = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/Cursor.mp3');
      audioRef.current.volume = 0.6;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  return { playClick };
}