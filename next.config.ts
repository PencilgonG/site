/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "images.discordapp.net" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  reactStrictMode: true,

  // (facultatif) éviter que les warnings bloquent en dev/preview
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
