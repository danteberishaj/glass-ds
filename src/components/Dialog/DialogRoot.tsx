'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  type RefCallback,
  type SyntheticEvent,
} from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import { Button, type ButtonProps } from '../Button';
import styles from './Dialog.module.css';
import { isDev } from '../../internal/env';

/*
 * Internal client foundation shared by Dialog and Drawer: a native <dialog> opened with
 * showModal(), so focus trapping, Esc, the inert background, the top layer and focus return
 * all come from the browser. Not exported from the package; Dialog and Drawer add the look.
 */


/** Why the dialog asked to close. */
export type DialogOpenChangeReason =
  /** Escape key (or a browser close request such as Android back). */
  | 'escape'
  /** A click on the backdrop. */
  | 'backdrop'
  /** A `DialogClose` button. */
  | 'close'
  /** The element closed on its own, e.g. `<form method="dialog">` or `dialog.close()`. */
  | 'native'
  /** Reserved for the owner's own `open` changes; never emitted by the dialog itself. */
  | 'prop';

export type DialogOpenChangeDetails = { reason: DialogOpenChangeReason };

type DialogContextValue = {
  titleId: string;
  descriptionId: string;
  /** Returns an unregister function. Lets the root warn (dev only) when no title is mounted. */
  registerTitle: () => () => void;
  close: () => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export type DialogRootProps = Omit<ComponentPropsWithRef<'dialog'>, 'open'> & {
  /** Controlled open state. Leave undefined to let the dialog manage itself (see `defaultOpen`). */
  open?: boolean;
  defaultOpen?: boolean;
  /**
   * Called when the dialog asks to close (Esc, backdrop click, DialogClose, form method="dialog").
   * The second argument says why. Never called for changes you make through the `open` prop.
   */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /** `true` (default): showModal() — top layer, backdrop, focus trap, inert page. `false`: show(). */
  modal?: boolean;
  /**
   * `true` (default): Esc and backdrop click close it. `false`: only your own controls can
   * (shorthand for `closeOnEscape={false} closeOnBackdropClick={false}`).
   */
  dismissible?: boolean;
  /** Close on Escape / browser close requests. Defaults to `dismissible`. */
  closeOnEscape?: boolean;
  /** Close on a click on the backdrop (modal only). Defaults to `dismissible`. */
  closeOnBackdropClick?: boolean;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') return ref(value);
  if (ref) ref.current = value;
}

export function DialogRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  dismissible = true,
  closeOnEscape = dismissible,
  closeOnBackdropClick = dismissible,
  ref,
  className,
  children,
  onCancel,
  onClose,
  onKeyDown,
  onPointerDown,
  onClick,
  ...rest
}: DialogRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = openProp ?? uncontrolledOpen;
  const nodeRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  /** Last open state we applied to the element; lets the native `close` event tell user closes apart. */
  const appliedOpen = useRef(false);
  const pointerDownOnBackdrop = useRef(false);
  const titleCount = useRef(0);
  const warnedNoTitle = useRef(false);

  const setOpen = useCallback(
    (next: boolean, reason: DialogOpenChangeReason) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next, { reason });
    },
    [openProp, onOpenChange],
  );
  // Esc fires both our keydown handler and the native `cancel` event: once the element has
  // closed (or the owner is closing it), later requests in the same gesture are no-ops.
  const close = useCallback(
    (reason: DialogOpenChangeReason) => {
      const el = nodeRef.current;
      if (el && !el.open) return;
      setOpen(false, reason);
    },
    [setOpen],
  );

  // The prop is the source of truth: sync it to the element imperatively.
  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    appliedOpen.current = isOpen;
    if (isOpen && !el.open) {
      if (modal) el.showModal();
      else el.show();
      // Initial focus on the panel (not the first button, usually the corner ✕), so screen
      // readers read the title first. tabIndex={-1} keeps it out of the tab sequence.
      panelRef.current?.focus({ preventScroll: true });
      if (isDev && titleCount.current === 0 && !warnedNoTitle.current) {
        warnedNoTitle.current = true;
        console.warn(
          'glass-ds: <Dialog>/<Drawer> opened without a <DialogTitle>/<DrawerTitle>. ' +
            'Add one so the dialog has an accessible name (or pass aria-label).',
        );
      }
    } else if (!isOpen && el.open) {
      el.close();
    }
  }, [isOpen, modal]);

  // Unmounting while open: close the element so the top layer, inert page and scroll lock are
  // released (the browser does this on removal, but the `close` event must not report it).
  // Layout effect: the ref is still attached when its cleanup runs.
  useLayoutEffect(() => {
    const el = nodeRef.current;
    return () => {
      if (el?.open) {
        appliedOpen.current = false;
        el.close();
      }
    };
  }, []);

  const setRefs: RefCallback<HTMLDialogElement> = useCallback(
    (node) => {
      nodeRef.current = node;
      return assignRef(ref, node);
    },
    [ref],
  );

  const titleId = useId();
  const descriptionId = useId();
  const ctx = useMemo<DialogContextValue>(
    () => ({
      titleId,
      descriptionId,
      registerTitle: () => {
        titleCount.current += 1;
        return () => {
          titleCount.current -= 1;
        };
      },
      close: () => close('close'),
    }),
    [titleId, descriptionId, close],
  );

  // Esc: handled here (not only via `cancel`) so it is controlled, works with synthetic events
  // in tests, and can be fully blocked: Chrome ignores preventDefault on a repeated `cancel`.
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDialogElement>) => {
    onKeyDown?.(e);
    if (e.key !== 'Escape' || e.defaultPrevented || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (closeOnEscape) close('escape');
  };

  // Other close requests (Android back, close watchers): keep the element open and ask the owner.
  const handleCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    onCancel?.(e);
    const vetoed = e.defaultPrevented;
    e.preventDefault();
    if (closeOnEscape && !vetoed) close('escape');
  };

  // Closed natively without us (e.g. <form method="dialog">): report it.
  const handleClose = (e: SyntheticEvent<HTMLDialogElement>) => {
    onClose?.(e);
    if (appliedOpen.current) {
      appliedOpen.current = false;
      setOpen(false, 'native');
    }
  };

  // The panel fills the dialog box, so an event whose target is the <dialog> itself hit ::backdrop.
  // Require the press to start there too, so a text selection dragged outside doesn't close it.
  const handlePointerDown = (e: ReactPointerEvent<HTMLDialogElement>) => {
    onPointerDown?.(e);
    pointerDownOnBackdrop.current = e.target === e.currentTarget;
  };
  const handleClick = (e: ReactMouseEvent<HTMLDialogElement>) => {
    onClick?.(e);
    const onBackdrop = pointerDownOnBackdrop.current && e.target === e.currentTarget;
    pointerDownOnBackdrop.current = false;
    if (onBackdrop && closeOnBackdropClick && modal && !e.defaultPrevented) close('backdrop');
  };

  return (
    <DialogContext value={ctx}>
      <dialog
        ref={setRefs}
        data-modal={modal}
        data-dismissible={closeOnEscape || closeOnBackdropClick}
        closedby={closeOnEscape ? undefined : 'none'}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cx(GLASS_CLASS, styles.root, className)}
        onKeyDown={handleKeyDown}
        onCancel={handleCancel}
        onClose={handleClose}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        {...rest}
      >
        <div ref={panelRef} tabIndex={-1} className={styles.panel}>
          {children}
        </div>
      </dialog>
    </DialogContext>
  );
}

