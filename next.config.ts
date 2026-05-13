import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/gender-reveal",
  assetPrefix: "/gender-reveal/",
  images: { unoptimized: true }
};

export default nextConfig;
