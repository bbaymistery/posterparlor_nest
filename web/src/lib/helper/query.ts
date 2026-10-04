/**
 * Query string building utilities for API endpoints
 * Centralizes the repetitive URLSearchParams pattern used across API files
 */

type ParamValue = string | number | boolean | undefined | null;

/**
 * Build a query string from an object of parameters
 * Filters out undefined, null, and empty string values
 *
 * @example
 * buildQueryString({ page: 1, limit: 10, search: '' })
 * Returns: "?page=1&limit=10"
 *
 * @example
 * buildQueryString({ page: 1 }, '/api/orders')
 * Returns: "/api/orders?page=1"
 */
export function buildQueryString(params: Record<string, ParamValue>, baseUrl: string = ""): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  if (!queryString) return baseUrl;


  return baseUrl ? `${baseUrl}?${queryString}` : `?${queryString}`;
}

/**
 * Build URL with query parameters for RTK Query endpoints
 *
 * @example
 * buildApiUrl('/admin/orders', { page: 1, status: 'PENDING' })
 * Returns: "/admin/orders?page=1&status=PENDING"
 */
export function buildApiUrl(endpoint: string, params?: Record<string, ParamValue>): string {
  if (!params) return endpoint;
  return buildQueryString(params, endpoint);
}
