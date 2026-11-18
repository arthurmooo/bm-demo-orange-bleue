
import { motion } from 'motion/react';
import { ToggleGroup } from 'radix-ui';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import s from './Segmented.module.css';

export type SegmentedItem<T extends string> = { value: T; label: ReactNode; count?: ReactNode; disabled?: boolean; 'aria-label'?: string };

/**
 * Contrôle segmenté : un choix exclusif toujours renseigné, pastille qui glisse.
 * Flèches gauche et droite pour passer d'une option à l'autre.
 */
export function Segmented<T extends string>({
  value,
  onValueChange,
  items,
  size = 'm',
  full,
  className,
  'aria-label': ariaLabel,
}: {
  value: T;
  onValueChange: (v: T) => void;
  items: SegmentedItem<T>[];
  size?: 's' | 'm';
  full?: boolean;
  className?: string;
  'aria-label': string;
}) {
  const id = useId();
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      aria-label={ariaLabel}
      className={cn(s.root, size === 's' && s.s, full && s.full, className)}
    >
      {items.map((it) => (
        <ToggleGroup.Item key={it.value} value={it.value} disabled={it.disabled} aria-label={it['aria-label']} className={s.item}>
          {it.value === value && <motion.span layoutId={`seg-${id}`} className={s.pill} transition={spring.snappy} aria-hidden="true" />}
          {it.label}
          {it.count !== undefined && <span className={s.count}>{it.count}</span>}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
