import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleProps extends React.ComponentProps<'div'> {
  open: boolean;
  contentClassName?: string;
}

export function Collapsible({
  open,
  className,
  contentClassName,
  children,
  ...props
}: CollapsibleProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-in-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
      {...props}
    >
      <div className={cn('overflow-hidden', contentClassName)}>{children}</div>
    </div>
  );
}
