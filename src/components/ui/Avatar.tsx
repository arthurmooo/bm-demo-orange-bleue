import { cn } from '@/lib/cn';
import s from './Avatar.module.css';

export type Role = 'ms' | 'staff' | 'me' | 'brand';

/** Avatar à initiales, teinté selon le rôle (identité uniquement, jamais un statut). */
export function Avatar({ initials, role, size = 28, title, className }: { initials: string; role: Role; size?: number; title?: string; className?: string }) {
  return (
    <span
      className={cn(s.av, s[role], className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.39) }}
      aria-label={title}
      role={title ? 'img' : undefined}
    >
      {initials}
    </span>
  );
}
