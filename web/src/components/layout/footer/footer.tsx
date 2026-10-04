import Link from "next/link";
import { Sparkles, Code2, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-sm py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            ArtisanFrame <span className="text-muted-foreground font-normal">| NestJS + Next.js Fullstack</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/api-docs" className="text-amber-500 font-semibold hover:text-amber-400 transition-colors flex items-center gap-1">
            <Code2 className="h-3.5 w-3.5" />
            API Documentation
          </Link>
          <Link href="/posters" className="hover:text-foreground transition-colors">
            Catalog
          </Link>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Created </span>
          <Github className="h-3 w-3 text-red-500 fill-red-500 inline" />
          <span>
            <a href="https://github.com/bbaymistery" target="_blank" rel="noopener noreferrer" className="text-amber-500 font-semibold hover:text-amber-400 transition-colors flex items-center gap-1">
              by Elgun Ezmemmedov
            </a></span>
        </div>
      </div>
    </footer>
  );
}
