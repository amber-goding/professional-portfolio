export const DEFAULT_PORT = 3000;
export const HOST = '0.0.0.0';

/**
 * Turn the PORT environment variable into a valid TCP port number.
 * Railway sets PORT in production. Locally it falls back to DEFAULT_PORT.
 * The error message deliberately leaves out the supplied value.
 */
export function parsePort(value) {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_PORT;
  }

  const trimmed = value.trim();
  const port = Number(trimmed);

  if (!/^\d+$/.test(trimmed) || port < 1 || port > 65535) {
    throw new Error('Invalid PORT: expected a whole number from 1 to 65535.');
  }

  return port;
}
