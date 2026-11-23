/* BACH AI - SABER 2.0
   Leitura de textos, código e links + pesquisa profunda com ranking BM25 + base de conhecimento.
   Tudo roda no seu navegador, sem IA externa. */

const KB_KEY = "bach_conhecimento_v2"; // v2: só guarda pesquisas confiáveis

const STOP = new Set(("a o as os um uma uns umas de do da dos das em no na nos nas por para com sem que e eh se ao aos " +
  "mais menos como mas foi ser ou ja tambem seu sua seus suas isso isto este esta esse essa sao tem ha foram sobre entre " +
  "ate quando muito muitos nao sim me te lhe eu tu ele ela nos vos eles elas meu minha pode podem pelo pela pelos pelas " +
  "era eram sera serao cada outro outra outros outras qual quais onde quem quanto porque mesmo voce voces entao seria fazer faz sobre passa passe manda mande uns umas alguem alguma algum quero preciso gostaria fale conte diga").split(" "));

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

/* radical simples: "cores" e "cor", "planetas" e "planeta" contam como o mesmo termo */
const radical = w => {
  w = w.replace(/(coes|oes|aes)$/, "ao");
  if (w.length > 4) w = w.replace(/s$/, "");
  return w.length > 6 ? w.slice(0, 6) : w;
};
const kr = t => kw(t).map(radical);

const DESAMBIGUA = /(pode (se )?referir-se a|pode significar|pode designar|p[áa]gina de desambigua|desambigua[çc][ãa]o)/i;

/* Perguntas sobre lançamentos FUTUROS de entretenimento (filmes, séries, animes
   "que vão estrear", "mês que vem", "em breve"...) não têm resposta confiável
   numa enciclopédia: a busca por palavra-chave pode trazer qualquer artigo que
   contenha "filme", "série" etc., incluindo resultados impróprios ou sem
   nenhuma relação. Melhor recusar com honestidade do que arriscar isso. */
const FUTURO_ENTRETENIMENTO = /\b(filmes?|series?|animes?|desenhos?|jogos?)\b[\s\S]{0,40}\b(mes que vem|proximo mes|proximos meses|em breve|vai estrear|vao estrear|vai lancar|vao lancar|lancamentos?|que (vai|vao) sair|que esta(o)? vindo|vindo ai)\b|\b(mes que vem|proximo mes|em breve|lancamentos?|vai estrear|vao estrear)\b[\s\S]{0,40}\b(filmes?|series?|animes?|desenhos?|jogos?)\b/;

/* "pesquisa isso que você me disse", "o que você quis dizer com isso" etc. não são
   temas de pesquisa: são pedidos para a BACH explicar a própria resposta anterior. */
const META_REFERENCIA = /\b(isso|aquilo|essa resposta|sua resposta)\b[\s\S]{0,25}\b(que (me |voce |vc )?(disse|falou|respondeu|mandou|explicou))\b|\bo que (voce|vc) (quis dizer|falou|disse|respondeu)\b/;

