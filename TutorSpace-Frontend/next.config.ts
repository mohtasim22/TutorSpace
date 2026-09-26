import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Strip console.* from production builds (keeps console.error), but leave
  // them intact during local development.
  compiler: {
    removeConsole: { exclude: ["error"] },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_BASE}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;