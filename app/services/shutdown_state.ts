/*
|--------------------------------------------------------------------------
| Estado de shutdown gracioso ("fail health then drain")
|--------------------------------------------------------------------------
|
| Singleton de processo (o módulo é cacheado pelo runtime, então o flag é
| compartilhado entre o entrypoint HTTP em bin/server.ts e o firewall
| middleware que intercepta /health).
|
| Fluxo no deploy zero-downtime:
|   1. Container velho recebe SIGTERM (Coolify/Traefik subiram o novo).
|   2. bin/server.ts chama markShuttingDown() -> /health passa a responder 503.
|   3. O proxy vê o /health "unhealthy" e PARA de rotear novas requisicoes.
|   4. Espera-se a janela de DRAIN; depois app.terminate() drena o que esta em voo.
|
| Sem Date.now / Math.random: e apenas um boolean idempotente.
*/

let shuttingDown = false

/**
 * Marca o processo como "em encerramento". Idempotente — chamar varias vezes
 * (ex.: SIGTERM repetido) nao tem efeito colateral.
 */
export function markShuttingDown(): void {
  shuttingDown = true
}

/**
 * Indica se o processo ja iniciou o encerramento gracioso. Usado pelo
 * app_firewall_middleware para falhar o /health (503) antes do drain.
 */
export function isShuttingDown(): boolean {
  return shuttingDown
}
