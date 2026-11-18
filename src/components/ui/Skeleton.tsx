import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import s from './Skeleton.module.css';

/** Bloc de chargement qui scintille. Prend la place exacte du contenu attendu : aucun saut à l'arrivée. */
export function Skeleton({
  width,
  height,
  radius,
  shape = 'block',
  className,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  shape?: 'block' | 'circle' | 'text';
  className?: string;
  style?: CSSProperties;
}) {
  return <span aria-hidden="true" className={cn(s.sk, shape !== 'block' && s[shape], className)} style={{ width, height, borderRadius: radius, ...style }} />;
}
