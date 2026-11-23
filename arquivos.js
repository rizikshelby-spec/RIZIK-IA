/* BACH AI - ARQUIVOS 2.0
   Organiza textos em pastas, melhora nitidez de fotos/prints para OCR (modo claro e escuro)
   e lê vídeos sem travar no celular/iOS. */

const KEY = "bach_arquivos_v1";
const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const load = () => { try { const a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a : []; } catch { return []; } };
const save = a => { try { localStorage.setItem(KEY, JSON.stringify(a.slice(-40))); } catch (e) { console.warn(e); } };

function nomeAuto(texto) {
  const c = (String(texto).match(/\/\*([\s\S]*?)\*\//) || [])[1] || texto;
  const n = c.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).slice(0, 4).join("-").toLowerCase();
  return (n || "arquivo").slice(0, 32);
}

function salvar({ nome, pasta, texto = "", resumo = "", tipo = "texto" }) {
  const lista = load();
  let n = nome || nomeAuto(texto), base = n, i = 2;
  while (lista.some(x => norm(x.nome) === norm(n))) n = base + "-" + i++;
  const item = { id: Date.now().toString(36), nome: n, pasta: pasta || "Textos", tipo, texto: String(texto).slice(0, 16000), resumo, em: Date.now() };
  lista.push(item);
  save(lista);
  return item;
}

function achar(termo) {
  const t = norm(termo).trim();
  return load().find(x => norm(x.nome) === t) || load().find(x => norm(x.nome).includes(t));
}

function listar() {
  const lista = load();
  if (!lista.length) return "📁 Você ainda não tem arquivos. Cole um texto grande ou use o botão + para anexar.";
  const pastas = {};
  for (const a of lista) (pastas[a.pasta] = pastas[a.pasta] || []).push(a);
  let out = "📁 MEUS ARQUIVOS (" + lista.length + ")";
  for (const [p, itens] of Object.entries(pastas)) {
    out += "\n\n📂 " + p + " (" + itens.length + ")";
    for (const a of itens) out += "\n  • " + a.nome;
  }
  return out + "\n\nComandos: /abrir nome • /buscar palavra • /apagar nome";
}

function comando(texto) {
  const t = texto.trim();
  if (/^(\/arquivos|meus arquivos)$/i.test(t)) return listar();

  if (/^\/abrir\s*$/i.test(t)) return "Diga o nome do arquivo depois de /abrir. Ex.: /abrir main\nVeja os nomes com /arquivos";
  let m = t.match(/^\/abrir\s+(.+)$/i);
  if (m) {
    const a = achar(m[1]);
    if (!a) return "Não achei esse arquivo. Veja os nomes com /arquivos";
    return "📄 " + a.nome + " (" + a.pasta + ")\n\n" + (a.texto ? a.texto.slice(0, 1800) + (a.texto.length > 1800 ? "\n\n[...]" : "") : a.resumo);
  }

  if (/^\/apagar\s*$/i.test(t)) return "Diga o nome do arquivo depois de /apagar. Ex.: /apagar main\nVeja os nomes com /arquivos";
  m = t.match(/^\/apagar\s+(.+)$/i);
  if (m) {
    const a = achar(m[1]);
    if (!a) return "Não achei esse arquivo.";
    save(load().filter(x => x.id !== a.id));
    return "🗑️ Apaguei: " + a.nome;
  }

  if (/^\/buscar\s*$/i.test(t)) return "Diga a palavra que quer buscar depois de /buscar. Ex.: /buscar codigo";
  m = t.match(/^\/buscar\s+(.+)$/i);
  if (m) {
    const q = norm(m[1]);
    const r = load().filter(x => norm(x.nome + " " + x.texto + " " + x.resumo).includes(q));
    return r.length ? "🔎 Achei em " + r.length + " arquivo(s):\n• " + r.map(x => x.pasta + "/" + x.nome).join("\n• ") : "Não achei “" + m[1] + "” nos seus arquivos.";
  }
  return null;
}

/* ---------- Análise visual e pré-processamento de OCR ---------- */

function nomeCor(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 510;
  if (d < 24) return l > 0.8 ? "branco" : l < 0.2 ? "preto" : "cinza";
  let h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 20 || h >= 340 ? "vermelho" : h < 45 ? "laranja" : h < 70 ? "amarelo" : h < 165 ? "verde" : h < 200 ? "ciano" : h < 260 ? "azul" : h < 300 ? "roxo" : "rosa";
}

function analisarCores(fonte, w, h) {
  if (!w || !h) return "Não foi possível ler o quadro da imagem.";
  const c = document.createElement("canvas");
  c.width = 48; c.height = Math.max(1, Math.round(48 * h / w));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(fonte, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data, cont = {};
  let lum = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const k = nomeCor(d[i], d[i + 1], d[i + 2]);
    cont[k] = (cont[k] || 0) + 1;
    lum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114; n++;
  }
  const top = Object.entries(cont).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
  const b = lum / (n || 1);
  return "Tons predominantes: " + top.join(", ") + ". Iluminação " + (b > 170 ? "clara" : b < 95 ? "escura" : "equilibrada") + ".";
}

function prepararParaOCR(fonte, w, h) {
  const c = document.createElement("canvas");
  const maxDim = Math.max(w, h);
  let escala = 1;
  if (maxDim < 1000) escala = Math.min(2, 1200 / Math.max(1, maxDim));
  else if (maxDim > 1700) escala = 1700 / maxDim;

  c.width = Math.max(1, Math.round(w * escala));
  c.height = Math.max(1, Math.round(h * escala));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(fonte, 0, 0, c.width, c.height);

  const imgData = ctx.getImageData(0, 0, c.width, c.height);
  const d = imgData.data;

  let somaLum = 0;
  const totalPixels = d.length / 4;
  for (let i = 0; i < d.length; i += 4) {
    somaLum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
  }
  const ehEscura = (somaLum / Math.max(1, totalPixels)) < 125;

  // Inverte prints escuros (texto claro em fundo preto -> texto preto em fundo branco) e reforça contraste
  for (let i = 0; i < d.length; i += 4) {
    let g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    if (ehEscura) g = 255 - g;
    g = (g - 128) * 1.45 + 128;
    if (g < 0) g = 0;
    else if (g > 255) g = 255;
    d[i] = d[i + 1] = d[i + 2] = g;
  }
  ctx.putImageData(imgData, 0, 0);
  return { dataUrl: c.toDataURL("image/png"), modoEscuro: ehEscura };
}

function limparTextoOCR(bruto) {
  const linhas = String(bruto || "")
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.replace(/[ \t]+/g, " ").trim())
    .filter(l => {
      if (l.length < 2) return false;
      const alnum = (l.match(/[A-Za-zÀ-ÿ0-9]/g) || []).length;
      return alnum >= 2 && alnum / l.length >= 0.45;
    });
  return linhas.join("\n").trim();
}

