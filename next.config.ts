import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  transpilePackages: [
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/extension-text-align',
    '@tiptap/extension-typography',
    '@tiptap/extension-link',
    '@tiptap/extension-image',
    '@tiptap/extension-blockquote',
    '@tiptap/extension-bold',
    '@tiptap/extension-heading',
    '@tiptap/extension-horizontal-rule',
    '@tiptap/extension-italic',
    '@tiptap/extension-paragraph',
    '@tiptap/extension-text',
    '@tiptap/pm',
  ],
  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },
}

export default withNextIntl(nextConfig);
