import { Link } from "@inertiajs/react";
import { Star, ArrowRight } from "lucide-react";

export const SatisfactionSurvey = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary to-navy-light">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-primary-foreground">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <Star className="w-7 h-7 text-gold" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Sua opinião é importante!</h3>
              <p className="text-primary-foreground/80 text-sm">Ajude-nos a melhorar nossos serviços</p>
            </div>
          </div>
          <Link
            href="/pesquisa-de-satisfacao"
            className="btn-modern inline-flex items-center gap-3 bg-gold text-navy-dark hover:bg-gold-light no-underline"
          >
            Responder Pesquisa
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
