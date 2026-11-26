
/* BACH AI 5.4 — ARQUIVOS 3.0 (IndexedDB Ilimitado + RAG BM25 Local + OCR Blindado)
 * - Guarda textos/códigos completos (até 500 KB por arquivo, 200 arquivos) no IndexedDB.
 * - Mantém espelho compatível no localStorage para /pastas, /mover e /basedados.
 * - Inclui busca semântica por trechos (/rag pergunta) 100% própria em JS.
 * - Preserva proteção contra SVG ativo, limites de mídia e Prototype Pollution.
 */

const KEY = "bach_arquivos_v1";
const DB_NAME = "bach_rag_db_v1";
const STORE_NAME = "arquivos";
const PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);

const MAX_TEXTO_BYTES = 5 * 1024 * 1024;
const MAX_IMAGEM_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 120 * 1024 * 1024;
const MAX_ARQUIVO_CHARS = 500000;
const MAX_ITENS_IDB = 200;

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const normNome = t => norm(t).replace(/[-_./]+/g, " ").replace(/\s+/g, " ").trim();

const STOP_RAG = new Set(
  ("a o as os um uma uns umas de do da dos das em no na nos nas por para pra com sem que e eh se ao aos mais menos como mas foi ser ou ja tambem seu sua seus suas isso isto este esta esse essa sao tem meu minha eu vc voce qual quais quem onde quando porque pq oq").split(" ")
);

const stemPt = w => {
  if (w.length <= 4) return w;
  return w.replace(/(coes|oes|aes)$/, "ao").replace(/(ando|endo|indo|mente)$/, "").replace(/s$/, "");
};

const tokensRag = t => norm(t)
  .split(/[^a-z0-9]+/)
  .filter(w => (w.length >= 2 || /^\d+$/.test(w)) && !STOP_RAG.has(w))
  .map(stemPt);

function limparRotulo(val, fallback, maxLen = 60) {
  const s = String(val || "").replace(/[\x00-\x1f\r\n]/g, " ").trim().slice(0, maxLen);
  if (!s || PROIBIDAS.has(s.toLowerCase())) return fallback;
  return s;
}

function loadLS() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

function saveLS(lista) {
  try {
    // Espelho compacto no localStorage (últimos 40 arquivos com prévia de até 4 KB)
    const compacto = lista.slice(-40).map(x => ({
      id: x.id,
      nome: x.nome,
      pasta: x.pasta,
      tipo: x.tipo,
      texto: String(x.texto || "").slice(0, 4000),
      resumo: String(x.resumo || "").slice(0, 400),
      tamanho: x.tamanho || String(x.texto || "").length,
      em: x.em
    }));
    localStorage.setItem(KEY, JSON.stringify(compacto));
  } catch (e) {
    console.warn("LS arquivos:", e);
  }
}

let cacheMemoria = loadLS();
let idbDisponivel = false;
let dbPromise = null;

