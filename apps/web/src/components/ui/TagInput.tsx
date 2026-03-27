import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}

export function TagInput({
  value,
  onChange,
  placeholder,
  hint,
  disabled = false,
}: TagInputProps): React.JSX.Element {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string): void {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
    setInput('');
  }

  function removeTag(index: number): void {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  return (
    <div>
      <div
        className={`flex min-h-[42px] flex-wrap gap-2 rounded-md border border-input bg-background p-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-sm text-primary-800"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(i);
                }}
                className="ml-1 hover:text-primary-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : undefined}
            className="min-w-[120px] flex-1 bg-transparent py-0.5 text-sm outline-none"
          />
        )}
      </div>
      {hint && <p className={`mt-1 text-xs text-tertiary-600 ${disabled ? 'invisible' : ''}`}>{hint}</p>}
    </div>
  );
}
