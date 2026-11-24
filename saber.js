/* BACH AI - SABER 3.2
   Leitura de textos/código/links, pesquisa inteligente com expansão de gírias (qm -> quem),
   tratamento de desambiguação, prioridade para português e catálogo Jikan para animes. */

const KB_KEY = "bach_conhecimento_v2";

const STOP = new Set((
  "a o as os um uma uns umas de do da dos das em no na nos nas por para oara praa com sem que e eh se ao aos " +
  "mais menos como mas foi ser ou ja tambem seu sua seus suas isso isto este esta esse essa sao tem ha foram sobre entre " +
  "ate quando muito muitos muita muitas nao sim me te lhe eu tu ele ela nos vos eles elas meu minha meus minhas " +
  "teu tua seus suas pode podem pelo pela pelos pelas era eram sera serao cada outro outra outros outras qual quais onde " +
  "quem qm quanto quantos quantas porque pq pk mesmo voce vc voces entao seria fazer faz faco vai vou vao vamos vem vim vir ter tinha " +
  "passa passe manda mande uns umas alguem alguma algum quero preciso gostaria fale fala conte diga diz " +
  "pesquisa pesquisar pesquise procure procura buscar busque explica explicar explique resume resumir " +
  "net internet web google online pra pro pros pras ai ta to ne la ca oq oqe oque aqui escrito escrita " +
  "nisso nisto disso mes meses ano anos semana semanas dia dias hoje amanha ontem falar perguntei perguntar pergutar " +
  "serve servem servir servisse presta errando errado errada corrigir arrumar falou disse respondeu travou rir chutar " +
  "fica ficam tipo tip coisa coisas tudo querer escrever escrevi saber sabe sabia precisa precisam"
).split(" "));

const INTENCAO_STOP = new Set((
  "bom boa bons boas legal legais ruim melhor melhores pior piores presta vale pena " +
  "lancou lanca lancar lancamento lancamentos estreou estreia estrear saiu sair sai " +
  "recomenda recomende indica indique assistir assisto ver saber proximo proxima proximos proximas vem vim vir chegar"
).split(" "));

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function expandirGirias(t) {
  return norm(t)
    .replace(/\bqm\b/g, "quem")
    .replace(/\bvc\b/g, "voce")
    .replace(/\b(oq|oqe|oque)\b/g, "o que")
    .replace(/\b(pq|pk)\b/g, "porque")
    .replace(/\b(tb|tbm|tmb)\b/g, "tambem")
    .replace(/\bpra\b/g, "para");
}

const tokens = t => expandirGirias(t).split(/[^a-z0-9]+/).filter(Boolean);

const kw = t => tokens(t).filter(w => (/^\d+$/.test(w) || w.length >= 2) && !STOP.has(w));
const kwAssunto = t => kw(t).filter(w => !INTENCAO_STOP.has(w));

function freq(words) {
  const f = {};
  for (const w of words) f[w] = (f[w] || 0) + 1;
  return f;
}

