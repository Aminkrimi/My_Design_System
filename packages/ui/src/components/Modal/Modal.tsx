import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { CloseIcon } from '../../internal/icons';
import { cx } from '../../utils/cx';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the modal asks to open or close (trigger, Esc, overlay click, close button). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Element that opens the modal, usually a `Button`. It must accept a ref and
   * spread props. Focus returns to it when the modal closes.
   */
  trigger?: ReactElement;
  /** Heading that names the dialog. Required so the dialog always has an accessible name. */
  title: ReactNode;
  /** Hides the title visually but keeps it as the dialog's accessible name. */
  hideTitle?: boolean;
  /** Supporting text under the title, linked via `aria-describedby`. */
  description?: ReactNode;
  /** Body content. Scrolls when it is taller than the viewport; header and footer stay put. */
  children?: ReactNode;
  /** Actions row, usually `ModalClose`-wrapped buttons. Laid out at the inline-end. */
  footer?: ReactNode;
  /** Maximum width. @default 'md' */
  size?: ModalSize;
  /** Accessible name of the close button — translate it for non-English UIs. @default 'Close' */
  closeLabel?: string;
  /** Class name for the dialog panel. */
  className?: string;
}

/** Wrap any button in this to make it close the modal: `<ModalClose asChild><Button/></ModalClose>`. */
export const ModalClose = DialogPrimitive.Close;

/**
 * The scrolling body. While its content overflows it becomes a focusable,
 * named region so keyboard users can scroll text that holds nothing focusable;
 * otherwise it adds no tab stop.
 */
function ModalBody({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      setScrollable(node.scrollHeight > node.clientHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scrollProps = scrollable
    ? { tabIndex: 0, role: 'region', 'aria-labelledby': labelledBy }
    : undefined;

  return (
    <div ref={ref} className={styles.body} {...scrollProps}>
      {children}
    </div>
  );
}

/**
 * A modal dialog: traps focus, closes on Esc and overlay click, returns focus
 * to whatever opened it, locks page scroll and hides the rest of the page from
 * assistive technology.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    title,
    hideTitle = false,
    description,
    children,
    footer,
    size = 'md',
    closeLabel = 'Close',
    className,
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  // Radix returns focus to its own <Trigger> only. A modal opened from anywhere
  // else (a menu item, a shortcut, an effect) would drop focus on <body>, so we
  // remember what had focus when it opened and restore that instead.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay}>
          <DialogPrimitive.Content
            ref={ref}
            // Radix hides the rest of the page with `aria-hidden` but does not
            // set `aria-modal`; some screen readers rely on it to stay inside.
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            data-size={size}
            className={cx(styles.content, styles[size], className)}
            onOpenAutoFocus={() => {
              const active = document.activeElement;
              returnFocusRef.current =
                active instanceof HTMLElement && active !== document.body ? active : null;
            }}
            onCloseAutoFocus={(event) => {
              if (trigger) return;
              event.preventDefault();
              if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
            }}
          >
            <div className={styles.header}>
              {hideTitle ? (
                <DialogPrimitive.Title id={titleId} asChild>
                  <VisuallyHidden>{title}</VisuallyHidden>
                </DialogPrimitive.Title>
              ) : (
                <DialogPrimitive.Title id={titleId} className={styles.title}>
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description id={descriptionId} className={styles.description}>
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            {children && <ModalBody labelledBy={titleId}>{children}</ModalBody>}
            {footer && <div className={styles.footer}>{footer}</div>}
            {/* Last in DOM order so initial focus lands on the content, not on "close". */}
            <DialogPrimitive.Close className={styles.close} aria-label={closeLabel}>
              <CloseIcon />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
});
