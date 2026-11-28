/* BACH AI 5.6 - CÉREBRO AVANÇADO COMPLETO
 * - Estilo conversacional limpo (respostas de idioma, futebol 2026, citações e comparações).
 * - Buscador legal de mídia (fotos, áudios/músicas e vídeos/filmes livres via Wikimedia Commons & Internet Archive) com player e download no chat.
 * - Hora mundial exata, receitas rápidas, organizador de listas, escrita criativa e recomendações por gênero.
 */

import { AutoGuard } from "./autoguard.js?v=2";

const norm = t => String(t || "").slice(0, 1200).toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\bqm\b/g, "quem")
  .replace(/\b(vc|vce|vv|oc|oce)\b/g, "voce")
  .replace(/\b(oq|oqe|oque)\b/g, "o que")
  .replace(/\bpq|pk\b/g, "porque")
  .replace(/\b(oara|pra|praa)\b/g, "para")
  .replace(/\b(cmg)\b/g, "comigo")
  .replace(/\b(entt)\b/g, "entao")
  .replace(/\b(msc)\b/g, "musica")
  .replace(/\b(sla)\b/g, "sei la")
  .replace(/\b(rlx)\b/g, "relaxa")
  .replace(/\b(nmrl)\b/g, "na moral")
  .replace(/\b(jaja)\b/g, "ja ja")
  .replace(/\bnd\b/g, "nada")
  .replace(/\bq\b/g, "que")
  .replace(/\b(tlvz)\b/g, "talvez")
  .replace(/\b(tbm|tb|tmb)\b/g, "tambem")
  .replace(/\b(msm)\b/g, "mesmo")
  .replace(/\b(cvs)\b/g, "conversar")
  .replace(/\b(dnv)\b/g, "de novo")
  .replace(/\bmelho\b/g, "melhor")
  .replace(/\batualisado\b/g, "atualizado")
  .replace(/\b(obgd|obg|obgda)\b/g, "obrigado")
  .replace(/\bss+\b/g, "sim")
  .replace(/\beai+\b/g, "e ai")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const giro = Object.create(null);
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

function semRepetir(k, arr, ctx = {}) {
  const ultimasBot = (Array.isArray(ctx.history) ? ctx.history : [])
    .filter(m => m && m.type !== "user" && m.text)
    .slice(-14)
    .map(m => String(m.text).trim());
  for (let i = 0; i < arr.length; i++) {
    const cand = girar(k, arr);
    if (!ultimasBot.includes(cand.trim())) return cand;
  }
  return girar(k, arr);
}

function wrapCodeFence(code, lang = "txt") {
  const s = String(code || "");
  const runs = s.match(/`{3,}/g) || [];
  const maxRun = runs.reduce((m, r) => Math.max(m, r.length), 2);
  const fence = "`".repeat(maxRun + 1);
  return fence + (lang || "txt") + "\n" + s + "\n" + fence;
}

function ehEntradaSensivel(texto) {
  const s = String(texto || "").trim();
  return /^\/(?:adm|admsenha|ghconfig|chave)\b/i.test(s) || /@rizik2442/i.test(s);
}

function senhaRapida(n = 14) {
  const tam = Math.min(64, Math.max(8, Number(n) || 14));
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-+=";
  let out = "";
  for (let i = 0; i < tam; i++) {
    let idx = Math.floor(Math.random() * chars.length);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      idx = a[0] % chars.length;
    }
    out += chars[idx];
  }
  return "🔐 **Senha forte gerada (" + tam + " caracteres):**\n\n`" + out + "`\n\nℹ️ Gerada localmente no seu aparelho (não salvo senhas).";
}

/* ---------- Buscador Legal de Mídias (Fotos, Áudios/Músicas, Vídeos/Filmes) ---------- */

function urlHttpSegura(u) {
  try {
    const p = new URL(String(u || "").trim());
    return (p.protocol === "https:" || p.protocol === "http:") ? p.href : null;
  } catch { return null; }
}

async function fetchJson(url, ms = 10000) {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
  finally { clearTimeout(id); }
}

async function tentarBlobDownload(url, maxBytes = 12 * 1024 * 1024) {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), 12000);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) return null;
    const len = Number(r.headers.get("content-length") || 0);
    if (len > maxBytes) return null;
    const blob = await r.blob();
    if (blob.size > maxBytes || blob.size < 200) return null;
    return URL.createObjectURL(blob);
  } catch { return null; }
  finally { clearTimeout(id); }
}

function injetarCardsMidiaNoChat(itens) {
  if (typeof document === "undefined" || !Array.isArray(itens) || !itens.length) return;
  setTimeout(() => {
    const chatEl = document.getElementById("chat");
    if (!chatEl) return;

    itens.forEach(item => {
      const u = urlHttpSegura(item.url);
      if (!u) return;

      const card = document.createElement("div");
      card.className = "cartao";
      card.style.maxWidth = "min(86%, 560px)";

      const top = document.createElement("div");
      top.className = "topo";
      const tit = document.createElement("span");
      tit.textContent = item.titulo;

      const btnBaixar = document.createElement("button");
      btnBaixar.textContent = "⬇️ Baixar";
      btnBaixar.onclick = async () => {
        btnBaixar.disabled = true;
        btnBaixar.textContent = "⏳ Baixando...";
        const blobUrl = await tentarBlobDownload(u);
        if (blobUrl) {
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = item.arquivo || "midia-bach";
          a.click();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 8000);
          btnBaixar.textContent = "✅ Baixado";
        } else {
          window.open(u, "_blank", "noopener,noreferrer");
          btnBaixar.textContent = "↗️ Aberto";
        }
        setTimeout(() => { btnBaixar.disabled = false; btnBaixar.textContent = "⬇️ Baixar"; }, 2200);
      };

      const linkPagina = document.createElement("a");
      linkPagina.href = urlHttpSegura(item.pagina || u) || u;
      linkPagina.target = "_blank";
      linkPagina.rel = "noopener noreferrer";
      linkPagina.textContent = "Fonte ↗";
      linkPagina.style.cssText = "color:var(--accent2);font-size:12px;font-weight:bold;text-decoration:none;padding:0 4px";

      top.append(tit, btnBaixar, linkPagina);
      card.appendChild(top);

      if (item.kind === "image") {
        const img = document.createElement("img");
        img.src = u;
        img.alt = item.titulo;
        img.loading = "lazy";
        img.style.cssText = "width:100%;max-height:280px;object-fit:contain;background:#080912;display:block";
        card.appendChild(img);
      } else if (item.kind === "audio") {
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:8px 10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap";
        const btnOuvir = document.createElement("button");
        btnOuvir.textContent = "▶️ Carregar player";
        btnOuvir.style.cssText = "padding:6px 12px;font-size:12px;border-radius:8px;background:rgba(255,255,255,.12)";
        btnOuvir.onclick = async () => {
          btnOuvir.disabled = true;
          btnOuvir.textContent = "⏳ Carregando áudio...";
          const blobUrl = await tentarBlobDownload(u);
          if (blobUrl) {
            const au = document.createElement("audio");
            au.controls = true;
            au.src = blobUrl;
            au.style.cssText = "width:100%;height:38px";
            wrap.innerHTML = "";
            wrap.appendChild(au);
            au.play().catch(() => {});
          } else {
            btnOuvir.textContent = "↗️ Abrir áudio no navegador";
            btnOuvir.disabled = false;
            btnOuvir.onclick = () => window.open(u, "_blank", "noopener,noreferrer");
          }
        };
        wrap.appendChild(btnOuvir);
        card.appendChild(wrap);
      }

      chatEl.appendChild(card);
    });

    chatEl.scrollTop = chatEl.scrollHeight;
  }, 50);
}

async function buscarFotosWikimedia(termo) {
  const api = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: termo + " filetype:bitmap",
    gsrnamespace: "6",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url|mime|size",
    iiurlwidth: "900",
    format: "json",
    origin: "*"
  });
  const data = await fetchJson(api);
  const pages = Object.values(data?.query?.pages || {});
  const itens = [];
  for (const pg of pages) {
    const info = pg?.imageinfo?.[0];
    if (!info?.url || !/^image\/(jpeg|png|webp)$/i.test(info.mime || "")) continue;
    const ext = info.mime.includes("png") ? "png" : info.mime.includes("webp") ? "webp" : "jpg";
    const nomeLimpo = String(pg.title || "foto").replace(/^File:/i, "").slice(0, 48);
    itens.push({
      kind: "image",
      titulo: "🖼️ " + nomeLimpo,
      url: info.thumburl || info.url,
      pagina: info.descriptionurl || info.url,
      arquivo: nomeLimpo.replace(/[^a-zA-Z0-9._-]/g, "_") + "." + ext
    });
    if (itens.length >= 3) break;
  }
  return itens;
}

