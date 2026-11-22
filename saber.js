/* BACH AI - SABER 1.0
   Leitura de textos e código + pesquisa profunda + base de conhecimento.
   Tudo roda no seu navegador, sem IA externa. */

const KB_KEY = "bach_conhecimento_v1";

const STOP = new Set(("a o as os um uma uns umas de do da dos das em no na nos nas por para com sem que e eh se ao aos " +
  "mais menos como mas foi ser ou ja tambem seu sua seus suas isso isto este esta esse essa sao tem ha foram sobre entre " +
  "ate quando muito muitos nao sim me te lhe eu tu ele ela nos vos eles elas meu minha pode podem pelo pela pelos pelas " +
  "era eram sera serao cada outro outra outros outras qual quais onde quem quanto porque").split(" "));

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const tokens = t => norm(t).split(/[^a-z0-9]+/).filter(Boolean);
const kw = t => tokens(t).filter(w => w.length > 3 && !STOP.has(w));

function freq(words) {
  const f = {};
  for (const w of words) f[w] = (f[w] || 0) + 1;
  return f;
}

function topWords(text, n = 8) {
  return Object.entries(freq(kw(text))).sort((a, b) => b[1] - a[1]).slice(0, n).map(x => x[0]);
}

function sentences(text) {
  const t = String(text || "").replace(/\s+/g, " ");
  return (t.match(/[^.!?]+[.!?]+/g) || [t]).map(s => s.trim()).filter(s => s.length >= 40 && s.length <= 420);
}

function best(list, scoreFn, k) {
  return list
    .map((s, i) => ({ s, i, v: scoreFn(s) }))
    .filter(x => x.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, k)
    .sort((a, b) => a.i - b.i)
    .map(x => x.s);
}

function summarize(text, k = 4) {
  const f = freq(kw(text));
  return best(sentences(text), s => {
    const w = kw(s);
    return w.length ? w.reduce((a, x) => a + (f[x] || 0), 0) / Math.sqrt(w.length) : 0;
  }, k);
}

/* ---------- Leitura de código e texto ---------- */

