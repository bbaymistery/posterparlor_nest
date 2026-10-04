export interface AppConfig {
  nodeEnv: 'development' | 'production';
  port: number;
  allowedOrigin: string[];
}
export interface DBConfig {
  dbname: string;
  dburl: string;
  poolsize: number;
}

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  jwtAccessTokenSecret: string;
  jwtAccessTokenExpiry: number;
  jwtRefreshTokenSecret: string;
  jwtRefreshTokenExpiry: number;
}

export interface CloudinaryConfig {
  cloudinaryName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

export interface PaymentConfig {
  razorpayKeyId: string;
  razorpayKeySecret: string;
}
