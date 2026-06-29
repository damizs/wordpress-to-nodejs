export const DEFAULT_ELECTION_MESSAGE =
  "Em atendimento à legislação eleitoral, este conteúdo institucional está temporariamente indisponível durante o período eleitoral. Permanecem acessíveis os serviços essenciais, atos oficiais, transparência pública, licitações, contratos, dados abertos e canais de atendimento ao cidadão.";

function enabled(value: string | null | undefined) {
  return value === "true" || value === "1" || value === "on";
}

export function isElectionModeActive(
  settings: Record<string, string | null | undefined>,
  now = new Date()
) {
  if (!enabled(settings.election_mode_enabled)) return false;

  const today = now.toISOString().slice(0, 10);
  const start = settings.election_start || null;
  const end = settings.election_end || null;

  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
}

export function electionModeMessage(settings: Record<string, string | null | undefined>) {
  const message = settings.election_message?.trim();
  return message || DEFAULT_ELECTION_MESSAGE;
}

export function getElectionModeState(
  settings: Record<string, string | null | undefined>,
  now = new Date()
) {
  return {
    active: isElectionModeActive(settings, now),
    message: electionModeMessage(settings),
    enabled: enabled(settings.election_mode_enabled),
    start: settings.election_start || null,
    end: settings.election_end || null,
  };
}
