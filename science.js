/* BACH AI 4.0 — calculadora de fórmulas de física introdutória.
 * Comandos:
 * /fisica velocidade 100 2
 * /fisica forca 10 2
 * /fisica densidade 100 20
 */

function fmt(n) {
  return Number(n.toPrecision(8)).toLocaleString("pt-BR", {
    maximumFractionDigits: 6
  });
}

function handle(text) {
  const m = String(text || "").trim().match(
    /^\/fisica\s+(velocidade|forca|força|densidade|energia-cinetica|energia cinetica)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)$/i
  );

  if (!m) return null;

  const kind = m[1]
    .toLowerCase()
    .replace("ç", "c")
    .replace(" ", "-");

  const a = Number(m[2].replace(",", "."));
  const b = Number(m[3].replace(",", "."));

  if (!(a >= 0) || !(b > 0)) {
    return "Use valores não negativos e divisor maior que zero.";
  }

  if (kind === "velocidade") {
    return "⚙️ Velocidade média = distância ÷ tempo\n" +
      fmt(a) + " ÷ " + fmt(b) +
      " = " + fmt(a / b) +
      " unidades de distância por unidade de tempo.";
  }

  if (kind === "forca") {
    return "⚙️ Segunda lei de Newton: F = m × a\n" +
      fmt(a) + " × " + fmt(b) +
      " = " + fmt(a * b) +
      " N (se a massa estiver em kg e a aceleração em m/s²).";
  }

  if (kind === "densidade") {
    return "⚙️ Densidade = massa ÷ volume\n" +
      fmt(a) + " ÷ " + fmt(b) +
      " = " + fmt(a / b) +
      " unidades de massa por unidade de volume.";
  }

  const energy = 0.5 * a * b * b;

  return "⚙️ Energia cinética = ½ × massa × velocidade²\n" +
    "½ × " + fmt(a) + " × " + fmt(b) +
    "² = " + fmt(energy) +
    " J (se kg e m/s).";
}

export const Science = { handle };
