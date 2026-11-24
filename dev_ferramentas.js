/* BACH AI 4.7 — Ferramentas para Desenvolvedores Web
 * Comandos: /cor, /vidro, /meta, /paleta
 */

function clamp255(n) {
  return Math.max(0, Math.min(255, Math.round(Number(n) || 0)));
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => clamp255(x).toString(16).padStart(2, "0")).join("").toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return Math.round(h * 360) + "°, " + Math.round(s * 100) + "%, " + Math.round(l * 100) + "%";
}

function converterCor(entrada) {
  const s = String(entrada || "").trim();
  let m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    let hex = m[1];
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return "🎨 **Conversão de Cor:**\n" +
      "• **HEX:** `#" + hex.toUpperCase() + "`\n" +
      "• **RGB:** `rgb(" + r + ", " + g + ", " + b + ")`\n" +
      "• **RGBA (transparente):** `rgba(" + r + ", " + g + ", " + b + ", 0.22)`\n" +
      "• **HSL:** `hsl(" + rgbToHsl(r, g, b) + ")`";
  }

  m = s.match(/^(?:rgba?\s*\(\s*)?(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*[\d.]+)?\s*\)?$/i);
  if (m) {
    const r = clamp255(m[1]), g = clamp255(m[2]), b = clamp255(m[3]);
    const hex = rgbToHex(r, g, b);
    return "🎨 **Conversão de Cor:**\n" +
      "• **RGB:** `rgb(" + r + ", " + g + ", " + b + ")`\n" +
      "• **HEX:** `" + hex + "`\n" +
      "• **RGBA (transparente):** `rgba(" + r + ", " + g + ", " + b + ", 0.22)`\n" +
      "• **HSL:** `hsl(" + rgbToHsl(r, g, b) + ")`";
  }

  return "🎨 Envie uma cor em HEX ou RGB. Ex.: `/cor #8266ff` ou `/cor 130, 102, 255`.";
}

function gerarVidroCSS(cor = "#8266ff") {
  const corValida = /^#[0-9a-f]{3,6}$/i.test(cor.trim()) ? cor.trim() : "#8266ff";
  const css = `.card-vidro {\n` +
    `  background: rgba(255, 255, 255, 0.08);\n` +
    `  backdrop-filter: blur(12px);\n` +
    `  -webkit-backdrop-filter: blur(12px);\n` +
    `  border: 1px solid ${corValida}55;\n` +
    `  border-radius: 16px;\n` +
    `  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);\n` +
    `  padding: 16px;\n` +
    `  color: #ffffff;\n` +
    `}\n\n` +
    `.botao-vidro {\n` +
    `  background: linear-gradient(135deg, ${corValida}, #e056fd);\n` +
    `  border: 0;\n` +
    `  border-radius: 12px;\n` +
    `  padding: 10px 18px;\n` +
    `  color: #fff;\n` +
    `  font-weight: bold;\n` +
    `  cursor: pointer;\n` +
    `  transition: transform 0.2s ease, opacity 0.2s ease;\n` +
    `}\n` +
    `.botao-vidro:hover { transform: translateY(-1px); opacity: 0.92; }`;

  return "🪟 **CSS Vidro Transparente (Glassmorphism) pronto:**\n\n```css\n" + css + "\n```";
}

function gerarMetaTags(entrada) {
  const partes = String(entrada || "").split("|").map(x => x.trim()).filter(Boolean);
  const titulo = (partes[0] || "Meu Site Incrível").replace(/"/g, "&quot;");
  const desc = (partes[1] || "Descrição clara do meu site ou aplicativo web.").replace(/"/g, "&quot;");

  const html = `<meta charset="UTF-8">\n` +
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n` +
    `<meta name="theme-color" content="#0d0e1a">\n` +
    `<title>${titulo}</title>\n` +
    `<meta name="description" content="${desc}">\n` +
    `<meta property="og:type" content="website">\n` +
    `<meta property="og:title" content="${titulo}">\n` +
    `<meta property="og:description" content="${desc}">`;

  return "🏷️ **Tags `<meta>` para SEO e Compartilhamento:**\n\n```html\n" + html + "\n```";
}

const PALETAS = {
  cyberpunk: ["#090716", "#161233", "#00F5D4", "#F15BB5", "#F5F6FF"],
  oceano: ["#07101F", "#10203B", "#2997FF", "#00E5FF", "#EAF4FF"],
  floresta: ["#06150F", "#102B20", "#10D48E", "#7DFF7A", "#ECFDF5"],
  minimal: ["#111318", "#1C1F26", "#E5E7EB", "#60A5FA", "#FFFFFF"],
  fogo: ["#16070B", "#2B1118", "#FF3555", "#FF7C43", "#FFF5F5"]
};

function handle(text) {
  const raw = String(text || "").trim();

  let m = raw.match(/^\/cor(?:\s+([\s\S]+))?$/i);
  if (m) return m[1] ? converterCor(m[1]) : "🎨 Use: `/cor #8266ff` ou `/cor 130, 102, 255`.";

  m = raw.match(/^\/vidro(?:\s+(#[0-9a-f]{3,6}))?$/i);
  if (m) return gerarVidroCSS(m[1] || "#8266ff");

  m = raw.match(/^\/meta(?:\s+([\s\S]+))?$/i);
  if (m) return gerarMetaTags(m[1] || "");

  m = raw.match(/^\/paleta(?:\s+(\w+))?$/i);
  if (m) {
    const k = (m[1] || "cyberpunk").toLowerCase();
    const p = PALETAS[k];
    if (!p) {
      return "🎨 Paletas prontas: " + Object.keys(PALETAS).map(x => "`" + x + "`").join(", ") + ".\nEx.: `/paleta oceano`";
    }
    return "🎨 **Paleta “" + k + "”:**\n" +
      "• Fundo: `" + p[0] + "`\n" +
      "• Cartão/Painel: `" + p[1] + "`\n" +
      "• Destaque 1: `" + p[2] + "`\n" +
      "• Destaque 2: `" + p[3] + "`\n" +
      "• Texto: `" + p[4] + "`";
  }

  return null;
}

export const DevFerramentas = { handle };
