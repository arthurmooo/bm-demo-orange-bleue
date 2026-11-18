
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { dur, ease, spring, STAGGER } from '@/lib/motion';
import { ChartTooltip } from './ChartTooltip';
import { useSize } from './useSize';
import s from './StageLineChart.module.css';
import { PALETTE } from './palette';

export type StackColumn = {
  /** Effectifs par segment, du haut vers le bas ; `null` : pas encore de données. */
  segments: number[] | null;
  top: string;
  topColor?: string;
  label: string;
};

const LABEL_Y = 14;
const STACK_TOP = 30;
const GAP = 2;

/**
 * Colonnes empilées à 100 % (une par étape) : les segments poussent depuis la base en léger décalé
 * et glissent d'une répartition à l'autre. Colonne sélectionnable, infobulle au survol et au clavier.
 */
export function StackedColumns({
  ariaLabel,
  columns,
  colors,
  selected,
  onSelect,
  tooltip,
  axisWidth = 52,
  stackHeight = 180,
  barMax = 54,
}: {
  ariaLabel: string;
  columns: StackColumn[];
  colors: string[];
  selected: number | null;
  onSelect: (i: number) => void;
  tooltip: (i: number) => ReactNode;
  axisWidth?: number;
  stackHeight?: number;
  barMax?: number;
}) {
  const n = columns.length;
  const uid = useId().replace(/:/g, '');
  const height = STACK_TOP + stackHeight + 4;
  const [plotRef, { width: w }] = useSize<HTMLDivElement>();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.35 });
  const [settled, setSettled] = useState(false);
  const [hi, setHi] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState(selected ?? 0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setSettled(true), 1000);
    return () => clearTimeout(t);
  }, [inView]);

  const colW = w / n;
  const bw = Math.min(barMax, colW * 0.54);
  const xAt = (i: number) => (i + 0.5) * colW;
  const base = STACK_TOP + stackHeight;

  const move = (e: KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(n - 1, i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, i - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    setFocusIdx(next);
    btns.current[next]?.focus();
  };

  return (
    <div ref={wrapRef} className={s.wrap}>
      <div className={s.grid} style={{ gridTemplateColumns: `${axisWidth}px minmax(0, 1fr)` }}>
        <span />
        <div ref={plotRef} className={s.plot} style={{ height }}>
          <AnimatePresence>
            {selected !== null && (
              <motion.span
                key="sel"
                layout
                className={s.selected}
                style={{ left: `${(selected / n) * 100}%`, width: `${100 / n}%`, top: 0, bottom: -6 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ layout: spring.layout, opacity: { duration: dur.s } }}
              />
            )}
          </AnimatePresence>

          {w > 0 && (
            <svg className={s.svg} width={w} height={height} aria-hidden="true">
              <defs>
                <pattern id={`hatch-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="8" height="8" fill={PALETTE.hatchA} />
                  <rect width="4" height="8" fill={PALETTE.hatchB} />
                </pattern>
                {columns.map((_, i) => (
                  <clipPath key={i} id={`stk-${uid}-${i}`}>
                    <rect x={xAt(i) - bw / 2} y={STACK_TOP} width={bw} height={stackHeight} rx={8} />
                  </clipPath>
                ))}
              </defs>
              {columns.map((c, i) => {
                const delay = settled ? 0 : 0.1 + i * 0.045;
                if (!c.segments) {
                  return (
                    <g key={i}>
                      <motion.rect
                        x={xAt(i) - bw / 2}
                        y={STACK_TOP}
                        width={bw}
                        height={stackHeight}
                        rx={8}
                        fill={`url(#hatch-${uid})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: inView ? 1 : 0 }}
                        transition={{ duration: dur.l, delay }}
                      />
                      <text x={xAt(i)} y={LABEL_Y} textAnchor="middle" className={s.value} style={{ fill: 'var(--tx-4)' }}>
                        —
                      </text>
                    </g>
                  );
                }
                const total = c.segments.reduce((a, v) => a + v, 0) || 1;
                const visible = c.segments.filter((v) => v > 0).length;
                const avail = stackHeight - GAP * Math.max(0, visible - 1);
                let y = STACK_TOP;
                const rects = c.segments.map((v, k) => {
                  const h = (v / total) * avail;
                  const r = { k, y, h };
                  if (v > 0) y += h + GAP;
                  return r;
                });
                return (
                  <g key={i} clipPath={`url(#stk-${uid}-${i})`}>
                    {rects.map((r) => (
                      <motion.rect
                        key={r.k}
                        x={xAt(i) - bw / 2}
                        width={bw}
                        fill={colors[r.k]}
                        initial={{ attrY: base, height: 0 }}
                        animate={inView ? { attrY: r.y, height: r.h } : { attrY: base, height: 0 }}
                        transition={{ duration: settled ? dur.l : dur.xl, ease: ease.out, delay }}
                      />
                    ))}
                  </g>
                );
              })}
              {columns.map((c, i) =>
                c.segments ? (
                  <motion.text
                    key={`t${i}`}
                    x={xAt(i)}
                    y={LABEL_Y}
                    textAnchor="middle"
                    className={s.value}
                    style={{ fill: c.topColor ?? 'var(--tx)', fontSize: 13.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: inView ? 1 : 0 }}
                    transition={{ duration: dur.m, delay: settled ? 0 : 0.4 + i * STAGGER }}
                  >
                    {c.top}
                  </motion.text>
                ) : null,
              )}
            </svg>
          )}

          <div className={s.cols} style={{ inset: '0 0 -6px' }} role="group" aria-label={ariaLabel} onPointerLeave={() => setHi(null)}>
            {columns.map((c, i) => (
              <button
                key={i}
                ref={(el) => {
                  btns.current[i] = el;
                }}
                type="button"
                className={s.col}
                style={{ left: `${(i / n) * 100}%`, width: `${100 / n}%` }}
                tabIndex={i === focusIdx ? 0 : -1}
                aria-pressed={selected === i}
                aria-label={c.label}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setHi(i);
                }}
                onFocus={() => {
                  setFocusIdx(i);
                  setHi(i);
                }}
                onBlur={() => setHi(null)}
                onKeyDown={(e) => move(e, i)}
                onClick={() => onSelect(i)}
              />
            ))}
          </div>

          <ChartTooltip open={hi !== null && w > 0} x={hi !== null ? xAt(hi) + bw / 2 - 6 : 0} y={STACK_TOP + 10} width={w}>
            {hi !== null && tooltip(hi)}
          </ChartTooltip>
        </div>
      </div>
    </div>
  );
}
