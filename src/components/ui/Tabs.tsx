
import { motion } from 'motion/react';
import Link from 'next/link';
import { Tabs as T } from 'radix-ui';
import { createContext, useContext, useId, useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import s from './Tabs.module.css';

const IndicatorCtx = createContext<{ id: string; value?: string }>({ id: '' });

/**
 * Onglets dans la page (Radix Tabs). L'indicateur glisse d'un onglet à l'autre.
 *
 * <Tabs value={v} onValueChange={setV}>
 *   <TabsList aria-label="…"><TabsTrigger value="a">A</TabsTrigger></TabsList>
 *   <TabsContent value="a">…</TabsContent>
 * </Tabs>
 */
export function Tabs({ value, defaultValue, onValueChange, children, ...rest }: ComponentProps<typeof T.Root>) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  return (
    <T.Root
      value={current}
      onValueChange={(v) => {
        setInner(v);
        onValueChange?.(v);
      }}
      {...rest}
    >
      <IndicatorCtx.Provider value={{ id, value: current }}>{children}</IndicatorCtx.Provider>
    </T.Root>
  );
}

export function TabsList({ className, size = 'm', ...rest }: ComponentProps<typeof T.List> & { size?: 'm' | 'lg' }) {
  return <T.List className={cn(s.list, size === 'lg' && s.lg, className)} {...rest} />;
}

/**
 * Libellé d'onglet qui passe en gras sans bouger : une copie invisible en gras réserve la largeur,
 * pour que les onglets voisins et l'indicateur ne sautent pas.
 */
function TabLabel({ children }: { children: ReactNode }) {
  return (
    <span className={s.lbl}>
      <span className={s.lblBold} aria-hidden="true">
        {children}
      </span>
      <span className={s.lblCur}>{children}</span>
    </span>
  );
}

export function TabsTrigger({ className, value, children, onPointerDown, onKeyDown, onBlur, ...rest }: ComponentProps<typeof T.Trigger>) {
  const ctx = useContext(IndicatorCtx);
  return (
    <T.Trigger
      value={value}
      className={cn(s.tab, className)}
      onPointerDown={(e) => {
        e.currentTarget.setAttribute('data-pointer', '');
        onPointerDown?.(e);
      }}
      onKeyDown={(e) => {
        e.currentTarget.removeAttribute('data-pointer');
        onKeyDown?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.removeAttribute('data-pointer');
        onBlur?.(e);
      }}
      {...rest}
    >
      <TabLabel>{children}</TabLabel>
      {ctx.value === value && <motion.span layoutId={`tab-${ctx.id}`} className={s.indicator} transition={spring.layout} aria-hidden="true" />}
    </T.Trigger>
  );
}

export function TabsContent({ className, ...rest }: ComponentProps<typeof T.Content>) {
  return <T.Content className={cn(s.content, className)} {...rest} />;
}

export type TabLink = { href: string; label: ReactNode; active: boolean; 'aria-label'?: string };

/**
 * Onglets de navigation (chaque onglet est une page). Même rendu que `Tabs`,
 * avec `aria-current="page"` sur l'onglet actif.
 */
export function TabLinks({ items, size = 'm', className, 'aria-label': ariaLabel, scroll = false }: { items: TabLink[]; size?: 'm' | 'lg'; className?: string; 'aria-label': string; scroll?: boolean }) {
  const id = useId();
  return (
    <nav aria-label={ariaLabel} className={cn(s.list, size === 'lg' && s.lg, className)}>
      {items.map((it) => (
        <Link key={it.href} href={it.href} scroll={scroll} aria-current={it.active ? 'page' : undefined} aria-label={it['aria-label']} className={s.tab}>
          <TabLabel>{it.label}</TabLabel>
          {it.active && <motion.span layoutId={`tablink-${id}`} className={s.indicator} transition={spring.layout} aria-hidden="true" />}
        </Link>
      ))}
    </nav>
  );
}
