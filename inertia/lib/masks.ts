/**
 * Máscaras de formatação para campos brasileiros — formatam a string conforme o
 * usuário digita. SEM dependências externas. Use no `onChange` dos inputs:
 *
 *   onChange={(e) => setData('phone', maskPhone(e.target.value))}
 *
 * As funções são tolerantes a entrada já mascarada (reformatam a partir dos
 * dígitos), então funcionam tanto em colagem quanto em digitação.
 */

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return (value || '').replace(/\D+/g, '')
}

/**
 * Telefone brasileiro:
 *  - 11 dígitos (celular): (99) 99999-9999
 *  - 10 dígitos (fixo):    (99) 9999-9999
 * Formata progressivamente enquanto digita.
 */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** CPF: 999.999.999-99 */
export function maskCPF(value: string): string {
  const d = onlyDigits(value).slice(0, 11)
  let out = d.slice(0, 3)
  if (d.length > 3) out += '.' + d.slice(3, 6)
  if (d.length > 6) out += '.' + d.slice(6, 9)
  if (d.length > 9) out += '-' + d.slice(9, 11)
  return out
}

/** CNPJ: 99.999.999/9999-99 */
export function maskCNPJ(value: string): string {
  const d = onlyDigits(value).slice(0, 14)
  let out = d.slice(0, 2)
  if (d.length > 2) out += '.' + d.slice(2, 5)
  if (d.length > 5) out += '.' + d.slice(5, 8)
  if (d.length > 8) out += '/' + d.slice(8, 12)
  if (d.length > 12) out += '-' + d.slice(12, 14)
  return out
}

/**
 * CPF ou CNPJ conforme a quantidade de dígitos — útil em campos "CNPJ/CPF"
 * (até 11 dígitos = CPF; acima disso = CNPJ).
 */
export function maskCpfCnpj(value: string): string {
  const d = onlyDigits(value)
  return d.length > 11 ? maskCNPJ(value) : maskCPF(value)
}
