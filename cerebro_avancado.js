/* BACH AI 5.7 - CÉREBRO AVANÇADO ESTILO CLAUDE + MÍDIAS + CONHECIMENTO GERAL
 * - Responde no estilo natural e estruturado dos prints (tópicos claros, linguagem humana, pergunta de volta).
 * - Corrige "Que dia é hj?", "Amanhã é qual dia?", "Vc é Claude?", "Vc é baseado no quê?", textos/histórias originais, "PC barato pela net", "Jogos de futebol", "Mundo vai acabar?", "Mais inteligente do mundo".
 * - Buscador legal de fotos, áudios/músicas e vídeos/filmes livres no chat + orientação para comerciais.
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
  .replace(/\bhj\b/g, "hoje")
  .replace(/\bnd\b/g, "nada")
  .replace(/\bq\b/g, "que")
  .replace(/\b(tlvz)\b/g, "talvez")
  .replace(/\b(tbm|tb|tmb)\b/g, "tambem")
  .replace(/\b(msm)\b/g, "mesmo")
  .replace(/\b(cvs)\b/g, "conversar")
  .replace(/\b(dnv)\b/g, "de novo")
  .replace(/\b(cel|celukar|celula)\b/g, "celular")
  .replace(/\bmelho\b/g, "melhor")
  .replace(/\batualisado\b/g, "atualizado")
  .replace(/\b(obgd|obg|obgda)\b/g, "obrigado")
  .replace(/\bss+\b/g, "sim")
  .replace(/\b(ben)\b/g, "bem")
  .replace(/\beai+\b/g, "e ai")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const giro = Object.create(null);
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

function semRepetir(k, arr, ctx = {}) {
  const ult = (Array.isArray(ctx.history) ? ctx.history : [])
    .filter(m => m && m.type !== "user" && m.text).slice(-14).map(m => String(m.text).trim());
  for (let i = 0; i < arr.length; i++) {
    const c = girar(k, arr);
    if (!ult.includes(c.trim())) return c;
  }
  return girar(k, arr);
}

function wrapCodeFence(code, lang = "txt") {
  const s = String(code || "");
  const runs = s.match(/`{3,}/g) || [];
  const f = "`".repeat(runs.reduce((m, r) => Math.max(m, r.length), 2) + 1);
  return f + (lang || "txt") + "\n" + s + "\n" + f;
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
      const a = new Uint32Array(1); crypto.getRandomValues(a); idx = a[0] % chars.length;
    }
    out += chars[idx];
  }
  return "🔐 **Senha forte gerada (" + tam + " caracteres):**\n\n`" + out + "`\n\nℹ️ Gerada localmente no seu aparelho (não salvo senhas).";
}

/* ---------- Buscador Legal de Mídias (Fotos, Áudios/Músicas, Vídeos/Filmes) ---------- */

function urlHttpSegura(u) {
  try { const p = new URL(String(u || "").trim()); return (p.protocol === "https:" || p.protocol === "http:") ? p.href : null; }
  catch { return null; }
}

async function fetchJson(url, ms = 10000) {
  const c = new AbortController(); const id = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url, { signal: c.signal }); return r.ok ? await r.json() : null; }
  catch { return null; } finally { clearTimeout(id); }
}

async function tentarBlobDownload(url, maxBytes = 12 * 1024 * 1024) {
  const c = new AbortController(); const id = setTimeout(() => c.abort(), 12000);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) return null;
    const len = Number(r.headers.get("content-length") || 0);
    if (len > maxBytes) return null;
    const blob = await r.blob();
    if (blob.size > maxBytes || blob.size < 200) return null;
    return URL.createObjectURL(blob);
  } catch { return null; } finally { clearTimeout(id); }
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
        btnBaixar.disabled = true; btnBaixar.textContent = "⏳ Baixando...";
        const blobUrl = await tentarBlobDownload(u);
        if (blobUrl) {
          const a = document.createElement("a"); a.href = blobUrl; a.download = item.arquivo || "midia-bach"; a.click();
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
      linkPagina.target = "_blank"; linkPagina.rel = "noopener noreferrer";
      linkPagina.textContent = "Fonte ↗";
      linkPagina.style.cssText = "color:var(--accent2);font-size:12px;font-weight:bold;text-decoration:none;padding:0 4px";

      top.append(tit, btnBaixar, linkPagina);
      card.appendChild(top);

      if (item.kind === "image") {
        const img = document.createElement("img");
        img.src = u; img.alt = item.titulo; img.loading = "lazy";
        img.style.cssText = "width:100%;max-height:280px;object-fit:contain;background:#080912;display:block";
        card.appendChild(img);
      } else if (item.kind === "audio") {
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:8px 10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap";
        const btnOuvir = document.createElement("button");
        btnOuvir.textContent = "▶️ Carregar player";
        btnOuvir.style.cssText = "padding:6px 12px;font-size:12px;border-radius:8px;background:rgba(255,255,255,.12)";
        btnOuvir.onclick = async () => {
          btnOuvir.disabled = true; btnOuvir.textContent = "⏳ Carregando áudio...";
          const blobUrl = await tentarBlobDownload(u);
          if (blobUrl) {
            const au = document.createElement("audio");
            au.controls = true; au.src = blobUrl; au.style.cssText = "width:100%;height:38px";
            wrap.innerHTML = ""; wrap.appendChild(au); au.play().catch(() => {});
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
    action: "query", generator: "search", gsrsearch: termo + " filetype:bitmap",
    gsrnamespace: "6", gsrlimit: "5", prop: "imageinfo", iiprop: "url|mime|size", iiurlwidth: "900", format: "json", origin: "*"
  });
  const data = await fetchJson(api);
  const itens = [];
  for (const pg of Object.values(data?.query?.pages || {})) {
    const info = pg?.imageinfo?.[0];
    if (!info?.url || !/^image\/(jpeg|png|webp)$/i.test(info.mime || "")) continue;
    const ext = info.mime.includes("png") ? "png" : info.mime.includes("webp") ? "webp" : "jpg";
    const nomeLimpo = String(pg.title || "foto").replace(/^File:/i, "").slice(0, 48);
    itens.push({ kind: "image", titulo: "🖼️ " + nomeLimpo, url: info.thumburl || info.url, pagina: info.descriptionurl || info.url, arquivo: nomeLimpo.replace(/[^a-zA-Z0-9._-]/g, "_") + "." + ext });
    if (itens.length >= 3) break;
  }
  return itens;
}

async function buscarAudiosLivres(termo) {
  const itens = [];
  const ia = await fetchJson("https://archive.org/advancedsearch.php?" + new URLSearchParams({
    q: "(" + termo + ") AND mediatype:audio", "fl[]": "identifier,title", "sort[]": "downloads desc", rows: "4", output: "json"
  }), 9000);
  await Promise.allSettled((ia?.response?.docs || []).slice(0, 3).map(async d => {
    const meta = await fetchJson("https://archive.org/metadata/" + encodeURIComponent(d.identifier), 8000);
    const arq = (meta?.files || []).find(f => /\.(mp3|ogg|wav)$/i.test(f.name || "") && Number(f.size || 0) > 1000 && Number(f.size || 0) < 12 * 1024 * 1024);
    if (!arq) return;
    const ext = (arq.name.match(/\.(mp3|ogg|wav)$/i) || ["", "mp3"])[1].toLowerCase();
    const titulo = String(d.title || d.identifier).slice(0, 50);
    itens.push({ kind: "audio", titulo: "🎵 " + titulo, url: "https://archive.org/download/" + encodeURIComponent(d.identifier) + "/" + encodeURIComponent(arq.name), pagina: "https://archive.org/details/" + encodeURIComponent(d.identifier), arquivo: titulo.replace(/[^a-zA-Z0-9._-]/g, "_") + "." + ext });
  }));
  if (itens.length < 2) {
    const wm = await fetchJson("https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
      action: "query", generator: "search", gsrsearch: termo + " filetype:audio", gsrnamespace: "6", gsrlimit: "4", prop: "imageinfo", iiprop: "url|mime|size", format: "json", origin: "*"
    }), 9000);
    for (const pg of Object.values(wm?.query?.pages || {})) {
      const info = pg?.imageinfo?.[0];
      if (!info?.url || !/audio|ogg/i.test(info.mime || "")) continue;
      const nomeLimpo = String(pg.title || "audio").replace(/^File:/i, "").slice(0, 48);
      itens.push({ kind: "audio", titulo: "🔊 " + nomeLimpo, url: info.url, pagina: info.descriptionurl || info.url, arquivo: nomeLimpo.replace(/[^a-zA-Z0-9._-]/g, "_") });
      if (itens.length >= 3) break;
    }
  }
  return itens.slice(0, 3);
}

