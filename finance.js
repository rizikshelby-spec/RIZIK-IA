/* BACH AI 4.0 — juros simples e compostos.
 * Comando: /juros simples 1000 2 12
 * Significa: capital 1000, taxa 2% por período, 12 períodos.
 */

function fmt(v) {
  return Number(v.toFixed(2)).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function handle(text) {
  const raw = String(text || "").trim();

  const m = raw.match(
    /^\/juros\s+(simples|compostos)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s+(\d{1,4})$/i
  );

  if (!m) return null;

  const type = m[1].toLowerCase();
  const capital = Number(m[2].replace(",", "."));
  const rate = Number(m[3].replace(",", ".")) / 100;
  const periods = Number(m[4]);

  if (
    !(capital > 0) ||
    rate < 0 ||
    periods < 1 ||
    periods > 1000 ||
    rate > 10
  ) {
    return "Confira os valores. Use capital maior que zero, taxa de 0 a 1000% e até 1000 períodos.";
  }

  const amount = type === "simples"
    ? capital * (1 + rate * periods)
    : capital * Math.pow(1 + rate, periods);

  const interest = amount - capital;

  return "💰 JUROS " + type.toUpperCase() +

    "\nCapital: " + fmt(capital) +

    "\nTaxa por período: " +
    (rate * 100).toLocaleString("pt-BR") + "%" +

    "\nPeríodos: " + periods +

    "\nJuros: " + fmt(interest) +

    "\nMontante final: " + fmt(amount) +

    "\n\nAtenção: o resultado pressupõe que a taxa se aplica em cada período e não inclui tarifas, impostos ou parcelas.";
}

export const Finance = { handle };
