import { useState, useRef, useEffect, useCallback } from "react";
import { Headset, Send, UserRound, X } from "lucide-react";
import { RichText } from "~/lib/rich_text";
import { useFocusTrap } from "~/hooks/useFocusTrap";

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

// Chips de sugestão (perguntas frequentes) para guiar o usuário.
const quickOptions: QuickOption[] = [
  { label: "Pedir informação (e-SIC)", action: "fazer_pedido" },
  { label: "Prazos da LAI", action: "prazos_lai" },
  { label: "Transparência", action: "transparencia" },
  { label: "Ouvidoria", action: "ouvidoria" },
  { label: "Falar com atendente", action: "atendente" },
];

const responses: Record<string, { text: string; options?: QuickOption[] }> = {
  // Saudações
  greeting: {
    text: "Olá! 👋 Bem-vindo(a) à Câmara Municipal de Sumé. Como posso ajudar você hoje?\n\nEscolha um dos assuntos abaixo ou descreva a sua dúvida.",
    options: [
      { label: "Transparência", action: "transparencia" },
      { label: "Acesso à Informação (e-SIC)", action: "link_esic" },
      { label: "Ouvidoria", action: "ouvidoria" },
      { label: "Vereadores", action: "vereadores" },
    ],
  },

  // Prazos LAI
  prazos_lai: {
    text: "📋 **Prazos da Lei de Acesso à Informação (LAI):**\n\n- Resposta ao pedido: **até 20 dias**, prorrogáveis por mais **10 dias** mediante justificativa\n- Recurso (1ª instância): **10 dias** após a resposta\n- Recurso (2ª instância): **10 dias** após a decisão do recurso\n\nA LAI **não exige justificativa** para solicitar informações públicas. Faça o seu pedido pelo [e-SIC](/esic).",
    options: [
      { label: "Como pedir informação", action: "fazer_pedido" },
      { label: "Interpor recurso", action: "recurso_esic" },
    ],
  },

  // Recurso e-SIC
  recurso_esic: {
    text: "📝 **Como interpor recurso no e-SIC:**\n\n- Acesse o sistema pelo [e-SIC](/esic) e localize o seu pedido pelo número de protocolo\n- Abra a opção de **recurso** e descreva os motivos\n- Acompanhe a resposta pelo próprio sistema, dentro dos prazos da LAI\n\nO recurso pode ser apresentado em até **10 dias** após receber a resposta.",
    options: [
      { label: "Acessar o e-SIC", action: "link_esic" },
      { label: "Prazos da LAI", action: "prazos_lai" },
    ],
  },

  // Consultar protocolo
  consultar_protocolo: {
    text: "🔍 **Consultar o andamento de um pedido:**\n\n- Acesse o [e-SIC](/esic)\n- Use a opção de **consulta** e informe o seu número de protocolo\n- Caso não lembre os dados de acesso, utilize a recuperação disponível no próprio sistema\n\nEm caso de dúvida, fale com o SIC pelo telefone **(83) 3353-1191**.",
    options: [
      { label: "Acessar o e-SIC", action: "link_esic" },
      { label: "Fazer novo pedido", action: "fazer_pedido" },
    ],
  },

  // Transparência
  transparencia: {
    text: "🏛️ **Portal da Transparência:**\n\nNo portal você encontra receitas e despesas, contratos e licitações, folha de pagamento, diárias e relatórios de gestão.\n\nAcesse o [Portal da Transparência](/transparencia).",
    options: [
      { label: "Licitações", action: "licitacoes" },
      { label: "Acesso à Informação (e-SIC)", action: "link_esic" },
    ],
  },

  // Ouvidoria
  ouvidoria: {
    text: "📞 **Ouvidoria da Câmara:**\n\nCanais de atendimento:\n\n- Site: [Ouvidoria](/ouvidoria)\n- E-mail: ouvidoria@camaradesume.pb.gov.br\n- Telefone: (83) 3353-1185\n- Presencial: Rua Luiz Grande, s/n - Centro, Sumé - PB\n\nHorário: segunda a sexta, das 8h às 14h. O prazo de resposta é de até **20 dias**, prorrogáveis por mais **10**.",
    options: [
      { label: "Fazer denúncia", action: "denuncia" },
      { label: "Fazer sugestão", action: "sugestao" },
    ],
  },

  // Vereadores
  vereadores: {
    text: "👥 **Vereadores:**\n\nConheça os parlamentares da legislatura atual, suas comissões e contatos na página de [Vereadores](/vereadores).",
    options: [
      { label: "Mesa Diretora", action: "mesa_diretora" },
      { label: "Comissões", action: "comissoes" },
    ],
  },

  // Sessões
  sessoes: {
    text: "📅 **Sessões da Câmara:**\n\nAs sessões são abertas ao público. Você pode consultar as pautas das próximas sessões e as atas das sessões já realizadas.\n\n- [Pautas das sessões](/pautas)\n- [Atas das sessões](/atas)",
    options: [
      { label: "Ver pautas", action: "pautas" },
      { label: "Ver atas", action: "atas" },
    ],
  },

  // Licitações
  licitacoes: {
    text: "📄 **Licitações e contratos:**\n\nConsulte os editais, resultados e contratos firmados pela Câmara:\n\n- [Licitações](/licitacoes)\n- [Contratos](/contratos)\n\nMais informações financeiras no [Portal da Transparência](/transparencia).",
  },

  // Fazer pedido
  fazer_pedido: {
    text: "📝 **Como fazer um pedido de informação (LAI):**\n\n- Acesse o [e-SIC](/esic) e abra um **novo pedido**\n- Preencha os seus dados e descreva com clareza a informação desejada\n- Guarde o **número de protocolo** para acompanhar a resposta\n\nVocê receberá a resposta em até **20 dias**. Não é preciso justificar o pedido.",
    options: [
      { label: "Acessar o e-SIC", action: "link_esic" },
      { label: "Prazos da LAI", action: "prazos_lai" },
    ],
  },

  // Acesso ao e-SIC
  link_esic: {
    text: "🔗 **Acesso à Informação (e-SIC):**\n\nUse a página de [Acesso à Informação / e-SIC](/esic) para fazer pedidos, consultar protocolos e interpor recursos.\n\nDúvidas? SIC: (83) 3353-1191 · contato@camaradesume.pb.gov.br",
    options: [
      { label: "Como pedir informação", action: "fazer_pedido" },
      { label: "Prazos da LAI", action: "prazos_lai" },
    ],
  },

  // Mesa Diretora
  mesa_diretora: {
    text: "🏛️ **Mesa Diretora:**\n\nConsulte a composição atual da Mesa Diretora na página da [Mesa Diretora](/mesa-diretora).",
  },

  // Comissões
  comissoes: {
    text: "👥 **Comissões:**\n\nConheça as comissões e os seus membros na página de [Comissões](/comissoes).",
  },

  // Diário Oficial
  diario: {
    text: "📰 **Diário Oficial:**\n\nAtos, publicações e edições oficiais da Câmara estão disponíveis no [Diário Oficial](/diario-oficial).",
  },

  // Perguntas frequentes
  faq: {
    text: "❓ **Perguntas Frequentes:**\n\nReunimos as dúvidas mais comuns sobre os serviços da Câmara na página de [Perguntas Frequentes](/perguntas-frequentes).",
    options: quickOptions,
  },

  // Atendente
  atendente: {
    text: "👤 **Falar com um atendente:**\n\n- Telefone: (83) 3353-1185 (Ouvidoria) · (83) 3353-1191 (e-SIC)\n- E-mail: contato@camaradesume.pb.gov.br\n- Presencial: Rua Luiz Grande, s/n - Centro, Sumé - PB\n\nHorário: segunda a sexta, das 8h às 14h.",
  },

  // Denúncia
  denuncia: {
    text: "🚨 **Denúncias:**\n\nVocê pode registrar denúncias pela [Ouvidoria](/ouvidoria). A sua identidade é preservada conforme a legislação.",
  },

  // Sugestão
  sugestao: {
    text: "💡 **Sugestões:**\n\nSua opinião é importante! Envie sugestões pela [Ouvidoria](/ouvidoria) ou participe da [Pesquisa de Satisfação](/pesquisa-de-satisfacao).",
  },

  // Pautas
  pautas: {
    text: "📋 **Pautas das sessões:**\n\nConfira as pautas das próximas sessões em [Pautas](/pautas).",
  },

  // Atas
  atas: {
    text: "📜 **Atas das sessões:**\n\nTodas as atas estão disponíveis em [Atas](/atas).",
  },

  // Resposta de baixa confiança (não "chutar" resposta canned)
  low_confidence: {
    text: "Não tenho certeza sobre isso. 🤔\n\nVocê pode tentar **reformular a pergunta** ou acessar diretamente:\n\n- [Acesso à Informação / e-SIC](/esic)\n- [Portal da Transparência](/transparencia)\n- [Perguntas Frequentes](/perguntas-frequentes)\n- [Ouvidoria](/ouvidoria)\n\nTambém posso ajudar com os assuntos abaixo:",
    options: quickOptions,
  },
};

