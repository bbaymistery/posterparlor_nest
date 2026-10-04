import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

/**
 * 🌐 BACKEND API BASE URL
 * `.env` faylından `NEXT_PUBLIC_API_URL` dəyərini alır (məsələn: `http://localhost:5000/api`)
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";


/**
 * 🛰️ STANDART BASE QUERY (fetchBaseQuery)
 * - `credentials: "include"` parametrinə görə brauzer istənilən sorğuda HttpOnly Cookie-ləri 
 *   (Access və Refresh Token-ləri) avtomatik olaraq backend-ə göndərir.
 */
export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // ✅ Cookie-lərin avtomatik göndərilməsi üçün vacibdir
  prepareHeaders: (headers) => {
    return headers;
  },
});

/**
 * 🔐 YADDAŞDA SAXLANILAN REFRESH VƏZİYYƏTİ (Race Condition-ların qarşısını almaq üçün)
 * - `refreshPromise`: Əgər eyni anda 5 sorğu 401 xətası alarsa, backend-ə 5 dəfə daxil olub 
 *   refresh istəməmək üçün tək bir `Promise` obyekti saxlayırıq.
 * - `refreshFailed`: Əgər refresh token-in vaxtı bitibsə və yeniləmə uğursuz olubsa, 
 *   təkrar-təkrar sorğu göndərməyi dayandırır.
 */
let refreshPromise: Promise<boolean> | null = null;
let refreshFailed = false;

/**
 * 🔄 REFRESH STATE-İNİ SIFIRLAMA FUNKSİYASI
 * Giriş (login) və ya çıxış (logout) edildikdə bu funksiya çağırılaraq 
 * refresh kəşini təmizləyir.
 */
export const resetRefreshState = () => {
  refreshPromise = null;
  refreshFailed = false;
};

/**
 * 🚀 BASE QUERY WITH REAUTH (Avtomatik Token Yeniləmə Mexanizmi)
 * 
 * Bu funksiya bütün RTK Query API zənglərinin təhlükəsizlik keşikçisidir:
 * 1. Əvvəlcə istifadəçinin əsl sorğusunu icra edir (`baseQuery`).
 * 2. Əgər Backend 401 (Unauthorized - Access Token bitib/keçərsizdir) xətası qaytararsa:
 *    - Əgər öncədən refresh uğursuz olubsa -> Redux-dan çıxış edir (`auth/clearAuth`).
 *    - Əgər artıq aktiv refresh gedirsə -> Yeni refresh başlatmır, mövcud `refreshPromise`-ı gözləyir.
 *    - Əgər ilk dəfədir 401 alınır -> `POST /api/auth/google/refresh` sorğusu göndərir.
 *    - Token uğurla yeniləndikdə -> Uğursuz olmuş ilk sorğunu TAM EYNİ parametrlərlə TƏKRAR İCRA EDİR (`retry`).
 * 3. Əgər Backend 403 (Forbidden - Giriş var, amma səlahiyyət çatmır) qaytararsa:
 *    - Çıxış etmir, sadəcə xətanı istifadəçiyə qaytarır.
 */
export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  = async (args, api, extraOptions) => {
    // 1. Əsas API sorğusunu icra edirik
    let result = await baseQuery(args, api, extraOptions);

    // 2. Əgər 401 Unauthorized xətası baş veribsə (Access Token vaxtı bitib)
    if (result.error?.status === 401) {

      // Əgər artıq refresh-in uğursuz olduğunu biliriksə, istifadəçini sistemdən çıxarırıq
      if (refreshFailed) {
        api.dispatch({ type: "auth/clearAuth" });
        return result;
      }

      // Eyni anda birdən çox refresh sorğusunun qarşısını alırıq (Locking mechanism)
      if (!refreshPromise) {
        refreshPromise = (async (): Promise<boolean> => {
          try {
            // 🔗 Backend: POST /api/auth/google/refresh
            const refreshResult = await baseQuery(
              { url: "/auth/google/refresh", method: "POST" },
              api,
              extraOptions
            );

            if (refreshResult.error || !refreshResult.data) {
              refreshFailed = true;
              api.dispatch({ type: "auth/clearAuth" });
              return false;
            }

            refreshFailed = false;
            return true;
          } catch (error) {
            refreshFailed = true;
            api.dispatch({ type: "auth/clearAuth" });
            return false;
          }
        })().finally(() => {
          // Qısa müddətdən sonra promise-i təmizləyirik ki, növbəti 401-lər üçün hazır olsun
          setTimeout(() => {
            refreshPromise = null;
          }, 100);
        });
      }

      try {
        // Refresh sorğusunun bitməsini gözləyirik
        const refreshSucceeded = await refreshPromise;
        if (refreshSucceeded) {
          // Token uğurla yeniləndi! İndi ilkin uğursuz olmuş sorğunu təkrar icra edirik
          result = await baseQuery(args, api, extraOptions);
        }
      } catch {
        return result;
      }
    }

    // 3. Əgər 403 Forbidden xətası baş veribsə (İstifadəçinin yetkisi çatmır)
    if (result.error?.status === 403) {
      // 403 o deməkdir ki, istifadəçi daxil olub, amma bu resursa icazəsi yoxdur. Çıxış etdirmirik!
      return result;
    }

    return result;
  };
