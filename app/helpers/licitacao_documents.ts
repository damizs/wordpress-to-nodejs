/**
 * Catálogo de fases documentais do processo licitatório (Lei 14.133/2021).
 * Cada modalidade tem um checklist sugerido — mas qualquer tipo aceita
 * quantidade ILIMITADA de arquivos.
 */

export const DOCUMENT_TYPES: Record<string, string> = {
  edital: 'Edital',
  dfd: 'DFD — Documento de Formalização da Demanda',
  etp: 'ETP — Estudo Técnico Preliminar',
  pesquisa_mercado: 'Pesquisa de Mercado',
  projeto_basico: 'Projeto Básico',
  autorizacao: 'Autorização',
  proposta: 'Proposta',
  contrato: 'Contrato',
  documentacao: 'Documentação',
  outros: 'Outros',
}

/** Checklist de fases por modalidade (ordem de exibição) */
export const MODALITY_CHECKLIST: Record<string, string[]> = {
  dispensa: [
    'edital',
    'dfd',
    'etp',
    'pesquisa_mercado',
    'autorizacao',
    'proposta',
    'contrato',
    'documentacao',
  ],
  inexigibilidade: ['dfd', 'etp', 'autorizacao', 'proposta', 'contrato', 'documentacao'],
  pregao: [
    'dfd',
    'etp',
    'pesquisa_mercado',
    'edital',
    'autorizacao',
    'proposta',
    'contrato',
    'documentacao',
  ],
  concorrencia: [
    'dfd',
    'etp',
    'projeto_basico',
    'edital',
    'autorizacao',
    'proposta',
    'contrato',
    'documentacao',
  ],
}

/** Fases sugeridas para a modalidade (fallback: catálogo completo) */
export function checklistFor(modality: string | null): string[] {
  return MODALITY_CHECKLIST[modality || ''] || Object.keys(DOCUMENT_TYPES).filter((t) => t !== 'outros')
}
