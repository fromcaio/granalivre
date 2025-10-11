/** @type {import('next').NextConfig} */
const nextConfig = {
  // A configuração de 'images' permite especificar domínios externos
  // dos quais o componente next/image pode otimizar e carregar imagens.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;