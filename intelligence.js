/* BACH AI 4.1 — inteligência e raciocínio aritmético local
 * Calculadora segura: parser próprio, sem eval() ou Function().
 * Corrigida para não bloquear perguntas normais, jogos nem conversão de unidades.
 */

function parseExpression(expression) {
  if (typeof expression !== "string" || expression.length > 120) {
    throw new Error("A expressão é vazia ou longa demais.");
  }

  const source = expression
    .replace(/,/g, ".")
    .replace(/(\d+(?:\.\d+)?)\s*%\s*de\s*(\d+(?:\.\d+)?)/gi, "(($1/100)*$2)")
    .replace(/[×x]/gi, "*")
    .replace(/÷/g, "/")
    .replace(/(\d+(?:\.\d+)?)\s*%/g, "($1/100)")
    .replace(/\s+/g, "");

  if (!source || !/^[0-9.+*/^()\-]+$/.test(source)) {
    throw new Error("Use números, parênteses e +, -, ×, ÷, ^ ou %.");
  }

  const tokens = source.match(/\d+(?:\.\d+)?|[()+\-*/^]/g) || [];

  if (tokens.join("") !== source) {
    throw new Error("Não consegui interpretar a expressão.");
  }

  if (tokens.length > 60) {
    throw new Error("A expressão tem operações demais.");
  }

  let index = 0;

  const peek = () => tokens[index];
  const take = () => tokens[index++];

  function primary() {
    const token = take();

    if (token === "(") {
      const value = addition();

      if (take() !== ")") {
        throw new Error("Faltou fechar um parêntese.");
      }

      return value;
    }

    if (token === undefined || !/^\d+(?:\.\d+)?$/.test(token)) {
      throw new Error("Esperava um número ou parêntese.");
    }

    return Number(token);
  }

  function power() {
    const base = primary();

    if (peek() === "^") {
      take();

      const exponent = unary();

      if (Math.abs(exponent) > 100) {
        throw new Error("Expoente muito grande.");
      }

      return Math.pow(base, exponent);
    }

    return base;
  }

  function unary() {
    if (peek() === "+") {
      take();
      return unary();
    }

    if (peek() === "-") {
      take();
      return -unary();
    }

    return power();
  }

  function multiplication() {
    let value = unary();

    while (peek() === "*" || peek() === "/") {
      const op = take();
      const right = unary();

      if (op === "/" && right === 0) {
        throw new Error("Não é possível dividir por zero.");
      }

      value = op === "*" ? value * right : value / right;
    }

    return value;
  }

  function addition() {
    let value = multiplication();

    while (peek() === "+" || peek() === "-") {
      const op = take();
      const right = multiplication();

      value = op === "+" ? value + right : value - right;
    }

    return value;
  }

  const result = addition();

  if (index !== tokens.length) {
    throw new Error("Há símbolos sobrando na expressão.");
  }

  if (!Number.isFinite(result) || Math.abs(result) > 1e15) {
    throw new Error("O resultado ficou fora do limite seguro.");
  }

  return Number(result.toPrecision(12));
}

function formatNumber(value) {
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 10
  });
}

function handle(text) {
  const raw = String(text || "").trim();

  const explicitCmd = raw.match(/^\/(?:calc|calcular)\s*:?\s*(.+)$/i);
  const naturalCmd = raw.match(/^(?:calcule|calcular|resolva|resolver|quanto\s+(?:é|e))\s*:?\s*(.+)$/i);

  let expression = explicitCmd
    ? explicitCmd[1].trim()
    : naturalCmd
      ? naturalCmd[1].trim()
      : null;

  const isBareMath =
    !expression &&
    /^[\d\s()+\-*/^×÷x%,.?]+$/.test(raw) &&
    /\d/.test(raw) &&
    /[+\-*/^×÷%]/.test(raw);

  if (isBareMath) {
    expression = raw;
  }

  if (!expression) return null;

  expression = expression.replace(/[?!.]+$/, "").trim();

  try {
    const result = parseExpression(expression);
    return "🔢 " + expression + " = " + formatNumber(result);
  } catch (error) {
    return explicitCmd
      ? "Não consegui calcular: " + error.message
      : null;
  }
}

export const Intelligence = {
  handle,
  calculate: parseExpression
};
