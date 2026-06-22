import { BaseSchema } from '@adonisjs/lucid/schema'

const CATEGORY_SLUG = 'carta-servicos'
const NOW_REFERENCE_DATE = '2026-06-19'

const CONTENT = `
<h2>Carta de Serviços ao Usuário</h2>
<p>A Carta de Serviços reúne os principais canais de atendimento da Câmara Municipal de Sumé e orienta o cidadão sobre como acessar informações, acompanhar atividades legislativas e solicitar serviços públicos.</p>

<h3>Serviço de Informação ao Cidadão (e-SIC)</h3>
<p>Canal para registrar pedidos de acesso à informação com base na Lei nº 12.527/2011. O cidadão pode abrir uma solicitação, acompanhar o protocolo e receber resposta dentro dos prazos legais.</p>
<ul>
  <li><strong>Como acessar:</strong> pelo menu E-SIC ou pela página de Acesso à Informação.</li>
  <li><strong>Prazo:</strong> até 20 dias, prorrogável por mais 10 dias mediante justificativa.</li>
  <li><strong>Custo:</strong> gratuito, salvo custos de reprodução física quando houver.</li>
</ul>

<h3>Ouvidoria</h3>
<p>Canal para manifestações, sugestões, elogios, reclamações, denúncias e pedidos relacionados aos serviços prestados pela Câmara.</p>
<ul>
  <li><strong>Como acessar:</strong> pelo menu Ouvidoria ou pelos atalhos do portal.</li>
  <li><strong>Etapas:</strong> registro da manifestação, análise, encaminhamento ao setor responsável e resposta ao cidadão.</li>
</ul>

<h3>Acompanhamento Legislativo</h3>
<p>O portal permite acompanhar vereadores, comissões, sessões, pautas, atas, matérias legislativas, votações nominais e publicações oficiais.</p>
<ul>
  <li><strong>Como acessar:</strong> menus A Câmara e Matérias.</li>
  <li><strong>Disponibilidade:</strong> acesso público permanente, conforme atualização dos módulos legislativos.</li>
</ul>

<h3>Transparência e Dados Públicos</h3>
<p>Receitas, despesas, licitações, contratos, duodécimos, relatórios fiscais, dados abertos e demais informações de interesse coletivo ficam disponíveis nas páginas de Transparência e Acesso à Informação.</p>
<ul>
  <li><strong>Formatos:</strong> páginas em HTML, documentos oficiais e exportações de dados quando aplicável.</li>
  <li><strong>Atualização:</strong> conforme a natureza de cada informação e os prazos legais aplicáveis.</li>
</ul>
`

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const now = new Date()

      const category = await db
        .from('system_categories')
        .where('type', 'information_record')
        .where('slug', CATEGORY_SLUG)
        .first()

      if (category) {
        await db.from('system_categories').where('id', category.id).update({
          name: 'Carta de Serviços',
          is_active: true,
          updated_at: now,
        })
      } else {
        await db.table('system_categories').insert({
          type: 'information_record',
          name: 'Carta de Serviços',
          slug: CATEGORY_SLUG,
          display_order: 20,
          is_active: true,
          created_at: now,
          updated_at: now,
        })
      }

      const existingRecord = await db
        .from('information_records')
        .where('category', CATEGORY_SLUG)
        .where('is_active', true)
        .first()

      if (existingRecord) return

      await db.table('information_records').insert({
        title: 'Carta de Serviços ao Usuário',
        category: CATEGORY_SLUG,
        year: 2026,
        content: CONTENT.trim(),
        reference_date: NOW_REFERENCE_DATE,
        file_url: null,
        is_active: true,
        display_order: 0,
        open_mode: 'modal',
        hide_chrome: true,
        created_at: now,
        updated_at: now,
      })
    })
  }

  async down() {
    // Data migration: keep client-edited records.
  }
}
