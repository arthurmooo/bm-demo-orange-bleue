
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import s from './ProgressBar.module.css';

type Tone = 'ac' | 'good' | 'ko';

/**
 * Barre de progression fine. Le remplissage glisse sur ressort (transform seul).
 * `value` va de 0 à 100.
 */
export function ProgressBar({ value, tone = 'ac', label, className }: { value: number; tone?: Tone; label?: string; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className={cn(s.bar, className)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)}>
      <motion.span className={cn(s.fill, s[tone])} initial={false} animate={{ scaleX: v / 100 }} transition={spring.soft} />
    </span>
  );
}

export type TrackSegment = {
  /** Poids du segment (nombre de questions de la section). */
  weight: number;
  /** Part faite, de 0 à 1. */
  done: number;
  current?: boolean;
  label: string;
};

/**
 * Piste segmentée (une case par section), comme l'en-tête du formulaire.
 * Chaque segment se remplit sur ressort quand une question est enregistrée.
 */
export function ProgressTrack({ segments, label, className }: { segments: TrackSegment[]; label: string; className?: string }) {
  const total = segments.reduce((n, x) => n + x.weight, 0);
  const done = segments.reduce((n, x) => n + x.done * x.weight, 0);
  return (
    <span className={cn(s.track, className)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.round(done)}>
      {segments.map((seg, i) => (
        <span key={i} className={cn(s.seg, seg.current && s.cur)} style={{ flexGrow: seg.weight }} aria-hidden="true">
          <motion.span className={s.segFill} initial={false} animate={{ scaleX: seg.done }} transition={spring.soft} />
        </span>
      ))}
    </span>
  );
}
