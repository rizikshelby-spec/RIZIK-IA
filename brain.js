/* BACH AI 5.2 - CÉREBRO 1.2 (Blindado)
   Conversa, memória automática do usuário do início ao fim da sessão,
   perfil adaptativo de humor/tom, aprendizado contínuo com correções e backup.
   Segurança: uso de Object.hasOwn em dicionários dinâmicos, proteção contra
   Prototype Pollution na importação e bloqueio de segredos na memória. */

const KEY = "rizik_brain_v1";
const PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);
const BASE = {
  name: "BACH AI",
  facts: {},
  examples: [],
  synonyms: {},
  notes: [],
  profile: {
    likes: [],
    dislikes: [],
    city: null,
    age: null,
    projects: [],
    favorites: {},
    humorScore: 0,
    interactions: 0
  },
  topics: [],
  version: 10
};

function limparObjPlano(src, maxValLen = 500) {
  const out = {};
  if (!src || typeof src !== "object" || Array.isArray(src)) return out;
  for (const k of Object.keys(src)) {
    if (PROIBIDAS.has(k)) continue;
    const v = src[k];
    if (typeof v === "string") out[k] = v.slice(0, maxValLen);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return out;
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === "object" && !Array.isArray(s)) {
      return {
        ...BASE,
        ...s,
        name: "BACH AI",
        version: 10,
        facts: limparObjPlano(s.facts, 400),
        examples: Array.isArray(s.examples) ? s.examples : [],
        synonyms: limparObjPlano(s.synonyms, 80),
        notes: Array.isArray(s.notes) ? s.notes : [],
        profile: {
          ...BASE.profile,
          ...(s.profile && typeof s.profile === "object" ? s.profile : {}),
          likes: Array.isArray(s.profile?.likes) ? s.profile.likes : [],
          dislikes: Array.isArray(s.profile?.dislikes) ? s.profile.dislikes : [],
          projects: Array.isArray(s.profile?.projects) ? s.profile.projects : [],
          favorites: limparObjPlano(s.profile?.favorites, 80),
          humorScore: Number.isFinite(s.profile?.humorScore) ? s.profile.humorScore : 0,
          interactions: Number.isFinite(s.profile?.interactions) ? s.profile.interactions : 0
        },
        topics: Array.isArray(s.topics) ? s.topics : []
      };
    }
  } catch (e) {
    console.warn("Erro ao carregar:", e);
  }
  return JSON.parse(JSON.stringify(BASE));
}

let data = load();
let pending = null;
let pendingError = null;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Erro ao salvar:", e);
  }
}

function normalize(t) {
  return String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bqm\b/g, "quem")
    .replace(/\bvc\b/g, "voce")
    .replace(/\b(oq|oqe|oque)\b/g, "o que")
    .replace(/\bpq\b/g, "porque")
    .replace(/\b(tb|tbm|tmb)\b/g, "tambem")
    .replace(/\bcvs\b/g, "conversar")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function applySyn(t) {
  return normalize(t)
    .split(" ")
    .map(w => (w && !PROIBIDAS.has(w) && Object.hasOwn(data.synonyms, w)) ? data.synonyms[w] : w)
    .join(" ");
}

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const ratio = 1 - lev(a, b) / Math.max(a.length, b.length);
  const A = new Set(a.split(" ")), B = new Set(b.split(" "));
  const inter = [...A].filter(w => B.has(w)).length;
  const jac = inter / new Set([...A, ...B]).size;
  return Math.max(ratio, jac * 0.9);
}

