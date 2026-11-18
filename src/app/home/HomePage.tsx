import { CalendarCheck, CircleCheck, ClipboardList, Dumbbell, HeartHandshake, Mail, Mic, UserX, Wallet, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ScoreRing } from '@/components/charts/ScoreRing';
import { Sparkline } from '@/components/charts/Sparkline';
import { Avatar } from '@/components/ui/Avatar';
import { Delta, Pill, Tag } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NumberTicker } from '@/components/ui/NumberTicker';
import { toast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { dur, ease, spring, tween } from '@/lib/motion';
import { CLUBS, clubOf, clubStats, DEBT_SERIES, DEBTS, dayShort, euro, MEMBERS, membersOf, num, personOf, WEEKLY, type ClubId } from '@/data/demo';
import { useStore } from '../store';
import p from '../page.module.css';
import h from './Home.module.css';
import s from './Accueil.module.css';

export function ClubDot({ id }: { id: ClubId }) {
  const c = clubOf(id);
  return (
    <span className={s.clubDot}>
      <i style={{ background: c.color }} />
      {c.name}
    </span>
  );
}

function Hero() {
  const { club } = useStore();
  const st = clubStats(club);
  const worst = [...CLUBS].map((c) => ({ c, n: clubStats(c.id).bilansLate })).sort((a, b) => b.n - a.n)[0]!;
  const total = membersOf(club).length;
  return (
    <section className={p.g3} aria-label="Vue d’ensemble">
      <Card className={h.hero}>
        <div className={h.gw}>
          <div role="img" aria-label={`${st.upToDate.pct} % des suivis à jour`}>
            <ScoreRing value={st.upToDate.pct} size={148} stroke={12}>
              <b className={h.ringNum}>
                <NumberTicker value={st.upToDate.pct} locale="fr" />
              </b>
              <span className={h.ringOf}>%</span>
            </ScoreRing>
          </div>
          <span className={s.ringLbl}>des suivis à jour</span>
        </div>
        <div className={h.hm}>
          <p className={s.hello}>Bonjour Nicolas</p>
          <h1>
            {club === 'all' ? (
              <>
                <b>{num(st.bilansLate)} bilans</b> en retard, dont {worst.n} à {worst.c.name}.
              </>
            ) : (
              <>
                <b>{num(st.bilansLate)} bilans</b> en retard à {clubOf(club).name}.
              </>
            )}
          </h1>
          <p className={h.meta}>
            {club === 'all' ? '5 clubs' : clubOf(club).name} · {num(total)} adhérents · préparé ce matin à 6 h
          </p>
        </div>
      </Card>

      <Card className={h.prog} aria-label={`${num(MEMBERS.length)} adhérents actifs`}>
        <span className={h.kl}>Adhérents actifs</span>
        <span className={h.pn}>
          <b>
            <NumberTicker value={MEMBERS.length} locale="fr" />
          </b>
          <span>sur 5 clubs</span>
        </span>
        <span className={s.clubBar} role="img" aria-label={CLUBS.map((c) => `${c.name} ${c.size}`).join(', ')}>
          {CLUBS.map((c, i) => (
            <Tooltip key={c.id} content={`${c.name} · ${num(c.size)}`}>
              <motion.i style={{ flexGrow: c.size, background: c.color, opacity: club === 'all' || club === c.id ? 1 : 0.18 }} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: club === 'all' || club === c.id ? 1 : 0.18, scaleX: 1 }} transition={{ duration: dur.l, ease: ease.out, delay: 0.15 + i * 0.08 }} />
            </Tooltip>
          ))}
        </span>
        <span className={s.clubLeg} aria-hidden="true">
          {CLUBS.map((c) => (
            <span key={c.id}>
              <i style={{ background: c.color }} />
              <b>{num(c.size)}</b>
              {c.name}
            </span>
          ))}
        </span>
      </Card>
    </section>
  );
}

