"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import {
    LayoutDashboard,
    ShoppingBag,
    ClipboardList,
    Upload,
    Settings,
    LogOut,
    TrendingUp
} from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Demand Forecast", href: "/forecast", icon: TrendingUp },
    { label: "Rescue Bags", href: "/rescue-bags", icon: ShoppingBag },
    { label: "Upload & Extract", href: "/rescue-flow", icon: Upload },
    { label: "Orders", href: "/orders", icon: ClipboardList },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Get restaurant name from user or use default
    const restaurantName = user?.restaurant || "Baker's Oven";

    return (
        <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/5 bg-spare-bg-dark flex flex-col">
            {/* Restaurant Logo/Name */}
            <div className="flex items-center gap-3 p-5 mb-4">
                <div className="flex items-center justify-center shrink-0">
                    <img src="/logo.svg" alt="Spare" className="w-9 h-9" />
                </div>
                <div className="flex flex-col">
                    {/* Label in serif, muted */}
                    <span className="text-xs text-muted-foreground font-serif">Powered by Spare</span>
                    {/* Name in sans, pink */}
                    <span className="text-lg font-semibold text-pink truncate">{restaurantName}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-accent/10 text-accent"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all text-sm font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
