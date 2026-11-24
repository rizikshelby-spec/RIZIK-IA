/* BACH AI 4.7 — Saúde & Bem-Estar Educacional
 * Comandos: /imc, /agua, /calorias, /respiracao, /pausa
 * Apenas cálculos educativos; não substitui profissional de saúde.
 */

const AVISO = "\n\nℹ️ Cálculo educativo estimado; não substitui avaliação médica ou nutricional.";

function calcularIMC(pesoRaw, altRaw) {
  const peso = Number(String(pesoRaw).replace(",", "."));
  let alt = Number(String(altRaw).replace(",", "."));
  if (alt > 3) alt = alt / 100;

  if (!(peso > 10 && peso < 400) || !(alt > 0.5 && alt < 2.6)) {
    return "Confira os valores. Ex.: `/imc 70 1.75` ou `/imc 70 175`.";
  }

  const imc = peso / (alt * alt);
  let faixa = "Obesidade grau III";
  if (imc < 18.5) faixa = "Abaixo do peso";
  else if (imc < 25) faixa = "Peso adequado (eutrófico)";
  else if (imc < 30) faixa = "Sobrepeso";
  else if (imc < 35) faixa = "Obesidade grau I";
  else if (imc < 40) faixa = "Obesidade grau II";

  return "⚖️ **Cálculo de IMC:**\n" +
    "• Peso: " + peso.toLocaleString("pt-BR") + " kg • Altura: " + alt.toFixed(2).replace(".", ",") + " m\n" +
    "• **IMC:** " + imc.toFixed(1).replace(".", ",") + " kg/m²\n" +
    "• **Classificação (OMS adultos):** " + faixa + AVISO;
}

function calcularAgua(pesoRaw) {
  const peso = Number(String(pesoRaw).replace(",", "."));
  if (!(peso > 10 && peso < 350)) {
    return "Informe seu peso em kg. Ex.: `/agua 70`";
  }
  const ml = Math.round(peso * 35);
  const litros = (ml / 1000).toFixed(2).replace(".", ",");
  const copos = Math.round(ml / 250);
  return "💧 **Meta diária estimada de água (35 ml/kg):**\n" +
    "• Para **" + peso + " kg**: cerca de **" + litros + " litros** (" + ml + " ml)\n" +
    "• Equivale a cerca de **" + copos + " copos** de 250 ml ao longo do dia." + AVISO;
}

function calcularCalorias(pesoRaw, altRaw, idadeRaw, sexoRaw, nivelRaw = "leve") {
  const peso = Number(String(pesoRaw).replace(",", "."));
  let altCm = Number(String(altRaw).replace(",", "."));
  if (altCm <= 3) altCm = altCm * 100;
  const idade = Number(idadeRaw);
  const s = String(sexoRaw || "").toLowerCase();
  const ehMasc = /^m/.test(s) || /^h/.test(s);

  if (!(peso > 15 && peso < 350) || !(altCm > 80 && altCm < 250) || !(idade >= 10 && idade <= 110)) {
    return "Use: `/calorias peso altura idade m|f [sedentario|leve|moderado|intenso]`\nEx.: `/calorias 70 1.75 25 m leve`";
  }

  const tmb = 10 * peso + 6.25 * altCm - 5 * idade + (ehMasc ? 5 : -161);
  const fatores = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725 };
  const niv = String(nivelRaw || "leve").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const fat = fatores[niv] || 1.375;
  const gasto = Math.round(tmb * fat);

  return "🔥 **Estimativa Calórica Diária (Mifflin-St Jeor):**\n" +
    "• Taxa Metabólica Basal (repouso): ~**" + Math.round(tmb) + " kcal/dia**\n" +
    "• Gasto total estimado (nível `" + (fatores[niv] ? niv : "leve") + "`): ~**" + gasto + " kcal/dia**" + AVISO;
}

function handle(text) {
  const raw = String(text || "").trim();

  if (/^\/imc\s*$/i.test(raw)) return "Use: `/imc peso altura` (ex.: `/imc 70 1.75`).";
  let m = raw.match(/^\/imc\s+(\d+(?:[.,]\d+)?)\s*(?:kg)?\s+(\d+(?:[.,]\d+)?)\s*(?:m|cm)?$/i);
  if (m) return calcularIMC(m[1], m[2]);

  if (/^\/agua\s*$/i.test(raw)) return "Use: `/agua peso` (ex.: `/agua 70`).";
  m = raw.match(/^\/agua\s+(\d+(?:[.,]\d+)?)\s*(?:kg)?$/i);
  if (m) return calcularAgua(m[1]);

  if (/^\/calorias\s*$/i.test(raw)) {
    return "Use: `/calorias peso altura idade m|f [sedentario|leve|moderado|intenso]`\nEx.: `/calorias 70 1.75 25 m leve`";
  }
  m = raw.match(/^\/calorias\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s+(\d{1,3})\s+([mfh]\w*)(?:\s+(\w+))?$/i);
  if (m) return calcularCalorias(m[1], m[2], m[3], m[4], m[5]);

  if (/^\/?(?:respiracao|respira[çc][aã]o|guia de respira[çc][aã]o)$/i.test(raw)) {
    return "🌬️ **Guia de Respiração 4-7-8 (para acalmar e focar):**\n\n" +
      "1. Solte todo o ar pela boca suavemente.\n" +
      "2. **Inspire** pelo nariz contando até **4 segundos**.\n" +
      "3. **Segure** o ar nos pulmões por **7 segundos**.\n" +
      "4. **Expire** devagar pela boca por **8 segundos**.\n\n" +
      "🔁 Repita esse ciclo 4 vezes mantendo os ombros relaxados.";
  }

  if (/^\/?(?:pausa|pausa ativa|alongamento)$/i.test(raw)) {
    return "🧘 **Pausa Ativa de 2 Minutos (para quem estuda ou programa):**\n\n" +
      "• **Olhos (20-20-20):** olhe para algo a ~6 metros de distância por 20 segundos.\n" +
      "• **Pescoço e ombros:** gire os ombros para trás 10 vezes devagar.\n" +
      "• **Punhos e mãos:** estique o braço e puxe levemente os dedos para trás por 15s cada lado.\n" +
      "• **Hidratação:** levante-se e tome um copo de água!";
  }

  return null;
}

export const SaudeBemEstar = { handle };
