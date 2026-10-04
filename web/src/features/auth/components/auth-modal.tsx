"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, ShieldCheck, Lock } from "lucide-react";
import { GoogleLoginButton } from "./google-login-button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 text-foreground p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 shadow-md mb-2">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight">
            Welcome to ArtisanFrame
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-xs">
            Sign in using Google OAuth 2.0. NestJS will issue 2 HttpOnly cookies (<code className="text-amber-400">access_token</code> & <code className="text-amber-400">refresh_token</code>) for silent authentication.
          </DialogDescription>
        </DialogHeader>

        {/* Security Feature Highlights */}
        <div className="my-4 p-3 rounded-xl bg-secondary/40 border border-border/50 text-[11px] text-muted-foreground flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secure HttpOnly JWT Cookies</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span>Automatic Silent Re-Authentication (15 min)</span>
          </div>
        </div>

        {/* Google OAuth Login */}
        <GoogleLoginButton onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
