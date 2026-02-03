"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, FileText, Settings, Server, MessageSquare, Users, LogOut, Lock } from "lucide-react";
import clsx from "clsx";
import { useSession, signOut } from "next-auth/react";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "SALES"] },
    { name: "Pricing DB", href: "/pricing", icon: Database, roles: ["ADMIN"] },
    { name: "Quotes (BOQ)", href: "/quotes", icon: FileText, roles: ["ADMIN", "SALES"] },
    { name: "Customers", href: "/customers", icon: Users, roles: ["ADMIN", "SALES"] },
    { name: "Chat Bot", href: "/chat", icon: MessageSquare, roles: ["ADMIN", "SALES"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || "SALES";

    // Don't show navbar if not logged in (handled by middleware usually, but good for UX)
    if (!session) return null;

    return (
        <nav className="bg-white border-r border-gray-200 text-gray-700 w-64 min-h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                    <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">Comms Engine</h1>
                    <p className="text-xs text-indigo-500 font-medium">Enterprise v1.2</p>
                </div>
            </div>

            <div className="flex-1 px-3 py-6 space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
                {navItems.map((item) => {
                    if (!item.roles.includes(userRole)) return null;

                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
                            )}
                            <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                        <Lock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs py-2 rounded-md transition-colors border border-gray-200 shadow-sm"
                >
                    <LogOut className="w-3 h-3" /> Sign Out
                </button>
            </div>
        </nav>
    );
}
