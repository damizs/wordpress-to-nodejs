import { Award, Shield, CheckCircle } from "lucide-react";

export const TransparencySealSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-primary/5 via-gold/5 to-sky/5">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Selo */}
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-glow">
                <Award className="w-12 h-12 text-navy-dark" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-background">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">Selo de Transparência</h3>
              <p className="text-sm text-muted-foreground">Compromisso com a gestão pública</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-border" />

          {/* Info */}
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Lei de Acesso à Informação</p>
              <p className="text-sm text-muted-foreground">Lei nº 12.527/2011</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
