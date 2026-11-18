
import { X } from 'lucide-react';
import { Dialog as D } from 'radix-ui';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import s from './Dialog.module.css';

/**
 * Fenêtre modale : focus piégé et rendu à la fermeture, Échap et clic extérieur ferment.
 *
 * <Dialog open={o} onOpenChange={setO} title="…" description="…" footer={<Button>…</Button>}>…</Dialog>
 * Sans `open`, passer un déclencheur : <Dialog trigger={<Button>Ouvrir</Button>} …>
 */
export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  hideTitle,
  footer,
  width = 560,
  closeLabel = 'Fermer',
  className,
  bodyClassName,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Titre lu par les lecteurs d'écran mais masqué (le contenu porte déjà son titre). */
  hideTitle?: boolean;
  footer?: ReactNode;
  width?: number;
  closeLabel?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <D.Trigger asChild>{trigger}</D.Trigger>}
      <D.Portal>
        <D.Overlay className={s.overlay} />
        <D.Content className={cn(s.content, className)} style={{ '--w': `${width}px` } as CSSProperties} {...(description ? {} : { 'aria-describedby': undefined })}>
          <div className={s.head}>
            <div className={cn(s.titles, hideTitle && 'sr-only')}>
              <D.Title className={s.title}>{title}</D.Title>
              {description ? <D.Description className={s.desc}>{description}</D.Description> : null}
            </div>
            {hideTitle && <span style={{ flex: 1 }} />}
            <D.Close asChild>
              <Button variant="ghost" size="s" iconOnly aria-label={closeLabel}>
                <X aria-hidden="true" />
              </Button>
            </D.Close>
          </div>
          <div className={cn(s.body, bodyClassName)}>{children}</div>
          {footer && <div className={s.foot}>{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/** Tiroir latéral : même comportement que `Dialog`, glisse depuis la droite. */
export function Drawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  width = 480,
  closeLabel = 'Fermer',
  className,
  onOpenAutoFocus,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  width?: number;
  closeLabel?: string;
  className?: string;
  /** Où va le focus à l'ouverture (par défaut : le premier élément focalisable). */
  onOpenAutoFocus?: (e: Event) => void;
  children: ReactNode;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <D.Trigger asChild>{trigger}</D.Trigger>}
      <D.Portal>
        <D.Overlay className={s.overlay} />
        <D.Content className={cn(s.drawer, className)} style={{ '--w': `${width}px` } as CSSProperties} onOpenAutoFocus={onOpenAutoFocus} {...(description ? {} : { 'aria-describedby': undefined })}>
          <div className={s.head}>
            <div className={s.titles}>
              <D.Title className={s.title}>{title}</D.Title>
              {description ? <D.Description className={s.desc}>{description}</D.Description> : null}
            </div>
            <D.Close asChild>
              <Button variant="ghost" size="s" iconOnly aria-label={closeLabel}>
                <X aria-hidden="true" />
              </Button>
            </D.Close>
          </div>
          <div className={s.body}>{children}</div>
          {footer && <div className={s.foot}>{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export const DialogClose = D.Close;
