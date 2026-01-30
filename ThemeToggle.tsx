'use client';

import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/contexts/ThemeContext';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: Theme; label: string; icon: JSX.Element }> = [
    { value: 'light', label: 'Light', icon: <Sun className="mr-2 h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="mr-2 h-4 w-4" /> },
    { value: 'luminous', label: 'Luminous', icon: <Sparkles className="mr-2 h-4 w-4" /> }
  ];

  return (
    <>
      {themes.map((t) => (
        <DropdownMenuItem
          key={t.value}
          onClick={(): void => setTheme(t.value)}
          className={`cursor-pointer ${theme === t.value ? 'bg-accent' : ''}`}
        >
          {t.icon}
          <span>{t.label}</span>
          {theme === t.value && (
            <span className="ml-auto text-xs">✓</span>
          )}
        </DropdownMenuItem>
      ))}
    </>
  );
}
