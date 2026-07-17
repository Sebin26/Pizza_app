import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "10.136.223.132",
    "192.168.1.17",
    "192.168.1.23"
  ],
};

export default nextConfig;
