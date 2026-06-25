import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',

  /**
   * The loggers object can be used to define multiple loggers.
   * By default, we configure only one logger (named "app").
   */
  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),

      /**
       * Redação de campos sensíveis (defesa em profundidade / LGPD).
       * Evita que PII (CPF, IP, e-mail, telefone) e segredos (authorization,
       * cookie) vazem para os logs, mesmo se forem incluídos por engano em
       * objetos logados (ex.: mensagens de erro do Postgres com valores da linha).
       */
      redact: [
        'cpf',
        'cpf_hash',
        'cpfHash',
        'ip',
        'ipAddress',
        'ip_address',
        'email',
        'phone',
        'authorization',
        'cookie',
        '*.cpf',
        '*.cpf_hash',
        '*.cpfHash',
        '*.ip',
        '*.ipAddress',
        '*.ip_address',
        '*.email',
        '*.phone',
        '*.authorization',
        '*.cookie',
        'req.headers.authorization',
        'req.headers.cookie',
        'request.headers.authorization',
        'request.headers.cookie',
      ],

      transport: {
        targets: targets()
          .pushIf(!app.inProduction, targets.pretty())
          .pushIf(app.inProduction, targets.file({ destination: 1 }))
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