const CORE_WORDS = (
  "oi ola eai opa bom dia tarde noite quem criou voce fez desenvolveu bach " +
  "faz sabe fazer capacidades funcoes tudo bem como vai esta obrigado obrigada valeu tchau " +
  "ate mais horas hora agora data hoje amanha ontem meu minha nome beleza legal massa show bora vamos partiu " +
  "pesquisa pesquisar procura procurar explicar explica resume resumir traduz traduzir significa significado " +
  "sinonimo antonimo dicionario idioma lingua ingles espanhol frances italiano alemao japones " +
  "filme filmes serie series anime animes desenho animado jogo jogos musica livro historia ciencia tecnologia " +
  "programacao codigo javascript python html css sql github arquivo pasta imagem foto video texto " +
  "ajuda ajudar aprender ensinar estudar escrever falar ouvir ler criar jogar lembrar esquecer memoria " +
  "gosto adoro curto odeio moro cidade idade trabalho projeto ideia problema solucao resposta pergunta " +
  "hello hi hey thanks please sorry bye hola gracias adios bonjour merci ciao hallo danke"
).split(" ");

function vocab() {
  const v = new Set(CORE_WORDS);
  for (const ex of data.examples) {
    normalize(ex.question).split(" ").forEach(w => v.add(w));
  }
  return v;
}

function fixTypos(text) {
  const v = vocab();
  return normalize(text).split(" ").map(w => {
    // Só corrige palavras >= 5 letras para não trocar palavras válidas curtas (ex.: "olha" -> "ola")
    if (w.length < 5 || v.has(w) || Object.hasOwn(data.synonyms, w)) return w;
    const max = w.length >= 8 ? 2 : 1;
    let best = w, bd = max + 1;
    for (const c of v) {
      if (c.length < 4 || c[0] !== w[0] || Math.abs(c.length - w.length) > max) continue;
      const d = lev(w, c);
      if (d < bd) { bd = d; best = c; }
    }
    return bd <= max ? best : w;
  }).join(" ");
}

function ehSegredo(texto) {
  const s = String(texto || "").trim();
  return /^\/(?:adm|admsenha|ghconfig|chave)\b/i.test(s) || /@rizik2442/i.test(s);
}

function learn(q, a) {
  q = String(q || "").trim().slice(0, 400);
  a = String(a || "").trim().slice(0, 2000);
  if (!q || !a || ehSegredo(q) || ehSegredo(a)) return false;
  const key = applySyn(q);
  const i = data.examples.findIndex(x => applySyn(x.question) === key);
  const item = {
    question: q,
    answer: a,
    updatedAt: Date.now(),
    uses: i >= 0 ? data.examples[i].uses || 0 : 0
  };
  if (i >= 0) data.examples[i] = item;
  else data.examples.push(item);
  save();
  return true;
}

function learnSynonym(from, to) {
  const a = normalize(from).replace(/\s+/g, "");
  const b = normalize(to);
  if (!a || !b || b.includes(" ") || PROIBIDAS.has(a) || PROIBIDAS.has(b)) return false;
  data.synonyms[a] = b;
  save();
  return true;
}

function forget(q) {
  const key = applySyn(q);
  const n = data.examples.length;
  data.examples = data.examples.filter(x => applySyn(x.question) !== key);
  save();
  return n - data.examples.length;
}

function remember(k, v) {
  const key = String(k || "");
  if (!key || PROIBIDAS.has(key)) return;
  data.facts[key] = v;
  save();
}

function recall(k) {
  const key = String(k || "");
  if (!key || PROIBIDAS.has(key) || !Object.hasOwn(data.facts, key)) return null;
  return data.facts[key] ?? null;
}

function logTopic(topic) {
  const clean = String(topic || "").trim().slice(0, 80);
  if (!clean || clean.length < 2) return;
  data.topics = data.topics.filter(x => normalize(x.topic) !== normalize(clean));
  data.topics.push({ topic: clean, at: Date.now() });
  data.topics = data.topics.slice(-100);
  save();
}

function getRecentTopics(limit = 10) {
  return data.topics.slice(-limit).reverse();
}

function getProfile() {
  return { ...data.profile, userName: recall("userName") };
}

function getStats() {
  return {
    examples: data.examples.length,
    synonyms: Object.keys(data.synonyms || {}).length,
    facts: Object.keys(data.facts || {}).length,
    notes: data.notes.length
  };
}

