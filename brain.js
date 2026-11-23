/* BACH AI - CÉREBRO 0.8
   Conversa, memória automática do usuário e dos assuntos, aprendizado, autocorreção e backup. */

const KEY = "rizik_brain_v1";
const BASE = {
  name: "BACH AI",
  facts: {},
  examples: [],
  synonyms: {},
  notes: [],
  profile: { likes: [], dislikes: [], city: null, age: null, projects: [], favorites: {} },
  topics: [],
  version: 8
};

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === "object") {
      return {
        ...BASE, ...s, name: "BACH AI", version: 8,
        facts: s.facts || {},
        examples: Array.isArray(s.examples) ? s.examples : [],
        synonyms: s.synonyms || {},
        notes: Array.isArray(s.notes) ? s.notes : [],
        profile: { ...BASE.profile, ...(s.profile || {}), likes: s.profile?.likes || [], dislikes: s.profile?.dislikes || [], projects: s.profile?.projects || [], favorites: s.profile?.favorites || {} },
        topics: Array.isArray(s.topics) ? s.topics : []
      };
    }
  } catch (e) { console.warn("Erro ao carregar:", e); }
  return JSON.parse(JSON.stringify(BASE));
}

let data = load();
let pending = null;

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch (e) { console.warn("Erro ao salvar:", e); }
}

function normalize(t) {
  return String(t || "").toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ").trim();
}
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function applySyn(t) {
  return normalize(t).split(" ").map(w => data.synonyms[w] || w).join(" ");
}

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
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

/* Vocabulário expandido para corrigir erros de digitação em português e saudações comuns */
const CORE_WORDS = (
  "oi ola eai opa bom dia tarde noite quem criou voce fez desenvolveu bach " +
  "faz sabe fazer capacidades funcoes tudo bem como vai esta obrigado obrigada valeu tchau " +
  "ate mais horas hora agora data hoje amanha ontem meu minha nome beleza legal massa show bora vamos partiu " +
  "pesquisa pesquisar procura procurar explicar explica resume resumir traduz traduzir significa significado " +
  "sinonimo antonimo dicionario idioma lingua ingles espanhol frances italiano alemão japones " +
  "filme filmes serie series anime desenho desenho animado jogo jogos musica livro historia ciencia tecnologia " +
  "programacao codigo javascript python html css sql github arquivo pasta imagem foto video texto " +
  "ajuda ajudar aprender ensinar estudar escrever falar ouvir ler criar jogar lembrar esquecer memoria " +
  "gosto adoro curto odeio moro cidade idade trabalho projeto ideia problema solucao resposta pergunta " +
  "hello hi hey thanks please sorry bye hola gracias adios bonjour merci ciao hallo danke"
).split(" ");

function vocab() {
  const v = new Set(CORE_WORDS);
  for (const ex of data.examples) normalize(ex.question).split(" ").forEach(w => v.add(w));
  return v;
}

function fixTypos(text) {
  const v = vocab();
  return normalize(text).split(" ").map(w => {
    if (w.length < 4 || v.has(w) || data.synonyms[w]) return w;
    const max = w.length >= 7 ? 2 : 1;
    let best = w, bd = max + 1;
    for (const c of v) {
      if (Math.abs(c.length - w.length) > max) continue;
      const d = lev(w, c);
      if (d < bd) { bd = d; best = c; }
    }
    return bd <= max ? best : w;
  }).join(" ");
}

function learn(q, a) {
  q = String(q || "").trim(); a = String(a || "").trim();
  if (!q || !a) return false;
  const key = applySyn(q);
  const i = data.examples.findIndex(x => applySyn(x.question) === key);
  const item = { question: q, answer: a, updatedAt: Date.now(), uses: i >= 0 ? data.examples[i].uses || 0 : 0 };
  if (i >= 0) data.examples[i] = item; else data.examples.push(item);
  save(); return true;
}

function forget(q) {
  const key = applySyn(q);
  const n = data.examples.length;
  data.examples = data.examples.filter(x => applySyn(x.question) !== key);
  save(); return n - data.examples.length;
}

