import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Migration de dados: popula a página de Perguntas Frequentes com conteúdo
 * padrão de qualidade para câmara municipal.
 *
 * Idempotente:
 * - As perguntas só são inseridas se a tabela `faq_items` estiver VAZIA
 *   (não sobrescreve nada cadastrado pela equipe no /painel/faq).
 * - As categorias de FAQ em `system_categories` são criadas apenas se
 *   ainda não existir nenhuma categoria do tipo 'faq'.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const now = new Date()

      // 1) Garante as categorias de FAQ (mesmos slugs do seeder 03_system_categories)
      const catCount = await db
        .from('system_categories')
        .where('type', 'faq')
        .count('* as total')
      if (Number(catCount[0]?.total ?? catCount[0]?.$extras?.total ?? 0) === 0) {
        await db.table('system_categories').insert(
          [
            { name: 'LAI', slug: 'lai', display_order: 1 },
            { name: 'Transparência', slug: 'transparencia', display_order: 2 },
            { name: 'Sessões', slug: 'sessoes', display_order: 3 },
            { name: 'Participação', slug: 'participacao', display_order: 4 },
            { name: 'Sobre a Câmara', slug: 'sobre-a-camara', display_order: 5 },
          ].map((c) => ({
            type: 'faq',
            name: c.name,
            slug: c.slug,
            display_order: c.display_order,
            is_active: true,
            created_at: now,
            updated_at: now,
          }))
        )
      }

      // 2) Perguntas padrão — apenas se a tabela estiver vazia
      const faqCount = await db.from('faq_items').count('* as total')
      if (Number(faqCount[0]?.total ?? faqCount[0]?.$extras?.total ?? 0) > 0) return

      const items: { question: string; answer: string; category: string }[] = [
        // ── Sessões ────────────────────────────────────────────────────────
        {
          category: 'sessoes',
          question: 'Como posso assistir às sessões da Câmara?',
          answer:
            'As sessões plenárias da Câmara Municipal de Sumé são públicas e abertas a qualquer cidadão. Você pode acompanhá-las presencialmente, no plenário da Casa (Rua Antônio Vieira Lima, S/N, Centro), nos dias e horários definidos no calendário de sessões ordinárias.\n\nAs pautas são publicadas com antecedência na seção "Pautas" do portal, e as atas com tudo o que foi deliberado ficam disponíveis na seção "Atas". Quando houver transmissão ao vivo, o link é divulgado na página inicial e nas redes sociais oficiais da Câmara.',
        },
        {
          category: 'sessoes',
          question: 'Como funciona a tramitação de um projeto de lei?',
          answer:
            'Em resumo, um projeto de lei segue estas etapas:\n\n1. Apresentação: o projeto é protocolado por um vereador, pela Mesa Diretora, pelo Prefeito ou por iniciativa popular;\n2. Comissões: o texto é analisado pelas comissões permanentes, que emitem pareceres sobre legalidade e mérito;\n3. Discussão e votação: o projeto entra na pauta do plenário, é discutido e votado pelos vereadores (em um ou dois turnos, conforme o caso);\n4. Sanção ou veto: se aprovado, segue para o Prefeito, que pode sancionar ou vetar; vetos retornam à Câmara para deliberação;\n5. Publicação: a lei sancionada é publicada e passa a vigorar.\n\nVocê pode acompanhar cada matéria e sua situação na seção "Atividades Legislativas" do portal.',
        },
        {
          category: 'sessoes',
          question: 'Onde consulto como cada vereador votou?',
          answer:
            'As votações nominais — aquelas em que o voto de cada vereador é registrado individualmente — estão disponíveis na seção "Votações" do portal. Lá você encontra a matéria votada, a data da sessão e o voto de cada parlamentar, garantindo transparência sobre a atuação de cada representante.',
        },

        // ── LAI / Acesso à informação ──────────────────────────────────────
        {
          category: 'lai',
          question: 'O que é o e-SIC e como faço um pedido de informação?',
          answer:
            'O e-SIC (Serviço de Informação ao Cidadão eletrônico) é o canal previsto na Lei de Acesso à Informação (Lei nº 12.527/2011) para que qualquer pessoa, sem precisar justificar o motivo, solicite informações públicas à Câmara.\n\nPara fazer um pedido, utilize o formulário disponível na Ouvidoria do portal ou compareça presencialmente à sede da Câmara. Informe seus dados de contato e descreva a informação desejada. A resposta deve ser fornecida em até 20 dias, prorrogáveis por mais 10 mediante justificativa. Caso a resposta seja negada ou insatisfatória, você pode apresentar recurso.',
        },
        {
          category: 'lai',
          question: 'Como acesso as leis, decretos e matérias legislativas do município?',
          answer:
            'Toda a produção legislativa está disponível gratuitamente no portal:\n\n• Atividades Legislativas: projetos de lei, requerimentos, indicações e demais matérias, com texto e situação de tramitação;\n• Publicações Oficiais: leis, decretos legislativos e resoluções já publicados;\n• Diário Oficial: edições oficiais com os atos da Câmara;\n• Atas e Pautas: o que foi discutido e deliberado em cada sessão.\n\nUse a busca de cada seção para localizar uma matéria por número, ano ou palavra-chave.',
        },
        {
          category: 'lai',
          question: 'Como meus dados pessoais são tratados pelo portal (LGPD)?',
          answer:
            'A Câmara trata os dados pessoais informados nos formulários do portal (Ouvidoria, e-SIC e pesquisa de satisfação) exclusivamente para responder às solicitações e melhorar os serviços públicos, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Os dados não são vendidos nem compartilhados para fins comerciais.\n\nVocê pode solicitar acesso, correção ou eliminação dos seus dados a qualquer momento. Leia a Política de Privacidade completa na página "Política de Privacidade", no rodapé do portal.',
        },

        // ── Transparência ──────────────────────────────────────────────────
        {
          category: 'transparencia',
          question: 'Onde encontro as licitações, contratos e compras da Câmara?',
          answer:
            'Todos os processos licitatórios da Câmara — editais, avisos, resultados, dispensas e inexigibilidades — estão publicados na seção "Licitações" do portal, com os respectivos documentos para download.\n\nInformações sobre contratos, despesas, receitas e folha de pagamento estão disponíveis no Portal da Transparência, acessível pelo menu principal. A publicação desses dados é uma exigência da Lei de Acesso à Informação e da Lei de Responsabilidade Fiscal.',
        },
        {
          category: 'transparencia',
          question: 'O que é o Portal da Transparência e o que é o PNTP?',
          answer:
            'O Portal da Transparência reúne, em um só lugar, as informações sobre a gestão da Câmara: despesas, receitas, folha de pagamento, diárias, licitações, contratos, relatórios fiscais e estrutura administrativa. O acesso é livre e não exige cadastro.\n\nO PNTP (Programa Nacional de Transparência Pública) é uma avaliação nacional, conduzida pelos Tribunais de Contas e pela Atricon, que mede a qualidade da transparência dos órgãos públicos. A Câmara de Sumé organiza seu portal seguindo os critérios do PNTP, buscando os melhores níveis de classificação.',
        },
        {
          category: 'transparencia',
          question: 'O que são dados abertos e como posso utilizá-los?',
          answer:
            'Dados abertos são informações públicas disponibilizadas em formatos que podem ser lidos por máquinas (como CSV e JSON), permitindo que qualquer pessoa — pesquisadores, jornalistas, desenvolvedores — analise e reutilize as informações livremente.\n\nNo Portal da Transparência você encontra opções de exportação das principais bases (despesas, receitas, licitações). Caso precise de algum conjunto de dados específico que não esteja disponível, solicite-o pelo e-SIC: o fornecimento em formato aberto é um direito garantido pela Lei de Acesso à Informação.',
        },

        // ── Participação ───────────────────────────────────────────────────
        {
          category: 'participacao',
          question: 'Como funciona a Ouvidoria e que tipo de manifestação posso registrar?',
          answer:
            'A Ouvidoria é o canal direto de comunicação entre o cidadão e a Câmara. Por ela você pode registrar:\n\n• Reclamações sobre serviços da Câmara;\n• Denúncias de irregularidades;\n• Sugestões de melhoria;\n• Elogios ao trabalho realizado;\n• Solicitações e pedidos de informação.\n\nAcesse a página "Ouvidoria" no portal, preencha o formulário e acompanhe o andamento pelo protocolo gerado. As manifestações são tratadas com sigilo e, nos casos previstos em lei, podem ser anônimas.',
        },
        {
          category: 'participacao',
          question: 'Como posso falar com os vereadores?',
          answer:
            'Na seção "Vereadores" do portal você encontra o perfil de cada parlamentar, com partido, contatos disponíveis e a produção legislativa (projetos, requerimentos e indicações de sua autoria).\n\nVocê também pode ser atendido pessoalmente nos gabinetes, na sede da Câmara, durante o horário de funcionamento, ou enviar sua demanda pela Ouvidoria, indicando o vereador a quem deseja se dirigir. As sessões plenárias são outro espaço importante de contato direto com os parlamentares.',
        },
        {
          category: 'participacao',
          question: 'O que é a pesquisa de satisfação e por que devo participar?',
          answer:
            'A pesquisa de satisfação é um instrumento de avaliação dos serviços da Câmara pelo cidadão, prevista nas boas práticas de transparência e participação social. As respostas são utilizadas para identificar pontos de melhoria no atendimento, no portal e nos serviços prestados.\n\nA participação é rápida, voluntária e pode ser feita na página "Pesquisa de Satisfação" do portal. Os resultados consolidados são públicos e podem ser consultados no relatório disponível na própria página.',
        },

        // ── Sobre a Câmara ─────────────────────────────────────────────────
        {
          category: 'sobre-a-camara',
          question: 'Qual o horário e o local de atendimento da Câmara?',
          answer:
            'A Câmara Municipal de Sumé atende ao público de segunda a sexta-feira, das 8h às 14h, na sede localizada na Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB.\n\nVocê também pode entrar em contato pelo telefone (83) 3353-1175 ou pelo e-mail contato@camaradesume.pb.gov.br. Demandas formais podem ser registradas a qualquer momento pela Ouvidoria do portal.',
        },
      ]

      let order = 0
      await db.table('faq_items').insert(
        items.map((i) => ({
          question: i.question,
          answer: i.answer,
          category: i.category,
          display_order: ++order,
          is_active: true,
          created_at: now,
          updated_at: now,
        }))
      )
    })
  }

  async down() {
    // Migration de dados: não remove conteúdo no rollback para não apagar
    // perguntas que possam ter sido editadas pela equipe no painel.
  }
}
