import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer/footer";
import { Toaster } from "sonner";
import { AppProvider } from "@/providers/app-provider";

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArtisanFrame | Premium Fine Art & Poster Store",
  description: "Full-Stack NestJS & Next.js Premium Art & Poster Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${robotoMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <AppProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" />
        </AppProvider>
      </body>
    </html>
  );
}

