import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb"
    },
    // Enable instrumentation.ts for Application Insights init
    instrumentationHook: true
  },
  // Expose non-secret runtime config to server components
  env: {
    APP_VERSION: process.env.APP_VERSION ?? "dev"
  },
  // Standalone output for Docker / Azure App Service container deployments
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined
};

export default nextConfig;