function isCode(text) {
  const hasKeyword = /(\bconst\b|\bfunction\b|=>|\bimport\b|\bexport\b|\breturn\b|\bdef\s+\w+\(|\bclass\s+\w+|<\/?[a-z][^>]*>)/.test(text);
  const symbols = (text.match(/[{};=()<>]/g) || []).length / Math.max(text.length, 1);
  return hasKeyword && symbols > 0.03;
}

function analyzeCode(text) {
  let lang = "código";
  if (/<!doctype|<html|<\/div>/i.test(text)) lang = "HTML";
  else if (/\bdef\s+\w+\(|print\(/.test(text) && !/;\s/.test(text)) lang = "Python";
  else if (/\b(const|let|var|function)\b|=>/.test(text)) lang = "JavaScript";

  const funcs = new Set();
  for (const m of text.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)) funcs.add(m[1]);
  for (const m of text.matchAll(/(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?[^=;(]*\)?\s*=>/g)) funcs.add(m[1]);
  for (const m of text.matchAll(/\bdef\s+([A-Za-z_]\w*)/g)) funcs.add(m[1]);

  const urls = [...new Set(text.match(/https?:\/\/[^\s"'`)<>]+/g) || [])].slice(0, 5);
  const comment = (text.match(/\/\*([\s\S]*?)\*\//) || [])[1];

  const feats = [];
  if (/localStorage/.test(text)) feats.push("guarda dados no navegador (localStorage)");
  if (/fetch\(/.test(text)) feats.push("faz requisições na internet (fetch)");
  if (/\bexport\b/.test(text)) feats.push("exporta um módulo para outros arquivos");
  if (/addEventListener/.test(text)) feats.push("reage a cliques e teclas");
  if (/JSON\.parse|JSON\.stringify/.test(text)) feats.push("converte dados em JSON");
  if (/\.test\(|\.match\(|RegExp/.test(text)) feats.push("usa expressões regulares");

  let out = "📖 Li o texto. Parece " + lang + " (" + text.split(/\s+/).length + " palavras).";
  if (comment) out += "\n\nDescrição no código: " + comment.replace(/\s+/g, " ").trim().slice(0, 220);
  if (funcs.size) out += "\n\nFunções que encontrei (" + funcs.size + "): " + [...funcs].slice(0, 15).join(", ") + (funcs.size > 15 ? "..." : "");
  if (feats.length) out += "\n\nO que ele faz:\n• " + feats.join("\n• ");
  if (urls.length) out += "\n\nEndereços usados:\n• " + urls.join("\n• ");
  return out + "\n\nSe quiser que eu guarde algo disso, use: ensine: pergunta => resposta";
}

function lerTexto(text) {
  if (isCode(text)) return analyzeCode(text);
  const resumo = summarize(text, 4);
  const palavras = text.trim().split(/\s+/).length;
  let out = "📖 Li o texto: " + palavras + " palavras.";
  if (resumo.length) out += "\n\nResumo:\n• " + resumo.join("\n• ");
  const k = topWords(text);
  if (k.length) out += "\n\nAssuntos principais: " + k.join(", ") + ".";
  return out;
}

/* ---------- Pesquisa profunda ---------- */

async function get(url, ms = 20000, json = false) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return json ? await r.json() : await r.text();
  } finally { clearTimeout(t); }
}

async function wiki(q) {
  const p = new URLSearchParams({
    action: "query", generator: "search", gsrsearch: q, gsrlimit: "3",
    prop: "extracts", exintro: "1", explaintext: "1", exsentences: "6",
    format: "json", origin: "*"
  });
  const d = await get("https://pt.wikipedia.org/w/api.php?" + p, 20000, true);
  return Object.values(d?.query?.pages || {})
    .sort((a, b) => a.index - b.index)
    .filter(x => x.extract)
    .map(x => ({
      titulo: x.title, texto: x.extract,
      url: "https://pt.wikipedia.org/wiki/" + encodeURIComponent(x.title.replace(/ /g, "_"))
    }));
}

async function web(q) {
  const txt = await get("https://r.jina.ai/http://html.duckduckgo.com/html/?q=" + encodeURIComponent(q), 25000);
  const out = [], seen = new Set();
  for (const m of txt.matchAll(/^## \[(.*?)\]\((https?:\/\/[^)\s]+)\)/gm)) {
    let link = m[2];
    try {
      const u = new URL(link);
      if (u.hostname.includes("duckduckgo.com")) link = u.searchParams.get("uddg") || link;
    } catch {}
    if (!/^https?:\/\//i.test(link) || seen.has(link) || /duckduckgo\.com/i.test(link)) continue;
    seen.add(link);
    out.push({ titulo: m[1].replace(/<[^>]*>/g, "").trim(), url: link });
    if (out.length >= 5) break;
  }
  return out;
}

function cleanPage(t) {
  return String(t)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_`>|]/g, " ")
    .slice(0, 30000);
}

async function readPage(link, qk) {
  const txt = cleanPage(await get("https://r.jina.ai/" + link.url, 22000));
  return best(sentences(txt), s => {
    const n = new Set(kw(s));
    const hits = qk.filter(w => n.has(w)).length;
    return hits ? hits * 3 + (s.length > 70 && s.length < 300 ? 1 : 0) : 0;
  }, 3);
}

/* ---------- Base de conhecimento ---------- */

function loadKB() {
  try { const k = JSON.parse(localStorage.getItem(KB_KEY)); return Array.isArray(k) ? k : []; }
  catch { return []; }
}

function saveKB(entry) {
  try {
    const kb = loadKB().filter(e => norm(e.q) !== norm(entry.q));
    kb.push(entry);
    localStorage.setItem(KB_KEY, JSON.stringify(kb.slice(-40)));
  } catch (e) { console.warn(e); }
}

function buscarConhecimento(texto) {
  const qk = new Set(kw(texto));
  if (!qk.size) return null;
  let top = null, score = 0;
  for (const e of loadKB()) {
    const ek = new Set(kw(e.q));
    const inter = [...qk].filter(w => ek.has(w)).length;
    const s = inter / qk.size;
    if (s > score) { score = s; top = e; }
  }
  if (!top || score < 0.6) return null;
  return "📚 Do que aprendi pesquisando (“" + top.q + "”):\n\n" + top.resumo.slice(0, 1500) +
    "\n\nPara atualizar: pesquise a fundo sobre " + top.q;
}

async function pesquisaProfunda(q, progresso = () => {}) {
  const qk = kw(q);
  let paginas = [], links = [], lidas = [];

  progresso("Consultando a Wikipédia...");
  try { paginas = await wiki(q); } catch (e) { console.warn("wiki", e); }

  progresso("Buscando na internet...");
  try { links = await web(q); } catch (e) { console.warn("web", e); }

  progresso("Lendo as fontes...");
  const alvo = links.slice(0, 3);
  const res = await Promise.allSettled(alvo.map(l => readPage(l, qk)));
  res.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value.length) lidas.push({ ...alvo[i], frases: r.value });
  });

  if (!paginas.length && !lidas.length) throw new Error("sem resultados");

  let texto = "🔎 PESQUISA A FUNDO: " + q;
  if (paginas.length) {
    texto += "\n\n📚 " + paginas[0].titulo + ":\n" + paginas[0].texto.slice(0, 800);
  }
  for (const l of lidas) {
    texto += "\n\n🌐 " + l.titulo.slice(0, 80) + ":\n• " + l.frases.join("\n• ");
  }
  const todos = paginas.map(p => p.texto).concat(lidas.flatMap(l => l.frases)).join(" ");
  const k = topWords(todos, 8);
  if (k.length) texto += "\n\n🧠 Assuntos relacionados: " + k.join(", ") + ".";
  texto += "\n\nGuardei isso na minha memória. Pergunte de novo depois, sem precisar pesquisar!";

  saveKB({ q, resumo: texto, at: Date.now() });

  const fontes = paginas.slice(0, 2).map(p => ({ titulo: p.titulo + " (Wikipédia)", url: p.url }))
    .concat(lidas.map(l => ({ titulo: l.titulo.slice(0, 80), url: l.url })));
  return { texto, fontes };
}

export const Saber = { lerTexto, summarize, pesquisaProfunda, buscarConhecimento, isCode };
