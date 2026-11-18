import type { ClubId } from '@/data/demo';

export type MailCat = 'reply' | 'team' | 'vendor' | 'network' | 'partner' | 'filed';

export const CATS: { id: MailCat; label: string; color: string; count: number }[] = [
  { id: 'reply', label: 'À répondre', color: '#EA5839', count: 6 },
  { id: 'team', label: 'Équipe', color: '#1C1B39', count: 9 },
  { id: 'vendor', label: 'Prestataires', color: '#7B61FF', count: 7 },
  { id: 'network', label: 'Franchise', color: '#0CA5A5', count: 5 },
  { id: 'partner', label: 'Partenaires', color: '#E39B0B', count: 3 },
  { id: 'filed', label: 'Classés sans action', color: '#B6B4C4', count: 11 },
];

export type Mail = {
  id: string;
  from: string;
  org: string;
  initials: string;
  subject: string;
  excerpt: string;
  body: string;
  at: string;
  club: ClubId;
  kind: MailCat;
  found: { label: string; detail: string }[];
  draft: string;
};

export const MAILS: Mail[] = [
  {
    id: 'm-menage',
    from: 'Service clients',
    org: 'Clean’Ouest',
    initials: 'CO',
    subject: 'Passage du vendredi à Craon',
    excerpt: 'Suite à votre remarque sur les vestiaires, nous proposons de décaler le passage…',
    body: 'Bonjour,\n\nSuite à votre remarque sur l’état des vestiaires du club de Craon, nous proposons de décaler le passage du vendredi de 7 h à 13 h, pour couvrir l’affluence du matin. Merci de nous confirmer.\n\nCordialement,\nClean’Ouest',
    at: '7 h 12',
    club: 'craon',
    kind: 'vendor',
    found: [
      { label: 'Planning de ménage de Craon', detail: 'Lun · Mer · Ven à 7 h' },
      { label: 'Affluence du vendredi', detail: 'Pic entre 9 h et 12 h' },
      { label: 'Contrat Clean’Ouest', detail: '3 passages par semaine' },
    ],
    draft:
      'Bonjour,\n\nMerci pour votre réactivité. 13 h nous convient pour le vendredi, à partir de la semaine prochaine. Je préviens l’équipe de Craon.\n\nPouvez-vous ajouter un contrôle des douches à chaque passage ?\n\nBonne journée,\nNicolas',
  },
  {
    id: 'm-machine',
    from: 'Atelier SAV',
    org: 'Fitmaintenance Ouest',
    initials: 'FO',
    subject: 'Devis tapis de course n°4 · Laval Nord',
    excerpt: 'Ci-joint le devis pour le remplacement de la bande et du moteur, 640 € HT…',
    body: 'Bonjour,\n\nCi-joint le devis pour le tapis de course n°4 de Laval Nord : remplacement de la bande et révision du moteur, 640 € HT. Intervention possible jeudi.\n\nBien à vous,\nFitmaintenance Ouest',
    at: '8 h 03',
    club: 'laval',
    kind: 'vendor',
    found: [
      { label: 'Dernier devis comparable', detail: 'Tapis n°2 · 590 € HT · mars' },
      { label: 'Signalement de l’équipe', detail: 'Thomas R. · bande qui patine' },
      { label: 'Garantie', detail: 'Échue depuis juin' },
    ],
    draft:
      'Bonjour,\n\nMerci pour le devis. Pour le tapis n°2, en mars, la même intervention était à 590 € HT : pouvez-vous revoir le montant ?\n\nJeudi nous convient, de préférence avant 10 h.\n\nCordialement,\nNicolas',
  },
  {
    id: 'm-compta',
    from: 'Cabinet comptable',
    org: 'Cabinet Ravel & Associés',
    initials: 'RA',
    subject: 'Pièces manquantes pour octobre',
    excerpt: 'Il nous manque 3 justificatifs pour la clôture d’octobre, dont la facture…',
    body: 'Bonjour Nicolas,\n\nPour la clôture d’octobre, il nous manque 3 justificatifs : la facture Clean’Ouest de Mayenne, le devis signé de l’enseigne de Sablé et la note de frais du salon.\n\nMerci d’avance,\nLe cabinet',
    at: 'Hier',
    club: 'mayenne',
    kind: 'vendor',
    found: [
      { label: 'Facture Clean’Ouest Mayenne', detail: 'Reçue le 4 nov · trouvée' },
      { label: 'Devis enseigne Sablé', detail: 'Signé le 21 oct · trouvé' },
      { label: 'Note de frais du salon', detail: 'Introuvable' },
    ],
    draft:
      'Bonjour,\n\nVous trouverez ci-joint la facture Clean’Ouest de Mayenne et le devis signé de l’enseigne de Sablé.\n\nLa note de frais du salon suit d’ici vendredi.\n\nBonne journée,\nNicolas',
  },
  {
    id: 'm-coach',
    from: 'Emma P.',
    org: 'Coach · Château-Gontier',
    initials: 'EP',
    subject: 'Échange de créneau samedi',
    excerpt: 'Est-ce que je peux échanger mon samedi matin avec Lucas ? Il est d’accord…',
    body: 'Salut Nicolas,\n\nEst-ce que je peux échanger mon samedi matin du 29 avec Lucas ? Il est d’accord, je prendrais son mardi soir.\n\nMerci !\nEmma',
    at: '9 h 41',
    club: 'gontier',
    kind: 'team',
    found: [
      { label: 'Planning de Château-Gontier', detail: 'Sam 29 · Emma · 8 h–13 h' },
      { label: 'Lucas G.', detail: 'Libre le samedi 29' },
      { label: 'Bilans prévus samedi', detail: '3 bilans avec Emma' },
    ],
    draft:
      'Salut Emma,\n\nOK pour l’échange avec Lucas, je mets le planning à jour.\n\nTu avais 3 bilans prévus samedi : je les transfère à Lucas, ou tu préfères les décaler à mardi ?\n\nNicolas',
  },
  {
    id: 'm-cse',
    from: 'Responsable CSE',
    org: 'Laiterie du Bocage',
    initials: 'LB',
    subject: 'Re : Offre salariés',
    excerpt: 'Merci pour votre proposition, nous serions intéressés par une présentation…',
    body: 'Bonjour,\n\nMerci pour votre proposition. Nous serions intéressés par une présentation à nos salariés, idéalement lors de la pause de midi. Quelles sont vos disponibilités ?\n\nCordialement,\nLe CSE',
    at: '10 h 15',
    club: 'mayenne',
    kind: 'partner',
    found: [
      { label: 'Offre CSE envoyée', detail: 'Il y a 6 jours' },
      { label: 'Effectif', detail: '320 salariés · 6 min du club' },
      { label: 'Agenda de Nicolas', detail: 'Libre mar 25 et jeu 27 midi' },
    ],
    draft:
      'Bonjour,\n\nAvec plaisir. Je peux venir présenter l’offre le mardi 25 ou le jeudi 27, de 12 h à 13 h 30, avec une séance découverte offerte pour les salariés qui le souhaitent.\n\nQuelle date vous convient le mieux ?\n\nNicolas',
  },
  {
    id: 'm-reseau',
    from: 'Animation réseau',
    org: 'L’Orange Bleue',
    initials: 'OB',
    subject: 'Remontée des chiffres de novembre',
    excerpt: 'Merci de nous transmettre avant vendredi les adhérents actifs par club…',
    body: 'Bonjour,\n\nMerci de nous transmettre avant vendredi les adhérents actifs et les résiliations de novembre, club par club.\n\nL’équipe animation réseau',
    at: 'Hier',
    club: 'laval',
    kind: 'network',
    found: [
      { label: 'Adhérents actifs', detail: '1 870 sur 5 clubs' },
      { label: 'Résiliations de novembre', detail: 'Calculées club par club' },
      { label: 'Envoi d’octobre', detail: 'Même format, le 28 oct' },
    ],
    draft:
      'Bonjour,\n\nVoici les chiffres de novembre pour nos 5 clubs, dans le même format qu’en octobre (tableau joint).\n\nBonne journée,\nNicolas',
  },
];
