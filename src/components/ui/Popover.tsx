
import { Popover as P } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import s from './Popover.module.css';

/**
 * Popover : panneau ancré à son déclencheur, qui naît de lui.
 *
 * <Popover>
 *   <PopoverTrigger asChild><Button>…</Button></PopoverTrigger>
 *   <PopoverContent align="end">…</PopoverContent>
 * </Popover>
 */
export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;
export const PopoverClose = P.Close;
export const PopoverAnchor = P.Anchor;

export function PopoverContent({ className, sideOffset = 8, collisionPadding = 12, children, ...rest }: ComponentProps<typeof P.Content>) {
  return (
    <P.Portal>
      <P.Content sideOffset={sideOffset} collisionPadding={collisionPadding} className={cn(s.content, className)} {...rest}>
        {children}
      </P.Content>
    </P.Portal>
  );
}
