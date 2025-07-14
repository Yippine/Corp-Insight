import { NextResponse } from 'next/server';
import { BASE_URL } from '@/config/site';

export async function GET() {
  const baseUrl = BASE_URL;
  const siteHostname = new URL(baseUrl).hostname;

  const robotsContent = `
# ===============================================================
# robots.txt for ${siteHostname}
# Last Updated: 2024-07-16
#
# This file provides guidance to web crawlers.
# It is a set of suggestions, not a security mechanism.
# ===============================================================

User-agent: *

# [Core Rule] Disallow crawling of build artifacts and API routes.
# These folders contain files that are not meaningful for search results
# and should not be indexed. Blocking them saves crawl budget.
Disallow: /_next/
Disallow: /api/

# [Admin Rule] Disallow crawling of administration panels.
Disallow: /admin/

# ===============================================================
# SITEMAP DECLARATION
#
# This is the single most important directive for crawlers to
# discover all the important pages on the site.
#
# We point to the sitemap index file, which contains links to all
# other sitemaps.
# ===============================================================
Sitemap: ${baseUrl}/sitemap-index.xml
`.trim();

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=43200', // 12 小時快取
    },
  });
}