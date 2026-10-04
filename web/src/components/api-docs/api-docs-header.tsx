import { BookOpen, Server, KeyRound, CreditCard, UploadCloud } from "lucide-react";

export function ApiDocsHeader() {
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-4 mb-8 border-b border-border/40 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">NestJS API Documentation</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                v1.0 (NestJS + Stripe)
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Comprehensive Frontend Developer Guide for NestJS API endpoints, security guards, and request parameters.
            </p>
          </div>
        </div>

        {/* Base URL info */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/40 border border-border/50 text-xs text-muted-foreground">
          <Server className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>
            Backend Base URL: <code className="font-mono text-foreground font-bold bg-background px-2 py-0.5 rounded">http://localhost:3000</code>
          </span>
        </div>
      </div>

      {/* 💡 ARCHITECTURE GUIDE CAROUSEL FOR FRONTEND DEVELOPERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        
        {/* Guide 1: Auth & Silent Refresh */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-background to-secondary/40 border border-amber-500/20 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
            <KeyRound className="h-4 w-4" />
            1. Auth & Silent Refresh
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            NestJS sets 2 HttpOnly cookies (<code className="text-amber-400">access_token</code> & <code className="text-amber-400">refresh_token</code>). When Access Token expires (15 min), backend returns <code className="text-red-400">401</code>. RTK Query automatically calls <code className="text-emerald-400">POST /api/auth/google/refresh</code> silently and retries the original request!
          </p>
        </div>

        {/* Guide 2: Stripe Checkout Flow */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-background to-secondary/40 border border-blue-500/20 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <CreditCard className="h-4 w-4" />
            2. Stripe Checkout Flow
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Step 1: Get publishable key (<code className="text-blue-400">/payment/key</code>). Step 2: Initiate PaymentIntent (<code className="text-blue-400">/payment/initiate</code>) to receive <code className="text-emerald-400">clientSecret</code>. Step 3: Mount Stripe Elements card widget. Step 4: Verify payment (<code className="text-blue-400">/payment/verify</code>) to generate MongoDB Order.
          </p>
        </div>

        {/* Guide 3: Image Uploads */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-background to-secondary/40 border border-purple-500/20 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <UploadCloud className="h-4 w-4" />
            3. Multipart Image Uploads
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Posters and review photos use <code className="text-purple-400">multipart/form-data</code> with <code className="text-emerald-400">images</code> file field. NestJS interceptor uploads files directly to Cloudinary CDN and returns secure HTTPS image URLs.
          </p>
        </div>
      </div>
    </>
  );
}
