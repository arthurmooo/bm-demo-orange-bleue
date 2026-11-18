
import { Keyboard, Mic, Square } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useLang } from '@/lib/i18n';
import { dur, ease, pressIcon, spring } from '@/lib/motion';
import { TextArea } from './TextArea';
import s from './Dictation.module.css';
import { LOCALE_TAGS, type Locale } from '@/lib/locales';
import { toast } from './Toast';

/* ------------------------------------------------------------------ */
/* Moteur : Web Speech API + niveau réel du micro, sinon simulation    */
/* ------------------------------------------------------------------ */

type SpeechAlt = { transcript: string };
type SpeechResult = { isFinal: boolean; 0: SpeechAlt };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getRecognition(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const BARS = 24;

type Phase = 'idle' | 'rec' | 'trans';

/**
 * Dictée : reconnaissance vocale du navigateur quand elle existe, niveau réel du
 * micro pour l'onde quand l'accès est donné. Sans micro ou sans son, la dictée est
 * simulée (onde animée, transcription `fallback`). Sans reconnaissance, ou sans la
 * langue demandée, `onUnsupported` renvoie vers le clavier.
 */
export function useDictation({ locale, fallback, onResult, onUnsupported }: { locale: Locale; fallback: string; onResult: (text: string) => void; /** Le navigateur ne sait pas dicter, ou pas dans cette langue. */ onUnsupported?: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [interim, setInterim] = useState('');
  const [micLive, setMicLive] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const finalText = useRef('');
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const timer = useRef<number | null>(null);
  const recording = useRef(false);
  const onResultRef = useRef(onResult);
  const fallbackRef = useRef(fallback);
  const onUnsupportedRef = useRef(onUnsupported);

  useEffect(() => {
    onResultRef.current = onResult;
    fallbackRef.current = fallback;
    onUnsupportedRef.current = onUnsupported;
  }, [onResult, fallback, onUnsupported]);

  const release = useCallback(() => {
    recording.current = false;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    try {
      rec.current?.abort();
    } catch {}
    rec.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    audio.current?.close().catch(() => {});
    audio.current = null;
    analyser.current = null;
    setMicLive(false);
  }, []);

  useEffect(() => release, [release]);

  const start = useCallback(async () => {
    if (recording.current) return;
    const SR = getRecognition();
    if (!SR) {
      onUnsupportedRef.current?.();
      return;
    }
    recording.current = true;
    finalText.current = '';
    setInterim('');
    setSeconds(0);
    setPhase('rec');
    timer.current = window.setInterval(() => setSeconds((n) => n + 1), 1000);

    try {
      const r = new SR();
      r.lang = locale === 'en' ? 'en-IE' : LOCALE_TAGS[locale];
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let live = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalText.current += `${res[0].transcript} `;
          else live += res[0].transcript;
        }
        setInterim(`${finalText.current}${live}`.trim());
      };
      r.onerror = (e) => {
        if (e.error !== 'language-not-supported') return;
        release();
        setInterim('');
        setPhase('idle');
        onUnsupportedRef.current?.();
      };
      r.onend = () => {
        // Chrome coupe après un silence : on relance tant que l'enregistrement dure.
        if (recording.current && rec.current === r) {
          try {
            r.start();
          } catch {}
        }
      };
      r.start();
      rec.current = r;
    } catch {
      rec.current = null;
    }

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const st = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!recording.current) {
          st.getTracks().forEach((t) => t.stop());
          return;
        }
        const ctx = new AudioContext();
        const node = ctx.createAnalyser();
        node.fftSize = 256;
        node.smoothingTimeConstant = 0.7;
        ctx.createMediaStreamSource(st).connect(node);
        stream.current = st;
        audio.current = ctx;
        analyser.current = node;
        setMicLive(true);
      } catch {
        setMicLive(false);
      }
    }
  }, [locale, release]);

  const stop = useCallback(() => {
    if (!recording.current) return;
    recording.current = false;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setPhase('trans');
    const r = rec.current;
    rec.current = null;
    try {
      r?.stop();
    } catch {}
    window.setTimeout(() => {
      const text = finalText.current.trim() || fallbackRef.current;
      release();
      setInterim('');
      setPhase('idle');
      onResultRef.current(text);
    }, r ? 900 : 1000);
  }, [release]);

  /** Niveaux 0–1 par barre, lus sur le micro. `null` sans accès au micro. */
  const levels = useCallback((): number[] | null => {
    const node = analyser.current;
    if (!node) return null;
    const data = new Uint8Array(node.frequencyBinCount);
    node.getByteFrequencyData(data);
    const out: number[] = [];
    for (let i = 0; i < BARS; i++) {
      // Bande de la voix (environ 90 Hz à 3,5 kHz), en miroir pour une onde centrée.
      const k = Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2);
      const bin = 2 + Math.round(k * 34);
      out.push(Math.min(1, 0.14 + (data[bin] / 255) * 1.1));
    }
    return out;
  }, []);

  return { phase, seconds, interim, micLive, start, stop, levels };
}

