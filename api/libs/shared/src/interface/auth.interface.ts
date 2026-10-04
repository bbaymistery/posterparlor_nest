import { UserRole } from '@new-poster-parlor-api/models';
export interface AuthResponse {
  accessToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

/**
 * JWT Token Payload structure
 */
export interface JwtTokenPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number; // Issued at
  exp?: number; // Expiration time
  [key: string]: unknown; // Allow additional claims
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}
export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
