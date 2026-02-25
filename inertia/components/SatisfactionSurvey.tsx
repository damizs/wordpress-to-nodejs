import { MessageSquareHeart, ExternalLink } from "lucide-react";

export const SatisfactionSurvey = () => {
  return (
    <section className="py-12 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="bg-card rounded-2xl border border-border shadow-md p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                Pesquisa de Satisfação
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Sua opinião é muito importante para nós! Participe da nossa pesquisa de satisfação 
                e ajude-nos a melhorar os serviços prestados à população.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Participar da Pesquisa
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
