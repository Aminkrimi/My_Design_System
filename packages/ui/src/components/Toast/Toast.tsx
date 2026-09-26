import * as ToastPrimitive from '@radix-ui/react-toast';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircleIcon, CheckCircleIcon, CloseIcon, InfoIcon } from '../../internal/icons';
import { cx } from '../../utils/cx';
import { useDocumentDirection } from '../../utils/useDocumentDirection';
import { Button } from '../Button/Button';
import styles from './Toast.module.css';

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastAction {
  /** Button text, e.g. "Undo". */
  label: ReactNode;
  /**
   * How to do the same thing without this button. Screen readers announce it
   * instead of the label, since the toast may be gone before they reach it.
   */
  altText: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  /** @default 'info' */
  variant?: ToastVariant;
  /**
   * Milliseconds before the toast closes itself. `Infinity` keeps it until dismissed.
   * @default the provider's `duration` for info/success, `Infinity` for error
   */
  duration?: number;
  /** An optional action button, e.g. "Undo". */
  action?: ToastAction;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  /** Closes one toast by id, or every toast when called without one. */
  dismiss: (id?: string) => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-close delay in ms for info and success toasts. @default 5000 */
  duration?: number;
  /**
   * Accessible name of the toast region; `{hotkey}` is replaced with the
   * shortcut that focuses it (F8). Translate it for non-English UIs.
   * @default 'Notifications ({hotkey})'
   */
  label?: string;
  /** Accessible name of each toast's close button. @default 'Close' */
  closeLabel?: string;
}

interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
}

const ToastContext = createContext<ToastApi | null>(null);

const icons: Record<ToastVariant, ReactNode> = {
  info: <InfoIcon />,
  success: <CheckCircleIcon />,
  error: <AlertCircleIcon />,
};

/**
 * Holds the toast queue and renders the toast region. Mount it once near the
 * root of the app; call `useToast()` anywhere below it.
 */
export function ToastProvider({
  children,
  duration = 5000,
  label = 'Notifications ({hotkey})',
  closeLabel = 'Close',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const lastId = useRef(0);
  const dir = useDocumentDirection();

  const dismiss = useCallback((id?: string) => {
    setToasts((current) =>
      current.map((item) => (id === undefined || item.id === id ? { ...item, open: false } : item)),
    );
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    lastId.current += 1;
    const id = `mds-toast-${lastId.current}`;
    // Closed toasts stay mounted while their exit animation plays; drop them
    // here, by which time that has long finished.
    setToasts((current) => [
      ...current.filter((item) => item.open),
      { ...options, id, open: true },
    ]);
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      <ToastPrimitive.Provider
        duration={duration}
        label={label}
        // Toasts sit at the inline-end edge, so they are swiped out towards it.
        swipeDirection={dir === 'rtl' ? 'left' : 'right'}
      >
        {children}
        {toasts.map(({ id, open, title, description, variant = 'info', duration, action }) => (
          <ToastPrimitive.Root
            key={id}
            open={open}
            onOpenChange={(next) => {
              if (!next) dismiss(id);
            }}
            duration={duration ?? (variant === 'error' ? Infinity : undefined)}
            // "foreground" is announced assertively, "background" politely.
            type={variant === 'error' ? 'foreground' : 'background'}
            data-variant={variant}
            className={cx(styles.toast, styles[variant])}
          >
            <span className={styles.icon} aria-hidden="true">
              {icons[variant]}
            </span>
            <div className={styles.text}>
              <ToastPrimitive.Title className={styles.title}>{title}</ToastPrimitive.Title>
              {description && (
                <ToastPrimitive.Description className={styles.description}>
                  {description}
                </ToastPrimitive.Description>
              )}
            </div>
            {action && (
              <ToastPrimitive.Action altText={action.altText} asChild>
                <Button size="sm" variant="secondary" onClick={action.onClick}>
                  {action.label}
                </Button>
              </ToastPrimitive.Action>
            )}
            <ToastPrimitive.Close className={styles.close} aria-label={closeLabel}>
              <CloseIcon />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className={styles.viewport} />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

/** Returns `{ toast, dismiss }`. Must be called inside a `ToastProvider`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside a <ToastProvider>.');
  return api;
}
