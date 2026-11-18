import { Building2, ClipboardCheck, HeartHandshake, House, Mail, Smartphone, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router';
import { Avatar } from '@/components/ui/Avatar';
import { NavRail } from '@/components/ui/NavRail';
import { Tooltip } from '@/components/ui/Tooltip';
import { dur, ease } from '@/lib/motion';
import mark from '@/assets/mark-ob.svg';
import s from './Shell.module.css';

export const NAV = [
  { href: '/', label: 'Accueil', icon: House },
  { href: '/suivi', label: 'Suivi adhérents', icon: ClipboardCheck },
  { href: '/fidelisation', label: 'Fidélisation', icon: HeartHandshake },
  { href: '/impayes', label: 'Impayés', icon: Wallet },
  { href: '/mails', label: 'Mails', icon: Mail },
  { href: '/partenariats', label: 'Partenariats', icon: Building2 },
];

export function Rail() {
  const p = useLocation().pathname;
  const who = 'Nicolas · Directeur des opérations';
  return (
    <NavRail
      label="Navigation"
      logo={<img src={mark} alt="L’Orange Bleue" style={{ width: 38, height: 38, objectFit: 'contain' }} />}
      expandLabel="Déplier le menu"
      collapseLabel="Replier le menu"
      items={NAV.map((n) => ({ ...n, current: n.href === '/' ? p === '/' : p.startsWith(n.href) }))}
      extras={[{ key: 'equipe', label: 'Côté équipe', icon: Smartphone, href: '/equipe', current: p.startsWith('/equipe') }]}
      footer={(open) => (
        <>
          <Tooltip content={open ? null : who} side="right" sideOffset={10}>
            <span className={s.me} tabIndex={open ? -1 : 0} aria-label={who} role="img">
              <Avatar initials="NI" role="brand" size={36} />
              <span className={s.dot} aria-hidden="true" />
            </span>
          </Tooltip>
          <motion.span className={s.meText} initial={false} animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }} transition={open ? { duration: dur.m, ease: ease.out, delay: 0.12 } : { duration: dur.xs }} aria-hidden="true">
            <b>Nicolas</b>
            <span>Directeur des opérations</span>
          </motion.span>
        </>
      )}
    />
  );
}
