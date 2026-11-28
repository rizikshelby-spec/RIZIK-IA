/* BACH AI 5.8 - SABER 4.2 (Estilo Limpo tipo Claude + Links Compactos + Anti-Ruído)
 * - Remove citações [1] [2] poluindo cada linha e deixa links curtos/limpos.
 * - Corrige gírias/erros ("abaixo" -> "baixar", "celukar" -> "celular", "whatzapp" -> "whatsapp").
 * - Pula Wikipédia em tutoriais práticos e eventos atuais (2026).
 */

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
  "perguntando pergunto pergunta perguntas responde responda responder respondendo esqueceu esqueci esquecer lembra lembro lembrar " +
  "serve servem servir servisse presta errando errado errada corrigir arrumar falou disse respondeu travou rir chutar " +
  "fica ficam tipo tip coisa coisas tudo querer escrever escrevi saber sabe sabia precisa precisam forma maneira jeito " +
  "entendi entendeu tabom so legal besta"
).split(" "));

const INTENCAO_STOP = new Set((
  "recomenda recomende indica indique assistir assisto ver saber proximo proxima proximos proximas vem vim vir chegar"
).split(" "));

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function hostPrivadoOuLocal(hostname) {
  const h = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (!h || h === "localhost" || h === "::1" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^(?:127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h)) return true;
  const m172 = h.match(/^172\.(\d{1,3})\./);
  if (m172 && Number(m172[1]) >= 16 && Number(m172[1]) <= 31) return true;
  return false;
}

