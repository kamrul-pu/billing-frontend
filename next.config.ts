import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  allowedDevOrigins: ['http://localhost:3000', 'http://localhost:3001', '192.168.0.107', '*'],
}

export default nextConfig;
