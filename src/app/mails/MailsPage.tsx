import { CircleCheck, FileSearch, PenLine, Send, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Pill } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { dur, ease, spring, tween } from '@/lib/motion';
import { ClubDot } from '../home/HomePage';
import { useStore } from '../store';
import { CATS, MAILS, type Mail } from './mails';
import p from '../page.module.css';
import s from './Mails.module.css';

const catOf = (id: Mail['kind']) => CATS.find((c) => c.id === id)!;

function SortCard({ left }: { left: number }) {
  const total = CATS.reduce((a, c) => a + c.count, 0);
  return (
    <Card className={s.sort}>
      <div className={p.ch} style={{ alignItems: 'center' }}>
        <div className={p.cht}>
          <h3>Triés ce matin à 6 h</h3>
        </div>
        <Pill tone="gray">{total} mails depuis hier</Pill>
      </div>
      <span className={s.bar} role="img" aria-label={CATS.map((c) => `${c.label} ${c.count}`).join(', ')}>
        {CATS.map((c, i) => (
          <Tooltip key={c.id} content={`${c.label} · ${c.id === 'reply' ? left : c.count}`}>
            <motion.i style={{ background: c.color }} initial={{ opacity: 0, scaleX: 0, flexGrow: c.count }} animate={{ opacity: 1, scaleX: 1, flexGrow: c.id === 'reply' ? Math.max(left, 0.3) : c.count }} transition={{ duration: dur.l, ease: ease.out, delay: 0.1 + i * 0.07 }} />
          </Tooltip>
        ))}
      </span>
      <div className={s.cats}>
        {CATS.map((c) => (
          <span key={c.id} className={cn(s.cat, c.id === 'reply' && s.catOn)}>
            <i style={{ background: c.color }} />
            {c.label}
            <b>{c.id === 'reply' ? left : c.count}</b>
          </span>
        ))}
      </div>
    </Card>
  );
}

function Reader({ mail, onSent }: { mail: Mail; onSent: () => void }) {
  const [draft, setDraft] = useState(mail.draft);
  const [edit, setEdit] = useState(false);
  const c = catOf(mail.kind);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: tween.exit }} transition={tween.m}>
      <Card className={s.read}>
        <div className={s.rh}>
          <span className={s.av} style={{ background: c.color }}>
            {mail.initials}
          </span>
          <div style={{ minWidth: 0 }}>
            <h2>{mail.subject}</h2>
            <span className={s.rfrom}>
              {mail.from} · {mail.org} · {mail.at}
            </span>
          </div>
        </div>
        <div className={s.body}>{mail.body}</div>

        <div className={s.dh}>
          <FileSearch aria-hidden="true" size={18} color="var(--tx-3)" />
          <h3>Retrouvé pour répondre</h3>
        </div>
        <div className={s.found}>
          {mail.found.map((f, i) => {
            const miss = f.detail === 'Introuvable';
            return (
              <motion.div key={f.label} className={cn(s.fi, miss && s.fiMiss)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...tween.l, delay: 0.15 + i * 0.08 }}>
                <span>
                  <CircleCheck aria-hidden="true" />
                  {f.label}
                </span>
                <b>{f.detail}</b>
              </motion.div>
            );
          })}
        </div>

        <div className={s.dh}>
          <h3>Brouillon</h3>
          <Pill tone="green" icon={<Sparkles aria-hidden="true" />}>
            Prêt
          </Pill>
        </div>
        {edit ? (
          <TextArea value={draft} onChange={setDraft} minHeight={200} autoFocus />
        ) : (
          <div className={s.body} style={{ background: 'var(--surf)', borderColor: 'var(--sel-bd)' }}>
            {draft}
          </div>
        )}
        <div className={s.acts}>
          <Button onClick={() => setEdit((e) => !e)}>
            <PenLine aria-hidden="true" />
            {edit ? 'Terminer' : 'Modifier'}
          </Button>
          <Button variant="primary" onClick={onSent}>
            <Send aria-hidden="true" />
            Envoyer
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export function MailsPage() {
  const { done, markDone, addLog } = useStore();
  const list = MAILS.filter((m) => !done[m.id]);
  const [sel, setSel] = useState<string>(MAILS[0]!.id);
  const current = list.find((m) => m.id === sel) ?? list[0];

  const send = (m: Mail) => {
    const i = list.indexOf(m);
    const next = list[i + 1] ?? list[i - 1];
    markDone(m.id);
    addLog(`Réponse envoyée · ${m.org} · ${m.subject}`);
    toast(`Réponse envoyée à ${m.org}`, { tone: 'ok' });
    if (next) setSel(next.id);
    if (list.length === 1) markDone('q-mail');
  };

  return (
    <div className={p.stack}>
      <div className={cn(p.hd, s.hd)}>
        <h1 className={p.h1}>
          41 mails depuis hier. <b>{list.length === 0 ? 'Tout est répondu.' : `${list.length} attendent votre réponse.`}</b>
        </h1>
      </div>

      <SortCard left={list.length} />

      <section className={s.box}>
        <Card className={s.list}>
          <div className={s.lh}>
            <h3>À répondre</h3>
            <Pill tone={list.length ? 'red' : 'green'}>{list.length}</Pill>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((m, i) => {
              const c = catOf(m.kind);
              return (
                <motion.button
                  type="button"
                  key={m.id}
                  layout="position"
                  className={cn(s.item, current?.id === m.id && s.itemOn)}
                  onClick={() => setSel(m.id)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: dur.m, ease: ease.inOut } }}
                  transition={{ ...tween.l, delay: i * 0.04, layout: spring.layout }}
                >
                  <span className={s.av} style={{ background: c.color }}>
                    {m.initials}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className={s.it1}>
                      <span className={s.from}>{m.org}</span>
                      <span className={s.at}>{m.at}</span>
                    </span>
                    <span className={s.subj} style={{ display: 'block' }}>
                      {m.subject}
                    </span>
                    <span className={s.ex} style={{ display: 'block' }}>
                      {m.excerpt}
                    </span>
                    <span className={s.meta}>
                      <span className={s.ctag}>
                        <i style={{ background: c.color }} />
                        {c.label}
                      </span>
                      <ClubDot id={m.club} />
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </Card>

        <AnimatePresence mode="wait" initial={false}>
          {current ? (
            <Reader key={current.id} mail={current} onSent={() => send(current)} />
          ) : (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.soft}>
              <Card className={s.empty}>
                <CircleCheck aria-hidden="true" />
                <b>Boîte à jour</b>
                {MAILS.length} réponses envoyées ce matin
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