function abrirDB() {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === "undefined") {
    dbPromise = Promise.resolve(null);
    return dbPromise;
  }
  dbPromise = new Promise(resolve => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      req.onsuccess = () => {
        idbDisponivel = true;
        resolve(req.result);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idbPut(item) {
  const db = await abrirDB();
  if (!db) return;
  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(item);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbDelete(id) {
  const db = await abrirDB();
  if (!db) return;
  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function sincronizarCacheInicial() {
  const db = await abrirDB();
  if (!db) return;
  try {
    const itensIdb = await new Promise(resolve => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => resolve([]);
    });

    const mapa = new Map();
    for (const x of loadLS()) if (x?.id) mapa.set(x.id, x);
    for (const x of itensIdb) if (x?.id) mapa.set(x.id, x);

    const mesclado = [...mapa.values()]
      .sort((a, b) => (a.em || 0) - (b.em || 0))
      .slice(-MAX_ITENS_IDB);

    cacheMemoria = mesclado;
    saveLS(mesclado);

    // Migra itens que só estavam no localStorage para o IndexedDB
    const idsIdb = new Set(itensIdb.map(x => x.id));
    for (const item of mesclado) {
      if (!idsIdb.has(item.id)) idbPut(item);
    }
  } catch (e) {
    console.warn("IDB sync:", e);
  }
}

sincronizarCacheInicial();

function obterTodos() {
  // Sincroniza eventuais alterações externas de pasta feitas por mente.js no localStorage
  const ls = loadLS();
  if (ls.length) {
    const mapaLs = new Map(ls.map(x => [x.id, x]));
    cacheMemoria = cacheMemoria.map(item => {
      const l = mapaLs.get(item.id);
      return l && l.pasta !== item.pasta ? { ...item, pasta: l.pasta } : item;
    });
  }
  return cacheMemoria;
}

function nomeAuto(texto) {
  const c = (String(texto).match(/\/\*([\s\S]*?)\*\//) || [])[1] || texto;
  const n = c.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).slice(0, 4).join("-").toLowerCase();
  const limpo = (n || "arquivo").slice(0, 32);
  return PROIBIDAS.has(limpo) ? "arquivo" : limpo;
}

function salvar({ nome, pasta, texto = "", resumo = "", tipo = "texto" }) {
  const lista = [...obterTodos()];
  let n = limparRotulo(nome, nomeAuto(texto), 60), base = n, i = 2;
  while (lista.some(x => norm(x.nome) === norm(n))) n = base + "-" + i++;
  const pastaSegura = limparRotulo(pasta, "Textos", 60);
  const textoCheio = String(texto || "").slice(0, MAX_ARQUIVO_CHARS);

  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: n,
    pasta: pastaSegura,
    tipo: limparRotulo(tipo, "texto", 20),
    texto: textoCheio,
    resumo: String(resumo || "").slice(0, 500),
    tamanho: textoCheio.length,
    em: Date.now()
  };

  lista.push(item);
  while (lista.length > MAX_ITENS_IDB) {
    const rem = lista.shift();
    if (rem?.id) idbDelete(rem.id);
  }

  cacheMemoria = lista;
  saveLS(lista);
  idbPut(item);
  return item;
}

function achar(termo) {
  const t = normNome(termo);
  if (!t) return null;
  const lista = obterTodos();
  return lista.find(x => normNome(x.nome) === t) ||
    lista.find(x => normNome(x.nome).includes(t)) ||
    lista.find(x => t.includes(normNome(x.nome)));
}

function listar() {
  const lista = obterTodos();
  if (!lista.length) return "📁 Você ainda não tem arquivos. Cole um texto grande ou use o botão + para anexar.";
  const pastas = Object.create(null);
  for (const a of lista) {
    const p = limparRotulo(a?.pasta, "Textos", 60);
    if (!pastas[p]) pastas[p] = [];
    pastas[p].push(a);
  }
  let out = "📁 MEUS ARQUIVOS (" + lista.length + (idbDisponivel ? " • IndexedDB ativo" : "") + ")";
  for (const p of Object.keys(pastas)) {
    const itens = pastas[p];
    out += "\n\n📂 " + p + " (" + itens.length + ")";
    for (const a of itens) {
      const kb = a.tamanho ? " (" + Math.max(1, Math.round(a.tamanho / 1024)) + " KB)" : "";
      out += "\n  • " + a.nome + kb;
    }
  }
  return out + "\n\nComandos: /abrir nome • /buscar palavra • /rag pergunta • /apagar nome";
}

/* ---------- Motor RAG Local (BM25 por trechos) ---------- */

function quebrarEmTrechos(texto, tam = 520, overlap = 100) {
  const s = String(texto || "").trim();
  if (!s) return [];
  if (s.length <= tam) return [s];

  const blocos = [];
  let pos = 0;
  while (pos < s.length && blocos.length < 180) {
    let fim = Math.min(s.length, pos + tam);
    if (fim < s.length) {
      const quebra = Math.max(s.lastIndexOf("\n", fim), s.lastIndexOf(". ", fim));
      if (quebra > pos + 180) fim = quebra + 1;
    }
    const trecho = s.slice(pos, fim).trim();
    if (trecho) blocos.push(trecho);
    if (fim >= s.length) break;
    pos = Math.max(pos + 120, fim - overlap);
  }
  return blocos;
}

function buscarRAG(pergunta, limite = 3) {
  const qTokens = tokensRag(pergunta);
  if (!qTokens.length) return [];

  const qSet = new Set(qTokens);
  const lista = obterTodos();
  const docs = [];

  for (const arq of lista) {
    const fonte = String(arq.texto || arq.resumo || "");
    if (!fonte.trim()) continue;
    const trechos = quebrarEmTrechos(fonte);
    const nomeToks = new Set(tokensRag(arq.nome));

    trechos.forEach((trecho, idx) => {
      const toks = tokensRag(trecho);
      if (!toks.length) return;
      const tf = Object.create(null);
      for (const w of toks) tf[w] = (tf[w] || 0) + 1;
      docs.push({
        arquivo: arq.nome,
        pasta: arq.pasta,
        trecho,
        idx,
        toks,
        len: toks.length,
        tf,
        nomeToks
      });
    });
  }

  if (!docs.length) return [];

  const N = docs.length;
  const avgLen = docs.reduce((a, d) => a + d.len, 0) / N || 1;
  const df = Object.create(null);
  for (const w of qSet) {
    let c = 0;
    for (const d of docs) if (d.tf[w] || d.nomeToks.has(w)) c++;
    df[w] = c;
  }

  const k1 = 1.4, b = 0.75;
  const ranqueado = [];

  for (const d of docs) {
    let score = 0;
    let acertos = 0;
    for (const w of qSet) {
      const f = (d.tf[w] || 0) + (d.nomeToks.has(w) ? 1.5 : 0);
      if (!f) continue;
      acertos++;
      const idf = Math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * (d.len / avgLen))));
    }
    if (score > 0 && (qSet.size === 1 || acertos >= Math.min(2, qSet.size))) {
      ranqueado.push({
        arquivo: d.arquivo,
        pasta: d.pasta,
        trecho: d.trecho,
        score: Number(score.toFixed(2)),
        acertos
      });
    }
  }

  return ranqueado.sort((a, b2) => b2.score - a.score).slice(0, limite);
}