/* ------------------------------------------------------------------ */
/* Onde                                                                */
/* ------------------------------------------------------------------ */

const SIM = [0.35, 0.6, 0.9, 0.5, 0.75, 1, 0.65, 0.4, 0.8, 0.95, 0.55, 0.35, 0.7, 0.9, 0.5, 0.75, 1, 0.6, 0.45, 0.85, 0.7, 0.4, 0.55, 0.8];

/** Onde de dictée : niveau réel du micro quand il est disponible, animation simulée sinon. */
export function Wave({ levels, live, bars = BARS, className }: { levels: () => number[] | null; live: boolean; bars?: number; className?: string }) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (!live) return;
    let raf = 0;
    const loop = () => {
      const lv = levels();
      if (lv) refs.current.forEach((el, i) => el && (el.style.transform = `scaleY(${lv[i % lv.length].toFixed(3)})`));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [live, levels]);
  return (
    <span className={cn(s.wave, !live && s.sim, className)} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <i
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          style={live ? undefined : { animationDelay: `${(i * 70) % 1000}ms`, height: `${Math.round(SIM[i % SIM.length] * 100)}%` }}
        />
      ))}
    </span>
  );
}

const fmt = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;

/* ------------------------------------------------------------------ */
/* Champ dicté                                                         */
/* ------------------------------------------------------------------ */

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** Transcription utilisée quand la reconnaissance vocale n'est pas disponible. */
  fallback: string;
  /**
   * - `inline` : zone de texte avec micro dans sa barre d'outils ;
   * - `panel` : gros micro et « Écrire plutôt » d'abord, puis la zone de texte ;
   * - `center` : comme `panel`, centré (réponse à une demande de précision).
   */
  variant?: 'inline' | 'panel' | 'center';
  minChars?: number;
  labelledBy?: string;
  id?: string;
};

/**
 * Saisie libre à la voix d'abord, toujours avec un clavier de secours.
 * La transcription reste modifiable ; on peut dicter la suite.
 */
