
import { Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { Button } from './Button';
import s from './Dropzone.module.css';

/**
 * Dépôt de fichiers : sur ordinateur, une zone où glisser-déposer avec un bouton
 * « Parcourir » ; sur téléphone, un grand bouton en pointillés. Le sélecteur de
 * fichiers natif reste caché, ouvert par nos boutons.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  title,
  orLabel,
  browseLabel,
  mobileLabel,
  formats,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title: string;
  orLabel: string;
  browseLabel: string;
  mobileLabel: string;
  formats: string;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const open = () => input.current?.click();

  return (
    <div className={s.root}>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) onFiles(files);
        }}
      />
      <div
        className={cn(s.zone, over && s.over, disabled && s.disabled)}
        onDragEnter={(e) => {
          e.preventDefault();
          depth.current += 1;
          setOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          depth.current -= 1;
          if (depth.current <= 0) setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          depth.current = 0;
          setOver(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length && !disabled) onFiles(multiple ? files : files.slice(0, 1));
        }}
      >
        <motion.span className={s.icon} animate={{ y: over ? -4 : 0, scale: over ? 1.08 : 1 }} transition={spring.bouncy}>
          <Upload aria-hidden="true" />
        </motion.span>
        <b className={s.title}>{title}</b>
        <span className={s.or}>
          {orLabel}
          <Button onClick={open} disabled={disabled}>
            {browseLabel}
          </Button>
        </span>
        <span className={s.formats}>{formats}</span>
      </div>
      <button type="button" className={s.mobile} onClick={open} disabled={disabled}>
        <span className={s.mIcon}>
          <Upload aria-hidden="true" />
        </span>
        <span className={s.mText}>
          {mobileLabel}
          <span>{formats}</span>
        </span>
      </button>
    </div>
  );
}
