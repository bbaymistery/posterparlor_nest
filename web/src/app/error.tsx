"use client";
import React from "react";
import { AlertCircle, Home, RefreshCcw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";

export default function ErrorPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-3 animate-pulse delay-1000"></div>
      </div>

      {/* <Card className="relative max-w-2xl w-full bg-white border-0 shadow-2xl overflow-hidden"> */}
      <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

      <div className="p-12 text-center">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-black rounded-full animate-ping opacity-20"></div>
          <div className="relative flex items-center justify-center w-24 h-24 bg-black rounded-full shadow-2xl">
            <AlertCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-7xl font-bold mb-4 text-black tracking-tight">
          404
        </h1>

        <p className="text-2xl font-semibold text-black mb-3">
          Page Not Found
        </p>

        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          The poster you are looking for seems to have vanished from our
          gallery. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            onClick={handleRefresh}
            className="bg-black hover:bg-gray-900 text-white px-8 py-6 text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-black"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>

          <Button
            onClick={handleHome}
            variant="outline"
            className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-6 text-lg transition-all duration-300"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Still having issues?</p>
          <a
            href="mailto:support@posterparlor.com"
            className="inline-flex items-center text-black hover:text-gray-700 font-medium transition-colors duration-200 underline underline-offset-4 decoration-2"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </div>
      </div>

      <div className="h-2 bg-black"></div>
      {/* </Card> */}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.05;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.08;
          }
        }
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}
