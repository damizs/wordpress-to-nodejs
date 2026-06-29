import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import { execFile as execFileCallback } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { promisify } from 'node:util'
import StorageSyncRun from '#models/storage_sync_run'

const execFile = promisify(execFileCallback)

interface StorageSyncOptions {
  trigger?: 'manual' | 'scheduled' | 'cli'
  target?: string
}

interface StorageSyncEnvironmentStatus {
  localPath: string
  targets: string[]
  hasTargets: boolean
}

function getRootPath() {
  return app.appRoot.pathname
}

function getLocalPath() {
  return process.env.STORAGE_SYNC_LOCAL_DIR || process.env.R2_SYNC_LOCAL_DIR || app.makePath('public', 'uploads')
}

function getTargets() {
  return (process.env.STORAGE_RCLONE_TARGETS || process.env.R2_RCLONE_TARGET || '')
    .split(',')
    .map((target) => target.trim())
    .filter(Boolean)
}

function pushLog(logs: string[], message: string) {
  logs.push(`[${new Date().toISOString()}] ${message}`)
}

async function scanPath(path: string): Promise<{ files: number; bytes: number }> {
  if (!existsSync(path)) return { files: 0, bytes: 0 }

  const info = await stat(path)
  if (info.isFile()) return { files: 1, bytes: info.size }
  if (!info.isDirectory()) return { files: 0, bytes: 0 }

  let files = 0
  let bytes = 0
  for (const entry of await readdir(path)) {
    const child = await scanPath(join(path, entry))
    files += child.files
    bytes += child.bytes
  }
  return { files, bytes }
}

async function runRcloneCopy(localPath: string, target: string) {
  const destination = `${target.replace(/\/$/, '')}/${basename(localPath)}`
  const result = await execFile(
    'rclone',
    ['copy', localPath, destination, '--checksum', '--create-empty-src-dirs', '--stats-one-line'],
    {
      cwd: getRootPath(),
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 8,
    }
  )
  return [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
}

export default class StorageSyncService {
  static environmentStatus(): StorageSyncEnvironmentStatus {
    const targets = getTargets()
    return {
      localPath: getLocalPath(),
      targets,
      hasTargets: targets.length > 0,
    }
  }

  static async run(options: StorageSyncOptions = {}) {
    const trigger = options.trigger ?? 'manual'
    const localPath = getLocalPath()
    const targets = options.target ? [options.target] : getTargets()

    if (targets.length === 0) {
      const run = await StorageSyncRun.create({
        status: 'failed',
        trigger,
        localPath,
        target: '',
        startedAt: DateTime.now(),
        finishedAt: DateTime.now(),
        filesScanned: 0,
        filesSynced: 0,
        bytesSynced: 0,
        logs: 'Nenhum alvo rclone configurado em STORAGE_RCLONE_TARGETS ou R2_RCLONE_TARGET.',
        error: 'Alvo R2/rclone ausente.',
      })
      return [run]
    }

    const runs: StorageSyncRun[] = []
    const scan = await scanPath(localPath)

    for (const target of targets) {
      const logs: string[] = []
      const run = await StorageSyncRun.create({
        status: 'running',
        trigger,
        localPath,
        target,
        startedAt: DateTime.now(),
        filesScanned: scan.files,
        bytesSynced: 0,
        logs: '',
      })
      runs.push(run)

      try {
        if (!existsSync(localPath)) {
          throw new Error(`Diretorio local inexistente: ${localPath}`)
        }

        pushLog(logs, `Sincronizacao iniciada: ${localPath} -> ${target}.`)
        const output = await runRcloneCopy(localPath, target)
        if (output) pushLog(logs, output)
        pushLog(logs, `Arquivos verificados: ${scan.files}.`)

        run.merge({
          status: 'success',
          finishedAt: DateTime.now(),
          filesScanned: scan.files,
          filesSynced: scan.files,
          bytesSynced: scan.bytes,
          logs: logs.join('\n'),
          error: null,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        pushLog(logs, `Falha no sync: ${message}`)
        run.merge({
          status: 'failed',
          finishedAt: DateTime.now(),
          filesScanned: scan.files,
          filesSynced: 0,
          bytesSynced: 0,
          logs: logs.join('\n'),
          error: message,
        })
      }

      await run.save()
    }

    return runs
  }
}