/* ---------- Termômetro Adaptativo de Humor e Tom ---------- */

function detectTone(raw) {
  const s = String(raw || "");
  const n = normalize(s);
  const rindo = /😂|🤣|😄|😆|😜|🤪|\b(k{3,}|ha{2,}h?a?|rsrs+|hehe+|hue+)\b/i.test(s);
  const brincadeira = /\b(piada|charada|brincar|diverte|engracado|zoeira|humor)\b/.test(n);
  const frustrado = /\b(burro|burra|idiota|inutil|lixo|errou|errado|errada|nada a ver|nada haver|nao entende|nao entendeu|nunca entende|pqp|crlh|merda|porra|chato|chata|ruim|horrivel|droga|para de errar|muitos erros|esperava melhoras|tudo errado)\b/.test(n);
  const triste = /\b(triste|mal|ansioso|ansiosa|chorando|deprimido|cansado|cansada|desanimado|morrer|suicid)\b/.test(n);
  const serio = /\b(codigo|erro|bug|problema|configuracao|trabalho|curriculo|revisar|contrato|golpe|imc|medico|resumo|estudar)\b/.test(n);

  if (frustrado) return "frustrado";
  if (triste) return "triste";
  if (rindo || brincadeira) return "descontraido";
  if (serio || s.length > 180) return "serio";
  return "neutro";
}

function updateTone(raw) {
  const instant = detectTone(raw);
  let score = Number(data.profile.humorScore || 0);

  if (instant === "frustrado") score = Math.max(-4, score - 2);
  else if (instant === "triste") score = Math.min(0, score - 1);
  else if (instant === "serio") score = Math.max(-3, score - 0.5);
  else if (instant === "descontraido") score = Math.min(4, score + 1.5);
  else score = score > 0 ? Math.max(0, score - 0.15) : Math.min(0, score + 0.15);

  data.profile.humorScore = Number(score.toFixed(2));
  data.profile.interactions = (data.profile.interactions || 0) + 1;
  save();

  const mood =
    instant === "frustrado" ? "frustrado" :
    instant === "triste" ? "triste" :
    instant === "serio" ? "serio" :
    score >= 1.2 || instant === "descontraido" ? "descontraido" :
    score <= -1.2 ? "serio" : "neutro";

  return { mood, instant, score: data.profile.humorScore };
}

function getMood() {
  const score = Number(data.profile.humorScore || 0);
  return {
    score,
    mood: score >= 1.2 ? "descontraido" : score <= -1.2 ? "serio" : "neutro",
    humorAllowed: score >= 0.8
  };
}

function setPendingError(question, botResponse = "") {
  if (!question || ehSegredo(question)) return;
  pendingError = {
    question: String(question).trim(),
    botResponse: String(botResponse || "").slice(0, 200),
    at: Date.now()
  };
}

function getPendingError() {
  if (pendingError && (Date.now() - pendingError.at) > 5 * 60 * 1000) {
    pendingError = null;
  }
  return pendingError;
}

function clearPendingError() {
  pendingError = null;
}

/* ---------- Captura contínua de memória ---------- */

function pushUnique(arr, val, max = 30) {
  const v = val.trim().replace(/[.!]+$/, "");
  if (!v || v.length < 2) return false;
  if (!arr.some(x => normalize(x) === normalize(v))) {
    arr.push(v);
    if (arr.length > max) arr.shift();
    save();
    return true;
  }
  return false;
}

