/**
 * Retorna a URL base pública oficial para compartilhamento de links com clientes.
 * Se o sistema estiver rodando em localhost, IP local ou porta de desenvolvimento,
 * força o domínio oficial https://www.danielvale.com.br para que links e cards do WhatsApp
 * sempre funcionem para clientes externos.
 */
export function getPublicOrigin(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.endsWith('.local')
    ) {
      return 'https://www.danielvale.com.br';
    }
    return window.location.origin;
  }
  return 'https://www.danielvale.com.br';
}

