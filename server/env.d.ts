// env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      THESYS_API_KEY: string;
      THESYS_BASE_URL: string;
    }
  }
}
export {}; 