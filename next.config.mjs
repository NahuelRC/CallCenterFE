/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
   experimental: {
    // agrega aquí todos los orígenes desde donde abrís el FE en DEV
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://192.168.1.4:3000', // tu IP LAN/puerto del dev server
      'https://call-center-fe-six.vercel.app/',
      'https://callcenter-z98c.onrender.com',
    ],
  },
}

export default nextConfig
