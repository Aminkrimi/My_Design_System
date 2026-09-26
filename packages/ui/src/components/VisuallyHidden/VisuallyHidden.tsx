import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './VisuallyHidden.module.css';

export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

/** Hides content visually while keeping it available to assistive technology. */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ className, ...props }, ref) {
    return <span ref={ref} className={cx(styles.root, className)} {...props} />;
  },
);
