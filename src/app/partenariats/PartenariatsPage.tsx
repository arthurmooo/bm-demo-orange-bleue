import { Check, ChevronRight, CircleCheck, Send, Target as TargetIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NumberTicker } from '@/components/ui/NumberTicker';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { spring, tween } from '@/lib/motion';
import { CLUBS, clubOf, num } from '@/data/demo';
import { ClubDot } from '../home/HomePage';
import { useStore } from '../store';
import { CLUB_POS, CRITERIA, message, STATUS, TARGETS, type Target, type TargetStatus } from './targets';
import p from '../page.module.css';
import s from './Partenariats.module.css';

/** Partenaires déjà signés (hors des 14 cibles). */
const SIGNED = 2;
const R15 = 62;

function useStatuses() {
  const { done } = useStore();
  return (t: Target): TargetStatus => (t.status === 'ready' && done[`p-${t.id}`] ? 'contacted' : t.status);
}

function Pipeline() {
  const statusOf = useStatuses();
  const count = (st: TargetStatus) => TARGETS.filter((t) => statusOf(t) === st).length;
  const steps = [
    { label: 'Message prêt', color: STATUS.ready.color, n: count('ready') },
    { label: 'Contacté', color: STATUS.contacted.color, n: count('contacted') },
    { label: 'Rendez-vous', color: STATUS.meeting.color, n: count('meeting') },
    { label: 'Signé', color: 'var(--ink)', n: SIGNED },
  ];
  return (
    <Card className={s.pipe}>
      {steps.map((x, i) => (
        <div key={x.label} className={s.st}>
          <span>
            <i style={{ background: x.color }} />
            {x.label}
          </span>
          <b>
            <NumberTicker value={x.n} locale="fr" />
          </b>
          {i < steps.length - 1 && (
            <span className={s.arrow} aria-hidden="true">
              <ChevronRight />
            </span>
          )}
        </div>
      ))}
    </Card>
  );
}

