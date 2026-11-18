
import { X } from 'lucide-react';
import { AnimatePresence, motion, useDragControls, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { Dialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { dur, ease, spring } from '@/lib/motion';
import s from './BottomSheet.module.css';

/**
 * Feuille du bas (Radix Dialog pour le focus et Échap, motion pour le geste).
 * On la ferme en la glissant vers le bas depuis la poignée ou l'en-tête :
 * au-delà de 120 px, ou d'un geste rapide, elle se ferme ; sinon elle revient.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  closeLabel,
  children,
  footer,
  tall,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: ReactNode;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Occupe presque toute la hauteur (formulaire). */
  tall?: boolean;
}) {
  const controls = useDragControls();
  const y = useMotionValue<number | string>(0);
  // Le voile s'éclaircit pendant le geste. Pendant l'entrée, `y` vaut « 100% » : on ignore.
  const scrim = useTransform(y, (v: number | string) => (typeof v === 'number' ? 1 - Math.min(1, Math.max(0, v) / 500) : 1));

  const end = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className={s.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.m, ease: ease.out }}>
                <motion.span className={s.scrimFill} style={{ opacity: scrim }} />
              </motion.div>
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => {
                // Le focus va à la feuille elle-même, pas au bouton Fermer (pas d'anneau parasite à l'ouverture).
                e.preventDefault();
                (e.currentTarget as HTMLElement | null)?.focus();
              }}
            >
              <motion.section
                className={cn(s.sheet, tall && s.tall)}
                tabIndex={-1}
                style={{ y }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%', transition: { duration: dur.l, ease: ease.emph } }}
                transition={spring.soft}
                drag="y"
                dragControls={controls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.04, bottom: 0.9 }}
                onDragEnd={end}
              >
                <div className={s.handle} onPointerDown={(e) => controls.start(e)}>
                  <span className={s.grab} aria-hidden="true" />
                  <div className={s.head}>
                    <Dialog.Title className={s.title}>{title}</Dialog.Title>
                    <Dialog.Close className={s.close} aria-label={closeLabel}>
                      <X aria-hidden="true" />
                    </Dialog.Close>
                  </div>
                </div>
                <div className={s.body}>{children}</div>
                {footer && <div className={s.foot}>{footer}</div>}
              </motion.section>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
