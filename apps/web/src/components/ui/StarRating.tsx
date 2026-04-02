import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 24,
}: StarRatingProps): React.JSX.Element {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={`transition-colors ${
            (hovered || value) >= i
              ? 'fill-primary-400 text-primary-400'
              : 'text-tertiary-300'
          } ${!readonly ? 'cursor-pointer' : ''}`}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(i)}
        />
      ))}
    </div>
  );
}
