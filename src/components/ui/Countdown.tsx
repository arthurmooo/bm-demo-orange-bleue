
import { AnimatePresence, motion, useMotionValue } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { dur, ease, spring } from '@/lib/motion';
import s from './Countdown.module.css';

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

/**
 * Cadran de compte à rebours. L'anneau se vide en continu, passe à l'orange
 * à 15 s et au rouge à 0 ; les secondes défilent. Hors décompte, le centre
 * affiche `idle` (le bouton Go, par exemple).
 */
export function Countdown({
  seconds,
  startedAt,
  onExpire,
  idle,
  timeUpLabel,
  label,
  size = 248,
  stroke = 12,
}: {
  seconds: number;
  /** Horodatage (ms) du départ ; `null` tant que le chrono n'est pas lancé. */
  startedAt: number | null;
  onExpire?: () => void;
  idle?: ReactNode;
  timeUpLabel: string;
  label: string;
  size?: number;
  stroke?: number;
}) {
  const running = startedAt !== null;
  const progress = useMotionValue(1);
  const [left, setLeft] = useState(seconds);
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (startedAt === null) {
      progress.set(1);
      return;
    }
    expired.current = false;
    let raf = 0;
    const tick = () => {
      const remaining = Math.max(0, seconds - (Date.now() - startedAt) / 1000);
      progress.set(remaining / seconds);
      setLeft(Math.ceil(remaining));
      if (remaining <= 0) {
        if (!expired.current) {
          expired.current = true;
          onExpireRef.current?.();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startedAt, seconds, progress]);

  const shown = running ? left : seconds;
  const tone = !running ? 'ac' : shown === 0 ? 'ko' : shown <= 15 ? 'wa' : 'ac';
  // L'anneau est en retrait des graduations, comme sur le cadran de la maquette.
  const r = size / 2 - stroke / 2 - 18;

  return (
    <div className={s.dial} style={{ width: size, height: size }} role={running ? 'timer' : undefined} aria-label={running ? label : undefined}>
      <span className={s.ticks} aria-hidden="true" />
      <svg className={s.ring} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className={s.track} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <motion.circle className={cn(s.fill, s[tone])} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} style={{ pathLength: progress }} />
      </svg>
      {running ? (
        <div className={s.center}>
          <span className={cn(s.digits, 'num', s[`tx-${tone}`])} aria-hidden="true">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={shown}
                className={s.digit}
                initial={{ y: '45%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-45%', opacity: 0 }}
                transition={{ duration: dur.s, ease: ease.out }}
              >
                {fmt(shown)}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="sr-only" aria-live="polite">
            {shown === 0 ? timeUpLabel : shown % 15 === 0 ? fmt(shown) : ''}
          </span>
          <AnimatePresence>
            {shown === 0 && (
              <motion.span className={s.timeUp} initial={{ opacity: 0, y: 6, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring.snappy}>
                {timeUpLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className={s.center}>{idle}</div>
      )}
    </div>
  );
}
