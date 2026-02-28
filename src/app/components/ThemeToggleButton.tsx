import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

interface ThemeToggleButtonProps {
    collapsed?: boolean;
}

export function ThemeToggleButton({ collapsed = false }: ThemeToggleButtonProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className={`
                flex items-center font-semibold transition-all rounded-xl border
                text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent
                ${collapsed
                    ? 'justify-center p-3 w-10 h-10'
                    : 'gap-3 w-full text-left py-3 px-4'
                }
            `}
            aria-label={isDark ? 'Cambiar Claro' : 'Cambiar Oscuro'}
        >
            {isDark
                ? <Sun className="w-5 h-5 flex-shrink-0" />
                : <Moon className="w-5 h-5 flex-shrink-0" />
            }
            {!collapsed && (
                <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
            )}
        </button>
    );
}