function captureUserMemory(original) {
  const raw = String(original || "").trim();
  if (!raw || raw.includes("?") || raw.length > 140) return null;

  let m = raw.match(/^(?:eu\s+)?(?:gosto muito de|gosto de|adoro|curto|amo)\s+(.+)$/i);
  if (m && !/^(te|voce|vc|ele|ela|que|quando|como|se|saber|ver|perguntar)\b/i.test(m[1])) {
    const item = m[1].trim().replace(/[.!]+$/, "");
    if (pushUnique(data.profile.likes, item)) {
      return `Legal! Vou lembrar que você gosta de ${item}. 💜`;
    }
  }

  m = raw.match(/^(?:eu\s+)?(?:nao gosto de|não gosto de|odeio|detesto)\s+(.+)$/i);
  if (m) {
    const item = m[1].trim().replace(/[.!]+$/, "");
    if (pushUnique(data.profile.dislikes, item)) {
      return `Anotado! Vou lembrar que você não curte ${item}. 📝`;
    }
  }

  const naoCidade = /^(boa|paz|maior|menor|ferro|aco|verdade|mentira|familia|casa|longe|perto|volta|acordo|novo|confianca|palavra|respeito)$/i;
  m = raw.match(/^(?:eu\s+)?(?:moro em|moro no|moro na|sou de|sou do|sou da|vivo em)\s+(.+)$/i);
  if (m && m[1].split(/\s+/).length <= 5 && !naoCidade.test(normalize(m[1]))) {
    data.profile.city = m[1].trim().replace(/[.!]+$/, "").slice(0, 45);
    save();
    return `Que massa! Guardei que você é de ${data.profile.city}. 📍`;
  }

  m = raw.match(/^(?:eu\s+)?tenho\s+(\d{1,2})\s+anos$/i);
  if (m) {
    data.profile.age = Number(m[1]);
    save();
    return `Anotado! Guardei que você tem ${data.profile.age} anos. 🎂`;
  }

  m = raw.match(/^(?:eu\s+)?(?:estou|to)\s+(?:criando|fazendo|desenvolvendo|estudando|aprendendo)\s+(.+)$/i);
  if (m) {
    const proj = m[1].trim().replace(/[.!]+$/, "");
    if (pushUnique(data.profile.projects, proj, 15)) {
      return `Show! Vou lembrar que você está trabalhando/estudando ${proj}. 🚀`;
    }
  }

  m = raw.match(/^meu\s+(filme|jogo|anime|livro|time|cantor|banda|cor|comida|linguagem)\s+favorit[oa]\s+(?:e|é)\s+(.+)$/i);
  if (m) {
    const cat = m[1].toLowerCase();
    const val = m[2].trim().replace(/[.!]+$/, "");
    if (!PROIBIDAS.has(cat)) {
      data.profile.favorites[cat] = val;
      save();
    }
    return `Guardei! Seu ${cat} favorito é ${val}. ⭐`;
  }

  return null;
}

function bestExample(text) {
  const key = applySyn(fixTypos(text));
  if (key.length < 3) return { item: null, score: 0 };
  let best = null, score = 0;
  for (const ex of data.examples) {
    const s = similarity(key, applySyn(ex.question));
    if (s > score) { score = s; best = ex; }
  }
  return { item: best, score };
}

