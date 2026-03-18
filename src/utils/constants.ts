// Environment variable wrapper - never access import.meta.env directly in components
export const ENV = {
  API_BASE_URL:
    (import.meta.env.VITE_API_BASE_URL as string) ||
    "https://subway-viral.vercel.app",
  APP_NAME: (import.meta.env.VITE_APP_NAME as string) || "ShopManager Pro",
  APP_VERSION: (import.meta.env.VITE_APP_VERSION as string) || "1.0.0",
} as const;
