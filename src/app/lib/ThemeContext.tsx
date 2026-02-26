import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        // Temporarily disable transitions so the toggle itself doesn't flicker.
        // The CSS transitions on background-color/color will handle the fade.
        // We use a one-frame pause to let the new class apply, then re-enable.
        const root = document.documentElement;
        root.classList.add('theme-switching');
        // Remove the class after the transition duration (300ms) + a tiny buffer
        requestAnimationFrame(() => {
            setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
            setTimeout(() => root.classList.remove('theme-switching'), 350);
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