async function buscarVideosOuFilmesLivres(termo, ehFilme = false) {
  const itens = [];
  const ia = await fetchJson("https://archive.org/advancedsearch.php?" + new URLSearchParams({
    q: "(" + termo + ") AND mediatype:movies", "fl[]": "identifier,title,year", "sort[]": "downloads desc", rows: "4", output: "json"
  }), 9000);
  await Promise.allSettled((ia?.response?.docs || []).slice(0, 3).map(async d => {
    const meta = await fetchJson("https://archive.org/metadata/" + encodeURIComponent(d.identifier), 8000);
    const arq = (meta?.files || []).find(f => /\.(mp4|ogv|webm)$/i.test(f.name || "") && Number(f.size || 0) > 5000);
    if (!arq) return;
    const ext = (arq.name.match(/\.(mp4|ogv|webm)$/i) || ["", "mp4"])[1].toLowerCase();
    const titulo = String(d.title || d.identifier).slice(0, 48) + (d.year ? " (" + d.year + ")" : "");
    itens.push({ kind: "video", titulo: (ehFilme ? "🎬 " : "🎥 ") + titulo, url: "https://archive.org/download/" + encodeURIComponent(d.identifier) + "/" + encodeURIComponent(arq.name), pagina: "https://archive.org/details/" + encodeURIComponent(d.identifier), arquivo: titulo.replace(/[^a-zA-Z0-9._-]/g, "_") + "." + ext });
  }));
  return itens.slice(0, 3);
}

const FILMES_COMERCIAIS_RE = /\b(vingadores|avengers|homem aranha|spider man|batman|superman|avatar|titanic|deadpool|divertida mente|moana|frozen|harry potter|velozes e furiosos|john wick|interestelar|barbie|oppenheimer|coringa|joker|pantera negra|guardioes da galaxia|duna|wicked|gladiador|marvel|disney)\b/;

async function tratarPedidoMidiaBaixar(t, raw) {
  const m = raw.match(/^(?:como\s+)?(?:baixa[r]?|abaixa[r]?|faz(?:er)?\s+download\s+d[eoa]s?|manda(?:r)?|pega(?:r)?|envia(?:r)?|quero(?:\s+baixar)?)\s+(?:um|uma|o|a|os|as|uns|umas)?\s*(fotos?|imagens?|imagem|wallpaper|m[uú]sicas?|msc|[áa]udios?|sons?|v[íi]deos?|filmes?|funk|sertanejo|rap|trap|rock|pagode|eletr[oô]nica)(?:\s+(?:dos|das|nos|nas|de|do|da|sobre|para|chamado|chamada))?\s*(.*)$/i);
  if (!m) {
    const mArt = raw.match(/^(?:baixa[r]?|abaixa[r]?)\s+(?:a\s+m[uú]sica\s+d[eo]\s+|som\s+d[eo]\s+)?(dj\s+\S+|mc\s+\S+|.+)$/i);
    if (!mArt) return null;
    const alvoTxt = mArt[1].trim();
    if (/\b(gta|minecraft|roblox|fortnite|free fire|app|jogo|pdf|arquivo)\b/i.test(alvoTxt)) return null;
    const audios = await buscarAudiosLivres(alvoTxt);
    if (audios.length) {
      injetarCardsMidiaNoChat(audios);
      return { texto: "🎵 Encontrei **" + audios.length + " áudio(s)** livres para **“" + alvoTxt + "”** logo abaixo! *(Músicas comerciais de artistas ficam disponíveis para download offline nos apps Spotify, YouTube Music ou Deezer.)*", origem: "🎵 música" };
    }
    return {
      texto: "🎵 **“" + alvoTxt + "”** é música comercial protegida por direitos autorais, então não posso baixar o MP3 direto aqui.\n\nVocê consegue ouvir e baixar offline de forma oficial pelo **Spotify**, **YouTube Music**, **Deezer** ou **Apple Music**. Se quiser áudios livres para testar o player aqui no chat, tente `baixar audio de chuva` ou `baixar musica lo-fi`!",
      origem: "🎵 música"
    };
  }

  const tipoRaw = norm(m[1]);
  const termoBruto = String(m[2] || "")
    .replace(/^(?:dos|das|nos|nas|de|do|da)\s+/i, "")
    .replace(/\b(?:por favor|pfv|pra mim|para mim|aqui|para baixar|pra baixar|gratis|de graca)\b/gi, "")
    .replace(/[?!.]+$/, "").trim();

  if (/\b(foto|fotos|imagem|imagens|wallpaper)\b/.test(tipoRaw)) {
    const busca = termoBruto || "natureza brasil";
    const fotos = await buscarFotosWikimedia(busca);
    if (fotos.length) {
      injetarCardsMidiaNoChat(fotos);
      return { texto: "🖼️ Encontrei **" + fotos.length + " foto(s) livres** para **“" + busca + "”** (Wikimedia Commons). Veja abaixo e toque em **⬇️ Baixar**!", origem: "🖼️ fotos livres" };
    }
    return {
      texto: "🖼️ Não encontrei fotos livres para **“" + busca + "”** no Wikimedia Commons (ele guarda fotos reais/educacionais, não avatares ou artes de anime).\n\nTente termos como `baixar foto de leão`, `baixar foto da lua` ou `baixar foto de carro`!",
      origem: "🖼️ fotos"
    };
  }

  if (/\b(musica|musicas|msc|audio|audios|som|sons|funk|sertanejo|rap|trap|rock|pagode|eletronica)\b/.test(tipoRaw)) {
    const busca = (/\b(funk|sertanejo|rap|trap|rock|pagode|eletronica)\b/.test(tipoRaw) ? tipoRaw + " " + termoBruto : termoBruto).trim() || "instrumental";
    const audios = await buscarAudiosLivres(busca);
    if (audios.length) {
      injetarCardsMidiaNoChat(audios);
      return {
        texto: "🎵 Encontrei **" + audios.length + " áudio(s) livres** para **“" + busca + "”**! Toque em **▶️ Carregar player** para ouvir ou **⬇️ Baixar**.\n\n*(Para músicas comerciais atuais como funk brasileiro/sertanejo, o download offline oficial é pelo **Spotify**, **YouTube Music** ou **Deezer**.)*",
        origem: "🎵 áudios & músicas"
      };
    }
    return {
      texto: "🎵 Não achei áudios livres de **“" + busca + "”** em acervo público. Músicas comerciais protegidas por direitos autorais são baixadas offline oficialmente pelo **Spotify**, **YouTube Music**, **Deezer** ou **Apple Music**.",
      origem: "🎵 música"
    };
  }

  if (/\b(video|videos|filme|filmes)\b/.test(tipoRaw)) {
    const ehFilme = /filme/.test(tipoRaw);
    if (ehFilme && !termoBruto) {
      return {
        texto: "🎬 Qual filme você procura?\n\n• **Filmes comerciais recentes:** o download offline oficial fica dentro dos apps **Netflix**, **Prime Video**, **Disney+**, **Max** ou **YouTube Filmes**.\n• **Filmes clássicos gratuitos (domínio público):** diga o nome (ex.: `baixar filme chaplin` ou `baixar filme nosferatu`) que eu busco o `.mp4` livre no Internet Archive!",
        origem: "🎬 filmes"
      };
    }
    if (ehFilme && FILMES_COMERCIAIS_RE.test(norm(termoBruto))) {
      return {
        texto: "🎬 **“" + termoBruto + "”** é um filme comercial protegido por direitos autorais, então não existe download gratuito legal em `.mp4` aberto.\n\nPara assistir e **baixar offline com segurança**, procure o título no catálogo oficial da **Disney+**, **Netflix**, **Prime Video**, **Max** ou para aluguel/compra no **YouTube Filmes** / **Apple TV**.",
        origem: "🎬 filmes"
      };
    }
    const busca = termoBruto || "natureza espaco";
    const videos = await buscarVideosOuFilmesLivres(busca, ehFilme);
    if (videos.length) {
      injetarCardsMidiaNoChat(videos);
      return {
        texto: (ehFilme ? "🎬" : "🎥") + " Encontrei **" + videos.length + " arquivo(s) em domínio público** no Internet Archive para **“" + busca + "”**! Toque em **⬇️ Baixar** abaixo.",
        origem: ehFilme ? "🎬 filmes livres" : "🎥 vídeos livres"
      };
    }
    return {
      texto: (ehFilme ? "🎬" : "🎥") + " Não encontrei arquivos gratuitos livres para **“" + busca + "”**.\n\nPara filmes comerciais, use o download offline dos apps oficiais (**Netflix**, **Prime Video**, **Disney+**, **Max**).",
      origem: ehFilme ? "🎬 filmes" : "🎥 vídeos"
    };
  }
  return null;
}

