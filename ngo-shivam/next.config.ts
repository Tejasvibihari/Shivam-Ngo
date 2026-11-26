import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // do not advertise the framework in the X-Powered-By header
  poweredByHeader: false,
  images: {
    // AVIF/WebP are much smaller than JPEG/PNG, which improves load speed (a Google ranking signal)
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    agentFeedback: true,
  },
  // Admin pages and the admin API: never framed (clickjacking), never MIME-sniffed, never cached,
  // and the URL is not sent to other sites in the Referer header.
  async headers() {
    const adminHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [
      { source: "/admin/:path*", headers: adminHeaders },
      { source: "/api/admin/:path*", headers: adminHeaders },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
