
import { motion, useAnimationControls } from 'motion/react';
import { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { dur, ease, spring } from '@/lib/motion';
import s from './CodeInput.module.css';

/**
 * Code à usage unique en cases (6 par défaut). Un seul vrai champ sous les cases :
 * le collage, le remplissage automatique (« one-time-code ») et la touche Effacer
 * marchent comme d'habitude ; la case suivante s'active à chaque chiffre.
 * `errorKey` change à chaque code refusé : les cases tremblent.
 */
export const CodeInput = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (v: string) => void;
    length?: number;
    label: string;
    state?: 'idle' | 'busy' | 'error' | 'ok';
    errorKey?: number;
    disabled?: boolean;
    autoFocus?: boolean;
    describedBy?: string;
  }
>(function CodeInput({ value, onChange, length = 6, label, state = 'idle', errorKey = 0, disabled, autoFocus, describedBy }, ref) {
  const [focused, setFocused] = useState(false);
  const shake = useAnimationControls();

  useEffect(() => {
    if (errorKey > 0) void shake.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: dur.l, ease: ease.out } });
  }, [errorKey, shake]);

  return (
    <motion.div className={cn(s.wrap, s[state])} animate={shake}>
      <input
        ref={ref}
        className={s.input}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // Le curseur reste en fin de saisie : on ne modifie pas un chiffre au milieu.
        onSelect={(e) => {
          const el = e.currentTarget;
          if (el.selectionStart !== el.value.length) el.setSelectionRange(el.value.length, el.value.length);
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        aria-label={label}
        aria-invalid={state === 'error' || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        autoFocus={autoFocus}
        spellCheck={false}
      />
      <div className={s.boxes} style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length }, (_, i) => {
          const digit = value[i];
          const current = focused && !disabled && (i === value.length || (value.length === length && i === length - 1));
          return (
            <span key={i} className={cn(s.box, digit && s.filled, current && s.cur)}>
              {digit ? (
                <motion.span key={digit + i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.bouncy}>
                  {digit}
                </motion.span>
              ) : current ? (
                <span className={s.caret} />
              ) : null}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
});
