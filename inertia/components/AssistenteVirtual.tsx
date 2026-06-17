import { useState, useRef, useEffect } from "react";
import { Headset, Send, UserRound, X } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  time: string;
  options?: QuickOption[];
}

interface QuickOption {
  label: string;
  action: string;
}

const quickOptions: QuickOption[] = [
  { label: "Prazos da LAI", action: "prazos_lai" },
  { label: "Recurso e-SIC", action: "recurso_esic" },
  { label: "Consultar protocolo", action: "consultar_protocolo" },
  { label: "Falar com atendente", action: "atendente" },
];

const responses: Record<string, { text: string; options?: QuickOption[] }> = {
  // Saudações
  greeting: {
    text: "Olá! 👋 Bem-vindo(a) à Câmara Municipal de Sumé! Como posso ajudar você hoje?",
    options: [
      { label: "Transparência", action: "transparencia" },
      { label: "Ouvidoria", action: "ouvidoria" },
      { label: "Vereadores", action: "vereadores" },
      { label: "Sessões/Atas", action: "sessoes" },
    ],
  },
  
  // Prazos LAI
  prazos_lai: {
    text: "📋 **Prazos da Lei de Acesso à Informação (LAI):**\n\n• Resposta inicial: **20 dias** (prorrogáveis por mais 10)\n• Recurso 1ª instância: **10 dias** após resposta\n• Recurso 2ª instância: **10 dias** após decisão\n\nA LAI não exige justificativa para solicitar informações públicas.",
    options: [
      { label: "Como fazer pedido", action: "fazer_pedido" },
      { label: "Recurso e-SIC", action: "recurso_esic" },
    ],
  },
  
  // Recurso e-SIC
  recurso_esic: {
    text: "📝 **Como interpor recurso no e-SIC:**\n\n1. Acesse o portal e-SIC\n2. Informe seu número de protocolo\n3. Clique em 'Interpor Recurso'\n4. Descreva os motivos do recurso\n5. Aguarde análise em até 5 dias úteis\n\nPrecisa de mais alguma ajuda?",
    options: [
      { label: "Acessar e-SIC", action: "link_esic" },
      { label: "Prazos da LAI", action: "prazos_lai" },
    ],
  },
  
  // Consultar protocolo
  consultar_protocolo: {
    text: "🔍 Para consultar seu protocolo:\n\n1. Acesse: **node.camaradesume.pb.gov.br/e-sic**\n2. Clique em 'Consultar Pedido'\n3. Digite seu número de protocolo\n4. Informe sua senha de acesso\n\nCaso não lembre a senha, clique em 'Esqueci minha senha'.",
    options: [
      { label: "Acessar e-SIC", action: "link_esic" },
      { label: "Fazer novo pedido", action: "fazer_pedido" },
    ],
  },
  
  // Transparência
  transparencia: {
    text: "🏛️ **Portal da Transparência:**\n\nNo portal você encontra:\n• Receitas e despesas\n• Contratos e licitações\n• Folha de pagamento\n• Diárias e passagens\n• Relatórios de gestão\n\nAcesse: **node.camaradesume.pb.gov.br/transparencia**",
    options: [
      { label: "Licitações", action: "licitacoes" },
      { label: "e-SIC", action: "link_esic" },
    ],
  },
  
  // Ouvidoria
  ouvidoria: {
    text: "📞 **Ouvidoria da Câmara:**\n\nCanais de atendimento:\n• Site: node.camaradesume.pb.gov.br/ouvidoria\n• E-mail: ouvidoria@camaradesume.pb.gov.br\n• Telefone: (83) 3353-1974\n• Presencial: Rua Luiz Grande, S/N, Centro\n\nHorário: Segunda a Sexta, 7h às 13h",
    options: [
      { label: "Fazer denúncia", action: "denuncia" },
      { label: "Fazer sugestão", action: "sugestao" },
    ],
  },
  
  // Vereadores
  vereadores: {
    text: "👥 **Vereadores da Legislatura 2025-2028:**\n\nA Câmara Municipal de Sumé possui 9 vereadores eleitos.\n\nPara conhecer cada parlamentar, suas comissões e contatos, acesse:\n**node.camaradesume.pb.gov.br/vereadores**",
    options: [
      { label: "Mesa Diretora", action: "mesa_diretora" },
      { label: "Comissões", action: "comissoes" },
    ],
  },
  
  // Sessões
  sessoes: {
    text: "📅 **Sessões da Câmara:**\n\n• **Ordinárias:** Terças-feiras, 9h\n• **Extraordinárias:** Conforme convocação\n\nAs sessões são abertas ao público. Atas e pautas disponíveis em:\n**node.camaradesume.pb.gov.br/atas**",
    options: [
      { label: "Ver pautas", action: "pautas" },
      { label: "Ver atas", action: "atas" },
    ],
  },
  
  // Licitações
  licitacoes: {
    text: "📄 **Licitações:**\n\nTodas as licitações da Câmara estão disponíveis com:\n• Editais completos\n• Resultados\n• Contratos firmados\n\nAcesse: **node.camaradesume.pb.gov.br/licitacoes**",
  },
  
  // Fazer pedido
  fazer_pedido: {
    text: "📝 **Como fazer um pedido de informação:**\n\n1. Acesse o e-SIC\n2. Clique em 'Novo Pedido'\n3. Preencha seus dados\n4. Descreva detalhadamente a informação desejada\n5. Guarde o número do protocolo\n\nVocê receberá resposta em até 20 dias.",
    options: [
      { label: "Acessar e-SIC", action: "link_esic" },
    ],
  },
  
  // Links
  link_esic: {
    text: "🔗 Acesse o e-SIC:\n**node.camaradesume.pb.gov.br/e-sic**\n\nPrecisa de mais alguma ajuda?",
  },
  
  // Mesa Diretora
  mesa_diretora: {
    text: "🏛️ **Mesa Diretora 2025-2026:**\n\nA composição da Mesa Diretora está disponível em:\n**node.camaradesume.pb.gov.br/mesa-diretora**",
  },
  
  // Comissões
  comissoes: {
    text: "👥 **Comissões Permanentes:**\n\nConheça as comissões e seus membros em:\n**node.camaradesume.pb.gov.br/comissoes**",
  },
  
  // Atendente
  atendente: {
    text: "👤 Para falar com um atendente humano:\n\n📞 Telefone: (83) 3353-1974\n📧 E-mail: contato@camaradesume.pb.gov.br\n🏢 Presencial: Rua Luiz Grande, S/N, Centro\n\n⏰ Horário: Segunda a Sexta, 7h às 13h",
  },
  
  // Denúncia
  denuncia: {
    text: "🚨 **Denúncias:**\n\nVocê pode registrar denúncias de forma anônima através da Ouvidoria.\n\nAcesse: **node.camaradesume.pb.gov.br/ouvidoria**\n\nSua identidade será preservada conforme a lei.",
  },
  
  // Sugestão
  sugestao: {
    text: "💡 **Sugestões:**\n\nSua opinião é importante! Envie sugestões para melhorar os serviços da Câmara através da Ouvidoria ou da Pesquisa de Satisfação.\n\nAcesse: **node.camaradesume.pb.gov.br/pesquisa-de-satisfacao**",
  },
  
  // Pautas
  pautas: {
    text: "📋 **Pautas das Sessões:**\n\nConfira as pautas das próximas sessões em:\n**node.camaradesume.pb.gov.br/pautas**",
  },
  
  // Atas
  atas: {
    text: "📜 **Atas das Sessões:**\n\nTodas as atas estão disponíveis para download em:\n**node.camaradesume.pb.gov.br/atas**",
  },
  
  // Fallback
  fallback: {
    text: "Desculpe, não entendi sua pergunta. 🤔\n\nPosso ajudar com:\n• Informações sobre transparência\n• e-SIC e pedidos de informação\n• Ouvidoria\n• Sessões e atas\n• Informações sobre vereadores\n\nEscolha uma opção abaixo ou digite sua dúvida de outra forma.",
    options: quickOptions,
  },
};

