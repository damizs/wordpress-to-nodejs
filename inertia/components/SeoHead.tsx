import { Head } from "@inertiajs/react";

interface SeoHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SeoHead = ({
  title,
  description = "Câmara Municipal de Sumé - Portal oficial do Poder Legislativo de Sumé, Paraíba. Transparência, notícias, vereadores e serviços ao cidadão.",
  keywords = "câmara municipal, sumé, paraíba, vereadores, transparência, legislativo",
  image = "/images/og-image.jpg",
  url = "https://node.camaradesume.pb.gov.br",
  type = "website",
}: SeoHeadProps) => {
  const fullTitle = `${title} | Câmara Municipal de Sumé`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Câmara Municipal de Sumé" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
};
