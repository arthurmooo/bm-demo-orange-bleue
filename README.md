# Démo · L'Orange Bleue (Nicolas, 5 clubs Mayenne–Sarthe)

Démo du R2 du 18 novembre 2026. Application Vite + React, sur la structure et les composants du design system SaferBuy,
aux couleurs de L'Orange Bleue (marine #1C1B39, orange #EA5839). Données **fictives** : les clubs sont réels,
les adhérents, montants, messages, entreprises et membres de l'équipe sont inventés (`src/data/demo.ts`, et les
fichiers de données locaux de chaque écran). Aucun appel externe, aucun envoi réel : tout se joue dans le navigateur,
un rechargement remet la démo à zéro.

- Production : https://demo-orange-bleue.bm-automation-france.com (noindex)
- Déroulé du rendez-vous : [`docs/DEROULE.md`](docs/DEROULE.md)
- Script à lire pendant la démo : [`docs/SCRIPT.md`](docs/SCRIPT.md)

## Développer

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run typecheck
npm run deploy     # build, embarque dist/ dans le Worker, wrangler deploy
```

## Structure

- `src/components/ui`, `src/components/charts` : composants repris de SaferBuy (inchangés, hors i18n réduite au français).
- `src/styles/tokens.css` (SaferBuy) + `src/styles/theme.css` (surcharge L'Orange Bleue).
- `src/shims/next-link.tsx` : `next/link` remplacé par react-router, pour garder les composants tels quels.
- `src/app/<écran>` : un dossier par écran ; `src/app/store.tsx` : état de la démo (validations, journal).
