import type { ClubId } from '@/data/demo';

export type TargetStatus = 'ready' | 'contacted' | 'meeting';

export const STATUS: Record<TargetStatus, { label: string; color: string }> = {
  ready: { label: 'Message prêt', color: '#EA5839' },
  contacted: { label: 'Contacté', color: '#7B61FF' },
  meeting: { label: 'Rendez-vous', color: '#16A06A' },
};

/** Positions schématiques (pas une vraie carte) : 640 × 420. */
export const CLUB_POS: Record<ClubId, { x: number; y: number }> = {
  mayenne: { x: 330, y: 92 },
  laval: { x: 222, y: 212 },
  craon: { x: 104, y: 332 },
  gontier: { x: 300, y: 262 },
  sable: { x: 520, y: 340 },
};

export type Target = {
  id: string;
  name: string;
  sector: string;
  staff: number;
  club: ClubId;
  minutes: number;
  cse: boolean;
  shifts: boolean;
  status: TargetStatus;
  dx: number;
  dy: number;
  why: string;
};

/** Entreprises fictives, vraisemblables pour la Mayenne et la Sarthe. */
export const TARGETS: Target[] = [
  { id: 't1', name: 'Laiterie du Bocage', sector: 'Agroalimentaire', staff: 320, club: 'mayenne', minutes: 6, cse: true, shifts: true, status: 'meeting', dx: 34, dy: -22, why: 'A répondu à l’offre CSE · présentation à caler' },
  { id: 't2', name: 'Transports Vallée de la Mayenne', sector: 'Transport', staff: 180, club: 'laval', minutes: 9, cse: true, shifts: true, status: 'ready', dx: -40, dy: -26, why: 'Chauffeurs en horaires décalés, club ouvert dès 6 h' },
  { id: 't3', name: 'Menuiseries Anjou-Maine', sector: 'Industrie', staff: 240, club: 'gontier', minutes: 7, cse: true, shifts: true, status: 'ready', dx: 46, dy: -4, why: 'Travail physique, offre dos et mobilité' },
  { id: 't4', name: 'Clinique du Val d’Oudon', sector: 'Santé', staff: 210, club: 'craon', minutes: 4, cse: true, shifts: true, status: 'contacted', dx: -30, dy: -28, why: 'Soignants en horaires postés, club à 4 min' },
  { id: 't5', name: 'Mécanor Industrie', sector: 'Industrie', staff: 410, club: 'laval', minutes: 12, cse: true, shifts: true, status: 'ready', dx: 54, dy: 6, why: 'Plus gros employeur proche de Laval Nord sans partenariat' },
  { id: 't6', name: 'Mutuelle Oudon Prévoyance', sector: 'Services', staff: 95, club: 'craon', minutes: 5, cse: true, shifts: false, status: 'ready', dx: 30, dy: -30, why: 'Siège à 5 min, salariés de bureau' },
  { id: 't7', name: 'Conserverie Sarthoise', sector: 'Agroalimentaire', staff: 520, club: 'sable', minutes: 8, cse: true, shifts: true, status: 'contacted', dx: -44, dy: -30, why: 'Effectif le plus important du secteur de Sablé' },
  { id: 't8', name: 'Imprimerie des Coëvrons', sector: 'Industrie', staff: 70, club: 'mayenne', minutes: 10, cse: false, shifts: true, status: 'ready', dx: -48, dy: 6, why: 'Équipes en 2×8, proximité du club' },
  { id: 't9', name: 'Clinique du Haut-Oudon', sector: 'Santé', staff: 260, club: 'craon', minutes: 3, cse: true, shifts: true, status: 'ready', dx: -42, dy: 4, why: 'Soignants en horaires postés, club à 3 min' },
  { id: 't10', name: 'Plasturgie de l’Erve', sector: 'Industrie', staff: 150, club: 'sable', minutes: 11, cse: true, shifts: true, status: 'ready', dx: 46, dy: -6, why: 'CSE actif, aucune offre sport à ce jour' },
  { id: 't11', name: 'Assurances Bocage Conseil', sector: 'Banque', staff: 130, club: 'laval', minutes: 6, cse: true, shifts: false, status: 'contacted', dx: 14, dy: -44, why: 'Salariés de bureau, pause de midi' },
  { id: 't12', name: 'Logistique Ouest-Maine', sector: 'Logistique', staff: 290, club: 'laval', minutes: 14, cse: true, shifts: true, status: 'meeting', dx: -58, dy: 30, why: 'Préparateurs de commandes, horaires décalés' },
  { id: 't13', name: 'Coopérative Maine Céréales', sector: 'Agriculture', staff: 110, club: 'mayenne', minutes: 13, cse: true, shifts: false, status: 'ready', dx: 60, dy: 8, why: 'CSE actif, nouvel accord qualité de vie au travail' },
  { id: 't14', name: 'Résidence seniors Les Tilleuls', sector: 'Public', staff: 85, club: 'sable', minutes: 5, cse: false, shifts: false, status: 'ready', dx: 24, dy: 56, why: 'Personnel soignant, club à 5 min' },
];

export const CRITERIA = ['50 salariés et plus', 'À moins de 15 min d’un club', 'CSE ou comité social', 'Horaires décalés en priorité'];

export const message = (t: Target, clubName: string) =>
  `Bonjour,\n\nJe pilote les clubs L’Orange Bleue de Mayenne et de Sarthe. Notre club de ${clubName} est à ${t.minutes} minutes de ${t.name}${t.shifts ? ', ouvert tôt le matin comme tard le soir pour les équipes en horaires décalés' : ''}.\n\nNous proposons aux ${t.cse ? 'CSE' : 'employeurs'} un tarif préférentiel pour leurs salariés, avec une séance découverte et un bilan offerts.\n\nPuis-je vous présenter l’offre en 20 minutes, sur place ou en visio ?\n\nBien cordialement,\nNicolas`;
