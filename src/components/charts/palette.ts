/**
 * Couleurs des graphes, reprises du kit validé (maquette/kit.css). Les SVG animés ont besoin de
 * valeurs concrètes (motion n'interpole pas `var()`) : elles vivent ici, en un seul endroit.
 * Équivalents dans tokens.css quand ils existent (--chart-good, --chart-track, --hatch-a, --hatch-b…).
 */
export const PALETTE = {
  /** --ink */
  ink: '#1C1B39',
  /** --ac */
  accent: '#EA5839',
  /** --chart-good : courbes et points « favorable ». */
  good: '#16A06A',
  /** --wa */
  warn: '#F5A524',
  /** --ko */
  bad: '#E5484D',
  /** Tendance neutre des petites courbes. */
  neutral: '#E8930C',
  /** --bd-dash : référence et points du printemps (gris moyen). */
  muted: '#98A2B3',
  /** Segment sans évolution. */
  flat: '#C5CEDB',
  /** --chart-track : rail des jauges et anneaux. */
  track: '#EFEDF3',
  /** Rail de la jauge semi-circulaire. */
  gaugeTrack: '#E6EAF0',
  /** --surf : anneau autour des points. */
  surface: '#FFFFFF',
  /** Texte des repères dans les SVG (--tx-4). */
  axis: '#667085',
  /** Paliers de la jauge : rouge, ambre, vert (versions pâles). */
  tierLo: '#F2B8B4',
  tierMid: '#F7D08C',
  tierHi: '#A3DBC0',
  /** --hatch-a, --hatch-b : hachures « pas encore de données ». */
  hatchA: '#F2F5FA',
  hatchB: '#EBEFF5',
} as const;

/** Échelle divergente de la perception de marque : Très premium (bleu foncé) → Low cost (orange), Standard en gris neutre. */
export const PERCEPTION_SCALE = ['#0B4FA8', '#5B9BF8', '#D5DCE6', '#F7C873', '#E8833A'] as const;

/** Couleur d'un score /100 : ≥ 80 vert, 70–79 ambre, < 70 rouge. */
export const SCORE_COLOR = { hi: PALETTE.good, mid: PALETTE.warn, lo: PALETTE.bad } as const;

/** Paliers des constats (modèle de Louis) : Tier 1 rouge, Tier 2 orange, Tier 3 jaune, Tier 4 bleu. */
export const TIER_COLOR = { 1: '#E5484D', 2: '#F08C00', 3: '#EAB308', 4: '#0878F9' } as const;
