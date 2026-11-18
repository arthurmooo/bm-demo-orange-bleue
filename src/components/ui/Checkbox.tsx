
import { AnimatePresence, motion } from 'motion/react';
import { Checkbox as R } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { spring, tween } from '@/lib/motion';
import s from './Checkbox.module.css';

const Tick = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={s.svg}>
    <motion.path d="M5 12.5 10 17.5 19 7" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={tween.m} />
  </svg>
);

/** Case à cocher restylée (Radix), coche qui se trace. */
export function Checkbox({ checked, onChange, label, disabled, className }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; disabled?: boolean; className?: string }) {
  return (
    <label className={cn(s.row, disabled && s.disabled, className)}>
      <R.Root className={cn(s.box, checked && s.on)} checked={checked} onCheckedChange={(v) => onChange(v === true)} disabled={disabled}>
        <Tick on={checked} />
      </R.Root>
      <span className={s.label}>{label}</span>
    </label>
  );
}

/**
 * Pastille à cocher (choix multiples sur une ligne), avec une coche en badge.
 * Exemple : catégories d'écart couleur / taille / matière / finition.
 */
export function CheckChip({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <R.Root className={cn(s.chip, checked && s.chipOn)} checked={checked} onCheckedChange={(v) => onChange(v === true)} disabled={disabled}>
      <span className={s.chipLabel}>{label}</span>
      <AnimatePresence initial={false}>
        {checked && (
          <motion.span className={s.badge} aria-hidden="true" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={spring.bouncy}>
            <Tick on />
          </motion.span>
        )}
      </AnimatePresence>
    </R.Root>
  );
}
