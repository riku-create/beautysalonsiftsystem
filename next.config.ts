/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel用の最適化設定
  experimental: {
    reactCompiler: false,
  },
  
  // 出力設定を明示
  output: 'standalone',
  
  // 静的ファイルの最適化
  images: {
    unoptimized: true
  },
  
  // Webpack設定
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    }
    
    return config
  },
  
  // React設定
  reactStrictMode: true,
  
  // ビルド時の最適化
  compress: true,
  
  // 環境変数の設定
  env: {
    VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  }
}

export default nextConfig
