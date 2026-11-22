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
  if (/^\s*<(!doctype|html|head|body|div|section|main)\b/i.test(text)) lang = "HTML";
  else if (/\bdef\s+\w+\([^)]*\)\s*:/.test(text)) lang = "Python";
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

const limparMd = t => String(t || "")
  .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/\]\([^)]*\)?/g, " ")
  .replace(/[\[\]]/g, " ")
  .replace(/\(?https?:\/\/\S+\)?/g, " ")
  .replace(/[#*_`>|]/g, " ")
  .replace(/\s+/g, " ")
  .replace(/^[\s)\]:–-]+/, "")
  .trim();

const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

async function web(q) {
  const txt = await get("https://r.jina.ai/http://html.duckduckgo.com/html/?q=" + encodeURIComponent(q), 25000);
  const ms = [...txt.matchAll(/^## \[(.*?)\]\((https?:\/\/[^)\s]+)\)/gm)];
  const out = [], seen = new Set();
  for (let i = 0; i < ms.length && out.length < 8; i++) {
    let link = ms[i][2];
    try {
      const u = new URL(link);
      if (u.hostname.includes("duckduckgo.com")) link = u.searchParams.get("uddg") || link;
    } catch {}
    if (!/^https?:\/\//i.test(link) || seen.has(link) || /duckduckgo\.com/i.test(link)) continue;
    const ini = ms[i].index + ms[i][0].length;
    const fim = i + 1 < ms.length ? ms[i + 1].index : txt.length;
    const titulo = limparMd(ms[i][1]);
    let snippet = limparMd(txt.slice(ini, fim)).replace(/…+|\.{3,}\s*$/g, "").trim().slice(0, 320);
    if (snippet && !/[.!?]$/.test(snippet)) snippet += ".";
    if (titulo.length < 4) continue;
    seen.add(link);
    out.push({ titulo, url: link, snippet });
  }
  return out;
}

function filtrar(links, qk) {
  return links.map(l => {
    const k = new Set(kw(l.titulo + " " + l.snippet));
    const hits = qk.filter(w => k.has(w)).length;
    const bonus = /wikipedia|\.gov|\.edu|mozilla|w3schools|britannica/i.test(l.url) ? 1 : 0;
    return { ...l, hits, v: hits * 2 + bonus };
  }).filter(l => l.hits > 0).sort((x, y) => y.v - x.v).slice(0, 5);
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
  }, 6);
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

/* ---------- Montar a resposta com palavras da BACH ---------- */

const LIXO = /(cookie|copyright|©|todos os direitos|pol[ií]tica de privacidade|termos de uso|inscreva|assine|newsletter|clique aqui|leia mais|compartilhe|whatsapp|facebook|instagram|login|cadastr|publicidade|an[uú]ncio|aceitar|menu principal)/i;
const pick = a => a[Math.floor(Math.random() * a.length)];

function limparFrase(s) {
  return String(s).replace(/\[\d+\]/g, "").replace(/\s*\([^)]{0,80}\)/g, "").replace(/\s+/g, " ").replace(/^[-•*\d.)\s]+/, "").trim();
}

function jac(a, b) {
  let i = 0;
  for (const x of a) if (b.has(x)) i++;
  return i / (a.size + b.size - i || 1);
}

function candidatas(fontes, qk) {
  const out = [];
  fontes.forEach((f, fi) => {
    for (const raw of f.frases) {
      const s = limparFrase(raw);
      if (s.length < 45 || s.length > 300 || LIXO.test(s) || !/[.!?]$/.test(s)) continue;
      const k = new Set(kw(s));
      const hits = qk.filter(w => k.has(w)).length;
      if (!hits && !f.wiki) continue;
      out.push({ s, k, fi, hits, wiki: !!f.wiki });
    }
  });
  return out;
}

function escolher(c, n = 4) {
  c.forEach(x => {
    x.apoio = new Set(c.filter(y => y.fi !== x.fi && jac(x.k, y.k) > 0.25).map(y => y.fi)).size;
    x.v = x.hits * 3 + x.apoio * 2 + (x.wiki ? 2 : 0);
  });
  c.sort((a, b) => b.v - a.v);
  const sel = [];
  for (const x of c) {
    if (sel.some(y => jac(x.k, y.k) > 0.55)) continue;
    sel.push(x);
    if (sel.length >= n) break;
  }
  return { sel, total: c.length };
}

const lista = a => a.length > 1 ? a.slice(0, -1).join(", ") + " e " + a[a.length - 1] : a[0];

