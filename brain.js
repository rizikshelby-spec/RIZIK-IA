/* BACH AI - CEREBRO 0.6
   Conversa, memória, aprendizado, autocorreção e backup. */

const KEY = "rizik_brain_v1";
const BASE = { name: "BACH AI", facts: {}, examples: [], synonyms: {}, notes: [], version: 6 };

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === "object") {
      return {
        ...BASE, ...s, name: "BACH AI", version: 6,
        facts: s.facts || {},
        examples: Array.isArray(s.examples) ? s.examples : [],
        synonyms: s.synonyms || {},
        notes: Array.isArray(s.notes) ? s.notes : []
      };
    }
  } catch (e) { console.warn("Erro ao carregar:", e); }
  return { ...BASE, facts: {}, examples: [], synonyms: {}, notes: [] };
}

let data = load();
let pending = null; // pergunta "você quis dizer?" aguardando sim/não

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
const compact = t => normalize(t).replace(/\s/g, "");
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

/* Vocabulário para corrigir erros de digitação */
const CORE_WORDS = ("oi ola eai opa bom dia tarde noite quem criou voce fez desenvolveu bach " +
  "faz sabe fazer capacidades funcoes tudo bem como vai esta obrigado obrigada valeu tchau " +
  "ate mais horas hora agora data hoje meu nome beleza legal massa show bora vamos partiu").split(" ");

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
  if (/^(oi|ola|eai|opa|bom dia|boa tarde|boa noite)$/.test(t)) return "greeting";
  if (/^(bora|vamos|partiu|vambora|vamos nessa|bora la)$/.test(t)) return "encouragement";
  if (/^(beleza|blz|legal|massa|show|bacana|top|otimo|otima)$/.test(t)) return "positive";
  if (/^(tudo bem|como vai|como voce esta|bem e voce|bem e vc|to bem e voce|estou bem e voce|e voce|e vc|tudo certo)$/.test(t)) return "wellbeing";
  if (/^(obrigado|obrigada|valeu|agradecido|agradecida)$/.test(t)) return "thanks";
  if (/^(tchau|ate mais|falou|fui|ate logo)$/.test(t)) return "goodbye";
  if (/que horas|hora agora/.test(t)) return "time";
  if (/que dia|data de hoje/.test(t)) return "date";
  if (/^(qual e )?meu nome$/.test(t)) return "name";
  return "unknown";
}

const R = (text, intent) => ({ handled: true, intent, text });

function analyzeText(txt) {
  const words = txt.trim().split(/\s+/).length;
  const code = /(\bconst\b|\bfunction\b|=>|<\/?[a-z]+>|\bimport\b|\breturn\b)/.test(txt);
  return "Recebi um texto grande: " + words + " palavras e " + txt.length + " caracteres." +
    (code ? " Parece código de programação." : "") +
    "\n\nEu sou uma IA de regras e ainda não consigo ler nem resumir textos longos de verdade. " +
    "Posso pesquisar (pesquise sobre ...) ou aprender respostas curtas com você. " +
    "Para entender textos grandes, o ideal é conectar um modelo de IA por API.";
}

const HELP =
  "Comandos que eu entendo:\n" +
  "• ensine: pergunta => resposta\n" +
  "• corrija: pergunta => nova resposta\n" +
  "• esqueça: pergunta\n" +
  "• sinônimo: palavra = palavra_conhecida\n" +
  "• meu nome é ...\n" +
  "• lembre: algo / o que você lembra\n" +
  "• exportar memória / importar memória: {json}\n" +
  "• estatísticas\n" +
  "• /clear (apaga o chat)\n" +
  "• pesquise a fundo sobre ... (lê várias fontes e guarda)\n" +
  "• cole um texto ou código e eu leio\n" +
  "• pesquise sobre ... / clima em ...";