function Kpi({ label, icon: Icon, value, unit, delta, sense, vs, series, tone, index, money }: { label: string; icon: LucideIcon; value: number; unit?: string; delta: string; sense: 'good' | 'bad' | 'neutral'; vs: string; series: number[]; tone: 'good' | 'bad' | 'neu'; index: number; money?: boolean }) {
  return (
    <Card className={h.kpi}>
      <span className={h.kh}>
        <span className={h.kl}>{label}</span>
        <span className={h.kic} aria-hidden="true">
          <Icon />
        </span>
      </span>
      <span className={h.kv}>
        <span className={h.kn}>
          <NumberTicker value={value} locale="fr" delay={0.1 + index * 0.08} />
          {unit && <small>{unit}</small>}
        </span>
        <Delta direction={delta.startsWith('−') || delta.startsWith('-') ? 'down' : 'up'} sense={sense}>
          {delta}
        </Delta>
        <span className={h.vs}>{vs}</span>
      </span>
      <Sparkline values={series} tone={tone} delay={0.15 + index * 0.08} />
      {money && null}
    </Card>
  );
}

function Kpis() {
  const { club } = useStore();
  const st = clubStats(club);
  const open = DEBTS.filter((d) => d.stage !== 'paid' && (club === 'all' || d.member.club === club));
  const owed = Math.round(open.reduce((a, d) => a + d.amount, 0));
  return (
    <section className={p.g3} aria-label="Indicateurs">
      <Kpi index={0} label="Bilans et programmes cette semaine" icon={CalendarCheck} value={st.bilansWeek + st.progWeek} delta="+12" sense="neutral" vs="vs semaine dernière" series={WEEKLY.map((w) => w.planned)} tone="neu" />
      <Kpi index={1} label="Absents depuis 3 semaines" icon={UserX} value={st.absent} delta="−18" sense="good" vs="vs mois dernier" series={[312, 298, 305, 290, 281, 266, 271, st.absent + 40, st.absent + 18, st.absent]} tone="good" />
      <Kpi index={2} label="Impayés en cours" icon={Wallet} value={owed} unit=" €" delta={`−${num(Math.round(DEBT_SERIES[4]! - owed))} €`} sense="good" vs="vs mois dernier" series={club === 'all' ? DEBT_SERIES : DEBT_SERIES.map((v) => v / 5)} tone="good" />
    </section>
  );
}

