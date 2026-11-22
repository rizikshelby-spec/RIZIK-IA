
/*
 BACH AI - CEREBRO 0.5
 Conversa, memoria e aprendizado.
*/

const STORAGE_KEY = "rizik_brain_v1";

const DEFAULT_DATA = {
  name: "BACH AI",
  facts: {},
  examples: [],
  version: 5
};

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && typeof saved === "object") {
      return {
        ...DEFAULT_DATA,
        ...saved,
        name: "BACH AI",
        facts: saved.facts || {},
        examples: Array.isArray(saved.examples) ? saved.examples : []
      };
    }
  } catch (e) {
    console.warn("Erro ao carregar memória:", e);
  }

  return {
    ...DEFAULT_DATA,
    facts: {},
    examples: []
  };
}

let data = loadData();

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Erro ao salvar:", e);
  }
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(text) {
  return normalize(text).replace(/\s/g, "");
}

function learn(question, answer) {
  const q = String(question || "").trim();
  const a = String(answer || "").trim();

  if (!q || !a) return false;

  const key = normalize(q);

  const index = data.examples.findIndex(
    item => normalize(item.question) === key
  );

  const item = {
    question: q,
    answer: a,
    updatedAt: Date.now()
  };

  if (index >= 0) {
    data.examples[index] = item;
  } else {
    data.examples.push(item);
  }

  saveData();
  return true;
}

function remember(key, value) {
  data.facts[key] = value;
  saveData();
}

function recall(key) {
  return data.facts[key] ?? null;
}

function classify(message) {
  const t = normalize(message);
  const c = compact(message);

  // Identidade: verificar antes de qualquer pesquisa.
  if (
    /quem criou voce|quem fez voce|quem desenvolveu voce|quem criou bach|quem criou a bach|quem e voce/.test(t) ||
    /quemcriouvoce|quemfezvoce|quemcrioubach/.test(c)
  ) return "identity";

  // Capacidades.
  if (
    /o que voce faz|oque voce faz|que voce sabe fazer|faz de bom|suas capacidades|suas funcoes/.test(t) ||
    /oquevocefaz|quevocefaz/.test(c)
  ) return "capabilities";

  // Cumprimentos.
  if (/^(oi|ola|eai|opa|bom dia|boa tarde|boa noite)$/.test(t))
    return "greeting";

  // Incentivo.
  if (/^(bora|vamos|partiu|vambora|vamos nessa|bora la)$/.test(t))
    return "encouragement";

  // Conversa positiva.
  if (/^(beleza|blz|legal|massa|show|bacana|top|otimo|otima)$/.test(t))
    return "positive";

  // Bem-estar e respostas de conversa.
  if (
    /^(tudo bem|como vai|como voce esta|bem e voce|bem e vc|to bem e voce|estou bem e voce|e voce|e vc|tudo certo)$/.test(t)
  ) return "wellbeing";

  if (/^(obrigado|obrigada|valeu|agradecido|agradecida)$/.test(t))
    return "thanks";

  if (/^(tchau|ate mais|falou|fui|ate logo)$/.test(t))
    return "goodbye";

  if (/que horas|hora agora/.test(t))
    return "time";

  if (/que dia|data de hoje/.test(t))
    return "date";

  if (/^(qual e )?meu nome$/.test(t))
    return "name";

  return "unknown";
}

function findExample(text) {
  const key = normalize(text);

  const exact = data.examples.find(
    item => normalize(item.question) === key
  );

  if (exact) return exact;

  const noSpace = data.examples.find(
    item => compact(item.question) === compact(text)
  );

  if (noSpace) return noSpace;

  return null;
}

function think(message) {
  const original = String(message || "").trim();
  const t = normalize(original);

  if (!t) {
    return {
      handled: true,
      intent: "empty",
      text: "Pode escrever sua mensagem!"
    };
  }

  // Ensinar a BACH.
  const teaching = original.match(
    /^ensine\s*:\s*(.+?)\s*=>\s*(.+)$/i
  );

  if (teaching) {
    learn(teaching[1], teaching[2]);

    return {
      handled: true,
      intent: "learning",
      text: "Aprendi! 🧠 Vou guardar essa resposta na minha memória."
    };
  }

  const intent = classify(original);

  // Identidade sempre tem prioridade.
  if (intent === "identity") {
    return {
      handled: true,
      intent,
      text: "Sou a BACH AI! 🧠 Fui criada no seu projeto BACH AI, desenvolvido por você. Estou evoluindo com memória, aprendizado e pesquisa na internet."
    };
  }

  // Verificar respostas aprendidas.
  const example = findExample(original);

  if (example) {
    return {
      handled: true,
      intent: "learned",
      text: example.answer
    };
  }

  switch (intent) {
    case "greeting":
      return {
        handled: true,
        intent,
        text: "Olá! Sou a BACH AI 🧠. Como você está?"
      };

    case "encouragement":
      return {
        handled: true,
        intent,
        text: "Bora! 🚀 Estou pronta! O que vamos fazer?"
      };

    case "positive":
      return {
        handled: true,
        intent,
        text: "Que bom! 😄"
      };

    case "wellbeing":
      return {
        handled: true,
        intent,
        text: "Estou ótima e pronta para conversar com você! 😄"
      };

    case "thanks":
      return {
        handled: true,
        intent,
        text: "Por nada! Sempre que precisar, estou aqui. 😊"
      };

    case "goodbye":
      return {
        handled: true,
        intent,
        text: "Até mais! 👋"
      };

    case "capabilities":
      return {
        handled: true,
        intent,
        text: "Posso conversar, aprender respostas que você me ensina, guardar informações, pesquisar na internet e consultar o clima. Ainda estou evoluindo! 🧠"
      };

    case "time":
      return {
        handled: true,
        intent,
        text: "Agora são " + new Date().toLocaleTimeString("pt-BR") + "."
      };

    case "date":
      return {
        handled: true,
        intent,
        text: "Hoje é " + new Date().toLocaleDateString("pt-BR") + "."
      };

    case "name": {
      const name = recall("userName");

      return {
        handled: true,
        intent,
        text: name ? "Seu nome é " + name + "." : "Ainda não sei seu nome."
      };
    }

    default:
      return {
        handled: false,
        intent: "unknown",
        text: null
      };
  }
}

export const RizikBrain = {
  version: "0.5.0",
  think,
  learn,
  remember,
  recall,
  classify,

  getStats() {
    return {
      examples: data.examples.length,
      facts: Object.keys(data.facts).length,
      version: data.version
    };
  }
};
