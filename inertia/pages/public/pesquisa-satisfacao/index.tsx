import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Star, Send, CheckCircle } from "lucide-react";

export default function PesquisaSatisfacaoIndex() {
  const [submitted, setSubmitted] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    rating: 0,
    service_type: '',
    comments: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/pesquisa-de-satisfacao', {
      onSuccess: () => setSubmitted(true),
    });
  };

  if (submitted) {
    return (
      <>
        <SeoHead title="Obrigado! - Pesquisa de Satisfação" url="/pesquisa-de-satisfacao" />
        <div className="min-h-screen bg-background">
          <TopBar /><Header /><Breadcrumb items={[{ label: "Pesquisa de Satisfação" }]} />
          <main className="py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Obrigado pela sua participação!</h1>
              <p className="text-muted-foreground">Sua opinião é muito importante para melhorarmos nossos serviços.</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead title="Pesquisa de Satisfação - Câmara Municipal de Sumé" description="Participe da nossa pesquisa de satisfação e ajude-nos a melhorar nossos serviços." url="/pesquisa-de-satisfacao" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Pesquisa de Satisfação" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Sua Opinião</span>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Pesquisa de Satisfação</h1>
                <p className="mt-2 text-muted-foreground">Ajude-nos a melhorar nossos serviços</p>
              </div>
              <form onSubmit={handleSubmit} className="card-modern p-6 md:p-8 space-y-6">
                <div>
                  <label className="block font-semibold text-foreground mb-3">Como você avalia nossos serviços?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setData('rating', star)} className={`p-2 rounded-xl transition-colors ${data.rating >= star ? 'text-gold' : 'text-muted-foreground/30'}`}>
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                  {errors.rating && <p className="text-sm text-red-500 mt-1">{errors.rating}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-2">Tipo de serviço utilizado</label>
                  <select value={data.service_type} onChange={(e) => setData('service_type', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Selecione...</option>
                    <option value="atendimento">Atendimento Presencial</option>
                    <option value="portal">Portal da Transparência</option>
                    <option value="ouvidoria">Ouvidoria</option>
                    <option value="esic">E-Sic</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-2">Comentários (opcional)</label>
                  <textarea value={data.comments} onChange={(e) => setData('comments', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Deixe suas sugestões ou comentários..." />
                </div>
                <button type="submit" disabled={processing || data.rating === 0} className="w-full btn-modern bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send className="w-5 h-5" />Enviar Avaliação
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
