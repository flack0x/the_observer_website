'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-300
        bg-midnight-700 hover:bg-midnight-600
        dark:bg-midnight-700 dark:hover:bg-midnight-600
        text-slate-medium hover:text-slate-light
        ${className}
      `}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon - visible in dark mode */}
        <Sun
          className={`
            absolute inset-0 h-5 w-5 transition-all duration-300
            ${resolvedTheme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
            }
          `}
        />
        {/* Moon icon - visible in light mode */}
        <Moon
          className={`
            absolute inset-0 h-5 w-5 transition-all duration-300
            ${resolvedTheme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
            }
          `}
        />
      </div>
    </button>
  );
}
