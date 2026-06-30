import { Head, usePage } from "@inertiajs/react";

interface SeoHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

/** Identidade compartilhada por config/inertia.ts (config/camara). */
interface CamaraIdentity {
  nome: string;
  nomeCurto: string;
  cidade: string;
  uf: string;
  baseUrl: string;
  siteUrl: string;
}

export const SeoHead = ({
  title,
  description = "Câmara Municipal de Sumé - Portal oficial do Poder Legislativo de Sumé, Paraíba. Transparência, notícias, vereadores e serviços ao cidadão.",
  keywords = "câmara municipal, sumé, paraíba, vereadores, transparência, legislativo",
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
}: SeoHeadProps) => {
  // Identidade (nome/domínio) vem dos shared props do Inertia (config/camara),
  // com FALLBACK nos valores de Sumé → produção atual inalterada. A descrição/
  // keywords padrão (prosa com cidade/UF) seguem fixas por ora.
  const camara = (usePage().props as { camara?: CamaraIdentity }).camara;
  const ORG = camara?.nome || "Câmara Municipal de Sumé";
  const BASE = camara?.baseUrl || "https://node.camaradesume.pb.gov.br";

  // Defaults derivados do domínio base (resolvidos aqui porque dependem de `BASE`).
  const resolvedUrl = url ?? BASE;
  const resolvedImage = image ?? `${BASE}/og-image.jpg`;

  // Evita duplicar o nome do órgão: várias páginas já passam o sufixo
  // (" - Câmara Municipal de Sumé") no próprio title. Só anexamos se ainda
  // não estiver presente.
  const fullTitle = title.includes(ORG) ? title : `${title} | ${ORG}`;

  // og:image/twitter:image devem ser URLs absolutas. Se a página passou uma
  // imagem relativa, prefixamos o host base. (Sem acesso a window aqui — usamos
  // o host base derivado do default da prop `url`, seguro em SSR.)
  const absoluteImage = resolvedImage.startsWith("http")
    ? resolvedImage
    : `${BASE}${resolvedImage.startsWith("/") ? "" : "/"}${resolvedImage}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={ORG} />

      {/* Article (somente quando type === "article") */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
    </Head>
  );
};
