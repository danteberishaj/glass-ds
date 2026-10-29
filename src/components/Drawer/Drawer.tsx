import { cx } from '../../utils/cx';
import { DialogRoot, type DialogRootProps } from '../Dialog/DialogRoot';
import styles from './Drawer.module.css';

/*
 * Same native-dialog foundation as Dialog (DialogRoot: open sync, Esc, backdrop click, scroll lock,
 * title/description wiring); only the position, size and slide animation differ. The parts are
 * Dialog's, re-exported under Drawer names because the wiring is identical.
 */

export {
  DialogHeader as DrawerHeader,
  DialogTitle as DrawerTitle,
  DialogDescription as DrawerDescription,
  DialogBody as DrawerBody,
  DialogFooter as DrawerFooter,
  DialogClose as DrawerClose,
} from '../Dialog/Dialog';
export type {
  DialogHeaderProps as DrawerHeaderProps,
  DialogTitleProps as DrawerTitleProps,
  DialogDescriptionProps as DrawerDescriptionProps,
  DialogBodyProps as DrawerBodyProps,
  DialogFooterProps as DrawerFooterProps,
  DialogCloseProps as DrawerCloseProps,
  DialogOpenChangeReason as DrawerOpenChangeReason,
  DialogOpenChangeDetails as DrawerOpenChangeDetails,
} from '../Dialog/Dialog';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg';

export type DrawerProps = DialogRootProps & {
  /** Edge it slides in from. Defaults to `right`. */
  side?: DrawerSide;
  /** Width for left/right, height for top/bottom. */
  size?: DrawerSize;
};

/** A glass panel that slides in from an edge, on a native modal `<dialog>`. Name it with DrawerTitle. */
export function Drawer({ side = 'right', size = 'md', className, ...rest }: DrawerProps) {
  return (
    <DialogRoot
      data-intensity="strong"
      data-side={side}
      data-size={size}
      className={cx(styles.drawer, className)}
      {...rest}
    />
  );
}