export function Dictation({ value, onChange, fallback, variant = 'inline', minChars, labelledBy, id }: Props) {
  const { L, locale } = useLang();
  const [typing, setTyping] = useState(false);
  const [dictated, setDictated] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const d = useDictation({
    locale,
    fallback,
    onUnsupported: () => {
      toast(L('La dictée n’est pas disponible ici. Écrivez votre réponse.', 'Dictation is not available here. Please type your answer.'));
      setTyping(true);
      requestAnimationFrame(() => area.current?.focus());
    },
    onResult: (text) => {
      const base = valueRef.current.replace(/\s+$/, '');
      onChange(base ? `${base} ${text}` : text);
      setDictated(true);
      vibrate(10);
    },
  });

  const toggle = () => {
    if (d.phase === 'rec') d.stop();
    else if (d.phase === 'idle') {
      vibrate(8);
      void d.start();
    }
  };

  const showRest = variant !== 'inline' && d.phase === 'idle' && !value && !typing;
  const showVox = variant !== 'inline' && d.phase !== 'idle';

  const counter = minChars ? (
    <span className={cn(s.count, 'num', value.length >= minChars && s.countOk)}>
      {value.length}/{minChars}
    </span>
  ) : null;

  if (variant === 'inline') {
    const status =
      d.phase === 'rec' ? (
        <span className={s.listening}>
          <Wave levels={d.levels} live={d.micLive} bars={12} className={s.waveSm} />
          {L('Écoute…', 'Listening…')}
        </span>
      ) : d.phase === 'trans' ? (
        <span className={s.transInline}>
          <span className={s.spin} aria-hidden="true" />
          {L('Transcription…', 'Transcribing…')}
        </span>
      ) : undefined;
    return (
      <div className={s.inline}>
        <TextArea
          ref={area}
          id={id}
          value={value}
          onChange={onChange}
          labelledBy={labelledBy}
          minChars={minChars}
          recording={d.phase === 'rec'}
          status={status}
          counterTip={minChars ? L(`${minChars} caractères minimum`, `${minChars} characters minimum`) : undefined}
          tools={<MicButton phase={d.phase} onClick={toggle} small />}
        />
        <Interim text={d.interim} />
      </div>
    );
  }

  return (
    <div className={cn(s.wrap, variant === 'center' && s.center)}>
      <AnimatePresence mode="wait" initial={false}>
        {showRest && (
          <motion.div key="rest" className={cn(s.vox, variant === 'center' && s.voxCenter)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: dur.m, ease: ease.out }}>
            <MicButton phase="idle" onClick={toggle} big={variant === 'center' ? 'xl' : 'l'} label={L('Dicter', 'Dictate')} />
            <div className={s.voxText}>
              <b>{variant === 'center' ? L('Dicter', 'Dictate') : L('Touchez pour dicter', 'Tap to dictate')}</b>
              <button
                type="button"
                className={cn(s.kb, variant === 'center' && s.kbGhost)}
                onClick={() => {
                  setTyping(true);
                  requestAnimationFrame(() => area.current?.focus());
                }}
              >
                <Keyboard aria-hidden="true" />
                {variant === 'center' ? L('Écrire au clavier', 'Type instead') : L('Écrire plutôt', 'Type instead')}
              </button>
            </div>
          </motion.div>
        )}
        {showVox && (
          <motion.div key="vox" className={cn(s.vox, s.voxRec, variant === 'center' && s.voxCenter)} role="status" aria-label={L('Enregistrement en cours', 'Recording')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: dur.m, ease: ease.out }}>
            {d.phase === 'rec' ? (
              <>
                <MicButton phase="rec" onClick={toggle} big={variant === 'center' ? 'xl' : 'l'} label={L('Arrêter l’enregistrement', 'Stop recording')} />
                <div className={s.voxText}>
                  <Wave levels={d.levels} live={d.micLive} />
                  <span className={cn(s.rt, 'num')}>
                    <span className={s.pulse} aria-hidden="true" />
                    {fmt(d.seconds)}
                  </span>
                </div>
              </>
            ) : (
              <div className={s.trans}>
                <span className={s.spin} aria-hidden="true" />
                {L('Transcription…', 'Transcribing…')}
              </div>
            )}
          </motion.div>
        )}
        {!showRest && !showVox && (
          <motion.div key="edit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: dur.m, ease: ease.out }}>
            <TextArea
              ref={area}
              id={id}
              value={value}
              onChange={onChange}
              labelledBy={labelledBy}
              minHeight={112}
              autoFocus={typing && !dictated}
              status={
                <span className={s.statusRow}>
                  {dictated && (
                    <span className={s.pill}>
                      <Mic aria-hidden="true" />
                      {L('Transcrit', 'Transcribed')}
                    </span>
                  )}
                  {counter}
                </span>
              }
              tools={<MicButton phase="idle" onClick={toggle} small label={L('Dicter la suite', 'Dictate more')} />}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Interim text={d.interim} />
    </div>
  );
}

function Interim({ text }: { text: string }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.p className={s.interim} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: dur.s }}>
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function MicButton({ phase, onClick, small, big, label }: { phase: Phase; onClick: () => void; small?: boolean; big?: 'l' | 'xl'; label?: string }) {
  const { L } = useLang();
  const rec = phase === 'rec';
  return (
    <motion.button
      type="button"
      className={cn(s.mic, small && s.micSm, big === 'l' && s.micL, big === 'xl' && s.micXl, rec && s.micRec)}
      onClick={onClick}
      disabled={phase === 'trans'}
      aria-pressed={rec}
      aria-label={label ?? (rec ? L('Arrêter la dictée', 'Stop dictation') : L('Dicter', 'Dictate'))}
      whileTap={pressIcon}
      transition={spring.snappy}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={rec ? 'stop' : 'mic'} className={s.micIcon} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={spring.snappy}>
          {rec ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function vibrate(ms: number) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator && window.matchMedia('(pointer: coarse)').matches) navigator.vibrate(ms);
}