async function buscarAudiosLivres(termo) {
  const itens = [];

  // 1) Internet Archive (áudios/músicas em domínio público ou Creative Commons)
  const iaUrl = "https://archive.org/advancedsearch.php?" + new URLSearchParams({
    q: "(" + termo + ") AND mediatype:audio",
    "fl[]": "identifier,title,creator",
    "sort[]": "downloads desc",
    rows: "4",
    output: "json"
  });
  const ia = await fetchJson(iaUrl, 9000);
  const docs = ia?.response?.docs || [];

  await Promise.allSettled(docs.slice(0, 3).map(async d => {
    const meta = await fetchJson("https://archive.org/metadata/" + encodeURIComponent(d.identifier), 8000);
    const files = meta?.files || [];
    const arq = files.find(f => /\.(mp3|ogg|wav)$/i.test(f.name || "") && Number(f.size || 0) > 1000 && Number(f.size || 0) < 12 * 1024 * 1024);
    if (!arq) return;
    const ext = (arq.name.match(/\.(mp3|ogg|wav)$/i) || ["", "mp3"])[1].toLowerCase();
    const titulo = String(d.title || d.identifier).slice(0, 50);
    itens.push({
      kind: "audio",
      titulo: "🎵 " + titulo,
      url: "https://archive.org/download/" + encodeURIComponent(d.identifier) + "/" + encodeURIComponent(arq.name),
      pagina: "https://archive.org/details/" + encodeURIComponent(d.identifier),
      arquivo: titulo.replace(/[^a-zA-Z0-9._-]/g, "_") + "." + ext
    });
  }));

  // 2) Wikimedia Commons (efeitos sonoros, hinos, músicas clássicas, gravações livres)
  if (itens.length < 2) {
    const wmUrl = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: termo + " filetype:audio",
      gsrnamespace: "6",
      gsrlimit: "4",
      prop: "imageinfo",
      iiprop: "url|mime|size",
      format: "json",
      origin: "*"
    });
    const wm = await fetchJson(wmUrl, 9000);
    for (const pg of Object.values(wm?.query?.pages || {})) {
      const info = pg?.imageinfo?.[0];
      if (!info?.url || !/audio|ogg/i.test(info.mime || "")) continue;
      const nomeLimpo = String(pg.title || "audio").replace(/^File:/i, "").slice(0, 48);
      itens.push({
        kind: "audio",
        titulo: "🔊 " + nomeLimpo,
        url: info.url,
        pagina: info.descriptionurl || info.url,
        arquivo: nomeLimpo.replace(/[^a-zA-Z0-9._-]/g, "_")
      });
      if (itens.length >= 3) break;
    }
  }

  return itens.slice(0, 3);
}

async function buscarVideosOuFilmesLivres(termo, ehFilme = false) {
  const itens = [];
  const q = "(" + termo + ") AND mediatype:movies";
  const iaUrl = "https://archive.org/advancedsearch.php?" + new URLSearchParams({
    q,
    "fl[]": "identifier,title,year",
    "sort[]": "downloads desc",
    rows: "4",
    output: "json"
  });
  const ia = await fetchJson(iaUrl, 9000);
  const docs = ia?.response?.docs || [];

  await Promise.allSettled(docs.slice(0, 3).map(async d => {
    const meta = await fetchJson("https://archive.org/metadata/" + encodeURIComponent(d.identifier), 8000);
    const files = meta?.files || [];
    const arq = files.find(f => /\.(mp4|ogv|webm)$/i.test(f.name || "") && Number(f.size || 0) > 5000);
    if (!arq) return;
    const ext = (arq.name.match(/\.(mp4|ogv|webm)$/i) || ["", "mp4"])[1].toLowerCase();
    const titulo = String(d.title || d.identifier).slice(0, 48) + (d.year ? " (" + d.year + ")" : "");
    itens.push({
      kind: "video",
      titulo: (ehFilme ? "🎬 " : "🎥 ") + titulo,
      url: "https://archive.org/download/" + encodeURIComponent(d.identifier) + "/" + encodeURIComponent(arq.name),
      pagina: "https://archive.org/details/" + encodeURIComponent(d.identifier),
      arquivo: titulo.replace(/[^a-zA-Z0-9._-]/g, "_") + "." + ext
    });
  }));

  return itens.slice(0, 3);
}

async function tratarPedidoMidiaBaixar(t, raw) {
  const m = raw.match(/^(?:como\s+)?(?:baixa[r]?|abaixa[r]?|faz(?:er)?\s+download\s+d[eoa]?|manda(?:r)?|pega(?:r)?|envia(?:r)?|quero(?:\s+baixar)?)\s+(?:um|uma|o|a|os|as|uns|umas)?\s*(fotos?|imagens?|imagem|wallpaper|m[uú]sicas?|msc|[áa]udios?|sons?|v[íi]deos?|filmes?)(?:\s+(?:de|do|da|sobre|para|chamado|chamada))?\s*(.*)$/i);
  if (!m) return null;

  const tipoRaw = norm(m[1]);
  const termoBruto = String(m[2] || "")
    .replace(/\b(?:por favor|pfv|pra mim|para mim|aqui|para baixar|pra baixar|gratis|de graca)\b/gi, "")
    .replace(/[?!.]+$/, "")
    .trim();

  if (/\b(foto|fotos|imagem|imagens|wallpaper)\b/.test(tipoRaw)) {
    const busca = termoBruto || "natureza brasil";
    const fotos = await buscarFotosWikimedia(busca);
    if (fotos.length) {
      injetarCardsMidiaNoChat(fotos);
      return {
        texto: "🖼️ Encontrei **" + fotos.length + " foto(s) livres** para **“" + busca + "”** (Wikimedia Commons).\n\nVeja a prévia e toque em **⬇️ Baixar** nos cartões logo abaixo!",
        origem: "🖼️ fotos livres"
      };
    }
    return {
      texto: "🖼️ Não encontrei fotos livres com o termo **“" + busca + "”** no Wikimedia Commons. Tente palavras em português ou inglês mais simples (ex.: `baixar foto de leão`, `baixar imagem de lua`).",
      origem: "🖼️ fotos"
    };
  }

  if (/\b(musica|musicas|msc|audio|audios|som|sons)\b/.test(tipoRaw)) {
    const busca = termoBruto || "instrumental relaxante";
    const audios = await buscarAudiosLivres(busca);
    if (audios.length) {
      injetarCardsMidiaNoChat(audios);
      return {
        texto: "🎵 Encontrei **" + audios.length + " áudio(s)/música(s) em acervo público** para **“" + busca + "”**!\n\n" +
          "Você pode tocar em **▶️ Carregar player** para ouvir aqui mesmo ou em **⬇️ Baixar** para salvar o arquivo.\n\n" +
          "*(Se você procura uma música comercial protegida por direitos autorais, para baixar offline de forma legal use **Spotify**, **YouTube Music**, **Apple Music** ou **Deezer**.)*",
        origem: "🎵 áudios & músicas"
      };
    }
    return {
      texto: "🎵 Não achei arquivos gratuitos em domínio público para **“" + busca + "”**.\n\n" +
        "Para músicas comerciais protegidas por direitos autorais, o download offline oficial fica disponível nos apps **Spotify**, **YouTube Music**, **Deezer** ou **Apple Music**.\n" +
        "Se quiser áudios livres para ouvir/baixar aqui no chat, tente gêneros ou termos como `baixar musica lo-fi`, `baixar audio de chuva` ou `musica classica`!",
      origem: "🎵 música"
    };
  }

  if (/\b(video|videos|filme|filmes)\b/.test(tipoRaw)) {
    const ehFilme = /filme/.test(tipoRaw);
    const busca = termoBruto || (ehFilme ? "chaplin classic" : "natureza espaco");
    const videos = await buscarVideosOuFilmesLivres(busca, ehFilme);
    if (videos.length) {
      injetarCardsMidiaNoChat(videos);
      return {
        texto: (ehFilme ? "🎬" : "🎥") + " Encontrei **" + videos.length + " arquivo(s) em domínio público / livre** no Internet Archive para **“" + busca + "”**!\n\n" +
          "Toque em **⬇️ Baixar** ou **Fonte ↗** nos cartões abaixo.\n\n" +
          (ehFilme ? "*(Para filmes recentes de cinema/streaming com direitos autorais, o download offline legal é feito dentro da **Netflix**, **Prime Video**, **Disney+**, **Max** ou **YouTube Filmes**.)*" : ""),
        origem: ehFilme ? "🎬 filmes livres" : "🎥 vídeos livres"
      };
    }
    return {
      texto: (ehFilme ? "🎬" : "🎥") + " Não encontrei arquivos gratuitos livres para **“" + busca + "”**.\n\n" +
        "• **Filmes e séries comerciais:** podem ser baixados para assistir offline diretamente nos apps oficiais (**Netflix**, **Amazon Prime Video**, **Disney+**, **Max**, **Globoplay** ou **Apple TV**).\n" +
        "• **Filmes clássicos gratuitos (domínio público):** tente `baixar filme chaplin` ou `baixar video nasa`!",
      origem: ehFilme ? "🎬 filmes" : "🎥 vídeos"
    };
  }

  return null;
}

/* ---------- Extras: Hora Mundial, Receitas & Organizador de Listas ---------- */

const FUSOS = {
  "brasil": ["Brasil (Brasília)", "America/Sao_Paulo"],
  "brasilia": ["Brasília", "America/Sao_Paulo"],
  "sao paulo": ["São Paulo", "America/Sao_Paulo"],
  "portugal": ["Portugal (Lisboa)", "Europe/Lisbon"],
  "lisboa": ["Lisboa", "Europe/Lisbon"],
  "londres": ["Londres", "Europe/London"],
  "inglaterra": ["Inglaterra (Londres)", "Europe/London"],
  "paris": ["Paris", "Europe/Paris"],
  "franca": ["França (Paris)", "Europe/Paris"],
  "espanha": ["Espanha (Madri)", "Europe/Madrid"],
  "nova york": ["Nova York", "America/New_York"],
  "estados unidos": ["EUA (Nova York)", "America/New_York"],
  "eua": ["EUA (Nova York)", "America/New_York"],
  "los angeles": ["Los Angeles", "America/Los_Angeles"],
  "toquio": ["Tóquio", "Asia/Tokyo"],
  "japao": ["Japão (Tóquio)", "Asia/Tokyo"],
  "china": ["China (Pequim)", "Asia/Shanghai"],
  "coreia": ["Coreia do Sul (Seul)", "Asia/Seoul"],
  "argentina": ["Argentina (Buenos Aires)", "America/Argentina/Buenos_Aires"],
  "dubai": ["Dubai", "Asia/Dubai"],
  "italia": ["Itália (Roma)", "Europe/Rome"]
};