async function rodarOCR(fonte, w, h) {
  if (!window.Tesseract || typeof window.Tesseract.recognize !== "function") return "";
  try {
    const prep = prepararParaOCR(fonte, w, h);
    const r = await Promise.race([
      window.Tesseract.recognize(prep.dataUrl, "por", { logger: () => {} }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("tempo esgotado")), 35000))
    ]);
    return limparTextoOCR(r?.data?.text || "");
  } catch (e) {
    console.warn("OCR falhou:", e);
    return "";
  }
}

const fmt = s => !Number.isFinite(s) || s <= 0 ? "desconhecida"
  : s >= 3600 ? Math.floor(s / 3600) + "h " + Math.floor(s % 3600 / 60) + "min"
  : s >= 60 ? Math.floor(s / 60) + "min " + Math.round(s % 60) + "s"
  : s.toFixed(1) + "s";

const orient = (w, h) => !w || !h ? "indefinida" : w > h * 1.1 ? "paisagem (horizontal)" : h > w * 1.1 ? "retrato (vertical)" : "quadrada";

function esperar(el, ev, ms) {
  return new Promise((ok, no) => {
    const t = setTimeout(() => no(new Error("tempo esgotado")), ms);
    el.addEventListener(ev, () => { clearTimeout(t); ok(); }, { once: true });
    el.addEventListener("error", () => { clearTimeout(t); no(new Error("formato não suportado")); }, { once: true });
  });
}

