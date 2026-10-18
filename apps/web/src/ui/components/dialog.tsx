import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export function DialogContent({ className, children, ...props }: ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Overlay className="dialog-overlay"/><Primitive.Content className={cn('dialog-content', className)} {...props}>{children}<Primitive.Close className="dialog-close" aria-label="Close"><X/></Primitive.Close></Primitive.Content></Primitive.Portal>;
}
export function DialogTitle({ className, ...props }: ComponentProps<typeof Primitive.Title>) { return <Primitive.Title className={cn('dialog-title', className)} {...props}/>; }
export function DialogDescription({ className, ...props }: ComponentProps<typeof Primitive.Description>) { return <Primitive.Description className={cn('dialog-description', className)} {...props}/>; }
