import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth, resetRefreshState } from "./base.query";

/**
 * 🔐 AUTH API SLICE (RTK Query)
 * 
 * Bu slice istifadəçinin Google OAuth 2.0 vasitəsilə daxil olmasını, tokenlərin 
 * yenilənməsini (JWT refresh) və sessiyadan çıxış (logout) əməliyyatlarını idarə edir.
 */
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({

    // -------------------------------------------------------------
    // 🔗 Backend: POST /api/auth/google/login (GoogleAuthController -> googleAuth)
    // Google idToken göndərərək cookie (access & refresh token) alır
    // -------------------------------------------------------------
    loginWithGoogle: builder.mutation({
      query: (idToken) => ({ url: "/auth/google/login", method: "POST", body: { idToken } }),
      invalidatesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // ✅ Uğurlu giriş zamanı re-auth loqikasını sıfırla
          resetRefreshState();
        } catch {
          // Login uğursuz olarsa
        }
      },
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: POST /api/auth/google/refresh (GoogleAuthController -> refreshToken)
    // HttpOnly refresh token cookie istifadə edərək yeni Access Token alır
    // -------------------------------------------------------------
    refreshToken: builder.mutation({
      query: () => ({ url: "/auth/google/refresh", method: "POST" }),
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: POST /api/auth/google/logout (GoogleAuthController -> logout)
    // Cookie-ləri təmizləyir və Redux auth state-ini sıfırlayır
    // -------------------------------------------------------------
    logout: builder.mutation({
      query: () => ({ url: "/auth/google/logout", method: "POST" }),
      invalidatesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({ type: "auth/clearAuth" });
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          resetRefreshState();
        }
      },
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/auth/google/me (GoogleAuthController -> getCurrentUser)
    // Cari daxil olmuş istifadəçi profil məlumatlarını (email, name, role) gətirir
    // -------------------------------------------------------------
    getCurrentUser: builder.query({
      query: () => "/auth/google/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginWithGoogleMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} = authApi;
