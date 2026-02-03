"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    return (
        <main
            className={clsx(
                "p-8 transition-all duration-300 min-h-screen flex flex-col",
                !isLoginPage ? "ml-0 sm:ml-64" : "w-full items-center justify-center bg-gray-100"
            )}
        >
            <div className={clsx("w-full flex-1", !isLoginPage && "max-w-7xl mx-auto")}>
                {children}
            </div>
        </main>
    );
}