// Palavras-chave para detectar intenção
const intentKeywords: Record<string, string[]> = {
  greeting: ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "hey", "eai", "e ai", "oie", "oii", "opa", "fala", "salve"],
  prazos_lai: ["prazo", "prazos", "lai", "lei de acesso", "quanto tempo", "dias", "resposta"],
  recurso_esic: ["recurso", "recorrer", "apelar", "contestar"],
  consultar_protocolo: ["protocolo", "consultar", "consulta", "acompanhar", "status", "andamento"],
  transparencia: ["transparencia", "transparência", "portal", "gastos", "despesas", "receitas"],
  ouvidoria: ["ouvidoria", "reclamação", "reclamar", "elogio", "manifestação"],
  vereadores: ["vereador", "vereadores", "parlamentar", "parlamentares", "edil"],
  sessoes: ["sessão", "sessao", "sessões", "sessoes", "plenário", "plenaria"],
  licitacoes: ["licitação", "licitacao", "licitações", "licitacoes", "edital", "pregão", "pregao"],
  atendente: ["atendente", "humano", "pessoa", "falar com alguém", "telefone", "ligar"],
  link_esic: ["esic", "e-sic", "sic", "acesso informação", "acesso informacao"],
};

function detectIntent(text: string): string {
  const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalizedText.includes(normalizedKeyword)) {
        return intent;
      }
    }
  }
  
  return "fallback";
}

