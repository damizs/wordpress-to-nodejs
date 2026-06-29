import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Permission from '#models/permission'
import Role from '#models/role'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export const PERMISSIONS: { name: string; label: string; module: string }[] = [
  { name: 'noticia.criar', label: 'Criar notícias', module: 'Notícias' },
  { name: 'noticia.editar', label: 'Editar notícias', module: 'Notícias' },
  { name: 'noticia.publicar', label: 'Publicar notícias', module: 'Notícias' },
  { name: 'noticia.excluir', label: 'Excluir notícias', module: 'Notícias' },
  { name: 'instagram.gerenciar', label: 'Automação Instagram', module: 'Notícias' },
  {
    name: 'legislativo.gerenciar',
    label: 'Vereadores, mesa, comissões e legislaturas',
    module: 'Legislativo',
  },
  { name: 'atividade.gerenciar', label: 'Atividades legislativas', module: 'Legislativo' },
  { name: 'sessao.gerenciar', label: 'Sessões, atas e pautas', module: 'Legislativo' },
  { name: 'ata.gerenciar', label: 'Atas', module: 'Legislativo' },
  { name: 'ata.ver', label: 'Ver atas', module: 'Legislativo' },
  { name: 'ata.criar', label: 'Criar atas', module: 'Legislativo' },
  { name: 'ata.editar', label: 'Editar atas', module: 'Legislativo' },
  { name: 'ata.excluir', label: 'Excluir atas', module: 'Legislativo' },
  { name: 'pauta.gerenciar', label: 'Pautas', module: 'Legislativo' },
  { name: 'pauta.ver', label: 'Ver pautas', module: 'Legislativo' },
  { name: 'pauta.criar', label: 'Criar pautas', module: 'Legislativo' },
  { name: 'pauta.editar', label: 'Editar pautas', module: 'Legislativo' },
  { name: 'pauta.excluir', label: 'Excluir pautas', module: 'Legislativo' },
  { name: 'votacao.gerenciar', label: 'Votações nominais', module: 'Legislativo' },
  { name: 'publicacao.gerenciar', label: 'Publicações oficiais', module: 'Legislativo' },
  { name: 'transparencia.gerenciar', label: 'Portal da transparência', module: 'Transparência' },
  { name: 'pntp.gerenciar', label: 'Acesso à informação (PNTP)', module: 'Transparência' },
  { name: 'licitacao.gerenciar', label: 'Licitações', module: 'Transparência' },
  { name: 'contrato.gerenciar', label: 'Contratos', module: 'Transparência' },
  { name: 'faq.gerenciar', label: 'Perguntas frequentes', module: 'Conteúdo' },
  { name: 'pesquisa.gerenciar', label: 'Pesquisa de satisfação', module: 'Conteúdo' },
  {
    name: 'site.gerenciar',
    label: 'Site (homepage, aparência, links rápidos, selos, categorias)',
    module: 'Site',
  },
  { name: 'usuario.gerenciar', label: 'Usuários e papéis', module: 'Administração' },
]