function useDialogContext(part: string) {
  const ctx = use(DialogContext);
  if (!ctx) throw new Error(`<${part}> must be rendered inside <Dialog> or <Drawer>.`);
  return ctx;
}

export type DialogTitleProps = ComponentPropsWithRef<'h2'> & {
  /** Heading level. Defaults to `h2`. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

/** Names the dialog: wired to the dialog's `aria-labelledby`. */
export function DialogTitle({ as: Heading = 'h2', className, id, ...rest }: DialogTitleProps) {
  const { titleId, registerTitle } = useDialogContext('DialogTitle');
  useEffect(() => registerTitle(), [registerTitle]);
  return <Heading id={id ?? titleId} className={cx(styles.title, className)} {...rest} />;
}

export type DialogDescriptionProps = ComponentPropsWithRef<'p'>;

/** Describes the dialog: wired to the dialog's `aria-describedby`. */
export function DialogDescription({ className, id, ...rest }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext('DialogDescription');
  return <p id={id ?? descriptionId} className={cx(styles.description, className)} {...rest} />;
}

export type DialogCloseProps = ButtonProps & {
  /** Accessible label for the icon-only close button (rendered when there are no children). */
  label?: string;
};

/**
 * A Button that closes the dialog. With children it is a normal button (e.g. "Cancel");
 * without, it is an icon button pinned to the panel's top-right corner. Place the icon-only
 * `<DialogClose />` **last** inside the dialog: it is positioned absolutely, so DOM order is
 * free, and screen readers then reach the title and content before the close control.
 * Call `event.preventDefault()` in `onClick` to keep the dialog open.
 */
export function DialogClose({
  children,
  label = 'Close',
  variant = 'ghost',
  size,
  className,
  onClick,
  ...rest
}: DialogCloseProps) {
  const { close } = useDialogContext('DialogClose');
  const iconOnly = children == null;
  return (
    <Button
      variant={variant}
      size={size ?? (iconOnly ? 'sm' : 'md')}
      data-icon={iconOnly || undefined}
      className={cx(iconOnly && styles.closeIcon, className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) close();
      }}
      {...rest}
    >
      {iconOnly ? (
        <>
          <svg className={styles.closeGlyph} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
          <span className={SR_ONLY_CLASS}>{label}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
