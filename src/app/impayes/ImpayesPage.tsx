import { CircleCheck, Clock, MessageSquareText, Phone, Send } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { NumberTicker } from '@/components/ui/NumberTicker';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { dur, ease, spring } from '@/lib/motion';
import { CLUBS, clubOf, DEBT_STAGES, DEBTS, euro, personOf, relDay, TODAY, type ClubId, type Debt, type DebtStage } from '@/data/demo';
import { ClubDot } from '../home/HomePage';
import { useStore } from '../store';
import p from '../page.module.css';
import s from './Impayes.module.css';

const OWNERS: { id: string; clubs: ClubId[] }[] = [
  { id: 'NI', clubs: ['laval', 'mayenne'] },
  { id: 'HB', clubs: ['gontier', 'craon'] },
  { id: 'CL', clubs: ['sable'] },
];

const STAGE_COLOR: Record<DebtStage, string> = { new: 'var(--ko)', contacted: 'var(--wa)', promise: 'var(--ac)', paid: 'var(--score-hi)' };
const first = (id: string) => personOf(id).name.split(' ')[0]!;

/** Répartition des dossiers ouverts entre les étapes, mélangée entre les clubs (les réglés restent réglés). */
export const BASE: Record<string, DebtStage> = (() => {
  const open = DEBTS.filter((d) => d.stage !== 'paid');
  const out: Record<string, DebtStage> = {};
  open.forEach((d, i) => {
    const k = (i * 37) % open.length;
    out[d.id] = k < open.length * 0.38 ? 'new' : k < open.length * 0.76 ? 'contacted' : 'promise';
  });
  // Chaque responsable a des dossiers ouverts : un dossier réglé de Sablé échange son état avec un dossier
  // ouvert du même montant d'un autre club (le total reste identique).
  const taken = new Set<string>();
  DEBTS.filter((d) => d.stage === 'paid' && d.member.club === 'sable').forEach((d, i) => {
    const twin = open.find((o) => o.member.club !== 'sable' && o.amount === d.amount && !taken.has(o.id));
    if (!twin) return;
    taken.add(twin.id);
    out[d.id] = out[twin.id]!;
    out[twin.id] = 'paid';
    if (i === 0) out[d.id] = 'new';
  });
  return out;
})();
const CAP = 5;

type View = Debt & { stageNow: DebtStage; last: Date | null; via: Debt['channel'] };

function useDebts(): View[] {
  const { club, debtStage, done } = useStore();
  return DEBTS.filter((d) => club === 'all' || d.member.club === club).map((d) => {
    const sentNow = !!done[`dsent-${d.id}`];
    const base = BASE[d.id] ?? d.stage;
    const last = sentNow ? TODAY : base === 'new' ? null : (d.lastAction ?? TODAY);
    return { ...d, stageNow: debtStage[d.id] ?? base, last, via: sentNow ? 'SMS' : base === 'new' ? null : (d.channel ?? 'SMS') };
  });
}

const smsOf = (d: Debt) =>
  `Bonjour ${d.member.first}, c’est ${first(d.owner)} de L’Orange Bleue ${clubOf(d.member.club).name}. ${d.months > 1 ? `Vos ${d.months} derniers prélèvements ne sont pas passés` : 'Votre dernier prélèvement n’est pas passé'} (${euro(d.amount, 2)}). Vous pouvez régulariser ici : regle.exemple.fr/${d.id}, ou passer à l’accueil, on trouvera une solution ensemble. Bonne journée !`;

