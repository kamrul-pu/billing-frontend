import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow common local network IPs and patterns
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '0.0.0.0:3000',

    // Match any device on common local subnets
    '192.168.0.*:3000',
    '192.168.1.*:3000',
    '192.168.68.*:3000',
    '192.168.100.*:3000',

    // For 10.x.x.x networks (common in corporate/advanced setups)
    '10.*.*.*:3000',

    // If you use custom domains via /etc/hosts
    'local-origin.dev',
    '*.local-origin.dev',
  ],
};

export default nextConfig;