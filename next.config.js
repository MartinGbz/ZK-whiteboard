/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@sismo-core/sismo-connect-server"],
  },
};

module.exports = nextConfig;
