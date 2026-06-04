const { validateEmail } = require("./emailValidator");

describe("validateEmail", () => {
  describe("emails inválidos — deben ser rechazados", () => {
    const invalidCases = [
      ["dominio inicia con punto", "usuario@.com"],
      ["sin parte local", "@dominio.com"],
      ["dominio termina en punto", "usuario@dominio."],
      ["puntos consecutivos en dominio", "usuario@dom..com"],
      ["dominio inicia con guión", "usuario@-dominio.com"],
      ["sin arroba", "usuariodominio.com"],
      ["email vacío", ""],
      ["solo espacios", "   "],
      ["dos arrobas", "usuario@@dominio.com"],
    ];

    test.each(invalidCases)("%s: %s", (_desc, email) => {
      const result = validateEmail(email);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("emails válidos — deben ser aceptados", () => {
    const validCases = [
      ["formato estándar", "usuario@dominio.com"],
      ["subdominio", "nombre@sub.dominio.org"],
      ["con punto en parte local", "nombre.apellido@dominio.com"],
      ["con guión en dominio", "usuario@mi-dominio.com"],
      ["TLD largo", "usuario@dominio.technology"],
      ["mayúsculas", "Usuario@Dominio.COM"],
    ];

    test.each(validCases)("%s: %s", (_desc, email) => {
      const result = validateEmail(email);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
