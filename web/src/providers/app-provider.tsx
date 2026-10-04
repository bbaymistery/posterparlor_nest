"use client";

import React from "react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { AuthInitializer } from "@/features/auth/components/auth-initializer";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "713469299798-6kacreihtfm7uaoujnv7havj1mbalftb.apps.googleusercontent.com";


export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthInitializer />
        {children}
      </GoogleOAuthProvider>
    </Provider>
  );
}
