/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/agent/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://127.0.0.1:8000/api/agent/:path*'
          : '/_/backend/api/agent/:path*'
      }
    ]
  }
};

export default nextConfig;
