import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      // Conexões app↔Supabase ficavam ociosas e eram derrubadas pela rede
      // (docker/conntrack/idle timeout); o pool não percebia o socket morto e a
      // PRÓXIMA query travava pra sempre → gateway timeout no painel após horas
      // (CPU/banco ociosos, render routes penduradas). keepAlive TCP previne/
      // detecta conexões mortas; query_timeout é a rede de segurança que aborta no
      // cliente. (Opções do driver pg que os tipos do Lucid não declaram → cast.)
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        connectionTimeoutMillis: 10000,
        query_timeout: 25000,
        statement_timeout: 25000,
      } as Record<string, unknown>,
      pool: {
        // min 0 = não segura conexões ociosas (que viram "stale"); cria sob demanda.
        min: 0,
        max: 12,
        // Reapeia conexões ociosas bem antes de a rede derrubá-las.
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 10000,
        // Não espera infinito por uma conexão do pool.
        acquireTimeoutMillis: 20000,
        createTimeoutMillis: 12000,
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
