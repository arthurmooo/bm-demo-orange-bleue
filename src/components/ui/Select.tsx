
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Select as S } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './Select.module.css';

export type SelectOption<T extends string = string> = { value: T; label: ReactNode; sub?: ReactNode; disabled?: boolean; group?: string };

/**
 * Liste de choix maison (jamais le `<select>` du navigateur) : clavier, saisie rapide,
 * ouverture qui naît du déclencheur, coche sur l'option choisie.
 *
 * <Select aria-label="Pays" value={v} onValueChange={setV} options={[{ value: 'FR', label: 'France' }]} />
 */
export function Select<T extends string>({
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder,
  size = 'm',
  full,
  disabled,
  icon,
  className,
  'aria-label': ariaLabel,
}: {
  value?: T;
  defaultValue?: T;
  onValueChange?: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  /** `touch` : 48 px et texte à 16 px, comme `TextField`, dans un formulaire sur téléphone. */
  size?: 's' | 'm' | 'touch';
  full?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  'aria-label': string;
}) {
  const groups: { name?: string; items: SelectOption<T>[] }[] = [];
  options.forEach((o) => {
    const last = groups[groups.length - 1];
    if (last && last.name === o.group) last.items.push(o);
    else groups.push({ name: o.group, items: [o] });
  });
  return (
    <S.Root value={value} defaultValue={defaultValue} onValueChange={(v) => onValueChange?.(v as T)} disabled={disabled}>
      <S.Trigger aria-label={ariaLabel} className={cn(s.trigger, size !== 'm' && s[size], full && s.full, className)}>
        {icon}
        <span className={s.value}>
          <S.Value placeholder={placeholder} />
        </span>
        <S.Icon asChild>
          <ChevronDown className={s.icon} aria-hidden="true" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content position="popper" sideOffset={6} collisionPadding={12} className={s.content}>
          <S.ScrollUpButton className={s.scroll}>
            <ChevronUp aria-hidden="true" />
          </S.ScrollUpButton>
          <S.Viewport className={s.viewport}>
            {groups.map((g, gi) => (
              <S.Group key={gi}>
                {g.name && <S.Label className={s.label}>{g.name}</S.Label>}
                {g.items.map((o) => (
                  <S.Item key={o.value} value={o.value} disabled={o.disabled} className={s.item}>
                    <span className={s.itemBody}>
                      <S.ItemText>{o.label}</S.ItemText>
                      {o.sub && <span className={s.sub}>{o.sub}</span>}
                    </span>
                    <span className={s.check}>
                      <S.ItemIndicator>
                        <Check aria-hidden="true" />
                      </S.ItemIndicator>
                    </span>
                  </S.Item>
                ))}
              </S.Group>
            ))}
          </S.Viewport>
          <S.ScrollDownButton className={s.scroll}>
            <ChevronDown aria-hidden="true" />
          </S.ScrollDownButton>
        </S.Content>
      </S.Portal>
    </S.Root>
  );
}
