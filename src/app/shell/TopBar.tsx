import { CalendarDays, ChevronDown, MapPin } from 'lucide-react';
import { useLocation } from 'react-router';
import { Tag } from '@/components/ui/Badge';
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/components/ui/Menu';
import { CLUBS, clubOf, dayLong, num, TODAY, type ClubId } from '@/data/demo';
import { useStore } from '../store';
import { NAV } from './Rail';
import s from './Shell.module.css';

const TITLES: Record<string, string> = Object.fromEntries([...NAV.map((n) => [n.href, n.label]), ['/equipe', 'Côté équipe']]);

function ClubMenu() {
  const { club, setClub } = useStore();
  const label = club === 'all' ? 'Tous les clubs' : clubOf(club).name;
  return (
    <Menu>
      <MenuTrigger asChild>
        <button type="button" className={s.mission} aria-label={`Club : ${label}. Changer`}>
          <MapPin aria-hidden="true" />
          {label}
          <ChevronDown className={s.chev} aria-hidden="true" />
        </button>
      </MenuTrigger>
      <MenuContent align="end" className={s.missionMenu} aria-label="Choisir un club">
        <MenuRadioGroup value={club} onValueChange={(v) => setClub(v as ClubId | 'all')}>
          <MenuRadioItem value="all" title="Tous les clubs" sub="Mayenne et Sarthe" />
          <MenuLabel>Clubs</MenuLabel>
          {CLUBS.map((c) => (
            <MenuRadioItem key={c.id} value={c.id} title={c.name} sub={`${num(c.size)} adhérents`} />
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

export function TopBar() {
  const p = useLocation().pathname;
  const key = Object.keys(TITLES).filter((k) => (k === '/' ? p === '/' : p.startsWith(k))).pop() ?? '/';
  return (
    <header className={s.top}>
      <ol className={s.crumbs} aria-label="Fil d’Ariane">
        <li>
          <span className={s.crumbCur} aria-current="page">
            {TITLES[key]}
          </span>
        </li>
      </ol>
      <Tag className={s.sample}>Démo · données fictives</Tag>
      <span className={s.mission} style={{ cursor: 'default' }}>
        <CalendarDays aria-hidden="true" />
        <span>{dayLong(TODAY).replace(/^./, (c) => c.toUpperCase())}</span>
      </span>
      <ClubMenu />
    </header>
  );
}