function think(message) {
  const original = String(message || "").trim();
  const t = normalize(original);
  if (!t) return R("Pode escrever sua mensagem!", "empty");

  // Confirmação de "você quis dizer?"
  if (pending) {
    const p = pending; pending = null;
    if (/^(sim|s|isso|exato|isso mesmo|pode ser)$/.test(t)) {
      learn(p.original, p.answer); // aprende a variação sozinha
      return R(p.answer, "autocorrected");
    }
    if (/^(nao|n|nope)$/.test(t)) {
      return R("Ok! Me ensine com: ensine: pergunta => resposta 🧠", "declined");
    }
  }

  // Ensinar / corrigir
  let m = original.match(/^(?:ensine|corrija|corrigir)\s*:\s*(.+?)\s*=>\s*(.+)$/is);
  if (m) { learn(m[1], m[2]); return R("Aprendi! 🧠 Guardei essa resposta na memória.", "learning"); }

  // Esquecer
  m = original.match(/^(?:esque[cç]a|apague)\s*:\s*(.+)$/i);
  if (m) {
    const n = forget(m[1]);
    return R(n ? "Pronto, esqueci essa resposta." : "Não encontrei isso na minha memória.", "forget");
  }

  // Sinônimos (ensinar palavras)
  m = original.match(/^sin[oô]nimo\s*:\s*(.+?)\s*=\s*(.+)$/i);
  if (m) {
    const a = normalize(m[1]), b = normalize(m[2]);
    if (!a || !b || a.includes(" ") || b.includes(" ")) return R("Use uma palavra de cada lado. Ex: sinônimo: blz = beleza", "synonym");
    data.synonyms[a] = b; save();
    return R(`Entendi! Agora "${a}" significa "${b}" pra mim. 📚`, "synonym");
  }

  // Nome do usuário
  m = original.match(/^(?:meu nome [eé]|me chamo|pode me chamar de)\s+(.+)$/i);
  if (m) {
    const nome = m[1].trim().replace(/[.!]+$/, "").slice(0, 40);
    remember("userName", nome);
    return R(`Prazer, ${nome}! Vou lembrar do seu nome. 😊`, "name-set");
  }

  // Notas
  m = original.match(/^lembre\s*:\s*(.+)$/i);
  if (m) { data.notes.push({ text: m[1].trim(), at: Date.now() }); save(); return R("Anotado! 📝", "note"); }
  if (/^(o que voce lembra|oque voce lembra|minhas notas)$/.test(t)) {
    return R(data.notes.length
      ? "Eu lembro:\n" + data.notes.slice(-10).map((n, i) => (i + 1) + ". " + n.text).join("\n")
      : "Ainda não tenho notas. Use: lembre: algo", "notes");
  }

  // Backup
  if (/^(exportar memoria|backup|exportar)$/.test(t)) {
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
      save();
      return R("Memória importada com sucesso! 🧠", "import");
    } catch { return R("Esse backup não está válido. Copie o texto completo.", "import"); }
  }

  if (/^(estatisticas|status|memoria)$/.test(t)) {
    const s = getStats();
    return R(`🧠 Respostas aprendidas: ${s.examples}\nSinônimos: ${s.synonyms}\nFatos: ${s.facts}\nNotas: ${s.notes}`, "stats");
  }
  if (/^(ajuda|comandos|help)$/.test(t)) return R(HELP, "help");

  // Textos grandes (ex.: código colado) não passam pelas regras de conversa.
  if (original.length > 160 || t.split(" ").length > 25) {
    return R(analyzeText(original), "longtext");
  }

  const intent = classify(original);

  if (intent === "identity") {
    return R("Sou a BACH AI! 🧠 Fui criada no seu projeto BACH AI, desenvolvido por você. Estou evoluindo com memória, aprendizado e pesquisa na internet.", intent);
  }

  // Respostas aprendidas (com autocorreção)
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
    case "capabilities": return R("Posso conversar, aprender respostas e palavras novas, corrigir erros de digitação, guardar informações e notas, fazer backup da memória, pesquisar na internet e consultar o clima. Digite “ajuda” para ver os comandos! 🧠", intent);
    case "canread": return R("Textos curtos eu leio, mas não entendo de verdade: sou uma IA de regras. Textos enormes eu só consigo contar e identificar se parecem código. Para resolver textos grandes, o ideal é conectar um modelo de IA por API.", intent);
    case "time": return R("Agora são " + new Date().toLocaleTimeString("pt-BR") + ".", intent);
    case "date": return R("Hoje é " + new Date().toLocaleDateString("pt-BR") + ".", intent);
    case "name": return R(nome ? "Seu nome é " + nome + "." : "Ainda não sei seu nome. Diga: meu nome é ...", intent);
    default: return { handled: false, intent: "unknown", text: null };
  }
}

function getStats() {
  return {
    examples: data.examples.length,
    facts: Object.keys(data.facts).length,
    synonyms: Object.keys(data.synonyms).length,
    notes: data.notes.length,
    version: data.version
  };
}

export const RizikBrain = { version: "0.6.0", think, learn, forget, remember, recall, classify, getStats };
