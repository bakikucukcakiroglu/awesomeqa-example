/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com'], // Replace 'example.com' with the domain where your images are hosted
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true, // Set to false if you want to use 307 Temporary Redirect
      },
    ]
  },
}

module.exports = nextConfig
