type LogLevel = "info" | "error";

type LogFields = Record<string, string | number | boolean | null | undefined>;

function write(level: LogLevel, event: string, fields: LogFields = {}) {
  const payload = JSON.stringify({
    level,
    event,
    at: new Date().toISOString(),
    ...fields,
  });
  if (level === "error") console.error(payload);
  else console.info(payload);
}

export function logRouteInfo(event: string, fields?: LogFields) {
  write("info", event, fields);
}

export function logRouteError(event: string, fields?: LogFields) {
  write("error", event, fields);
}
