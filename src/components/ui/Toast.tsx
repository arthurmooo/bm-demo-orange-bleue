
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { Toaster as Sonner, toast as sonner } from 'sonner';
import s from './Toast.module.css';

/**
 * Pile de toasts (sonner restylé). Une seule par espace, posée dans la coque.
 * `offset` laisse la place au pied d'écran mobile. Les toasts sont annoncés
 * par une région `aria-live`.
 */
export function Toaster({ offset = 24, mobileOffset = 104 }: { offset?: number; mobileOffset?: number }) {
  return (
    <Sonner
      position="bottom-center"
      offset={offset}
      mobileOffset={{ bottom: mobileOffset }}
      gap={8}
      visibleToasts={3}
      toastOptions={{ unstyled: true, classNames: { toast: s.toast, icon: s.icon, title: s.title, description: s.desc, content: s.body, actionButton: s.action } }}
    />
  );
}

type Tone = 'ok' | 'info' | 'error';

const ICON: Record<Tone, ReactNode> = {
  ok: <CircleCheck aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  error: <CircleAlert aria-hidden="true" />,
};

/** Affiche un toast. `icon` remplace l'icône du ton ; `action` ajoute un bouton à droite (« Annuler »), et le toast reste alors plus longtemps. */
export function toast(
  message: ReactNode,
  { tone = 'info', icon, description, duration, action }: { tone?: Tone; icon?: ReactNode; description?: ReactNode; duration?: number; action?: { label: string; onClick: () => void } } = {},
) {
  return sonner(message, { icon: icon ?? ICON[tone], description, duration: duration ?? (action ? 5200 : 2600), className: s[tone], action });
}
