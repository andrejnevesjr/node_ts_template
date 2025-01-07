declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT_SERVER: string;
      MONGODB_URI: string;
      JWT_SECRET_KEY: string;
      BASE_URL: string;
    }
  }
}

export {};
