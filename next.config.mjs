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

  // 🔁 Proxy FE -> BE para evitar CORS (usa rutas relativas en el FE)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://callcenter-z98c.onrender.com/api/:path*',
      },
    ];
  },

  experimental: {
    // 👇 Orígenes permitidos en DEV (Next 15+). Sin barra final.
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://192.168.1.4:3000',
      'https://call-center-fe-six.vercel.app',
      'https://callcenter-z98c.onrender.com',
    ],
  },
};

export default nextConfig;
