import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import hash from '@adonisjs/core/services/hash'

/**
 * Serviço de Autenticação de 2 Fatores (TOTP, RFC 6238).
 *
 * - TOTP via `otplib` (SHA-1, 6 dígitos, passo de 30s — padrão dos apps
 *   autenticadores: Google Authenticator, Authy, 1Password, etc.).
 * - Janela de validação ±1 passo (tolera relógio levemente dessincronizado).
 * - Códigos de backup são gerados em claro UMA vez (mostrados ao usuário) e
 *   guardados apenas HASHEADOS (scrypt do Adonis). O código usado é invalidado.
 *
 * IMPORTANTE: nunca logar `secret` nem códigos de backup em claro.
 */

// Janela TOTP padrão: ±1 passo de 30s.
authenticator.options = { window: 1 }

const ISSUER = 'Camara Municipal de Sume'
const BACKUP_CODE_COUNT = 10

const TwofaService = {
  /** Gera um novo segredo TOTP (base32). */
  generateSecret(): string {
    return authenticator.generateSecret()
  },

  /** URL otpauth:// para QR code / inserção manual no app autenticador. */
  keyUri(accountName: string, secret: string): string {
    return authenticator.keyuri(accountName, ISSUER, secret)
  },

  /** Gera o data URL (PNG base64) do QR code a partir da otpauth URL. */
  async qrCodeDataUrl(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl, { errorCorrectionLevel: 'M', margin: 1, width: 240 })
  },

  /** Valida um código TOTP de 6 dígitos contra o segredo (janela ±1). */
  verifyToken(token: string, secret: string): boolean {
    const clean = String(token || '').replace(/\s+/g, '')
    if (!/^\d{6}$/.test(clean)) return false
    try {
      return authenticator.verify({ token: clean, secret })
    } catch {
      return false
    }
  },

  /**
   * Gera N códigos de backup em CLARO (para mostrar ao usuário uma única vez).
   * Formato: 10 dígitos agrupados (ex.: "4821-7390-15"), fáceis de digitar.
   */
  generateBackupCodes(count = BACKUP_CODE_COUNT): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      let digits = ''
      for (let d = 0; d < 10; d++) digits += Math.floor(Math.random() * 10)
      codes.push(`${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 10)}`)
    }
    return codes
  },

  /** Normaliza um código de backup digitado (só dígitos) para comparação. */
  normalizeBackupCode(code: string): string {
    return String(code || '').replace(/\D+/g, '')
  },

  /** Hasheia uma lista de códigos de backup (em claro) → array de hashes. */
  async hashBackupCodes(plainCodes: string[]): Promise<string[]> {
    return Promise.all(plainCodes.map((c) => hash.make(this.normalizeBackupCode(c))))
  },

  /** Serializa os hashes dos códigos de backup para a coluna (JSON string). */
  serializeBackupCodes(hashes: string[]): string {
    return JSON.stringify(hashes)
  },

  /** Lê os hashes dos códigos de backup da coluna (tolerante a null/inválido). */
  parseBackupCodes(raw: string | null | undefined): string[] {
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((h): h is string => typeof h === 'string') : []
    } catch {
      return []
    }
  },

  /**
   * Confere um código de backup digitado contra a lista de hashes.
   * Retorna o array de hashes RESTANTES (sem o código consumido) quando casa,
   * ou `null` quando nenhum código bate. O chamador persiste o restante para
   * invalidar o código usado (uso único).
   */
  async consumeBackupCode(rawCode: string, hashes: string[]): Promise<string[] | null> {
    const normalized = this.normalizeBackupCode(rawCode)
    if (normalized.length < 8) return null
    for (let i = 0; i < hashes.length; i++) {
      let ok = false
      try {
        ok = await hash.verify(hashes[i], normalized)
      } catch {
        ok = false
      }
      if (ok) {
        return hashes.filter((_, idx) => idx !== i)
      }
    }
    return null
  },

  get backupCodeCount() {
    return BACKUP_CODE_COUNT
  },
}

export default TwofaService
