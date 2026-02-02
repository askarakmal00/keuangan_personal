
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard" },
        { href: "/transactions", label: "Transaksi" },
        { href: "/debts", label: "Hutang" },
        { href: "/investments", label: "Investasi" },
        { href: "/goals", label: "Impian" },
    ];

    return (
        <nav className="border-b bg-background">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                <Link href="/" className="font-bold text-xl tracking-tight">
                    Mas Dompet
                </Link>
                <div className="flex items-center gap-4">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === link.href
                                    ? "text-primary border-b-2 border-primary pb-1"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