function remember(k, v) { data.facts[k] = v; save(); }
function recall(k) { return data.facts[k] ?? null; }

function logTopic(topic) {
  const clean = String(topic || "").trim().slice(0, 80);
  if (!clean || clean.length < 3) return;
  data.topics = data.topics.filter(x => normalize(x.topic) !== normalize(clean));
  data.topics.push({ topic: clean, at: Date.now() });
  data.topics = data.topics.slice(-50);
  save();
}

function getRecentTopics(limit = 10) {
  return data.topics.slice(-limit).reverse();
}

function getProfile() {
  return { ...data.profile, userName: recall("userName") };
}

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

/* Extrai automaticamente memórias do usuário durante a conversa */
function captureUserMemory(original) {
  const raw = String(original || "").trim();
  if (!raw || raw.includes("?") || raw.length > 140) return null;

  let m = raw.match(/^(?:eu\s+)?(?:gosto muito de|gosto de|adoro|curto|amo)\s+(.+)$/i);
  if (m && !/^(que|quando|como|se|saber|ver|perguntar)\b/i.test(m[1])) {
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

  m = raw.match(/^(?:eu\s+)?(?:moro em|moro no|moro na|sou de|sou do|sou da|vivo em)\s+(.+)$/i);
  if (m && m[1].split(/\s+/).length <= 5) {
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
    data.profile.favorites[cat] = val;
    save();
    return `Guardei! Seu ${cat} favorito é ${val}. ⭐`;
  }

  return null;
}

function bestExample(text) {
  const key = applySyn(fixTypos(text));
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
  if (/que horas|hora agora/.test(t)) return "time";
  if (/que dia|data de hoje/.test(t)) return "date";
  if (/^(qual e )?meu nome$/.test(t)) return "name";
  if (/^(onde (eu )?moro|qual (e )?minha cidade)$/.test(t)) return "city";
  if (/^(quantos anos (eu )?tenho|qual (e )?minha idade)$/.test(t)) return "age";
  if (/^(do que eu gosto|quais (sao )?meus gostos)$/.test(t)) return "likes";
  if (/^(o que voce lembra de mim|o que voce sabe de mim|o que voce sabe sobre mim|lembra do que falamos|do que falamos|quais assuntos falamos)$/.test(t)) return "memorySummary";
  return "unknown";
}

const R = (text, intent) => ({ handled: true, intent, text });

function analyzeText(txt) {
  const words = txt.trim().split(/\s+/).length;
  const code = /(\bconst\b|\bfunction\b|=>|<\/?[a-z]+>|\bimport\b|\breturn\b)/.test(txt);
  return "Recebi um texto grande: " + words + " palavras e " + txt.length + " caracteres." +
    (code ? " Parece código de programação." : "") +
    "\n\nPosso resumir, listar as funções e revisar o código por regras, ou pesquisar assuntos sobre ele.";
}

const HELP =
  "Posso te ajudar de várias formas 😊\n\n" +
  "💬 Conversar e aprender\n" +
  "• ensine: pergunta => resposta\n" +
  "• corrija: pergunta => nova resposta\n" +
  "• esqueça: pergunta\n" +
  "• sinônimo: gíria = palavra (ou sinônimos: top, daora = legal)\n" +
  "• meu nome é ... / eu gosto de ... / moro em ...\n\n" +
  "🔎 Pesquisar e traduzir\n" +
  "• pesquise sobre ... / pesquise a fundo sobre ...\n" +
  "• o que significa ... / como se diz ... em inglês (ou qualquer língua)\n" +
  "• clima em (sua cidade)\n\n" +
  "📁 Arquivos\n" +
  "• botão + para anexar fotos, vídeos e textos\n" +
  "• /arquivos, /abrir nome, /buscar palavra, /apagar nome\n\n" +
  "💻 Programação, jogos e humor\n" +
  "• o que é função? como fazer um loop? / jogar forca / conta uma piada\n\n" +
  "🕘 Histórico\n• /historico • /nova (nova conversa)\n\n🛠️ Extras: lembre: algo • estatísticas • /clear";

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
  if (data.topics.length) parts.push("• Últimos assuntos conversados: " + data.topics.slice(-6).map(x => x.topic).join(", "));
  if (data.notes.length) parts.push("• Notas salvas: " + data.notes.slice(-5).map(n => n.text).join(" | "));
  return parts.length
    ? "🧠 Isto é o que eu lembro sobre você e nossas conversas:\n\n" + parts.join("\n")
    : "Ainda sei pouco sobre você! Me conte seu nome, o que você gosta ou o que está fazendo que eu guardo tudo. 😊";
}

