/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <-- для статичного експорту замість next export
  typescript: {
    ignoreBuildErrors: true, // ігнорувати помилки TypeScript під час збірки
  },
  eslint: {
    ignoreDuringBuilds: true, // ігнорувати ESLint під час збірки
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
