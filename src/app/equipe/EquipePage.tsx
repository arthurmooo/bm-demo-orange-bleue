import { BatteryFull, CalendarCheck, Check, ChevronLeft, ChevronRight, Dumbbell, Lock, Mic, Plus, Scale, Signal, Sparkles, Square, Target, TriangleAlert, Wifi } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Pill, Tag } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Wave } from '@/components/ui/Dictation';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { dur, ease, spring, tween } from '@/lib/motion';
import { addDays, TODAY } from '@/data/demo';
import mark from '@/assets/mark-ob.svg';
import { ClubDot } from '../home/HomePage';
import { useStore } from '../store';
import s from './Equipe.module.css';

type Phase = 'day' | 'member' | 'rec' | 'fiche' | 'saved';

const TEXT = 'Bilan de Léa Martin. Soixante-cinq kilos, moins trois depuis septembre. Elle a mal au genou gauche, on remplace les fentes par de la presse à cuisses. Elle est motivée, on garde trois séances par semaine. Prochain bilan en février.';
const WORDS = TEXT.split(' ');
const NEXT = addDays(TODAY, 90);
const nextRaw = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }).format(NEXT).replace('.', '');
const nextLbl = nextRaw.charAt(0).toUpperCase() + nextRaw.slice(1);
const DONE_ID = 'equipe-lea';
const MEMO_ID = 'equipe-memo';

const FIELDS = [
  { k: 'poids', label: 'Poids', icon: Scale, value: (memo: boolean) => <>65 kg · <em>−3 kg</em> depuis sept.</> },
  { k: 'obj', label: 'Objectif', icon: Target, value: () => <>Perte de poids · en bonne voie</> },
  { k: 'att', label: 'Point d’attention', icon: TriangleAlert, warn: true, value: () => <>Douleur au genou gauche</> },
  { k: 'prog', label: 'Programme ajusté', icon: Dumbbell, value: (memo: boolean) => (memo ? <>Presse à cuisses et vélo, 3 séances/sem.</> : <>Presse à cuisses à la place des fentes, 3 séances/sem.</>) },
  { k: 'next', label: 'Prochain bilan', icon: CalendarCheck, value: () => <>{nextLbl}</> },
];

const MEMORY = [
  { who: 'EP', name: 'Emma P.', club: 'gontier' as const, title: 'Genou sensible', tip: 'Remplacer aussi les squats sautés par du vélo, 10 minutes en fin de séance.', n: 12 },
  { who: 'MF', name: 'Manon F.', club: 'craon' as const, title: 'Reprise après une opération du dos', tip: 'Mobilité d’abord, gainage à partir de la 3e semaine.', n: 8 },
  { who: 'TR', name: 'Thomas R.', club: 'laval' as const, title: 'Préparation trail', tip: 'Deux séances cardio de plus, proprioception de la cheville.', n: 6 },
];

/* ------------------------------------------------------------------ Téléphone */

function StatusBar() {
  return (
    <div className={s.status}>
      <span>9:41</span>
      <span>
        <Signal aria-hidden="true" />
        <Wifi aria-hidden="true" />
        <BatteryFull aria-hidden="true" />
      </span>
    </div>
  );
}

const paneAnim = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: dur.m, ease: ease.out },
};

