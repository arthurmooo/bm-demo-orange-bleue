
import { Switch as R } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './Switch.module.css';

/** Interrupteur restylé (Radix). La pastille glisse sur ressort. */
export function Switch({ checked, onChange, label, sub, disabled, className }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; sub?: ReactNode; disabled?: boolean; className?: string }) {
  return (
    <label className={cn(s.row, disabled && s.disabled, className)}>
      <span className={s.text}>
        <span className={s.label}>{label}</span>
        {sub && <span className={s.sub}>{sub}</span>}
      </span>
      <R.Root className={s.switch} checked={checked} onCheckedChange={onChange} disabled={disabled}>
        <R.Thumb className={s.thumb} />
      </R.Root>
    </label>
  );
}
