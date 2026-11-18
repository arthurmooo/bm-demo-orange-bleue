
import { ArrowDownRight } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { dur, ease, spring, STAGGER, tween } from '@/lib/motion';
import { ChartTooltip } from './ChartTooltip';
import { useSize } from './useSize';
import s from './StageLineChart.module.css';
import { PALETTE } from './palette';

export type LineSeries = { id: string; label: string; color: string; values: (number | null)[] };
export type PointTone = 'ok' | 'wa' | 'ko';

export type StageCategory = { label: string; sub?: string; icon?: (on: boolean) => ReactNode };

const WARN = PALETTE.warn;
const KO = PALETTE.bad;

/** Grille commune à l'axe des x et aux rangées alignées sous le graphe (écarts, etc.). */
export const stageGrid = (axisWidth: number, n: number): CSSProperties => ({ gridTemplateColumns: `${axisWidth}px repeat(${n}, minmax(0, 1fr))` });

/**
 * Valeurs manquantes repliées sur le dernier point connu (même valeur, même colonne) : le tracé s'arrête
 * net au dernier point mais garde le même nombre de sommets, ce qui permet de passer d'une série à l'autre en douceur.
 */
function collapse(values: (number | null)[], fallback: number) {
  const first = values.findIndex((v) => v !== null);
  let lastV = first >= 0 ? (values[first] as number) : fallback;
  let lastI = Math.max(first, 0);
  return values.map((v, i) => {
    if (v !== null) {
      lastV = v;
      lastI = i;
    }
    return { v: lastV, i: v === null ? lastI : i };
  });
}

/**
 * Courbe par étape du parcours (9 colonnes) : série principale étiquetée, référence en pointillé,
 * séries superposées, enveloppe, zone « pas encore de données ».
 * Se dessine à l'apparition, morphe quand les données changent, repère vertical et infobulle au survol,
 * colonnes sélectionnables au clavier (flèches, Entrée).
 */
