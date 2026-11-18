import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { scoreTone, type DeltaSense } from '@/lib/data/core';
import s from './Badge.module.css';

export type TagTone = 'ai' | 'blue' | 'red' | 'green' | 'teal' | 'amber' | 'gray';

/** Tag coloré par type d'objet (checkout, précision IA, friction…). */
export function Tag({ tone = 'gray', icon, children, className }: { tone?: TagTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn(s.tag, s[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

export type PillTone = 'red' | 'amber' | 'blue' | 'green' | 'gray';

/** Pastille d'état (arrondie) : un mot, souvent une icône, jamais la couleur seule. */
export function Pill({ tone = 'gray', icon, children, className }: { tone?: PillTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn(s.pill, s[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/**
 * Évolution d'un KPI. `direction` dit si la valeur monte ou descend ;
 * `sense` dit si c'est favorable (vert), défavorable (rouge) ou neutre (orange).
 */
export function Delta({ direction, sense, children }: { direction: 'up' | 'down' | 'flat'; sense: DeltaSense; children: ReactNode }) {
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;
  return (
    <span className={cn(s.delta, s[sense])}>
      <Icon aria-hidden="true" />
      {children}
    </span>
  );
}

/** Code court (pays, commande) sur fond gris ; `on` le passe en marine (onglet actif). */
export function Code({ on, className, ...rest }: ComponentProps<'span'> & { on?: boolean }) {
  return <span className={cn(s.code, on && s.codeOn, className)} {...rest} />;
}

/** Pastille de score /100, colorée selon les seuils (≥ 80, 70–79, < 70). */
export function ScorePill({ value, className }: { value: number; className?: string }) {
  return <span className={cn(s.score, s[scoreTone(value)], className)}>{value}</span>;
}