function classify(message) {
  const t = fixTypos(message);
  const c = t.replace(/\s/g, "");

  if (/(?:que dia|quando|em que ano)\s+(?:voce|a bach|bach)\s+foi\s+criad[oa]/.test(t)) return "created";
  if (/quem criou voce|quem fez voce|quem desenvolveu voce|quem criou bach|quem criou a bach|quem e voce/.test(t) ||
    /quemcriouvoce|quemfezvoce|quemcrioubach/.test(c)) return "identity";
  if (/o que voce faz|oque voce faz|que voce sabe fazer|faz de bom|suas capacidades|suas funcoes/.test(t) ||
    /oquevocefaz|quevocefaz/.test(c)) return "capabilities";
  if (/^(voce )?sabe (ler|resolver|entender|interpretar|analisar)/.test(t)) return "canread";
  if (/^(oi|ola|eai|opa|bom dia|boa tarde|boa noite|hello|hi|hey|hola|bonjour|ciao|hallo)$/.test(t)) return "greeting";
  if (/^(bora|vamos|partiu|vambora|vamos nessa|bora la)$/.test(t)) return "encouragement";
  if (/^(beleza|blz|legal|massa|show|bacana|top|otimo|otima)$/.test(t)) return "positive";
  if (/^(tudo bem|como vai|como voce esta|bem e voce|bem e vc|to bem e voce|estou bem e voce|e voce|e vc|tudo certo)$/.test(t)) return "wellbeing";
  if (/^(obrigado|obrigada|valeu|agradecido|agradecida|thanks|gracias|merci|danke)$/.test(t)) return "thanks";
  if (/^(tchau|ate mais|falou|fui|ate logo|bye|adios)$/.test(t)) return "goodbye";
  if (/^(?:que horas sao|que horas e|que hora e|qual (?:e )?(?:a )?hora(?: agora)?|hora agora|me diz as horas|diz as horas)$/.test(t)) return "time";
  if (/^(?:que dia (?:e )?hoje|hoje e que dia|qual (?:e )?(?:a )?data(?: de hoje)?|data de hoje|que data e hoje)$/.test(t)) return "date";
  if (/^(qual (e )?(o )?|como (se )?chama (o )?)?meu nome$/.test(t) || /^quem sou eu$/.test(t)) return "name";
  if (/^(onde (eu )?moro|qual (e )?(a )?minha cidade)$/.test(t)) return "city";
  if (/^(quantos anos (eu )?tenho|qual (e )?(a )?minha idade)$/.test(t)) return "age";
  if (/^(do que eu gosto|quais (sao )?(os )?meus gostos)$/.test(t)) return "likes";
  if (/^(o que voce lembra de mim|o que voce sabe de mim|o que voce sabe sobre mim|lembra do que falamos|do que falamos|quais assuntos falamos)$/.test(t)) return "memorySummary";
  return "unknown";
}

const R = (text, intent) => ({ handled: true, intent, text });

function analyzeText(txt) {
  const words = txt.trim().split(/\s+/).length;
  const code = /(\bconst\b|\bfunction\b|=>|<\/?[a-z]+>|\bimport\b|\bexport\b|\breturn\b)/.test(txt);
  return "Recebi um texto grande: " + words + " palavras e " + txt.length + " caracteres." +
    (code ? " Parece código de programação." : "") +
    "\n\nPosso resumir, explicar o funcionamento, montar uma cadeia de uso ou revisar o código.";
}

const HELP =
  "Posso te ajudar de várias formas 😊\n\n" +
  "💬 Conversar e aprender\n" +
  "• ensine: pergunta => resposta\n" +
  "• corrija: pergunta => nova resposta\n" +
  "• esqueça: pergunta\n" +
  "• sinônimo: gíria = palavra\n" +
  "• meu nome é ... / eu gosto de ... / moro em ...\n\n" +
  "🎨 Visual e Modos\n" +
  "• Use o menu ☰ ou peça: “tema vermelho”, “tema azul”, “tema neon”...\n" +
  "• Use os 10 modos no topo (Automático, Raciocínio, Pesquisa, Programação, Visão...)\n\n" +
  "🔎 Pesquisar, recomendar e traduzir\n" +
  "• pesquise sobre ... / recomenda filmes de drama / sertanejo / animes / séries\n" +
  "• escreva um e-mail / plano de estudos / diferença entre X e Y\n" +
  "• o que significa ... / como se diz ... em inglês / clima em (sua cidade)\n\n" +
  "🛠️ Ferramentas rápidas\n" +
  "• /ajuda • /app pomodoro • /calc • /converter • /juros • /fisica • /golpe • /quiz";

