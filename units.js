/* BACH AI 4.0 — conversão local de unidades comuns. */

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

const TEMP = new Set([
  "c", "°c", "celsius",
  "f", "°f", "fahrenheit"
]);

function normalizeUnit(u) {
  const s = String(u).toLowerCase().replace(/\s/g, "");

  if (["°c", "celsius"].includes(s)) return "c";
  if (["°f", "fahrenheit"].includes(s)) return "f";

  return s;
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
    const c = from === "f"
      ? (value - 32) * 5 / 9
      : value;

    return to === "f"
      ? c * 9 / 5 + 32
      : c;
  }

  const a = UNITS[from];
  const b = UNITS[to];

  if (!a || !b || a.group !== b.group) {
    throw new Error("As unidades precisam pertencer à mesma categoria.");
  }

  return value * a.factor / b.factor;
}

function handle(text) {
  const raw = String(text || "").trim();

  const unitPattern =
    "km|m|cm|mm|mi|ft|in|kg|g|mg|t|lb|l|ml|m3|cm3|°c|celsius|°f|fahrenheit|c|f";

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

    return "📏 " + format(amount) + " " + m[2] +
      " = " + format(result) + " " + m[3];
  } catch (error) {
    return "Não consegui converter: " + error.message;
  }
}

export const Units = {
  handle,
  convert
};
