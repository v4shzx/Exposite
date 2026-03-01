import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

// ── Context ────────────────────────────────────────────────────────────────────

const SidebarContext = createContext({ collapsed: false });

export function useSidebar() {
    return useContext(SidebarContext);
}

// ── Hook: detect mobile ────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [breakpoint]);
    return isMobile;
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

interface SidebarProps {
    children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useIsMobile();

    // Close drawer when switching to desktop
    useEffect(() => {
        if (!isMobile) setMobileOpen(false);
    }, [isMobile]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const closeMobile = useCallback(() => setMobileOpen(false), []);

    // ── Mobile: hamburger + drawer ──────────────────────────────────────────
    if (isMobile) {
        return (
            <SidebarContext.Provider value={{ collapsed: false }}>
                {/* Hamburger toggle */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="fixed top-4 left-4 z-50 p-2.5 bg-white border border-gray-200 rounded-xl shadow-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    title="Abrir menú"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Backdrop */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={closeMobile}
                    />
                )}

                {/* Drawer */}
                <aside
                    className={`
                        fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 shadow-2xl
                        flex flex-col transition-transform duration-300 ease-in-out
                        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <div className="p-4 flex flex-col h-full overflow-y-auto overflow-x-hidden">
                        {/* Close button */}
                        <div className="flex justify-end mb-4 shrink-0">
                            <button
                                onClick={closeMobile}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                title="Cerrar menú"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-6 flex-1">
                            {children}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-4 flex items-center justify-center border-t border-gray-100 shrink-0">
                            <ThemeToggleButton collapsed={false} />
                        </div>
                    </div>
                </aside>
            </SidebarContext.Provider>
        );
    }

    // ── Desktop: collapsible side panel ─────────────────────────────────────
    return (
        <SidebarContext.Provider value={{ collapsed }}>
            <aside
                className={`
                    bg-white border-r border-gray-200 shadow-sm
                    flex-shrink-0 flex flex-col
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-16' : 'w-72'}
                `}
            >
                <div className="p-3 flex flex-col h-full overflow-y-auto overflow-x-hidden">
                    {/* Collapse Toggle */}
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

                    {/* Content */}
                    <div className="flex flex-col gap-6 flex-1">
                        {children}
                    </div>

                    {/* Footer */}
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