function buildMemorySummary() {
  const nome = recall("userName");
  const p = data.profile;
  const parts = [];
  if (nome) parts.push("• Nome: " + nome);
  if (p.age) parts.push("• Idade: " + p.age + " anos");
  if (p.city) parts.push("• Cidade: " + p.city);
  if (p.likes.length) parts.push("• Coisas que você gosta: " + p.likes.join(", "));
  if (p.dislikes.length) parts.push("• Coisas que você não curte: " + p.dislikes.join(", "));
  if (p.projects.length) parts.push("• Projetos/estudos: " + p.projects.join(", "));
  const favs = Object.entries(p.favorites || {});
  if (favs.length) parts.push("• Favoritos: " + favs.map(([k, v]) => k + " = " + v).join("; "));
  const estilo = p.humorScore >= 1.2 ? "descontraído / bem-humorado" : p.humorScore <= -1.2 ? "direto / sério" : "equilibrado";
  parts.push("• Estilo que percebi em você: " + estilo);
  if (data.topics.length) parts.push("• Assuntos que já conversamos (" + data.topics.length + "): " + data.topics.slice(-10).map(x => x.topic).join(", "));
  if (data.notes.length) parts.push("• Notas salvas: " + data.notes.slice(-5).map(n => n.text).join(" | "));
  return parts.length
    ? "🧠 Isto é o que eu lembro sobre você e nossas conversas:\n\n" + parts.join("\n")
    : "Ainda sei pouco sobre você! Me conte seu nome, o que você gosta ou o que está fazendo que eu guardo tudo.";
}

function importarMemoriaSegura(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return false;

  if (Array.isArray(d.examples)) {
    for (const e of d.examples.slice(0, 300)) {
      if (e && typeof e.question === "string" && typeof e.answer === "string") {
        learn(e.question, e.answer);
      }
    }
  }

  Object.assign(data.facts, limparObjPlano(d.facts, 400));

  if (d.synonyms && typeof d.synonyms === "object" && !Array.isArray(d.synonyms)) {
    for (const k of Object.keys(d.synonyms)) {
      if (PROIBIDAS.has(k)) continue;
      if (typeof d.synonyms[k] === "string") learnSynonym(k, d.synonyms[k]);
    }
  }

  if (Array.isArray(d.notes)) {
    for (const n of d.notes.slice(0, 200)) {
      if (n && typeof n.text === "string" && !ehSegredo(n.text)) {
        data.notes.push({ text: n.text.slice(0, 300), at: Number(n.at) || Date.now() });
      }
    }
    data.notes = data.notes.slice(-200);
  }

  if (d.profile && typeof d.profile === "object" && !Array.isArray(d.profile)) {
    if (Array.isArray(d.profile.likes)) {
      d.profile.likes.filter(x => typeof x === "string").forEach(x => pushUnique(data.profile.likes, x));
    }
    if (Array.isArray(d.profile.dislikes)) {
      d.profile.dislikes.filter(x => typeof x === "string").forEach(x => pushUnique(data.profile.dislikes, x));
    }
    if (Array.isArray(d.profile.projects)) {
      d.profile.projects.filter(x => typeof x === "string").forEach(x => pushUnique(data.profile.projects, x, 15));
    }
    if (typeof d.profile.city === "string") data.profile.city = d.profile.city.slice(0, 45);
    if (Number.isFinite(d.profile.age)) data.profile.age = d.profile.age;
    Object.assign(data.profile.favorites, limparObjPlano(d.profile.favorites, 80));
  }

  save();
  return true;
}

