import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

type LogoVariant = 'dark' | 'light';
type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  asLink?: boolean;
  to?: string;
  className?: string;
}

const SIZE_CLASS: Record<LogoSize, string> = {
  sm: 'text-xl',
  md: 'text-[1.52rem]',
  lg: 'text-3xl',
};

export function Logo({
  variant = 'dark',
  size = 'md',
  asLink = true,
  to = '/',
  className,
}: LogoProps): React.JSX.Element {
  const baseColor = variant === 'light' ? 'text-white' : 'text-[#140B00]';

  const content = (
    <span
      className={cn(
        'font-serif font-black tracking-[-0.02em] leading-none',
        SIZE_CLASS[size],
        baseColor,
        className,
      )}
    >
      Table<span className="text-secondary-400">.ba</span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link to={to} className="inline-flex items-center" aria-label="Table.ba">
      {content}
    </Link>
  );
}