function paragrafos(texto) {
  const corte = String(texto || "").split(/\n(?:Ver também|Referências|Ligações externas|Notas|Bibliografia|Leitura adicional)\s*\n/)[0];
  const out = [];
  for (const p of corte.split(/\n+/)) {
    const t = p.replace(/\s+/g, " ").trim();
    if (t.length < 45) continue;
    for (const s of t.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9"“])/)) out.push(s.trim());
  }
  return out;
}

async function wiki(q, qk) {
  const base = "https://pt.wikipedia.org/w/api.php?";
  const buscar = async termo => get(base + new URLSearchParams({
    action: "query", list: "search", srsearch: termo, srlimit: "6", srinfo: "suggestion", format: "json", origin: "*"
  }), 20000, true);

  let d = await buscar(q);
  let res = d?.query?.search || [];
  const sug = d?.query?.searchinfo?.suggestion;
  if (!res.length && sug) { d = await buscar(sug); res = d?.query?.search || []; }
  if (!res.length && qk.length) { d = await buscar(qk.join(" ")); res = d?.query?.search || []; }

  const alvo = new Set(qk.map(radical));
  const cand = res.map((r, i) => {
    const tk = new Set(kr(r.title));
    const cob = alvo.size ? [...alvo].filter(w => tk.has(w)).length / alvo.size : 0;
    const extra = [...tk].filter(w => !alvo.has(w)).length;
    return { titulo: r.title, rank: i, cob, v: cob - 0.1 * extra - i * 0.01 };
  }).filter(c => c.cob >= 0.5).sort((a, b) => b.v - a.v).slice(0, 2);

  const out = [];
  await Promise.allSettled(cand.map(async (c, n) => {
    const p = await get(base + new URLSearchParams({
      action: "query", prop: "extracts", explaintext: "1", exsectionformat: "plain", redirects: "1",
      titles: c.titulo, format: "json", origin: "*"
    }), 25000, true);
    const pg = Object.values(p?.query?.pages || {})[0];
    const texto = (pg?.extract || "").slice(0, 60000);
    if (!texto || DESAMBIGUA.test(texto.slice(0, 500))) return;
    out[n] = {
      titulo: pg.title || c.titulo, texto, cob: c.cob,
      url: "https://pt.wikipedia.org/wiki/" + encodeURIComponent((pg.title || c.titulo).replace(/ /g, "_"))
    };
  }));
  return out.filter(Boolean);
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

function filtrar(links, qs) {
  return links.map(l => {
    const k = new Set(kr(l.titulo + " " + l.snippet));
    const hits = [...qs].filter(w => k.has(w)).length;
    const bonus = /wikipedia|\.gov|\.edu|mozilla|w3schools|britannica|scielo|bbc\.|nationalgeographic/i.test(l.url) ? 1 : 0;
    return { ...l, hits, v: hits * 2 + bonus };
  }).filter(l => l.hits > 0 && (qs.size < 3 || l.hits >= 2)).sort((x, y) => y.v - x.v).slice(0, 7);
}

function cleanPage(t) {
  return String(t)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_`>|]/g, " ")
    .slice(0, 30000);
}

async function readPage(link, qs) {
  const txt = cleanPage(await get("https://r.jina.ai/" + link.url, 22000));
  return best(paragrafos(txt), s => {
    const n = new Set(kr(s));
    const hits = [...qs].filter(w => n.has(w)).length;
    return hits ? hits * 3 + (s.length > 70 && s.length < 300 ? 1 : 0) : 0;
  }, 10);
}

/* ---------- Ler links colados ---------- */

const urlsEm = t => [...new Set(String(t || "").match(/https?:\/\/[^\s"'`)<>]+/g) || [])].map(u => u.replace(/[.,;:!?]+$/, ""));

function rawGithub(u) {
  const m = u.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+?)(?:[?#].*)?$/);
  return m ? "https://raw.githubusercontent.com/" + m[1] + "/" + m[2] + "/" + m[3] + "/" + m[4] : u;
}

async function lerLink(url) {
  const u = rawGithub(url);
  let nome = host(u);
  try { nome = decodeURIComponent(new URL(u).pathname.split("/").filter(Boolean).pop() || nome); } catch {}
  const raw = /raw\.githubusercontent\.com/.test(u);
  let texto = raw ? await get(u, 25000) : String(await get("https://r.jina.ai/" + u, 30000)).replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  texto = texto.trim();
  if (texto.length < 20) throw new Error("vazio");
  return { texto: texto.slice(0, 200000), nome, url: u };
}

/* ---------- Base de conhecimento (só pesquisas confiáveis) ---------- */

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
  const qk = new Set(kr(texto));
  if (!qk.size) return null;
  let top = null, score = 0;
  for (const e of loadKB()) {
    const ek = new Set(kr(e.q));
    const inter = [...qk].filter(w => ek.has(w)).length;
    const s = inter / Math.max(qk.size, ek.size);
    if (s > score) { score = s; top = e; }
  }
  if (!top || score < 0.75) return null;
  const dias = Math.floor((Date.now() - (top.at || 0)) / 86400000);
  return "📚 Já pesquisei isso (“" + top.q + "”, " + new Date(top.at).toLocaleDateString("pt-BR") + "):\n\n" + String(top.resumo).slice(0, 1500) +
    (dias > 30 ? "\n\n⚠️ Essa pesquisa tem mais de 30 dias e pode estar desatualizada." : "") +
    "\n\nPara atualizar: pesquise a fundo sobre " + top.q;
}

/* ---------- Montar a resposta com ranking BM25 ---------- */

const LIXO = /(cookie|copyright|©|todos os direitos|pol[ií]tica de privacidade|termos de uso|inscreva|assine|newsletter|clique aqui|leia mais|compartilhe|whatsapp|facebook|instagram|login|cadastr|publicidade|an[uú]ncio|aceitar|menu principal|veja também|ver também)/i;

function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
const pickFixo = (a, chave) => a[hash(chave) % a.length]; // mesma pergunta, mesma frase

function limparFrase(s) {
  return String(s).replace(/\[\d+\]/g, "").replace(/\s*\([^)]{0,80}\)/g, "").replace(/\s+/g, " ").replace(/^[-•*\d.)\s]+/, "").trim();
}

