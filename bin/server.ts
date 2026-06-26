/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'
import { markShuttingDown } from '#services/shutdown_state'

/**
 * Janela de DRAIN (ms) entre falhar o /health e encerrar de fato. Dá tempo do
 * proxy (Traefik/Coolify) parar de rotear ANTES de derrubarmos o servidor.
 * Configurável via SHUTDOWN_DRAIN_MS; default ~6000ms. Lido de process.env
 * direto para não precisar alterar o schema validado em start/env.ts.
 */
const drainRaw = Number.parseInt(process.env.SHUTDOWN_DRAIN_MS ?? '', 10)
const SHUTDOWN_DRAIN_MS = Number.isFinite(drainRaw) && drainRaw >= 0 ? drainRaw : 6000

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    // Shutdown gracioso: marca o flag (o /health passa a responder 503 via
    // app_firewall_middleware), aguarda a janela de DRAIN para o proxy parar de
    // rotear e só então encerra, drenando as requisições já em voo. O
    // stop_grace_period do compose deve ser MAIOR que DRAIN + query_timeout.
    app.listen('SIGTERM', async () => {
      markShuttingDown()
      await sleep(SHUTDOWN_DRAIN_MS)
      await app.terminate()
    })
    app.listenIf(app.managedByPm2, 'SIGINT', async () => {
      markShuttingDown()
      await sleep(SHUTDOWN_DRAIN_MS)
      await app.terminate()
    })
  })
  .httpServer()
  .start()
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
