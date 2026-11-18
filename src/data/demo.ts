/**
 * Données de démonstration : fictives. Les clubs et le réseau sont réels, les adhérents, les montants,
 * les messages et les personnes de l'équipe sont inventés. Tous les chiffres affichés sont calculés ici,
 * jamais saisis, et les dates sont relatives au jour de la démo.
 */

export type ClubId = 'laval' | 'mayenne' | 'gontier' | 'craon' | 'sable';
export type Club = { id: ClubId; name: string; short: string; color: string; size: number; manager: string };

export const CLUBS: Club[] = [
  { id: 'laval', name: 'Laval Nord', short: 'LAV', color: '#EA5839', size: 520, manager: 'NI' },
  { id: 'mayenne', name: 'Mayenne', short: 'MAY', color: '#1C1B39', size: 410, manager: 'NI' },
  { id: 'gontier', name: 'Laval Centre', short: 'LVC', color: '#7B61FF', size: 380, manager: 'HB' },
  { id: 'craon', name: 'Craon', short: 'CRA', color: '#0CA5A5', size: 260, manager: 'HB' },
  { id: 'sable', name: 'Sablé-sur-Sarthe', short: 'SAB', color: '#E39B0B', size: 300, manager: 'CL' },
];
export const clubOf = (id: ClubId) => CLUBS.find((c) => c.id === id)!;

export type Person = { id: string; name: string; role: string; club?: ClubId };

/** L'équipe (prénoms fictifs, sauf Nicolas). */
export const PEOPLE: Person[] = [
  { id: 'NI', name: 'Nicolas', role: 'Directeur des opérations' },
  { id: 'HB', name: 'Hugo B.', role: 'Relances et fidélisation' },
  { id: 'CL', name: 'Camille L.', role: 'Responsable de club', club: 'sable' },
  { id: 'JM', name: 'Julie M.', role: 'Coach', club: 'laval' },
  { id: 'TR', name: 'Thomas R.', role: 'Coach', club: 'laval' },
  { id: 'SB', name: 'Sarah B.', role: 'Coach', club: 'mayenne' },
  { id: 'KD', name: 'Kevin D.', role: 'Coach', club: 'mayenne' },
  { id: 'EP', name: 'Emma P.', role: 'Coach', club: 'gontier' },
  { id: 'LG', name: 'Lucas G.', role: 'Coach', club: 'gontier' },
  { id: 'MF', name: 'Manon F.', role: 'Coach', club: 'craon' },
  { id: 'AD', name: 'Antoine D.', role: 'Coach', club: 'sable' },
];
export const personOf = (id: string) => PEOPLE.find((p) => p.id === id)!;
export const coachesOf = (club: ClubId) => PEOPLE.filter((p) => p.club === club && p.role === 'Coach');

