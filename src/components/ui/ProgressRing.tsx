
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './ProgressRing.module.css';
import { spring } from '@/lib/motion';

type Tone = 'ac' | 'good' | 'wa' | 'ko';

/**
 * Anneau de progression SVG. Il se remplit depuis zéro à l'apparition, puis suit
 * chaque changement de valeur avec fluidité. `value` va de 0 à 1.
 */
export function ProgressRing({
  value,
  size = 44,
  stroke = 3,
  tone = 'ac',
  label,
  children,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  label?: string;
  children?: ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const v = Math.max(0, Math.min(1, value));
  return (
    <span className={cn(s.ring, className)} style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label}>
      <svg className={s.svg} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className={s.track} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <motion.circle
          className={cn(s.fill, s[tone])}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: v }}
          transition={spring.soft}
        />
      </svg>
      {children && <span className={s.center}>{children}</span>}
    </span>
  );
}
