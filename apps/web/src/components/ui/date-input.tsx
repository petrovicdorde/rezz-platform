import * as React from 'react';
import { cn } from '@/lib/utils';

interface DateInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  type?: 'date' | 'time' | 'datetime-local';
  placeholder?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput(
    {
      className,
      type = 'date',
      placeholder,
      onChange,
      onInput,
      defaultValue,
      value,
      ...props
    },
    ref,
  ) {
    const initialEmpty = !(value ?? defaultValue);
    const [isEmpty, setIsEmpty] = React.useState(initialEmpty);
    const localRef = React.useRef<HTMLInputElement | null>(null);

    function setRefs(el: HTMLInputElement | null): void {
      localRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.RefObject<HTMLInputElement | null>).current = el;
      }
      if (el) setIsEmpty(!el.value);
    }

    React.useEffect(() => {
      if (value !== undefined) setIsEmpty(!value);
    }, [value]);

    return (
      <div className="relative">
        <input
          ref={setRefs}
          type={type}
          value={value as string | undefined}
          defaultValue={defaultValue as string | undefined}
          onChange={(e) => {
            setIsEmpty(!e.target.value);
            onChange?.(e);
          }}
          onInput={(e) => {
            setIsEmpty(!(e.target as HTMLInputElement).value);
            onInput?.(e);
          }}
          className={cn(
            'h-10 w-full min-w-0 rounded-md border border-tertiary-400 bg-white px-3 py-2 text-sm shadow-xs outline-none transition-colors',
            'focus-visible:border-primary-400',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-destructive',
            isEmpty && 'text-transparent focus:text-current',
            className,
          )}
          {...props}
        />
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-tertiary-600">
            {placeholder}
          </span>
        )}
      </div>
    );
  },
);