export const ROLES: {
  name: string
  slug: string
  description: string
  isSystem?: boolean
  permissions: string[] | '*'
}[] = [
  {
    name: 'Administrador',
    slug: 'administrador',
    description: 'Acesso total ao painel, incluindo usuários e configurações.',
    isSystem: true,
    permissions: '*',
  },
  {
    name: 'Gestor de Notícias',
    slug: 'gestor-noticias',
    description: 'Gerencia notícias e a automação do Instagram.',
    permissions: [
      'noticia.criar',
      'noticia.editar',
      'noticia.publicar',
      'noticia.excluir',
      'instagram.gerenciar',
    ],
  },
  {
    name: 'Gestor de Transparência',
    slug: 'gestor-transparencia',
    description: 'Gerencia transparência, PNTP e licitações.',
    permissions: ['transparencia.gerenciar', 'pntp.gerenciar', 'licitacao.gerenciar'],
  },
  {
    name: 'Gestor Legislativo',
    slug: 'gestor-legislativo',
    description: 'Gerencia vereadores, comissões, atividades e publicações oficiais.',
    permissions: [
      'legislativo.gerenciar',
      'atividade.gerenciar',
      'publicacao.gerenciar',
      'votacao.gerenciar',
    ],
  },
  {
    name: 'Gestor de Sessões',
    slug: 'gestor-sessoes',
    description: 'Gerencia sessões plenárias, atas e pautas.',
    permissions: [
      'sessao.gerenciar',
      'ata.ver',
      'ata.criar',
      'ata.editar',
      'ata.excluir',
      'pauta.ver',
      'pauta.criar',
      'pauta.editar',
      'pauta.excluir',
    ],
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Cria, edita e publica notícias.',
    permissions: ['noticia.criar', 'noticia.editar', 'noticia.publicar'],
  },
  {
    name: 'Assessoria Legislativa',
    slug: 'assessoria-legislativa',
    description:
      'Alimenta o portal: atividades, publicações, pautas/atas, licitações, transparência e PNTP.',
    permissions: [
      'atividade.gerenciar',
      'publicacao.gerenciar',
      'sessao.gerenciar',
      'ata.ver',
      'ata.criar',
      'ata.editar',
      'ata.excluir',
      'pauta.ver',
      'pauta.criar',
      'pauta.editar',
      'pauta.excluir',
      'votacao.gerenciar',
      'licitacao.gerenciar',
      'transparencia.gerenciar',
      'pntp.gerenciar',
    ],
  },
  {
    name: 'Publicador',
    slug: 'publicador',
    description: 'Publica notícias, publicações oficiais, atas e pautas sem acesso administrativo.',
    permissions: [
      'noticia.criar',
      'noticia.editar',
      'noticia.publicar',
      'noticia.excluir',
      'publicacao.gerenciar',
      'ata.ver',
      'ata.criar',
      'ata.editar',
      'ata.excluir',
      'pauta.ver',
      'pauta.criar',
      'pauta.editar',
      'pauta.excluir',
    ],
  },
]

export default class extends BaseSeeder {
  async run() {
    const hasTables = await db.connection().schema.hasTable('roles')
    if (!hasTables) return

    // 1. Catálogo de permissões
    for (const p of PERMISSIONS) {
      await Permission.updateOrCreate({ name: p.name }, p)
    }
    const allPermissions = await Permission.all()
    const byName = new Map(allPermissions.map((p) => [p.name, p.id]))

    // 2. Papéis padrão + sincronização das permissões
    for (const r of ROLES) {
      const role = await Role.updateOrCreate(
        { slug: r.slug },
        { name: r.name, slug: r.slug, description: r.description, isSystem: r.isSystem ?? false }
      )

      if (r.permissions === '*') {
        // Administrador sempre re-sincroniza com o catálogo completo
        await role.related('permissions').sync(allPermissions.map((p) => p.id))
      } else if (role.isSystem || !(await this.hasCustomizations(role.id))) {
        // Papéis seedados só são (re)preenchidos se ainda não foram customizados no painel
        const ids = r.permissions
          .map((name) => byName.get(name))
          .filter((id): id is number => id !== undefined)
        await role.related('permissions').sync(ids)
      }
    }

    // 3. Transição do enum legado → papéis (só para quem ainda não tem papel)
    const adminRole = await Role.findBy('slug', 'administrador')
    const editorRole = await Role.findBy('slug', 'editor')
    const users = await User.all()
    for (const user of users) {
      const existing = await db.from('user_roles').where('user_id', user.id).first()
      if (existing) continue
      if (['super_admin', 'admin'].includes(user.role) && adminRole) {
        await user.related('roles').attach([adminRole.id])
      } else if (user.role === 'editor' && editorRole) {
        await user.related('roles').attach([editorRole.id])
      }
    }
  }

  /** Papel já recebeu permissões alguma vez? (evita sobrescrever ajustes feitos no painel) */
  private async hasCustomizations(roleId: number): Promise<boolean> {
    const row = await db.from('role_permissions').where('role_id', roleId).first()
    return !!row
  }
}
