import { MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "@inertiajs/react";

export const SatisfactionSurvey = () => {
  return (
    <section className="section-block bg-muted/40">
      <div className="container">
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-5 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6" data-reveal="zoom">
          {/* Icon and Text */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">Pesquisa de Satisfação</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sua opinião é muito importante para nós! Participe da nossa pesquisa de satisfação e ajude-nos a melhorar os serviços prestados à população.
              </p>
            </div>
          </div>

          {/* Button */}
          <Link
            href="/pesquisa-de-satisfacao"
            className="flex items-center justify-center gap-2 w-full md:w-auto shrink-0 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Participar da Pesquisa
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