async function lerMidia(file, passo = () => {}) {
  const kb = Math.max(1, Math.round(file.size / 1024));
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const TEXTOS = ["txt", "md", "js", "html", "css", "json", "csv", "py", "xml", "log", "ts", "java", "c", "cpp", "sql", "yml", "yaml"];

  if (file.type.startsWith("image/")) {
    passo("🖼️ Carregando e tratando a nitidez da imagem...");
    const url = URL.createObjectURL(file);
    const img = new Image(); img.src = url;
    try {
      await esperar(img, "load", 15000);
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }

    const w = img.naturalWidth, h = img.naturalHeight;
    passo("🎨 Analisando cores e iluminação...");
    const infoCor = analisarCores(img, w, h);

    passo("🔎 Lendo textos na imagem...");
    const textoLido = await rodarOCR(img, w, h);
    const temTexto = textoLido.length > 2;

    return {
      tipo: "imagem",
      pasta: "Imagens",
      preview: { url, kind: "img" },
      resumo: "🖼️ Imagem " + w + "×" + h + " (" + orient(w, h) + "), " + kb + " KB.\n" + infoCor +
        (temTexto
          ? "\n\n📝 Texto que consegui ler na imagem:\n“" + textoLido.slice(0, 1500) + (textoLido.length > 1500 ? "…" : "") + "”"
          : "\n\nℹ️ Não encontrei texto legível nessa foto (pode ser uma imagem apenas visual ou com texto muito pequeno/borrado).")
    };
  }

  if (file.type.startsWith("video/")) {
    passo("🎬 Abrindo o vídeo...");
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
    try {
      await esperar(v, "loadeddata", 15000);
    } catch {
      try { await esperar(v, "loadedmetadata", 5000); }
      catch (e) { URL.revokeObjectURL(url); throw e; }
    }

    const w = v.videoWidth || 0;
    const h = v.videoHeight || 0;
    let cores = "";
    let textoFrame = "";

    if (w > 0 && h > 0) {
      try {
        passo("🎞️ Analisando quadros do vídeo...");
        if (Number.isFinite(v.duration) && v.duration > 1.5) {
          v.currentTime = Math.min(1.5, v.duration / 2);
          await Promise.race([
            new Promise(ok => v.addEventListener("seeked", ok, { once: true })),
            new Promise(ok => setTimeout(ok, 3500))
          ]);
        }
        cores = "\n" + analisarCores(v, w, h);
        textoFrame = await rodarOCR(v, w, h);
      } catch (e) {
        console.warn("Frame de vídeo:", e);
      }
    }

    return {
      tipo: "video",
      pasta: "Vídeos",
      preview: { url, kind: "video" },
      resumo: "🎬 Vídeo " + (w && h ? w + "×" + h + " (" + orient(w, h) + "), " : "") +
        "duração " + fmt(v.duration) + ", " + (kb > 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB") + "." +
        cores +
        (textoFrame.length > 4
          ? "\n\n📝 Texto visível no quadro do vídeo:\n“" + textoFrame.slice(0, 800) + "”"
          : "")
    };
  }

  if (file.type.startsWith("text/") || TEXTOS.includes(ext)) {
    passo("📄 Lendo o texto do arquivo...");
    return { tipo: "texto", texto: (await file.text()).slice(0, 200000) };
  }

  throw new Error("Esse formato (" + (ext || file.type || "desconhecido") + ") eu ainda não leio. Aceito fotos, vídeos e arquivos de texto/código.");
}

export const Arquivos = { salvar, comando, listar, lerMidia };
