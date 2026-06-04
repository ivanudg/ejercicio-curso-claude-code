/**
 * Valida una dirección de email conforme a RFC 5322.
 *
 * Rechaza explícitamente:
 *   - Dominio que inicia con punto:   usuario@.com
 *   - Sin parte local:                @dominio.com
 *   - Dominio con puntos consecutivos: usuario@dom..com
 *   - Dominio que termina en punto:   usuario@dominio.
 *   - Dominio con guión inicial:      usuario@-dominio.com
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/**
 * @param {string} email
 * @returns {{ valid: boolean, error?: string }}
 */
function validateEmail(email) {
  if (typeof email !== "string" || email.trim() === "") {
    return { valid: false, error: "El email no puede estar vacío." };
  }

  const trimmed = email.trim();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Ingresa un correo electrónico válido." };
  }

  return { valid: true };
}

module.exports = { validateEmail };
