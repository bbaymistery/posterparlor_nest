import { createSlice } from "@reduxjs/toolkit";
import { AuthInitialState } from "@/types/api-response.type";
import { authApi } from "../api/auth.api";

/**
 * 🔑 AUTHENTICATION SLICE (Redux State)
 * 
 * Bu slice istifadəçinin lokal brauzer seansını (user profili, giriş statusu və token istinadını) 
 * Redux yaddaşında saxlayır və idarə edir.
 */

const initialState: AuthInitialState = {
  user: null,
  accessToken: null, // 💡 Əsas təhlükəsizlik cookie-lərdə saxlanılır, bu sadəcə referans üçündür
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * 🟢 İdentifikasiya Məlumatlarını Təyin Et (Manual Dispatch)
     */
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },

    /**
     * 🔴 Sessiyanı Tamamən Sıfırla (Logout zamanı və ya 401 Re-auth uğursuz olduqda)
     */
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
  /**
   * ⚡ EXTRA REDUCERS (RTK Query API Sorğularının Nəticələrinə Avtomatik Reaksiya)
   * `extraReducers` vasitəsilə `authApi`-də baş verən uğurlu/uğursuz sorğulara uyğun olaraq 
   * Redux auth state-ini avtomatik yeniləyirik.
   */
  extraReducers: (builder) => {

    // ✅ 1. Uğurlu Google Login olduqda istifadəçi məlumatlarını və statusu yenilə
    builder.addMatcher(authApi.endpoints.loginWithGoogle.matchFulfilled, (state, action) => {
      const userData = action.payload.data;
      state.user = userData.user;
      state.accessToken = userData.accessToken;
      state.isAuthenticated = true;
    }
    );

    // ✅ 2. Uğurlu Logout olduqda Redux auth state-ini sıfırla
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    });

    // ✅ 3. Access Token avtomatik refresh olunduqda token referansını yenilə
    builder.addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (state, action) => {
      state.accessToken = action.payload.data.accessToken;
    }
    );

    // ✅ 4. `/auth/google/me` istifadəçi məlumatlarını uğurla gətirdikdə state-i doldur
    builder.addMatcher(authApi.endpoints.getCurrentUser.matchFulfilled, (state, action) => {
      state.user = action.payload.data;
      state.isAuthenticated = true;
    }
    );

    // ✅ 5. Əgər `/auth/google/me` sorğusu rədd edilərsə (401/403) auth state-i təmizlə
    builder.addMatcher(authApi.endpoints.getCurrentUser.matchRejected, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    }
    );
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