function think(message) {
  const original = String(message || "").trim();
  const t = normalize(original);
  if (!t) return R("Pode escrever sua mensagem!", "empty");

  if (pending) {
    const p = pending; pending = null;
    if (/^(sim|s|isso|exato|isso mesmo|pode ser)$/.test(t)) {
      learn(p.original, p.answer);
      return R(p.answer, "autocorrected");
    }
    if (/^(nao|n|nope)$/.test(t)) {
      return R("Ok! Me ensine com: ensine: pergunta => resposta 🧠", "declined");
    }
  }

  let m = original.match(/^(?:ensine|corrija|corrigir)\s*:\s*(.+?)\s*=>\s*(.+)$/is);
  if (m) { learn(m[1], m[2]); return R("Aprendi! 🧠 Guardei essa resposta na memória.", "learning"); }

  m = original.match(/^(?:esque[cç]a|apague)\s*:\s*(.+)$/i);
  if (m) {
    const n = forget(m[1]);
    return R(n ? "Pronto, esqueci essa resposta." : "Não encontrei isso na minha memória.", "forget");
  }

  m = original.match(/^sin[oô]nimos?\s*:\s*(.+?)\s*=\s*(.+)$/i);
  if (m) {
    const ladoA = m[1].split(",").map(normalize).filter(Boolean);
    const b = normalize(m[2]);
    if (!ladoA.length || !b || b.includes(" ") || ladoA.some(a => a.includes(" "))) {
      return R("Use palavras simples. Ex: sinônimo: blz = beleza ou sinônimos: top, massa, daora = legal", "synonym");
    }
    ladoA.forEach(a => { data.synonyms[a] = b; });
    save();
    return R(`Entendi! Agora ${ladoA.map(x => `"${x}"`).join(", ")} significa "${b}" pra mim. 📚`, "synonym");
  }

  m = original.match(/^(?:meu nome [eé]|me chamo|pode me chamar de)\s+(.+)$/i);
  if (m) {
    const nome = m[1].trim().replace(/[.!]+$/, "").slice(0, 40);
    remember("userName", nome);
    return R(`Prazer, ${nome}! Vou lembrar do seu nome. 😊`, "name-set");
  }

  m = original.match(/^lembre\s*:\s*(.+)$/i);
  if (m) { data.notes.push({ text: m[1].trim(), at: Date.now() }); save(); return R("Anotado! 📝", "note"); }
  if (/^(o que voce lembra|oque voce lembra|minhas notas)$/.test(t)) {
    return R(data.notes.length
      ? "Eu lembro:\n" + data.notes.slice(-10).map((n, i) => (i + 1) + ". " + n.text).join("\n")
      : "Ainda não tenho notas. Use: lembre: algo", "notes");
  }

  if (/^\/(exportar|backup)$/i.test(original.trim())) {
    return R("Copie e guarde este backup:\n\n" + JSON.stringify(data), "export");
  }
  m = original.match(/^importar mem[oó]ria\s*:\s*(\{[\s\S]+\})$/i);
  if (m) {
    try {
      const d = JSON.parse(m[1]);
      (d.examples || []).forEach(e => e && learn(e.question, e.answer));
      Object.assign(data.facts, d.facts || {});
      Object.assign(data.synonyms, d.synonyms || {});
      (d.notes || []).forEach(n => n && n.text && data.notes.push(n));
      if (d.profile) Object.assign(data.profile, d.profile);
      save();
      return R("Memória importada com sucesso! 🧠", "import");
    } catch { return R("Esse backup não está válido. Copie o texto completo.", "import"); }
  }

  if (/^(estatisticas|status|memoria)$/.test(t)) {
    const s = getStats();
    return R(`🧠 Respostas aprendidas: ${s.examples}\nSinônimos: ${s.synonyms}\nFatos: ${s.facts}\nNotas: ${s.notes}\nAssuntos lembrados: ${data.topics.length}`, "stats");
  }
  if (/^(ajuda|comandos|help)$/.test(t)) return R(HELP, "help");

  if (original.length > 160 || t.split(" ").length > 25) {
    return R(analyzeText(original), "longtext");
  }

  // Captura memórias espontâneas sobre o usuário
  const memResp = captureUserMemory(original);
  if (memResp) return R(memResp, "profile-memory");

  const intent = classify(original);

  if (intent === "identity") {
    return R("Sou a BACH AI! 🧠 Fui criada no seu projeto BACH AI, desenvolvido por você. Estou evoluindo com memória, vocabulário, tradução, código e pesquisa na internet.", intent);
  }

  const { item, score } = bestExample(original);
  if (item && score >= 0.8) {
    item.uses = (item.uses || 0) + 1; save();
    return R(item.answer, "learned");
  }
  if (item && score >= 0.55) {
    pending = { original, answer: item.answer };
    return R(`Você quis dizer “${item.question}”? (sim/não)`, "confirm");
  }

  const nome = recall("userName");
  switch (intent) {
    case "greeting": return R(pick([
      nome ? `Olá, ${nome}! Sou a BACH AI 🧠. Como você está?` : "Olá! Sou a BACH AI 🧠. Como você está?",
      "Oi! Que bom te ver por aqui! 😄"]), intent);
    case "encouragement": return R(pick(["Bora! 🚀 Estou pronta! O que vamos fazer?", "Partiu! 💪 Me diga o que precisa."]), intent);
    case "positive": return R(pick(["Que bom! 😄", "Show! 🙌"]), intent);
    case "wellbeing": return R("Estou ótima e pronta para conversar com você! 😄", intent);
    case "thanks": return R(pick(["Por nada! Sempre que precisar, estou aqui. 😊", "Disponha! 💜"]), intent);
    case "goodbye": return R(pick(["Até mais! 👋", "Até logo! Volte sempre! 💜"]), intent);
    case "capabilities": return R("Posso conversar, lembrar do que você me conta, aprender respostas e palavras novas, traduzir em 18+ idiomas, revisar códigos, jogar e pesquisar na internet. Digite “ajuda” para ver os comandos! 🧠", intent);
    case "canread": return R("Sim! Leio textos, códigos, arquivos anexados e links: resumo, explico o que o código faz, mostro as funções e reviso por regras. E se conectar uma chave Gemini (/chave), uso um modelo avançado também.", intent);
    case "time": return R("Agora são " + new Date().toLocaleTimeString("pt-BR") + ".", intent);
    case "date": return R("Hoje é " + new Date().toLocaleDateString("pt-BR") + ".", intent);
    case "name": return R(nome ? "Seu nome é " + nome + "." : "Ainda não sei seu nome. Diga: meu nome é ...", intent);
    case "city": return R(data.profile.city ? "Você me disse que é de " + data.profile.city + ". 📍" : "Ainda não sei onde você mora. Pode me contar!", intent);
    case "age": return R(data.profile.age ? "Você me disse que tem " + data.profile.age + " anos. 🎂" : "Ainda não sei sua idade.", intent);
    case "likes": return R(data.profile.likes.length ? "Você me contou que gosta de: " + data.profile.likes.join(", ") + ". 💜" : "Ainda não sei do que você gosta. Me conte!", intent);
    case "memorySummary": return R(buildMemorySummary(), intent);
    default: return { handled: false, intent: "unknown", text: null };
  }
}

function getStats() {
  return {
    examples: data.examples.length,
    facts: Object.keys(data.facts).length,
    synonyms: Object.keys(data.synonyms).length,
    notes: data.notes.length,
    topics: data.topics.length,
    version: data.version
  };
}

export const RizikBrain = {
  version: "0.8.0",
  think, learn, forget, remember, recall, classify, getStats,
  getProfile, logTopic, getRecentTopics
};
