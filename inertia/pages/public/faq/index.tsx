import { useState } from "react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem { id: number; question: string; answer: string; }
interface Props { faqs: FaqItem[]; }

export default function FaqIndex({ faqs = [] }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);
  return (
    <>
      <SeoHead title="Perguntas Frequentes - Câmara Municipal de Sumé" description="Encontre respostas para as dúvidas mais comuns sobre a Câmara Municipal de Sumé." url="/perguntas-frequentes" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Perguntas Frequentes" }]} />
        <PageHero badge="Ajuda" title="Perguntas Frequentes" subtitle="Encontre respostas para as dúvidas mais comuns" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            {faqs.length > 0 ? (
              <div className="max-w-4xl mx-auto space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="card-modern overflow-hidden">
                    <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="w-full p-5 flex items-center justify-between gap-4 text-left">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-semibold text-foreground">{faq.question}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openId === faq.id && (
                      <div className="px-5 pb-5 pl-12">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <HelpCircle className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma pergunta cadastrada</h3>
                <p className="text-muted-foreground text-sm">Em breve novas perguntas e respostas</p>
              </div>
            )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
