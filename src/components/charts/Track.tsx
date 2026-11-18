
import { motion, useInView } from 'motion/react';
import { createContext, useContext, useRef, type CSSProperties, type ReactNode } from 'react';
import { dur, ease } from '@/lib/motion';
import { PALETTE } from './palette';

type Ctx = { pos: (v: number) => number; inView: boolean; delay: number };
const TrackCtx = createContext<Ctx>({ pos: () => 0, inView: true, delay: 0 });

const layer: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none' };

/**
 * Réglette horizontale sur une échelle [min, max] : points, segments et repères y glissent
 * (translations seulement). À l'apparition, les points partent de leur valeur de départ.
 */
export function Track({ min, max, height = 26, rail = true, delay = 0, className, style, children }: { min: number; max: number; height?: number; rail?: boolean; delay?: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  return (
    <span ref={ref} className={className} style={{ position: 'relative', display: 'block', height, ...style }}>
      {rail && <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, marginTop: -1, borderRadius: 1, background: PALETTE.track }} />}
      <TrackCtx.Provider value={{ pos, inView, delay }}>{children}</TrackCtx.Provider>
    </span>
  );
}

const T = (delay: number) => ({ duration: dur.xl, ease: ease.out, delay });

/** Point sur la réglette. `from` : valeur de départ de l'animation d'apparition. */
export function TrackDot({ value, from, size = 16, color, ring = 3, hollow, style }: { value: number; from?: number; size?: number; color: string; ring?: number; hollow?: boolean; style?: CSSProperties }) {
  const { pos, inView, delay } = useContext(TrackCtx);
  const start = from ?? value;
  return (
    <motion.span style={{ ...layer, zIndex: hollow ? 1 : 2 }} initial={{ x: `${pos(start)}%` }} animate={{ x: `${pos(inView ? value : start)}%` }} transition={T(delay)} aria-hidden="true">
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: size,
          height: size,
          margin: `${-size / 2}px 0 0 ${-size / 2}px`,
          borderRadius: '50%',
          background: hollow ? PALETTE.surface : color,
          border: hollow ? `2px solid ${color}` : `${ring}px solid var(--surf)`,
          boxShadow: hollow ? 'none' : '0 1px 3px rgba(16, 24, 40, 0.28)',
          transition: `background-color var(--d-m) var(--ease-out)`,
          ...style,
        }}
      />
    </motion.span>
  );
}

/** Segment entre deux valeurs (de `from` à `to`). */
export function TrackSpan({ from, to, color, thickness = 2, startCollapsed = true }: { from: number; to: number; color: string; thickness?: number; startCollapsed?: boolean }) {
  const { pos, inView, delay } = useContext(TrackCtx);
  const a = Math.min(pos(from), pos(to));
  const k = Math.abs(pos(to) - pos(from)) / 100;
  const shown = inView || !startCollapsed;
  return (
    <motion.span
      aria-hidden="true"
      style={{ ...layer, top: '50%', bottom: 'auto', height: thickness, marginTop: -thickness / 2, borderRadius: thickness, background: color, transformOrigin: '0 50%', zIndex: 1 }}
      initial={{ x: `${pos(from)}%`, scaleX: 0 }}
      animate={{ x: `${shown ? a : pos(from)}%`, scaleX: shown ? k : 0, background: color }}
      transition={T(delay)}
    />
  );
}

/** Repère vertical (moyenne, seuil). */
export function TrackMark({ value, color = PALETTE.ink, dashed = true, opacity = 0.4, extend = 8, children }: { value: number; color?: string; dashed?: boolean; opacity?: number; extend?: number; children?: ReactNode }) {
  const { pos } = useContext(TrackCtx);
  return (
    <motion.span style={{ ...layer, top: -extend, bottom: -extend, zIndex: 0 }} initial={false} animate={{ x: `${pos(value)}%` }} transition={{ duration: dur.l, ease: ease.out }} aria-hidden="true">
      <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, borderLeft: `1.5px ${dashed ? 'dashed' : 'solid'} ${color}`, opacity }} />
      {children}
    </motion.span>
  );
}

/** Zone hachurée « pas encore de données ». */
export function TrackEmpty() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        height: 10,
        marginTop: -5,
        borderRadius: 5,
        background: 'repeating-linear-gradient(135deg, var(--bd-2) 0 3px, var(--canvas) 3px 6px)',
      }}
    />
  );
}
