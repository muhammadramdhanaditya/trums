// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,
  modules: [
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@nuxtjs/i18n",
    "@nuxtjs/device",
  ],

  tailwindcss: {
    cssPath: ["~/assets/css/input.css", { injectPosition: "first" }],
    configPath: "tailwind.config",
    exposeConfig: {
      level: 2,
    },
    config: {},
    viewer: true,
  },
  headlessui: {
    prefix: "Headless",
  },
  i18n: {
    locales: [
      { code: "en", iso: "en-US", file: "en.json", name: "English" },
      { code: "id", iso: "id-ID", file: "id.json", name: "Bahasa Indonesia" },
    ],
    strategy: "prefix_and_default",
    lazy: true,
    langDir: "locales/",
    defaultLocale: "en",
    skipSettingLocaleOnNavigate: true,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "language",
      redirectOn: "root",
      alwaysRedirect: true,
    },
    customRoutes: "config",
    pages: {
      login: {
        en: "/login",
        id: "/masuk",
      },
      feature: {
        en: "/feature",
        id: "/fitur",
      },
      about: {
        en: "/about",
        id: "/tentang",
      },
    },
  },
});
