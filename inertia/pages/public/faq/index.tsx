import { useState } from "react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
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
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Ajuda</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Perguntas Frequentes</h1>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Encontre respostas para as dúvidas mais comuns</p>
            </div>
            {faqs.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-4">
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
                        <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhuma pergunta cadastrada.</p></div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