export function StageLineChart({
  ariaLabel,
  categories,
  domain,
  ticks,
  primary,
  primaryWidth = 2.5,
  tone,
  labelBelow,
  reference,
  overlays = [],
  band,
  annotation,
  noData,
  selected,
  onSelect,
  format,
  columnLabel,
  tooltip,
  axisWidth = 34,
  height = 210,
  iconsOnly,
}: {
  ariaLabel: string;
  categories: StageCategory[];
  domain: [number, number];
  ticks: number[];
  primary: LineSeries;
  primaryWidth?: number;
  tone?: (v: number) => PointTone;
  labelBelow?: (i: number) => boolean;
  reference?: LineSeries;
  overlays?: LineSeries[];
  band?: { lo: (number | null)[]; hi: (number | null)[] } | null;
  annotation?: { index: number; text: string } | null;
  noData?: { from: number; label: string } | null;
  selected: number | null;
  onSelect: (i: number) => void;
  format: (v: number) => string;
  columnLabel: (i: number) => string;
  tooltip: (i: number) => ReactNode;
  axisWidth?: number;
  height?: number;
  /** Axe en pictogrammes seuls, quand la place manque pour les noms d'étape (aperçu d'un rapport). */
  iconsOnly?: boolean;
}) {
  const n = categories.length;
  const [plotRef, { width: w }] = useSize<HTMLDivElement>();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.35 });
  const [settled, setSettled] = useState(false);
  const [hi, setHi] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState(selected ?? 0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setSettled(true), 1100);
    return () => clearTimeout(t);
  }, [inView]);

  const [d0, d1] = domain;
  const xAt = (i: number) => ((i + 0.5) / n) * w;
  const yAt = (v: number) => ((d1 - v) / (d1 - d0)) * height;
  const path = (vals: (number | null)[]) =>
    collapse(vals, d0)
      .map((pt, k) => `${k ? 'L' : 'M'}${xAt(pt.i).toFixed(2)},${yAt(pt.v).toFixed(2)}`)
      .join('');

  const bandPath = useMemo(() => {
    if (!band || !w) return null;
    const top = collapse(band.hi, d0)
      .map((pt, k) => `${k ? 'L' : 'M'}${xAt(pt.i).toFixed(2)},${yAt(pt.v).toFixed(2)}`)
      .join('');
    const bot = collapse(band.lo, d0)
      .reverse()
      .map((pt) => `L${xAt(pt.i).toFixed(2)},${yAt(pt.v).toFixed(2)}`)
      .join('');
    return `${top}${bot}Z`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [band, w, d0, d1, height, n]);

  const pts = collapse(primary.values, d0).map((pt) => pt.v);
  const reveal = (i: number) => (settled ? 0 : 0.18 + i * 0.05);
  const drawT = { duration: dur.xl, ease: ease.out };
  const morphT = { duration: dur.l, ease: ease.out };

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

  const hv = hi !== null ? primary.values[hi] : null;
  const tipY = Math.max(-12, Math.min(height - 96, (hv !== null ? yAt(hv) : height / 2) - 64));

  return (
    <div ref={wrapRef} className={s.wrap}>
      <div className={s.grid} style={{ gridTemplateColumns: `${axisWidth}px minmax(0, 1fr)` }}>
        <div className={s.yaxis} style={{ height }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ top: yAt(t) }}>
              {t}
            </span>
          ))}
        </div>
        <div ref={plotRef} className={s.plot} style={{ height }}>
          <AnimatePresence>
            {selected !== null && (
              <motion.span
                key="sel"
                layout
                className={s.selected}
                style={{ left: `${(selected / n) * 100}%`, width: `${100 / n}%`, top: -8, bottom: -8 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ layout: spring.layout, opacity: { duration: dur.s } }}
              />
            )}
          </AnimatePresence>

          {noData && <span className={s.nodata} style={{ left: `${(noData.from / n) * 100}%`, right: 0 }} aria-hidden="true" />}

          {w > 0 && (
            <svg className={s.svg} width={w} height={height} aria-hidden="true">
              {ticks.map((t, k) => (
                <line key={t} className={cn(s.gridline, k === ticks.length - 1 && s.base)} x1={0} x2={w} y1={Math.round(yAt(t)) + 0.5} y2={Math.round(yAt(t)) + 0.5} />
              ))}

              {bandPath && (
                <motion.path
                  d={bandPath}
                  fill={PALETTE.accent}
                  fillOpacity={0.09}
                  initial={{ opacity: 0, d: bandPath }}
                  animate={{ opacity: inView ? 1 : 0, d: bandPath }}
                  transition={{ opacity: { duration: dur.l, delay: settled ? 0 : 0.35 }, d: morphT }}
                />
              )}

              {hi !== null && (
                <motion.line
                  y1={-8}
                  y2={height + 8}
                  stroke={PALETTE.ink}
                  strokeOpacity={0.22}
                  strokeWidth={1}
                  initial={{ x1: xAt(hi), x2: xAt(hi), opacity: 0 }}
                  animate={{ x1: xAt(hi), x2: xAt(hi), opacity: 1 }}
                  transition={{ ...spring.snappy, opacity: tween.xs }}
                />
              )}

              {reference && (
                <g>
                  <motion.path
                    d={path(reference.values)}
                    fill="none"
                    stroke={reference.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    strokeLinejoin="round"
                    initial={{ opacity: 0, d: path(reference.values) }}
                    animate={{ opacity: inView ? 1 : 0, d: path(reference.values) }}
                    transition={{ opacity: { duration: dur.l, delay: settled ? 0 : 0.1 }, d: morphT }}
                  />
                  {reference.values.map((v, i) =>
                    v === null ? null : (
                      <motion.circle
                        key={i}
                        cx={xAt(i)}
                        cy={yAt(v)}
                        fill={PALETTE.surface}
                        stroke={reference.color}
                        strokeWidth={2}
                        initial={{ r: 0 }}
                        animate={{ r: inView ? 4 : 0, cy: yAt(v) }}
                        transition={{ r: { duration: dur.m, delay: reveal(i) }, cy: morphT }}
                      />
                    ),
                  )}
                </g>
              )}

              <AnimatePresence>
                {overlays.map((o) => (
                  <motion.g key={o.id} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.s }}>
                    <motion.path
                      d={path(o.values)}
                      fill="none"
                      stroke={o.color}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: dur.xl, ease: ease.out }}
                    />
                    {o.values.map((v, i) =>
                      v === null ? null : (
                        <motion.circle
                          key={i}
                          cx={xAt(i)}
                          cy={yAt(v)}
                          fill={o.color}
                          stroke={PALETTE.surface}
                          strokeWidth={2}
                          initial={{ r: 0 }}
                          animate={{ r: hi === i ? 5.5 : 4.5 }}
                          transition={{ duration: dur.m, delay: hi === null ? 0.1 + i * STAGGER : 0 }}
                        />
                      ),
                    )}
                  </motion.g>
                ))}
              </AnimatePresence>

              <motion.path
                d={path(primary.values)}
                fill="none"
                stroke={primary.color}
                strokeWidth={primaryWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                initial={{ pathLength: 0, d: path(primary.values) }}
                animate={{ pathLength: inView ? 1 : 0, d: path(primary.values) }}
                transition={{ pathLength: drawT, d: morphT }}
              />

              {pts.map((v, i) => {
                const known = primary.values[i] !== null;
                const t = known && tone ? tone(v) : 'ok';
                const cx = known ? xAt(i) : xAt(collapse(primary.values, d0)[i].i);
                const cy = yAt(v);
                const below = labelBelow?.(i) ?? false;
                const isHi = hi === i;
                return (
                  <g key={i}>
                    {t === 'ko' && (
                      <motion.circle cx={cx} fill={KO} fillOpacity={0.18} initial={{ r: 0, cy }} animate={{ r: inView && known ? 10 : 0, cy }} transition={{ r: { duration: dur.m, delay: reveal(i) }, cy: morphT }} />
                    )}
                    <motion.circle
                      cx={cx}
                      initial={{ r: 0, cy }}
                      animate={{
                        r: inView && known ? (isHi ? 7.5 : 6) : 0,
                        cy,
                        fill: t === 'ko' ? KO : PALETTE.surface,
                        stroke: t === 'ko' ? KO : t === 'wa' ? WARN : primary.color,
                      }}
                      strokeWidth={2.5}
                      transition={{ r: { duration: dur.m, delay: isHi ? 0 : reveal(i) }, cy: morphT, fill: { duration: dur.s }, stroke: { duration: dur.s } }}
                    />
                    <motion.text
                      className={cn(s.value, t === 'ko' && s.valueKo)}
                      textAnchor="middle"
                      initial={{ opacity: 0, attrX: cx, attrY: below ? cy + 25 : cy - 13 }}
                      animate={{ opacity: inView && known ? 1 : 0, attrX: cx, attrY: below ? cy + 25 : cy - 13 }}
                      transition={{ opacity: { duration: dur.m, delay: settled ? 0 : 0.35 + i * STAGGER }, attrY: morphT, attrX: morphT }}
                    >
                      {known ? format(v) : ''}
                    </motion.text>
                  </g>
                );
              })}
            </svg>
          )}

          {noData && (
            <span className={s.nodata} style={{ left: `${(noData.from / n) * 100}%`, right: 0, background: 'none', zIndex: 2, pointerEvents: 'none' }}>
              <span className={s.nodataLabel}>{noData.label}</span>
            </span>
          )}

          <AnimatePresence>
            {annotation && w > 0 && primary.values[annotation.index] !== null && (
              <motion.span
                key="ann"
                className={s.ann}
                style={{ left: xAt(annotation.index), top: yAt(primary.values[annotation.index]!) }}
                initial={{ opacity: 0, x: '-50%', y: 10 }}
                animate={{ opacity: inView ? 1 : 0, x: '-50%', y: 16 }}
                exit={{ opacity: 0, transition: tween.exit }}
                transition={{ duration: dur.l, ease: ease.out, delay: settled ? 0 : 0.7 }}
                aria-hidden="true"
              >
                <ArrowDownRight aria-hidden="true" />
                {annotation.text}
              </motion.span>
            )}
          </AnimatePresence>

          <div className={s.cols} role="group" aria-label={ariaLabel} onPointerLeave={() => setHi(null)}>
            {categories.map((c, i) => (
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
                aria-label={columnLabel(i)}
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

          <ChartTooltip open={hi !== null && w > 0} x={hi !== null ? xAt(hi) : 0} y={tipY} width={w}>
            {hi !== null && tooltip(hi)}
          </ChartTooltip>
        </div>
      </div>

      <div className={s.xaxis} style={stageGrid(axisWidth, n)} aria-hidden="true">
        <span />
        {categories.map((c, i) => (
          <span key={i} className={cn(s.x, selected === i && s.xOn)}>
            {c.icon?.(selected === i)}
            {!(iconsOnly && c.icon) && <span className={s.xl}>{c.label}</span>}
            {c.sub && <span className={s.xs}>{c.sub}</span>}
          </span>
        ))}
        {selected !== null && <span className={s.xName}>{categories[selected].label}</span>}
      </div>
    </div>
  );
}
