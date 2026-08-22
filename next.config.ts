import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/miniapps/[slug]": ["./private/miniapps/*.html"],
  },
};

export default nextConfig;
