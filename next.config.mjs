/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdf-parse (lewat pdfjs-dist) gagal dievaluasi kalau di-bundle webpack lewat RSC —
  // "TypeError: Object.defineProperty called on non-object". Next 14 masih pakai key
  // experimental ini (serverExternalPackages baru stabil/non-experimental di Next 15+,
  // dan project ini sengaja tidak upgrade — lihat docs/17_TECH_DEBT.md).
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "@napi-rs/canvas"]
  }
};

export default nextConfig;
