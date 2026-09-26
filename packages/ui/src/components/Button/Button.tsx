import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'primary' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  /**
   * Shows a spinner and blocks activation. Unlike `disabled`, the button
   * stays focusable so keyboard and screen-reader users don't lose their place.
   */
  loading?: boolean;
  /** Icon rendered before the label (on the right in RTL). */
  startIcon?: ReactNode;
  /** Icon rendered after the label (on the left in RTL). */
  endIcon?: ReactNode;
  /** Stretches the button to the width of its container. */
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    startIcon,
    endIcon,
    fullWidth = false,
    type = 'button',
    className,
    children,
    onClick,
    ...props
  },
  ref,
) {
  const interactive = !disabled && !loading;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      className={cx(
        styles.root,
        styles[variant],
        styles[size],
        interactive && styles.interactive,
        loading && styles.loading,
        fullWidth && styles.fullWidth,
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <span className={styles.content}>
        {startIcon && (
          <span className={styles.icon} aria-hidden="true">
            {startIcon}
          </span>
        )}
        {children}
        {endIcon && (
          <span className={styles.icon} aria-hidden="true">
            {endIcon}
          </span>
        )}
      </span>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
});
