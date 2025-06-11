import { useState, useRef, useEffect } from 'react';

export default function TimeSlider({ years, year, setYear }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const requestId = useRef(null);

  const first = years[0];
  const last = years[years.length - 1];

  useEffect(() => {
    return () => {
      if (requestId.current) {
        cancelAnimationFrame(requestId.current);
      }
    };
  }, []);

  const togglePlay = () => {
    setIsPlaying(prev => {
      const next = !prev;
      if (next) {
        const tick = () => {
          setYear(prevYear => (prevYear === last ? first : prevYear + 1));
          requestId.current = requestAnimationFrame(tick);
        };
        requestId.current = requestAnimationFrame(tick);
      } else {
        if (requestId.current) {
          cancelAnimationFrame(requestId.current);
        }
      }
      return next;
    });
  };

  return (
    <div className="time-slider">
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        min={first}
        max={last}
        step="1"
        value={year}
        onChange={e => setYear(+e.target.value)}
        aria-valuemin={first}
        aria-valuemax={last}
        aria-valuenow={year}
      />
      <span>{year}</span>
    </div>
  );
}
