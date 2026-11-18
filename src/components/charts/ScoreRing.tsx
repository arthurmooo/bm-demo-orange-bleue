
import { motion, useInView } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { scoreTone } from '@/lib/data/core';
import { dur, ease } from '@/lib/motion';
import { PALETTE } from './palette';

const TONE = { hi: PALETTE.good, mid: PALETTE.warn, lo: PALETTE.bad } as const;

/**
 * Anneau de score /100 : l'arc suit la valeur, sa couleur suit les seuils (≥ 80, 70–79, < 70).
 * Un score provisoire garde son arc proportionnel, en plus léger.
 * `marker` pose un repère (ex. score du printemps).
 */
export function ScoreRing({
  value,
  size = 156,
  stroke = 12,
  provisional,
  marker,
  track = PALETTE.track,
  children,
  delay = 0,
}: {
  value: number;
  size?: number;
  stroke?: number;
  provisional?: boolean;
  marker?: number;
  track?: string;
  children?: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const c = size / 2;
  const r = (size - stroke) / 2 - (marker !== undefined ? 8 : 0);
  const color = TONE[scoreTone(value)];
  const mAng = marker !== undefined ? ((-90 + (marker / 100) * 360) * Math.PI) / 180 : 0;
  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          initial={{ pathLength: 0, opacity: 0, stroke: color }}
          animate={{ pathLength: inView ? value / 100 : 0, opacity: inView && value > 0 ? 1 : 0, stroke: color, strokeOpacity: provisional ? 0.42 : 1 }}
          transition={{ pathLength: { duration: dur.xl, ease: ease.out, delay }, opacity: { duration: dur.xs, delay }, stroke: { duration: dur.m } }}
        />
        {marker !== undefined && (
          <motion.line
            x1={c + (r - stroke / 2 - 4) * Math.cos(mAng)}
            y1={c + (r - stroke / 2 - 4) * Math.sin(mAng)}
            x2={c + (r + stroke / 2 + 4) * Math.cos(mAng)}
            y2={c + (r + stroke / 2 + 4) * Math.sin(mAng)}
            stroke={PALETTE.ink}
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ duration: dur.m, delay: delay + 0.5 }}
          />
        )}
      </svg>
      <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{children}</span>
    </span>
  );
}
