
import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { RadioGroup } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import s from './RadioCard.module.css';

export type RadioOption = {
  value: string;
  label: string;
  sub?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

/**
 * Choix unique en cartes tactiles (Radix RadioGroup restylé).
 * - `row` : ligne avec pastille radio (oui/non, perception), ou avec l'icône de l'option si elle en a une ;
 * - `tile` : tuile avec icône et coche (capacités) ;
 * - `chip` : pastille arrondie avec icône (types de problème).
 * Flèches du clavier pour changer de choix.
 */
export function RadioCards({
  value,
  onChange,
  options,
  variant = 'row',
  columns,
  labelledBy,
  className,
}: {
  value: string | null;
  onChange: (v: string) => void;
  options: RadioOption[];
  variant?: 'row' | 'tile' | 'chip';
  columns?: number;
  labelledBy?: string;
  className?: string;
}) {
  return (
    <RadioGroup.Root
      className={cn(s.group, s[`g-${variant}`], columns && s.cols, className)}
      style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      value={value ?? ''}
      onValueChange={onChange}
      aria-labelledby={labelledBy}
    >
      {options.map((o) => {
        const on = value === o.value;
        return (
          <RadioGroup.Item key={o.value} value={o.value} disabled={o.disabled} className={cn(s.item, s[variant], on && s.on)}>
            {variant === 'row' && !o.icon && (
              <span className={s.radio} aria-hidden="true">
                <motion.span className={s.dot} initial={false} animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={spring.bouncy} />
              </span>
            )}
            {variant === 'tile' && (
              <span className={s.tick} aria-hidden="true">
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span className={s.tickOn} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={spring.bouncy}>
                      <Check strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            )}
            {o.icon && <span className={s.icon}>{o.icon}</span>}
            <span className={s.text}>
              <span className={s.label}>{o.label}</span>
              {o.sub && <span className={s.sub}>{o.sub}</span>}
            </span>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
