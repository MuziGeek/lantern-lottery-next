import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: [
        'yysls.easymuzi.cn',
        'pages-pro-8-9c1c.pages-scf-gz-pro.qcloudteo.com',
      ],
    },
  },
};

export default nextConfig;
