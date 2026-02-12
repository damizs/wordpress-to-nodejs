import { FileText, Download, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface DiarioOficialSectionProps {
  latestGazette?: any;
  title?: string | null;
  subtitle?: string | null;
}

export const DiarioOficialSection = ({ latestGazette, title, subtitle }: DiarioOficialSectionProps) => {
  const [mesAtual, setMesAtual] = useState(0); // Janeiro
  const [anoAtual, setAnoAtual] = useState(2026);

  const getDiasNoMes = (mes: number, ano: number) => {
    return new Date(ano, mes + 1, 0).getDate();
  };

  const getPrimeiroDiaSemana = (mes: number, ano: number) => {
    return new Date(ano, mes, 1).getDay();
  };

  const diasNoMes = getDiasNoMes(mesAtual, anoAtual);
  const primeiroDia = getPrimeiroDiaSemana(mesAtual, anoAtual);

  const handlePrevMes = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };

  const handleNextMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {title || 'Diário Oficial'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle || 'Fique sempre atualizado com as publicações e informações oficiais do município'}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Última Edição */}
          <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Quinta, 08 de Janeiro de 2026
                </span>
                <h3 className="font-bold text-foreground text-lg">
                  Diário Oficial do Município
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  Última Edição - 16/03/2023
                </p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted rounded-lg text-foreground font-medium hover:bg-muted/80 transition-colors">
              <Download className="w-5 h-5" />
              Clique para baixar
            </button>
          </div>

          {/* Calendário */}
          <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
            {/* Header do Calendário */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <button 
                onClick={handlePrevMes}
                className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-primary-foreground" />
              </button>
              <div className="text-center">
                <span className="text-primary-foreground font-bold text-lg">
                  {meses[mesAtual]}
                </span>
                <span className="block text-primary-foreground/80 text-sm">
                  {anoAtual}
                </span>
              </div>
              <button 
                onClick={handleNextMes}
                className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>

            {/* Grid do Calendário */}
            <div className="p-4">
              {/* Dias da Semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {diasSemana.map((dia) => (
                  <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Dias do Mês */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: primeiroDia }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: diasNoMes }).map((_, i) => (
                  <button
                    key={i + 1}
                    className="aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-primary/10 transition-colors text-foreground"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
