import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Visible label. Always required so the field has an accessible name. */
  label: ReactNode;
  /** Hides the label visually but keeps it for screen readers. */
  hideLabel?: boolean;
  /** Supporting text shown under the field and linked via `aria-describedby`. */
  helperText?: ReactNode;
  /**
   * Error message. When set, the field is marked `aria-invalid` and the
   * message is linked via `aria-describedby`.
   */
  error?: ReactNode;
  /** Content rendered at the inline-start of the field (e.g. an icon or unit). */
  prefix?: ReactNode;
  /** Content rendered at the inline-end of the field. */
  suffix?: ReactNode;
  /** Class name for the outer wrapper. `className` goes to the `<input>`. */
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hideLabel = false,
    helperText,
    error,
    prefix,
    suffix,
    id: idProp,
    className,
    wrapperClassName,
    disabled,
    required,
    'aria-describedby': describedByProp,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);

  const describedBy =
    [describedByProp, helperText ? helperId : null, invalid ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const labelContent = (
    <>
      {label}
      {required && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
    </>
  );

  return (
    <div
      className={cx(
        styles.root,
        invalid && styles.invalid,
        disabled && styles.disabled,
        wrapperClassName,
      )}
    >
      <label htmlFor={id} className={styles.label}>
        {hideLabel ? <VisuallyHidden>{labelContent}</VisuallyHidden> : labelContent}
      </label>
      <div className={styles.control}>
        {prefix && <span className={styles.affix}>{prefix}</span>}
        <input
          ref={ref}
          id={id}
          className={cx(styles.input, className)}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {suffix && <span className={styles.affix}>{suffix}</span>}
      </div>
      {helperText && (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      )}
      {invalid && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
});