/* --------------------------------------------------------------- Dates */

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const TODAY = startOfDay(new Date());
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
export const daysFrom = (d: Date) => Math.round((startOfDay(d).getTime() - TODAY.getTime()) / DAY);
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fr-FR', o);
export const dayShort = (d: Date) => fmt({ day: 'numeric', month: 'short' }).format(d).replace('.', '');
export const dayLong = (d: Date) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(d);
export const relDay = (d: Date) => {
  const n = daysFrom(d);
  if (n === 0) return 'aujourd’hui';
  if (n === 1) return 'demain';
  if (n === -1) return 'hier';
  if (n < 0) return `il y a ${-n} j`;
  if (n < 7) return `dans ${n} j`;
  return dayShort(d);
};
export const euro = (n: number, d = 0) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })} €`;
export const num = (n: number) => n.toLocaleString('fr-FR');

/* --------------------------------------------------------------- Formules */

export type FormuleId = 'coaching' | 'confort' | 'essentiel';
/** Formules illustratives : bilans par an et renouvellement du programme. */
export const FORMULES: Record<FormuleId, { label: string; bilans: number; programme: number | null; price: number }> = {
  coaching: { label: 'Coaching', bilans: 4, programme: 60, price: 49.9 },
  confort: { label: 'Confort', bilans: 1, programme: 60, price: 44.9 },
  essentiel: { label: 'Essentiel', bilans: 0, programme: null, price: 34.9 },
};

/* --------------------------------------------------------------- Adhérents */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Léa', 'Hugo', 'Chloé', 'Louis', 'Inès', 'Gabriel', 'Jade', 'Arthur', 'Louise', 'Jules', 'Alice', 'Raphaël', 'Lina', 'Paul', 'Rose', 'Adam', 'Anna', 'Maël', 'Mila', 'Nathan', 'Zoé', 'Tom', 'Sophie', 'Éric', 'Nathalie', 'Pascal', 'Isabelle', 'Thierry', 'Valérie', 'Olivier', 'Sandrine', 'Christophe', 'Céline', 'Stéphane', 'Aurélie', 'Laurent', 'Émilie', 'Julien', 'Marion', 'Romain', 'Pauline', 'Bastien', 'Justine', 'Maxime', 'Elodie', 'Damien', 'Clara', 'Yann', 'Agathe', 'Benoît'];
const LAST = ['Martin', 'Bernard', 'Lefebvre', 'Moreau', 'Garnier', 'Rousseau', 'Blanchard', 'Guérin', 'Boucher', 'Lemaire', 'Chevalier', 'Gauthier', 'Perrin', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupuis', 'Lambert', 'Fontaine', 'Rolland', 'Leroux', 'Marchand', 'Brunet', 'Barbier', 'Picard', 'Renard', 'Aubert', 'Collet', 'Hervé', 'Pichon', 'Lebreton', 'Gohier', 'Bigot', 'Chauvin', 'Huet', 'Besnard', 'Cousin', 'Tessier', 'Pasquier'];

export type Member = {
  id: string;
  first: string;
  last: string;
  club: ClubId;
  formule: FormuleId;
  coach: string;
  since: Date;
  lastVisit: Date;
  /** Visites par semaine sur les 8 dernières semaines (de la plus ancienne à la plus récente). */
  visits: number[];
  nextBilan: Date | null;
  bilansDone: number;
  nextProgramme: Date | null;
  goal: string;
};

const GOALS = ['Perte de poids', 'Remise en forme', 'Renforcement du dos', 'Préparation trail', 'Prise de masse', 'Mobilité et souplesse', 'Reprise après grossesse', 'Cardio et endurance'];

function buildMembers(): Member[] {
  const r = rng(53);
  const out: Member[] = [];
  let n = 0;
  for (const c of CLUBS) {
    const coaches = coachesOf(c.id);
    for (let i = 0; i < c.size; i++) {
      const x = r();
      const formule: FormuleId = x < 0.38 ? 'coaching' : x < 0.72 ? 'confort' : 'essentiel';
      const f = FORMULES[formule];
      const since = addDays(TODAY, -Math.round(30 + r() * 900));
      const lazy = r();
      const lastVisit = addDays(TODAY, -Math.round(lazy < 0.95 ? r() * 9 : 21 + r() * 40));
      const rate = lazy < 0.95 ? 1 + r() * 2.5 : 0.2;
      const visits = Array.from({ length: 8 }, (_, w) => Math.max(0, Math.round(rate * (lazy < 0.95 ? 1 : (8 - w) / 3) + (r() - 0.5))));
      // Retards : un peu plus à Craon et à Laval Centre, où le suivi est encore sur Excel.
      const lateBias = c.id === 'craon' ? 0.2 : c.id === 'gontier' ? 0.14 : 0.07;
      const nextBilan = f.bilans ? addDays(TODAY, r() < lateBias ? -Math.round(3 + r() * 40) : Math.round(r() * (365 / f.bilans))) : null;
      const nextProgramme = f.programme ? addDays(TODAY, r() < lateBias * 0.8 ? -Math.round(2 + r() * 25) : Math.round(r() * f.programme)) : null;
      out.push({
        id: `m${++n}`,
        first: FIRST[Math.floor(r() * FIRST.length)]!,
        last: LAST[Math.floor(r() * LAST.length)]!,
        club: c.id,
        formule,
        coach: coaches[Math.floor(r() * coaches.length)]!.id,
        since,
        lastVisit,
        visits,
        nextBilan,
        bilansDone: f.bilans ? Math.floor(r() * f.bilans) : 0,
        nextProgramme,
        goal: GOALS[Math.floor(r() * GOALS.length)]!,
      });
    }
  }
  return out;
}

export const MEMBERS = buildMembers();
export const memberName = (m: Member) => `${m.first} ${m.last}`;
export const membersOf = (club: ClubId | 'all') => (club === 'all' ? MEMBERS : MEMBERS.filter((m) => m.club === club));

export type FollowState = 'late' | 'week' | 'ok' | 'none';
export const stateOf = (d: Date | null): FollowState => {
  if (!d) return 'none';
  const n = daysFrom(d);
  return n < 0 ? 'late' : n <= 7 ? 'week' : 'ok';
};
export const absentDays = (m: Member) => -daysFrom(m.lastVisit);
export const isAbsent = (m: Member) => absentDays(m) >= 21;

/** Part des adhérents dont le bilan et le programme sont à jour (sans retard). */
export function upToDate(list: Member[]) {
  const tracked = list.filter((m) => m.nextBilan || m.nextProgramme);
  const ok = tracked.filter((m) => stateOf(m.nextBilan) !== 'late' && stateOf(m.nextProgramme) !== 'late');
  return { pct: Math.round((ok.length / tracked.length) * 100), ok: ok.length, total: tracked.length };
}

export function clubStats(club: ClubId | 'all') {
  const list = membersOf(club);
  return {
    members: list.length,
    upToDate: upToDate(list),
    bilansLate: list.filter((m) => stateOf(m.nextBilan) === 'late').length,
    bilansWeek: list.filter((m) => stateOf(m.nextBilan) === 'week').length,
    progLate: list.filter((m) => stateOf(m.nextProgramme) === 'late').length,
    progWeek: list.filter((m) => stateOf(m.nextProgramme) === 'week').length,
    absent: list.filter(isAbsent).length,
  };
}

/* --------------------------------------------------------------- Impayés */

export type DebtStage = 'new' | 'contacted' | 'promise' | 'paid';
export const DEBT_STAGES: { id: DebtStage; label: string }[] = [
  { id: 'new', label: 'À relancer' },
  { id: 'contacted', label: 'Relancé' },
  { id: 'promise', label: 'Promesse de paiement' },
  { id: 'paid', label: 'Réglé' },
];
export type Debt = { id: string; member: Member; amount: number; months: number; since: Date; stage: DebtStage; owner: string; channel: 'SMS' | 'Appel' | 'Mail' | null; lastAction: Date | null; note: string };

function buildDebts(): Debt[] {
  const r = rng(72);
  const ownerOf = (c: ClubId) => (c === 'laval' || c === 'mayenne' ? 'NI' : c === 'sable' ? 'CL' : 'HB');
  const picks = MEMBERS.filter((_, i) => i % 41 === 7).slice(0, 44);
  const notes = ['Prélèvement rejeté, carte expirée', 'Changement de banque', 'A répondu au SMS, rappelle vendredi', 'Messagerie, pas de réponse', 'Conteste le montant de septembre', 'Promet un virement en fin de mois', 'Rejet pour provision insuffisante'];
  return picks.map((m, i) => {
    const months = r() < 0.7 ? 1 : r() < 0.7 ? 2 : 3;
    const stage: DebtStage = i < 13 ? 'new' : i < 26 ? 'contacted' : i < 34 ? 'promise' : 'paid';
    const since = addDays(TODAY, -Math.round(5 + months * 25 + r() * 10));
    return {
      id: `d${i + 1}`,
      member: m,
      amount: Math.round(FORMULES[m.formule].price * months * 100) / 100,
      months,
      since,
      stage,
      owner: ownerOf(m.club),
      channel: stage === 'new' ? null : (['SMS', 'Appel', 'Mail'] as const)[Math.floor(r() * 3)]!,
      lastAction: stage === 'new' ? null : addDays(TODAY, -Math.round(1 + r() * 9)),
      note: notes[Math.floor(r() * notes.length)]!,
    };
  });
}
export const DEBTS = buildDebts();

/* --------------------------------------------------------------- Historique (12 semaines) */

/** Bilans réalisés par semaine, réseau entier (12 dernières semaines), et bilans prévus. */
export const WEEKLY = (() => {
  const r = rng(9);
  return Array.from({ length: 12 }, (_, i) => {
    const planned = 58 + Math.round(r() * 14);
    const done = Math.min(planned, Math.round(planned * (0.62 + i * 0.022 + r() * 0.06)));
    return { week: addDays(TODAY, -7 * (11 - i)), planned, done };
  });
})();

/** Adhérents actifs par mois et par club (6 derniers mois), pour les petites courbes. */
export const ACTIVE_SERIES = [1792, 1808, 1801, 1826, 1847, MEMBERS.length];
export const DEBT_SERIES = [3120, 2890, 3040, 2710, 2560, DEBTS.filter((d) => d.stage !== 'paid').reduce((a, d) => a + d.amount, 0)];
