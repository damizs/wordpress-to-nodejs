import { MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "@inertiajs/react";

export const SatisfactionSurvey = () => {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Icon and Text */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Pesquisa de Satisfação</h3>
              <p className="text-muted-foreground">
                Sua opinião é muito importante para nós! Participe da nossa pesquisa de satisfação e ajude-nos a melhorar os serviços prestados à população.
              </p>
            </div>
          </div>

          {/* Button */}
          <Link
            href="/pesquisa-de-satisfacao"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Participar da Pesquisa
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