function formatTime(): string {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export const AssistenteVirtual = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensagem inicial
      setTimeout(() => {
        const response = responses.greeting;
        setMessages([
          {
            id: 1,
            text: response.text,
            isBot: true,
            time: formatTime(),
            options: response.options,
          },
        ]);
      }, 500);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      isBot: false,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Detecta intenção e responde
    setTimeout(() => {
      const intent = detectIntent(messageText);
      const response = responses[intent] || responses.fallback;
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.text,
        isBot: true,
        time: formatTime(),
        options: response.options,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleOptionClick = (action: string) => {
    const response = responses[action];
    if (response) {
      // Adiciona a opção como mensagem do usuário
      const option = quickOptions.find(o => o.action === action) || 
                     Object.values(responses).flatMap(r => r.options || []).find(o => o.action === action);
      
      if (option) {
        const userMessage: Message = {
          id: messages.length + 1,
          text: option.label,
          isBot: false,
          time: formatTime(),
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      setIsTyping(true);
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          text: response.text,
          isBot: true,
          time: formatTime(),
          options: response.options,
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-light text-navy-dark shadow-lg shadow-gold/20 ring-1 ring-white/30 hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 ${isOpen ? "hidden" : ""}`}
        aria-label="Abrir assistente virtual"
      >
        <Headset className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-card text-foreground rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold/20 via-card to-sky/10 border-b border-border p-4 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-gold/20 text-navy-dark flex items-center justify-center ring-1 ring-gold/30">
              <UserRound className="w-6 h-6" />
              <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-primary-foreground ring-2 ring-card">
                <Headset className="w-3 h-3" />
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Assistente Virtual</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Online 24h
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition-colors"
              aria-label="Fechar assistente virtual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] ${msg.isBot ? "" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.isBot
                        ? "bg-card text-foreground border border-border rounded-tl-none shadow-sm"
                        : "bg-navy text-primary-foreground rounded-tr-none shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${msg.isBot ? "" : "text-right"}`}>
                    {msg.time}
                  </p>
                  
                  {/* Quick Options */}
                  {msg.isBot && msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(option.action)}
                          className="px-3 py-1.5 bg-card hover:bg-muted text-foreground border border-border text-xs rounded-full transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Options (sempre visíveis) */}
          <div className="px-4 py-2 border-t border-border bg-card flex flex-wrap gap-2">
            {quickOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(option.action)}
                className="px-3 py-1.5 bg-muted hover:bg-muted/70 text-foreground text-xs rounded-full border border-border transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground rounded-full px-4 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-gold hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5 text-navy-dark" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
