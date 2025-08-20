import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage = "https://opendata.leopilot.com/og-image.jpg",
  noindex = false,
}: SEOHeadProps) {
  const siteUrl = "https://opendata.leopilot.com";
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {fullUrl && <meta property="og:url" content={fullUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      {fullUrl && <link rel="canonical" href={fullUrl} />}

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
}
