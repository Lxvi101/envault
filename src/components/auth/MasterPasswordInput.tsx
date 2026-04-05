import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

interface MasterPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  error?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function MasterPasswordInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter your master password',
  error = false,
  autoFocus = true,
  disabled = false,
}: MasterPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length > 0) {
      onSubmit();
    }
  };

  return (
    <motion.div
      animate={error ? { x: [-12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <input
        ref={inputRef}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-3.5 pr-12 rounded-xl text-base',
          'bg-vault-bg/60 text-vault-text placeholder-vault-muted',
          'border transition-all duration-200 outline-none',
          'backdrop-blur-sm',
          error
            ? 'border-vault-danger/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
            : 'border-vault-border focus:border-vault-accent focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
        className={clsx(
          'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg',
          'text-vault-muted hover:text-vault-text transition-colors duration-150',
          'focus:outline-none',
        )}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </motion.div>
  );
}
