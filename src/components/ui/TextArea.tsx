
import { Check } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './TextArea.module.css';

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** Minimum de caractères : affiche un compteur orange, puis vert une fois atteint. */
  minChars?: number;
  /** Bordure rouge pendant une dictée. */
  recording?: boolean;
  /** Zone gauche de la barre d'outils (remplace le compteur). */
  status?: ReactNode;
  /** Zone droite de la barre d'outils (micro, etc.). */
  tools?: ReactNode;
  labelledBy?: string;
  id?: string;
  placeholder?: string;
  minHeight?: number;
  counterTip?: string;
  autoFocus?: boolean;
};

/**
 * Zone de texte à 16 px avec barre d'outils intégrée (compteur, micro).
 * Elle grandit avec son contenu.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, Props>(function TextArea(
  { value, onChange, minChars, recording, status, tools, labelledBy, id, placeholder, minHeight = 104, counterTip, autoFocus },
  ref,
) {
  const len = value.length;
  const ok = minChars ? len >= minChars : false;
  return (
    <div className={cn(s.box, recording && s.rec)}>
      <textarea
        ref={ref}
        id={id}
        className={s.txa}
        style={{ minHeight }}
        value={value}
        placeholder={placeholder}
        aria-labelledby={labelledBy}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
      />
      {(status || tools || minChars) && (
        <div className={s.bar}>
          <span className={s.left}>
            {status ??
              (minChars ? (
                <span className={cn(s.count, 'num', ok && s.ok)} aria-label={counterTip ? `${len}/${minChars} · ${counterTip}` : undefined}>
                  {ok && <Check aria-hidden="true" />}
                  {len}/{minChars}
                </span>
              ) : null)}
          </span>
          {tools}
        </div>
      )}
    </div>
  );
});
