import { Link } from "@inertiajs/react";
import { Film, ArrowRight } from "lucide-react";
import { SectionHeading } from "~/components/SectionHeading";
import { ReelsGallery, type ReelItem } from "~/components/ReelsGallery";

interface Props {
  reels?: ReelItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
  /** Máximo exibido na home (o restante fica em /videos). */
  limit?: number;
}

export function ReelsSection({
  reels = [],
  title = "Galeria de Vídeos",
  subtitle = "Acompanhe os reels e vídeos publicados no Instagram da Câmara.",
  badge = "Vídeos",
  limit = 8,
}: Props) {
  if (!reels || reels.length === 0) return null;
  const shown = reels.slice(0, limit);
  const hasMore = reels.length > limit;

  return (
    <section className="py-14 lg:py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <SectionHeading badge={badge} title={title} subtitle={subtitle} />

        <div data-reveal>
          <ReelsGallery reels={shown} />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-colors hover:bg-navy-dark"
          >
            <Film className="h-4 w-4" />
            {hasMore ? "Ver todos os vídeos" : "Abrir galeria de vídeos"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
