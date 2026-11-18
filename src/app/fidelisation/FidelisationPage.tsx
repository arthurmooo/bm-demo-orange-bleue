import { CalendarClock, ChevronDown, CircleCheck, Dumbbell, History, Mail, MessageSquareText, Send, UserRound } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState, type ReactNode } from 'react';
import { Sparkline } from '@/components/charts/Sparkline';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NumberTicker } from '@/components/ui/NumberTicker';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { collapse, spring, tween } from '@/lib/motion';
import { absentDays, CLUBS, clubOf, dayShort, isAbsent, MEMBERS, personOf, type ClubId, type Member } from '@/data/demo';
import { ClubDot } from '../home/HomePage';
import { useStore } from '../store';
import p from '../page.module.css';
import s from './Fidelisation.module.css';

const SLOTS = ['jeudi à 18 h', 'samedi à 10 h', 'mardi à 12 h 30', 'lundi à 19 h', 'mercredi à 17 h 30', 'vendredi à 9 h'];
const idn = (m: Member) => Number(m.id.slice(1));
const WOMEN = new Set(['Léa', 'Chloé', 'Inès', 'Jade', 'Louise', 'Alice', 'Lina', 'Rose', 'Anna', 'Mila', 'Zoé', 'Sophie', 'Nathalie', 'Isabelle', 'Valérie', 'Sandrine', 'Céline', 'Aurélie', 'Émilie', 'Marion', 'Pauline', 'Justine', 'Elodie', 'Clara', 'Agathe']);
/** Objectif affiché : « reprise après grossesse » seulement pour une adhérente. */
const goalOf = (m: Member) => (m.goal === 'Reprise après grossesse' && !WOMEN.has(m.first) ? 'Remise en forme' : m.goal);
const firstName = (id: string) => personOf(id).name.split(' ')[0]!;

/** Fréquentation des 8 dernières semaines : régulière, puis qui chute jusqu'à zéro (3 semaines sans venir). */
function visitsOf(m: Member) {
  const n = idn(m);
  const base = 2 + (n % 3);
  return Array.from({ length: 8 }, (_, w) => {
    if (w >= 5) return 0;
    if (w >= 3) return Math.max(0, base - (w - 2) - (n % 2));
    return base + ((n + w) % 2);
  });
}

function parts(m: Member): { text: string; mark?: boolean }[] {
  const coach = firstName(m.coach);
  return [
    { text: `Bonjour ${m.first} ! C’est ${coach}, de L’Orange Bleue ${clubOf(m.club).name}. Ça fait un moment depuis ta séance du ` },
    { text: dayShort(m.lastVisit), mark: true },
    { text: ', tout va bien ?\nPour ton objectif ' },
    { text: goalOf(m).toLowerCase(), mark: true },
    { text: ', je te garde un créneau ' },
    { text: SLOTS[idn(m) % SLOTS.length]!, mark: true },
    { text: ' pour reprendre en douceur. Ça te dit ?\n' },
    { text: coach, mark: true },
  ];
}
const messageOf = (m: Member) => parts(m).map((x) => x.text).join('');

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className={s.chip}>
      {icon}
      {children}
    </span>
  );
}

function Comparison({ m }: { m: Member }) {
  const coach = personOf(m.coach);
  return (
    <section className={s.cmp}>
      <Card className={s.side}>
        <div className={s.sideH}>
          <span className={s.sideT}>
            <Mail aria-hidden="true" />
            Message standard
          </span>
          <Pill>Le même pour tous</Pill>
        </div>
        <div className={s.std}>
          <span className={s.stdFrom}>À : {m.first.toLowerCase()}.{m.last.toLowerCase()}@…</span>
          <span>Bonjour,</span>
          <span>Nous avons remarqué que vous n’êtes pas venu à la salle depuis quelque temps. Nous espérons vous revoir très bientôt !</span>
          <span>L’équipe L’Orange Bleue</span>
        </div>
      </Card>
      <Card className={s.side}>
        <div className={s.sideH}>
          <span className={s.sideT}>
            <MessageSquareText aria-hidden="true" style={{ color: 'var(--ac)' }} />
            Préparé pour {m.first}
          </span>
          <Pill tone="green" icon={<CircleCheck aria-hidden="true" />}>
            Prêt à envoyer
          </Pill>
        </div>
        <div className={s.prep}>
          <span className={s.phoneH}>
            <Avatar initials={coach.id} role="staff" size={26} />
            <b>{coach.name}</b>
            <span>· SMS</span>
          </span>
          <motion.div className={s.bubble} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...spring.soft, delay: 0.25 }}>
            {parts(m).map((x, i) => (x.mark ? <mark key={i}>{x.text}</mark> : <span key={i}>{x.text}</span>))}
          </motion.div>
          <div className={s.chips}>
            <Chip icon={<History />}>Dernière séance</Chip>
            <Chip icon={<Dumbbell />}>Son objectif</Chip>
            <Chip icon={<CalendarClock />}>Un créneau</Chip>
            <Chip icon={<UserRound />}>Son coach</Chip>
          </div>
        </div>
      </Card>
    </section>
  );
}