function topWords(text, n = 8) {
  return Object.entries(freq(kwAssunto(text).filter(w => w.length > 2))).sort((a, b) => b[1] - a[1]).slice(0, n).map(x => x[0]);
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
  const f = freq(kwAssunto(text));
  return best(sentences(text), s => {
    const w = kwAssunto(s);
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
  if (/^\s*<(!doctype|html|head|body|div|section|main)\b/i.test(text) || /<script\b/i.test(text)) lang = "HTML";
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
  if (/addEventListener|onclick/.test(text)) feats.push("reage a cliques e teclas");
  if (/JSON\.parse|JSON\.stringify/.test(text)) feats.push("converte dados em JSON");
  if (/\.test\(|\.match\(|RegExp/.test(text)) feats.push("usa expressões regulares");

  let out = "📖 Li o texto. Parece " + lang + " (" + text.split(/\s+/).length + " palavras).";
  if (comment) out += "\n\nDescrição no código: " + comment.replace(/\s+/g, " ").trim().slice(0, 220);
  if (funcs.size) out += "\n\nFunções que encontrei (" + funcs.size + "): " + [...funcs].slice(0, 15).join(", ") + (funcs.size > 15 ? "..." : "");
  if (feats.length) out += "\n\nO que ele faz:\n• " + feats.join("\n• ");
  if (urls.length) out += "\n\nEndereços usados:\n• " + urls.join("\n• ");
  return out + "\n\n💡 Agora você pode pedir: “explica”, “revisa o código” ou “faz uma cadeia de códigos”.";
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

async function get(url, ms = 14000, json = false) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return json ? await r.json() : await r.text();
  } finally { clearTimeout(t); }
}

const radical = w => {
  w = w.replace(/(coes|oes|aes)$/, "ao");
  if (w.length > 4) w = w.replace(/s$/, "");
  return w.length > 6 ? w.slice(0, 6) : w;
};
const kr = t => kwAssunto(t).map(radical);

const DESAMBIGUA = /(pode (se )?referir-se a|pode significar|pode designar|p[áa]gina de desambigua|desambigua[çc][ãa]o)/i;
const CONTEUDO_ADULTO = /\b(pornogr[áa]fic[oa]|porn[oô]|er[óo]tic[oa]|sexo expl[íi]cito|hentai|xvideos|pornhub|onlyfans|adult film)\b/i;

function ehFuturoGenerico(qn) {
  const temMidia = /\b(filmes?|series?|animes?|desenhos?|jogos?|apps?|aplicativos?)\b/.test(qn);
  const temFuturo = /\b(mes que vem|proximo mes|proximos meses|em breve|vai estrear|vao estrear|vai lancar|vao lancar|lancamentos?|vao\s+(?:sair|vir|vim|lancar|estrear|chegar)|vai\s+(?:sair|vir|vim|lancar|estrear|chegar)|que (?:vai|vao|ira|irao) (?:sair|vir|vim)|que esta(?:o)? vindo|vindo ai)\b/.test(qn);
  if (!temMidia || !temFuturo) return false;
  const sobra = kwAssunto(qn).filter(w => !/^(filmes?|series?|animes?|desenhos?|jogos?|apps?|aplicativos?|estrear|estreia|sair|vir|vim|vindo|ter|novo|novos|nova|novas|esse|este|breve|mes|meses|ano|anos|semana|semanas|vao|vai|vou|proximo|proxima|proximos|proximas|chegar)$/.test(w));
  return sobra.length === 0;
}

const META_REFERENCIA = /\b(isso|aquilo|essa resposta|sua resposta)\b[\s\S]{0,25}\b(que (me |voce |vc )?(disse|falou|respondeu|mandou|explicou))\b|\bo que (voce|vc) (quis dizer|falou|disse|respondeu)\b/;

async function buscarAnimesJikan(qn, assunto, progresso) {
  progresso("⛩️ Consultando catálogo ao vivo de animes...");
  const ehTop = /\b(recomenda\w*|melhor\w*|top|indica\w*|bom|bons|assistir|populares)\b/.test(qn) || assunto === "anime" || assunto === "animes";
  const url = ehTop
    ? "https://api.jikan.moe/v4/top/anime?sfw&limit=8"
    : "https://api.jikan.moe/v4/anime?q=" + encodeURIComponent(assunto) + "&sfw&limit=6&order_by=score&sort=desc";
  const data = await get(url, 10000, true);
  const lista = data?.data || [];
  if (!lista.length) return null;

  const linhas = lista.slice(0, 8).map((a, i) => {
    const nota = a.score ? " • Nota " + a.score : "";
    const eps = a.episodes ? " (" + a.episodes + " eps)" : "";
    const gen = (a.genres || []).slice(0, 3).map(g => g.name).join(", ");
    return (i + 1) + ". " + a.title + eps + nota + (gen ? " — " + gen : "");
  });

  return {
    texto: "⛩️ **Animes encontrados (" + (ehTop ? "mais bem avaliados" : "busca: " + assunto) + "):**\n\n" +
      linhas.join("\n") +
      "\n\n💡 Quer a sinopse de algum específico? Peça: “pesquise sobre [nome do anime]”.",
    conf: "alta",
    fontes: lista.slice(0, 3).map(a => ({ titulo: "MyAnimeList: " + a.title, url: a.url }))
  };
}

function limparConsulta(q) {
  const n = expandirGirias(q)
    .replace(/^(?:me\s+)?(?:explica|explique|pesquisa|pesquise|procure|procura|busca|busque|fale|fala)\s+(?:na\s+(?:net|internet|web)|no\s+google)?\s*(?:sobre\s+)?/i, "")
    .replace(/^(?:quem\s+(?:foi|e|eh|era|sao)|o\s+que\s+(?:e|eh|sao|foi|significa))\s+/i, "")
    .replace(/[?!.]+$/g, "")
    .trim();
  const termos = kwAssunto(n);
  const temAno = /\b(19|20)\d{2}\b/.test(n);
  return {
    assunto: termos.length ? termos.join(" ") : kw(n).join(" "),
    ehPessoa: /\bquem\s+(?:foi|e|eh|era)\b/.test(expandirGirias(q)),
    ehLancamento: /\b(lancou|lanca|lancar|lancamento|estreia|estreou|saiu|quando sai|mes que vem|proximo mes)\b/.test(n),
    ehOpiniao: /\b(e bom|e boa|vale a pena|presta|critica|nota|legal|legais|recomenda)\b/.test(n),
    ehAtualidade: !temAno && /\b(eleic|ganhou|venceu|campeao|resultado|placar|atual|atualmente|presidente|governador|prefeito)\b/.test(n),
    permiteAdulto: CONTEUDO_ADULTO.test(n),
    termos: termos.length ? termos : kw(n)
  };
}

function paragrafos(texto) {
  const corte = String(texto || "").split(/\n(?:Ver também|Referências|Ligações externas|Notas|Bibliografia|Leitura adicional)\s*\n/)[0];
  const out = [];
  for (const p of corte.split(/\n+/)) {
    const t = p.replace(/\s+/g, " ").trim();
    if (t.length < 45) continue;
    const marcado = t.replace(/([.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9"“])/g, "$1\n");
    for (const s of marcado.split("\n")) {
      const limpoS = s.trim();
      if (limpoS) out.push(limpoS);
    }
  }
  return out;
}

const stripHtml = s => String(s || "").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&");

function resumirDesambiguacao(texto, titulo) {
  const linhas = String(texto || "").split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 18 && !/^(Ver também|Ligações externas|Referências)/i.test(l) && !DESAMBIGUA.test(l));
  if (!linhas.length) return null;
  return "📚 **“" + titulo + "” pode se referir a vários significados na Wikipédia:**\n\n• " +
    linhas.slice(0, 6).join("\n• ") +
    "\n\n💡 Se quiser saber de um específico, me diga o nome completo (ex.: *Adão e Eva* ou *Eva personagem*).";
}

async function wiki(q, qk, permiteAdulto = false, ehPessoa = false) {
  const base = "https://pt.wikipedia.org/w/api.php?";
  const buscar = async termo => get(base + new URLSearchParams({
    action: "query", list: "search", srsearch: termo, srlimit: "6", srinfo: "suggestion", format: "json", origin: "*"
  }), 14000, true);

  let d = await buscar(q);
  let res = d?.query?.search || [];
  const sug = d?.query?.searchinfo?.suggestion;
  if (!res.length && sug) { d = await buscar(sug); res = d?.query?.search || []; }
  if (!res.length && qk.length) { d = await buscar(qk.join(" ")); res = d?.query?.search || []; }

  const alvo = new Set(qk.map(radical));
  const cand = res.filter(r => permiteAdulto || !CONTEUDO_ADULTO.test(r.title + " " + stripHtml(r.snippet))).map((r, i) => {
    const tkTitulo = new Set(kr(r.title));
    const tkSnippet = new Set(kr(r.title + " " + stripHtml(r.snippet)));
    const cobTitulo = alvo.size ? [...alvo].filter(w => tkTitulo.has(w)).length / alvo.size : 0;
    const cobSnippet = alvo.size ? [...alvo].filter(w => tkSnippet.has(w)).length / alvo.size : 0;
    const cob = Math.max(cobTitulo, cobSnippet * 0.9);
    const extra = [...tkTitulo].filter(w => !alvo.has(w)).length;
    return { titulo: r.title, rank: i, cob, cobTitulo, extra, v: cob + (i === 0 ? 0.15 : 0) - 0.12 * extra - i * 0.02 };
  }).filter(c => c.cob >= 0.45 || (c.rank === 0 && c.cob > 0)).sort((a, b) => b.v - a.v);

  let escolhidos = cand.slice(0, 2);
  if (escolhidos.length === 2 && escolhidos[0].cobTitulo >= 0.9 && escolhidos[0].extra === 0 && escolhidos[1].extra > 0) {
    escolhidos = [escolhidos[0]];
  }

  const out = [];
  let desambigInfo = null;
  await Promise.allSettled(escolhidos.map(async (c, n) => {
    const p = await get(base + new URLSearchParams({
      action: "query", prop: "extracts", explaintext: "1", exsectionformat: "plain", redirects: "1",
      titles: c.titulo, format: "json", origin: "*"
    }), 15000, true);
    const pg = Object.values(p?.query?.pages || {})[0];
    const texto = (pg?.extract || "").slice(0, 60000);
    if (!texto) return;
    if (DESAMBIGUA.test(texto.slice(0, 500))) {
      if (!desambigInfo) {
        const resD = resumirDesambiguacao(texto, pg.title || c.titulo);
        if (resD) desambigInfo = { texto: resD, url: "https://pt.wikipedia.org/wiki/" + encodeURIComponent((pg.title || c.titulo).replace(/ /g, "_")), titulo: pg.title || c.titulo };
      }
      return;
    }
    if (!permiteAdulto && CONTEUDO_ADULTO.test(texto.slice(0, 600))) return;
    out[n] = {
      titulo: pg.title || c.titulo, texto, cob: c.cob,
      url: "https://pt.wikipedia.org/wiki/" + encodeURIComponent((pg.title || c.titulo).replace(/ /g, "_"))
    };
  }));

  const filtrados = out.filter(Boolean);
  if (!filtrados.length && ehPessoa && qk.length === 1) {
    // Tenta buscar contexto bíblico/histórico caso o nome único tenha caído em desambiguação
    try {
      const d2 = await buscar(q + " biblia OR historia OR personagem");
      const r2 = d2?.query?.search?.[0];
      if (r2 && new Set(kr(r2.title + " " + stripHtml(r2.snippet))).has(radical(qk[0]))) {
        const p2 = await get(base + new URLSearchParams({
          action: "query", prop: "extracts", explaintext: "1", exsectionformat: "plain", redirects: "1",
          titles: r2.title, format: "json", origin: "*"
        }), 12000, true);
        const pg2 = Object.values(p2?.query?.pages || {})[0];
        const tx2 = (pg2?.extract || "").slice(0, 60000);
        if (tx2 && !DESAMBIGUA.test(tx2.slice(0, 500))) {
          filtrados.push({
            titulo: pg2.title || r2.title,
            texto: tx2,
            cob: 0.85,
            url: "https://pt.wikipedia.org/wiki/" + encodeURIComponent((pg2.title || r2.title).replace(/ /g, "_"))
          });
        }
      }
    } catch {}
  }

  return { artigos: filtrados, desambigInfo };
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
  const txt = await get("https://r.jina.ai/http://html.duckduckgo.com/html/?kl=br-pt&q=" + encodeURIComponent(q), 12000);
  const ms = [...txt.matchAll(/^## \[(.*?)\]\((https?:\/\/[^)\s]+)\)/gm)];
  const out = [], seen = new Set();
  for (let i = 0; i < ms.length && out.length < 9; i++) {
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

const pareceIngles = t => /\b(the|was|were|is|are|with|from|which|that|developed|publicly|revealed|based)\b/i.test(t) &&
  !/[ãõçáéíóúâêô]/i.test(t);

function filtrar(links, qs, permiteAdulto = false, anoAtual = "") {
  return links.filter(l => permiteAdulto || !CONTEUDO_ADULTO.test(l.titulo + " " + l.snippet + " " + l.url)).map(l => {
    const texto = l.titulo + " " + l.snippet;
    const k = new Set(kr(texto));
    const hits = [...qs].filter(w => k.has(w)).length;
    const bonusPT = /pt\.wikipedia|\.br\/|brasilescola|todamateria|significados|mundoeducacao|bbc\.|g1\.globo|uol/i.test(l.url) ? 3 : 0;
    const penEn = (/en\.wikipedia/i.test(l.url) || pareceIngles(texto)) ? -2 : 0;
    const bonusAno = anoAtual && texto.includes(anoAtual) ? 3 : 0;
    return { ...l, hits, v: hits * 2 + bonusPT + penEn + bonusAno };
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
  const txt = cleanPage(await get("https://r.jina.ai/" + link.url, 10000));
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
  let texto = raw ? await get(u, 15000) : String(await get("https://r.jina.ai/" + u, 15000)).replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  texto = texto.trim();
  if (texto.length < 20) throw new Error("vazio");
  return { texto: texto.slice(0, 200000), nome, url: u };
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
const pickFixo = (a, chave) => a[hash(chave) % a.length];

function limparFrase(s) {
  return String(s).replace(/\[\d+\]/g, "").replace(/\s*\([^)]{0,80}\)/g, "").replace(/\s+/g, " ").replace(/^[-•*\d.)\s]+/, "").trim();
}

function jac(a, b) {
  let i = 0;
  for (const x of a) if (b.has(x)) i++;
  return i / (a.size + b.size - i || 1);
}

function candidatas(fontes, qs, permiteAdulto = false, anoAtual = "") {
  const out = [];
  fontes.forEach((f, fi) => {
    f.frases.forEach((raw, pos) => {
      const s = limparFrase(raw);
      if (s.length < 45 || s.length > 320 || LIXO.test(s) || !/[.!]$/.test(s) || /^(R|P|Q|A):\s/.test(s)) return;
      if (!permiteAdulto && CONTEUDO_ADULTO.test(s)) return;
      if (/^[,;:)\]]/.test(s) || !/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9"“]/.test(s)) return;
      const k = new Set(kr(s));
      let hits = [...qs].filter(w => k.has(w)).length;
      let cob = qs.size ? hits / qs.size : 0;
      const lead = !!f.primario && pos === 0;
      if (f.primario && f.tituloStems) {
        const nao = [...qs].filter(w => !f.tituloStems.has(w));
        const achou = nao.filter(w => k.has(w)).length;
        if (nao.length ? !achou && !lead : pos >= 5) return;
        hits = qs.size - nao.length + achou;
        cob = qs.size ? hits / qs.size : 0;
      } else if (!hits && !lead) return;
      const temAnoAtual = Boolean(anoAtual && s.includes(anoAtual));
      out.push({ s, k, fi, pos, hits, cob, wiki: !!f.wiki, lead, principal: !!f.primario, temAnoAtual, emIngles: pareceIngles(s), len: k.size });
    });
  });
  return out;
}

function escolher(c, qs, pedeLista, n = 4, ehAtual = false) {
  const temPrincipal = c.some(x => x.principal);
  const N = c.length || 1;
  const df = {};
  for (const x of c) for (const w of x.k) df[w] = (df[w] || 0) + 1;
  const avg = c.reduce((a, x) => a + x.len, 0) / N || 1;
  const idf = w => Math.log(1 + (N - (df[w] || 0) + 0.5) / ((df[w] || 0) + 0.5));
  const k1 = 1.2, b = 0.75;
  const minCob = qs.size <= 1 ? 1 : 0.45;

  c.forEach(x => {
    let bm = 0;
    for (const w of qs) if (x.k.has(w)) bm += idf(w) * ((k1 + 1) / (1 + k1 * (1 - b + b * x.len / avg)));
    x.apoio = new Set(c.filter(y => y.fi !== x.fi && jac(x.k, y.k) > 0.25).map(y => y.fi)).size;
    const lista = pedeLista && (x.s.match(/,/g) || []).length >= 2 ? 1.5 : 0;
    const bonusAtual = ehAtual ? (x.temAnoAtual ? 5 : (x.wiki ? -3 : 0)) : 0;
    const penEn = x.emIngles ? -2.5 : 0;
    x.v = bm + 3 * x.cob + 1.5 * x.apoio + (x.wiki ? 1 : 0) + (x.lead ? 5 : 0) + (x.principal ? 3 : 0) + lista + bonusAtual + penEn;
    if (x.wiki && !x.principal && temPrincipal) x.v -= 5;
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

function compor(q, fontes, n = 4, permiteAdulto = false, ehAtual = false, anoAtual = "") {
  const qk = kwAssunto(q);
  const qs = new Set((qk.length ? qk : kw(q)).map(radical));
  const pedeLista = /^\s*(quais|quantos|quantas|cite|liste|tipos|exemplos)\b|\b(cores|tipos|exemplos|lista)\b/i.test(norm(q));
  const { sel: escolhidas, total } = escolher(candidatas(fontes, qs, permiteAdulto, anoAtual), qs, pedeLista, n, ehAtual);
  if (!escolhidas.length) return null;
  if (qs.size >= 2 && !escolhidas.some(x => x.lead || x.cob >= 0.5)) return null;

  const sel = [...escolhidas].sort((a, b) => (b.temAnoAtual - a.temAnoAtual) || (b.lead - a.lead) || (a.fi - b.fi) || (a.pos - b.pos));
  const usados = [...new Set(sel.map(x => x.fi))].sort((a, b) => a - b);
  const num = fi => usados.indexOf(fi) + 1;
  const [primeira, ...resto] = sel;

  let corpo = primeira.s + " [" + num(primeira.fi) + "]";
  if (resto.length) corpo += "\n\nAlém disso:\n" + resto.map(x => "• " + x.s + " [" + num(x.fi) + "]").join("\n");

  const principal = fontes.some(f => f.primario);
  const apoio = Math.max(...sel.map(x => x.apoio));
  const forte = sel.filter(x => x.cob >= 0.65).length;
  const conf = principal && (apoio >= 1 || forte >= 2) ? "alta" : principal || apoio >= 1 || usados.length >= 2 && forte >= 2 ? "média" : "baixa";

  let t = "🧠 " + pickFixo([
    "Sobre “" + q + "”, foi isso que encontrei:",
    "Pesquisei “" + q + "” e organizei os pontos principais:",
    "Aqui está o resumo sobre “" + q + "”:"
  ], norm(q)) + "\n\n" + (conf === "baixa" ? "⚠️ Não tenho certeza total dessa resposta; confira nas fontes.\n\n" : "") + corpo;

  t += "\n\n🔍 Como cheguei nisso: analisei " + fontes.length + " fonte(s), separei " + total +
    " trecho(s) ligados ao tema e resumi os " + sel.length + " mais confiáveis.";
  t += "\n\nFontes:\n" + usados.map((fi, i) => "[" + (i + 1) + "] " + fontes[fi].nome).join("\n");
  return { texto: t, corpo, conf, usados };
}

async function pesquisaProfunda(q, progresso = () => {}, fundo = true, opts = {}) {
  const qn = expandirGirias(q);
  if (ehFuturoGenerico(qn)) throw new Error("sem-dados-futuros");
  if (META_REFERENCIA.test(qn)) throw new Error("meta-referencia");

  const info = limparConsulta(q);
  const assunto = info.assunto || q;
  const qk = info.termos;
  if (!qk.length || (qk.length === 1 && /^(serve|fazer|falar|dizer|ver|ter|ir|vir|dar|saber|poder|querer|achar|ficar|melhorar|posso|audio|rir|travou|arrumar)$/.test(qk[0]))) {
    throw new Error("irrelevante");
  }

  if (/\b(anime|animes)\b/.test(qn) && !/\b(significa|historia|origem|o que e)\b/.test(qn)) {
    try {
      const ja = await buscarAnimesJikan(qn, assunto, progresso);
      if (ja) return ja;
    } catch (e) { console.warn("jikan", e); }
  }

  if (/\b(filme|filmes)\b/.test(qn) && /\b(bom|bons|boa|boas|recomenda\w*|indica\w*|melhor\w*|assistir|procura\w*)\b/.test(qn) && qk.length <= 3) {
    return {
      texto: "🎬 **10 filmes muito bem avaliados para assistir:**\n\n" +
        "1. Interestelar (2014) — Ficção / Aventura\n" +
        "2. A Origem (2010) — Ficção / Suspense\n" +
        "3. Parasita (2019) — Drama / Suspense\n" +
        "4. Um Sonho de Liberdade (1994) — Drama\n" +
        "5. Batman: O Cavaleiro das Trevas (2008) — Ação\n" +
        "6. Ilha do Medo (2010) — Mistério / Suspense\n" +
        "7. À Espera de um Milagre (1999) — Drama\n" +
        "8. Duna: Parte Dois (2024) — Aventura / Ficção\n" +
        "9. Homem-Aranha no Aranhaverso (2018) — Animação\n" +
        "10. O Auto da Compadecida (2000) — Comédia Brasileira\n\n" +
        "💡 Quer de um gênero específico (drama, terror, ação, aventura, comédia, romance)? É só pedir!",
      conf: "alta",
      fontes: []
    };
  }

  const anoAtual = String(new Date().getFullYear());
  const qs = new Set(qk.map(radical));
  const fontes = [];
  let desambigInfo = null;

  if (!info.ehAtualidade) {
    progresso("📚 Consultando a Wikipédia (pt.wikipedia.org)...");
    try {
      const resWiki = await wiki(assunto, qk, info.permiteAdulto, info.ehPessoa);
      desambigInfo = resWiki.desambigInfo;
      resWiki.artigos.forEach((p, i) => fontes.push({
        nome: "Wikipédia: " + p.titulo, url: p.url, frases: paragrafos(p.texto).slice(0, 400), wiki: true,
        primario: i === 0 && p.cob >= 0.45, tituloStems: new Set(kr(p.titulo))
      }));
    } catch (e) { console.warn("wiki", e); }
  }

  if (desambigInfo && !fontes.length) {
    return {
      texto: desambigInfo.texto,
      conf: "média",
      fontes: [{ titulo: "Wikipédia: " + desambigInfo.titulo, url: desambigInfo.url }]
    };
  }

  progresso("🌐 Buscando na internet" + (info.ehAtualidade ? " (" + anoAtual + ")" : "") + "...");
  let links = [];
  const consultaWeb = info.ehAtualidade ? assunto + " " + anoAtual
    : info.ehLancamento ? assunto + " data de lancamento"
    : info.ehOpiniao ? assunto + " recomendacao critica"
    : info.ehPessoa ? "quem foi " + assunto
    : assunto;
  try { links = await web(consultaWeb); } catch (e) { console.warn("web", e); }
  if ((fundo || opts.semLimite) && links.length < 3) {
    try {
      const extra = info.ehAtualidade ? assunto + " resultado " + anoAtual : info.ehLancamento ? assunto + " lancou" : assunto + " explicacao resumo";
      const mais = await web(extra);
      const vistos = new Set(links.map(l => l.url));
      mais.forEach(l => { if (!vistos.has(l.url)) links.push(l); });
    } catch (e) { console.warn("web2", e); }
  }

  progresso("🧹 Filtrando " + links.length + " resultado(s) por relevância...");
  links = filtrar(links, qs, info.permiteAdulto, info.ehAtualidade ? anoAtual : "");
  const webFontes = links.map(l => ({ nome: host(l.url) + " — " + l.titulo.slice(0, 60), url: l.url, frases: l.snippet ? [l.snippet] : [] }));
  fontes.push(...webFontes);

  const maxPaginas = opts.semLimite ? 7 : 4;
  const maxFrases = opts.semLimite ? 9 : fundo ? 6 : 4;

  if ((fundo || opts.semLimite) && webFontes.length) {
    progresso("📖 Lendo as melhores páginas...");
    await Promise.allSettled(webFontes.slice(0, maxPaginas).map(async f => {
      progresso("🌐 Lendo " + host(f.url));
      f.frases.push(...await readPage(f, qs));
    }));
  }

  progresso("🧩 Comparando as fontes e montando a resposta...");
  const r = compor(assunto, fontes, maxFrases, info.permiteAdulto, info.ehAtualidade, anoAtual);
  if (!r) throw new Error("irrelevante");

  const guardou = r.conf !== "baixa" && !info.ehAtualidade;
  if (guardou) saveKB({ q: assunto, resumo: r.corpo, at: Date.now() });

  const texto = r.texto + (guardou ? "\n\n💾 Guardei esse resumo na memória." : "") +
    (fundo ? "" : "\nQuer mais detalhes? Peça: pesquise a fundo sobre " + assunto);
  return { texto, conf: r.conf, fontes: r.usados.map(i => ({ titulo: fontes[i].nome, url: fontes[i].url })) };
}

export const Saber = { lerTexto, summarize, pesquisaProfunda, buscarConhecimento, isCode, compor, lerLink, urlsEm };
