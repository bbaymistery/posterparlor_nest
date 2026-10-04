import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

// Slices (Lokal Redux State-ləri)
import authReducer from "./slices/auth.slice";
import cartReducer from "./slices/cart.slice";

// API Slices (RTK Query Server Sorğuları)
import { authApi } from "./api/auth.api";
import { inventoryApi } from "./api/inventory.api";
import { orderApi } from "./api/order.api";
import { adminApi } from "./api/admin.api";
import { reviewApi } from "./api/review.api";

/**
 * 🏬 REDUX STORE KONFİQURASİYASI
 * 
 * Bu fayl Next.js tətbiqinin bütün mərkəzi state (vəziyyət) idarəetmə sistemini birləşdirir:
 * 1. Reducer-lər: Həm lokal Redux slice-ları (auth, cart), həm də RTK Query API reducer-ləri.
 * 2. Middleware-lər: RTK Query-nin avtomatik kəşləmə (caching), invalidasiya, refetch və polling mexanizmləri.
 */
export const store = configureStore({
  reducer: {
    // 1. Lokal Redux Slice-lar
    auth: authReducer,
    cart: cartReducer,

    // 2. RTK Query API Slice Reducer-ləri (Server State)
    [authApi.reducerPath]: authApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Non-serializable məlumatlar (məsələn, File obyektləri) üçün xətanı söndürür
    })
      .concat(authApi.middleware)
      .concat(inventoryApi.middleware)
      .concat(orderApi.middleware)
      .concat(adminApi.middleware)
      .concat(reviewApi.middleware),
});

/**
 * ⚡ LISTENERS SETUP
 * Brauzer pəncərəsi yenidən fokuslandıqda (`refetchOnFocus`) və ya internet bərpa olunduqda 
 * (`refetchOnReconnect`) sorğuların avtomatik yenilənməsini aktivləşdirir.
 */
setupListeners(store.dispatch);

// 📐 TYPE DEFINITIONS (TypeScript tipləri)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * 🎯 TİPLƏNDİRİLMİŞ REDUX HOOK-LARI
 * Tətbiq daxilində standart `useDispatch` və `useSelector` əvəzinə bu tipləndirilmiş 
 * hook-lar istifadə edilir ki, autocompletion və TypeScript təhlükəsizliyi təmin olunsun.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
