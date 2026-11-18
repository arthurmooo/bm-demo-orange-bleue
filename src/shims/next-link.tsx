import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Link as RLink } from 'react-router';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; scroll?: boolean; replace?: boolean };

/** Remplace `next/link` par le lien de react-router : les composants du design system restent inchangés. */
const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, prefetch: _p, scroll: _s, ...rest }, ref) {
  void _p; void _s;
  return <RLink ref={ref} to={href} {...rest} />;
});
export default Link;
