import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Media UI",
  description: "Headless Grid, Lightbox and Reel Swiper hooks for React and React Native.",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/headless" },
      { text: "Components", link: "/components/grid" },
      { text: "GitHub", link: "https://github.com/Chintamanishidli/media-sdk" },
    ],
    sidebar: [
      { text: "Guide", items: [
        { text: "Overview", link: "/" },
        { text: "The headless pattern", link: "/guide/headless" },
        { text: "Styling contract", link: "/guide/styling" },
        { text: "Accessibility", link: "/guide/accessibility" },
      ] },
      { text: "Components", items: [
        { text: "Grid", link: "/components/grid" },
        { text: "Lightbox", link: "/components/lightbox" },
        { text: "Reel Swiper", link: "/components/reel-swiper" },
      ] },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/Chintamanishidli/media-sdk" }],
    search: { provider: "local" },
  },
});