function Owners({ list }: { list: View[] }) {
  const { club } = useStore();
  const owners = OWNERS.filter((o) => club === 'all' || o.clubs.includes(club));
  return (
    <section className={owners.length > 1 ? p.g3 : undefined}>
      {owners.map((o, i) => {
        const mine = list.filter((d) => o.clubs.includes(d.member.club));
        const open = mine.filter((d) => d.stageNow !== 'paid');
        const amount = open.reduce((a, d) => a + d.amount, 0);
        const relanced = open.filter((d) => d.stageNow !== 'new' && d.last && (TODAY.getTime() - d.last.getTime()) / 86_400_000 <= 7).length;
        const pct = open.length ? Math.round((relanced / open.length) * 100) : 100;
        const who = personOf(o.id);
        return (
          <Card key={o.id} className={s.own}>
            <div className={s.ownH}>
              <Avatar initials={o.id} role={o.id === 'NI' ? 'brand' : 'staff'} size={40} />
              <span className={s.ownN}>
                <b>{who.name}</b>
                <span className={s.ownClubs}>
                  {o.clubs.map((c) => (
                    <ClubDot key={c} id={c} />
                  ))}
                </span>
              </span>
              <span className={s.ownAmt}>
                <b>{euro(Math.round(amount))}</b>
                <span>{open.length} dossiers</span>
              </span>
            </div>
            <div>
              <div className={s.relH}>
                <span>Relancés cette semaine</span>
                <span>
                  <b>{relanced}</b> / {open.length}
                </span>
              </div>
              <div className={s.bar}>
                <motion.i style={{ width: `${pct}%`, background: pct < 50 ? 'var(--ko)' : pct < 75 ? 'var(--wa)' : 'var(--score-hi)' }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: dur.xl, ease: ease.out, delay: 0.2 + i * 0.08 }} />
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}

function DebtCard({ d, onRelance }: { d: View; onRelance: (d: View) => void }) {
  const { setDebtStage, addLog } = useStore();
  const owner = personOf(d.owner);
  const ChannelIcon = d.via === 'Appel' ? Phone : MessageSquareText;
  return (
    <motion.div layout layoutId={d.id} transition={spring.layout} className={cn(s.card, d.stageNow === 'new' && s.cardNew, d.stageNow === 'paid' && s.paid)}>
      <div className={s.cT}>
        <span>
          <span className={s.cName}>
            {d.member.first} {d.member.last}
          </span>
          <span className={s.cMeta}>
            <ClubDot id={d.member.club} />
          </span>
        </span>
        <span className={s.cAmt}>
          {euro(d.amount, 2)}
          <small>{d.months} mois</small>
        </span>
      </div>
      {d.stageNow !== 'paid' && <span className={s.cNote}>{d.note}</span>}
      <div className={s.cF}>
        <span className={s.cLast}>
          <Tooltip content={`${owner.name} · ${owner.role}`}>
            <span tabIndex={0}>
              <Avatar initials={owner.id} role={owner.id === 'NI' ? 'brand' : 'staff'} size={22} />
            </span>
          </Tooltip>
          {d.last ? (
            <>
              <ChannelIcon aria-hidden="true" />
              {relDay(d.last)}
            </>
          ) : (
            <>
              <Clock aria-hidden="true" />
              À relancer
            </>
          )}
        </span>
        {d.stageNow === 'new' && (
          <Button size="s" variant="primary" onClick={() => onRelance(d)}>
            Préparer la relance
          </Button>
        )}
        {d.stageNow === 'contacted' && (
          <Button
            size="s"
            variant="ghost"
            onClick={() => {
              setDebtStage(d.id, 'promise');
              addLog(`Promesse de paiement de ${d.member.first} ${d.member.last}`, d.owner);
            }}
          >
            Promesse reçue
          </Button>
        )}
        {d.stageNow === 'promise' && (
          <Button
            size="s"
            onClick={() => {
              setDebtStage(d.id, 'paid');
              addLog(`Impayé réglé · ${d.member.first} ${d.member.last} · ${euro(d.amount, 2)}`, d.owner);
              toast(`${euro(d.amount, 2)} réglés`, { tone: 'ok', description: `${d.member.first} ${d.member.last}` });
            }}
          >
            Marquer réglé
          </Button>
        )}
        {d.stageNow === 'paid' && (
          <span className={s.ok}>
            <CircleCheck aria-hidden="true" />
            Réglé
          </span>
        )}
      </div>
    </motion.div>
  );
}

function RelanceDialog({ d, onClose }: { d: View | null; onClose: () => void }) {
  const { setDebtStage, markDone, addLog } = useStore();
  const [text, setText] = useState('');
  const [forId, setForId] = useState<string | null>(null);
  if (d && forId !== d.id) {
    setForId(d.id);
    setText(smsOf(d));
  }
  return (
    <Dialog
      open={!!d}
      onOpenChange={(o) => !o && onClose()}
      title={d ? `Relance de ${d.member.first} ${d.member.last}` : ''}
      width={600}
      footer={
        d && (
          <>
            <Button onClick={onClose}>Annuler</Button>
            <Button
              variant="primary"
              onClick={() => {
                markDone(`dsent-${d.id}`);
                setDebtStage(d.id, 'contacted');
                addLog(`SMS de relance envoyé à ${d.member.first} ${d.member.last} (${euro(d.amount, 2)})`, d.owner);
                toast(`SMS envoyé à ${d.member.first}`, { tone: 'ok', description: `${euro(d.amount, 2)} · ${clubOf(d.member.club).name}` });
                onClose();
              }}
            >
              <Send aria-hidden="true" />
              Envoyer
            </Button>
          </>
        )
      }
    >
      {d && (
        <div className={s.sms}>
          <div className={s.facts}>
            <span className={s.fact}>
              Montant
              <b>{euro(d.amount, 2)}</b>
            </span>
            <span className={s.fact}>
              Depuis
              <b>{d.months} mois</b>
            </span>
            <span className={s.fact}>
              Motif
              <b>{d.note}</b>
            </span>
          </div>
          <span className={s.smsTo}>
            <Avatar initials={d.owner} role={d.owner === 'NI' ? 'brand' : 'staff'} size={24} />
            <span>
              SMS signé <b>{first(d.owner)}</b>
            </span>
          </span>
          <TextArea value={text} onChange={setText} minHeight={130} />
        </div>
      )}
    </Dialog>
  );
}

export function ImpayesPage() {
  const { club } = useStore();
  const list = useDebts();
  const [target, setTarget] = useState<View | null>(null);
  const [open_, setOpen_] = useState<Partial<Record<DebtStage, boolean>>>({});
  const open = list.filter((d) => d.stageNow !== 'paid');
  const total = Math.round(open.reduce((a, d) => a + d.amount, 0));
  const where = club === 'all' ? `${CLUBS.length} clubs` : clubOf(club).name;

  return (
    <div className={p.stack}>
      <div className={p.hd}>
        <div>
          <h1 className={cn(p.h1, s.h1)}>
            <b>
              <NumberTicker value={total} locale="fr" /> €
            </b>{' '}
            d’impayés, suivis au même endroit
          </h1>
          <p className={s.sub}>
            {open.length} dossiers · {where} · {club === 'all' ? '3 personnes, un seul suivi' : `suivi par ${personOf(OWNERS.find((o) => o.clubs.includes(club))!.id).name}`}
          </p>
        </div>
      </div>

      <Owners list={list} />

      <LayoutGroup>
        <section className={s.board}>
          {DEBT_STAGES.map((st) => {
            const items = list.filter((d) => d.stageNow === st.id).sort((a, b) => b.amount - a.amount);
            const shown = open_[st.id] ? items : items.slice(0, st.id === 'paid' ? 3 : CAP);
            const sum = items.reduce((a, d) => a + d.amount, 0);
            return (
              <div key={st.id} className={s.col}>
                <div className={s.colH}>
                  <i className={s.dot} style={{ background: STAGE_COLOR[st.id] }} />
                  <b>{st.label}</b>
                  <span className={s.colN}>{items.length}</span>
                  <span className={s.colS}>{euro(Math.round(sum))}</span>
                </div>
                <AnimatePresence initial={false}>
                  {shown.map((d) => (
                    <DebtCard key={d.id} d={d} onRelance={setTarget} />
                  ))}
                </AnimatePresence>
                {items.length > shown.length && (
                  <Button size="s" variant="ghost" onClick={() => setOpen_((o) => ({ ...o, [st.id]: true }))}>
                    + {items.length - shown.length} {st.id === 'paid' ? 'réglés ce mois-ci' : 'autres'}
                  </Button>
                )}
              </div>
            );
          })}
        </section>
      </LayoutGroup>

      <RelanceDialog d={target} onClose={() => setTarget(null)} />
    </div>
  );
}
