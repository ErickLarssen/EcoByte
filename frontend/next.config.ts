import type { NextConfig } from "next";
import { buildApiRewrites, resolveApiInternalUrl } from "./src/lib/api-proxy";
import { staticSecurityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Cabeçalhos de segurança fixos (DEC-091); a CSP com nonce vem do proxy.ts.
  async headers() {
    return [{ source: "/:path*", headers: staticSecurityHeaders(process.env.NODE_ENV === "production") }];
  },

  async rewrites() {
    return buildApiRewrites(resolveApiInternalUrl(process.env));
  },
};

export default nextConfig;
