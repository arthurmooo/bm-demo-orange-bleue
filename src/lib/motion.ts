import type { Transition, Variants } from 'motion/react';

/** Courbes et durées partagées. Mêmes valeurs que les variables CSS de tokens.css. */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  emph: [0.2, 0, 0, 1],
} as const;

export const dur = { xs: 0.12, s: 0.18, m: 0.24, l: 0.36, xl: 0.6 } as const;

/** Écart entre deux éléments d'une liste qui apparaissent l'un après l'autre (secondes). */
export const STAGGER = 0.04;

/** Transitions en durée : `tween.m` pour un changement d'état, `tween.l` pour une arrivée. */
export const tween = {
  xs: { duration: dur.xs, ease: ease.out },
  s: { duration: dur.s, ease: ease.out },
  m: { duration: dur.m, ease: ease.out },
  l: { duration: dur.l, ease: ease.out },
  /** Graphe ou anneau qui se dessine. */
  draw: { duration: dur.xl, ease: ease.out },
  /** Sortie : courte et sans élan. */
  exit: { duration: dur.xs, ease: ease.inOut },
} as const satisfies Record<string, Transition>;

/** Ressorts : « snappy » pour les contrôles, « soft » pour les panneaux et les remplissages, « bouncy » pour les retours tactiles. */
export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 },
  soft: { type: 'spring', stiffness: 260, damping: 30, mass: 1 },
  bouncy: { type: 'spring', stiffness: 560, damping: 20, mass: 0.7 },
  layout: { type: 'spring', stiffness: 420, damping: 36, mass: 0.9 },
} as const satisfies Record<string, Transition>;

/** Apparition d'un bloc : léger glissement vers le haut et fondu. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: tween.l },
};

/** Élément `i` d'une liste qui apparaît en décalé, après `delay` secondes. */
export const rise = (i = 0, delay = 0) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { ...tween.l, delay: delay + i * STAGGER },
});

/** Conteneur qui échelonne l'apparition de ses enfants. */
export const stagger = (gap = STAGGER, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** Bloc qui se déplie et se replie (hauteur animée), à poser sous `AnimatePresence`. */
export const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1, transition: { height: tween.m, opacity: { ...tween.m, delay: 0.04 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: dur.m, ease: ease.inOut }, opacity: tween.exit } },
} as const;

/** Menus, popovers, infobulles : partent de leur point d'ancrage. */
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.snappy },
  exit: { opacity: 0, scale: 0.98, y: -2, transition: tween.exit },
};

/** Retour d'appui (mêmes valeurs que --tap, --tap-icon et --tap-lg). */
export const press = { scale: 0.97 } as const;
export const pressIcon = { scale: 0.94 } as const;
export const pressLarge = { scale: 0.985 } as const;
