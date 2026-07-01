import { camara } from '#config/camara'

export type InstitutionalEntryDefault = {
  key: string
  title: string
  content: string
  page: string
}

export function buildInstitutionalEntries(): InstitutionalEntryDefault[] {
  const orgName = camara.nome
  const city = camara.cidade

  return [
    {
      key: 'sobre_missao',
      title: 'Missão',
      content:
        'Representar os interesses da população, legislar com responsabilidade e fiscalizar o Poder Executivo.',
      page: 'Sobre a Câmara',
    },
    {
      key: 'sobre_visao',
      title: 'Visão',
      content: 'Ser referência em transparência e eficiência no Poder Legislativo municipal.',
      page: 'Sobre a Câmara',
    },
    {
      key: 'sobre_valores',
      title: 'Valores',
      content: 'Ética, transparência, compromisso social e respeito ao cidadão.',
      page: 'Sobre a Câmara',
    },
    {
      key: 'sobre_intro',
      title: 'O Poder Legislativo Municipal',
      content: `${orgName} é o órgão do Poder Legislativo do município, responsável por elaborar leis, fiscalizar o Poder Executivo e representar os interesses da população de ${city}.`,
      page: 'Sobre a Câmara',
    },
    {
      key: 'sobre_atribuicoes',
      title: 'Atribuições',
      content:
        'Entre as principais atribuições da Câmara estão: elaborar leis municipais, aprovar o orçamento do município, fiscalizar a aplicação dos recursos públicos e garantir a transparência da gestão pública.',
      page: 'Sobre a Câmara',
    },
    {
      key: 'historia_intro',
      title: 'Introdução',
      content: `${orgName} integra a história institucional de ${city}, acompanhando o desenvolvimento do município e a representação democrática da população.`,
      page: 'História da Câmara',
    },
    {
      key: 'historia_trajetoria',
      title: 'Nossa Trajetória',
      content:
        'Ao longo de sua trajetória, a Câmara Municipal tem sido palco de decisões importantes para o município, registradas em atas, leis, resoluções e demais atos oficiais.',
      page: 'História da Câmara',
    },
    {
      key: 'historia_poder_legislativo',
      title: 'O Poder Legislativo',
      content:
        'Composta por vereadores eleitos democraticamente pela população, a Casa Legislativa trabalha na elaboração de leis, fiscalização do Executivo e representação dos interesses da comunidade.',
      page: 'História da Câmara',
    },
    {
      key: 'historia_transparencia',
      title: 'Compromisso com a Transparência',
      content: `${orgName} preza pela transparência em suas ações, disponibilizando informações sobre atividades legislativas, gastos públicos e decisões através deste Portal.`,
      page: 'História da Câmara',
    },
  ]
}