function Row({ m, sent, onSend }: { m: Member; sent: boolean; onSend: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => messageOf(m));
  const coach = personOf(m.coach);
  return (
    <motion.div layout="position" transition={spring.layout} className={cn(s.rowWrap, sent && s.sent)}>
      <div className={s.row}>
        <span className={s.who}>
          <Avatar initials={`${m.first[0]}${m.last[0]}`} role="brand" size={34} />
          <span className={s.name}>
            <b>
              {m.first} {m.last}
            </b>
            <ClubDot id={m.club} />
          </span>
        </span>
        <span className={s.spark}>
          <Sparkline values={visitsOf(m)} tone="bad" height={34} />
        </span>
        <span className={s.days}>
          {absentDays(m)}
          <small>jours</small>
        </span>
        <span className={s.goal}>{goalOf(m)}</span>
        <span className={s.coach}>
          <Avatar initials={coach.id} role="staff" size={24} />
          {coach.name}
        </span>
        <span className={s.acts}>
          <AnimatePresence mode="popLayout" initial={false}>
            {sent ? (
              <motion.span key="ok" className={s.ok} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={spring.snappy}>
                <CircleCheck aria-hidden="true" />
                Envoyé par {firstName(m.coach)}
              </motion.span>
            ) : (
              <motion.span key="a" className={s.acts} exit={{ opacity: 0, scale: 0.94 }}>
                <Button size="s" variant="ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
                  Message
                  <ChevronDown className={cn(s.chev, open && s.chevOpen)} aria-hidden="true" />
                </Button>
                <Button
                  size="s"
                  variant="primary"
                  onClick={() => {
                    setOpen(false);
                    onSend(text);
                  }}
                >
                  Envoyer
                </Button>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>
      <AnimatePresence initial={false}>
        {open && !sent && (
          <motion.div key="exp" className={s.exp} {...collapse}>
            <div className={s.expIn}>
              <TextArea value={text} onChange={setText} minHeight={96} />
              <Button size="s" onClick={() => setText(messageOf(m))}>
                Rétablir
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FidelisationPage() {
  const { club, done, markDone, addLog } = useStore();
  const [all, setAll] = useState(false);

  const focus: ClubId = useMemo(() => {
    if (club !== 'all') return club;
    const n = (id: ClubId) => MEMBERS.filter((m) => m.club === id && isAbsent(m)).length;
    return [...CLUBS].sort((a, b) => n(b.id) - n(a.id))[0]!.id;
  }, [club]);

  const absents = useMemo(() => {
    // Les plus à risque d'abord : formule avec suivi, puis l'absence la plus longue.
    const w = (m: Member) => (m.formule === 'coaching' ? 30 : m.formule === 'confort' ? 15 : 0) + absentDays(m);
    return MEMBERS.filter((m) => m.club === focus && isAbsent(m)).sort((a, b) => w(b) - w(a));
  }, [focus]);

  const key = (m: Member) => `fid-${m.id}`;
  const left = absents.filter((m) => !done[key(m)]);
  const featured = absents.find((m) => m.first === 'Chloé' && goalOf(m) !== 'Reprise après grossesse') ?? absents.find((m) => goalOf(m) === 'Préparation trail' || goalOf(m) === 'Perte de poids') ?? absents[0];
  const shown = all ? absents : absents.slice(0, 8);
  const c = clubOf(focus);

  const send = (m: Member) => {
    markDone(key(m));
    addLog(`Message de reprise envoyé à ${m.first} ${m.last} (${c.name})`, m.coach);
  };

  return (
    <div className={p.stack}>
      <div className={p.hd}>
        <div>
          <h1 className={cn(p.h1, s.h1)}>
            <b>
              <NumberTicker value={left.length} locale="fr" />
            </b>{' '}
            {left.length > 1 ? 'adhérents' : 'adhérent'} de {c.name} ne sont pas venus depuis 3 semaines
          </h1>
          <p className={s.sub}>Un message prêt pour chacun, signé de son coach.</p>
        </div>
        <Button
          variant="primary"
          disabled={left.length === 0}
          onClick={() => {
            const n = left.length;
            left.forEach(send);
            toast(`${n} messages envoyés`, { tone: 'ok', description: c.name });
          }}
        >
          <Send aria-hidden="true" />
          {left.length ? `Envoyer les ${left.length}` : 'Tout est envoyé'}
        </Button>
      </div>

      {featured && <Comparison m={featured} />}

      <Card>
        <div className={s.lh}>
          <h3>Les plus à risque d’abord</h3>
          <Pill tone={left.length ? 'amber' : 'green'}>{left.length ? `${left.length} à envoyer` : 'Tous relancés'}</Pill>
        </div>
        <div className={s.list}>
          {shown.map((m) => (
            <Row
              key={m.id}
              m={m}
              sent={!!done[key(m)]}
              onSend={() => {
                send(m);
                toast(`Message envoyé à ${m.first}`, { tone: 'ok', description: `Signé ${firstName(m.coach)} · ${c.name}` });
              }}
            />
          ))}
        </div>
        {absents.length > 8 && (
          <motion.div className={s.more} layout transition={tween.m}>
            <Button size="s" variant="ghost" onClick={() => setAll((x) => !x)}>
              {all ? 'Réduire' : `Voir les ${absents.length}`}
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