function horaMundial(t) {
  const m = t.match(/^(?:que horas sao|hora agora|horario)\s+(?:em|na|no|de)\s+(.+)$/);
  if (!m) return null;
  const lugar = m[1].trim();
  const entry = Object.entries(FUSOS).find(([k]) => lugar.includes(k));
  if (!entry) return null;
  const [nome, tz] = entry[1];
  try {
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      weekday: "long"
    }).format(new Date());
    return "🕒 Agora em **" + nome + "** são **" + fmt + "**.";
  } catch { return null; }
}

const RECEITAS = [
  [/\barroz\b/, "🍚 **Arroz soltinho rápido:**\n1. Refogue 1 dente de alho picado (e cebola, se quiser) em 1 colher de óleo/azeite.\n2. Adicione 1 xícara de arroz lavado e mexa por 1 minuto.\n3. Coloque **2 xícaras de água quente** e 1 colher rasa de chá de sal.\n4. Cozinhe em fogo baixo com a panela semi-tampada até secar (~12–15 min) e deixe descansar 5 min tampado."],
  [/\bbrigadeiro\b/, "🍫 **Brigadeiro tradicional:**\n1. Em uma panela, misture 1 lata de leite condensado, 1 colher de sopa de manteiga e 3 colheres de sopa de chocolate em pó (ou achocolatado).\n2. Cozinhe em fogo baixo mexendo **sem parar**.\n3. Quando desgrudar do fundo da panela (~8–10 min), desligue e deixe esfriar."],
  [/\bomelete\b/, "🍳 **Omelete simples:**\n1. Bata 2 ou 3 ovos com uma pitada de sal e pimenta.\n2. Aqueça a frigideira com um fio de azeite ou manteiga em fogo médio-baixo.\n3. Despeje os ovos, adicione queijo/tomate/cheiro-verde de um lado, dobre ao meio e sirva."],
  [/\bpanqueca\b/, "🥞 **Massa de panqueca básica:**\n1. Bata no liquidificador: 1 xícara de leite, 1 xícara de farinha de trigo, 1 ovo, 1 colher de sopa de óleo e 1 pitada de sal.\n2. Doure uma concha por vez em frigideira antiaderente untada, vire e recheie a gosto."],
  [/\bbolo simples|bolo de chocolate\b/, "🍰 **Bolo simples fofinho:**\n1. Bata 3 ovos, 1 xícara de açúcar, 1/2 xícara de óleo e 1 xícara de leite.\n2. Misture 2 xícaras de farinha de trigo (e 1/2 de chocolate em pó, se quiser de chocolate) e por último 1 colher de sopa de fermento.\n3. Asse em forma untada a **180 °C por ~35–40 minutos**."]
];

function receitaRapida(t) {
  if (!/\b(receita|como fazer|como prepara|preparo d)\b/.test(t)) return null;
  for (const [re, resp] of RECEITAS) if (re.test(t)) return resp;
  return null;
}

/* ---------- Catálogos & Contexto ---------- */

const FILMES_GENERO = {
  drama: [
    "Um Sonho de Liberdade (1994) — amizade e esperança dentro de uma prisão.",
    "À Espera de um Milagre (1999) — drama emocionante com realismo mágico.",
    "A Lista de Schindler (1993) — história real impactante da 2ª Guerra.",
    "À Procura da Felicidade (2006) — superação baseada em fatos reais.",
    "Central do Brasil (1998) — clássico nacional premiado e tocante.",
    "Parasita (2019) — drama social afiado cheio de reviravoltas."
  ],
  aventura: [
    "Interestelar (2014) — viagem espacial para salvar a humanidade.",
    "O Senhor dos Anéis: A Sociedade do Anel (2001) — épico de fantasia.",
    "Piratas do Caribe: A Maldição do Pérola Negra (2003) — aventura divertida.",
    "Jurassic Park (1993) — parque de dinossauros que sai do controle.",
    "Duna: Parte Dois (2024) — aventura épica de ficção científica."
  ],
  acao: [
    "Batman: O Cavaleiro das Trevas (2008) — ação policial e vilão icônico.",
    "Mad Max: Estrada da Fúria (2015) — ritmo frenético do início ao fim.",
    "John Wick: De Volta ao Jogo (2014) — coreografias de ação precisas.",
    "Top Gun: Maverick (2022) — ação aérea espetacular.",
    "Tropa de Elite (2007) — ação policial brasileira intensa."
  ],
  terror: [
    "Invocação do Mal (2013) — terror sobrenatural clássico.",
    "Corra! (2017) — terror psicológico inteligente e tenso.",
    "O Iluminado (1980) — suspense e terror psicológico atemporal.",
    "Hereditário (2018) — terror pesado e perturbador.",
    "Fale Comigo (2022) — terror moderno criativo."
  ],
  suspense: [
    "Seven: Os Sete Crimes Capitais (1995) — investigação policial sombria.",
    "Ilha do Medo (2010) — mistério em um hospital psiquiátrico.",
    "Os Suspeitos / Prisoners (2013) — suspense denso sobre sequestro.",
    "Garota Exemplar (2014) — reviravoltas sobre um desaparecimento.",
    "O Silêncio dos Inocentes (1991) — clássico policial e psicológico."
  ],
  comedia: [
    "Se Beber, Não Case! (2009) — comédia caótica em Las Vegas.",
    "As Branquelas (2004) — comédia popular no Brasil.",
    "O Auto da Compadecida (2000) — obra-prima do humor brasileiro.",
    "Minha Mãe é uma Peça (2013) — comédia nacional leve."
  ],
  ficcao: [
    "A Origem / Inception (2010) — invasão de sonhos em camadas.",
    "Interestelar (2014) — relatividade, buracos negros e emoção.",
    "Blade Runner 2049 (2017) — ficção visual sobre humanidade.",
    "A Chegada / Arrival (2016) — contato alienígena e linguagem.",
    "Ex Machina (2014) — suspense sobre inteligência artificial."
  ],
  romance: [
    "Questão de Tempo (2013) — romance leve sobre aproveitar a vida.",
    "Brilho Eterno de uma Mente Sem Lembranças (2004) — criativo e profundo.",
    "Orgulho e Preconceito (2005) — romance clássico de época.",
    "La La Land (2016) — romance musical sobre sonhos."
  ],
  animacao: [
    "Homem-Aranha no Aranhaverso (2018) — visual e história incríveis.",
    "A Viagem de Chihiro (2001) — fantasia mágica do Studio Ghibli.",
    "Divertida Mente (2015) — criativo sobre nossas emoções.",
    "Gato de Botas 2: O Último Pedido (2022) — aventura surpreendente."
  ],
  brasileiro: [
    "Cidade de Deus (2002) — referência mundial do cinema brasileiro.",
    "O Auto da Compadecida (2000) — humor e cultura nordestina geniais.",
    "Central do Brasil (1998) — drama humano premiado.",
    "Bacurau (2019) — faroeste, mistério e crítica social."
  ]
};

const MUSICAS_GENERO = {
  sertanejo: ["Chitãozinho & Xororó — Evidências", "Marília Mendonça — Infiel / Leão", "Jorge & Mateus — Sosseguei", "Henrique & Juliano — Liberdade Provisória", "Ana Castela — Nosso Quadro"],
  mpb: ["Tim Maia — Gostava Tanto de Você", "Djavan — Oceano", "Chico Buarque — Construção", "Elis Regina & Tom Jobim — Águas de Março", "Marisa Monte — Ainda Bem"],
  rock: ["Legião Urbana — Tempo Perdido", "Charlie Brown Jr. — Dias de Luta, Dias de Glória", "Skank — Vou Deixar", "Linkin Park — Numb / In The End"],
  rap: ["Racionais MC's — Vida Loka (Parte 1)", "Sabotage — Um Bom Lugar", "Emicida — AmarElo", "Djonga — Olho de Tigre", "Matuê — Máquina do Tempo"],
  samba: ["Cartola — As Rosas Não Falam", "Jorge Aragão — Coisa de Pele", "Zeca Pagodinho — Deixa a Vida Me Levar", "Menos é Mais — Melhor Eu Ir"],
  funk: ["MC Kevinho — Olha a Explosão", "Ludmilla — Favela Chegou", "Anitta — Envolver", "MC Hariel — Maçã Verde"],
  pop: ["Jão — Idiota", "Iza — Dona de Mim", "Anavitória — Trevo (Tu)", "The Weeknd — Blinding Lights"],
  eletronica: ["Alok — Hear Me Now", "Vintage Culture — Hollywood", "Avicii — Wake Me Up", "Daft Punk — Get Lucky"]
};

const SERIES_GERAL = [
  "Breaking Bad — professor vira mestre do crime em um drama impecável.",
  "Stranger Things — mistério, nostalgia dos anos 80 e ficção.",
  "Dark — ficção científica alemã genial sobre viagem no tempo.",
  "The Last of Us — drama pós-apocalíptico emocionante.",
  "The Boys — sátira ácida sobre super-heróis.",
  "Brooklyn Nine-Nine — comédia policial leve e rápida."
];

