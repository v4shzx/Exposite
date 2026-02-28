import React, { createContext, useContext, useState } from 'react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ── Context ────────────────────────────────────────────────────────────────────

const SidebarContext = createContext({ collapsed: false });

export function useSidebar() {
    return useContext(SidebarContext);
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

interface SidebarProps {
    children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <SidebarContext.Provider value={{ collapsed }}>
            <aside
                className={`
                    bg-white border-b md:border-b-0 md:border-r border-gray-200 shadow-sm
                    flex-shrink-0 flex flex-col
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-full md:w-16' : 'w-full md:w-72'}
                `}
            >
                <div className="p-3 flex flex-col h-full overflow-y-auto overflow-x-hidden">
                    {/* Collapse Toggle Button */}
                    <div className={`flex shrink-0 mb-4 ${collapsed ? 'justify-center' : 'justify-end'}`}>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className={`
                                flex items-center gap-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors
                                ${!collapsed ? 'w-full text-sm font-medium' : ''}
                            `}
                            title={collapsed ? 'Mostrar herramientas' : 'Ocultar herramientas'}
                        >
                            {collapsed
                                ? <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                : <>
                                    <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                                    <span>Mostrar / Ocultar Herramientas</span>
                                </>
                            }
                        </button>
                    </div>

                    {/* Sidebar content */}
                    <div className="flex flex-col gap-6 flex-1">
                        {children}
                    </div>

                    {/* Footer of Sidebar - Always Present */}
                    <div className="mt-auto pt-4 flex items-center justify-center border-t border-gray-100 shrink-0">
                        <ThemeToggleButton collapsed={collapsed} />
                    </div>
                </div>
            </aside>
        </SidebarContext.Provider>
    );
}

// ── SidebarSection ─────────────────────────────────────────────────────────────

interface SidebarSectionProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function SidebarSection({ title, children, className = "" }: SidebarSectionProps) {
    const { collapsed } = useSidebar();
    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {title && !collapsed && (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                    {title}
                </p>
            )}
            <div className={`flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
                {children}
            </div>
        </div>
    );
}

// ── SidebarButton ──────────────────────────────────────────────────────────────

interface SidebarButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    className?: string;
    title?: string;
}

export function SidebarButton({ icon, label, onClick, className = "", title }: SidebarButtonProps) {
    const { collapsed } = useSidebar();
    return (
        <button
            onClick={onClick}
            title={title ?? label}
            className={`
                flex items-center font-semibold transition-all rounded-xl border
                ${collapsed
                    ? 'justify-center p-3 w-10 h-10'
                    : 'gap-3 w-full text-left py-3 px-4'
                }
                ${className}
            `}
        >
            {icon}
            {!collapsed && <span>{label}</span>}
        </button>
    );
}

// ── SidebarSeparator ───────────────────────────────────────────────────────────

export function SidebarSeparator() {
    return <div className="h-px bg-gray-100 shrink-0" />;
}
