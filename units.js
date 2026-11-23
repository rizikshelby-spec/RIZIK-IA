/* BACH AI 4.1 — conversão local de unidades comuns.
 * Aceita símbolos (km, m, kg) e nomes completos em português (metros, quilos, litros) + pontuação final.
 */

const UNITS = {
  km: { group: "length", factor: 1000, name: "km" },
  m: { group: "length", factor: 1, name: "m" },
  cm: { group: "length", factor: 0.01, name: "cm" },
  mm: { group: "length", factor: 0.001, name: "mm" },
  mi: { group: "length", factor: 1609.344, name: "milhas" },
  ft: { group: "length", factor: 0.3048, name: "pés" },
  in: { group: "length", factor: 0.0254, name: "polegadas" },

  kg: { group: "mass", factor: 1, name: "kg" },
  g: { group: "mass", factor: 0.001, name: "g" },
  mg: { group: "mass", factor: 0.000001, name: "mg" },
  t: { group: "mass", factor: 1000, name: "toneladas" },
  lb: { group: "mass", factor: 0.45359237, name: "libras" },

  l: { group: "volume", factor: 1, name: "L" },
  ml: { group: "volume", factor: 0.001, name: "mL" },
  m3: { group: "volume", factor: 1000, name: "m³" },
  cm3: { group: "volume", factor: 0.001, name: "cm³" }
};

const ALIASES = {
  quilometro: "km", quilometros: "km",
  metro: "m", metros: "m",
  centimetro: "cm", centimetros: "cm",
  milimetro: "mm", milimetros: "mm",
  milha: "mi", milhas: "mi",
  pe: "ft", pes: "ft",
  polegada: "in", polegadas: "in",
  quilo: "kg", quilos: "kg", quilograma: "kg", quilogramas: "kg",
  grama: "g", gramas: "g",
  miligrama: "mg", miligramas: "mg",
  tonelada: "t", toneladas: "t",
  libra: "lb", libras: "lb",
  litro: "l", litros: "l",
  mililitro: "ml", mililitros: "ml",
  "°c": "c", celsius: "c", "graus celsius": "c", "grau celsius": "c",
  "°f": "f", fahrenheit: "f", "graus fahrenheit": "f", "grau fahrenheit": "f"
};

const TEMP = new Set(["c", "f"]);

function normalizeUnit(u) {
  const s = String(u || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return ALIASES[s] || s.replace(/\s/g, "");
}

function format(value) {
  return Number(value.toPrecision(10)).toLocaleString("pt-BR", {
    maximumFractionDigits: 8
  });
}

function convert(value, fromRaw, toRaw) {
  const from = normalizeUnit(fromRaw);
  const to = normalizeUnit(toRaw);

  if (TEMP.has(from) && TEMP.has(to)) {
    const c = from === "f" ? (value - 32) * 5 / 9 : value;
    return to === "f" ? c * 9 / 5 + 32 : c;
  }

  const a = UNITS[from];
  const b = UNITS[to];

  if (!a || !b || a.group !== b.group) {
    throw new Error("As unidades precisam pertencer à mesma categoria.");
  }

  return value * a.factor / b.factor;
}

function handle(text) {
  const raw = String(text || "").trim().replace(/[?!.]+$/, "").trim();

  const unitPattern =
    "km|quil[oô]metros?|metros?|m|cent[ií]metros?|cm|mil[ií]metros?|mm|milhas?|mi|p[eé]s?|ft|polegadas?|in|" +
    "kg|quilos?|quilogramas?|gramas?|g|miligramas?|mg|toneladas?|t|libras?|lb|" +
    "litros?|l|mililitros?|ml|m3|cm3|graus?\\s+celsius|°c|celsius|graus?\\s+fahrenheit|°f|fahrenheit|c|f";

  const re = new RegExp(
    "^(?:\\/converter\\s+|converta\\s+|converter\\s+|quanto\\s+(?:é|e)\\s+)?(-?\\d+(?:[.,]\\d+)?)\\s*(" +
    unitPattern +
    ")\\s+(?:para|em|to)\\s+(" +
    unitPattern +
    ")$",
    "i"
  );

  const m = raw.match(re);
  if (!m) return null;

  const amount = Number(m[1].replace(",", "."));

  try {
    const result = convert(amount, m[2], m[3]);
    return "📏 " + format(amount) + " " + m[2] + " = " + format(result) + " " + m[3];
  } catch (error) {
    return "Não consegui converter: " + error.message;
  }
}

export const Units = {
  handle,
  convert
};