function urlPublicaSegura(url) {
  try {
    const u = new URL(String(url || "").trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (hostPrivadoOuLocal(u.hostname)) return null;
    return u.href;
  } catch { return null; }
}

function expandirGirias(t) {
  return norm(t)
    .replace(/\bqm\b/g, "quem")
    .replace(/\bvc\b/g, "voce")
    .replace(/\b(oq|oqe|oque)\b/g, "o que")
    .replace(/\b(pq|pk)\b/g, "porque")
    .replace(/\b(tb|tbm|tmb)\b/g, "tambem")
    .replace(/\b(pra|oara|praa)\b/g, "para")
    .replace(/\b(abaixa[r]?|abaixo)\b/g, "baixar")
    .replace(/\b(celukar|celula|cel)\b/g, "celular")
    .replace(/\bwhatzapp\b/g, "whatsapp")
    .replace(/\bmelho\b/g, "melhor")
    .replace(/\batualisado\b/g, "atualizado")
    .replace(/\b(para|como)\s+dormi\b/g, "$1 dormir")
    .replace(/\bpisodios\b/g, "episodios");
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
  const t = String(text || "").slice(0, 120000).replace(/\s+/g, " ");
  return (t.match(/[^.!?]+[.!?]+/g) || [t]).map(s => s.trim()).filter(s => s.length >= 35 && s.length <= 420);
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
  const sample = String(text || "").slice(0, 40000);
  const hasKeyword = /(\bconst\b|\bfunction\b|=>|\bimport\b|\bexport\b|\breturn\b|\bdef\s+\w+\(|\bclass\s+\w+|<\/?[a-z][^>]*>)/.test(sample);
  const symbols = (sample.match(/[{};=()<>]/g) || []).length / Math.max(sample.length, 1);
  return hasKeyword && symbols > 0.03;
}

function analyzeCode(text) {
  const sample = String(text || "").slice(0, 400000);
  let lang = "código";
  if (/^\s*<(!doctype|html|head|body|div|section|main)\b/i.test(sample) || /^\s*<script\b/i.test(sample)) lang = "HTML";
  else if (/\bdef\s+\w+\([^)]*\)\s*:/.test(sample)) lang = "Python";
  else if (/\b(const|let|var|function)\b|=>/.test(sample)) lang = "JavaScript";

  const funcs = new Set();
  for (const m of sample.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)) funcs.add(m[1]);
  for (const m of sample.matchAll(/(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?[^=;(]*\)?\s*=>/g)) funcs.add(m[1]);
  for (const m of sample.matchAll(/\bdef\s+([A-Za-z_]\w*)/g)) funcs.add(m[1]);

  const urls = [...new Set(sample.match(/https?:\/\/[^\s"'`)<>]+/g) || [])].slice(0, 5);
  const comment = (sample.match(/\/\*([\s\S]*?)\*\//) || [])[1];

  const feats = [];
  if (/localStorage/.test(sample)) feats.push("guarda dados no navegador (localStorage)");
  if (/indexedDB/i.test(sample)) feats.push("armazena dados em IndexedDB");
  if (/fetch\(/.test(sample)) feats.push("faz requisições na internet (fetch)");
  if (/\bexport\b/.test(sample)) feats.push("exporta um módulo para outros arquivos");
  if (/addEventListener|onclick/.test(sample)) feats.push("reage a cliques e teclas");
  if (/JSON\.parse|JSON\.stringify/.test(sample)) feats.push("converte dados em JSON");
  if (/\.test\(|\.match\(|RegExp/.test(sample)) feats.push("usa expressões regulares");

  let out = "📖 Li o arquivo. Parece **" + lang + "** (" + sample.split("\n").length + " linhas, " + sample.split(/\s+/).length + " palavras).";
  if (comment) out += "\n\nDescrição no código: " + comment.replace(/\s+/g, " ").trim().slice(0, 220);
  if (funcs.size) out += "\n\nFunções encontradas (" + funcs.size + "): " + [...funcs].slice(0, 15).join(", ") + (funcs.size > 15 ? "..." : "");
  if (feats.length) out += "\n\nO que ele faz:\n• " + feats.join("\n• ");
  if (urls.length) out += "\n\nEndereços usados:\n• " + urls.join("\n• ");
  return out + "\n\n💡 Agora você pode pedir: “explica”, “revisa o código”, “cadeia de códigos” ou “copiar código”.";
}

function lerTexto(text) {
  const sample = String(text || "").slice(0, 400000);
  if (isCode(sample)) return analyzeCode(sample);
  const resumo = summarize(sample, 4);
  const palavras = sample.trim().split(/\s+/).length;
  let out = "📖 Li o texto: " + palavras + " palavras.";
  if (resumo.length) out += "\n\nResumo:\n• " + resumo.join("\n• ");
  const k = topWords(sample);
  if (k.length) out += "\n\nAssuntos principais: " + k.join(", ") + ".";
  return out;
}

/* ---------- Guias Seguros de Jogos & Pesquisas Populares ---------- */

function guiaJogoCelular(qn) {
  const querBaixarOuJogar = /\b(baixar|instalar|download|jogar|onde|tem|roda|funciona|celular|android|iphone|ios|mobile|apk|link)\b/.test(qn);
  if (!querBaixarOuJogar) return null;

  if (/\bgta\b|grand theft auto/.test(qn)) {
    if (/\bgta\s*(5|v)\b/.test(qn)) {
      return {
        texto: "🎮 **GTA V no celular / PC / iOS — como funciona:**\n\n" +
          "• **PC:** disponível oficialmente na **Steam**, **Epic Games Store** e **Rockstar Launcher**.\n" +
          "• **Celular (Android / iOS):** a Rockstar não lançou versão nativa do GTA V para celular. Você joga de forma oficial usando **nuvem / streaming**: **Xbox Cloud Gaming** (navegador), **Remote Play** (PS/Xbox) ou **Steam Link** (transmitindo do seu PC).\n\n" +
          "⚠️ **Cuidado:** sites oferecendo “APK do GTA 5 para celular” costumam ser golpes ou vírus.\n\n" +
          "Você quer jogar GTA no celular (como o San Andreas oficial) ou no PC?",
        conf: "alta",
        fontes: [{ titulo: "Rockstar Games", url: "https://www.rockstargames.com/gta-v" }]
      };
    }

    return {
      texto: "🎮 **Como baixar GTA no celular (oficial e seguro):**\n\n" +
        "Os jogos da trilogia clássica têm versão oficial para **Android** e **iPhone (iOS)**:\n\n" +
        "• **GTA: San Andreas**, **GTA: Vice City** e **GTA III** — disponíveis na **Google Play Store** e **App Store**.\n" +
        "• **Pela Netflix (sem custo extra se você assina):** pesquise **“GTA San Andreas Netflix”** (ou Vice City / III *Definitive Edition*) na loja do celular e entre com sua conta Netflix.\n\n" +
        "⚠️ Evite arquivos `.apk` modificados de sites aleatórios para não pegar vírus.\n\n" +
        "Seu celular é Android ou iPhone?",
      conf: "alta",
      fontes: [{ titulo: "Rockstar Games", url: "https://www.rockstargames.com/games" }]
    };
  }

  if (/\bminecraft\b/.test(qn)) {
    return {
      texto: "⛏️ **Como baixar Minecraft no celular:**\n\n" +
        "• **Android:** abra a **Google Play Store** e procure por **Minecraft** (ou **Minecraft Trial** para testar grátis).\n" +
        "• **iPhone / iPad:** procure por **Minecraft** na **App Store**.\n\n" +
        "Você joga mais no celular ou no PC?",
      conf: "alta",
      fontes: [{ titulo: "Minecraft Oficial", url: "https://www.minecraft.net/pt-br" }]
    };
  }

  if (/\bfortnite\b/.test(qn)) {
    return {
      texto: "🪂 **Como baixar Fortnite no celular:**\n\n" +
        "• **Android:** baixe a **Epic Games Store** em `fortnite.com/mobile` e instale por lá.\n" +
        "• **iPhone no Brasil / celulares leves:** jogue grátis direto pelo navegador via **Xbox Cloud Gaming** (`xbox.com/play`) ou **GeForce NOW**.\n\n" +
        "Quer ajuda para abrir pelo navegador ou no Android?",
      conf: "alta",
      fontes: [{ titulo: "Fortnite Mobile", url: "https://www.fortnite.com/mobile" }]
    };
  }

  if (/\b(roblox|free fire|cod mobile|call of duty|brawl stars|pubg|genshin)\b/.test(qn)) {
    const nome = (qn.match(/\b(roblox|free fire|cod mobile|call of duty|brawl stars|pubg|genshin)\b/) || ["o jogo"])[1].toUpperCase();
    return {
      texto: "📱 **Como baixar " + nome + " no celular:**\n\n" +
        "• **Android:** abra a **Google Play Store**, busque **" + nome + "** e toque em **Instalar**.\n" +
        "• **iPhone (iOS):** abra a **App Store**, busque **" + nome + "** e toque em **Obter**.\n\n" +
        "Está dando algum erro de espaço ou compatibilidade no seu aparelho?",
      conf: "alta",
      fontes: []
    };
  }

  return null;
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
  return w.length > 5 ? w.slice(0, 5) : w;
};
const kr = t => kwAssunto(t).map(radical);

const DESAMBIGUA = /(pode (se )?referir-se a|pode significar|pode designar|p[áa]gina de desambigua|desambigua[çc][ãa]o)/i;
const CONTEUDO_ADULTO = /\b(pornogr[áa]fic[oa]|porn[oô]|er[óo]tic[oa]|sexo expl[íi]cito|hentai|xvideos|pornhub|onlyfans|adult film)\b/i;

function ehFuturoGenerico(qn) {
  const temMidia = /\b(filmes?|series?|animes?|desenhos?|jogos?|apps?|aplicativos?)\b/.test(qn);
  const temFuturo = /\b(mes que vem|proximo mes|proximos meses|em breve|vai estrear|vao estrear|vai lancar|vao lancar|vao\s+(?:sair|vir|vim|lancar|estrear|chegar)|vai\s+(?:sair|vir|vim|lancar|estrear|chegar)|que (?:vai|vao|ira|irao) (?:sair|vir|vim)|que esta(?:o)? vindo|vindo ai)\b/.test(qn);
  if (!temMidia || !temFuturo) return false;
  const sobra = kwAssunto(qn).filter(w => !/^(filmes?|series?|animes?|desenhos?|jogos?|apps?|aplicativos?|estrear|estreia|sair|vir|vim|vindo|ter|novo|novos|nova|novas|esse|este|breve|mes|meses|ano|anos|semana|semanas|vao|vai|vou|proximo|proxima|proximos|proximas|chegar)$/.test(w));
  return sobra.length === 0;
}

const META_REFERENCIA = /\b(isso|aquilo|essa resposta|sua resposta)\b[\s\S]{0,25}\b(que (me |voce |vc )?(disse|falou|respondeu|mandou|explicou))\b|\bo que (voce|vc) (quis dizer|falou|disse|respondeu)\b/;

async function buscarAnimesJikan(qn, assunto, progresso) {
  progresso("⛩️ Consultando catálogo ao vivo de animes...");
  const ehAtual = /\b(atual|atuais|atualizado|recentes?|agora|temporada|2025|2026|novo|novos)\b/.test(qn);
  const ehTop = /\b(recomenda\w*|melhor\w*|top|indica\w*|bom|bons|assistir|populares)\b/.test(qn) || assunto === "anime" || assunto === "animes";
  const url = ehAtual
    ? "https://api.jikan.moe/v4/seasons/now?sfw&limit=8"
    : ehTop
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
    texto: "⛩️ **Animes encontrados (" + (ehAtual ? "temporada atual" : ehTop ? "mais bem avaliados" : "busca: " + assunto) + "):**\n\n" +
      linhas.join("\n") +
      "\n\nQuer a sinopse ou mais detalhes de algum específico?",
    conf: "alta",
    fontes: lista.slice(0, 2).map(a => ({ titulo: a.title, url: a.url }))
  };
}

function limparConsulta(q) {
  const n = expandirGirias(q)
    .replace(/^(?:me\s+)?(?:explica|explique|pesquisa|pesquise|procure|procura|busca|busque|fale|fala)\s+(?:uma\s+pesquisa\s+)?(?:na\s+(?:net|internet|web)|no\s+google)?\s*(?:sobre\s+|se\s+)?/i, "")
    .replace(/^(?:quem\s+(?:foi|e|eh|era|sao)|o\s+que\s+(?:e|eh|sao|foi|significa)|de\s+qual|qual\s+(?:e|a|o)\s+)\s*/i, "")
    .replace(/[?!.]+$/g, "")
    .trim();
  const termosAssunto = kwAssunto(n);
  const termosTodos = kw(n);
  const temAno = /\b(19|20)\d{2}\b/.test(n);
  const termosLimpos = termosAssunto.filter(w => !/^\d+$/.test(w));
  const ehTutorial = /\b(como\s+(?:baixar|instalar|fazer|jogar|usar|criar|configurar|resolver|tirar|pegar|conseguir|emitir|solicitar|cortar|ganhar|atualizar|formatar|desbloquear)|onde\s+(?:baixar|assistir|comprar|encontrar)|passo\s+a\s+passo|tutorial|receita\s+de|receitas\s+de)\b/.test(n) ||
    /\b(baixar|instalar|download|atestado)\b/.test(n);

  return {
    assunto: (termosAssunto.length ? termosAssunto : termosTodos).join(" "),
    entidade: (termosLimpos.length ? termosLimpos : termosAssunto.length ? termosAssunto : termosTodos).join(" "),
    webQuery: n,
    ehPessoa: /\bquem\s+(?:foi|e|eh|era)\b/.test(expandirGirias(q)),
    ehTutorial,
    ehLancamento: /\b(lancou|lanca|lancar|lancamento|estreia|estreou|saiu|quando sai|recente|recentes|atualizado|de agora|chegando)\b/.test(n),
    ehOpiniao: /\b(e bom|e boa|vale a pena|presta|critica|nota|legal|legais|recomenda|facil|barato)\b/.test(n),
    ehAtualidade: /\b(eleic|ganhou|venceu|campeao|resultado|placar|atual|atuais|atualizado|atualmente|recente|recentes|de agora|esse ano|deste ano|2025|2026|presidente|governador|prefeito|melhor do mundo|bola de ouro|the best|ranking|artilheiro|time atual|onde joga|quanto custa|preco|chegando|brasileirao)\b/.test(n) ||
      (!temAno && /\b(hoje|agora|ultimos|ultimas)\b/.test(n)),
    permiteAdulto: CONTEUDO_ADULTO.test(n),
    termos: termosAssunto.length ? termosAssunto : termosTodos
  };
}

function paragrafos(texto) {
  const corte = String(texto || "").split(/\n(?:Ver também|Referências|Ligações externas|Notas|Bibliografia|Leitura adicional)\s*\n/)[0];
  const out = [];
  for (const p of corte.split(/\n+/)) {
    const t = p.replace(/\s+/g, " ").trim();
    if (t.length < 35) continue;
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
  return "**“" + titulo + "”** pode se referir a vários temas:\n\n• " +
    linhas.slice(0, 5).join("\n• ") +
    "\n\nQual deles você procura?";
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
    const cob = Math.max(cobTitulo, cobSnippet * 0.85);
    const extra = [...tkTitulo].filter(w => !alvo.has(w)).length;
    const exatoBonus = (cobTitulo >= 0.95 && extra === 0) ? 0.6 : 0;
    return { titulo: r.title, rank: i, cob, cobTitulo, extra, v: cob + exatoBonus + (i === 0 ? 0.12 : 0) - 0.14 * extra - i * 0.02 };
  }).filter(c => c.cob >= 0.55 || (c.rank === 0 && c.cob >= 0.45)).sort((a, b) => b.v - a.v);

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
            titulo: pg2.title || r2.title, texto: tx2, cob: 0.85,
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
  const ms = [...txt.matchAll(/^(?:#{1,4}\s+|[-*]\s+|\d+\.\s+)?(?<!!)\[([^\]]{3,180})\]\((https?:\/\/[^)\s]+)\)/gm)];
  const out = [], seen = new Set();
  for (let i = 0; i < ms.length && out.length < 10; i++) {
    let link = ms[i][2];
    try {
      const u = new URL(link);
      if (u.hostname.includes("duckduckgo.com")) link = u.searchParams.get("uddg") || link;
    } catch {}
    const linkSeguro = urlPublicaSegura(link);
    if (!linkSeguro || seen.has(linkSeguro) || /duckduckgo\.com/i.test(linkSeguro)) continue;
    const ini = ms[i].index + ms[i][0].length;
    const fim = i + 1 < ms.length ? ms[i + 1].index : txt.length;
    const titulo = limparMd(ms[i][1]);
    let snippet = limparMd(txt.slice(ini, fim)).replace(/…+|\.{3,}\s*$/g, "").trim().slice(0, 340);
    if (snippet && !/[.!?]$/.test(snippet)) snippet += ".";
    if (titulo.length < 4) continue;
    seen.add(linkSeguro);
    out.push({ titulo, url: linkSeguro, snippet });
  }
  return out;
}

const pareceIngles = t => /\b(the|was|were|is|are|with|from|which|that|developed|publicly|revealed|based)\b/i.test(t) &&
  !/[ãõçáéíóúâêô]/i.test(t);

function filtrar(links, qs, permiteAdulto = false, anoAtual = "") {
  const ranq = links.filter(l => permiteAdulto || !CONTEUDO_ADULTO.test(l.titulo + " " + l.snippet + " " + l.url)).map(l => {
    const texto = l.titulo + " " + l.snippet;
    const k = new Set(kr(texto));
    const hits = [...qs].filter(w => k.has(w)).length;
    const bonusPT = /pt\.wikipedia|\.br\/|brasilescola|todamateria|significados|mundoeducacao|bbc\.|g1\.globo|ge\.globo|uol|techtudo|canaltech|tudocelular|adorocinema|omelete|tecmundo|play\.google|apps\.apple/i.test(l.url) ? 3 : 0;
    const penEn = (/en\.wikipedia/i.test(l.url) || pareceIngles(texto)) ? -2 : 0;
    const bonusAno = anoAtual && (texto.includes(anoAtual) || texto.includes(String(Number(anoAtual) - 1))) ? 3 : 0;
    return { ...l, hits, v: hits * 2 + bonusPT + penEn + bonusAno };
  });

  const minHits = qs.size >= 2 ? 2 : 1;
  const fortes = ranq.filter(l => l.hits >= minHits).sort((x, y) => y.v - x.v);
  if (fortes.length) return fortes.slice(0, 7);
  if (qs.size <= 2) return ranq.filter(l => l.hits >= 1).sort((x, y) => y.v - x.v).slice(0, 4);
  return [];
}

function cleanPage(t) {
  return String(t)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_`>|]/g, " ")
    .slice(0, 35000);
}

async function readPage(link, qs) {
  const linkSeguro = urlPublicaSegura(link?.url);
  if (!linkSeguro) return [];
  const txt = cleanPage(await get("https://r.jina.ai/" + linkSeguro, 10000));
  return best(paragrafos(txt), s => {
    const n = new Set(kr(s));
    const hits = [...qs].filter(w => n.has(w)).length;
    return hits ? hits * 3 + (s.length > 60 && s.length < 360 ? 1 : 0) : 0;
  }, 10);
}

/* ---------- Ler links colados ---------- */

const urlsEm = t => [...new Set(String(t || "").match(/https?:\/\/[^\s"'`)<>]+/g) || [])]
  .map(u => urlPublicaSegura(u.replace(/[.,;:!?]+$/, "")))
  .filter(Boolean);

function rawGithub(u) {
  const m = u.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+?)(?:[?#].*)?$/);
  return m ? "https://raw.githubusercontent.com/" + m[1] + "/" + m[2] + "/" + m[3] + "/" + m[4] : u;
}

async function lerLink(url) {
  const entradaSegura = urlPublicaSegura(url);
  if (!entradaSegura) throw new Error("link-bloqueado");
  const u = urlPublicaSegura(rawGithub(entradaSegura));
  if (!u) throw new Error("link-bloqueado");

  let nome = host(u);
  try { nome = decodeURIComponent(new URL(u).pathname.split("/").filter(Boolean).pop() || nome); } catch {}
  const raw = /^https:\/\/raw\.githubusercontent\.com\//i.test(u);
  let texto = raw ? await get(u, 15000) : String(await get("https://r.jina.ai/" + u, 15000)).replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  texto = texto.trim();
  if (texto.length < 20) throw new Error("vazio");
  return { texto: texto.slice(0, 350000), nome, url: u };
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
  const qn = expandirGirias(texto);
  if (/\b(atualizado|atual|atuais|recente|recentes|agora|hoje|2025|2026|novo|novos|melhor do mundo|baixar|instalar)\b/.test(qn)) return null;
  const qRaw = kwAssunto(texto);
  const qk = new Set(qRaw.map(radical));
  if (!qk.size || (qk.size === 1 && qRaw[0].length < 5)) return null;
  let top = null, score = 0;
  for (const e of loadKB()) {
    const eRaw = kwAssunto(e.q);
    const ek = new Set(eRaw.map(radical));
    if (!ek.size) continue;
    if (qk.size === 1 && ek.size === 1 && qRaw[0] !== eRaw[0]) continue;
    const inter = [...qk].filter(w => ek.has(w)).length;
    const s = inter / Math.max(qk.size, ek.size);
    if (s > score) { score = s; top = e; }
  }
  if (!top || score < 0.8) return null;
  return top.resumo;
}

/* ---------- Montar a resposta limpa (Estilo Claude) ---------- */

const LIXO = /(cookie|copyright|©|todos os direitos|pol[ií]tica de privacidade|termos de uso|inscreva|assine|newsletter|clique aqui|leia mais|compartilhe|whatsapp|facebook|instagram|login|cadastr|publicidade|an[uú]ncio|aceitar|menu principal|veja também|ver também)/i;

function limparFrase(s) {
  return String(s)
    .replace(/\[\d+\]/g, "")
    .replace(/\s*\((?:do grego|em inglês|pronúncia|ouça|AFI:|IPA:)[^)]{0,90}\)/gi, "")
    .replace(/\s+/g, " ")
    .replace(/^[-•*\d.)\s]+/, "")
    .trim();
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
      if (s.length < 35 || s.length > 360 || LIXO.test(s) || !/[.!][)"'”»]?$/.test(s) || /^(R|P|Q|A):\s/.test(s)) return;
      if (!permiteAdulto && CONTEUDO_ADULTO.test(s)) return;
      if (/^[,;:)\]]/.test(s) || !/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9"“]/.test(s)) return;
      const k = new Set(kr(s));
      let hits = [...qs].filter(w => k.has(w)).length;
      let cob = qs.size ? hits / qs.size : 0;
      const lead = !!f.primario && pos === 0;
      if (f.primario && f.tituloStems) {
        const nao = [...qs].filter(w => !f.tituloStems.has(w));
        const achou = nao.filter(w => k.has(w)).length;
        if (nao.length ? !achou && !lead : pos >= 6) return;
        hits = qs.size - nao.length + achou;
        cob = qs.size ? hits / qs.size : 0;
      } else if (!hits && !lead) return;
      const temAnoAtual = Boolean(anoAtual && (s.includes(anoAtual) || s.includes(String(Number(anoAtual) - 1))));
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
  const pedeLista = /^\s*(quais|quantos|quantas|cite|liste|tipos|exemplos|melhores)\b|\b(cores|tipos|exemplos|lista|membros|integrantes|filmes|series|jogos)\b/i.test(norm(q));
  const { sel: escolhidas } = escolher(candidatas(fontes, qs, permiteAdulto, anoAtual), qs, pedeLista, Math.min(4, n), ehAtual);
  if (!escolhidas.length) return null;
  if (qs.size >= 2 && !escolhidas.some(x => x.lead || x.cob >= 0.45)) return null;

  const sel = [...escolhidas].sort((a, b) => (b.temAnoAtual - a.temAnoAtual) || (b.lead - a.lead) || (a.fi - b.fi) || (a.pos - b.pos));
  const usados = [...new Set(sel.map(x => x.fi))].sort((a, b) => a - b);
  const [primeira, ...resto] = sel;

  let corpo = primeira.s;
  if (resto.length) corpo += "\n\n" + resto.map(x => "• " + x.s).join("\n");

  const principal = fontes.some(f => f.primario);
  const apoio = Math.max(...sel.map(x => x.apoio));
  const forte = sel.filter(x => x.cob >= 0.55).length;
  const conf = principal && (apoio >= 1 || forte >= 2) ? "alta" : principal || apoio >= 1 || (usados.length >= 2 && forte >= 1) ? "média" : "baixa";

  const dominios = usados.slice(0, 3).map(fi => fontes[fi].dominio || fontes[fi].nome.split(" — ")[0]).filter(Boolean);
  let t = corpo + "\n\nQuer que eu aprofunde algum desses pontos ou pesquise mais detalhes? 🙂" +
    (dominios.length ? "\n\n*Fontes: " + [...new Set(dominios)].join(" • ") + "*" : "");
  return { texto: t, corpo, conf, usados: usados.slice(0, 2) };
}

const PALAVRAS_GENERICAS_SOLTAS = /^(serve|fazer|falar|dizer|ver|ter|ir|vir|dar|saber|poder|querer|achar|ficar|melhorar|posso|audio|rir|travou|arrumar|esqueceu|lembra|perguntando|pergunto|respondi|respondeu|entendeu|entendi|certo|errado|chega|chegando|amanha|ontem|fofoca|fofocas|gerar)$/;

async function pesquisaProfunda(q, progresso = () => {}, fundo = true, opts = {}) {
  const qn = expandirGirias(q);
  if (ehFuturoGenerico(qn)) throw new Error("sem-dados-futuros");
  if (META_REFERENCIA.test(qn)) throw new Error("meta-referencia");

  const guiaJogo = guiaJogoCelular(qn);
  if (guiaJogo) return guiaJogo;

  const info = limparConsulta(q);
  const assunto = info.assunto || q;
  const entidade = info.entidade || assunto;
  const qk = info.termos;
  if (!qk.length || qk.every(w => PALAVRAS_GENERICAS_SOLTAS.test(w))) {
    throw new Error("irrelevante");
  }

  if (/\b(anime|animes)\b/.test(qn) && !/\b(significa|historia|origem|o que e)\b/.test(qn)) {
    try {
      const ja = await buscarAnimesJikan(qn, assunto, progresso);
      if (ja) return ja;
    } catch (e) { console.warn("jikan", e); }
  }

  const querFilmeAtual = /\b(atual|atuais|atualizado|atualizados|de agora|recente|recentes|novo|novos|2025|2026|lancamento|lancamentos|streaming)\b/.test(qn);
  if (!querFilmeAtual && /\b(filme|filmes)\b/.test(qn) && /\b(bom|bons|boa|boas|recomenda\w*|indica\w*|melhor\w*|assistir|procura\w*|top)\b/.test(qn) && qk.length <= 3) {
    return {
      texto: "🎬 **10 filmes muito bem avaliados:**\n\n" +
        "1. Interestelar (2014) — Ficção / Aventura\n2. A Origem (2010) — Ficção / Suspense\n" +
        "3. Parasita (2019) — Drama / Suspense\n4. Um Sonho de Liberdade (1994) — Drama\n" +
        "5. Batman: O Cavaleiro das Trevas (2008) — Ação\n6. Ilha do Medo (2010) — Mistério\n" +
        "7. À Espera de um Milagre (1999) — Drama\n8. Duna: Parte Dois (2024) — Ficção\n" +
        "9. Homem-Aranha no Aranhaverso (2018) — Animação\n10. O Auto da Compadecida (2000) — Comédia Brasileira\n\n" +
        "💡 Se quiser lançamentos recentes (2025/2026), peça `filmes recentes`.",
      conf: "alta",
      fontes: []
    };
  }

  const anoAtual = String(new Date().getFullYear());
  const qs = new Set(qk.map(radical));
  const fontes = [];
  let desambigInfo = null;

  if (!info.ehAtualidade && !info.ehTutorial) {
    progresso("📚 Consultando a Wikipédia...");
    try {
      const resWiki = await wiki(entidade, kwAssunto(entidade).length ? kwAssunto(entidade) : qk, info.permiteAdulto, info.ehPessoa);
      desambigInfo = resWiki.desambigInfo;
      resWiki.artigos.forEach((p, i) => fontes.push({
        nome: "Wikipédia: " + p.titulo, dominio: "Wikipédia", url: p.url, frases: paragrafos(p.texto).slice(0, 400), wiki: true,
        primario: i === 0 && p.cob >= 0.45, tituloStems: new Set(kr(p.titulo))
      }));
    } catch (e) { console.warn("wiki", e); }
  }

  if (desambigInfo && !fontes.length) {
    return { texto: desambigInfo.texto, conf: "média", fontes: [{ titulo: "Wikipédia", url: desambigInfo.url }] };
  }

  progresso("🌐 Buscando na internet" + (info.ehAtualidade ? " (" + anoAtual + ")" : "") + "...");
  let links = [];
  const consultaWeb = info.ehAtualidade ? (info.webQuery || assunto) + " " + anoAtual
    : info.ehTutorial ? (info.webQuery || assunto)
    : info.ehLancamento ? (info.webQuery || assunto) + " data de lancamento"
    : info.ehOpiniao ? (info.webQuery || assunto) + " recomendacao critica"
    : info.ehPessoa ? "quem foi " + assunto
    : (info.webQuery.length >= assunto.length ? info.webQuery : assunto);

  try { links = await web(consultaWeb); } catch (e) { console.warn("web", e); }
  if ((fundo || opts.semLimite || info.ehTutorial) && links.length < 3) {
    try {
      const extra = info.ehAtualidade ? assunto + " " + (Number(anoAtual) - 1) + " " + anoAtual
        : info.ehTutorial ? assunto + " passo a passo"
        : info.ehLancamento ? assunto + " lancou"
        : assunto + " resumo";
      const mais = await web(extra);
      const vistos = new Set(links.map(l => l.url));
      mais.forEach(l => { if (!vistos.has(l.url)) links.push(l); });
    } catch (e) { console.warn("web2", e); }
  }

  progresso("🧹 Filtrando " + links.length + " resultado(s)...");
  links = filtrar(links, qs, info.permiteAdulto, info.ehAtualidade ? anoAtual : "");
  const webFontes = links.map(l => ({ nome: host(l.url), dominio: host(l.url), url: l.url, frases: l.snippet ? [l.snippet] : [] }));
  fontes.push(...webFontes);

  const maxPaginas = opts.semLimite ? 6 : 4;
  if ((fundo || opts.semLimite || info.ehTutorial) && webFontes.length) {
    progresso("📖 Lendo as melhores fontes...");
    await Promise.allSettled(webFontes.slice(0, maxPaginas).map(async f => {
      f.frases.push(...await readPage(f, qs));
    }));
  }

  progresso("🧩 Organizando a resposta...");
  const r = compor(assunto, fontes, 4, info.permiteAdulto, info.ehAtualidade, anoAtual);
  if (!r) throw new Error("irrelevante");

  const guardou = r.conf !== "baixa" && !info.ehAtualidade;
  if (guardou) saveKB({ q: assunto, resumo: r.texto, at: Date.now() });

  return { texto: r.texto, conf: r.conf, fontes: r.usados.map(i => ({ titulo: fontes[i].dominio || fontes[i].nome, url: fontes[i].url })) };
}

export const Saber = { lerTexto, summarize, pesquisaProfunda, buscarConhecimento, isCode, compor, lerLink, urlsEm };
