import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import s from './Card.module.css';

/** Carte blanche à bord fin. Une carte répond à une question : son titre énonce la réponse. */
export function Card({ className, interactive, ...rest }: ComponentProps<'section'> & { interactive?: boolean }) {
  return <section className={cn(s.card, interactive && s.interactive, className)} {...rest} />;
}

export function CardHeader({ className, ...rest }: ComponentProps<'header'>) {
  return <header className={cn(s.head, className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: ComponentProps<'h2'>) {
  return <h2 className={cn(s.title, className)} {...rest} />;
}