const COMPARACOES = {
  "javascript|python": "⚖️ **JavaScript vs Python:**\n• **JavaScript:** roda nativo no navegador, domina sites e apps web (React, Node.js).\n• **Python:** leitura mais limpa, domina dados, IA e automação.\n👉 Quer criar sites? Comece por JS. Quer dados/IA? Python.",
  "html|css": "⚖️ **HTML vs CSS:**\n• **HTML** é a estrutura (títulos, textos, botões).\n• **CSS** é o visual (cores, tamanhos, animações).",
  "ssd|hd": "⚖️ **SSD vs HD:**\n• **HD:** disco mecânico; mais barato, porém lento.\n• **SSD:** memória flash; muito mais rápido e silencioso.",
  "alcool|etanol|gasolina": "⚖️ **Etanol vs Gasolina:**\nDivida o preço do etanol pelo da gasolina. Se der **até 0,70**, o etanol costuma compensar.",
  "debito|credito": "⚖️ **Débito vs Crédito:**\n• **Débito:** sai na hora e evita dívida.\n• **Crédito:** concentra na fatura e parcela, mas exige pagar o total em dia para evitar juros rotativos.",
  "android|iphone|ios": "⚖️ **Android vs iPhone:**\n• **Android:** mais liberdade de arquivos, variedade de preços, Termux e personalização.\n• **iPhone (iOS):** integração estável, câmera consistente e boa revenda, com sistema mais fechado."
};

const CONHECIMENTO_PRATICO = [
  [/\b(dicas? de produtividade|como vencer a procrastin|procrastinacao|estudar melhor|como estudar|dicas? de foco|como ter foco|como me concentrar)\b/,
   "🎯 **Técnicas para focar e estudar melhor:**\n1. **Pomodoro:** 25 min focado + 5 min de pausa.\n2. **Estudo ativo:** explique o assunto em voz alta ou faça exercícios.\n3. **Regra dos 2 minutos:** se leva menos de 2 min, resolva agora."],
  [/\b(50 30 20|organizar dinheiro|como economizar|orcamento pessoal|educacao financeira|como guardar dinheiro)\b/,
   "💰 **Método 50-30-20:**\n• **50%** necessidades essenciais.\n• **30%** lazer e desejos.\n• **20%** reserva de emergência e investimentos."],
  [/\b(como fazer(?: uma)? redacao|estrutura(?: da)? redacao|dicas? de redacao|modelo de dissertacao|como escrever bem)\b/,
   "✍️ **Estrutura de Redação (ENEM):**\n1. **Introdução:** tema + tese + 2 argumentos.\n2. **D1 e D2:** defenda os argumentos com repertório e consequências.\n3. **Conclusão:** Quem + O quê + Como + Para quê + Detalhamento."],
  [/\b(dicas? de curriculo|como fazer(?: um)? curriculo|dicas? de entrevista|preparar para entrevista|conseguir(?: um)? emprego|arrumar emprego|procurar emprego)\b/,
   "💼 **Dicas de Currículo e Entrevista:**\n• Currículo direto em 1–2 páginas destacando resultados e o que você resolvia na prática.\n• Atualize LinkedIn/contatos avisando que está disponível.\n• Na entrevista use o método **STAR** (Situação, Tarefa, Ação, Resultado)."],
  [/\b(direitos? do consumidor|procon|direito de arrependimento|prazo(?: de)? garantia|reembolso compra online)\b/,
   "⚖️ **Direitos básicos (CDC Brasil):**\n• Compras online: **7 dias corridos** para devolução e reembolso total.\n• Defeito: 30 dias (não duráveis) ou 90 dias (duráveis) de garantia legal."],
  [/\b(fui demitido|mandado embora|direitos trabalhistas|acerto rescisao|seguro desemprego|aviso previo)\b.*\b(direito|direitos|receber|acerto|rescisao|fgts|quanto|o que fazer)\b/,
   "📋 **Checklist básico em demissão sem justa causa (CLT Brasil):**\n• Saldo de salário dos dias trabalhados + aviso prévio (trabalhado ou indenizado)\n• 13º proporcional + férias vencidas/proporcionais + 1/3\n• Saque do FGTS + multa de 40% sobre o saldo\n• Guias para Seguro-Desemprego (se cumprir o tempo mínimo)\n*Prazo legal para pagamento da rescisão: até 10 dias corridos.*"]
];

