/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  statusCode: number;
  timestamp: string;
  path: string;
}
export interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
export interface ErrorResponse {
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
}
export interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}
export interface StackFrame {
  function: string;
  file: string;
  line?: number;
  column?: number;
}
