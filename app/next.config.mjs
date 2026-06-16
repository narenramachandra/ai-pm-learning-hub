/** @type {import('next').NextConfig} */
const nextConfig = {
  // The /api/chat fallback reads these Markdown files from disk at runtime.
  // Next.js can't trace dynamic fs reads, so force them into the serverless
  // function bundle — otherwise the fallback returns nothing in production.
  outputFileTracingIncludes: {
    "/api/chat": ["./data/lenny/**/*.md"],
  },
};

export default nextConfig;