function jac(a, b) {
  let i = 0;
  for (const x of a) if (b.has(x)) i++;
  return i / (a.size + b.size - i || 1);
}

function candidatas(fontes, qs) {
  const out = [];
  fontes.forEach((f, fi) => {
    f.frases.forEach((raw, pos) => {
      const s = limparFrase(raw);
      if (s.length < 45 || s.length > 320 || LIXO.test(s) || !/[.!]$/.test(s) || /^(R|P|Q|A):\s/.test(s)) return; // pergunta solta não serve de resposta
      if (/^[,;:)\]]/.test(s) || !/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9"“]/.test(s)) return; // fragmento cortado
      const k = new Set(kr(s));
      let hits = [...qs].filter(w => k.has(w)).length;
      let cob = qs.size ? hits / qs.size : 0;
      const lead = !!f.primario && pos === 0;
      if (f.primario && f.tituloStems) {
        // no artigo principal, as palavras do título já valem como presentes ("cores" basta para "cores do arco-íris")
        const nao = [...qs].filter(w => !f.tituloStems.has(w));
        const achou = nao.filter(w => k.has(w)).length;
        if (nao.length ? !achou && !lead : pos >= 4) return;
        hits = qs.size - nao.length + achou;
        cob = qs.size ? hits / qs.size : 0;
      } else if (!hits) return;
      out.push({ s, k, fi, pos, hits, cob, wiki: !!f.wiki, lead, principal: !!f.primario, len: k.size });
    });
  });
  return out;
}

function escolher(c, qs, pedeLista, n = 4) {
  const temPrincipal = c.some(x => x.principal);
  const N = c.length || 1;
  const df = {};
  for (const x of c) for (const w of x.k) df[w] = (df[w] || 0) + 1;
  const avg = c.reduce((a, x) => a + x.len, 0) / N || 1;
  const idf = w => Math.log(1 + (N - (df[w] || 0) + 0.5) / ((df[w] || 0) + 0.5));
  const k1 = 1.2, b = 0.75;
  const minCob = qs.size <= 1 ? 1 : 0.5;

  c.forEach(x => {
    let bm = 0;
    for (const w of qs) if (x.k.has(w)) bm += idf(w) * ((k1 + 1) / (1 + k1 * (1 - b + b * x.len / avg)));
    x.apoio = new Set(c.filter(y => y.fi !== x.fi && jac(x.k, y.k) > 0.25).map(y => y.fi)).size;
    const lista = pedeLista && (x.s.match(/,/g) || []).length >= 2 ? 1.5 : 0;
    x.v = bm + 3 * x.cob + 1.5 * x.apoio + (x.wiki ? 1 : 0) + (x.lead ? 6 : 0) + (x.principal ? 2 : 0) + lista;
    if (x.wiki && !x.principal && temPrincipal) x.v -= 4;
  });

  const ok = c.filter(x => x.lead || x.cob >= minCob).sort((a, b2) => b2.v - a.v);
  const sel = [];
  for (const x of ok) {
    if (sel.some(y => jac(x.k, y.k) > 0.55)) continue;
    sel.push(x);
    if (sel.length >= n) break;
  }
  return { sel, total: c.length };
}

const lista = a => a.length > 1 ? a.slice(0, -1).join(", ") + " e " + a[a.length - 1] : a[0];

