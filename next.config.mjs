/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "export", // 👈 replaces `next export`
  images: {
    unoptimized: true, // GitHub Pages doesn’t support Next.js Image Optimization
  },
  trailingSlash: true, // 👈 helps avoid 404s on GitHub Pages
};

export default nextConfig


