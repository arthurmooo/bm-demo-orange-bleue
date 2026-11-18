import { Fragment, type ReactNode } from 'react';

const HYPHENATED = /([\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+)/u;

/**
 * Garde sur une ligne les mots à trait d'union : un titre ne se coupe jamais
 * en « est- / elle » ni en « Royaume- / Uni ».
 *
 * <h2>{keepHyphens(title)}</h2>
 */
export function keepHyphens(text: string): ReactNode {
  if (!text.includes('-')) return text;
  return text.split(HYPHENATED).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="nobr">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
