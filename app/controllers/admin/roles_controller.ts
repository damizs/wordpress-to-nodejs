import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import Permission from '#models/permission'
import { generateSlug } from '#helpers/slug'

/**
 * Rótulos amigáveis em pt-BR por RECURSO (o prefixo antes do ponto em
 * `recurso.acao`). Cada recurso vira um grupo/seção no formulário de papéis,
 * para o admin escolher de forma GRANULAR — ex.: liberar Notícias sem liberar
 * a Automação (Instagram) nem a Aparência do site.
 */
const RESOURCE_GROUPS: Record<string, { label: string; description: string; module: string }> = {
  noticia: {
    label: 'Notícias',
    description: 'Criar, editar, publicar e excluir notícias do portal.',
    module: 'Conteúdo',
  },
  instagram: {
    label: 'Automação de Notícias (Instagram)',
    description: 'Importação automática de posts do Instagram como notícias e feed/reels.',
    module: 'Conteúdo',
  },
  faq: {
    label: 'Perguntas Frequentes',
    description: 'Perguntas e respostas frequentes do portal.',
    module: 'Conteúdo',
  },
  pesquisa: {
    label: 'Pesquisa de Satisfação',
    description: 'Pesquisa de satisfação do cidadão e seus resultados.',
    module: 'Conteúdo',
  },
  legislativo: {
    label: 'Vereadores, Mesa e Comissões',
    description: 'Vereadores, mesa diretora, comissões, legislaturas e biênios.',
    module: 'Legislativo',
  },
  atividade: {
    label: 'Atividades Legislativas',
    description: 'Projetos de lei, requerimentos e demais matérias (com autoria).',
    module: 'Legislativo',
  },
  sessao: {
    label: 'Sessões Plenárias',
    description: 'Agenda de sessões, atas e pautas vinculadas.',
    module: 'Legislativo',
  },
  ata: { label: 'Atas', description: 'Atas das sessões.', module: 'Legislativo' },
  pauta: { label: 'Pautas', description: 'Pautas das sessões.', module: 'Legislativo' },
  votacao: {
    label: 'Votações Nominais',
    description: 'Resultados de votações nominais.',
    module: 'Legislativo',
  },
  publicacao: {
    label: 'Publicações Oficiais',
    description: 'Diário e publicações oficiais.',
    module: 'Legislativo',
  },
  transparencia: {
    label: 'Portal da Transparência',
    description: 'Seções e links do portal da transparência.',
    module: 'Transparência',
  },
  pntp: {
    label: 'Acesso à Informação (PNTP)',
    description: 'Categorias e registros de acesso à informação.',
    module: 'Transparência',
  },
  licitacao: {
    label: 'Licitações',
    description: 'Licitações e seus documentos.',
    module: 'Transparência',
  },
  contrato: {
    label: 'Contratos',
    description: 'Contratos, gestores e fiscais.',
    module: 'Transparência',
  },
  site: {
    label: 'Aparência e Site',
    description: 'Homepage, aparência, menus, links rápidos, selos, categorias e mídia.',
    module: 'Site',
  },
  usuario: {
    label: 'Usuários e Papéis',
    description: 'Contas de acesso e permissões (RBAC).',
    module: 'Administração',
  },
}

/** Rótulos amigáveis por AÇÃO (o sufixo depois do ponto). */
const ACTION_LABELS: Record<string, string> = {
  criar: 'Criar',
  editar: 'Editar',
  publicar: 'Publicar',
  excluir: 'Excluir',
  gerenciar: 'Gerenciar',
  ver: 'Visualizar',
  visualizar: 'Visualizar',
}

/** Ordem natural das ações dentro de um grupo. */
const ACTION_ORDER = ['ver', 'visualizar', 'criar', 'editar', 'publicar', 'gerenciar', 'excluir']

/** Ordem dos módulos (seções de alto nível) no formulário. */
const MODULE_ORDER = ['Conteúdo', 'Legislativo', 'Transparência', 'Site', 'Administração']

/** Ordem dos recursos (cards) dentro de cada módulo. */
const RESOURCE_ORDER = [
  // Conteúdo
  'noticia',
  'instagram',
  'faq',
  'pesquisa',
  // Legislativo
  'legislativo',
  'atividade',
  'sessao',
  'ata',
  'pauta',
  'votacao',
  'publicacao',
  // Transparência
  'transparencia',
  'pntp',
  'licitacao',
  'contrato',
  // Site
  'site',
  // Administração
  'usuario',
]

