import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Media SDK",
  description: "A headless media SDK: framework-agnostic core with thin React and React Native wrappers.",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/quick-start" },
      { text: "API", link: "/api/core" },
      { text: "GitHub", link: "https://github.com/Chintamanishidli/media-sdk" },
    ],
    sidebar: [
      { text: "Guide", items: [
        { text: "Overview", link: "/" },
        { text: "Quick start", link: "/guide/quick-start" },
        { text: "Architecture", link: "/guide/architecture" },
      ] },
      { text: "API", items: [
        { text: "media-core", link: "/api/core" },
        { text: "Providers", link: "/api/providers" },
        { text: "Events", link: "/api/events" },
        { text: "Errors", link: "/api/errors" },
        { text: "media-react", link: "/api/react" },
        { text: "media-native", link: "/api/native" },
      ] },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/Chintamanishidli/media-sdk" }],
    search: { provider: "local" },
  },
});
