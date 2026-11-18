
import { Tooltip as T } from 'radix-ui';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './Tooltip.module.css';

/** À poser une fois dans la coque de l'espace. */
export function TooltipProvider({ children, delay = 260 }: { children: ReactNode; delay?: number }) {
  return (
    <T.Provider delayDuration={delay} skipDelayDuration={240}>
      {children}
    </T.Provider>
  );
}

/**
 * Infobulle maison (remplace l'attribut `title`). L'enfant doit pouvoir recevoir
 * le focus pour que l'infobulle s'ouvre aussi au clavier.
 *
 * <Tooltip content="Printemps 2026 : 78/100"><span tabIndex={0}>…</span></Tooltip>
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  className,
  disabled,
}: {
  content: ReactNode;
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
  disabled?: boolean;
}) {
  if (disabled || content === null || content === undefined || content === '') return children;
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} align={align} sideOffset={sideOffset} collisionPadding={10} className={cn(s.content, className)}>
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
