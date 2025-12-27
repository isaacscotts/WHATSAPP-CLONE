import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode:false,
  images:{
    remotePatterns:[
      {
        protocol:'https',
        hostname:"images.clerk.dev",
        port:'',
        pathname:'/**',
      },
      {
        protocol:'http',
        hostname:"localhost",
        port:'8000',
        pathname:'/**',
      }
    ]
  }
};

export default nextConfig;
