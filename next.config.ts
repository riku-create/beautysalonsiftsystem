/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // React 18での安定した設定
    reactCompiler: false,
  },
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    }
    
    return config
  },
  // React 18でのstrict mode
  reactStrictMode: true,
}

export default nextConfig
