
import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ease } from '@/lib/motion';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const formatter = (locale: string, decimals: number) => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Nombre qui compte jusqu'à sa valeur : à son apparition, puis à chaque changement.
 * Le rendu serveur affiche directement la valeur finale.
 *
 * <NumberTicker value={7.6} decimals={1} locale="fr-FR" />
 */
export function NumberTicker({
  value,
  decimals = 0,
  locale = 'fr-FR',
  duration = 0.9,
  delay = 0,
  className,
}: {
  value: number;
  decimals?: number;
  locale?: string;
  /** Secondes. */
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
  const reduced = useReducedMotion();
  const shown = useRef<number | null>(null);
  const fmt = useRef<Intl.NumberFormat>(formatter(locale, decimals));

  useIso(() => {
    fmt.current = formatter(locale, decimals);
    const el = ref.current;
    if (!el) return;
    if (shown.current === null && !reduced) el.textContent = fmt.current.format(0);
    else el.textContent = fmt.current.format(shown.current ?? value);
  }, [locale, decimals]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    const from = shown.current ?? 0;
    if (reduced || from === value) {
      shown.current = value;
      el.textContent = fmt.current.format(value);
      return;
    }
    const controls = animate(from, value, {
      duration: shown.current === null ? duration : Math.min(duration, 0.6),
      delay: shown.current === null ? delay : 0,
      ease: ease.out,
      onUpdate: (v) => {
        shown.current = v;
        el.textContent = fmt.current.format(v);
      },
      onComplete: () => {
        shown.current = value;
      },
    });
    return () => controls.stop();
  }, [value, inView, reduced, duration, delay]);

  // Le texte rendu par React ne change plus après le premier rendu : l'animation l'écrit elle-même.
  const [initial] = useState(() => formatter(locale, decimals).format(value));

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
      {initial}
    </span>
  );
}