/**
 * Palavras-chave ponderadas por intenção.
 * - Termos específicos (ex.: "esic", "vereador", "licitacao") têm peso maior.
 * - Termos genéricos (ex.: "portal", "pedido") têm peso baixo e, sozinhos, não
 *   disparam uma resposta (evita casar texto irrelevante).
 * - Termos com espaço são tratados como expressão (correspondência por trecho);
 *   termos de uma palavra exigem correspondência de palavra inteira (token).
 */
interface WeightedKeyword {
  term: string;
  weight: number;
}

const intentKeywords: Record<string, WeightedKeyword[]> = {
  greeting: [
    { term: "oi", weight: 2 },
    { term: "ola", weight: 2 },
    { term: "opa", weight: 2 },
    { term: "salve", weight: 2 },
    { term: "bom dia", weight: 2 },
    { term: "boa tarde", weight: 2 },
    { term: "boa noite", weight: 2 },
  ],
  prazos_lai: [
    { term: "lai", weight: 3 },
    { term: "lei de acesso", weight: 3 },
    { term: "quanto tempo", weight: 2 },
    { term: "prazo", weight: 2 },
    { term: "prazos", weight: 2 },
    { term: "prorrogacao", weight: 2 },
    { term: "dias", weight: 1 },
    { term: "resposta", weight: 1 },
  ],
  fazer_pedido: [
    { term: "fazer pedido", weight: 3 },
    { term: "novo pedido", weight: 3 },
    { term: "solicitar informacao", weight: 3 },
    { term: "pedir informacao", weight: 3 },
    { term: "pedido de informacao", weight: 3 },
    { term: "como pedir", weight: 2 },
    { term: "solicitar", weight: 1 },
  ],
  recurso_esic: [
    { term: "interpor recurso", weight: 3 },
    { term: "recurso", weight: 2 },
    { term: "recorrer", weight: 2 },
    { term: "apelar", weight: 1 },
    { term: "contestar", weight: 1 },
  ],
  consultar_protocolo: [
    { term: "consultar protocolo", weight: 3 },
    { term: "protocolo", weight: 3 },
    { term: "acompanhar pedido", weight: 2 },
    { term: "andamento", weight: 1 },
    { term: "status", weight: 1 },
  ],
  transparencia: [
    { term: "portal da transparencia", weight: 3 },
    { term: "transparencia", weight: 3 },
    { term: "despesas", weight: 2 },
    { term: "receitas", weight: 2 },
    { term: "gastos", weight: 2 },
    { term: "folha de pagamento", weight: 2 },
    { term: "salarios", weight: 2 },
    { term: "diarias", weight: 2 },
    { term: "portal", weight: 1 },
  ],
  ouvidoria: [
    { term: "ouvidoria", weight: 3 },
    { term: "reclamacao", weight: 2 },
    { term: "reclamar", weight: 2 },
    { term: "manifestacao", weight: 2 },
    { term: "elogio", weight: 2 },
  ],
  denuncia: [
    { term: "denuncia", weight: 3 },
    { term: "denunciar", weight: 3 },
  ],
  sugestao: [
    { term: "sugestao", weight: 3 },
    { term: "sugestoes", weight: 3 },
    { term: "sugerir", weight: 2 },
  ],
  vereadores: [
    { term: "vereador", weight: 3 },
    { term: "vereadores", weight: 3 },
    { term: "parlamentar", weight: 2 },
    { term: "parlamentares", weight: 2 },
    { term: "edil", weight: 2 },
  ],
  mesa_diretora: [
    { term: "mesa diretora", weight: 3 },
    { term: "presidente da camara", weight: 2 },
  ],
  comissoes: [
    { term: "comissao", weight: 3 },
    { term: "comissoes", weight: 3 },
  ],
  sessoes: [
    { term: "sessao", weight: 3 },
    { term: "sessoes", weight: 3 },
    { term: "plenario", weight: 2 },
    { term: "ordinaria", weight: 2 },
    { term: "extraordinaria", weight: 2 },
  ],
  pautas: [
    { term: "pauta", weight: 3 },
    { term: "pautas", weight: 3 },
  ],
  atas: [
    { term: "ata", weight: 3 },
    { term: "atas", weight: 3 },
  ],
  licitacoes: [
    { term: "licitacao", weight: 3 },
    { term: "licitacoes", weight: 3 },
    { term: "edital", weight: 2 },
    { term: "editais", weight: 2 },
    { term: "pregao", weight: 2 },
    { term: "contrato", weight: 2 },
    { term: "contratos", weight: 2 },
  ],
  diario: [
    { term: "diario oficial", weight: 3 },
    { term: "diario", weight: 2 },
    { term: "publicacao oficial", weight: 2 },
    { term: "publicacoes oficiais", weight: 2 },
  ],
  faq: [
    { term: "perguntas frequentes", weight: 3 },
    { term: "duvidas frequentes", weight: 3 },
    { term: "faq", weight: 3 },
  ],
  atendente: [
    { term: "falar com alguem", weight: 3 },
    { term: "falar com atendente", weight: 3 },
    { term: "atendente", weight: 3 },
    { term: "humano", weight: 2 },
    { term: "telefone", weight: 2 },
    { term: "ligar", weight: 2 },
    { term: "contato", weight: 1 },
    { term: "pessoa", weight: 1 },
  ],
  link_esic: [
    { term: "esic", weight: 3 },
    { term: "acesso a informacao", weight: 3 },
    { term: "acesso informacao", weight: 2 },
    { term: "sic", weight: 2 },
  ],
};

