import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

interface ThemeToggleButtonProps {
    collapsed?: boolean;
}

export function ThemeToggleButton({ collapsed = false }: ThemeToggleButtonProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const color = isDark ? '#ffffff' : '#000000';
    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const transpBg = 'transparent';

    return (
        <button
            onClick={toggleTheme}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: collapsed ? '0.5rem' : '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: `2px solid ${color}`,
                cursor: 'pointer',
                background: transpBg,
                color: color,
                fontSize: '0.875rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = hoverBg;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = transpBg;
            }}
            aria-label={isDark ? 'Cambiar Claro' : 'Cambiar Oscuro'}
        >
            {isDark
                ? <Sun className="w-5 h-5" style={{ flexShrink: 0 }} />
                : <Moon className="w-5 h-5" style={{ flexShrink: 0 }} />
            }
            {!collapsed && (
                <span>{isDark ? 'Cambiar Claro' : 'Cambiar Oscuro'}</span>
            )}
        </button>
    );
}
