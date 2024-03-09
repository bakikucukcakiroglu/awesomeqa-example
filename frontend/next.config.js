/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com'], // Replace 'example.com' with the domain where your images are hosted
  },
}

module.exports = nextConfig
