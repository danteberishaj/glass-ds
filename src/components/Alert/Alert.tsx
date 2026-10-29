import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Alert.module.css';

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type AlertProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  tone?: AlertTone;
  /** Short heading line. */
  title?: ReactNode;
  /** Leading icon (decorative; hidden from assistive tech). */
  icon?: ReactNode;
  /**
   * Interrupts the screen reader (`role="alert"`). Only for time-sensitive problems that need
   * immediate attention; everything else uses the polite `role="status"` default.
   */
  urgent?: boolean;
};

/**
 * Inline message on a tinted glass surface. Hook-free (server-safe).
 * Live regions announce content that changes after mount: render the Alert container
 * up front, or expect only newly inserted alerts to be read out.
 */
export function Alert({ tone = 'neutral', title, icon, urgent = false, className, children, ...rest }: AlertProps) {
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      data-tone={tone}
      className={cx(GLASS_CLASS, styles.root, className)}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.body}>
        {title && <div className={styles.title}>{title}</div>}
        {children && <div className={styles.description}>{children}</div>}
      </div>
    </div>
  );
}
