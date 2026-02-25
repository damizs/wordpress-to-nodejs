import { Link } from "@inertiajs/react";
import { MessageSquare, Send, Search, Shield, Clock, MapPin, Phone, Mail } from "lucide-react";

interface ESicSettings {
  title?: string | null;
  subtitle?: string | null;
  address?: string | null;
  hours?: string | null;
  phone?: string | null;
  email?: string | null;
  newUrl?: string | null;
  consultUrl?: string | null;
}

interface ESicSectionProps {
  settings?: ESicSettings;
}

export const ESicSection = ({ settings = {} }: ESicSectionProps) => {
  const {
    title = 'e-SIC - Serviço de Informação ao Cidadão',
    subtitle = 'Solicite informações públicas de forma rápida e segura. O e-SIC é o canal oficial para pedidos de acesso à informação da Câmara Municipal de Sumé.',
    address = 'Rua Francisco Antonio de Barros, 110 - Centro, Sumé - PB, 58540-000',
    hours = 'Segunda a Sexta, das 08h às 14h',
    phone = '(83) 3353-1185',
    email = 'camaradesume@gmail.com',
    newUrl = '#',
    consultUrl = '#'
  } = settings;

  return (
    <section className="py-16 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
              Acesso à Informação
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {title}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={newUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modern inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl no-underline"
              >
                <Send className="w-5 h-5" />
                Nova Solicitação
              </a>
              <a
                href={consultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modern inline-flex items-center justify-center gap-3 bg-card border-2 border-primary text-primary hover:bg-primary/5 no-underline"
              >
                <Search className="w-5 h-5" />
                Consultar Pedido
              </a>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-4 animate-fade-in">
            {/* Contact Info Card */}
            <div className="card-modern p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Atendimento Presencial
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{hours}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{email}</span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-sky/10 rounded-2xl p-6 border border-sky/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Lei de Acesso à Informação</h4>
                  <p className="text-sm text-muted-foreground">
                    A LAI (Lei nº 12.527/2011) regulamenta o direito constitucional de acesso às informações públicas.
                    Qualquer pessoa pode solicitar informações sem necessidade de justificativa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
