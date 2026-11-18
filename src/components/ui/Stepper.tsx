
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import s from './Stepper.module.css';

export type Step = {
  key: string;
  /** done : fait · cur : en cours · wait : chez quelqu'un d'autre · lock : verrouillé · todo : à venir. */
  state: 'done' | 'cur' | 'wait' | 'lock' | 'todo';
  /** Contenu du rond : icône ou numéro. */
  marker: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  /** Élément à droite du titre (pastille « Maintenant »). */
  aside?: ReactNode;
  /** Bloc sous le texte (« Vérification du panier par SaferBuy »). */
  extra?: ReactNode;
};

/** Frise verticale d'étapes. Le trait se colore jusqu'à l'étape en cours. */
export function Stepper({ steps, className, label }: { steps: Step[]; className?: string; label?: string }) {
  return (
    <ol className={cn(s.list, className)} aria-label={label}>
      {steps.map((st) => (
        <li key={st.key} className={cn(s.step, s[st.state])} aria-current={st.state === 'cur' ? 'step' : undefined}>
          <motion.span className={s.dot} layout="position" initial={false} animate={{ scale: st.state === 'cur' ? 1 : 0.96 }} transition={spring.snappy}>
            {st.marker}
          </motion.span>
          <span className={s.body}>
            <span className={s.head}>
              <b className={s.title}>{st.title}</b>
              {st.aside}
            </span>
            {st.sub && <span className={s.sub}>{st.sub}</span>}
            {st.extra}
          </span>
        </li>
      ))}
    </ol>
  );
}
