// Embarque la build (dist/) dans le Worker : worker/assets.generated.ts.
// Le Worker sert alors lui-même l'application, sans téléversement d'assets séparé.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const DIST = 'dist';
// --ensure : crée un fichier vide si la build n'existe pas encore (pour la vérification des types).
if (process.argv.includes('--ensure')) {
  const { existsSync } = await import('node:fs');
  if (!existsSync('worker/assets.generated.ts')) {
    writeFileSync('worker/assets.generated.ts', '// Généré par scripts/embed-assets.mjs.\nexport const ASSETS: Record<string, { type: string; body: string }> = {};\n');
  }
  process.exit(0);
}
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
};
walk(DIST);

// Polices : on ne garde que les jeux latin et latin étendu (le reste n'est jamais utilisé par la démo).
const keep = (p) => !/\.woff2?$/.test(p) || /-(latin|latin-ext)-/.test(p);
let total = 0;
const entries = files.filter(keep).map((p) => {
  const buf = readFileSync(p);
  total += buf.length;
  const path = `/${relative(DIST, p).split('\\').join('/')}`;
  const type = TYPES[extname(p)] ?? 'application/octet-stream';
  return `  ${JSON.stringify(path)}: { type: ${JSON.stringify(type)}, body: ${JSON.stringify(buf.toString('base64'))} },`;
});

writeFileSync(
  'worker/assets.generated.ts',
  `// Généré par scripts/embed-assets.mjs : ne pas modifier à la main.\n// ${entries.length} fichiers, ${(total / 1024).toFixed(0)} Kio.\nexport const ASSETS: Record<string, { type: string; body: string }> = {\n${entries.join('\n')}\n};\n`,
);
console.log(`worker/assets.generated.ts : ${entries.length} fichiers, ${(total / 1024).toFixed(0)} Kio`);