function DayPane({ done, onOpen }: { done: boolean; onOpen: () => void }) {
  const n = done ? 2 : 1;
  return (
    <motion.div className={s.pane} {...paneAnim}>
      <div className={s.aHead}>
        <img src={mark} alt="" />
        <div>
          <b>Ma journée</b>
          <span>Julie M. · Laval Nord</span>
        </div>
        <Avatar initials="JM" role="staff" size={32} />
      </div>
      <div className={s.prog}>
        <div>
          <b>{n}</b>
          <small>/3</small>
          <div className={s.progL}>bilans faits</div>
        </div>
        <div className={s.progBar}>
          <motion.i initial={false} animate={{ width: `${(n / 3) * 100}%` }} transition={spring.soft} />
        </div>
      </div>
      <p className={s.sh}>Bilans du jour</p>
      <div className={s.card}>
        <span className={s.time}>
          9 h 00<small>fait</small>
        </span>
        <span className={s.cBody}>
          <b>Thomas Garnier</b>
          <span>Coaching · Prise de masse</span>
        </span>
        <span className={s.chk}>
          <Check aria-hidden="true" />
        </span>
      </div>
      <button type="button" className={cn(s.card, s.cardBtn, !done && s.cardNext)} onClick={onOpen}>
        <span className={s.time}>
          10 h 30<small>{done ? 'fait' : 'à faire'}</small>
        </span>
        <span className={s.cBody}>
          <b>Léa Martin</b>
          <span>Coaching · Perte de poids</span>
        </span>
        {done ? (
          <motion.span className={s.chk} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy}>
            <Check aria-hidden="true" />
          </motion.span>
        ) : (
          <span className={s.go}>
            <ChevronRight aria-hidden="true" />
          </span>
        )}
      </button>
      <div className={s.card}>
        <span className={s.time}>
          17 h 30<small>à venir</small>
        </span>
        <span className={s.cBody}>
          <b>Hugo Lambert</b>
          <span>Confort · Remise en forme</span>
        </span>
        <span className={s.todo} />
      </div>
      <p className={s.sh} style={{ marginTop: 14 }}>
        Programmes à renouveler
      </p>
      <div className={s.card}>
        <span className={s.cBody}>
          <b>Inès Moreau</b>
          <span>Confort · avant vendredi</span>
        </span>
        <span className={s.todo} />
      </div>
      <div className={s.card}>
        <span className={s.cBody}>
          <b>Paul Girard</b>
          <span>Coaching · avant samedi</span>
        </span>
        <span className={s.todo} />
      </div>
    </motion.div>
  );
}

