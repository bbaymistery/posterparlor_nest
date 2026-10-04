import Link from "next/link";
import { Sparkles, ArrowRight, Code2, ShieldCheck, CreditCard } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative py-20 px-4 sm:px-8 overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/40 via-background to-secondary/20 border border-border/40 mb-16">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Full-Stack NestJS + Next.js 16 Store</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-foreground">
          Premium Art Prints & <br />
          <span className="bg-gradient-to-r from-amber-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Futuristic ArtisanFrame Studio
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Discover high-resolution wall art powered by a robust NestJS REST API, HttpOnly JWT authentication, Cloudinary CDN, and Stripe Checkout integration.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/posters"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all hover:scale-105"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/api-docs"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary/80 text-foreground border border-border/50 font-bold text-sm hover:bg-secondary transition-all"
          >
            <Code2 className="h-4 w-4 text-amber-500" />
            <span>API Documentation</span>
          </Link>
        </div>

        {/* Stack Highlights Footer */}
        <div className="grid grid-cols-3 gap-6 pt-10 border-t border-border/40 w-full max-w-xl text-[11px] font-medium text-muted-foreground">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>OAuth 2.0 Auth</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CreditCard className="h-4 w-4 text-blue-400" />
            <span>Stripe Checkout</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Cloudinary CDN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
