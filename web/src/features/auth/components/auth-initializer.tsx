"use client";

import { useGetCurrentUserQuery } from "@/store/api/auth.api";

/**
 * 🔄 AUTH INITIALIZER COMPONENT
 * 
 * Runs silently on application startup. Calls `GET /api/auth/google/me`.
 * If an HttpOnly `access_token` cookie exists, NestJS returns user details and
 * `auth.slice.ts` automatically updates Redux `auth.isAuthenticated` state.
 */
export function AuthInitializer() {
  useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  return null;
}

