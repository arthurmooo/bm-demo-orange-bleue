
import { Check } from 'lucide-react';
import { DropdownMenu as M } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import s from './Menu.module.css';

/**
 * Menu déroulant maison (navigation au clavier, typeahead, focus géré par Radix).
 *
 * <Menu>
 *   <MenuTrigger asChild><button>…</button></MenuTrigger>
 *   <MenuContent align="end">
 *     <MenuLabel>En cours</MenuLabel>
 *     <MenuRadioGroup value={v} onValueChange={setV}>
 *       <MenuRadioItem value="a" title="Automne 2026" sub="5 pays · 48 commandes" />
 *     </MenuRadioGroup>
 *   </MenuContent>
 * </Menu>
 */
export const Menu = M.Root;
export const MenuTrigger = M.Trigger;
export const MenuGroup = M.Group;
export const MenuRadioGroup = M.RadioGroup;

export function MenuContent({ className, sideOffset = 8, collisionPadding = 12, ...rest }: ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content sideOffset={sideOffset} collisionPadding={collisionPadding} className={cn(s.content, className)} {...rest} />
    </M.Portal>
  );
}

export function MenuLabel({ className, ...rest }: ComponentProps<typeof M.Label>) {
  return <M.Label className={cn(s.label, className)} {...rest} />;
}

export function MenuSeparator({ className, ...rest }: ComponentProps<typeof M.Separator>) {
  return <M.Separator className={cn(s.separator, className)} {...rest} />;
}

type ItemText = { title?: ReactNode; sub?: ReactNode; icon?: ReactNode };

function Body({ title, sub, children }: ItemText & { children?: ReactNode }) {
  if (title === undefined) return <>{children}</>;
  return (
    <span className={s.body}>
      <span className={s.title}>{title}</span>
      {sub && <span className={s.sub}>{sub}</span>}
    </span>
  );
}

/** Élément d'action. `title` et `sub` donnent la mise en page à deux lignes. */
export function MenuItem({ className, title, sub, icon, children, ...rest }: ComponentProps<typeof M.Item> & ItemText) {
  return (
    <M.Item className={cn(s.item, className)} {...rest}>
      {icon}
      <Body title={title} sub={sub}>
        {children}
      </Body>
    </M.Item>
  );
}

/** Choix exclusif, coché à droite. */
export function MenuRadioItem({ className, title, sub, icon, children, ...rest }: ComponentProps<typeof M.RadioItem> & ItemText) {
  return (
    <M.RadioItem className={cn(s.item, className)} {...rest}>
      {icon}
      <Body title={title} sub={sub}>
        {children}
      </Body>
      <span className={s.check}>
        <M.ItemIndicator>
          <Check aria-hidden="true" />
        </M.ItemIndicator>
      </span>
    </M.RadioItem>
  );
}

/** Option cochable, cochée à droite. */
export function MenuCheckboxItem({ className, title, sub, icon, children, ...rest }: ComponentProps<typeof M.CheckboxItem> & ItemText) {
  return (
    <M.CheckboxItem className={cn(s.item, className)} {...rest}>
      {icon}
      <Body title={title} sub={sub}>
        {children}
      </Body>
      <span className={s.check}>
        <M.ItemIndicator>
          <Check aria-hidden="true" />
        </M.ItemIndicator>
      </span>
    </M.CheckboxItem>
  );
}
