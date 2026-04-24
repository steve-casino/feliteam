import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization with external domains support
  images: {
    domains: [
      // Add S3, Cloudinary, or other CDN domains here
      // Example: "cdn.example.com"
    ],
    // Enable automatic image optimization
    formats: ["image/webp"],
  },

  // Optimize for deployment
  output: "standalone",

  // Compress static assets
  compress: true,
  // NOTE: we do NOT map NEXT_PUBLIC_* vars in an `env:` block here —
  // Next.js auto-exposes any NEXT_PUBLIC_* env var to the client bundle.
  // An explicit mapping is redundant, and when the var is undefined at
  // config-evaluation time it hard-bakes `undefined` into the bundle and
  // overrides whatever `.env.local` supplies.
};

export default nextConfig;
