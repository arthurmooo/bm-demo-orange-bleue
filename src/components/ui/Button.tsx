import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './Button.module.css';

type Variant = 'secondary' | 'primary' | 'blue' | 'danger' | 'ghost';
type Size = 's' | 'm' | 'l' | 'touch';

type Common = {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  /** Bouton qui ne contient qu'une icône : `aria-label` obligatoire. */
  iconOnly?: boolean;
  children?: ReactNode;
};

function classes({ variant = 'secondary', size = 'm', full, loading, iconOnly }: Common, extra?: string) {
  return cn(
    s.btn,
    variant !== 'secondary' && s[variant],
    size !== 'm' && s[size],
    full && s.full,
    loading && s.loading,
    iconOnly && s.iconOnly,
    extra,
  );
}

/** Bouton de l'interface. Un seul `primary` par écran ou panneau, avec un verbe et son objet. */
export function Button({ variant, size, full, loading, iconOnly, className, children, type = 'button', ...rest }: Common & ComponentProps<'button'>) {
  return (
    <button type={type} className={classes({ variant, size, full, loading, iconOnly }, className)} aria-busy={loading || undefined} {...rest}>
      {children}
      {loading && <span className={s.spinner} aria-hidden="true" />}
    </button>
  );
}

/** Lien qui a l'apparence d'un bouton (navigation entre écrans). */
export function ButtonLink({ variant, size, full, iconOnly, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={classes({ variant, size, full, iconOnly }, className)} {...rest}>
      {children}
    </Link>
  );
}