function extrairSitesAvaliados(history) {
  const sites = [];
  for (const m of (Array.isArray(history) ? history : [])) {
    if (!m || m.type === "user" || !m.text) continue;
    const txt = String(m.text);
    if (!txt.includes("AVALIAÇÃO DO SITE:")) continue;
    const url = (txt.match(/AVALIAÇÃO DO SITE:\*\*\s*`([^`]+)`/) || [])[1];
    const nota = Number((txt.match(/\*\*Nota:\*\*\s*([\d.]+)\/10/) || [])[1] || 0);
    const ms = Number((txt.match(/\((\d+)\s*ms\)/) || [])[1] || 99999);
    const pal = Number((txt.match(/\((\d+)\s*palavras\)/) || [])[1] || 0);
    if (url) sites.push({ url, nota, ms, pal });
  }
  return sites;
}

function compararUltimosSites(history) {
  const sites = extrairSitesAvaliados(history);
  if (sites.length < 2) return null;
  const a = sites[sites.length - 2];
  const b = sites[sites.length - 1];
  const nome = u => { try { return new URL(u).hostname.replace(/^www\./, "") + new URL(u).pathname.slice(0, 22); } catch { return u.slice(0, 35); } };

  let veredito = "";
  if (a.nota !== b.nota) {
    const win = a.nota > b.nota ? a : b;
    veredito = "🏆 Pela nota técnica, **" + nome(win.url) + "** se saiu melhor (**" + win.nota + "/10**).";
  } else if (Math.abs(a.ms - b.ms) > 150) {
    const fast = a.ms < b.ms ? a : b;
    veredito = "⚖️ Empate em nota (**" + a.nota + "/10**), mas **" + nome(fast.url) + "** carregou mais rápido (**" + fast.ms + " ms** contra **" + Math.max(a.ms, b.ms) + " ms**).";
  } else {
    veredito = "⚖️ Empate técnico (**" + a.nota + "/10** nos principais critérios).";
  }

  return "🔎 **Comparação entre os dois sites avaliados:**\n\n" +
    "1️⃣ **" + nome(a.url) + "** — Nota " + a.nota + "/10 • " + a.ms + " ms • " + a.pal + " palavras\n" +
    "2️⃣ **" + nome(b.url) + "** — Nota " + b.nota + "/10 • " + b.ms + " ms • " + b.pal + " palavras\n\n" +
    veredito;
}

function detectarAppRecente(history) {
  const h = Array.isArray(history) ? history : [];
  for (let i = h.length - 1; i >= Math.max(0, h.length - 12); i--) {
    const m = h[i];
    if (m && m.type !== "user" && m.text && /App criado completo \(`([^`]+)`\)/.test(m.text)) {
      return (m.text.match(/App criado completo \(`([^`]+)`\)/) || [])[1];
    }
  }
  return null;
}

function extrairUltimoCodigoDoHistorico(history) {
  const h = Array.isArray(history) ? history : [];
  for (let i = h.length - 1; i >= 0; i--) {
    const linhas = String(h[i]?.text || "").split(/\r?\n/);
    let inicio = -1, lang = "txt", fenceLen = 3;
    for (let j = 0; j < linhas.length; j++) {
      const m = linhas[j].trim().match(/^(`{3,})([\w+-]*)$/);
      if (m) {
        inicio = j;
        fenceLen = m[1].length;
        lang = m[2] || "txt";
        break;
      }
    }
    if (inicio >= 0) {
      let fim = -1;
      for (let j = linhas.length - 1; j > inicio; j--) {
        const mf = linhas[j].trim().match(/^(`{3,})$/);
        if (mf && mf[1].length >= fenceLen) { fim = j; break; }
      }
      if (fim > inicio + 1) {
        const code = linhas.slice(inicio + 1, fim).join("\n").trim();
        if (code.length > 15) return { lang, code };
      }
    }
  }
  return null;
}

async function buscarSeriesTVMaze(termo) {
  const arr = await fetchJson("https://api.tvmaze.com/search/shows?q=" + encodeURIComponent(termo), 8000);
  if (!Array.isArray(arr) || !arr.length) return null;
  const linhas = arr.slice(0, 6).map((item, i) => {
    const s = item.show;
    const ano = s.premiered ? " (" + s.premiered.slice(0, 4) + ")" : "";
    const nota = s.rating?.average ? " • Nota " + s.rating.average : "";
    const gens = (s.genres || []).slice(0, 3).join(", ");
    return (i + 1) + ". " + s.name + ano + nota + (gens ? " — " + gens : "");
  });
  return {
    texto: "📺 **Séries encontradas para “" + termo + "”:**\n\n" + linhas.join("\n") + "\n\n💡 Quer detalhes de alguma? Peça `pesquise sobre [nome da série]`.",
    origem: "📺 catálogo de séries"
  };
}

const TODOS_TEMAS = ["roxo", "vermelho", "azul", "verde", "rosa", "dourado", "neon"];

function detectarTemaPedido(t) {
  if (/^que tema o que$/.test(t)) return { ignora: true };
  if (/^(quais temas|temas|quais cores|mudar cor|trocar cor|mudar tema|trocar tema)$/.test(t)) {
    return { listar: true };
  }
  if (/^(?:muda|mudar|troca|trocar|escolhe|escolher)(?:\s+de)?\s+tema(?:\s+se\s+(?:voce\s+)?quiser|\s+aleatorio)?$/.test(t)) {
    return girar("auto-tema", TODOS_TEMAS);
  }
  if (/\b(significa|significado|por que|porque|qual e a cor|qual a cor|bandeira|arco iris|ceu|mar|sol|sangue|planta|redacao|conversa|poco|texto|assunto)\b/.test(t) &&
      !/\b(tema do site|tema do app|tema da tela|aparencia|interface)\b/.test(t)) {
    return null;
  }
  const pedeTema = /\b(tema|aparencia|visual|interface)\b/.test(t) ||
    /\b(?:muda|mudar|troca|trocar|coloca|colocar|bota|botar|deixa|deixar|ativa|ativar)\b.*\b(tema|cor|fundo|visual|tela)\b/.test(t) ||
    /\bcor\s+(?:do\s+site|da\s+tela|do\s+chat|do\s+fundo|para)\b/.test(t);
  if (!pedeTema) return null;

  if (/\bvermelh[oa]\b/.test(t)) return "vermelho";
  if (/\brox[oa]\b/.test(t)) return "roxo";
  if (/\bazul\b/.test(t)) return "azul";
  if (/\bverd[ea]\b/.test(t)) return "verde";
  if (/\brosa\b/.test(t)) return "rosa";
  if (/\bdourad[oa]|amarel[oa]|laranja\b/.test(t)) return "dourado";
  if (/\bneon|cyberpunk|colorid[oa]\b/.test(t)) return "neon";
  return null;
}

function gerarEscrita(t, raw) {
  const s = String(raw || "").slice(0, 800);
  const mEmail = s.match(/(?:escrev[ae]|faz|faca|crie|cria|monte|monta|redija)\s+(?:um\s+|uma\s+)?(e-?mail|mensagem|carta|aviso|convite|texto|redacao|historia|conto|legenda|bio|poema|roteiro)\s*(?:sobre|de|para|com o tema)?\s*(.+)?/i);
  if (!mEmail) return null;
  const tipo = norm(mEmail[1]);
  const assunto = (mEmail[2] || "o assunto pedido").replace(/[?!.]+$/, "").trim().slice(0, 120);

  if (/email|carta/.test(tipo)) {
    return "✉️ **Rascunho de E-mail sobre “" + assunto + "”:**\n\n" +
      "**Assunto:** " + assunto.charAt(0).toUpperCase() + assunto.slice(1) + "\n\n" +
      "Olá, [Nome],\n\nEspero que esteja tudo bem.\n\n" +
      "Escrevo para tratar sobre **" + assunto + "**. Gostaria de alinhar os próximos passos e confirmar sua disponibilidade.\n\n" +
      "Atenciosamente,\n[Seu Nome]";
  }
  if (/mensagem|aviso|convite/.test(tipo)) {
    return "💬 **Modelo de Mensagem sobre “" + assunto + "”:**\n\nOi, [Nome]! Tudo bem?\nEstou passando para falar sobre **" + assunto + "**. Quando puder, me dá um retorno.";
  }
  if (/legenda|bio/.test(tipo)) {
    return "✨ **Legendas sobre “" + assunto + "”:**\n\n1. \"Um passo de cada vez na direção certa. (" + assunto + ")\"\n2. \"Foco no processo, consistência no resultado.\"";
  }
  if (/redacao/.test(tipo)) {
    return "📝 **Esqueleto de Redação sobre “" + assunto + "”:**\n\n• **Introdução:** contextualize **" + assunto + "** e apresente sua tese.\n• **D1:** causas do problema.\n• **D2:** impactos na sociedade.\n• **Conclusão:** proposta prática (Quem, O quê, Como e Para quê).";
  }
  if (/historia|conto|roteiro/.test(tipo)) {
    return "📖 **História curta — “" + assunto + "”:**\n\nTudo começou em uma tarde comum, quando um pequeno detalhe sobre **" + assunto + "** chamou atenção. Cada pista levava a uma escolha difícil: seguir o seguro ou investigar a fundo. No fim, a resposta estava exatamente naquilo que ninguém havia observado antes.";
  }
  return null;
}

function detectarGeneroFilme(t) {
  if (/drama|triste|emocion/.test(t)) return ["drama", "Drama"];
  if (/aventura|epico|viagem/.test(t)) return ["aventura", "Aventura"];
  if (/acao|luta|tiro|adrenalina/.test(t)) return ["acao", "Ação"];
  if (/terror|medo|susto|horror/.test(t)) return ["terror", "Terror"];
  if (/suspense|misterio|policial|investigacao/.test(t)) return ["suspense", "Suspense"];
  if (/comedia|engracado|humor|rir/.test(t)) return ["comedia", "Comédia"];
  if (/ficcao|espaco|futuro|sci fi/.test(t)) return ["ficcao", "Ficção Científica"];
  if (/romance|amor|casal/.test(t)) return ["romance", "Romance"];
  if (/animacao|desenho|infantil/.test(t)) return ["animacao", "Animação"];
  if (/brasileir|nacional/.test(t)) return ["brasileiro", "Cinema Brasileiro"];
  return null;
}

function detectarGeneroMusica(t) {
  if (/sertanejo|modao|sofr/.test(t)) return ["sertanejo", "Sertanejo"];
  if (/mpb|classico brasileiro|bossa/.test(t)) return ["mpb", "MPB"];
  if (/rock/.test(t)) return ["rock", "Rock"];
  if (/rap|hip hop|trap/.test(t)) return ["rap", "Rap / Hip-Hop"];
  if (/samba|pagode/.test(t)) return ["samba", "Samba / Pagode"];
  if (/funk/.test(t)) return ["funk", "Funk"];
  if (/pop/.test(t)) return ["pop", "Pop"];
  if (/eletronica|dj|edm/.test(t)) return ["eletronica", "Eletrônica"];
  return null;
}

function detectarTopicoRecente(ctx) {
  const fonte = norm((ctx.alvo || "") + " " + (ctx.ultimoBot || "") + " " + (ctx.ultimoTema || ""));
  if (/\b(filme|filmes|cinema|interestelar|parasita|duna)\b/.test(fonte)) return "filmes";
  if (/\b(serie|series|breaking bad|stranger things|dark|tvmaze)\b/.test(fonte)) return "series";
  if (/\b(anime|animes|myanimelist|jikan|one piece|frieren)\b/.test(fonte)) return "animes";
  if (/\b(musica|musicas|sertanejo|mpb|rock|rap|funk|pagode)\b/.test(fonte)) return "musicas";
  if (/\b(jogo|jogos|game|games)\b/.test(fonte)) return "jogos";
  return ctx.ultimoTema ? String(ctx.ultimoTema) : "";
}

function extrairItemLista(texto, num) {
  const linhas = String(texto || "").split("\n").map(l => l.trim());
  const re = new RegExp("^" + num + "[.)\\-]\\s+(.+)$");
  for (const l of linhas) {
    const m = l.match(re);
    if (m) return m[1].replace(/\*\*/g, "").split("—")[0].trim();
  }
  return null;
}

function detectarRefinamentoContextual(t, ctx) {
  if (t.split(" ").length > 10) return null;
  const pedeAtual = /\b(atualizado|atualizados|atualizada|atual|atuais|de agora|agora|recente|recentes|mais novo|mais novos|lancamento|lancamentos|2025|2026|desse ano|deste ano|hoje em dia)\b/.test(t);
  const pedeMelhorOuOutro = /^(?:me\s+)?(?:passa|manda|da|mostra|traz|quero|busca)\s+(?:um|uns|uma|umas|outro|outros|algo)?\s*(?:melhor|melhores|atualizado|atualizados|de agora|recente|recentes|mais novos?)(?:\s+(?:de agora|atualizado|2025|2026))?$/.test(t);
  const pedeItemNumero = t.match(/^(?:me\s+)?(?:fala|explica|detalha|pesquisa|sobre|qual e)\s+(?:o|a)?\s*(?:numero\s+)?(\d{1,2})\b/);

  const topico = detectarTopicoRecente(ctx);
  if (pedeItemNumero && (ctx.alvo || ctx.ultimoBot)) {
    const item = extrairItemLista(ctx.alvo || ctx.ultimoBot, pedeItemNumero[1]);
    if (item) {
      return { pesquisarTema: item + (topico && !item.toLowerCase().includes(topico) ? " " + topico : "") };
    }
  }

  if ((pedeAtual || pedeMelhorOuOutro) && topico) {
    const ano = String(new Date().getFullYear());
    if (topico === "filmes") return { pesquisarTema: "melhores filmes lancamentos recentes " + (Number(ano) - 1) + " " + ano };
    if (topico === "series") return { pesquisarTema: "melhores series recentes " + (Number(ano) - 1) + " " + ano };
    if (topico === "animes") return { pesquisarTema: "melhores animes recentes " + (Number(ano) - 1) + " " + ano };
    if (topico === "musicas") return { pesquisarTema: "musicas mais tocadas brasil " + ano };
    if (topico === "jogos") return { pesquisarTema: "melhores jogos lancamentos " + ano };
    return { pesquisarTema: topico + " atualizado " + ano };
  }

  return null;
}

function responderSobreCitacao(t, raw, ctx) {
  const alvo = String(ctx.alvo || "").trim();
  if (!alvo) return null;
  const alvoNorm = norm(alvo);
  const trecho = alvo.replace(/\s+/g, " ").slice(0, 110);
  const retic = alvo.length > 110 ? "..." : "";

  if (/\b(copia|copiar|manda de novo|manda inteiro|codigo)\b/.test(t)) {
    return {
      texto: "Aqui está o trecho citado pronto para copiar por inteiro:\n\n" + wrapCodeFence(alvo, "txt"),
      origem: "📋 cópia da mensagem citada"
    };
  }

  const refCit = detectarRefinamentoContextual(t, ctx);
  if (refCit) return refCit;

  if (/\b(bach ai|criada por rizik|ajudar todo mundo de graca|memoria continua)\b/.test(alvoNorm)) {
    if (/\b(e isso e bom|isso e bom|e bom|presta|vale a pena|legal|top|massa)\b/.test(t)) {
      return {
        texto: "A ideia aqui é exatamente essa: unir privacidade, memória contínua, ferramentas práticas e busca na web sem depender de APIs pagas nem responder como um robô travado. O que você acha que ainda pode melhorar?",
        origem: "💬 sobre a resposta citada"
      };
    }
    if (/\b(nao|ruim|fraco|falta|melhorar)\b/.test(t)) {
      return {
        texto: "Crítica direta ajuda bem mais que elogio genérico. Qual parte específica desse comportamento está te incomodando mais?",
        origem: "💬 sobre a resposta citada"
      };
    }
  }

  if (/\b(referente|sua resposta|sua pergunta|quando (?:eu )?digo|quando disse|eu disse isso|tava respondendo|estava respondendo|era resposta|foi resposta|respondi voce)\b/.test(t)) {
    if (/desculpa por ter pesquisado|o que voce esperava dessa mensagem|saiu do alvo|fugido do assunto/.test(alvoNorm)) {
      return {
        texto: "Fechou — você estava apenas respondendo à minha fala anterior e eu desviei para pesquisa sem precisar. Seguindo daqui: como estão as coisas por aí?",
        origem: "💬 sobre a resposta citada"
      };
    }
    return {
      texto: "Entendi — você está conectando isso direto com o trecho citado (**“" + trecho + retic + "”**). Pode continuar nessa linha.",
      origem: "💬 sobre a resposta citada"
    };
  }

  if (/^(?:e |mas )?(?:isso|isto|ele|ela)\s+(?:e|eh|ta|esta)?\s*(?:bom|boa|ruim|verdade|serio|certo|normal)$/.test(t) ||
      /^(?:serio|jura|mesmo|como assim|por que|porque|nao entendi|gostei|legal|daora|interessante|nao concordo|explica|discordo|verdade|concordo)$/.test(t) ||
      (/\b(isso|disso|nisso|essa parte|esse trecho|sua resposta|sua fala|vc disse|voce disse)\b/.test(t) && t.split(" ").length <= 16)) {
    if (/\b(bom|boa|legal|gostei|daora|interessante|verdade|concordo)\b/.test(t)) {
      return {
        texto: "Sobre **“" + trecho + retic + "”** — sim, faz bastante diferença na prática. Quer que eu aprofunde algum ponto específico daí?",
        origem: "💬 sobre a resposta citada"
      };
    }
    if (/\b(ruim|errado|nao entendi|como assim|por que|porque|discordo|nao concordo)\b/.test(t)) {
      return {
        texto: "Sobre **“" + trecho + retic + "”** — me diga qual parte soou errada ou confusa aí que eu reformulo de forma mais clara.",
        origem: "💬 sobre a resposta citada"
      };
    }
    return {
      texto: "Sobre **“" + trecho + retic + "”**: você quer que eu detalhe melhor esse ponto ou mude a abordagem?",
      origem: "💬 sobre a resposta citada"
    };
  }

  return null;
}

function resolverEscolhaOuDilema(t, raw) {
  if (raw.startsWith("/")) return null;
  if (/\b(converter|km|metros|kg|gramas|celsius|fahrenheit|pesquise|codigo)\b/.test(t)) return null;

  const mDuv = t.match(/^(?:to|estou|tou)\s+em\s+duvida\s+(?:se|entre)\s+(.+)$/) ||
    t.match(/^(?:voce acha que )?(?:eu\s+)?(?:devo|vale a pena|e melhor)\s+(.+?)\s+ou\s+(.+)$/);
  if (mDuv) {
    if (mDuv[2]) {
      const op1 = mDuv[1].trim(), op2 = mDuv[2].trim();
      return {
        texto: "⚖️ Entre **" + op1 + "** e **" + op2 + "**, vale pesar três critérios:\n\n" +
          "1. **Custo de reversão:** qual dos dois é mais fácil corrigir se der errado?\n" +
          "2. **Ganho real em 6 meses:** qual aproxima mais do que você realmente quer construir?\n" +
          "3. **Desgaste imediato:** qual te dá mais clareza e menos estresse hoje?\n\n" +
          "Se quiser, me conte o contexto de cada opção que analisamos juntos.",
        origem: "🧠 apoio à decisão"
      };
    }
    return {
      texto: "🤔 Quando a dúvida aperta sobre **" + mDuv[1].trim() + "**, ajuda colocar no papel o pior cenário realista de cada caminho. O que está pesando mais contra uma das escolhas?",
      origem: "🧠 apoio à decisão"
    };
  }

  const mOu = t.match(/^(?:voce prefere|qual e melhor|melhor)\s+([a-z0-9\s]{2,25})\s+ou\s+([a-z0-9\s]{2,25})$/);
  if (mOu && !/\b(site|link)\b/.test(t)) {
    const a = mOu[1].trim(), b = mOu[2].trim();
    return {
      texto: "⚖️ Entre **" + a + "** e **" + b + "**, depende do objetivo: **" + a + "** costuma levar vantagem em praticidade e **" + b + "** no resultado/conforto. Para o que você quer usar agora?",
      origem: "💬 análise"
    };
  }

  return null;
}

async function responder(raw, ctx = {}) {
  const s = String(raw || "");
  if (!s || s.length > 1200) return null;
  const t = norm(s);
  if (!t) return null;
  const serio = ctx.mood === "frustrado" || ctx.mood === "serio" || ctx.mood === "triste" || (ctx.humorScore ?? 0) <= -0.6;
  const temPerguntaPendente = Boolean(ctx.session?.lastBotQuestion);

  if (ctx.alvo) {
    const respCit = responderSobreCitacao(t, s, ctx);
    if (respCit) return respCit;
  }

  const refSemCit = detectarRefinamentoContextual(t, ctx);
  if (refSemCit) return refSemCit;

  if (/\b(copia|copiar|manda|reenvia|me da|mostra)\b.*\b(codigo|codigos|script|html)\b/.test(t) &&
      !/\.[a-z]{2,4}\b/i.test(s) &&
      !/\b(cria|crie|faz|faca|escrev|gerar|gera|explica|revisa|erro|como)\b/.test(t) &&
      t.split(" ").length <= 12) {
    if (ctx.ultimoArquivo?.texto && ctx.ultimoArquivo.texto.length > 40) {
      return { usarMenteTexto: true };
    }
    const codHist = extrairUltimoCodigoDoHistorico(ctx.history);
    if (codHist) {
      return {
        texto: "📋 Aqui está o último código completo para copiar sem cortes:\n\n" + wrapCodeFence(codHist.code, codHist.lang),
        origem: "📋 cópia de código"
      };
    }
  }

  if (/^\/?(diagnostico|saude|relatorio de erros|autoavaliacao|monitoramento)$/i.test(t)) {
    return { texto: AutoGuard.diagnose(), origem: "🛡️ autoguard" };
  }
  if (/^\/?rollback$/i.test(t)) {
    if (ctx.modoCriador === false) {
      return { texto: "🔒 O comando `/rollback` é exclusivo do modo administrador.", origem: "🔒 adm" };
    }
    const rb = AutoGuard.rollback();
    return {
      texto: rb.ok
        ? "♻️ Rollback concluído! Restaurei a memória limpa de " + new Date(rb.at).toLocaleString("pt-BR") + "."
        : "Não foi possível fazer rollback: " + rb.msg,
      origem: "🛡️ rollback"
    };
  }

  // Pedido direto no estilo dos prints: "Fala em português"
  if (/^(?:me\s+)?(?:respond[ae]|fal[ae]|escrev[ae]|convers[ae])\s+(?:so\s+)?em\s+portugues$/.test(t)) {
    return {
      texto: "Claro! Pode falar comigo em português. Em que posso ajudar?",
      origem: "💬 conversa"
    };
  }

  // Pergunta clássica dos prints: "Qual e melhor jogador do mundo?"
  if (/^(?:qual|quem)\s+(?:e\s+)?(?:o\s+)?melhor\s+jogador\s+(?:de\s+futebol\s+)?do\s+mundo(?:\s+(?:hoje|atualmente|agora|2026))?$/.test(t)) {
    return {
      texto: "Essa é uma pergunta sem resposta única — depende muito do critério e do gosto de cada um!\n\n" +
        "**No momento atual (temporada 2025/2026):**\n" +
        "• **Harry Kane** — venceu a **Bola de Ouro 2026**, impulsionado por números altíssimos de gols e títulos.\n" +
        "• **Kylian Mbappé** — 2º na Bola de Ouro 2026, referência em velocidade e decisão no Real Madrid.\n" +
        "• **Lamine Yamal** — 3º na Bola de Ouro 2026, grande destaque jovem pelo Barcelona e Espanha.\n" +
        "• **Ousmane Dembélé, Erling Haaland, Vinícius Júnior e Jude Bellingham** — seguem entre os nomes mais influentes do futebol mundial.\n\n" +
        "Historicamente, **Lionel Messi** e **Cristiano Ronaldo** dominaram esse debate por quase duas décadas, e muita gente ainda os considera os maiores da história.\n\n" +
        "Você tem algum palpite ou time do coração? 😁",
      origem: "⚽ futebol (2026)"
    };
  }

  // Buscador de mídias para ouvir, ver e baixar (fotos, áudios/músicas, vídeos/filmes)
  const midiaResp = await tratarPedidoMidiaBaixar(t, s);
  if (midiaResp) return midiaResp;

  // Hora mundial
  const hMundial = horaMundial(t);
  if (hMundial) return { texto: hMundial, origem: "🕒 fuso horário" };

  // Receitas rápidas
  const recRap = receitaRapida(t);
  if (recRap) return { texto: recRap, origem: "🍳 receitas" };

  // Organizador de listas
  const mOrg = s.match(/^(?:organiza|organize|organizar|ordena|ordene|enumera|enumere)\s+(?:essa|esta|a)?\s*lista\s*:?\s*([\s\S]+)$/i);
  if (mOrg) {
    const itens = mOrg[1].split(/\s*[,;\n]+\s*/).map(x => x.trim()).filter(Boolean);
    if (itens.length >= 2) {
      return {
        texto: "📋 **Lista organizada:**\n\n" + itens.map((x, i) => (i + 1) + ". " + x.charAt(0).toUpperCase() + x.slice(1)).join("\n"),
        origem: "📋 organização"
      };
    }
  }

  if (/\b(so queria (?:ter )?um dialogo|queria (?:ter )?um dialogo|dialogo bom|conversar direito|conversa normal|sem testar|nao quero testar|nao quero comando|para de mandar comando|para de perguntar|muito vaga|sem argumento|respostas vagas|muito robo|parece robo|parece um robo)\b/.test(t) ||
      /^(?:que|q)\s+pergunta\s+(?:cara|e essa|nada a ver|bosta)$/.test(t)) {
    if (/nao quero testar/.test(t)) {
      return { texto: "Certo, nada de testes ou comandos. Sobre o que você quer conversar agora?", origem: "💬 diálogo" };
    }
    if (/robo|vaga|argumento/.test(t)) {
      return { texto: "Faz sentido a crítica — respostas automáticas genéricas irritam mesmo. Pode trazer uma situação real, uma opinião ou uma dúvida que eu respondo direto.", origem: "💬 diálogo" };
    }
    if (/pergunta/.test(t)) {
      return { texto: "Desculpa, essa pergunta automática saiu fora de hora. Pode seguir normal.", origem: "💬 diálogo" };
    }
    return { texto: "Justo — vou cortar os bordões automáticos e responder de forma mais direta e natural. O que você quer puxar agora?", origem: "💬 diálogo" };
  }

  if (/\b(entre essas duas|entre esses dois|qual e a melhor|qual e o melhor|qual das duas|qual dos dois|qual dessas|qual desses)\b/.test(t)) {
    const compSites = compararUltimosSites(ctx.history);
    if (compSites) return { texto: compSites, origem: "⚖️ comparação de sites" };
  }

  if (/^(?:pode\s+)?(?:parar|para|pausar|pausa|zerar|resetar)(?:\s+(?:o\s+)?(?:time|timer|tempo|cronometro|app|relogio))?$/.test(t)) {
    const appRec = detectarAppRecente(ctx.history);
    if (appRec) {
      return {
        texto: "⏱️ O app **`" + appRec + "`** roda num cartão isolado (Sandbox) — toque no botão **⏸ Pausar** dentro do preview acima.",
        origem: "▶️ controle do preview"
      };
    }
    return {
      texto: "Para cancelar uma resposta em andamento, toque em **⏹**. Se for um app aberto no chat, use os botões dentro do próprio preview.",
      origem: "🧠 contexto"
    };
  }

  if (/^(?:o que eu faco|oque eu faco|me da um conselho|preciso de um conselho|qual o melhor caminho|nao sei o que fazer)$/.test(t)) {
    const sit = ctx.session?.situation?.resumo;
    if (sit) {
      return {
        texto: "Pensando na sua situação (" + sit + "): evite decidir algo definitivo no calor do momento. Liste o que está sob o seu controle hoje, proteja seu descanso e resolva um passo concreto por vez. Qual parte está pesando mais agora?",
        origem: "🧠 conselho contextual"
      };
    }
    return {
      texto: "Me dê um pouco mais de contexto — quais são as opções na mesa e o que você teme que aconteça em cada uma?",
      origem: "🧠 conselho"
    };
  }

  const dilema = resolverEscolhaOuDilema(t, s);
  if (dilema) return dilema;

  if (/^(?:vamos\s+(?:de|se)\s+senha|senha|gera\w*\s+senha|manda\s+uma\s+senha|me\s+da\s+uma\s+senha|quero\s+uma\s+senha)$/.test(t) ||
      /^\/senha(?:\s+(\d{1,2}))?$/i.test(s.trim())) {
    const tam = (s.match(/\d{1,2}/) || [])[0] || 14;
    return { texto: senhaRapida(tam), origem: "🔐 utilidades" };
  }

  const temaPedido = detectarTemaPedido(t);
  if (temaPedido) {
    if (temaPedido.ignora) return { texto: "Certo, mantenho o tema atual. Pode mandar o assunto.", origem: "💬 conversa" };
    if (temaPedido.listar) {
      return {
        texto: "🎨 **Temas disponíveis:** 💜 Roxo • ❤️ Vermelho • 💙 Azul • 💚 Verde • 🩷 Rosa • 💛 Dourado • ⚡ Neon.\n\nPeça por exemplo: **“muda o tema para azul”** ou escolha no menu ☰.",
        origem: "🎨 temas"
      };
    }
    return { tema: temaPedido };
  }

  if (/\b(voce|bach)\b/.test(t) && /\b(serve|servir|presta|funciona|utilidade|objetivo|capacidade)\b/.test(t)) {
    return {
      texto: "Sou a **BACH AI**, criada por Rizik para rodar leve e gratuita com motor próprio:\n• Converso mantendo contexto e memória em 3 camadas.\n• Analiso textos, códigos, links, fotos (com OCR) e vídeos.\n• Busco fotos, áudios/músicas e vídeos livres para ouvir/baixar no chat.\n• Crio apps web (`/app`), rodo JS em sandbox (`/executar`) e avalio sites (`/site`).\n• Pesquiso na internet, traduzo idiomas e faço cálculos e revisões.",
      origem: "🧠 sobre a BACH"
    };
  }
  if (/^(eu sou seu dono|sou seu dono|eu te criei|sou seu criador|sou o rizik)$/.test(t)) {
    return {
      texto: ctx.modoCriador
        ? "👑 Sim, Rizik — seu acesso administrador já está ativo."
        : "Fui criada por Rizik! Para que eu lembre seu nome nas conversas comuns, diga `meu nome é ...`.",
      origem: "🧠 sobre a BACH"
    };
  }
  if (/\b(como posso te melhorar|como te melhorar|o que melhorar em voce|auto se arrumar|se corrigir|consegue se corrigir)\b/.test(t)) {
    return {
      texto: "🛠️ Eu registro falhas pelo **AutoGuard** e aprendo respostas novas com `ensine: pergunta => resposta`.\n• Quando uma resposta sair errada, diga o que esperava ou use **↩ Responder**.\n• O administrador pode revisar erros reais em **🚨 Erros do Público**, auditar com `/auditar` e atualizar módulos via `/editar`.",
      origem: "🛡️ evolução"
    };
  }
  if (/^e do o que exatamente voce entende$/.test(t) || /^do que voce entende$/.test(t)) {
    return {
      texto: "Trabalho bem com programação e Termux, criação de apps (`/app`), matemática/conversões, revisão de português e código (`/revisar`), avaliação de sites (`/site`), tradução, busca de mídias livres, ciência/história e pesquisa web com fontes. Digite `/ajuda` para ver tudo.",
      origem: "🧠 habilidades"
    };
  }

  if (/^(?:eu\s+)?fal[oa]\s+(?:sobre|de)\s+numer/.test(t)) {
    return {
      texto: "Se for cálculo, pode mandar direto (ex.: `15 * 8` ou `15% de 200`). Para numerar uma resposta anterior em lista, use **↩ Responder** nela e diga **“em lista”**.",
      origem: "🔢 dica"
    };
  }
  if (/^pesquisa(?:r)?\s+tudo\s+(?:o\s+)?que\s+voce\s+(?:quiser|querer)$/.test(t)) {
    return {
      texto: "Manda só um tema ou curiosidade (astronomia, história, tecnologia, psicologia) que eu busco algo interessante e direto.",
      origem: "💬 conversa"
    };
  }
  if (/^(?:eu\s+(?:estou|to)\s+aqui\s+testando\s+voce|e\s+eu\s+aqui\s+testando\s+voce|testando\s+voce|to\s+te\s+testando)$/.test(t)) {
    return {
      texto: "Pode testar à vontade — quanto mais casos reais você jogar aqui, mais fácil fica achar o que precisa ajustar. Se algo falhar, `/auditar` lista tudo.",
      origem: "💬 conversa"
    };
  }
  if (/^(?:ja\s+escrevi|escrevi\s+ja)$/.test(t)) {
    return {
      texto: "Se veio só pontuação ou espaço, chegou vazio aqui. Pode escrever com palavras o que queria mandar.",
      origem: "💬 conversa"
    };
  }
  if (!temPerguntaPendente && /^(?:claro|assim|entendii?|fala mais|uai pesquisa)$/.test(t)) {
    if (t === "uai pesquisa") return { texto: "Qual tema você quer que eu pesquise?", origem: "💬 conversa" };
    if (t === "fala mais" && ctx.ultimoTema) return { pesquisarTema: ctx.ultimoTema + " curiosidades detalhes" };
    return {
      texto: serio ? "Estou acompanhando. Pode continuar." : "Certo, pode seguir daí.",
      origem: "💬 conversa"
    };
  }

  if (/\b(nao foi|nao era|falou errado|disse errado|respondeu errado|entendeu errado|errando|ta errado|esta errado|vc ainda erra|voce ainda erra|so erra|voce e burro|burro|burra|nada a ver|nada aver|nada haver|erros atrais|erros atras|da erro|dando erro|para de dizer que travou|travou foi|pergutar mais|chutar o que|chutar oq|nao mandei pesquisar|nao pedi pesquisa|nao pedi pra pesquisar|nao era pra pesquisar|para de pesquisar|so pesquisa|o que (?:voce )?nao entendeu|senha bosta|chatao|pqp bach|o droga)\b/.test(t) ||
      /^(te |quero |vou |vamos te |irei te )?(corrigir|arrumar|consertar|ensinar)( ta)?$/.test(t) ||
      /\b(arrumo tudo|arrumo voce|irei te consertar|para que fui criala)\b/.test(t)) {
    if (!ehEntradaSensivel(s)) {
      AutoGuard.recordFailure({ module: "conversa", type: "user-feedback", input: s, detail: ctx.ultimoBot ? ctx.ultimoBot.slice(0, 100) : "insatisfação" });
    }
    return {
      texto: semRepetir("fb-err", [
        "Realmente errei essa. Me diga em uma frase direta o que você queria dizer ou saber agora.",
        "Essa resposta saiu fora do ponto. Pode mandar direto o que esperava (ou usar **↩ Responder** na mensagem certa)."
      ], ctx),
      origem: "🔄 autocorreção"
    };
  }

  if (/^(porque nao|porque nao pode|como assim|perguntar o que|oque perguntar|ah ta claro)$/.test(t)) {
    if (ctx.ultimoBot && /calendário|lançamentos futuros/i.test(ctx.ultimoBot)) {
      return {
        texto: "Porque não tenho garantia de um calendário completo de estreias futuras sem fonte ao vivo específica — prefiro avisar do que inventar datas.",
        origem: "🧠 contexto"
      };
    }
    return { texto: "Pode falar do jeito que preferir — uma dúvida, um assunto do dia ou algum texto para analisar.", origem: "💬 conversa" };
  }

  if (!temPerguntaPendente && /^(?:aham|ahan|uhum|ok|okay|ta\s*bom|tabom|blz|beleza|ata|entendi|tendi|saquei|fechou|suave|de boa|firmeza|show|top|pode crer)(?:\s+(?:tabom|ta\s*bom|entao|ne|blz|ok|po))*$/.test(t)) {
    return null;
  }

  if (/\b(ta feio|ta osso|ta dificil|ta complicado|que coisa)\b/.test(t) && t.split(" ").length <= 7) {
    const sit = ctx.session?.situation?.resumo;
    if (/dialogo|conversar|travado|pergunta|entendeu/.test(String(ctx.ultimoBot || "").toLowerCase())) {
      return {
        texto: "Vacilei deixando o papo travado antes. Agora pode mandar qualquer assunto direto que eu acompanho.",
        origem: "💬 diálogo"
      };
    }
    return {
      texto: sit
        ? "Imagino que esteja pesado com isso (" + sit + "). Quer conversar sobre o que dá para ajustar nisso ou mudar de foco?"
        : "Quando acumula tudo de uma vez pesa mesmo. Se quiser detalhar o que está pegando, estou ouvindo.",
      origem: "💬 conversa"
    };
  }

  if (/^(conversa comigo|vamos conversar|bora conversar|fala comigo|fale comigo)$/.test(t)) {
    return {
      texto: semRepetir("conv-solta", [
        "Claro. O que está na sua cabeça hoje — algum projeto, uma dúvida ou só trocar ideia?",
        "Estou por aqui. Quer debater algum tema, contar como foi seu dia ou testar alguma ferramenta?"
      ], ctx),
      origem: "💬 conversa"
    };
  }
  if (/^(ae+|uai+|vixi+|vish+|eita+|oxe+|oxente|vey.*|uhum.*|ta mas pera.*|para+|wtf|so voce tem problemas)$/.test(t)) {
    return {
      texto: serio
        ? "Se algo que eu disse soou errado, me avisa direto o que foi."
        : "Algo te surpreendeu aí? Pode falar direto.",
      origem: "💬 conversa"
    };
  }

  if (/^(para que serve|serve para que|ele faz o que|ela faz o que|isso faz o que|como isso funciona|como funciona|me da um exemplo|da um exemplo)$/.test(t)) {
    if (ctx.ultimoArquivo?.texto) return { usarMenteTexto: true };
    if (ctx.ultimoTema) return { pesquisarTema: ctx.ultimoTema + " para que serve como funciona" };
    return { texto: "Para que serve o quê exatamente? Cole o texto/código ou diga o nome do assunto.", origem: "🧠 contexto" };
  }

  const pedeRec = /\b(recomenda\w*|indica\w*|suger\w*|lista\w*|melhores|bons|boas|quero assistir|quero ouvir|procura|manda|mandar)\b/.test(t);
  const pedeAtual = /\b(atualizado|atualizados|recente|recentes|de agora|2025|2026|novo|novos|lancamento|lancamentos)\b/.test(t);
  const genMusica = detectarGeneroMusica(t);
  if (genMusica && (pedeRec || t.split(" ").length <= 4) && !pedeAtual) {
    const [key, nome] = genMusica;
    return {
      texto: "🎶 **Recomendações de " + nome + ":**\n\n" + MUSICAS_GENERO[key].map((m, i) => (i + 1) + ". " + m).join("\n") +
        "\n\n💡 Se quiser outro estilo (sertanejo, MPB, rock, rap, samba, funk, pop, eletrônica), é só falar.",
      origem: "🎵 recomendações"
    };
  }
  if (/\bmusica\b/.test(t) && (pedeRec || /\bumas ai\b/.test(t)) && !pedeAtual) {
    return {
      texto: "🎶 **Músicas brasileiras para ouvir:**\n\n• **Sertanejo:** Marília Mendonça — Leão\n• **MPB:** Tim Maia — Gostava Tanto de Você\n• **Rock:** Charlie Brown Jr. — Dias de Luta, Dias de Glória\n• **Rap:** Racionais MC's — Vida Loka (Parte 1)\n• **Pagode:** Menos é Mais — Melhor Eu Ir\n\nDiga o estilo se quiser uma lista focada.",
      origem: "🎵 recomendações"
    };
  }

  const genFilme = detectarGeneroFilme(t);
  if (/\b(filme|filmes)\b/.test(t) && (pedeRec || genFilme) && !pedeAtual) {
    if (genFilme) {
      const [key, nome] = genFilme;
      return {
        texto: "🎬 **Filmes recomendados de " + nome + ":**\n\n" + FILMES_GENERO[key].map((f, i) => (i + 1) + ". " + f).join("\n") +
          "\n\nSe quiser filmes mais recentes (2025/2026) ou de outro gênero, peça `filmes recentes`.",
        origem: "🎬 recomendações"
      };
    }
  }

  if (/\b(serie|series)\b/.test(t) && pedeRec && !pedeAtual) {
    const termoLimpo = t.replace(/\b(me|recomenda\w*|indica\w*|suger\w*|uma|umas|serie|series|boas|bons|de|para|assistir)\b/g, "").trim();
    if (termoLimpo.length >= 3) {
      const tv = await buscarSeriesTVMaze(termoLimpo);
      if (tv) return tv;
    }
    return {
      texto: "📺 **Séries recomendadas:**\n\n" + SERIES_GERAL.map((s, i) => (i + 1) + ". " + s).join("\n") +
        "\n\nSe quiser buscar por um gênero ou tema específico, me diga qual.",
      origem: "📺 recomendações"
    };
  }

  const mComp = t.match(/(?:diferenca entre|compar\w* entre|pros e contras de|vantagens e desvantagens de)\s+(.+?)\s+e\s+(.+)/) ||
                t.match(/^(.+?)\s+(?:vs|versus)\s+(.+)$/);
  if (mComp) {
    const a = mComp[1].trim(), b = mComp[2].trim();
    for (const [chaves, resp] of Object.entries(COMPARACOES)) {
      const partes = chaves.split("|");
      if (partes.some(p => a.includes(p)) && partes.some(p => b.includes(p))) return { texto: resp, origem: "⚖️ comparação" };
    }
  }

  for (const [re, resp] of CONHECIMENTO_PRATICO) {
    if (re.test(t)) return { texto: resp, origem: "📚 conhecimento prático" };
  }

  const mPlano = t.match(/^(?:cria|crie|faz|faca|monta|monte|me ajuda a)?\s*(?:um\s+)?(?:plano de estudos|roteiro de estudos|como aprender|passo a passo para aprender)\s+(?:de\s+|para\s+)?(.+)$/);
  if (mPlano) {
    const temaEstudo = mPlano[1].trim().slice(0, 120);
    return {
      texto: "🗺️ **Plano prático para aprender " + temaEstudo + ":**\n\n1. **Fundamentos:** entenda os conceitos-chave antes de decorar detalhes.\n2. **Prática diária:** 30 minutos aplicando em problemas reais.\n3. **Projeto pequeno:** construa algo seu usando " + temaEstudo + ".\n4. **Revisão ativa:** tente explicar o que aprendeu sem olhar anotações.",
      origem: "🗺️ planejamento"
    };
  }

  const escrita = gerarEscrita(t, s);
  if (escrita) return { texto: escrita, origem: "✍️ escrita criativa" };

  return null;
}

export const CerebroAvancado = { responder, wrapCodeFence };
