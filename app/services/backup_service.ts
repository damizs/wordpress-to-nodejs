import app from '@adonisjs/core/services/app'
import BackupRun, { type BackupProviderStatus } from '#models/backup_run'
import { DateTime } from 'luxon'
import { execFile as execFileCallback, execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { promisify } from 'node:util'

const execFile = promisify(execFileCallback)

interface BackupRunOptions {
  trigger?: 'manual' | 'scheduled' | 'cli'
}

interface BackupEnvironmentStatus {
  localDir: string
  rcloneTargets: string[]
  hasRcloneTargets: boolean
  pgDumpConfigured: boolean
  pgDumpAvailable: boolean
  rcloneAvailable: boolean
}

const SOURCE_PATHS = [
  'app',
  'commands',
  'config',
  'database',
  'inertia',
  'public',
  'resources',
  'scripts',
  'start',
  'adonisrc.ts',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'startup.sh',
]

function getRootPath() {
  return app.appRoot.pathname
}

function getLocalDir() {
  return process.env.BACKUP_LOCAL_DIR || app.makePath('storage', 'backups')
}

function getRcloneTargets() {
  return (process.env.BACKUP_RCLONE_TARGETS || '')
    .split(',')
    .map((target) => target.trim())
    .filter(Boolean)
}

function commandExists(command: string) {
  try {
    execFileSync('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function pushLog(logs: string[], message: string) {
  logs.push(`[${new Date().toISOString()}] ${message}`)
}

async function pathSize(path: string): Promise<number> {
  if (!existsSync(path)) return 0

  const info = await stat(path)
  if (info.isFile()) return info.size
  if (!info.isDirectory()) return 0

  let total = 0
  for (const entry of await readdir(path)) {
    total += await pathSize(join(path, entry))
  }
  return total
}

async function runCommand(command: string, args: string[], options: { env?: NodeJS.ProcessEnv } = {}) {
  const result = await execFile(command, args, {
    cwd: getRootPath(),
    env: options.env,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 8,
  })

  return [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
}

async function dumpDatabase(backupDir: string, logs: string[]) {
  const databasePath = join(backupDir, 'database.dump')
  const env = {
    ...process.env,
    PGHOST: process.env.DB_HOST,
    PGPORT: process.env.DB_PORT,
    PGUSER: process.env.DB_USER,
    PGPASSWORD: process.env.DB_PASSWORD,
    PGDATABASE: process.env.DB_DATABASE,
  }

  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_DATABASE) {
    pushLog(logs, 'pg_dump ignorado: variaveis DB_HOST, DB_USER ou DB_DATABASE ausentes.')
    return null
  }

  await runCommand('pg_dump', ['--format=custom', '--file', databasePath], { env })
  pushLog(logs, `Banco exportado em ${databasePath}.`)
  return databasePath
}

async function archiveSite(backupDir: string, logs: string[]) {
  const root = getRootPath()
  const sitePath = join(backupDir, 'site.tar.gz')
  const existingPaths = SOURCE_PATHS.filter((item) => existsSync(join(root, item)))

  if (existingPaths.length === 0) {
    pushLog(logs, 'Arquivo do site ignorado: nenhum caminho esperado encontrado.')
    return null
  }

  await runCommand('tar', ['-czf', sitePath, ...existingPaths])
  pushLog(logs, `Site arquivado em ${sitePath}.`)
  return sitePath
}

async function uploadWithRclone(backupDir: string, logs: string[]): Promise<BackupProviderStatus[]> {
  const targets = getRcloneTargets()
  if (targets.length === 0) {
    pushLog(logs, 'Upload externo ignorado: BACKUP_RCLONE_TARGETS nao configurado.')
    return []
  }

  const providers: BackupProviderStatus[] = []
  for (const target of targets) {
    try {
      await runCommand('rclone', ['copy', backupDir, `${target.replace(/\/$/, '')}/${basename(backupDir)}`])
      providers.push({ target, status: 'ok' })
      pushLog(logs, `Backup enviado para ${target}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      providers.push({ target, status: 'failed', message })
      pushLog(logs, `Falha no envio para ${target}: ${message}`)
    }
  }
  return providers
}

async function notifyBackupIssue(run: BackupRun) {
  if (run.status !== 'failed' && run.status !== 'partial') return

  try {
    const { default: EvolutionAlertService } = await import('#services/evolution_alert_service')
    await EvolutionAlertService.sendAlert(
      'backup',
      run.status === 'partial' ? 'Backup parcial' : 'Backup falhou',
      `Status: ${run.status}. Caminho local: ${run.localPath || '-'}. Erro: ${
        run.error || 'verifique o historico do backup no painel'
      }`,
      {
        dedupeKey: `backup:${run.id}:${run.status}`,
        throttleMinutes: 30,
        metadata: { backupId: run.id, status: run.status },
      }
    )
  } catch {
    // Backup must not fail because the alert channel is unavailable.
  }
}

export default class BackupService {
  static environmentStatus(): BackupEnvironmentStatus {
    const rcloneTargets = getRcloneTargets()
    return {
      localDir: getLocalDir(),
      rcloneTargets,
      hasRcloneTargets: rcloneTargets.length > 0,
      pgDumpConfigured: Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_DATABASE),
      pgDumpAvailable: commandExists('pg_dump'),
      rcloneAvailable: commandExists('rclone'),
    }
  }

  static async run(options: BackupRunOptions = {}) {
    const startedAt = DateTime.now()
    const trigger = options.trigger ?? 'manual'
    const run = await BackupRun.create({
      status: 'running',
      trigger,
      startedAt,
      providers: [],
      logs: '',
    })

    const logs: string[] = []
    const backupDir = join(getLocalDir(), startedAt.toFormat("yyyyLLdd-HHmmss-'run'") + run.id)
    let databasePath: string | null = null
    let uploadsPath: string | null = null
    let providers: BackupProviderStatus[] = []

    try {
      await mkdir(backupDir, { recursive: true })
      pushLog(logs, `Backup iniciado em ${backupDir}.`)

      try {
        databasePath = await dumpDatabase(backupDir, logs)
      } catch (error) {
        pushLog(logs, `Falha no dump do banco: ${error instanceof Error ? error.message : String(error)}`)
      }

      try {
        uploadsPath = await archiveSite(backupDir, logs)
      } catch (error) {
        pushLog(logs, `Falha ao arquivar o site: ${error instanceof Error ? error.message : String(error)}`)
      }

      const manifestPath = join(backupDir, 'manifest.json')
      await writeFile(
        manifestPath,
        JSON.stringify(
          {
            generatedAt: startedAt.toISO(),
            app: 'camara-sume',
            databasePath: databasePath ? basename(databasePath) : null,
            sitePath: uploadsPath ? basename(uploadsPath) : null,
            cloudTargets: getRcloneTargets(),
          },
          null,
          2
        )
      )
      pushLog(logs, `Manifesto criado em ${manifestPath}.`)

      providers = await uploadWithRclone(backupDir, logs)

      const sizeBytes = await pathSize(backupDir)
      const hasCloudFailure = providers.some((provider) => provider.status === 'failed')
      const hasDatabaseFailure = !databasePath
      const hasLocalBackup = Boolean(databasePath || uploadsPath)
      const status = !hasLocalBackup || hasDatabaseFailure ? (hasLocalBackup ? 'partial' : 'failed') : hasCloudFailure ? 'partial' : 'success'

      run.merge({
        status,
        finishedAt: DateTime.now(),
        localPath: backupDir,
        databasePath,
        uploadsPath,
        sizeBytes,
        providers,
        logs: logs.join('\n'),
        error:
          status === 'failed'
            ? 'Nenhum artefato local foi gerado.'
            : hasDatabaseFailure
              ? 'Dump do banco nao foi gerado.'
              : null,
      })
      await run.save()
      await notifyBackupIssue(run)
      return run
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      pushLog(logs, `Falha geral: ${message}`)
      run.merge({
        status: 'failed',
        finishedAt: DateTime.now(),
        localPath: backupDir,
        databasePath,
        uploadsPath,
        providers,
        logs: logs.join('\n'),
        error: message,
      })
      await run.save()
      await notifyBackupIssue(run)
      return run
    }
  }
}
