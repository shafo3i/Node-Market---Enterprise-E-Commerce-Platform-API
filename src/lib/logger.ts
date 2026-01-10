interface SafeLogData {
  [key: string]: any;
}

const SENSITIVE_FIELDS = ['password', 'apiKey', 'token', 'secret', 'creditCard'];

export function sanitizeForLog(data: any): SafeLogData {
  if (typeof data !== 'object' || data === null) return data;

  const sanitized: SafeLogData = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLog(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}