/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/agent/:path*',
        destination: 'http://localhost:8000/api/agent/:path*'
      }
    ]
  }
};

export default nextConfig;
