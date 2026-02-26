import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

export function ThemeToggleButton() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    // Colores según el tema activo
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
                gap: '0.5rem',
                padding: '0.5rem 1rem',        /* py-2 px-4 */
                borderRadius: '0.5rem',         /* rounded-lg */
                border: `2px solid ${color}`,   /* border-2 */
                cursor: 'pointer',
                background: transpBg,
                color: color,
                fontSize: '0.875rem',           /* text-sm ≈ font-medium */
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
            <span>{isDark ? 'Cambiar Claro' : 'Cambiar Oscuro'}</span>
        </button>
    );
}