// Pontuação mínima para considerar uma intenção confiável.
const MIN_SCORE = 2;

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function tokenize(text: string): string[] {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function scoreIntents(text: string): Record<string, number> {
  const normalizedFull = normalize(text);
  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);
  const scores: Record<string, number> = {};

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    let score = 0;
    for (const { term, weight } of keywords) {
      const normalizedTerm = normalize(term);
      const matched = normalizedTerm.includes(" ")
        ? normalizedFull.includes(normalizedTerm)
        : tokenSet.has(normalizedTerm);
      if (matched) score += weight;
    }
    if (score > 0) scores[intent] = score;
  }

  return scores;
}

/**
 * Detecta a intenção por pontuação. Só retorna uma intenção concreta quando a
 * confiança é suficiente (score >= MIN_SCORE); caso contrário devolve
 * "low_confidence" para um fallback honesto, em vez de "chutar" uma resposta.
 */
function detectIntent(text: string): { intent: string; confident: boolean } {
  const scores = scoreIntents(text);

  const greetingScore = scores.greeting ?? 0;
  delete scores.greeting;

  let bestIntent: string | null = null;
  let bestScore = 0;
  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (bestIntent && bestScore >= MIN_SCORE) {
    return { intent: bestIntent, confident: true };
  }

  // Saudação só vence quando nada mais foi reconhecido com confiança.
  if (greetingScore >= MIN_SCORE) {
    return { intent: "greeting", confident: true };
  }

  return { intent: "low_confidence", confident: false };
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
  const idRef = useRef(0);
  const nextId = useCallback(() => ++idRef.current, []);
  const closeAssistant = useCallback(() => setIsOpen(false), []);
  const dialogRef = useFocusTrap(isOpen, closeAssistant);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensagem inicial
      setTimeout(() => {
        const response = responses.greeting;
        setMessages([
          {
            id: nextId(),
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
      id: nextId(),
      text: messageText,
      isBot: false,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Detecta intenção e responde (com fallback honesto quando incerto)
    setTimeout(() => {
      const { intent } = detectIntent(messageText);
      const response = responses[intent] || responses.low_confidence;

      const botMessage: Message = {
        id: nextId(),
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
          id: nextId(),
          text: option.label,
          isBot: false,
          time: formatTime(),
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      setIsTyping(true);
      setTimeout(() => {
        const botMessage: Message = {
          id: nextId(),
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
        className={`fixed right-[var(--mobile-dock-right)] bottom-[var(--mobile-dock-bottom)] z-50 flex h-[var(--mobile-dock-size)] w-[var(--mobile-dock-size)] items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light text-navy-dark shadow-lg shadow-gold/20 ring-1 ring-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl sm:right-6 sm:bottom-6 sm:h-14 sm:w-14 ${isOpen ? "hidden" : ""}`}
        aria-label="Abrir assistente virtual"
      >
        <Headset className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-title"
          className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 flex h-[min(78dvh,520px)] flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl animate-fade-in sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[500px] sm:max-h-[calc(100vh-120px)] sm:w-[380px] sm:max-w-[calc(100vw-48px)]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gold/20 via-card to-sky/10 border-b border-border p-4 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-gold/20 text-navy-dark flex items-center justify-center ring-1 ring-gold/30">
              <UserRound className="w-6 h-6" />
              <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-primary-foreground ring-2 ring-card">
                <Headset className="w-3 h-3" />
              </span>
            </div>
            <div className="flex-1">
              <h3 id="assistant-title" className="font-bold text-foreground">Assistente Virtual</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Online 24h
              </p>
            </div>
            <button
              type="button"
              onClick={closeAssistant}
              className="w-8 h-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Fechar assistente virtual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
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
                    {msg.isBot ? (
                      <RichText
                        text={msg.text}
                        className="[&_p]:my-0.5 [&_p]:leading-snug [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    )}
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
                <div
                  className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm"
                  role="status"
                  aria-label="Assistente está digitando"
                >
                  <div className="flex gap-1" aria-hidden="true">
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
                type="button"
                onClick={() => handleOptionClick(option.action)}
                className="px-3 py-1.5 bg-muted hover:bg-muted/70 text-foreground text-xs rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua dúvida..."
                aria-label="Digite sua dúvida"
                className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground rounded-full px-4 py-2 text-sm border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-gold hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5 text-navy-dark" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
