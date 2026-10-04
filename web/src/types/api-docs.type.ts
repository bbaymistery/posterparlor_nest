export type ApiModule = "Auth" | "Inventory" | "Order" | "Review" | "Admin";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type AuthType = "Public" | "User" | "Admin";

export interface ApiEndpoint {
  id: string;
  module: ApiModule;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  whyNeeded: string; // Explains WHY this endpoint exists for frontend developers!
  authType: AuthType;
  queryParams?: Record<string, string>;
  requestBody?: Record<string, any>;
  responseExample?: Record<string, any>;
}
