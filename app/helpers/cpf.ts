export function normalizeCpf(value: unknown): string {
  return String(value || '').replace(/\D/g, '').slice(0, 11)
}

export function isValidCpf(value: unknown): boolean {
  const cpf = normalizeCpf(value)
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false

  const calculateDigit = (base: string, factor: number) => {
    let total = 0
    for (const number of base) {
      total += Number(number) * factor
      factor--
    }

    const rest = (total * 10) % 11
    return rest === 10 ? 0 : rest
  }

  return (
    calculateDigit(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    calculateDigit(cpf.slice(0, 10), 11) === Number(cpf[10])
  )
}

export function maskCpf(value: unknown): string | null {
  const cpf = normalizeCpf(value)
  if (cpf.length !== 11) return null

  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