function compor(q, fontes) {
  const qk = kw(q);
  const { sel, total } = escolher(candidatas(fontes, qk));
  if (!sel.length) return null;

  const usados = [...new Set(sel.map(x => x.fi))].sort((a, b) => a - b);
  const num = fi => usados.indexOf(fi) + 1;
  const [primeira, ...resto] = sel;
  resto.sort((a, b) => a.fi - b.fi);

  let t = "🧠 " + pick([
    "Sobre “" + q + "”, foi isso que entendi:",
    "Pesquisei “" + q + "” e separei o que mais apareceu nas fontes:",
    "Aqui está o resumo do que encontrei sobre “" + q + "”:"
  ]) + "\n\n" + primeira.s + " [" + num(primeira.fi) + "]";

  if (resto.length) t += "\n\nAlém disso:\n" + resto.map(x => "• " + x.s + " [" + num(x.fi) + "]").join("\n");

  const orig = {};
  for (const x of sel) for (const w of x.s.split(/[^\p{L}\p{N}]+/u)) if (w && !orig[norm(w)]) orig[norm(w)] = w.toLowerCase();
  const extras = topWords(sel.map(x => x.s).join(" "), 10).filter(w => !qk.includes(w)).slice(0, 4).map(w => orig[w] || w);
  if (extras.length) t += "\n\n💬 Em poucas palavras: o assunto envolve " + lista(extras) + ".";

  const apoio = Math.max(...sel.map(x => x.apoio));
  const conf = usados.length >= 3 && apoio >= 2 ? "alta" : usados.length >= 2 && apoio >= 1 ? "média" : "baixa";
  t += "\n\n🔍 Como cheguei nisso: olhei " + fontes.length + " fonte(s), separei " + total +
    " frase(s) ligadas à sua pergunta e fiquei com " + sel.length + ", descartando repetidas e fora do assunto. Confiança " + conf +
    (conf === "baixa" ? " (só uma fonte falou disso, confira antes de confiar)" : apoio ? " (fontes diferentes dizem coisas parecidas)" : "") + ".";
  t += "\nℹ️ Eu escolho e organizo os melhores trechos; não reescrevo do zero como uma IA grande faria.";
  t += "\n\nFontes:\n" + usados.map((fi, i) => "[" + (i + 1) + "] " + fontes[fi].nome).join("\n");
  return { texto: t, usados };
}

async function pesquisaProfunda(q, progresso = () => {}, fundo = true) {
  const qk = kw(q);
  const fontes = [];

  progresso("📚 Consultando a Wikipédia (pt.wikipedia.org)...");
  try {
    const pg = await wiki(q);
    for (const p of pg.slice(0, 2)) {
      const k = new Set(kw(p.texto));
      if (pg.length === 1 || qk.some(w => k.has(w))) {
        fontes.push({ nome: "Wikipédia: " + p.titulo, url: p.url, frases: sentences(p.texto).slice(0, 6), wiki: true });
      }
    }
  } catch (e) { console.warn("wiki", e); }

  progresso("🦆 Buscando no DuckDuckGo...");
  let links = [];
  try { links = await web(q); } catch (e) { console.warn("web", e); }

  progresso("🧹 Filtrando " + links.length + " resultado(s) por relevância...");
  links = filtrar(links, qk);
  const webFontes = links.map(l => ({ nome: host(l.url) + " — " + l.titulo.slice(0, 60), url: l.url, frases: l.snippet ? [l.snippet] : [] }));
  fontes.push(...webFontes);

  if (fundo) {
    progresso("📖 Abrindo as melhores páginas...");
    await Promise.allSettled(webFontes.slice(0, 3).map(async f => {
      progresso("🌐 Lendo " + host(f.url));
      f.frases.push(...await readPage(f, qk));
    }));
  }

  progresso("🧩 Comparando as fontes e montando a resposta...");
  const r = compor(q, fontes);
  if (!r) throw new Error("irrelevante");

  saveKB({ q, resumo: r.texto, at: Date.now() });

  const texto = r.texto + "\n\n💾 Guardei esse resumo na memória." + (fundo ? "" : "\nQuer mais detalhes? Peça: pesquise a fundo sobre " + q);
  return { texto, fontes: r.usados.map(i => ({ titulo: fontes[i].nome, url: fontes[i].url })) };
}

export const Saber = { lerTexto, summarize, pesquisaProfunda, buscarConhecimento, isCode, compor };