function MemberPane({ phase, words, shown, memo, onBack, onMic, onMemo, onSave }: { phase: Phase; words: number; shown: number; memo: boolean; onBack: () => void; onMic: () => void; onMemo: () => void; onSave: () => void }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (phase !== 'rec') return;
    setSecs(0);
    const t = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  const fiche = phase === 'fiche';
  return (
    <motion.div className={s.pane} {...paneAnim}>
      <button type="button" className={s.back} onClick={onBack}>
        <ChevronLeft aria-hidden="true" />
        Ma journée
      </button>
      <h2 className={s.mName}>Léa Martin</h2>
      <div className={s.chips}>
        <Tag tone="red">Coaching</Tag>
        <Tag>Perte de poids</Tag>
        <Tag>Bilan 3 sur 4</Tag>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'member' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={tween.m} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <p className={s.sh}>Dernier bilan · septembre</p>
            <div className={s.last}>
              <div className={s.lastI}>
                <span>Poids</span>
                <b>68 kg</b>
              </div>
              <div className={s.lastI}>
                <span>Séances / semaine</span>
                <b>3</b>
              </div>
            </div>
            <div className={s.micZone}>
              <motion.button type="button" className={s.mic} onClick={onMic} whileTap={{ scale: 0.94 }} aria-label="Dicter le bilan">
                <Mic aria-hidden="true" />
                <motion.span className={s.ring} animate={{ scale: [1, 1.35], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
              </motion.button>
              <span className={s.micLbl}>Dicter le bilan</span>
            </div>
          </motion.div>
        )}

        {phase === 'rec' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={tween.m} style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', gap: 14 }}>
            <div className={s.waveBox}>
              <Wave levels={() => null} live={false} bars={22} />
            </div>
            <span className={s.timer}>
              <i />
              0:{String(secs).padStart(2, '0')}
            </span>
            <div className={s.live}>
              {WORDS.slice(0, words).join(' ')}
              <span className={s.cursor} />
            </div>
            <motion.button type="button" className={cn(s.mic, s.micRec)} onClick={onMic} whileTap={{ scale: 0.94 }} aria-label="Arrêter" style={{ width: 72, height: 72, marginTop: 'auto' }}>
              <Square aria-hidden="true" style={{ width: 26, height: 26 }} />
            </motion.button>
          </motion.div>
        )}

        {fiche && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={tween.m} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className={s.fields}>
              {FIELDS.slice(0, shown).map((f) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.k} className={s.field} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring.snappy}>
                    <span className={cn(s.fIc, f.warn && s.fIcWarn)}>
                      <Icon aria-hidden="true" />
                    </span>
                    <span>
                      <span>{f.label}</span>
                      <b>{f.value(memo)}</b>
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <AnimatePresence>
              {shown >= 4 && (
                <motion.div className={s.memo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...tween.l, delay: 0.2 }}>
                  <span className={s.memoH}>
                    <Sparkles aria-hidden="true" />
                    Conseil d’Emma P. · 12 bilans similaires
                  </span>
                  <p>
                    Pour un <b>genou sensible</b>, remplacer aussi les squats sautés par du vélo, 10 minutes en fin de séance.
                  </p>
                  <button type="button" className={cn(s.memoBtn, memo && s.memoOn)} onClick={onMemo} disabled={memo}>
                    {memo ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
                    {memo ? 'Ajouté au programme' : 'Ajouter au programme'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className={s.cta} style={{ marginTop: 'auto', paddingTop: 12 }}>
              <motion.button type="button" className={s.ctaBtn} onClick={onSave} disabled={shown < FIELDS.length} animate={{ opacity: shown < FIELDS.length ? 0.4 : 1 }} whileTap={{ scale: 0.97 }}>
                <Check aria-hidden="true" />
                Valider le bilan
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Phone({ phase, setPhase, words, shown, memo, onMemo, onSave, done }: { phase: Phase; setPhase: (p: Phase) => void; words: number; shown: number; memo: boolean; onMemo: () => void; onSave: () => void; done: boolean }) {
  return (
    <div className={s.phone}>
      <div className={s.screen}>
        <span className={s.notch} />
        <StatusBar />
        <div className={s.app}>
          <AnimatePresence mode="popLayout" initial={false}>
            {phase === 'day' ? (
              <DayPane key="day" done={done} onOpen={() => !done && setPhase('member')} />
            ) : (
              <MemberPane key="member" phase={phase} words={words} shown={shown} memo={memo} onBack={() => setPhase('day')} onMic={() => setPhase(phase === 'rec' ? 'fiche' : 'rec')} onMemo={onMemo} onSave={onSave} />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {phase === 'saved' && (
              <motion.div className={s.doneOv} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={tween.m}>
                <div>
                  <motion.span className={s.doneIc} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy}>
                    <Check aria-hidden="true" />
                  </motion.span>
                  <b>Bilan enregistré</b>
                  <span>Prochain bilan planifié</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Côté Nicolas */

function Kpis({ done }: { done: boolean }) {
  const n = done ? 2 : 1;
  return (
    <div className={s.kRow}>
      <Card className={s.k}>
        <span className={s.kL}>Bilans faits aujourd’hui · Laval Nord</span>
        <div className={s.kN}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={n} className={done ? s.bump : undefined} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={spring.snappy} style={{ display: 'inline-block' }}>
              {n}
            </motion.span>
          </AnimatePresence>
          <small>/ 3</small>
        </div>
        <div className={s.kBar}>
          <motion.i initial={false} animate={{ width: `${(n / 3) * 100}%` }} transition={spring.soft} />
        </div>
      </Card>
      <Card className={s.k}>
        <span className={s.kL}>Fiches dictées ce matin · 5 clubs</span>
        <div className={s.kN}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={done ? 4 : 3} className={done ? s.bump : undefined} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={spring.snappy} style={{ display: 'inline-block' }}>
              {done ? 4 : 3}
            </motion.span>
          </AnimatePresence>
        </div>
      </Card>
      <Card className={s.k}>
        <span className={s.kL}>Conseils de l’équipe utilisés · ce mois</span>
        <div className={s.kN}>{done ? 27 : 26}</div>
      </Card>
    </div>
  );
}

function FicheCard({ shown, memo, done, phase }: { shown: number; memo: boolean; done: boolean; phase: Phase }) {
  const filled = done ? FIELDS.length : phase === 'fiche' ? shown : 0;
  return (
    <Card className={s.fiche}>
      <div className={s.fHead}>
        <h3>Léa Martin</h3>
        <ClubDot id="laval" />
        <Tag tone="red">Coaching</Tag>
        {done ? (
          <Pill tone="green" icon={<Check aria-hidden="true" />}>
            Bilan 3 sur 4 fait
          </Pill>
        ) : phase === 'rec' ? (
          <span className={s.liveDot}>
            <i />
            Julie dicte…
          </span>
        ) : (
          <span className={s.upd}>Bilan prévu à 10 h 30 avec Julie M.</span>
        )}
      </div>
      <div className={s.fGrid}>
        {FIELDS.map((f, i) => (
          <motion.div key={f.k} className={cn(s.fCell, i < filled && !done && s.fCellNew)} layout>
            <span>{f.label}</span>
            <AnimatePresence mode="wait" initial={false}>
              {i < filled ? (
                <motion.b key="v" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={tween.m}>
                  {f.value(memo)}
                </motion.b>
              ) : (
                <motion.span key="s" className={s.sk} exit={{ opacity: 0 }} />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function MemoryCard({ active, used }: { active: boolean; used: boolean }) {
  return (
    <Card className={s.mem}>
      <div className={s.fHead}>
        <h3>Mémoire de l’équipe</h3>
        <span className={s.lock}>
          <Lock aria-hidden="true" />
          Reste dans vos clubs
        </span>
      </div>
      <div className={s.memList}>
        {MEMORY.map((m, i) => (
          <div key={m.title} className={cn(s.memI, i === 0 && active && s.memOn)}>
            <Avatar initials={m.who} role="staff" size={36} />
            <span>
              <b>{m.title}</b>
              <span>
                {m.name} · {m.tip}
              </span>
            </span>
            <span className={s.memN}>
              <b>{i === 0 && used ? m.n + 1 : m.n}</b>
              bilans
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EquipePage() {
  const { done: doneMap, markDone, addLog } = useStore();
  const done = !!doneMap[DONE_ID];
  const [phase, setPhase] = useState<Phase>('day');
  const [words, setWords] = useState(0);
  const [shown, setShown] = useState(0);
  const memo = !!doneMap[MEMO_ID];
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Dictée simulée : les mots arrivent comme une transcription en direct.
  useEffect(() => {
    if (phase !== 'rec') return;
    setWords(0);
    const t = setInterval(() => setWords((w) => Math.min(w + 1, WORDS.length)), 150);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase === 'rec' && words >= WORDS.length) {
      const t = setTimeout(() => setPhase('fiche'), 700);
      return () => clearTimeout(t);
    }
  }, [phase, words]);

  // La fiche se remplit champ par champ.
  useEffect(() => {
    if (phase !== 'fiche') return;
    setShown(0);
    const t = setInterval(() => setShown((n) => (n >= FIELDS.length ? n : n + 1)), 420);
    return () => clearInterval(t);
  }, [phase]);

  const onSave = () => {
    setPhase('saved');
    markDone(DONE_ID);
    addLog('Bilan de Léa Martin dicté par Julie M. et enregistré, prochain bilan planifié');
    toast('Bilan de Léa Martin enregistré', { tone: 'ok', description: `Prochain bilan ${nextRaw}.` });
    timers.current.push(setTimeout(() => setPhase('day'), 1500));
  };
  const onMemo = () => {
    markDone(MEMO_ID);
    addLog('Conseil d’Emma P. ajouté au programme de Léa Martin');
  };

  return (
    <div className={s.wrap}>
      <div className={s.phoneCol}>
        <Phone phase={phase} setPhase={setPhase} words={words} shown={shown} memo={memo} onMemo={onMemo} onSave={onSave} done={done} />
      </div>
      <div className={s.right}>
        <Card style={{ padding: '24px 28px' }}>
          <span className={s.liveDot}>
            <i />
            En direct
          </span>
          <h1 className={s.hTitle} style={{ marginTop: 12 }}>
            Julie dicte son bilan. <b>Vous le voyez au même moment.</b>
          </h1>
          <p className={s.hSub}>Ce que voit Nicolas, pendant que le coach reste avec l’adhérente.</p>
        </Card>
        <Kpis done={done} />
        <FicheCard shown={shown} memo={memo} done={done} phase={phase} />
        <MemoryCard active={phase === 'fiche' && shown >= 4} used={memo} />
      </div>
    </div>
  );
}
