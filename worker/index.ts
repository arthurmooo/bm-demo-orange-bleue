/** Worker de la démo : sert l'application embarquée (worker/assets.generated.ts), avec repli SPA. */
import { ASSETS } from './assets.generated';

const HEADERS: Record<string, string> = {
  'x-robots-tag': 'noindex, nofollow',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};

function decode(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export default {
  async fetch(req: Request): Promise<Response> {
    const { pathname } = new URL(req.url);
    const path = ASSETS[pathname] ? pathname : '/index.html';
    const a = ASSETS[path]!;
    const immutable = path.startsWith('/assets/');
    return new Response(decode(a.body), {
      headers: { 'content-type': a.type, 'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache', ...HEADERS },
    });
  },
};