function compor(q, fontes, n = 4) {
  const qk = kw(q);
  const qs = new Set(qk.map(radical));
  const pedeLista = /^\s*(quais|quantos|quantas|cite|liste|tipos|exemplos)\b|\b(cores|tipos|exemplos|lista)\b/i.test(norm(q));
  const { sel: escolhidas, total } = escolher(candidatas(fontes, qs), qs, pedeLista, n);
  if (!escolhidas.length) return null;
  // com 2+ termos, ao menos uma frase precisa cobrir a maior parte da pergunta; senão é conversa fora do assunto
  if (qs.size >= 2 && !escolhidas.some(x => x.lead || x.cob >= 0.67)) return null;

  // a frase que abre o artigo principal vem primeiro; o resto na ordem em que aparece nas fontes
  const sel = [...escolhidas].sort((a, b) => (b.lead - a.lead) || (a.fi - b.fi) || (a.pos - b.pos));
  const usados = [...new Set(sel.map(x => x.fi))].sort((a, b) => a - b);
  const num = fi => usados.indexOf(fi) + 1;
  const [primeira, ...resto] = sel;

  let corpo = primeira.s + " [" + num(primeira.fi) + "]";
  if (resto.length) corpo += "\n\nAlém disso:\n" + resto.map(x => "• " + x.s + " [" + num(x.fi) + "]").join("\n");

  const principal = fontes.some(f => f.primario);
  const apoio = Math.max(...sel.map(x => x.apoio));
  const forte = sel.filter(x => x.cob >= 0.75).length;
  const conf = principal && (apoio >= 1 || forte >= 2) ? "alta" : principal || apoio >= 1 || usados.length >= 2 && forte >= 2 ? "média" : "baixa";

  let t = "🧠 " + pickFixo([
    "Sobre “" + q + "”, foi isso que entendi:",
    "Pesquisei “" + q + "” e separei o que mais apareceu nas fontes:",
    "Aqui está o resumo do que encontrei sobre “" + q + "”:"
  ], norm(q)) + "\n\n" + (conf === "baixa" ? "⚠️ Não tenho certeza dessa resposta; confira nas fontes.\n\n" : "") + corpo;

  t += "\n\n🔍 Como cheguei nisso: olhei " + fontes.length + " fonte(s), separei " + total +
    " frase(s) ligadas à sua pergunta e fiquei com " + sel.length + ", descartando repetidas e fora do assunto. Confiança " + conf +
    (conf === "baixa" ? " (poucas fontes falaram disso)" : apoio ? " (fontes diferentes dizem coisas parecidas)" : principal ? " (artigo principal da Wikipédia)" : "") + ".";
  t += "\nℹ️ Eu escolho e organizo os melhores trechos; não reescrevo do zero como uma IA grande faria.";
  t += "\n\nFontes:\n" + usados.map((fi, i) => "[" + (i + 1) + "] " + fontes[fi].nome).join("\n");
  return { texto: t, corpo, conf, usados };
}

async function pesquisaProfunda(q, progresso = () => {}, fundo = true) {
  const qn = norm(q);
  if (FUTURO_ENTRETENIMENTO.test(qn)) {
    throw new Error("sem-dados-futuros");
  }
  if (META_REFERENCIA.test(qn)) {
    throw new Error("meta-referencia");
  }

  const qk = kw(q);
  const qs = new Set(qk.map(radical));
  const fontes = [];

  progresso("📚 Consultando a Wikipédia (pt.wikipedia.org)...");
  try {
    const pg = await wiki(q, qk);
    pg.forEach((p, i) => fontes.push({
      nome: "Wikipédia: " + p.titulo, url: p.url, frases: paragrafos(p.texto).slice(0, 400), wiki: true,
      primario: i === 0 && p.cob >= 0.5, tituloStems: new Set(kr(p.titulo))
    }));
  } catch (e) { console.warn("wiki", e); }

  progresso("🦆 Buscando no DuckDuckGo...");
  let links = [];
  try { links = await web(q); } catch (e) { console.warn("web", e); }
  if (fundo) { // vai mais fundo: segunda busca com outra formulação, juntando resultados sem repetir
    try { const mais = await web(q + " explicação resumo"); const vistos = new Set(links.map(l => l.url)); mais.forEach(l => { if (!vistos.has(l.url)) links.push(l); }); } catch (e) { console.warn("web2", e); }
  }

  progresso("🧹 Filtrando " + links.length + " resultado(s) por relevância...");
  links = filtrar(links, qs);
  const webFontes = links.map(l => ({ nome: host(l.url) + " — " + l.titulo.slice(0, 60), url: l.url, frases: l.snippet ? [l.snippet] : [] }));
  fontes.push(...webFontes);

  if (fundo) {
    progresso("📖 Abrindo as melhores páginas...");
    await Promise.allSettled(webFontes.slice(0, 5).map(async f => {
      progresso("🌐 Lendo " + host(f.url));
      f.frases.push(...await readPage(f, qs));
    }));
  }

  progresso("🧩 Comparando as fontes e montando a resposta...");
  const r = compor(q, fontes, fundo ? 6 : 4);
  if (!r) throw new Error("irrelevante");

  // só guarda na memória o que tem confiança média ou alta
  const guardou = r.conf !== "baixa";
  if (guardou) saveKB({ q, resumo: r.corpo, at: Date.now() });

  const texto = r.texto + (guardou ? "\n\n💾 Guardei esse resumo na memória." : "\n\n🚫 Não guardei na memória por causa da confiança baixa.") +
    (fundo ? "" : "\nQuer mais detalhes? Peça: pesquise a fundo sobre " + q);
  return { texto, conf: r.conf, fontes: r.usados.map(i => ({ titulo: fontes[i].nome, url: fontes[i].url })) };
}

export const Saber = { lerTexto, summarize, pesquisaProfunda, buscarConhecimento, isCode, compor, lerLink, urlsEm };
