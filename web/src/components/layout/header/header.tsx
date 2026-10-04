"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, ShoppingBag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { selectCartTotalItems } from "@/store/slices/cart.slice";
import { UserNav } from "@/features/auth/components";
import { CartDrawer } from "@/features/cart/components/cart-drawer";

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCartItems = useAppSelector(selectCartTotalItems) || 0;
  const displayCartItems = mounted ? totalCartItems : 0;

  const navLinks = [
    { name: "Home", href: "/" },
    {
      name: "API",
      href: "/api-docs",
      isHighlighted: true,
      icon: Code2,
    },
    { name: "Catalog", href: "/posters" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md transition-all">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 shadow-md transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Artisan<span className="text-amber-500">Frame</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Full-Stack NestJS + Next.js
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary/50 p-1.5 rounded-full border border-border/40">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                    link.isHighlighted && !isActive && "text-amber-500 hover:text-amber-400 font-semibold"
                  )}
                >
                  {Icon && <Icon className={cn("h-4 w-4", link.isHighlighted && !isActive && "text-amber-500")} />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            <Link
              href="/api-docs"
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20"
            >
              <Code2 className="h-3.5 w-3.5" />
              API Docs
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-secondary/30 text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span suppressHydrationWarning className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black font-mono">
                {displayCartItems}
              </span>
            </button>

            {/* User Auth Navigation */}
            <UserNav />
          </div>
        </div>
      </header>

      {/* Cart Drawer Component */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}

