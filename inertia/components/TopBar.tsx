import { Phone, Mail, Clock, Accessibility } from "lucide-react";

export const TopBar = () => {
  return (
    <div className="bg-primary text-primary-foreground text-xs py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Contact info */}
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:+558333531185" className="flex items-center gap-1.5 hover:text-gold transition-colors no-underline text-primary-foreground">
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">(83) 3353-1185</span>
            </a>
            <a href="mailto:camaradesume@gmail.com" className="flex items-center gap-1.5 hover:text-gold transition-colors no-underline text-primary-foreground">
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">camaradesume@gmail.com</span>
            </a>
            <span className="flex items-center gap-1.5 opacity-80">
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">Seg-Sex: 08h-14h</span>
            </span>
          </div>

          {/* Accessibility */}
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-1.5 hover:text-gold transition-colors"
              title="Acessibilidade"
              aria-label="Opções de acessibilidade"
            >
              <Accessibility className="w-3 h-3" />
              <span className="hidden sm:inline">Acessibilidade</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
