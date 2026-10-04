"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { useLogoutMutation } from "@/store/api/auth.api";
import { AuthModal } from "./auth-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

export function UserNav() {
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
      toast.success("Successfully logged out");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!mounted) {
    return (
      <div className="h-9 w-20 rounded-full bg-secondary/30 animate-pulse" />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Sign In</span>
        </button>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";
  const isAdmin = user.role === "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1.5 rounded-full border border-border/50 bg-secondary/40 hover:bg-secondary transition-colors cursor-pointer outline-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 font-bold text-white text-xs shadow-sm">
            {userInitial}
          </div>
          <span className="text-xs font-bold hidden sm:inline max-w-[100px] truncate">
            {user.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User Info Header */}
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground truncate">
              {user.name}
            </span>
            {isAdmin ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="h-3 w-3" /> Admin
              </span>
            ) : (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                User
              </span>
            )}
          </div>
          <span className="text-[11px] font-normal text-muted-foreground truncate">
            {user.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <Link href="/myorders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-500" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Logout Action */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
