import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

export const SEO = ({ title, description, canonical }: SEOProps) => {
  const metaTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const metaDescription = description
    ? description.slice(0, 160)
    : "Agent Validation Hub – 智能体测试与评估平台";

  return (
    <Helmet>
      <title>{metaTitle}</title>
      {metaDescription && (
        <meta name="description" content={metaDescription} />
      )}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={metaTitle} />
      {metaDescription && (
        <meta property="og:description" content={metaDescription} />
      )}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};
