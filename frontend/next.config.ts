import type { NextConfig } from "next";
import { buildApiRewrites, resolveApiInternalUrl } from "./src/lib/api-proxy";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async rewrites() {
    return buildApiRewrites(resolveApiInternalUrl(process.env));
  },
};

export default nextConfig;
