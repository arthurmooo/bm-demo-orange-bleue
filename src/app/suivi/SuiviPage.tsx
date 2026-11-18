import { CalendarCheck, Check, CircleCheck, Dumbbell, Mic, Target, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ScorePill, Tag } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Dialog';
import { NumberTicker } from '@/components/ui/NumberTicker';
import { Segmented } from '@/components/ui/Segmented';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { toast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { dur, ease, spring, tween } from '@/lib/motion';
import { addDays, CLUBS, clubOf, dayShort, daysFrom, FORMULES, memberName, membersOf, num, personOf, relDay, stateOf, TODAY, type ClubId, type Member } from '@/data/demo';
import { ClubDot } from '../home/HomePage';
import { useStore } from '../store';
import p from '../page.module.css';
import s from './Suivi.module.css';

/** Bilans planifiés pendant la démo (gardés le temps de la session). */
const PLANNED = new Map<string, Date>();

type Filter = 'late' | 'week' | 'all';

const WEEKDAY = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const wd = (d: Date) => WEEKDAY.format(d).replace('.', '');
const DAY_FULL = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
const MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const dayFull = (d: Date) => DAY_FULL.format(d).replace('.', '');

function useFollow() {
  const { done } = useStore();
  const isLate = (m: Member) => stateOf(m.nextBilan) === 'late' && !done[m.id];
  const progLate = (m: Member) => stateOf(m.nextProgramme) === 'late';
  const pct = (list: Member[]) => {
    const tracked = list.filter((m) => m.nextBilan || m.nextProgramme);
    const ok = tracked.filter((m) => !isLate(m) && !progLate(m)).length;
    return Math.round((ok / tracked.length) * 100);
  };
  return { isLate, pct, done };
}

function ClubTabs() {
  const { club, setClub } = useStore();
  const { pct } = useFollow();
  return (
    <Tabs value={club} onValueChange={(v) => setClub(v as ClubId | 'all')} className={s.tabs}>
      <TabsList size="lg" aria-label="Clubs">
        <TabsTrigger value="all">
          <span className={s.tabName}>Tous les clubs</span>
          <ScorePill value={pct(membersOf('all'))} />
        </TabsTrigger>
        {CLUBS.map((c) => (
          <TabsTrigger key={c.id} value={c.id}>
            <span className={s.tabName}>
              <i className={s.tabDot} style={{ background: c.color }} />
              {c.name}
            </span>
            <ScorePill value={pct(membersOf(c.id))} />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function Head({ list }: { list: Member[] }) {
  const { club } = useStore();
  const { isLate } = useFollow();
  const late = list.filter(isLate).length;
  const week = list.filter((m) => stateOf(m.nextBilan) === 'week').length;
  const prog = list.filter((m) => ['late', 'week'].includes(stateOf(m.nextProgramme))).length;
  const worst = CLUBS.map((c) => ({ c, n: membersOf(c.id).filter(isLate).length })).sort((a, b) => b.n - a.n)[0]!;
  return (
    <Card className={s.head}>
      <div className={s.headTxt}>
        <p className={s.kicker}>Échéances calculées depuis la formule de chaque adhérent</p>
        <h1 className={s.h1}>
          {club === 'all' ? (
            <>
              <b>{late} bilans en retard</b> sur {num(list.length)} adhérents. {worst.c.name} d’abord.
            </>
          ) : (
            <>
              {clubOf(club).name} : <b>{late} bilans en retard</b> sur {num(list.length)} adhérents.
            </>
          )}
        </h1>
        <p className={s.meta}>Bilans et programmes tombent tout seuls dans le planning des coachs.</p>
      </div>
      <div className={s.stats}>
        <div className={s.stat}>
          <span className={cn(s.statN, s.red)}>
            <NumberTicker value={late} locale="fr" />
          </span>
          <span className={s.statL}>bilans en retard</span>
        </div>
        <div className={s.stat}>
          <span className={s.statN}>
            <NumberTicker value={week} locale="fr" delay={0.08} />
          </span>
          <span className={s.statL}>bilans cette semaine</span>
        </div>
        <div className={s.stat}>
          <span className={s.statN}>
            <NumberTicker value={prog} locale="fr" delay={0.16} />
          </span>
          <span className={s.statL}>programmes à renouveler</span>
        </div>
      </div>
    </Card>
  );
}

function Schedule({ list, day, onDay }: { list: Member[]; day: number | 'late' | null; onDay: (d: number | 'late' | null) => void }) {
  const { isLate } = useFollow();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(TODAY, i);
    return {
      i,
      d,
      b: list.filter((m) => m.nextBilan && daysFrom(m.nextBilan) === i).length + [...PLANNED.entries()].filter(([id, x]) => daysFrom(x) === i && list.some((m) => m.id === id)).length,
      p: list.filter((m) => m.nextProgramme && daysFrom(m.nextProgramme) === i).length,
    };
  });
  const lateB = list.filter(isLate).length;
  const lateP = list.filter((m) => stateOf(m.nextProgramme) === 'late').length;
  const max = Math.max(...days.map((x) => x.b + x.p), 1);
  return (
    <Card className={s.sched}>
      <div className={p.ch}>
        <div className={p.chMain}>
          <h3>Les 14 prochains jours</h3>
          <div className={s.leg}>
            <span>
              <i style={{ background: 'var(--ko)' }} />
              En retard
            </span>
            <span>
              <i style={{ background: 'var(--ac)' }} />
              Bilans
            </span>
            <span>
              <i style={{ background: 'var(--ink)' }} />
              Programmes
            </span>
          </div>
        </div>
        {day !== null && (
          <Button size="s" variant="ghost" onClick={() => onDay(null)}>
            <X aria-hidden="true" />
            {day === 'late' ? 'Retards' : dayFull(addDays(TODAY, day))}
          </Button>
        )}
      </div>
      <div className={s.grid}>
        <button type="button" className={cn(s.day, s.late)} aria-pressed={day === 'late'} onClick={() => onDay(day === 'late' ? null : 'late')}>
          <span className={s.cnt}>{lateB}</span>
          <span className={s.stack}>
            <motion.span className={cn(s.seg, s.segL)} style={{ height: `${(lateB / (lateB + lateP || 1)) * 100}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...spring.soft, delay: 0.1 }} />
            <motion.span className={cn(s.seg, s.segLp)} style={{ height: `${(lateP / (lateB + lateP || 1)) * 100}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...spring.soft, delay: 0.16 }} />
          </span>
          <span className={s.dl}>
            <b>Retard</b>à rattraper
          </span>
        </button>
        {days.map((x) => {
          const sunday = x.d.getDay() === 0;
          return (
            <Tooltip key={x.i} content={`${dayFull(x.d)} · ${x.b} bilans · ${x.p} programmes`}>
              <button type="button" className={cn(s.day, x.i === 0 && s.today, sunday && s.wkend)} aria-pressed={day === x.i} onClick={() => onDay(day === x.i ? null : x.i)}>
                <span className={s.cnt}>{x.b + x.p}</span>
                <span className={s.stack}>
                  <motion.span className={cn(s.seg, s.segB)} style={{ height: `${(x.b / max) * 100}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...spring.soft, delay: 0.15 + x.i * 0.03 }} />
                  <motion.span className={cn(s.seg, s.segP)} style={{ height: `${(x.p / max) * 100}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...spring.soft, delay: 0.2 + x.i * 0.03 }} />
                </span>
                <span className={s.dl}>
                  <b>{x.i === 0 ? 'Auj.' : wd(x.d)}</b>
                  {x.d.getDate()}
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </Card>
  );
}

function Rel({ d, planned, kind }: { d: Date | null; planned?: Date; kind: 'b' | 'p' }) {
  if (planned)
    return (
      <span className={s.planned}>
        <CircleCheck aria-hidden="true" />
        Planifié · {wd(planned)} {planned.getDate()}
      </span>
    );
  if (!d) return <span className={cn(s.rel, s.relNone)}>{kind === 'b' ? 'Sans bilan' : '—'}</span>;
  const st = stateOf(d);
  return <span className={cn(s.rel, st === 'late' && s.relLate, st === 'week' && s.relWeek)}>{st === 'late' ? `En retard · ${-daysFrom(d)} j` : relDay(d)}</span>;
}

function MemberList({ list, day, onOpen }: { list: Member[]; day: number | 'late' | null; onOpen: (m: Member) => void }) {
  const [filter, setFilter] = useState<Filter>('late');
  const [shown, setShown] = useState(12);
  const { done, isLate } = useFollow();
  const counts = {
    late: list.filter(isLate).length,
    week: list.filter((m) => stateOf(m.nextBilan) === 'week' || stateOf(m.nextProgramme) === 'week').length,
    all: list.length,
  };
  const rows = useMemo(() => {
    let r: Member[];
    if (day === 'late') r = list.filter((m) => stateOf(m.nextBilan) === 'late' || stateOf(m.nextProgramme) === 'late');
    else if (typeof day === 'number') r = list.filter((m) => (m.nextBilan && daysFrom(m.nextBilan) === day) || (m.nextProgramme && daysFrom(m.nextProgramme) === day));
    else if (filter === 'late') r = list.filter((m) => stateOf(m.nextBilan) === 'late');
    else if (filter === 'week') r = list.filter((m) => stateOf(m.nextBilan) === 'week' || stateOf(m.nextProgramme) === 'week');
    else r = list;
    const key = (m: Member) => Math.min(m.nextBilan ? daysFrom(m.nextBilan) : 999, m.nextProgramme ? daysFrom(m.nextProgramme) + 0.5 : 999);
    return [...r].sort((a, b) => key(a) - key(b));
  }, [list, filter, day]);
  const visible = rows.slice(0, shown);
  return (
    <Card>
      <div className={s.lh}>
        <div className={p.cht}>
          <h3>{day === null ? (filter === 'late' ? 'À rattraper en priorité' : filter === 'week' ? 'Cette semaine' : 'Tous les adhérents') : day === 'late' ? 'En retard' : dayFull(addDays(TODAY, day))}</h3>
          {day !== null && <Tag>{rows.length} adhérents</Tag>}
        </div>
        {day === null && (
          <Segmented<Filter>
            size="s"
            aria-label="Filtrer"
            value={filter}
            onValueChange={(v) => {
              setFilter(v);
              setShown(12);
            }}
            items={[
              { value: 'late', label: 'Retards', count: counts.late },
              { value: 'week', label: 'Cette semaine', count: counts.week },
              { value: 'all', label: 'Tous', count: num(counts.all) },
            ]}
          />
        )}
      </div>
      <Table className={s.rows} columns="minmax(0,1.5fr) 110px 64px minmax(0,1fr) minmax(0,1fr) 110px" gap={14} aria-label="Adhérents">
        <TableHead>
          <TableHeadCell>Adhérent</TableHeadCell>
          <TableHeadCell>Formule</TableHeadCell>
          <TableHeadCell>Coach</TableHeadCell>
          <TableHeadCell>Prochain bilan</TableHeadCell>
          <TableHeadCell>Programme</TableHeadCell>
          <TableHeadCell align="end">Dernière visite</TableHeadCell>
        </TableHead>
        <TableBody>
          <AnimatePresence initial={false}>
            {visible.map((m, i) => {
              const coach = personOf(m.coach);
              const abs = -daysFrom(m.lastVisit);
              return (
                <motion.div key={m.id} layout="position" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...tween.l, delay: Math.min(i, 12) * 0.025, layout: spring.layout }}>
                  <TableRow interactive className={s.row} tabIndex={0} role="button" onClick={() => onOpen(m)} onKeyDown={(e) => e.key === 'Enter' && onOpen(m)}>
                    <TableCell>
                      <span className={s.who}>
                        <b>{memberName(m)}</b>
                        <span>
                          <ClubDot id={m.club} />
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tag tone={m.formule === 'coaching' ? 'red' : m.formule === 'confort' ? 'amber' : 'gray'}>{FORMULES[m.formule].label}</Tag>
                    </TableCell>
                    <TableCell>
                      <Tooltip content={coach.name}>
                        <span tabIndex={-1}>
                          <Avatar initials={coach.id} role="staff" size={26} />
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Rel d={m.nextBilan} kind="b" planned={done[m.id] ? PLANNED.get(m.id) : undefined} />
                    </TableCell>
                    <TableCell>
                      <Rel d={m.nextProgramme} kind="p" />
                    </TableCell>
                    <TableCell align="end">
                      <span className={cn(s.vis, abs >= 21 && s.visAbs)}>{abs === 0 ? 'aujourd’hui' : abs === 1 ? 'hier' : `il y a ${abs} j`}</span>
                    </TableCell>
                  </TableRow>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
      {rows.length > shown && (
        <div className={s.more}>
          <Button size="s" variant="ghost" onClick={() => setShown((n) => n + 24)}>
            Voir les {num(rows.length - shown)} autres
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ Fiche */

const NOTES: Record<string, string[]> = {
  'Perte de poids': ['Moins 2 kilos depuis le dernier bilan, motivée. On garde trois séances par semaine.', 'Souhaite ajouter un cours collectif le samedi.'],
  'Remise en forme': ['Reprise en douceur, bonne régularité depuis la rentrée.', 'Essoufflé sur le rameur, on allonge l’échauffement.'],
  'Renforcement du dos': ['Plus de douleur lombaire depuis un mois. On ajoute du gainage.', 'Éviter le soulevé de terre pour l’instant.'],
  'Préparation trail': ['Objectif trail en avril. Deux séances cardio de plus.', 'Travail de proprioception de la cheville à poursuivre.'],
  'Prise de masse': ['Plus 1,5 kilo, progression régulière au développé couché.', 'Programme à faire évoluer : passage en split.'],
  'Mobilité et souplesse': ['Gagne en amplitude aux épaules. Stretching en fin de séance.', 'Intéressé par le cours de pilates.'],
  'Reprise après grossesse': ['Reprise validée par la sage-femme. Périnée d’abord, abdos plus tard.', 'Très régulière le matin.'],
  'Cardio et endurance': ['30 minutes de vélo sans pause, objectif 45.', 'Fréquence cardiaque à surveiller sur le fractionné.'],
};

function slots(m: Member) {
  const out: Date[] = [];
  let d = addDays(TODAY, 1);
  while (out.length < 3) {
    if (d.getDay() !== 0) out.push(d);
    d = addDays(d, out.length === 1 ? 2 : 1);
  }
  const times = ['10 h 00', '12 h 30', '18 h 15'];
  return out.map((x, i) => ({ d: x, t: times[(i + m.id.length) % 3]! }));
}

function Timeline({ m, planned }: { m: Member; planned?: Date }) {
  const start = addDays(TODAY, -180);
  const span = 365;
  const pos = (d: Date) => ((d.getTime() - start.getTime()) / (span * 86_400_000)) * 100;
  const inWin = (d: Date) => pos(d) >= 1 && pos(d) <= 99;
  const f = FORMULES[m.formule];
  const bil: { d: Date; k: 'done' | 'late' | 'next' | 'up' | 'plan' }[] = [];
  if (m.nextBilan && f.bilans) {
    const step = Math.round(365 / f.bilans);
    const anchorLate = stateOf(m.nextBilan) === 'late';
    for (let k = -4; k <= 4; k++) {
      const d = addDays(m.nextBilan, k * step);
      if (!inWin(d)) continue;
      if (k === 0) bil.push({ d: planned ?? d, k: planned ? 'plan' : anchorLate ? 'late' : 'next' });
      else bil.push({ d, k: daysFrom(d) < 0 ? 'done' : 'up' });
    }
  }
  const prog: Date[] = [];
  if (m.nextProgramme && f.programme)
    for (let k = -4; k <= 4; k++) {
      const d = addDays(m.nextProgramme, k * f.programme);
      if (inWin(d)) prog.push(d);
    }
  const months = Array.from({ length: 13 }, (_, i) => new Date(start.getFullYear(), start.getMonth() + i + 1, 1)).filter(inWin);
  return (
    <div>
      <div className={s.tl}>
        <span className={s.tlRail} />
        <motion.span className={s.tlPast} initial={{ width: 0 }} animate={{ width: `${pos(TODAY)}%` }} transition={{ duration: dur.xl, ease: ease.out }} />
        <span className={s.tlToday} style={{ left: `${pos(TODAY)}%` }}>
          <span className={s.tlTodayL}>Aujourd’hui</span>
        </span>
        {prog.map((d, i) => (
          <Tooltip key={`p${i}`} content={`Programme · ${dayShort(d)}`}>
            <span className={s.pg} style={{ left: `${pos(d)}%` }} />
          </Tooltip>
        ))}
        {bil.map((b, i) => (
          <Tooltip key={`b${i}`} content={`Bilan · ${dayShort(b.d)}${b.k === 'late' ? ' · en retard' : b.k === 'plan' ? ' · planifié' : ''}`}>
            <motion.span
              className={cn(s.mk, b.k === 'done' && s.mkDone, b.k === 'late' && s.mkLate, (b.k === 'next' || b.k === 'up') && s.mkNext, b.k === 'plan' && s.mkPlan)}
              style={{ left: `${pos(b.d)}%`, opacity: b.k === 'up' ? 0.5 : 1 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...spring.bouncy, delay: 0.2 + i * 0.06 }}
            >
              {b.k === 'done' && <Check aria-hidden="true" />}
              {b.k === 'late' && <X aria-hidden="true" />}
            </motion.span>
          </Tooltip>
        ))}
        <div className={s.months}>
          {months.map((d, i) => (
            <span key={i} style={{ left: `${pos(d)}%` }}>
              {MONTH.format(d).replace('.', '')}
            </span>
          ))}
        </div>
      </div>
      <div className={s.tlLeg}>
        <span>
          <i style={{ background: 'var(--score-hi)' }} />
          Bilan fait
        </span>
        <span>
          <i style={{ background: 'var(--ko)' }} />
          En retard
        </span>
        <span>
          <i style={{ boxShadow: 'inset 0 0 0 2px var(--ac)' }} />À venir
        </span>
        <span>
          <i style={{ background: 'var(--ink)', borderRadius: 2, transform: 'rotate(45deg) scale(.8)' }} />
          Programme
        </span>
      </div>
    </div>
  );
}

function Fiche({ m, onClose }: { m: Member; onClose: () => void }) {
  const { done, markDone, addLog } = useStore();
  const [pick, setPick] = useState<number | null>(null);
  const [justDone, setJustDone] = useState(false);
  const f = FORMULES[m.formule];
  const coach = personOf(m.coach);
  const planned = done[m.id] ? PLANNED.get(m.id) : undefined;
  const sl = slots(m);
  const notes = NOTES[m.goal] ?? [];
  const late = stateOf(m.nextBilan) === 'late' && !planned;
  const confirm = () => {
    if (pick === null) return;
    const x = sl[pick]!;
    PLANNED.set(m.id, x.d);
    markDone(m.id);
    addLog(`Bilan de ${memberName(m)} planifié le ${dayFull(x.d)} à ${x.t} avec ${coach.name}`);
    toast(`Bilan planifié · ${dayFull(x.d)} à ${x.t}`, { tone: 'ok', description: `${memberName(m)} et ${coach.name} sont prévenus.` });
    setJustDone(true);
    setTimeout(onClose, 1100);
  };
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      width={600}
      title={memberName(m)}
      footer={
        f.bilans > 0 && !planned && !justDone ? (
          <Button variant="primary" full disabled={pick === null} onClick={confirm}>
            <CalendarCheck aria-hidden="true" />
            Planifier le bilan
          </Button>
        ) : undefined
      }
    >
      <div className={s.f}>
        <div className={s.fTop}>
          <ClubDot id={m.club} />
          <span>·</span>
          <Tag tone={m.formule === 'coaching' ? 'red' : m.formule === 'confort' ? 'amber' : 'gray'}>Formule {f.label}</Tag>
          <span>·</span>
          <span>
            depuis {MONTH.format(m.since).replace('.', '')} {m.since.getFullYear()}
          </span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Avatar initials={coach.id} role="staff" size={22} />
            {coach.name}
          </span>
        </div>

        <section className={s.fSec}>
          <h4>Ce que prévoit la formule</h4>
          <div className={s.rules}>
            <div className={s.rule}>
              <span className={s.ruleIc}>
                <CalendarCheck aria-hidden="true" />
              </span>
              <span>
                <b>{f.bilans ? `${f.bilans} bilan${f.bilans > 1 ? 's' : ''} par an` : 'Sans bilan'}</b>
                {f.bilans ? `un tous les ${Math.round(12 / f.bilans)} mois` : 'non prévu par la formule'}
              </span>
            </div>
            <div className={s.rule}>
              <span className={s.ruleIc}>
                <Dumbbell aria-hidden="true" />
              </span>
              <span>
                <b>{f.programme ? 'Programme tous les 2 mois' : 'Programme libre'}</b>
                {f.programme ? 'renouvelé par le coach' : 'à la demande'}
              </span>
            </div>
          </div>
        </section>

        <section className={s.fSec}>
          <h4>Son année</h4>
          <Timeline m={m} planned={planned} />
        </section>

        <section className={s.fSec}>
          <h4>Objectif</h4>
          <span className={s.goal}>
            <Target aria-hidden="true" />
            {m.goal}
          </span>
        </section>

        <section className={s.fSec}>
          <h4>Notes dictées par le coach</h4>
          <div className={s.notes}>
            {notes.map((n, i) => (
              <div key={i} className={s.note}>
                <span className={s.noteH}>
                  <b>{coach.name}</b>
                  <span>· {dayShort(addDays(TODAY, -(18 + i * 41)))}</span>
                  <Mic aria-hidden="true" />
                </span>
                {n}
              </div>
            ))}
          </div>
        </section>

        {f.bilans > 0 && m.nextBilan && (
          <section className={s.fSec}>
            <h4>{planned ? 'Bilan planifié' : late ? `En retard de ${-daysFrom(m.nextBilan)} jours · créneaux libres de ${coach.name}` : `Prochain bilan ${relDay(m.nextBilan)} · créneaux libres de ${coach.name}`}</h4>
            <AnimatePresence mode="wait" initial={false}>
              {planned || justDone ? (
                <motion.div key="ok" className={s.ok} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={spring.snappy}>
                  <CircleCheck aria-hidden="true" />
                  Planifié · {dayFull(planned ?? sl[pick ?? 0]!.d)}
                </motion.div>
              ) : (
                <motion.div key="slots" className={s.slots} exit={{ opacity: 0 }}>
                  {sl.map((x, i) => (
                    <button key={i} type="button" className={s.slot} aria-pressed={pick === i} onClick={() => setPick(i)}>
                      <b>{dayFull(x.d)}</b>
                      <span>
                        {x.t} · {coach.name}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </div>
    </Drawer>
  );
}

export function SuiviPage() {
  const { club } = useStore();
  const list = membersOf(club);
  const [day, setDay] = useState<number | 'late' | null>(null);
  const [open, setOpen] = useState<Member | null>(null);
  return (
    <div className={p.stack}>
      <ClubTabs />
      <Head list={list} />
      <Schedule list={list} day={day} onDay={setDay} />
      <MemberList list={list} day={day} onOpen={setOpen} />
      {open && <Fiche key={open.id} m={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
