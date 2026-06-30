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
  description,
  keywords,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
}: SeoHeadProps) => {
  // Identidade (nome/domínio/cidade/UF) vem dos shared props do Inertia
  // (config/camara). A descrição/keywords padrão são MONTADAS a partir dessa
  // identidade (sem literal de tenant chumbado).
  const camara = (usePage().props as { camara?: CamaraIdentity }).camara;
  const ORG = camara?.nome || "Câmara Municipal";
  const BASE = camara?.baseUrl || "";
  const cidade = camara?.cidade || "";
  const uf = camara?.uf || "";
  const local = [cidade, uf].filter(Boolean).join(" - ");

  const resolvedDescription =
    description ??
    `Portal oficial da ${ORG}${local ? `, ${local}` : ""}. Transparência, notícias, vereadores e serviços ao cidadão.`;
  const resolvedKeywords =
    keywords ??
    ["câmara municipal", cidade, uf, "vereadores", "transparência", "legislativo"]
      .filter(Boolean)
      .join(", ")
      .toLowerCase();

  // Defaults derivados do domínio base (resolvidos aqui porque dependem de `BASE`).
  const resolvedUrl = url ?? BASE;
  const resolvedImage = image ?? `${BASE}/og-image.jpg`;

  // Evita duplicar o nome do órgão: várias páginas já passam o sufixo com o
  // nome da câmara (ex.: " - {camara.nome}") no próprio title. Só anexamos se
  // ainda não estiver presente.
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
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={resolvedKeywords} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
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
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={absoluteImage} />
    </Head>
  );
};
