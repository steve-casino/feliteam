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

  // Environment variable exposure
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
