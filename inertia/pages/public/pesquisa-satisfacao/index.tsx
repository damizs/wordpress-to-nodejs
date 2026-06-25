import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
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
        <div className="min-h-screen bg-background overflow-x-clip">
          <TopBar /><Header /><Breadcrumb items={[{ label: "Pesquisa de Satisfação" }]} />
          <main id="conteudo" tabIndex={-1} className="py-20">
            <div className="container text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
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
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Pesquisa de Satisfação" }]} />
        <PageHero badge="Sua Opinião" title="Pesquisa de Satisfação" subtitle="Avaliação contínua dos serviços prestados pela Câmara Municipal" centered />
        <main id="conteudo" tabIndex={-1}>
          <section className="py-10 lg:py-14">
            <div className="container">
            <div>
              <form onSubmit={handleSubmit} data-reveal="up" className="card-modern p-6 md:p-8 space-y-6">
                <div>
                  <span id="rating-label" className="block font-semibold text-foreground mb-3">Como você avalia nossos serviços?</span>
                  <div
                    role="radiogroup"
                    aria-labelledby="rating-label"
                    aria-describedby={errors.rating ? "rating-error" : undefined}
                    className="flex gap-2"
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        setData('rating', Math.min(5, (data.rating || 0) + 1));
                      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        setData('rating', Math.max(1, (data.rating || 1) - 1));
                      }
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={data.rating === star}
                        aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                        tabIndex={data.rating === star || (data.rating === 0 && star === 1) ? 0 : -1}
                        onClick={() => setData('rating', star)}
                        className={`p-2 rounded-xl transition-colors ${data.rating >= star ? 'text-gold' : 'text-muted-foreground/30'}`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                  {errors.rating && <p id="rating-error" className="text-sm text-destructive mt-1">{errors.rating}</p>}
                </div>
                <div>
                  <label htmlFor="service_type" className="block font-semibold text-foreground mb-2">Tipo de serviço utilizado</label>
                  <select id="service_type" value={data.service_type} onChange={(e) => setData('service_type', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Selecione...</option>
                    <option value="atendimento">Atendimento Presencial</option>
                    <option value="portal">Portal da Transparência</option>
                    <option value="ouvidoria">Ouvidoria</option>
                    <option value="esic">E-Sic</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="comments" className="block font-semibold text-foreground mb-2">Comentários (opcional)</label>
                  <textarea id="comments" value={data.comments} onChange={(e) => setData('comments', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Deixe suas sugestões ou comentários..." />
                </div>
                <button type="submit" disabled={processing || data.rating === 0} className="w-full btn-modern bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send className="w-5 h-5" />Enviar Avaliação
                </button>
              </form>
            </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
