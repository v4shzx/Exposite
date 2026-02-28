import React from 'react';
import { ThemeToggleButton } from './ThemeToggleButton';

interface SidebarProps {
    children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
    return (
        <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-200 shadow-sm flex-shrink-0 flex flex-col">
            <div className="p-6 flex flex-col gap-8 h-full overflow-y-auto">
                {children}

                {/* Footer of Sidebar - Always Present */}
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100 shrink-0">
                    <ThemeToggleButton />
                </div>
            </div>
        </aside>
    );
}

interface SidebarSectionProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function SidebarSection({ title, children, className = "" }: SidebarSectionProps) {
    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {title && (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {title}
                </p>
            )}
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    );
}

export function SidebarSeparator() {
    return <div className="h-px bg-gray-100 shrink-0" />;
}
