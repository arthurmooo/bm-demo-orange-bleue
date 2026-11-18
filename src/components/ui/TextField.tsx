
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './TextField.module.css';

/**
 * Champ texte d'une ligne. Texte à 16 px (pas de zoom iOS), 48 px de haut,
 * libellé au-dessus, suffixe d'unité facultatif.
 */
export function TextField({
  label,
  hint,
  suffix,
  error,
  className,
  id,
  ...rest
}: Omit<ComponentProps<'input'>, 'size'> & { label?: ReactNode; hint?: ReactNode; suffix?: ReactNode; error?: ReactNode }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <span className={cn(s.field, className)}>
      {label && (
        <label className={s.label} htmlFor={fid}>
          {label}
        </label>
      )}
      <span className={cn(s.box, error ? s.err : undefined)}>
        <input id={fid} className={s.input} aria-invalid={error ? true : undefined} {...rest} />
        {suffix && <span className={s.suffix}>{suffix}</span>}
      </span>
      {error ? <span className={s.error}>{error}</span> : hint ? <span className={s.hint}>{hint}</span> : null}
    </span>
  );
}