function ClubsCard() {
  const nav = useNavigate();
  const { setClub } = useStore();
  const rows = CLUBS.map((c) => ({ c, st: clubStats(c.id) })).sort((a, b) => a.st.upToDate.pct - b.st.upToDate.pct);
  return (
    <Card>
      <div className={p.ch}>
        <div className={p.chMain}>
          <h3>Craon et Château-Gontier décrochent sur les bilans</h3>
        </div>
        <Tag>Suivis à jour</Tag>
      </div>
      <div className={s.cl}>
        {rows.map(({ c, st }, i) => (
          <button
            type="button"
            key={c.id}
            className={s.clr}
            onClick={() => {
              setClub(c.id);
              nav('/suivi');
            }}
          >
            <span className={s.cln}>
              <i style={{ background: c.color }} />
              {c.name}
            </span>
            <span className={s.bar}>
              <motion.i style={{ width: `${st.upToDate.pct}%`, background: st.upToDate.pct < 85 ? 'var(--ko)' : st.upToDate.pct < 90 ? 'var(--wa)' : 'var(--score-hi)' }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: dur.xl, ease: ease.out, delay: 0.2 + i * 0.07 }} />
            </span>
            <span className={s.pct}>{st.upToDate.pct} %</span>
            <span className={s.late}>
              <b>{st.bilansLate}</b> bilans en retard
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function WeeksCard() {
  const max = Math.max(...WEEKLY.map((w) => w.planned));
  const last = WEEKLY[WEEKLY.length - 1]!;
  return (
    <Card>
      <div className={p.ch}>
        <div className={p.chMain}>
          <h3>
            {last.done} bilans faits sur {last.planned} prévus cette semaine
          </h3>
          <div className={s.leg}>
            <span>
              <i style={{ background: 'var(--ac)' }} />
              Réalisés
            </span>
            <span>
              <i style={{ background: 'var(--chart-track)' }} />
              Prévus
            </span>
          </div>
        </div>
      </div>
      <div className={s.cols} role="img" aria-label="Bilans réalisés et prévus sur 12 semaines">
        {WEEKLY.map((w, i) => (
          <Tooltip key={i} content={`Semaine du ${dayShort(w.week)} · ${w.done} / ${w.planned}`}>
            <span className={s.col} tabIndex={0}>
              <span className={s.colP} style={{ height: `${(w.planned / max) * 100}%` }} />
              <motion.span className={s.colD} style={{ height: `${(w.done / max) * 100}%`, opacity: i === WEEKLY.length - 1 ? 1 : 0.55 + i * 0.03 }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...spring.soft, delay: 0.2 + i * 0.04 }} />
            </span>
          </Tooltip>
        ))}
      </div>
      <div className={s.colX} aria-hidden="true">
        {WEEKLY.map((w, i) => (
          <span key={i}>{i % 2 === 1 || i === WEEKLY.length - 1 ? dayShort(w.week) : ''}</span>
        ))}
      </div>
    </Card>
  );
}

type QItem = { id: string; icon: LucideIcon; tone: string; title: string; club: ClubId; meta: string; owner: string; action: string; to?: string; doneLabel: string };

function useQueue(): QItem[] {
  const late = MEMBERS.filter((m) => m.club === 'craon' && m.nextBilan && m.nextBilan.getTime() < Date.now()).length;
  const d = DEBTS.find((x) => x.stage === 'new' && x.months >= 2) ?? DEBTS[0]!;
  return [
    { id: 'q-craon', icon: ClipboardList, tone: 'red', title: `${late} bilans en retard à Craon`, club: 'craon', meta: 'Créneaux proposés sur les 2 prochaines semaines', owner: 'MF', action: 'Planifier', doneLabel: 'Planifiés', to: '/suivi' },
    { id: 'q-debt', icon: Wallet, tone: 'red', title: `Impayé de ${euro(d.amount, 2)} · ${d.member.first} ${d.member.last}`, club: d.member.club, meta: `${d.months} mois · ${d.note.toLowerCase()} · SMS préparé`, owner: d.owner, action: 'Envoyer le SMS', doneLabel: 'SMS envoyé' },
    { id: 'q-fid', icon: HeartHandshake, tone: 'orange', title: '23 adhérents absents depuis 3 semaines à Laval Nord', club: 'laval', meta: 'Messages personnalisés prêts, un par adhérent', owner: 'NI', action: 'Relire', doneLabel: 'Envoyés', to: '/fidelisation' },
    { id: 'q-prog', icon: Dumbbell, tone: 'amber', title: '14 programmes à renouveler à Mayenne', club: 'mayenne', meta: 'Répartis entre Sarah et Kevin, cette semaine', owner: 'SB', action: 'Attribuer', doneLabel: 'Attribués' },
    { id: 'q-mail', icon: Mail, tone: 'navy', title: '6 mails attendent votre réponse', club: 'laval', meta: 'Prestataire ménage, banque, comptable · brouillons prêts', owner: 'NI', action: 'Ouvrir', doneLabel: 'Traités', to: '/mails' },
  ];
}

function QueueCard() {
  const nav = useNavigate();
  const { done, markDone, addLog } = useStore();
  const items = useQueue();
  const left = items.filter((x) => !done[x.id]).length;
  return (
    <Card>
      <div className={p.ch} style={{ alignItems: 'center' }}>
        <div className={p.cht}>
          <h3>À traiter aujourd’hui</h3>
          <Pill tone={left ? 'red' : 'green'}>{left ? `${left} sujets` : 'Tout est traité'}</Pill>
        </div>
      </div>
      <div className={s.q}>
        {items.map((x, i) => {
          const Icon = x.icon;
          const isDone = !!done[x.id];
          const owner = personOf(x.owner);
          return (
            <motion.div key={x.id} className={s.qi} initial={{ opacity: 0, y: 6 }} animate={{ opacity: isDone ? 0.55 : 1, y: 0 }} transition={{ ...tween.l, delay: 0.1 + i * 0.05 }}>
              <span className={cn(s.qic, s[`tone-${x.tone}`])} aria-hidden="true">
                <Icon />
              </span>
              <span>
                <span className={s.qt}>{x.title}</span>
                <span className={s.qm}>
                  <ClubDot id={x.club} />
                  <span>·</span>
                  <span>{x.meta}</span>
                </span>
              </span>
              <span className={s.qa}>
                <Tooltip content={`${owner.name} · ${owner.role}`}>
                  <span tabIndex={0}>
                    <Avatar initials={owner.id} role={owner.id === 'NI' ? 'brand' : 'staff'} size={26} />
                  </span>
                </Tooltip>
                <AnimatePresence mode="popLayout" initial={false}>
                  {isDone ? (
                    <motion.span key="d" className={s.qdone} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={spring.snappy}>
                      <CircleCheck aria-hidden="true" />
                      {x.doneLabel}
                    </motion.span>
                  ) : (
                    <motion.span key="a" exit={{ opacity: 0, scale: 0.94 }}>
                      <Button
                        size="s"
                        variant={i < 2 ? undefined : 'secondary'}
                        onClick={() => {
                          if (x.to) return nav(x.to);
                          markDone(x.id);
                          addLog(x.title);
                          toast(x.doneLabel, { tone: 'ok' });
                        }}
                      >
                        {x.action}
                      </Button>
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

const VOICES = [
  { who: 'JM', club: 'laval' as ClubId, at: '7 h 42', secs: 38, quote: '« Bilan de Léa Martin : moins 3 kilos depuis septembre, elle a mal au genou gauche, on remplace les fentes. Prochain bilan en février. »', out: ['Bilan saisi', 'Programme adapté', 'Prochain bilan · 16 févr'] },
  { who: 'MF', club: 'craon' as ClubId, at: '8 h 05', secs: 24, quote: '« Pascal Gohier reprend après son opération du dos, à revoir dans un mois, programme mobilité. »', out: ['Note de suivi', 'Rappel dans 30 j'] },
  { who: 'SB', club: 'mayenne' as ClubId, at: '8 h 31', secs: 31, quote: '« Chloé Bernard prépare le trail de Mayenne en avril, elle veut deux séances cardio de plus. »', out: ['Objectif mis à jour', 'Programme à renouveler'] },
];

function VoiceCard() {
  const nav = useNavigate();
  return (
    <Card>
      <div className={p.ch} style={{ alignItems: 'center' }}>
        <div className={p.cht}>
          <h3>Dicté par l’équipe ce matin</h3>
        </div>
        <Button size="s" variant="secondary" onClick={() => nav('/equipe')}>
          <Mic aria-hidden="true" />
          Côté coach
        </Button>
      </div>
      <div className={s.vn}>
        {VOICES.map((v, i) => {
          const who = personOf(v.who);
          return (
            <motion.div key={i} className={s.vi} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...tween.l, delay: 0.2 + i * 0.08 }}>
              <span className={s.vh}>
                <Avatar initials={who.id} role="staff" size={24} />
                <b>{who.name}</b>
                <ClubDot id={v.club} />
                <span>· {v.at}</span>
                <span className={s.wave} aria-label={`Vocal de ${v.secs} secondes`}>
                  {Array.from({ length: 14 }, (_, k) => (
                    <i key={k} style={{ height: 4 + Math.abs(Math.sin(k * 1.7 + i)) * 14 }} />
                  ))}
                </span>
                <span>0:{String(v.secs).padStart(2, '0')}</span>
              </span>
              <span className={s.vq}>{v.quote}</span>
              <span className={s.vr}>
                {v.out.map((o) => (
                  <Pill key={o} tone="green" icon={<CircleCheck aria-hidden="true" />}>
                    {o}
                  </Pill>
                ))}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export function HomePage() {
  return (
    <div className={p.stack}>
      <Hero />
      <Kpis />
      <section className={p.g2}>
        <ClubsCard />
        <WeeksCard />
      </section>
      <section className={p.g75}>
        <QueueCard />
        <VoiceCard />
      </section>
    </div>
  );
}
