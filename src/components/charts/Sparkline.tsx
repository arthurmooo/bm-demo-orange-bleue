
import { curveMonotoneX, line, area } from 'd3-shape';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { dur, ease } from '@/lib/motion';
import { useSize } from './useSize';
import { PALETTE } from './palette';

export type SparkTone = 'good' | 'bad' | 'neu' | 'blue';

const COLOR: Record<SparkTone, string> = { good: PALETTE.good, bad: PALETTE.bad, neu: PALETTE.neutral, blue: PALETTE.accent };

/** Courbe de tendance d'un KPI : se dessine à l'apparition, morphe quand la série change. */
export function Sparkline({ values, tone, height = 40, delay = 0 }: { values: number[]; tone: SparkTone; height?: number; delay?: number }) {
  const [ref, { width: w }] = useSize<HTMLDivElement>();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { once: true, amount: 0.5 });
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  const span = mx - mn || 1;
  const pad = 5;
  const x = (i: number) => (i / (values.length - 1)) * (w - pad) + 0.5;
  const y = (v: number) => height - 4 - ((v - mn) / span) * (height - 4 - pad);
  const color = COLOR[tone];
  const l = line<number>()
    .x((_, i) => x(i))
    .y((v) => y(v))
    .curve(curveMonotoneX);
  const a = area<number>()
    .x((_, i) => x(i))
    .y0(height)
    .y1((v) => y(v))
    .curve(curveMonotoneX);
  const d = w ? l(values) ?? '' : '';
  const ad = w ? a(values) ?? '' : '';
  const last = values[values.length - 1];

  return (
    <div ref={box} aria-hidden="true">
      <div ref={ref} style={{ height, position: 'relative' }}>
        {w > 0 && (
          <svg width={w} height={height} style={{ display: 'block', overflow: 'visible' }}>
            <motion.path d={ad} fill={color} initial={{ opacity: 0, d: ad }} animate={{ opacity: inView ? 0.1 : 0, d: ad }} transition={{ opacity: { duration: dur.l, delay: delay + 0.3 }, d: { duration: dur.l, ease: ease.out } }} />
            <motion.path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, d }}
              animate={{ pathLength: inView ? 1 : 0, d }}
              transition={{ pathLength: { duration: dur.xl, ease: ease.out, delay }, d: { duration: dur.l, ease: ease.out } }}
            />
            <motion.circle
              cx={x(values.length - 1)}
              fill={color}
              stroke={PALETTE.surface}
              strokeWidth={2}
              initial={{ r: 0, cy: y(last) }}
              animate={{ r: inView ? 3.5 : 0, cy: y(last) }}
              transition={{ r: { duration: dur.m, delay: delay + 0.55 }, cy: { duration: dur.l, ease: ease.out } }}
            />
          </svg>
        )}
      </div>
    </div>
  );
}
