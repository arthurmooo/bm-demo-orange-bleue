
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { spring, tween } from '@/lib/motion';
import s from './ChartTooltip.module.css';

/**
 * Infobulle de graphe, positionnée dans la zone de tracé (px).
 * Elle se place à droite du repère, ou à gauche près du bord droit, et glisse d'un point à l'autre.
 */
export function ChartTooltip({ open, x, y, width, children }: { open: boolean; x: number; y: number; width: number; children: ReactNode }) {
  const left = x > width * 0.6;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={s.anchor}
          role="presentation"
          initial={{ opacity: 0, x, y }}
          animate={{ opacity: 1, x, y }}
          exit={{ opacity: 0, transition: tween.exit }}
          transition={{ ...spring.snappy, opacity: tween.s }}
        >
          <div className={cn(s.tip, left && s.left)}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TipHead({ children }: { children: ReactNode }) {
  return <div className={s.head}>{children}</div>;
}

export type TipKey = 'line' | 'dash' | 'dot' | 'box';

/** Ligne d'infobulle : la valeur d'abord, le libellé ensuite, une clé de la couleur de la série. */
export function TipRow({ color, value, label, keyShape = 'line' }: { color: string; value: ReactNode; label: ReactNode; keyShape?: TipKey }) {
  const style: CSSProperties = keyShape === 'dash' ? { color } : { background: color };
  return (
    <div className={s.row}>
      <span className={cn(s.key, keyShape === 'dash' && s.keyDash, keyShape === 'dot' && s.keyDot, keyShape === 'box' && s.keyBox)} style={style} aria-hidden="true" />
      <span className={s.value}>{value}</span>
      <span className={s.label}>{label}</span>
    </div>
  );
}

export function TipRows({ children }: { children: ReactNode }) {
  return <div className={s.rows}>{children}</div>;
}

/** Remarque à la place des lignes (« Pas encore de données »). */
export function TipNote({ children }: { children: ReactNode }) {
  return <div className={s.note}>{children}</div>;
}

export function TipFoot({ children }: { children: ReactNode }) {
  return <div className={s.foot}>{children}</div>;
}
