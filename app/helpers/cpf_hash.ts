import { createHmac } from 'node:crypto'
import env from '#start/env'
import { normalizeCpf } from '#helpers/cpf'

export function hashCpf(value: unknown): string {
  const cpf = normalizeCpf(value)
  return createHmac('sha256', env.get('APP_KEY')).update(cpf).digest('hex')
}
