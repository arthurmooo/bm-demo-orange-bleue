import { Slot } from 'radix-ui';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './Table.module.css';

type Align = 'start' | 'center' | 'end';

/**
 * Tableau encadré à en-tête teinté. Les colonnes sont une grille CSS commune à toutes les lignes.
 * `footer` se place sous le tableau, dans le cadre (message de confirmation, pagination).
 *
 * <Table columns="minmax(0,1fr) 140px 120px" aria-label="Frictions graves">
 *   <TableHead><TableHeadCell>Friction</TableHeadCell>…</TableHead>
 *   <TableBody><TableRow><TableCell>…</TableCell></TableRow></TableBody>
 * </Table>
 */
export function Table({ columns, gap, className, style, footer, children, ...rest }: ComponentProps<'div'> & { columns: string; gap?: number; footer?: ReactNode }) {
  return (
    <div className={cn(s.frame, className)} style={{ ...style, '--cols': columns, ...(gap !== undefined && { '--gap': `${gap}px` }) } as CSSProperties}>
      <div role="table" {...rest}>
        {children}
      </div>
      {footer}
    </div>
  );
}

export function TableHead({ className, children, ...rest }: ComponentProps<'div'>) {
  return (
    <div role="rowgroup">
      <div role="row" className={cn(s.row, s.head, className)} {...rest}>
        {children}
      </div>
    </div>
  );
}

export function TableHeadCell({ align = 'start', className, ...rest }: ComponentProps<'span'> & { align?: Align }) {
  return <span role="columnheader" className={cn(s.hcell, align !== 'start' && s[align], className)} {...rest} />;
}

export function TableBody({ className, ...rest }: ComponentProps<'div'>) {
  return <div role="rowgroup" className={cn(s.body, className)} {...rest} />;
}

/** Ligne. `asChild` pour en faire un bouton (ligne dépliable) ; `hoverable` pour un survol sans action. */
export function TableRow({ asChild, hoverable = true, interactive, className, ...rest }: ComponentProps<'div'> & { asChild?: boolean; hoverable?: boolean; interactive?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div';
  return <Comp role={asChild ? undefined : 'row'} className={cn(s.row, hoverable && s.hoverable, interactive && s.interactive, className)} {...rest} />;
}

export function TableCell({ align = 'start', className, ...rest }: ComponentProps<'span'> & { align?: Align }) {
  return <span role="cell" className={cn(s.cell, align !== 'start' && s[align], className)} {...rest} />;
}
