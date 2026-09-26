import type { Direction } from '@mds/tokens';
import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef, useId, type ReactNode } from 'react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '../../internal/icons';
import { cx } from '../../utils/cx';
import { useDocumentDirection } from '../../utils/useDocumentDirection';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import styles from './Select.module.css';

export interface SelectOption {
  /** Submitted value. Must be a non-empty string. */
  value: string;
  /** Text shown in the list and in the trigger once selected; also used for typeahead. */
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Visible label. Always required so the field has an accessible name. */
  label: ReactNode;
  /** Hides the label visually but keeps it for screen readers. */
  hideLabel?: boolean;
  options: readonly SelectOption[];
  /** Shown in the trigger while nothing is selected. */
  placeholder?: ReactNode;
  /** Supporting text shown under the field and linked via `aria-describedby`. */
  helperText?: ReactNode;
  /** Error message. When set, the field is marked `aria-invalid` and the message is linked. */
  error?: ReactNode;
  /** Controlled value. Pair with `onValueChange`. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Field name, for native form submission. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Text direction. Defaults to the document's (`<html dir>`); set it for a subtree that differs. */
  dir?: Direction;
  /** Id of the trigger. Generated when omitted. */
  id?: string;
  /** Class name for the trigger button. */
  className?: string;
  /** Class name for the outer wrapper. */
  wrapperClassName?: string;
  'aria-describedby'?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    label,
    hideLabel = false,
    options,
    placeholder,
    helperText,
    error,
    value,
    defaultValue,
    onValueChange,
    name,
    required,
    disabled,
    dir: dirProp,
    id: idProp,
    className,
    wrapperClassName,
    'aria-describedby': describedByProp,
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);
  // Radix writes `dir` onto the trigger and list and defaults to "ltr", which
  // would override an RTL page. Follow the document unless told otherwise.
  const documentDir = useDocumentDirection();
  const dir = dirProp ?? documentDir;

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
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        required={required}
        disabled={disabled}
        dir={dir}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          id={id}
          className={cx(styles.trigger, className)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          <span className={styles.value}>
            <SelectPrimitive.Value placeholder={placeholder} />
          </span>
          <SelectPrimitive.Icon className={styles.chevron}>
            <ChevronDownIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content position="popper" sideOffset={4} className={styles.content}>
            <SelectPrimitive.ScrollUpButton className={styles.scrollButton}>
              <ChevronUpIcon />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className={styles.viewport}>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={styles.item}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className={styles.indicator}>
                    <CheckIcon />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className={styles.scrollButton}>
              <ChevronDownIcon />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
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
