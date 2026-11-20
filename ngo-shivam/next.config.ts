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
