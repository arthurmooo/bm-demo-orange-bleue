
import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { dur, ease, spring } from '@/lib/motion';
import { Tooltip } from './Tooltip';
import s from './NavRail.module.css';

export type NavRailItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  current?: boolean;
  /** Compteur sur l'icône (décisions, messages non lus). */
  badge?: number;
};

export type NavRailExtra = {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Entrée visible mais inactive (« bientôt »). */
  disabled?: boolean;
  /** Entrée qui mène à un écran (Réglages) : un lien au lieu d'un bouton. */
  href?: string;
  current?: boolean;
};

/** Contour fermé : la seule colonne d'icônes. Ouvert : tout le panneau, avec la marge de son ombre. */
const CLOSED = 'inset(0px calc(100% - 64px) 0px 0px round 20px)';
const OPEN = 'inset(-60px -60px -60px -60px round 0px)';

/**
 * Rail de navigation repliable, commun aux espaces (marque, cockpit).
 * Replié, il montre les icônes avec leur infobulle ; déplié, il passe par-dessus la page (sans la décaler)
 * et montre les libellés. Il se replie au choix d'une entrée, avec Échap ou au clic en dehors.
 *
 * <NavRail label="Navigation" logo={<Logo />} items={items} expandLabel="Déplier" collapseLabel="Replier" />
 */
export function NavRail({
  label,
  logo,
  items,
  extras = [],
  bottom = [],
  footer,
  expandLabel,
  collapseLabel,
}: {
  label: string;
  logo: ReactNode;
  items: NavRailItem[];
  /** Entrées après le séparateur. */
  extras?: NavRailExtra[];
  /** Entrées en bas du rail, au-dessus du bouton de dépliage (Réglages). */
  bottom?: NavRailExtra[];
  /** Bas du rail (avatar…) ; reçoit l'état déplié pour montrer un libellé. */
  footer?: (open: boolean) => ReactNode;
  expandLabel: string;
  collapseLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const close = (focusToggle: boolean) => {
    setOpen(false);
    if (focusToggle) toggle.current?.focus();
  };

  const transition = reduce ? { duration: 0 } : { duration: dur.m, ease: open ? ease.out : ease.inOut };
  const fade = (i: number) => ({
    initial: false as const,
    animate: open ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 },
    transition: reduce ? { duration: 0 } : open ? { duration: dur.m, ease: ease.out, delay: 0.06 + i * 0.02 } : { duration: dur.xs },
  });
  const tip = (text: string) => (open ? null : text);
  const badge = (n?: number) =>
    n ? (
      <motion.span
        key={n}
        className={s.badge}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring.snappy}
        aria-hidden="true"
      >
        {n}
      </motion.span>
    ) : null;
  /** Entrée secondaire ; `i` est son rang dans le rail, pour décaler l'apparition du libellé. */
  const renderExtra = (x: NavRailExtra, i: number) => {
    const inner = (
      <>
        <span className={s.ic}>
          {x.current && <motion.span layoutId={`${id}-on`} className={s.on} transition={spring.layout} aria-hidden="true" />}
          <x.icon aria-hidden="true" />
        </span>
        <motion.span className={s.lb} {...fade(i)}>
          {x.label}
        </motion.span>
      </>
    );
    return (
      <Tooltip key={x.key} content={tip(x.label)} side="right" sideOffset={10}>
        {x.href && !x.disabled ? (
          <Link
            href={x.href}
            className={s.item}
            aria-label={open ? undefined : x.label}
            aria-current={x.current ? 'page' : undefined}
            onClick={() => close(false)}
          >
            {inner}
          </Link>
        ) : (
          <button type="button" className={cn(s.item, x.disabled && s.soon)} aria-disabled={x.disabled || undefined} aria-label={open ? undefined : x.label}>
            {inner}
          </button>
        )}
      </Tooltip>
    );
  };
  const named = (label: string, n?: number) => (n ? `${label} · ${n}` : label);

  return (
    <nav className={s.rail} aria-label={label}>
      <motion.div
        ref={panel}
        id={id}
        className={cn(s.panel, open && s.open)}
        initial={false}
        animate={{ clipPath: open ? OPEN : CLOSED }}
        transition={transition}
      >
        <div className={s.logo}>{logo}</div>

        {items.map((it, i) => (
          <Tooltip key={it.href} content={tip(it.label)} side="right" sideOffset={10}>
            <Link
              ref={i === 0 ? first : undefined}
              href={it.href}
              className={s.item}
              aria-label={open ? (it.badge ? named(it.label, it.badge) : undefined) : named(it.label, it.badge)}
              aria-current={it.current ? 'page' : undefined}
              onClick={() => close(false)}
            >
              <span className={s.ic}>
                {it.current && <motion.span layoutId={`${id}-on`} className={s.on} transition={spring.layout} aria-hidden="true" />}
                <it.icon aria-hidden="true" />
                {badge(it.badge)}
              </span>
              <motion.span className={s.lb} {...fade(i)}>
                {it.label}
              </motion.span>
            </Link>
          </Tooltip>
        ))}

        {extras.length > 0 && <span className={s.sep} aria-hidden="true" />}
        {extras.map((x, i) => renderExtra(x, items.length + i))}

        <span className={s.grow} />

        {bottom.map((x, i) => renderExtra(x, items.length + extras.length + i))}

        <Tooltip content={open ? collapseLabel : expandLabel} side="right" sideOffset={10}>
          <button
            ref={toggle}
            type="button"
            className={s.item}
            aria-expanded={open}
            aria-controls={id}
            aria-label={open ? collapseLabel : expandLabel}
            onClick={() => (open ? close(true) : setOpen(true))}
          >
            <span className={s.ic}>{open ? <PanelLeftClose aria-hidden="true" /> : <PanelLeftOpen aria-hidden="true" />}</span>
          </button>
        </Tooltip>

        {footer && <div className={s.foot}>{footer(open)}</div>}
      </motion.div>
    </nav>
  );
}