/* ---------- Extras: Datas, Hora Mundial, Receitas, Textos/Histórias ---------- */

const DIAS_SEM = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
function responderDataRapida(t) {
  const agora = new Date();
  if (/^(?:que\s+dia\s+(?:e|eh)(?:\s+hoje)?|hoje\s+(?:e|eh)\s+(?:que|qual)\s+dia|qual\s+(?:a\s+)?data(?:\s+de\s+hoje)?)$/.test(t)) {
    return "📅 Hoje é **" + DIAS_SEM[agora.getDay()] + "**, **" + agora.toLocaleDateString("pt-BR") + "**.";
  }
  if (/^(?:amanha\s+(?:e|eh|sera)\s+(?:que|qual)\s+dia|que\s+dia\s+(?:e|eh|sera)\s+amanha)$/.test(t)) {
    const am = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
    return "📅 Amanhã será **" + DIAS_SEM[am.getDay()] + "**, **" + am.toLocaleDateString("pt-BR") + "**.";
  }
  if (/^(?:ontem\s+(?:foi|era)\s+(?:que|qual)\s+dia|que\s+dia\s+foi\s+ontem)$/.test(t)) {
    const on = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 1);
    return "📅 Ontem foi **" + DIAS_SEM[on.getDay()] + "**, **" + on.toLocaleDateString("pt-BR") + "**.";
  }
  return null;
}

const FUSOS = {
  "brasil": ["Brasil (Brasília)", "America/Sao_Paulo"], "brasilia": ["Brasília", "America/Sao_Paulo"],
  "sao paulo": ["São Paulo", "America/Sao_Paulo"], "portugal": ["Portugal (Lisboa)", "Europe/Lisbon"],
  "lisboa": ["Lisboa", "Europe/Lisbon"], "londres": ["Londres", "Europe/London"],
  "paris": ["Paris", "Europe/Paris"], "nova york": ["Nova York", "America/New_York"],
  "estados unidos": ["EUA (Nova York)", "America/New_York"], "toquio": ["Tóquio", "Asia/Tokyo"],
  "japao": ["Japão (Tóquio)", "Asia/Tokyo"], "china": ["China (Pequim)", "Asia/Shanghai"],
  "coreia": ["Coreia do Sul (Seul)", "Asia/Seoul"], "argentina": ["Argentina (Buenos Aires)", "America/Argentina/Buenos_Aires"]
};
function horaMundial(t) {
  const m = t.match(/^(?:que horas sao|hora agora|horario)\s+(?:em|na|no|de)\s+(.+)$/);
  if (!m) return null;
  const entry = Object.entries(FUSOS).find(([k]) => m[1].includes(k));
  if (!entry) return null;
  const [nome, tz] = entry[1];
  try {
    return "🕒 Agora em **" + nome + "** são **" + new Intl.DateTimeFormat("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit", weekday: "long" }).format(new Date()) + "**.";
  } catch { return null; }
}

const RECEITAS = [
  [/\barroz\b/, "🍚 **Arroz soltinho rápido:**\n1. Refogue 1 dente de alho picado em 1 colher de óleo.\n2. Adicione 1 xícara de arroz lavado e mexa por 1 minuto.\n3. Coloque **2 xícaras de água quente** e 1 colher rasa de chá de sal.\n4. Cozinhe em fogo baixo semi-tampado até secar (~12–15 min) e descanse 5 min tampado."],
  [/\bbrigadeiro\b/, "🍫 **Brigadeiro tradicional:**\n1. Misture 1 lata de leite condensado, 1 colher de sopa de manteiga e 3 colheres de sopa de chocolate em pó.\n2. Cozinhe em fogo baixo mexendo sempre até desgrudar do fundo (~8–10 min)."],
  [/\bomelete\b/, "🍳 **Omelete simples:**\n1. Bata 2 ou 3 ovos com sal.\n2. Aqueça a frigideira com um fio de azeite, despeje os ovos, recheie a gosto e dobre ao meio."],
  [/\bpanqueca\b/, "🥞 **Massa de panqueca:**\nBata 1 xícara de leite, 1 de farinha de trigo, 1 ovo, 1 colher de óleo e sal; doure uma concha por vez na frigideira."],
  [/\bbolo simples|bolo de chocolate\b/, "🍰 **Bolo fofinho:**\nBata 3 ovos, 1 xícara de açúcar, 1/2 de óleo e 1 de leite; misture 2 xícaras de farinha (e 1/2 de chocolate, se quiser) + 1 colher de fermento e asse a **180 °C por ~35–40 min**."]
];

