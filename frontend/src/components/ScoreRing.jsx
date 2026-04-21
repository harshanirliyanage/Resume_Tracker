import { useEffect, useRef, useState } from 'react';

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreRing({ score }) {
  const [animated, setAnimated] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    let start = null;
    const duration = 1200;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimated(Math.round(eased * score));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [score]);

  const scoreClass = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';
  const trackColor = 'rgba(255,255,255,0.06)';
  const dashOffset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;

  return (
    <div className="score-ring">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Track */}
        <circle
          cx="80" cy="80" r={RADIUS}
          fill="none"
          stroke={trackColor}
          strokeWidth="12"
        />
        {/* Progress */}
        <circle
          cx="80" cy="80" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="score-ring-text">
        <div className={`score-value score-${scoreClass}`} style={{ fontSize: '2.5rem' }}>
          {animated}%
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          MATCH SCORE
        </div>
      </div>
    </div>
  );
}
