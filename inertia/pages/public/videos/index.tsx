import { Film, Instagram } from "lucide-react";
import { PageLayout } from "~/components/PageLayout";
import { ReelsGallery, type ReelItem } from "~/components/ReelsGallery";

interface Props {
  reels?: ReelItem[];
  instagramUrl?: string | null;
}

export default function VideosIndex({ reels = [], instagramUrl = null }: Props) {
  const profileUrl = instagramUrl || "https://www.instagram.com/camaradesume";

  return (
    <PageLayout
      seo={{
        title: "Galeria de Vídeos",
        description:
          "Assista aos reels e vídeos publicados pela Câmara Municipal de Sumé no Instagram.",
      }}
      breadcrumb={[{ label: "Início", href: "/" }, { label: "Galeria de Vídeos" }]}
      hero={{
        badge: "Vídeos",
        title: "Galeria de Vídeos",
        subtitle: "Reels e vídeos publicados no Instagram da Câmara Municipal.",
        centered: true,
      }}
    >
      {reels.length > 0 ? (
        <ReelsGallery reels={reels} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 px-6 text-center">
          <Film className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            Nenhum vídeo disponível no momento.
          </p>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary no-underline hover:underline"
          >
            <Instagram className="h-4 w-4" /> Acompanhe no Instagram
          </a>
        </div>
      )}
    </PageLayout>
  );
}
