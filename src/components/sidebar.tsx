"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Receipt,
    Target,
    TrendingUp,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    LogOut,
    Menu,
    X,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Receipt, label: "Transactions", href: "/transactions" },
    { icon: Target, label: "Goals", href: "/goals" },
    { icon: TrendingUp, label: "Investments", href: "/investments" },
    { icon: CreditCard, label: "Debts", href: "/debts" },
];

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    const SidebarContent = () => (
        <>
            {/* Header / Profile */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                        <User className="w-5 h-5" />
                    </div>
                    {isExpanded && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">Mas Dompet</p>
                            <p className="text-xs text-gray-500 truncate">Finance App</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-3 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                "hover:bg-gray-100",
                                isActive
                                    ? "bg-cyan-500 text-white shadow-sm"
                                    : "text-gray-700"
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {isExpanded && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 space-y-1 border-t border-gray-200">
                <button
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-700 w-full"
                >
                    <HelpCircle className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span className="text-sm font-medium">Help</span>}
                </button>
                <button
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-700 w-full"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>

            {/* Toggle Button (Desktop only) */}
            <div className="p-3 hidden md:block">
                <Button
                    onClick={toggleSidebar}
                    variant="ghost"
                    size="sm"
                    className="w-full hover:bg-gray-100 text-gray-700"
                >
                    {isExpanded ? (
                        <ChevronLeft className="w-5 h-5" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                onClick={toggleMobile}
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm"
            >
                {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleMobile}
                />
            )}

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col h-screen bg-white border-r border-gray-200 sticky top-0 transition-all duration-300",
                    isExpanded ? "w-64" : "w-20"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-transform duration-300 md:hidden",
                    "w-64 flex flex-col",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
