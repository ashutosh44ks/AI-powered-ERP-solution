/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;
  readonly VITE_DEBUG_MODE?: boolean; // Optional if not always present
  readonly VITE_ANALYTICS_ID?: string; // Optional if not always present
  // Add other VITE_ prefixed variables here
  readonly VITE_THESYS_BACKEND_URL: string;
  readonly VITE_DB_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