function comando(texto) {
  const t = String(texto || "").trim();
  if (/^(\/arquivos|meus arquivos)$/i.test(t)) return listar();

  if (/^\/abrir\s*$/i.test(t)) return "Diga o nome do arquivo depois de /abrir. Ex.: /abrir main\nVeja os nomes com /arquivos";
  let m = t.match(/^\/abrir\s+(.+)$/i);
  if (m) {
    const a = achar(m[1]);
    if (!a) return "Não achei esse arquivo. Veja os nomes com /arquivos";
    return "📄 " + a.nome + " (" + a.pasta + " • " + (a.texto?.length || 0) + " chars)\n\n" +
      (a.texto ? a.texto.slice(0, 3200) + (a.texto.length > 3200 ? "\n\n[... use /rag pergunta para consultar partes específicas]" : "") : a.resumo);
  }

  if (/^\/(apagar|excluir)\s*$/i.test(t)) return "Diga o nome do arquivo depois de /apagar. Ex.: /apagar pesquisa filme\nVeja os nomes com /arquivos";
  m = t.match(/^\/(?:apagar|excluir)\s+(.+)$/i);
  if (m) {
    const q = m[1].trim();
    const a = achar(q);
    if (!a) return "Não achei “" + q + "”. Veja os nomes exatos com `/arquivos`.";
    cacheMemoria = obterTodos().filter(x => x.id !== a.id);
    saveLS(cacheMemoria);
    idbDelete(a.id);
    return "🗑️ Apaguei: " + a.nome;
  }

  if (/^\/buscar\s*$/i.test(t)) return "Diga a palavra que quer buscar depois de /buscar. Ex.: /buscar codigo";
  m = t.match(/^\/buscar\s+(.+)$/i);
  if (m) {
    const q = norm(m[1]);
    const r = obterTodos().filter(x => norm(x.nome + " " + x.texto + " " + x.resumo).includes(q));
    return r.length ? "🔎 Achei em " + r.length + " arquivo(s):\n• " + r.map(x => x.pasta + "/" + x.nome).join("\n• ") : "Não achei “" + m[1] + "” nos seus arquivos.";
  }

  if (/^\/rag\s*$/i.test(t)) return "🔎 Use `/rag sua pergunta` para pesquisar por significado dentro de todos os documentos salvos.";
  m = t.match(/^\/rag\s+([\s\S]+)$/i);
  if (m) {
    const hits = buscarRAG(m[1], 3);
    if (!hits.length) return "🔎 Não encontrei trechos relacionados a “" + m[1].trim() + "” nos seus arquivos guardados.";
    return "📚 **Trechos mais relevantes nos seus arquivos (RAG local):**\n\n" +
      hits.map((h, i) => (i + 1) + ". **" + h.pasta + "/" + h.arquivo + "** (relevância " + h.score + ")\n“" + h.trecho.slice(0, 480) + "”").join("\n\n");
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
  const TEXTOS = ["txt", "md", "js", "html", "css", "json", "csv", "py", "xml", "log", "ts", "java", "c", "cpp", "sql", "yml", "yaml", "svg"];

  if (file.type === "image/svg+xml" || ext === "svg") {
    if (file.size > MAX_TEXTO_BYTES) throw new Error("Arquivo SVG grande demais (limite de 5 MB).");
    passo("📄 Lendo SVG como código-fonte...");
    return { tipo: "texto", texto: (await file.text()).slice(0, MAX_ARQUIVO_CHARS) };
  }

  if (file.type.startsWith("image/")) {
    if (file.size > MAX_IMAGEM_BYTES) throw new Error("Imagem grande demais (limite de 25 MB).");
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
    if (file.size > MAX_VIDEO_BYTES) throw new Error("Vídeo grande demais (limite de 120 MB).");
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
    if (file.size > MAX_TEXTO_BYTES) throw new Error("Arquivo de texto grande demais (limite de 5 MB).");
    passo("📄 Lendo o texto do arquivo...");
    return { tipo: "texto", texto: (await file.text()).slice(0, MAX_ARQUIVO_CHARS) };
  }

  throw new Error("Esse formato (" + (ext || file.type || "desconhecido") + ") eu ainda não leio. Aceito fotos, vídeos e arquivos de texto/código.");
}

export const Arquivos = {
  salvar,
  comando,
  listar,
  lerMidia,
  buscarRAG,
  total: () => obterTodos().length
};