function gerarEscrita(t, raw) {
  const s = String(raw || "").slice(0, 800);
  const m = s.match(/(?:escrev[ae]|faz|faca|crie|cria|monte|monta|redija|conta|conte)\s+(?:um\s+|uma\s+)?(e-?mail|mensagem|carta|aviso|convite|texto(?:\s+legal)?|redacao|hist[oó]ria|conto|legenda|bio|poema|roteiro)(?:\s+que\s+(?:vc|voc[eê])\s+criou|\s+sobre|\s+de|\s+para|\s+com\s+o\s+tema)?\s*(.*)$/i);
  if (!m) return null;
  const tipo = norm(m[1]);
  const assunto = (m[2] || "uma aventura inesperada").replace(/^(?:de|do|da|sobre|para)\s+/i, "").replace(/[?!.]+$/, "").trim().slice(0, 120) || "uma aventura inesperada";

  if (/email|carta/.test(tipo)) {
    return "✉️ **Rascunho de E-mail sobre “" + assunto + "”:**\n\n**Assunto:** " + assunto.charAt(0).toUpperCase() + assunto.slice(1) + "\n\nOlá, [Nome],\n\nEspero que esteja tudo bem. Escrevo para tratar sobre **" + assunto + "** e alinhar os próximos passos.\n\nAtenciosamente,\n[Seu Nome]";
  }
  if (/mensagem|aviso|convite/.test(tipo)) {
    return "💬 **Modelo de Mensagem:**\n\nOi, [Nome]! Tudo bem? Estou passando para falar sobre **" + assunto + "**. Quando puder, me dá um retorno.";
  }
  if (/legenda|bio/.test(tipo)) {
    return "✨ **Legendas sobre “" + assunto + "”:**\n\n1. \"Um passo de cada vez na direção certa. (" + assunto + ")\"\n2. \"Foco no processo, consistência no resultado.\"";
  }
  if (/redacao/.test(tipo)) {
    return "📝 **Esqueleto de Redação sobre “" + assunto + "”:**\n\n• **Introdução:** contextualize **" + assunto + "** e apresente sua tese.\n• **D1 e D2:** causas e impactos.\n• **Conclusão:** Quem + O quê + Como + Para quê.";
  }
  if (/texto/.test(tipo)) {
    return "📝 **Texto sobre " + assunto + ":**\n\nQuando olhamos com atenção para **" + assunto + "**, percebemos que os pequenos detalhes do dia a dia fazem toda a diferença. Seja pela companhia, pela lealdade ou pelo aprendizado que trazem, é justamente na simplicidade que **" + assunto + "** transforma a nossa rotina para melhor.\n\nQuer que eu faça esse texto mais engraçado, poético ou informativo?";
  }
  if (/historia|conto|roteiro/.test(tipo)) {
    return "📖 **História original — " + assunto + ":**\n\nNaquela noite, todas as luzes do bairro apagaram de repente, deixando apenas o brilho fraco de uma lanterna antiga na varanda. Enquanto os vizinhos tentavam entender o que havia acontecido, um som rítmico vinha do terreno vazio da esquina — como alguém batendo código Morse num portão de ferro. Ao se aproximar, a surpresa: não era um pedido de socorro, e sim o mapa de um lugar que ninguém no mapa da cidade sabia que existia.\n\nQuer que eu continue essa história ou invente outra de terror, ação ou comédia?";
  }
  return null;
}

/* ---------- Catálogos & Contexto ---------- */

const FILMES_GENERO = {
  drama: ["Um Sonho de Liberdade (1994)", "À Espera de um Milagre (1999)", "À Procura da Felicidade (2006)", "Central do Brasil (1998)", "Parasita (2019)"],
  aventura: ["Interestelar (2014)", "O Senhor dos Anéis (2001)", "Piratas do Caribe (2003)", "Jurassic Park (1993)", "Duna: Parte Dois (2024)"],
  acao: ["Batman: O Cavaleiro das Trevas (2008)", "Mad Max: Estrada da Fúria (2015)", "John Wick (2014)", "Top Gun: Maverick (2022)", "Tropa de Elite (2007)"],
  terror: ["Invocação do Mal (2013)", "Corra! (2017)", "O Iluminado (1980)", "Hereditário (2018)", "Fale Comigo (2022)"],
  suspense: ["Seven (1995)", "Ilha do Medo (2010)", "Os Suspeitos (2013)", "Garota Exemplar (2014)", "O Silêncio dos Inocentes (1991)"],
  comedia: ["Se Beber, Não Case! (2009)", "As Branquelas (2004)", "O Auto da Compadecida (2000)", "Minha Mãe é uma Peça (2013)"],
  ficcao: ["A Origem (2010)", "Interestelar (2014)", "Blade Runner 2049 (2017)", "A Chegada (2016)", "Ex Machina (2014)"],
  romance: ["Questão de Tempo (2013)", "Brilho Eterno de uma Mente Sem Lembranças (2004)", "Orgulho e Preconceito (2005)", "La La Land (2016)"],
  animacao: ["Homem-Aranha no Aranhaverso (2018)", "A Viagem de Chihiro (2001)", "Divertida Mente (2015)", "Gato de Botas 2 (2022)"],
  brasileiro: ["Cidade de Deus (2002)", "O Auto da Compadecida (2000)", "Central do Brasil (1998)", "Bacurau (2019)"]
};

const MUSICAS_GENERO = {
  sertanejo: ["Chitãozinho & Xororó — Evidências", "Marília Mendonça — Leão", "Jorge & Mateus — Sosseguei", "Ana Castela — Nosso Quadro"],
  mpb: ["Tim Maia — Gostava Tanto de Você", "Djavan — Oceano", "Chico Buarque — Construção", "Elis Regina & Tom Jobim — Águas de Março"],
  rock: ["Legião Urbana — Tempo Perdido", "Charlie Brown Jr. — Dias de Luta, Dias de Glória", "Skank — Vou Deixar", "Linkin Park — Numb"],
  rap: ["Racionais MC's — Vida Loka (Parte 1)", "Sabotage — Um Bom Lugar", "Emicida — AmarElo", "Matuê — Máquina do Tempo"],
  samba: ["Cartola — As Rosas Não Falam", "Zeca Pagodinho — Deixa a Vida Me Levar", "Menos é Mais — Melhor Eu Ir"],
  funk: ["MC Kevinho — Olha a Explosão", "Ludmilla — Favela Chegou", "Anitta — Envolver", "MC Hariel — Maçã Verde"],
  pop: ["Jão — Idiota", "Iza — Dona de Mim", "Anavitória — Trevo", "The Weeknd — Blinding Lights"],
  eletronica: ["Alok — Hear Me Now", "Vintage Culture — Hollywood", "Avicii — Wake Me Up", "Daft Punk — Get Lucky"]
};

const SERIES_GERAL = [
  "Breaking Bad — professor vira mestre do crime em um drama impecável.",
  "Stranger Things — mistério, nostalgia dos anos 80 e ficção.",
  "Dark — ficção científica alemã genial sobre viagem no tempo.",
  "The Last of Us — drama pós-apocalíptico emocionante.",
  "The Boys — sátira ácida sobre super-heróis."
];

const COMPARACOES = {
  "javascript|python": "⚖️ **JavaScript vs Python:**\n• **JavaScript:** roda nativo no navegador, domina sites e apps web.\n• **Python:** leitura mais limpa, domina dados, IA e automação.",
  "html|css": "⚖️ **HTML vs CSS:**\n• **HTML** é a estrutura; **CSS** é o visual (cores, tamanhos, animações).",
  "ssd|hd": "⚖️ **SSD vs HD:**\n• **HD:** disco mecânico, mais lento.\n• **SSD:** memória flash, muito mais rápido.",
  "alcool|etanol|gasolina": "⚖️ **Etanol vs Gasolina:** divida o preço do etanol pelo da gasolina. Se der **até 0,70**, o etanol compensa.",
  "debito|credito": "⚖️ **Débito vs Crédito:** débito sai na hora sem juros; crédito concentra na fatura mas exige pagar o total em dia.",
  "android|iphone|ios": "⚖️ **Android vs iPhone:** Android dá mais liberdade de arquivos/Termux; iPhone tem integração estável e boa revenda."
};

