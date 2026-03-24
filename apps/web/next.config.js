/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent pdf-parse from being bundled — it must run as a native Node module
      config.externals = [...(Array.isArray(config.externals) ? config.externals : []), 'pdf-parse']
    }
    return config
  },
}

module.exports = nextConfig