function think(message) {
  const original = String(message || "").trim();
  const t = normalize(original);
  if (!t) return R("Pode escrever sua mensagem!", "empty");

  if (pending) {
    const p = pending;
    pending = null;
    if (/^(sim|s|isso|exato|isso mesmo|pode ser)$/.test(t)) {
      learn(p.original, p.answer);
      return R(p.answer, "autocorrected");
    }
    if (/^(nao|n|nope)$/.test(t)) {
      return R("Ok! Me ensine com: ensine: pergunta => resposta 🧠", "declined");
    }
  }

  let m = original.match(/^(?:ensine|corrija|corrigir)\s*:\s*(.+?)\s*=>\s*(.+)$/is);
  if (m) {
    if (!learn(m[1], m[2])) return R("Não foi possível salvar esse conteúdo na memória.", "learning");
    clearPendingError();
    return R("Aprendi! 🧠 Guardei essa resposta na memória e já vou usar daqui pra frente.", "learning");
  }

  m = original.match(/^(?:esque[cç]a|apague)\s*:\s*(.+)$/i);
  if (m) {
    const n = forget(m[1]);
    return R(n ? "Pronto, esqueci essa resposta." : "Não encontrei isso na minha memória.", "forget");
  }

  m = original.match(/^sin[oô]nimos?\s*:\s*(.+?)\s*=\s*(.+)$/i);
  if (m) {
    const ladoA = m[1].split(",").map(normalize).filter(Boolean);
    const b = normalize(m[2]);
    if (!ladoA.length || !b || b.includes(" ") || ladoA.some(a => a.includes(" ") || PROIBIDAS.has(a)) || PROIBIDAS.has(b)) {
      return R("Use palavras simples. Ex: sinônimo: blz = beleza ou sinônimos: top, massa, daora = legal", "synonym");
    }
    ladoA.forEach(a => { data.synonyms[a] = b; });
    save();
    return R(`Entendi! Agora ${ladoA.map(x => `"${x}"`).join(", ")} significa "${b}" pra mim. 📚`, "synonym");
  }

  m = original.match(/^(?:meu nome [eé]|me chamo|pode me chamar de)\s+(.+)$/i);
  if (m) {
    const limpo = m[1]
      .replace(/\s+(?:sabia|viu|ta|tá|ok|hein|po|pô|cara|mano|vei|véi|nmrl)\s*[!.]*$/i, "")
      .trim()
      .replace(/[.!]+$/, "")
      .slice(0, 40);
    const nome = limpo ? limpo.charAt(0).toUpperCase() + limpo.slice(1) : "";
    if (nome) {
      remember("userName", nome);
      return R(`Prazer, ${nome}! Vou lembrar do seu nome sempre que você voltar.`, "name-set");
    }
  }

  m = original.match(/^lembre\s*:\s*(.+)$/i);
  if (m) {
    if (ehSegredo(m[1])) return R("Por segurança, não guardo senhas ou comandos administrativos nas notas. 🔒", "note");
    data.notes.push({ text: m[1].trim().slice(0, 300), at: Date.now() });
    data.notes = data.notes.slice(-200);
    save();
    return R("Anotado! 📝", "note");
  }
  if (/^(o que voce lembra|oque voce lembra|minhas notas)$/.test(t)) {
    return R(
      data.notes.length
        ? "Eu lembro:\n" + data.notes.slice(-10).map((n, i) => (i + 1) + ". " + n.text).join("\n")
        : "Ainda não tenho notas. Use: lembre: algo",
      "notes"
    );
  }

  if (/^\/(exportar|backup)$/i.test(original.trim())) {
    return R("Copie e guarde este backup:\n\n" + JSON.stringify(data), "export");
  }
  m = original.match(/^importar mem[oó]ria\s*:\s*(\{[\s\S]+\})$/i);
  if (m) {
    try {
      const d = JSON.parse(m[1]);
      if (!importarMemoriaSegura(d)) return R("Esse backup não está válido.", "import");
      return R("Memória importada com sucesso! 🧠", "import");
    } catch {
      return R("Esse backup não está válido. Copie o texto completo.", "import");
    }
  }

  if (/^(estatisticas|status|memoria)$/.test(t)) {
    const s = getStats();
    const mInfo = getMood();
    return R(
      `🧠 Respostas aprendidas: ${s.examples}\nSinônimos: ${s.synonyms}\nFatos: ${s.facts}\nNotas: ${s.notes}\nAssuntos lembrados: ${data.topics.length}\nEstilo de tom percebido: ${mInfo.mood} (${mInfo.score})`,
      "stats"
    );
  }
  if (/^(ajuda|comandos|help)$/.test(t)) return R(HELP, "help");

  const pareceCodigo = /(\bconst\b|\bfunction\b|=>|<\/?[a-z]+>|\bimport\b|\bexport\b|\bdef\s+\w+\(|\bclass\s+\w+)/i.test(original);
  const muitasLinhas = original.split("\n").length >= 5;
  if (original.length > 600 || (pareceCodigo && original.length > 140) || (muitasLinhas && original.length > 220)) {
    return R(analyzeText(original), "longtext");
  }

  const memResp = captureUserMemory(original);
  if (memResp) return R(memResp, "profile-memory");

  const intent = classify(original);

  if (intent === "created") {
    return R("Fui criada por Rizik em **2026** e sigo recebendo atualizações constantes! 🚀", "identity");
  }
  if (intent === "identity") {
    return R("Sou a BACH AI! 🧠 Fui criada por Rizik para ajudar todo mundo de graça — com memória contínua, leitura de fotos/vídeos/códigos, temas e pesquisa na internet.", intent);
  }

  const { item, score } = bestExample(original);
  if (item && score >= 0.82) {
    item.uses = (item.uses || 0) + 1;
    save();
    return R(item.answer, "learned");
  }
  if (item && score >= 0.6) {
    pending = { original, answer: item.answer };
    return R(`Você quis dizer “${item.question}”? (sim/não)`, "confirm");
  }

  const nome = recall("userName");
  const { mood } = getMood();
  switch (intent) {
    case "greeting":
      return R(pick([
        nome ? `Olá, ${nome}! Como você está?` : "Olá! Sou a BACH AI 🧠. Como você está?",
        nome ? `Oi, ${nome}! Em que posso ajudar hoje?` : "Oi! Em que posso ajudar?"
      ]), intent);
    case "encouragement":
      return R(mood === "descontraido" ? "Bora! 🚀 O que vamos fazer agora?" : "Certo, pode mandar o que você precisa.", intent);
    case "positive":
      return R(mood === "descontraido" ? "Show! 🙌" : "Ótimo!", intent);
    case "wellbeing":
      return R(pick(
        mood === "descontraido"
          ? ["Estou ótima e pronta pra ajudar! 😄 E você?", "Tudo certo por aqui! E com você?"]
          : ["Estou bem, obrigada. Como posso ajudar?", "Tudo bem por aqui! O que você gostaria de fazer agora?"]
      ), intent);
    case "thanks":
      return R("Por nada! Sempre que precisar, estou aqui.", intent);
    case "goodbye":
      return R("Até logo! Tudo que conversamos continua salvo aqui.", intent);
    case "capabilities":
      return R("Posso conversar acompanhando seu estilo, lembrar do que falamos do começo ao fim, mudar temas, criar apps (`/app`), traduzir idiomas, ler fotos/vídeos/códigos e pesquisar na internet.", intent);
    case "canread":
      return R("Sim! Leio textos, códigos, links, fotos (inclusive prints em modo escuro) e vídeos.", intent);
    case "time":
      return R("Agora são " + new Date().toLocaleTimeString("pt-BR") + ".", intent);
    case "date":
      return R("Hoje é " + new Date().toLocaleDateString("pt-BR") + ".", intent);
    case "name":
      return R(nome ? "Seu nome é **" + nome + "**." : "Ainda não sei seu nome. Diga: meu nome é ...", intent);
    case "city":
      return R(data.profile.city ? "Você me disse que é de " + data.profile.city + ". 📍" : "Ainda não sei onde você mora. Pode me contar!", intent);
    case "age":
      return R(data.profile.age ? "Você me disse que tem " + data.profile.age + " anos. 🎂" : "Ainda não sei sua idade.", intent);
    case "likes":
      return R(data.profile.likes.length ? "Você me contou que gosta de: " + data.profile.likes.join(", ") + "." : "Ainda não sei do que você gosta. Me conta!", intent);
    case "memorySummary":
      return R(buildMemorySummary(), intent);
    default:
      return { handled: false, intent, text: null };
  }
}

export const RizikBrain = {
  think,
  learn,
  learnSynonym,
  forget,
  remember,
  recall,
  logTopic,
  getRecentTopics,
  getProfile,
  getStats,
  normalize,
  updateTone,
  getMood,
  detectTone,
  setPendingError,
  getPendingError,
  clearPendingError
};