const CONHECIMENTO_PRATICO = [
  [/\b(dicas? de produtividade|como vencer a procrastin|procrastinacao|estudar melhor|como estudar|dicas? de foco|como ter foco|como me concentrar)\b/,
   "🎯 **Técnicas para focar e estudar melhor:**\n1. **Pomodoro:** 25 min focado + 5 min de pausa.\n2. **Estudo ativo:** explique o assunto em voz alta ou faça exercícios.\n3. **Regra dos 2 minutos:** se leva menos de 2 min, resolva agora."],
  [/\b(50 30 20|organizar dinheiro|como economizar|orcamento pessoal|educacao financeira|como guardar dinheiro)\b/,
   "💰 **Método 50-30-20:** 50% essenciais, 30% lazer/desejos, 20% reserva e investimentos."],
  [/\b(como fazer(?: uma)? redacao|estrutura(?: da)? redacao|dicas? de redacao)\b/,
   "✍️ **Estrutura de Redação (ENEM):**\n1. **Introdução:** tema + tese + 2 argumentos.\n2. **D1 e D2:** causas e impactos com repertório.\n3. **Conclusão:** Quem + O quê + Como + Para quê + Detalhamento."],
  [/\b(dicas? de curriculo|como fazer(?: um)? curriculo|dicas? de entrevista|conseguir(?: um)? emprego|arrumar emprego)\b/,
   "💼 **Dicas de Currículo e Entrevista:** mantenha em 1–2 páginas destacando resultados reais e use o método **STAR** na entrevista."],
  [/\b(direitos? do consumidor|procon|direito de arrependimento|prazo(?: de)? garantia)\b/,
   "⚖️ **CDC Brasil:** compras online têm **7 dias corridos** para arrependimento e reembolso total."],
  [/\b(fui demitido|mandado embora|direitos trabalhistas|acerto rescisao|seguro desemprego)\b.*\b(direito|direitos|receber|acerto|rescisao|fgts)\b/,
   "📋 **Demissão sem justa causa (CLT):** saldo de salário, aviso prévio, 13º proporcional, férias + 1/3, saque do FGTS + multa de 40% e guias do seguro-desemprego."]
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
  const a = sites[sites.length - 2], b = sites[sites.length - 1];
  const nome = u => { try { return new URL(u).hostname.replace(/^www\./, "") + new URL(u).pathname.slice(0, 22); } catch { return u.slice(0, 35); } };
  const ver = a.nota !== b.nota
    ? "🏆 **" + nome(a.nota > b.nota ? a.url : b.url) + "** teve melhor nota (**" + Math.max(a.nota, b.nota) + "/10**)."
    : "⚖️ Empate em nota (**" + a.nota + "/10**).";
  return "🔎 **Comparação dos sites:**\n1. " + nome(a.url) + " (" + a.nota + "/10 • " + a.ms + " ms)\n2. " + nome(b.url) + " (" + b.nota + "/10 • " + b.ms + " ms)\n\n" + ver;
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
      if (m) { inicio = j; fenceLen = m[1].length; lang = m[2] || "txt"; break; }
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
    return (i + 1) + ". " + s.name + (s.premiered ? " (" + s.premiered.slice(0, 4) + ")" : "") + (s.rating?.average ? " • Nota " + s.rating.average : "");
  });
  return { texto: "📺 **Séries encontradas para “" + termo + "”:**\n\n" + linhas.join("\n"), origem: "📺 catálogo de séries" };
}

