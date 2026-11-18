
import { AnimatePresence, motion } from 'motion/react';
import { Slider as R } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { spring, tween } from '@/lib/motion';
import s from './Slider.module.css';

type Props = {
  /** `null` tant que la personne n'a pas répondu (poignée en pointillés). */
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  labelledBy?: string;
  /** Paliers nommés, un par cran (« Inférieure », « Égale », « Supérieure »). */
  steps?: string[];
  /** Libellés des extrémités quand il n'y a pas de paliers nommés. */
  ends?: [string, string];
  /** Suffixe de la grande valeur (« /10 »). */
  suffix?: string;
  unsetText: string;
  disabled?: boolean;
};

/**
 * Curseur tactile : grande valeur au-dessus, graduations, poignée de 44 px qui
 * grossit sur ressort à l'appui avec une bulle de valeur. Clavier : flèches,
 * Début, Fin. Vibration discrète à chaque cran sur téléphone.
 */
export function Slider({ value, onChange, min = 0, max = 10, step = 1, labelledBy, steps, ends, suffix, unsetText, disabled }: Props) {
  const [pressed, setPressed] = useState(false);
  const unset = value === null;
  const mid = min + Math.round((max - min) / step / 2) * step;
  const v = value ?? mid;
  const frac = (v - min) / (max - min);
  const count = Math.round((max - min) / step);
  const last = useRef(v);

  useEffect(() => {
    if (!pressed) return;
    const up = () => setPressed(false);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [pressed]);

  const change = (n: number) => {
    if (n !== last.current && typeof navigator !== 'undefined' && 'vibrate' in navigator && window.matchMedia('(pointer: coarse)').matches) {
      navigator.vibrate(4);
    }
    last.current = n;
    onChange(n);
  };

  const label = (n: number) => (steps ? steps[Math.round((n - min) / step)] : String(n));

  return (
    <div className={cn(s.root, unset && s.unset, disabled && s.disabled)}>
      <div className={s.value} aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.b
            key={unset ? 'unset' : v}
            className={cn('num', s.big, steps && s.bigWord)}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={tween.s}
          >
            {unset ? '—' : label(v)}
          </motion.b>
        </AnimatePresence>
        {suffix && !steps && <span className={s.suffix}>{suffix}</span>}
      </div>

      <R.Root
        className={s.slider}
        value={[v]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([n]) => change(n)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => {
          if (unset) change(v);
        }}
      >
        <span className={s.track} aria-hidden="true">
          <motion.span className={s.fill} initial={false} animate={{ scaleX: unset ? 0 : frac }} transition={spring.snappy} />
        </span>
        <span className={s.ticks} aria-hidden="true">
          {Array.from({ length: count + 1 }, (_, i) => (
            <i key={i} className={cn(!unset && i <= Math.round(frac * count) && s.on)} style={{ left: `calc(22px + (100% - 44px) * ${i / count})` }} />
          ))}
        </span>
        <R.Thumb className={s.thumb} aria-labelledby={labelledBy} aria-valuetext={unset ? unsetText : `${label(v)}${suffix && !steps ? ` ${suffix}` : ''}`}>
          <motion.span className={s.knob} animate={{ scale: pressed ? 1.38 : 1 }} transition={pressed ? spring.bouncy : spring.snappy} />
          <AnimatePresence>
            {pressed && (
              <motion.span
                className={cn('num', s.bubble)}
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.8, transition: tween.exit }}
                transition={spring.bouncy}
              >
                {label(v)}
              </motion.span>
            )}
          </AnimatePresence>
        </R.Thumb>
      </R.Root>

      {steps ? (
        <div className={s.steps} aria-hidden="true">
          {/* Au-delà de 3 paliers, seules les extrémités sont nommées : le palier choisi s'affiche en grand au-dessus. */}
          {steps.map((t, i) =>
            steps.length <= 3 || i === 0 || i === steps.length - 1 ? (
              <span key={t} className={cn(!unset && i === Math.round(frac * count) && s.stepOn)} style={{ left: `calc(22px + (100% - 44px) * ${i / count})` }}>
                {t}
              </span>
            ) : null,
          )}
        </div>
      ) : (
        ends && (
          <div className={s.ends} aria-hidden="true">
            <span>
              <b className="num">{min}</b>
              {ends[0]}
            </span>
            <span>
              <b className="num">{max}</b>
              {ends[1]}
            </span>
          </div>
        )
      )}
    </div>
  );
}
