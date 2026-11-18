
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Accordion as A } from 'radix-ui';
import { useEffect, useRef, type ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import s from './Accordion.module.css';

/**
 * Accordéon : la hauteur s'anime à l'ouverture et à la fermeture.
 * Le déclencheur n'impose aucune mise en page (ligne de tableau, en-tête de section…) ;
 * `AccordionChevron` tourne tout seul quand l'élément s'ouvre.
 *
 * <Accordion type="multiple" defaultValue={['a']}>
 *   <AccordionItem value="a">
 *     <AccordionHeader><AccordionTrigger className={…}><AccordionChevron />Titre</AccordionTrigger></AccordionHeader>
 *     <AccordionContent>…</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
export function Accordion(props: ComponentProps<typeof A.Root>) {
  // Les hauteurs ne s'animent qu'une fois hydraté : sans quoi un élément ouvert au chargement
  // rejouerait son ouverture au premier affichage et pousserait la page vers le bas.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.setAttribute('data-ready', '');
  }, []);
  return <A.Root ref={ref} {...props} />;
}

export const AccordionItem = A.Item;

export function AccordionHeader({ className, ...rest }: ComponentProps<typeof A.Header>) {
  return <A.Header className={className} style={{ margin: 0, font: 'inherit' }} {...rest} />;
}

export function AccordionTrigger({ className, ...rest }: ComponentProps<typeof A.Trigger>) {
  return <A.Trigger className={cn(s.trigger, className)} {...rest} />;
}

/** Chevron qui tourne à l'ouverture : vers la droite puis le bas (`right`), ou vers le bas puis le haut (`down`). */
export function AccordionChevron({ direction = 'right', className }: { direction?: 'right' | 'down'; className?: string }) {
  const Icon = direction === 'right' ? ChevronRight : ChevronDown;
  return <Icon aria-hidden="true" className={cn(s.chevron, s[direction], className)} />;
}

export function AccordionContent({ className, children, ...rest }: ComponentProps<typeof A.Content>) {
  return (
    <A.Content className={cn(s.content, className)} {...rest}>
      <div className={s.inner}>{children}</div>
    </A.Content>
  );
}
