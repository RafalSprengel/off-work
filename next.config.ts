import type { NextConfig } from "next";
import os from "node:os";

function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const net of networkInterface) {
        if (net.family === "IPv4" && !net.internal) {
          addresses.push(net.address);
          addresses.push(`${net.address}:3000`);
        }
      }
    }
  }

  return addresses;
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Odblokowuje żądania HMR dla automatycznie wykrytych lokalnych IP
  },
  allowedDevOrigins: getLocalIpAddresses(),
};

export default nextConfig;