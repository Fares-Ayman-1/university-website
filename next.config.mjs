/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deployed on Vercel. Every route uses generateStaticParams, so all pages are prerendered.
  trailingSlash: true,
};

export default nextConfig;
