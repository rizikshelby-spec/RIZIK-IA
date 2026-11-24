/* BACH AI 4.7 — Conversor de Texto & Links
 * Comandos: /linkzap, /maiusculo, /minusculo, /semacento, /inverter, /slug, /base64, /debase64
 */

function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(String(str));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64Utf8(b64) {
  const bin = atob(String(b64).replace(/\s+/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function semAcento(str) {
  return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function paraSlug(str) {
  return semAcento(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function linkZap(entrada) {
  const partes = String(entrada || "").trim().split(/\s+/);
  const telBruto = (partes.shift() || "").replace(/\D/g, "");
  if (telBruto.length < 10 || telBruto.length > 15) {
    return "📱 Informe um número válido com DDD. Ex.: `/linkzap 11999999999 Oi, tudo bem?`";
  }
  const numero = (telBruto.length <= 11 && !telBruto.startsWith("55")) ? "55" + telBruto : telBruto;
  const msg = partes.join(" ").trim();
  const url = "https://wa.me/" + numero + (msg ? "?text=" + encodeURIComponent(msg) : "");
  return "📱 **Link direto do WhatsApp gerado:**\n\n" + url +
    (msg ? "\n\n💬 Mensagem pré-preenchida: “" + msg + "”" : "");
}

function handle(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;

  let m = raw.match(/^\/linkzap(?:\s+([\s\S]+))?$/i);
  if (m) return m[1] ? linkZap(m[1]) : "📱 Use: `/linkzap 11999999999 Mensagem opcional`";

  m = raw.match(/^\/maiuscul[oa](?:\s+([\s\S]+))?$/i);
  if (m) return m[1] ? "🔠 **Maiúsculo:**\n\n" + m[1].toUpperCase() : "Use: `/maiusculo seu texto aqui`";

  m = raw.match(/^\/minuscul[oa](?:\s+([\s\S]+))?$/i);
  if (m) return m[1] ? "🔡 **Minúsculo:**\n\n" + m[1].toLowerCase() : "Use: `/minusculo SEU TEXTO AQUI`";

  m = raw.match(/^\/semacento(?:\s+([\s\S]+))?$/i);
  if (m) return m[1] ? "🔤 **Sem acentos:**\n\n" + semAcento(m[1]) : "Use: `/semacento Coração e Ação`";

  m = raw.match(/^\/inverter(?:\s+([\s\S]+))?$/i);
  if (m) return m[1] ? "🔄 **Invertido:**\n\n" + [...m[1]].reverse().join("") : "Use: `/inverter texto`";

  m = raw.match(/^\/slug(?:\s+([\s\S]+))?$/i);
  if (m) return m[1] ? "🔗 **Slug para URL:**\n\n`" + (paraSlug(m[1]) || "vazio") + "`" : "Use: `/slug Meu Novo Artigo 2026`";

  m = raw.match(/^\/base64(?:\s+([\s\S]+))?$/i);
  if (m) {
    if (!m[1]) return "Use: `/base64 texto para codificar`";
    try {
      return "🔐 **Codificado em Base64:**\n\n`" + toBase64Utf8(m[1]) + "`";
    } catch {
      return "Não consegui codificar esse texto em Base64.";
    }
  }

  m = raw.match(/^\/debase64(?:\s+([\s\S]+))?$/i);
  if (m) {
    if (!m[1]) return "Use: `/debase64 codigo_em_base64`";
    try {
      return "🔓 **Decodificado do Base64:**\n\n" + fromBase64Utf8(m[1]);
    } catch {
      return "❌ Esse código Base64 parece inválido ou incompleto.";
    }
  }

  return null;
}

export const ConversorTexto = { handle, semAcento, paraSlug };