function capitalizeWord(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export interface PermissionGroup {
  resource: string
  label: string
  description: string | null
  module: string
  permissions: {
    id: number
    name: string
    action: string
    actionLabel: string
    label: string
  }[]
}

/**
 * Agrupa as permissões por RECURSO (prefixo antes do ponto), com rótulos
 * amigáveis em pt-BR e as ações (subtópicos) ordenadas. Os grupos são
 * ordenados por módulo e, dentro do módulo, pela ordem de catálogo.
 */
function buildPermissionGroups(permissions: Permission[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>()

  for (const p of permissions) {
    const [resource, action = 'gerenciar'] = p.name.split('.')
    const meta = RESOURCE_GROUPS[resource]
    if (!groups.has(resource)) {
      groups.set(resource, {
        resource,
        label: meta?.label ?? capitalizeWord(resource),
        description: meta?.description ?? null,
        module: meta?.module ?? p.module ?? 'Outros',
        permissions: [],
      })
    }
    groups.get(resource)!.permissions.push({
      id: p.id,
      name: p.name,
      action,
      actionLabel: ACTION_LABELS[action] ?? capitalizeWord(action),
      label: p.label,
    })
  }

  const orderedGroups = [...groups.values()]

  // Ações em ordem natural dentro de cada grupo.
  for (const group of orderedGroups) {
    group.permissions.sort((a, b) => {
      const ia = ACTION_ORDER.indexOf(a.action)
      const ib = ACTION_ORDER.indexOf(b.action)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
  }

  // Grupos por módulo e, dentro do módulo, pela ordem de recurso definida.
  // Itens desconhecidos vão para o fim (mantendo a ordem original).
  const moduleRank = (m: string) => {
    const i = MODULE_ORDER.indexOf(m)
    return i === -1 ? 99 : i
  }
  const resourceRank = (r: string) => {
    const i = RESOURCE_ORDER.indexOf(r)
    return i === -1 ? 99 : i
  }
  return orderedGroups.sort((a, b) => {
    const byModule = moduleRank(a.module) - moduleRank(b.module)
    if (byModule !== 0) return byModule
    return resourceRank(a.resource) - resourceRank(b.resource)
  })
}

export default class RolesController {
  async index({ inertia }: HttpContext) {
    const roles = await Role.query().preload('permissions').orderBy('name')
    return inertia.render('admin/roles/index', {
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        permissionCount: r.permissions.length,
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    const permissions = await Permission.query().orderBy('module').orderBy('label')
    return inertia.render('admin/roles/form', {
      role: null,
      // Lista plana mantida para compatibilidade com qualquer tela que dependa dela.
      permissions: permissions.map((p) => p.serialize()),
      // Versão agrupada por recurso (recurso.acao) com rótulos pt-BR.
      permissionGroups: buildPermissionGroups(permissions),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['name', 'description', 'permission_ids'])

    if (!data.name) {
      session.flash('error', 'Nome do papel é obrigatório.')
      return response.redirect().back()
    }

    const role = await Role.create({
      name: data.name,
      slug: generateSlug(data.name),
      description: data.description || null,
      isSystem: false,
    })

    const ids = Array.isArray(data.permission_ids) ? data.permission_ids.map(Number) : []
    await role.related('permissions').sync(ids)

    session.flash('success', 'Papel criado com sucesso!')
    return response.redirect().toPath('/painel/papeis')
  }

  async edit({ params, inertia }: HttpContext) {
    const role = await Role.query().where('id', params.id).preload('permissions').firstOrFail()
    const permissions = await Permission.query().orderBy('module').orderBy('label')
    return inertia.render('admin/roles/form', {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissionIds: role.permissions.map((p) => p.id),
      },
      // Lista plana mantida para compatibilidade com qualquer tela que dependa dela.
      permissions: permissions.map((p) => p.serialize()),
      // Versão agrupada por recurso (recurso.acao) com rótulos pt-BR.
      permissionGroups: buildPermissionGroups(permissions),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const role = await Role.findOrFail(params.id)
    const data = request.only(['name', 'description', 'permission_ids'])

    if (role.isSystem) {
      session.flash('error', 'O papel Administrador é do sistema e não pode ser alterado.')
      return response.redirect().toPath('/painel/papeis')
    }

    role.merge({
      name: data.name,
      description: data.description || null,
    })
    await role.save()

    const ids = Array.isArray(data.permission_ids) ? data.permission_ids.map(Number) : []
    await role.related('permissions').sync(ids)

    session.flash('success', 'Papel atualizado com sucesso!')
    return response.redirect().toPath('/painel/papeis')
  }

  async destroy({ params, response, session }: HttpContext) {
    const role = await Role.findOrFail(params.id)
    if (role.isSystem) {
      session.flash('error', 'O papel Administrador é do sistema e não pode ser excluído.')
      return response.redirect().back()
    }
    await role.delete()
    session.flash('success', 'Papel excluído com sucesso!')
    return response.redirect().toPath('/painel/papeis')
  }
}
