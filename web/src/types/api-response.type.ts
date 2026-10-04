/* eslint-disable @typescript-eslint/no-explicit-any */

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthInitialState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface ErrorResponse {
  data: {
    success: false;
    message: string;
    error: {
      code: string;
      details?: any;
      validationErrors?: ValidationError[];
    };
    statusCode: number;
    timestamp: string;
    path: string;
  };
  status: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