function MapCard({ sel, onSel }: { sel: string; onSel: (id: string) => void }) {
  const statusOf = useStatuses();
  return (
    <Card className={s.map}>
      <div className={p.ch} style={{ alignItems: 'center' }}>
        <div className={p.cht}>
          <h3>Autour de vos 5 clubs</h3>
        </div>
        <div className={s.leg}>
          {(Object.keys(STATUS) as TargetStatus[]).map((k) => (
            <span key={k}>
              <i style={{ background: STATUS[k].color }} />
              {STATUS[k].label}
            </span>
          ))}
        </div>
      </div>
      <svg className={s.svg} viewBox="20 20 620 400" role="img" aria-label="Carte schématique des clubs et des entreprises ciblées">
        <defs>
          <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#DCD9E4" />
          </pattern>
        </defs>
        <path d="M70 120 C 120 40, 260 20, 400 40 S 470 150, 430 230 S 300 410, 190 400 S 30 360, 40 250 S 40 160, 70 120 Z" fill="url(#dots)" />
        <path d="M395 40 C 470 60, 600 140, 620 260 S 560 410, 430 400 S 400 300, 430 230 S 460 120, 395 40 Z" fill="url(#dots)" opacity="0.55" />
        <path d="M398 42 C 470 150, 430 230, 430 230 S 395 320, 430 400" fill="none" stroke="#CFCBDA" strokeDasharray="4 6" strokeWidth="1.5" />
        <text x="96" y="78" fill="#9C99AE" fontSize="13" fontWeight="600" letterSpacing="2">MAYENNE</text>
        <text x="520" y="150" fill="#9C99AE" fontSize="13" fontWeight="600" letterSpacing="2">SARTHE</text>

        {CLUBS.map((c) => {
          const pos = CLUB_POS[c.id];
          return <circle key={`r-${c.id}`} cx={pos.x} cy={pos.y} r={R15} fill={c.color} fillOpacity="0.06" stroke={c.color} strokeOpacity="0.28" strokeDasharray="3 4" />;
        })}

        {TARGETS.map((t, i) => {
          const c = CLUB_POS[t.club];
          const x = c.x + t.dx;
          const y = c.y + t.dy;
          const st = statusOf(t);
          const r = 5 + Math.sqrt(t.staff) * 0.55;
          const on = sel === t.id;
          return (
            <g key={t.id} className={s.pt} onClick={() => onSel(t.id)} tabIndex={0} role="button" aria-label={t.name} onKeyDown={(e) => e.key === 'Enter' && onSel(t.id)}>
              <line x1={c.x} y1={c.y} x2={x} y2={y} stroke={STATUS[st].color} strokeOpacity={on ? 0.6 : 0.18} strokeWidth={on ? 1.6 : 1} />
              {on && <motion.circle cx={x} cy={y} r={r + 7} fill="none" stroke={STATUS[st].color} strokeWidth="2" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={spring.snappy} style={{ transformOrigin: `${x}px ${y}px` }} />}
              <motion.circle cx={x} cy={y} r={r} fill={STATUS[st].color} fillOpacity={0.88} stroke="#fff" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1, fill: STATUS[st].color }} transition={{ ...spring.soft, delay: 0.25 + i * 0.04 }} style={{ transformOrigin: `${x}px ${y}px` }} />
            </g>
          );
        })}

        {CLUBS.map((c) => {
          const pos = CLUB_POS[c.id];
          return (
            <g key={c.id}>
              <rect x={pos.x - 15} y={pos.y - 15} width="30" height="30" rx="9" fill="#1C1B39" />
              <circle cx={pos.x} cy={pos.y} r="6.5" fill="#EA5839" />
              <rect x={pos.x - c.name.length * 3.6 - 9} y={pos.y + 20} width={c.name.length * 7.2 + 18} height="22" rx="11" fill="#fff" stroke="#E5E3EB" />
              <text x={pos.x} y={pos.y + 35} textAnchor="middle" fill="#1C1B39" fontSize="12" fontWeight="600">
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}

function Panel({ t }: { t: Target }) {
  const { markDone, addLog } = useStore();
  const statusOf = useStatuses();
  const st = statusOf(t);
  const club = clubOf(t.club);
  const send = () => {
    markDone(`p-${t.id}`);
    addLog(`Proposition de partenariat envoyée · ${t.name}`);
    toast(`Message envoyé au CSE de ${t.name}`, { tone: 'ok' });
  };
  return (
    <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: tween.exit }} transition={tween.m} style={{ display: 'flex' }}>
      <Card className={s.panel} style={{ flex: 1 }}>
        <div className={s.ph}>
          <h2>{t.name}</h2>
          <div className={s.pm}>
            <span>{t.sector}</span>
            <span>·</span>
            <ClubDot id={t.club} />
            <span className={s.stat} style={{ background: `${STATUS[st].color}1A`, color: STATUS[st].color, marginLeft: 'auto' }}>
              <i style={{ background: STATUS[st].color }} />
              {STATUS[st].label}
            </span>
          </div>
        </div>
        <div className={s.facts}>
          <div className={s.fact}>
            <span>Salariés</span>
            <b>{num(t.staff)}</b>
          </div>
          <div className={s.fact}>
            <span>Du club</span>
            <b>{t.minutes} min</b>
          </div>
          <div className={s.fact}>
            <span>CSE</span>
            <b>{t.cse ? 'Oui' : 'Non'}</b>
          </div>
        </div>
        <div className={s.why}>
          <TargetIcon aria-hidden="true" />
          {t.why}
        </div>
        <div className={s.mh}>
          <h3>Message préparé</h3>
          <span>À : Responsable CSE</span>
        </div>
        <div className={s.msg}>{message(t, club.name)}</div>
        <div className={s.acts}>
          <AnimatePresence mode="popLayout" initial={false}>
            {st === 'ready' ? (
              <motion.span key="b" exit={{ opacity: 0, scale: 0.94 }}>
                <Button variant="primary" onClick={send}>
                  <Send aria-hidden="true" />
                  Valider l’envoi
                </Button>
              </motion.span>
            ) : (
              <motion.span key="d" className={s.sent} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={spring.snappy}>
                <CircleCheck aria-hidden="true" />
                {st === 'meeting' ? 'Rendez-vous à fixer' : 'Envoyé · relance prévue dans 7 j'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

function TargetList({ sel, onSel }: { sel: string; onSel: (id: string) => void }) {
  const statusOf = useStatuses();
  const rows = [...TARGETS].sort((a, b) => b.staff - a.staff);
  return (
    <Card className={s.tl}>
      <div className={s.th}>
        <span>Entreprise</span>
        <span>Salariés</span>
        <span>Club le plus proche</span>
        <span>Trajet</span>
        <span>Critères</span>
        <span>Statut</span>
      </div>
      {rows.map((t, i) => {
        const st = statusOf(t);
        return (
          <motion.button type="button" key={t.id} className={cn(s.tr, sel === t.id && s.trOn)} onClick={() => onSel(t.id)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...tween.l, delay: 0.1 + i * 0.03 }}>
            <span>
              <span className={s.tn}>{t.name}</span>
              <span className={s.ts}>{t.sector}</span>
            </span>
            <span className={s.tv}>{num(t.staff)}</span>
            <ClubDot id={t.club} />
            <span className={s.tv}>
              {t.minutes}
              <small>min</small>
            </span>
            <span className={s.tags}>
              {t.cse && <span className={s.tag}>CSE</span>}
              {t.shifts && <span className={s.tag}>Horaires décalés</span>}
              {t.staff >= 200 && <span className={s.tag}>200+</span>}
            </span>
            <span className={s.stat} style={{ background: `${STATUS[st].color}1A`, color: STATUS[st].color, justifySelf: 'start' }}>
              <i style={{ background: STATUS[st].color }} />
              {STATUS[st].label}
            </span>
          </motion.button>
        );
      })}
    </Card>
  );
}

export function PartenariatsPage() {
  const [sel, setSel] = useState('t5');
  const t = TARGETS.find((x) => x.id === sel)!;
  return (
    <div className={p.stack}>
      <div className={cn(p.hd, s.hd)}>
        <h1 className={p.h1}>
          <b>{TARGETS.length} entreprises</b> à moins de 15 minutes de vos clubs, sans partenariat
        </h1>
      </div>
      <div className={s.crit}>
        <span>Vos critères</span>
        {CRITERIA.map((c) => (
          <span key={c} className={s.cc}>
            <Check aria-hidden="true" />
            {c}
          </span>
        ))}
      </div>
      <Pipeline />
      <section className={s.grid}>
        <MapCard sel={sel} onSel={setSel} />
        <AnimatePresence mode="wait" initial={false}>
          <Panel key={t.id} t={t} />
        </AnimatePresence>
      </section>
      <TargetList sel={sel} onSel={setSel} />
    </div>
  );
}
