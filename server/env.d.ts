// env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      THESYS_API_KEY: string;
      THESYS_BASE_URL: string;
      OPENAI_API_KEY: string;
      OPENAI_BASE_URL: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
    }
  }
}
export {}; 