/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.cartocdn.com',
      },
    ],
  },
  rewrites: async () => {
    // In local development with separate Python process, proxy to localhost:8000
    if (process.env.NODE_ENV === 'development' && process.env.LOCAL_PYTHON_DEV) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
