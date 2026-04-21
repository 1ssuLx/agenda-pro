const TZ = "America/Sao_Paulo";

function toDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toDate(date));
}

export function formatDateTime(date: Date | string): string {
  const d = toDate(date);
  const data = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const hora = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${data} às ${hora}`;
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(toDate(date));
}

export function toUTC(dateStr: string, timeStr: string): Date {
  // Interpreta o input como horário local de São Paulo e converte para UTC.
  // Usa a API Temporal via Intl para descobrir o offset correto no instante dado
  // (lida automaticamente com horário de verão).
  const isoLocal = `${dateStr}T${timeStr}:00`;

  // Cria um Date a partir do ISO local sem timezone (tratado como UTC pelo motor JS),
  // depois calcula o offset de SP naquele instante para corrigir.
  const naiveUtc = new Date(isoLocal + "Z");

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Lê o que o clock local de SP mostraria naquele instante UTC
  const parts = Object.fromEntries(
    formatter.formatToParts(naiveUtc).map(({ type, value }) => [type, value])
  );
  const spAsUtc = new Date(
    `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`
  );

  // O offset é a diferença entre o naive UTC e o que SP lê naquele momento
  const offsetMs = naiveUtc.getTime() - spAsUtc.getTime();
  return new Date(naiveUtc.getTime() + offsetMs);
}
