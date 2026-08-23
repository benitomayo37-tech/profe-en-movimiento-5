import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.33"],

  outputFileTracingIncludes: {
    "/api/miniapps/[slug]": ["./private/miniapps/*.html"],
  },
};

export default nextConfig;