const TODOS_TEMAS = ["roxo", "vermelho", "azul", "verde", "rosa", "dourado", "neon"];
function detectarTemaPedido(t) {
  if (/^que tema o que$/.test(t)) return { ignora: true };
  if (/^(quais temas|temas|quais cores|mudar cor|trocar cor|mudar tema|trocar tema)$/.test(t)) return { listar: true };
  if (/^(?:muda|mudar|troca|trocar|escolhe|escolher)(?:\s+de)?\s+tema(?:\s+se\s+(?:voce\s+)?quiser|\s+aleatorio)?$/.test(t)) return girar("auto-tema", TODOS_TEMAS);
  if (/\b(significa|significado|por que|porque|qual e a cor|qual a cor|bandeira|arco iris|ceu|mar|sol|sangue|planta|redacao|conversa|poco|texto|assunto)\b/.test(t) &&
      !/\b(tema do site|tema do app|tema da tela|aparencia|interface)\b/.test(t)) return null;
  const pedeTema = /\b(tema|aparencia|visual|interface)\b/.test(t) ||
    /\b(?:muda|mudar|troca|trocar|coloca|colocar|bota|botar|deixa|deixar|ativa|ativar)\b.*\b(tema|cor|fundo|visual|tela)\b/.test(t);
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

function responderSobreCitacao(t, raw, ctx) {
  const alvo = String(ctx.alvo || "").trim();
  if (!alvo) return null;
  const trecho = alvo.replace(/\s+/g, " ").slice(0, 110);
  const retic = alvo.length > 110 ? "..." : "";

  if (/\b(copia|copiar|manda de novo|manda inteiro|codigo)\b/.test(t)) {
    return { texto: "Aqui está o trecho citado pronto para copiar:\n\n" + wrapCodeFence(alvo, "txt"), origem: "📋 cópia da citação" };
  }
  if (/\b(oq vc errou|o que voce errou|oque voce errou|qual erro)\b/.test(t)) {
    return {
      texto: "Sobre **“" + trecho + retic + "”**: o problema é que a resposta anterior ficou genérica em vez de responder direto ao que você perguntou antes. Me diga em uma frase o assunto que você queria ver agora!",
      origem: "🔄 explicação"
    };
  }
  if (/^(?:e |mas )?(?:isso|isto|ele|ela)\s+(?:e|eh|ta|esta)?\s*(?:bom|boa|ruim|verdade|serio|certo|normal)$/.test(t) ||
      /^(?:serio|jura|mesmo|como assim|por que|porque|nao entendi|gostei|legal|daora|interessante|nao concordo|explica|discordo|verdade|concordo)$/.test(t)) {
    return { texto: "Sobre **“" + trecho + retic + "”**: você quer que eu detalhe melhor algum ponto ou mude a abordagem?", origem: "💬 sobre a citação" };
  }
  return null;
}

function resolverEscolhaOuDilema(t, raw) {
  if (raw.startsWith("/") || /\b(converter|km|metros|kg|gramas|celsius|fahrenheit|pesquise|codigo)\b/.test(t)) return null;
  const mDuv = t.match(/^(?:to|estou|tou)\s+em\s+duvida\s+(?:se|entre)\s+(.+)$/) ||
    t.match(/^(?:voce acha que )?(?:eu\s+)?(?:devo|vale a pena|e melhor)\s+(.+?)\s+ou\s+(.+)$/);
  if (mDuv && mDuv[2]) {
    return {
      texto: "⚖️ Entre **" + mDuv[1].trim() + "** e **" + mDuv[2].trim() + "**, vale pesar:\n• **Custo de reversão:** qual é mais fácil ajustar se der errado?\n• **Ganho em 6 meses:** qual aproxima mais do que você quer?\n• **Desgaste imediato:** qual gera menos estresse hoje?\n\nQuer me contar o contexto pra analisarmos juntos?",
      origem: "🧠 apoio à decisão"
    };
  }
  return null;
}

/* ---------- Função Principal ---------- */

async function responder(raw, ctx = {}) {
  const s = String(raw || "");
  if (!s || s.length > 1200) return null;
  const t = norm(s);
  if (!t) return null;

  const temPerguntaPendente = Boolean(ctx.session?.lastBotQuestion);

  if (ctx.alvo) {
    const respCit = responderSobreCitacao(t, s, ctx);
    if (respCit) return respCit;
  }

  const dtResp = responderDataRapida(t);
  if (dtResp) return { texto: dtResp, origem: "📅 calendário" };

  if (/^(?:por que|porque)\s+(?:voce\s+)?nao\s+(?:achou|encontrou|conseguiu)/.test(t)) {
    const uBot = String(ctx.ultimoBot || "");
    if (/Wikimedia Commons/i.test(uBot)) {
      return {
        texto: "Porque o **Wikimedia Commons** só guarda fotos reais de acervo público/educacional (lugares, animais, ciência, história) — imagens de anime ou artes específicas raramente ficam lá. Se quiser, posso buscar informações ou sites sobre esse tema na internet!",
        origem: "🧠 contexto"
      };
    }
    return {
      texto: "Não encontrei uma fonte confiável que batesse exatamente com as palavras usadas. Se você reformular o tema de forma mais direta, eu tento de novo!",
      origem: "🧠 contexto"
    };
  }

  if (/^(?:me\s+)?(?:respond[ae]|fal[ae]|escrev[ae]|convers[ae])\s+(?:so\s+)?em\s+portugues$/.test(t)) {
    return { texto: "Claro! Pode falar comigo em português. Em que posso ajudar?", origem: "💬 conversa" };
  }

  if (/^(?:voce\s+(?:e|eh)|vc\s+(?:e|eh))\s+(?:o\s+|a\s+)?(?:claude|chatgpt|gemini|gpt)\??$/.test(t)) {
    return {
      texto: "Não! Eu sou a **BACH AI** 🧠 — inspirada no estilo claro e direto de assistentes modernas, mas feita do zero pelo **Rizik** com motor próprio.",
      origem: "🧠 identidade"
    };
  }

  if (/\b(?:e|eh)\s+basead[oa]\s+no\s+o\s*que\b|\bbasead[oa]\s+em\s+que\b|\bcomo\s+(?:voce|vc)\s+(?:funciona|foi feita)\b/.test(t)) {
    return {
      texto: "Eu funciono 100% com **motor próprio em JavaScript** criado pelo Rizik — sem depender de APIs pagas do ChatGPT ou Claude:\n\n" +
        "• **Memória em 3 camadas:** guarda seu perfil, o contexto da conversa atual e o que você me ensina.\n" +
        "• **Rede Neural MLP própria (`384→64→12`):** ajuda a identificar intenções livres no chat.\n" +
        "• **Departamentos locais + Pesquisa Web:** cálculos, criação de apps (`/app`), revisão (`/revisar`), leitura de imagens/arquivos e busca ao vivo na internet.\n\n" +
        "Quer testar alguma dessas funções agora?",
      origem: "🧠 arquitetura"
    };
  }

  if (/^(?:o\s+que\s+(?:mais\s+)?(?:voce|vc)\s+sabe\s+fazer|oq\s+mais\s+(?:voce|vc)\s+sabe\s+fazer)$/.test(t)) {
    return {
      texto: "Posso ajudar com bastante coisa, por exemplo:\n\n" +
        "• **Pesquisar na web** — notícias, esportes, tutoriais e dúvidas gerais\n" +
        "• **Escrever e revisar textos** — e-mails, redações, histórias e ortografia (`/revisar`)\n" +
        "• **Programação e Termux** — criar apps com preview ao vivo (`/app`), rodar JS (`/executar`) e revisar código\n" +
        "• **Mídias e Arquivos** — ler fotos (OCR), vídeos, documentos e buscar fotos/áudios livres para baixar\n" +
        "• **Traduções, clima e cálculos** — idiomas, previsão do tempo, contas e conversões\n\n" +
        "Tem algo específico em mente que eu possa te ajudar agora?",
      origem: "🧠 habilidades"
    };
  }

  if (/\b(?:abaixa|baixa)\s+link\b|\be\s+se\s+for\s+videos?\s+ou\s+imagens?\b/.test(t)) {
    return {
      texto: "Funciona assim aqui na **BACH AI**:\n\n" +
        "• **Links que você mandar:** se for link de página, artigo ou código (como GitHub), eu **leio, resumo e guardo** o texto pra você.\n" +
        "• **Fotos e áudios livres:** se você pedir `baixar foto de ...` ou `baixar musica/audio de ...`, eu busco arquivos de acervo público com botão **⬇️ Baixar** direto no chat.\n" +
        "• **Vídeos e filmes:** busco vídeos/clássicos livres no Internet Archive; para filmes comerciais e músicas protegidas, indico os apps oficiais.\n\n" +
        "Quer testar me mandando um pedido de foto, áudio ou link?",
      origem: "📥 como funciona"
    };
  }

  if (/^(?:qual|quem)\s+(?:e\s+)?(?:o\s+)?melhor\s+jogador\s+(?:de\s+futebol\s+)?do\s+mundo(?:\s+(?:hoje|atualmente|agora|2026))?$/.test(t)) {
    return {
      texto: "Essa é uma pergunta sem resposta única — depende muito do critério e do gosto de cada um!\n\n" +
        "• **Harry Kane** — venceu a **Bola de Ouro 2026**, impulsionado por números altíssimos de gols e títulos.\n" +
        "• **Kylian Mbappé** — 2º na Bola de Ouro 2026, destaque em velocidade e decisão no Real Madrid.\n" +
        "• **Lamine Yamal** — 3º na Bola de Ouro 2026, grande nome jovem pelo Barcelona.\n" +
        "• **Erling Haaland, Vinícius Júnior, Dembélé e Bellingham** — seguem entre os mais decisivos da temporada.\n\n" +
        "Historicamente, **Lionel Messi** e **Cristiano Ronaldo** dominaram esse debate por quase duas décadas.\n\n" +
        "Você tem algum palpite ou time do coração? 😁",
      origem: "⚽ futebol (2026)"
    };
  }

  if (/^(?:o\s+)?mundo\s+vai\s+acabar(?:\s+(?:mesmo|logo|em\s+breve))?$/.test(t)) {
    return {
      texto: "Não há nenhuma evidência científica de que o mundo vá acabar em breve. Algumas coisas que vale saber:\n\n" +
        "• **No curto prazo:** previsões de “fim do mundo” que circulam de tempos em tempos nunca se confirmaram, e cientistas não têm indicação de um evento catastrófico iminente.\n" +
        "• **Riscos reais que existem:** mudanças climáticas, pandemias e conflitos são desafios sérios para a humanidade, mas são questões de gestão e prevenção — não de “fim” inevitável.\n" +
        "• **No longuíssimo prazo (bilhões de anos):** o Sol eventualmente vai se expandir e tornar a Terra inabitável — mas isso está a uns 5 bilhões de anos de distância.\n\n" +
        "Se você está preocupado com alguma notícia específica que leu, me conta que eu checo pra você! 🙂",
      origem: "🌍 ciência"
    };
  }

  if (/^quem\s+(?:e|eh)\s+(?:o\s+|a\s+)?(?:pessoa\s+)?mais\s+inteligente\s+do\s+mundo$/.test(t)) {
    return {
      texto: "Não existe uma resposta definitiva pra isso — “inteligência” é difícil de medir de forma única, e não há um ranking global aceito por todos.\n\n" +
        "• **QI mais alto registrado:** nomes como **Marilyn vos Savant** e **William James Sidis** são frequentemente citados, mas testes de QI têm limitações.\n" +
        "• **Reconhecimento por conquistas:** cientistas e matemáticos como **Albert Einstein**, **Isaac Newton** e **Alan Turing** mudaram a história pelo impacto real.\n" +
        "• **Vários tipos de inteligência:** lógica, emocional, criativa, espacial — alguém pode ser brilhante em uma área e mediano em outra.\n\n" +
        "Tem algum contexto por trás da pergunta, ou viu alguma notícia/ranking?",
      origem: "🧠 ciência & reflexão"
    };
  }

  if (/^(?:jogos\s+de\s+futebol|futebol\s+hoje)$/.test(t)) {
    return {
      texto: "Que tipo de informação você procura sobre jogos de futebol? Alguns exemplos:\n\n" +
        "• **Jogos de hoje / desta semana** de alguma liga (Brasileirão, Champions League, etc.)\n" +
        "• **Resultados recentes**\n" +
        "• **Tabela de classificação** de algum campeonato\n\n" +
        "Me diga qual liga ou time te interessa que eu busco as informações atualizadas!",
      origem: "⚽ esportes"
    };
  }

  if (/^(?:brasileirao|campeonato brasileiro|tabela do brasileirao|jogos do brasileirao)$/.test(t)) {
    return { pesquisarTema: "brasileirao 2026 resultados jogos recentes tabela classificacao" };
  }

  if (/^(?:a\s+nao\s+)?(?:so\s+)?perguntas?\s+bestas?$/.test(t)) {
    return {
      texto: "Sem problema, pode mandar! Pergunta “besta” também é pergunta — se bater uma curiosidade aleatória, é só mandar. 😊",
      origem: "💬 conversa"
    };
  }

  const midiaResp = await tratarPedidoMidiaBaixar(t, s);
  if (midiaResp) return midiaResp;

  if (/\bgta\b/.test(t) && /\b(baixar|abaixar|abaixo|instalar|link|celular|pc|ios|android)\b/.test(t)) {
    return { pesquisarTema: "como baixar gta para celular " + t };
  }

  if (/^(?:abre|abrir)\s+(?:o\s+)?youtube$/.test(t)) {
    return {
      texto: "📺 Por segurança do navegador, eu não consigo abrir o aplicativo do YouTube direto no seu celular, mas você pode acessar pelo link oficial:\n\n`https://www.youtube.com`\n\nSe quiser que eu busque algum vídeo ou assunto específico por lá, é só dizer!",
      origem: "📺 links"
    };
  }
  if (/^(?:\d+\s+)?(?:abre|abrir)\s+filmes?$/.test(t)) {
    return {
      texto: "🎬 Não abro apps de streaming direto, mas posso:\n• **Recomendar filmes** por gênero (ex.: `filmes de ação`, `terror`, `comédia`, `filmes recentes`)\n• **Buscar clássicos livres** para baixar no Internet Archive (`baixar filme chaplin`)\n\nQual estilo você quer ver?",
      origem: "🎬 filmes"
    };
  }

  if (/\bpc\b.*\b(barato|vale a pena|compensa)\b.*\b(net|internet|online)\b/.test(t)) {
    return {
      texto: "💻 **Comprar PC pela internet costuma ser mais barato que em loja física**, sim — principalmente porque você compara várias lojas e evita estoque parado. Mas vale cuidar de 4 pontos:\n\n" +
        "• **Preço médio real:** um PC básico de estudos/escritório sai em torno de R$ 1.300–R$ 2.000; um PC gamer de entrada novo costuma partir de R$ 2.800–R$ 3.800.\n" +
        "• **Desconfie de preço milagroso:** anúncio de “PC Gamer completo com monitor por R$ 900” geralmente usa peças muito antigas (i5 de 2ª/3ª geração) ou é golpe.\n" +
        "• **Prefira lojas conhecidas** (KaBuM!, Pichau, Terabyte, Amazon vendida/entue oficial, Mercado Livre Loja Oficial).\n" +
        "• **Confira a fonte e o SSD:** exija SSD (mínimo 240 GB/500 GB) e fonte de marca confiável.\n\n" +
        "Você quer um PC para jogos ou mais para estudos/trabalho?",
      origem: "💻 compras & hardware"
    };
  }

  const mRec = t.match(/^(?:passa|manda|me da|quero|busca|pesquisa)?\s*(?:umas?\s+)?receitas?\s+de\s+(.+)$/);
  if (mRec) {
    const prato = mRec[1].trim();
    for (const [re, resp] of RECEITAS) if (re.test(prato)) return { texto: resp, origem: "🍳 receitas" };
    return { pesquisarTema: "receitas faceis e rapidas de " + prato };
  }

  if (/\bgerar fofocas\b|\bfofocas\b/.test(t) && /\b(sabe|faz|gera|conta)\b/.test(t)) {
    return {
      texto: "Não invento fofocas sobre pessoas reais 😅 — mas posso criar **histórias fictícias**, contar **curiosidades** ou buscar **notícias reais do dia**. Qual você prefere?",
      origem: "💬 conversa"
    };
  }

  const escrita = gerarEscrita(t, s);
  if (escrita) return { texto: escrita, origem: "✍️ escrita criativa" };

  if (/^(?:bem\s+ate|tudo\s+bem\s+ate|o\s+meu\s+dia\s+(?:esta|ta)\s+(?:bem|bom|otimo|tranquilo|de\s+boa)|meu\s+dia\s+(?:esta|ta)\s+(?:bem|bom))$/.test(t)) {
    return { texto: "Que bom! 😊 Quer conversar sobre algum assunto, tirar uma dúvida ou testar alguma ferramenta por aqui?", origem: "💬 conversa" };
  }
  if (/^(?:entendi\s+so\s+isso|so\s+isso|sei\s+sei|faltou\s+foi\s+tudo.*)$/.test(t)) {
    return { texto: "Se ficou faltando o que você realmente queria saber, me manda direto o tema ou a pergunta que eu respondo sem enrolação!", origem: "💬 conversa" };
  }
  if (/^tabom$|^ta\s+bom$/.test(t)) {
    return { texto: "Certo! Quando quiser mandar a próxima, estou aqui.", origem: "💬 conversa" };
  }
  if (/^(?:vc|voce)\s+(?:tem\s+que\s+ir\s+alem|parece\s+um?\s+boot?|so\s+repete\s+as\s+falas|nao\s+le\s+as\s+proprias\s+palavras|nem\s+calcula\s+as\s+palavras|nao\s+sabe\s+o\s+que\s+responder)$/.test(t)) {
    return {
      texto: "Você tem razão em cobrar — quando eu caio em resposta genérica parece robô mesmo. Manda uma pergunta real, um tema de estudo ou um código que eu te respondo direto no ponto!",
      origem: "🔄 feedback"
    };
  }

  const hMundial = horaMundial(t);
  if (hMundial) return { texto: hMundial, origem: "🕒 fuso horário" };

  if (/\b(copia|copiar|manda|reenvia|me da|mostra)\b.*\b(codigo|codigos|script|html)\b/.test(t) &&
      !/\.[a-z]{2,4}\b/i.test(s) && !/\b(cria|crie|faz|faca|escrev|gerar|gera|explica|revisa|erro|como)\b/.test(t) &&
      t.split(" ").length <= 12) {
    if (ctx.ultimoArquivo?.texto && ctx.ultimoArquivo.texto.length > 40) return { usarMenteTexto: true };
    const codHist = extrairUltimoCodigoDoHistorico(ctx.history);
    if (codHist) return { texto: "📋 Aqui está o último código completo:\n\n" + wrapCodeFence(codHist.code, codHist.lang), origem: "📋 cópia de código" };
  }

  if (/^\/?(diagnostico|saude|relatorio de erros|autoavaliacao|monitoramento)$/i.test(t)) return { texto: AutoGuard.diagnose(), origem: "🛡️ autoguard" };
  if (/^\/?rollback$/i.test(t)) {
    if (ctx.modoCriador === false) return { texto: "🔒 O comando `/rollback` é exclusivo do modo administrador.", origem: "🔒 adm" };
    const rb = AutoGuard.rollback();
    return { texto: rb.ok ? "♻️ Rollback concluído!" : "Não foi possível fazer rollback: " + rb.msg, origem: "🛡️ rollback" };
  }

  if (/\b(entre essas duas|entre esses dois|qual e a melhor|qual das duas|qual dos dois)\b/.test(t)) {
    const compSites = compararUltimosSites(ctx.history);
    if (compSites) return { texto: compSites, origem: "⚖️ comparação de sites" };
  }

  if (/^(?:pode\s+)?(?:parar|para|pausar|pausa|zerar|resetar)(?:\s+(?:o\s+)?(?:time|timer|tempo|cronometro|app|relogio))?$/.test(t)) {
    const appRec = detectarAppRecente(ctx.history);
    if (appRec) return { texto: "⏱️ O app **`" + appRec + "`** roda no preview acima — toque em **⏸ Pausar** dentro dele.", origem: "▶️ controle do preview" };
  }

  const dilema = resolverEscolhaOuDilema(t, s);
  if (dilema) return dilema;

  if (/^(?:vamos\s+(?:de|se)\s+senha|senha|gera\w*\s+senha|manda\s+uma\s+senha|me\s+da\s+uma\s+senha|quero\s+uma\s+senha)$/.test(t) || /^\/senha(?:\s+(\d{1,2}))?$/i.test(s.trim())) {
    return { texto: senhaRapida((s.match(/\d{1,2}/) || [])[0] || 14), origem: "🔐 utilidades" };
  }

  const temaPedido = detectarTemaPedido(t);
  if (temaPedido) {
    if (temaPedido.ignora) return { texto: "Certo, mantenho o tema atual.", origem: "💬 conversa" };
    if (temaPedido.listar) return { texto: "🎨 **Temas:** 💜 Roxo • ❤️ Vermelho • 💙 Azul • 💚 Verde • 🩷 Rosa • 💛 Dourado • ⚡ Neon. Peça ex.: `tema azul`.", origem: "🎨 temas" };
    return { tema: temaPedido };
  }

  if (/\b(nao foi|nao era|falou errado|disse errado|respondeu errado|entendeu errado|errando|ta errado|esta errado|vc ainda erra|voce ainda erra|so erra|voce e burro|burro|burra|nada a ver|nada aver|nada haver|fez uma pesquisa atoa|pesquisa atoa)\b/.test(t)) {
    if (!ehEntradaSensivel(s)) AutoGuard.recordFailure({ module: "conversa", type: "user-feedback", input: s, detail: ctx.ultimoBot ? ctx.ultimoBot.slice(0, 100) : "insatisfação" });
    return {
      texto: semRepetir("fb-err", [
        "Você tem razão — essa resposta saiu fora do ponto. Me diga direto o que você queria saber ou conversar agora.",
        "Realmente errei essa. Mande direto o que você esperava que eu sigo daqui."
      ], ctx),
      origem: "🔄 autocorreção"
    };
  }

  if (!temPerguntaPendente && /^(?:aham|ahan|uhum|ok|okay|blz|beleza|ata|entendi|tendi|saquei|fechou|suave|de boa|firmeza|show|top)$/.test(t)) return null;

  if (/^(conversa comigo|vamos conversar|bora conversar|fala comigo|fale comigo)$/.test(t)) {
    return { texto: semRepetir("conv-solta", ["Claro! Sobre o que você quer trocar ideia hoje?", "Estou por aqui. Quer conversar sobre algum assunto do dia ou tirar alguma dúvida?"], ctx), origem: "💬 conversa" };
  }

  const pedeRec = /\b(recomenda\w*|indica\w*|suger\w*|lista\w*|melhores|bons|boas|quero assistir|quero ouvir)\b/.test(t);
  const pedeAtual = /\b(atualizado|atualizados|recente|recentes|de agora|2025|2026|novo|novos|lancamento|lancamentos)\b/.test(t);
  const genMusica = detectarGeneroMusica(t);
  if (genMusica && (pedeRec || (t.split(" ").length <= 4 && !/\b(baixa|baixar|abaixa|abaixar)\b/.test(t))) && !pedeAtual) {
    const [key, nome] = genMusica;
    return { texto: "🎶 **Recomendações de " + nome + ":**\n\n" + MUSICAS_GENERO[key].map((m, i) => (i + 1) + ". " + m).join("\n"), origem: "🎵 recomendações" };
  }

  const genFilme = detectarGeneroFilme(t);
  if (/\b(filme|filmes)\b/.test(t) && (pedeRec || genFilme) && !pedeAtual && !/\b(baixa|baixar|abaixa|abaixar)\b/.test(t)) {
    if (genFilme) {
      const [key, nome] = genFilme;
      return { texto: "🎬 **Filmes recomendados de " + nome + ":**\n\n" + FILMES_GENERO[key].map((f, i) => (i + 1) + ". " + f).join("\n"), origem: "🎬 recomendações" };
    }
    return {
      texto: "🎬 **Filmes muito bem avaliados:**\n\n1. Interestelar (2014) — Ficção\n2. A Origem (2010) — Suspense\n3. Parasita (2019) — Drama\n4. Batman: O Cavaleiro das Trevas (2008) — Ação\n5. Um Sonho de Liberdade (1994) — Drama\n\n💡 Quer de um gênero específico (ação, terror, comédia, drama) ou `filmes recentes`?",
      origem: "🎬 recomendações"
    };
  }

  if (/\b(serie|series)\b/.test(t) && pedeRec && !pedeAtual) {
    const termoLimpo = t.replace(/\b(me|recomenda\w*|indica\w*|suger\w*|uma|umas|serie|series|boas|bons|de|para|assistir)\b/g, "").trim();
    if (termoLimpo.length >= 3) { const tv = await buscarSeriesTVMaze(termoLimpo); if (tv) return tv; }
    return { texto: "📺 **Séries recomendadas:**\n\n" + SERIES_GERAL.map((s, i) => (i + 1) + ". " + s).join("\n"), origem: "📺 recomendações" };
  }

  const mComp = t.match(/(?:diferenca entre|compar\w* entre|pros e contras de)\s+(.+?)\s+e\s+(.+)/) || t.match(/^(.+?)\s+(?:vs|versus)\s+(.+)$/);
  if (mComp) {
    for (const [chaves, resp] of Object.entries(COMPARACOES)) {
      const partes = chaves.split("|");
      if (partes.some(p => mComp[1].includes(p)) && partes.some(p => mComp[2].includes(p))) return { texto: resp, origem: "⚖️ comparação" };
    }
  }

  for (const [re, resp] of CONHECIMENTO_PRATICO) if (re.test(t)) return { texto: resp, origem: "📚 conhecimento prático" };

  const mPlano = t.match(/^(?:cria|crie|faz|faca|monta|monte|me ajuda a)?\s*(?:um\s+)?(?:plano de estudos|roteiro de estudos|como aprender|passo a passo para aprender)\s+(?:de\s+|para\s+)?(.+)$/);
  if (mPlano) {
    const temaEstudo = mPlano[1].trim().slice(0, 120);
    return {
      texto: "🗺️ **Plano prático para aprender " + temaEstudo + ":**\n\n1. **Base:** entenda os conceitos essenciais.\n2. **Prática diária:** 30 min por dia em casos reais.\n3. **Projeto:** crie algo pequeno usando " + temaEstudo + ".\n4. **Revisão:** explique o tema com suas palavras.",
      origem: "🗺️ planejamento"
    };
  }

  return null;
}

export const CerebroAvancado = { responder, wrapCodeFence };
