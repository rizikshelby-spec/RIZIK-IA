
/*
 BACH AI - CEREBRO 0.3
 Memoria, aprendizado e conversa básica.
*/

const STORAGE_KEY = "rizik_brain_v1";

const DEFAULT_DATA = {
  name: "BACH AI",
  facts: {},
  examples: [],
  version: 3
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
  } catch (error) {
    console.warn("Erro ao carregar memória", error);
  }

  return structuredClone(DEFAULT_DATA);
}

let data = loadData();

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("Erro ao salvar memória", error);
    return false;
  }
}

function normalize(text) {
  return String(text)
    .toLocaleLowerCase("pt-BR")
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

  const example = {
    question: q,
    answer: a,
    updatedAt: Date.now()
  };

  if (index >= 0) {
    data.examples[index] = example;
  } else {
    data.examples.push(example);
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

function classify(text) {
  const t = normalize(text);

  if (/^(oi|ola|eai|opa|bom dia|boa tarde|boa noite)\b/.test(t))
    return "greeting";

  if (/^(bora|vamos|partiu|vambora|vamos nessa)$/.test(t))
    return "encouragement";

  if (/^(beleza|blz|legal|massa|show|bacana|top)$/.test(t))
    return "positive";

  if (/^(obrigado|obrigada|valeu|agradecido)$/.test(t))
    return "thanks";

  if (/^(tudo bem|como vai|como voce esta)$/.test(t))
    return "wellbeing";

  if (/^(tchau|ate mais|falou|fui)$/.test(t))
    return "goodbye";

  if (t.includes("quem e voce") || t.includes("seu nome"))
    return "identity";

  if (t.includes("que horas") || t.includes("hora agora"))
    return "time";

  if (t.includes("que dia") || t.includes("data de hoje"))
    return "date";

  if (t.includes("meu nome"))
    return "name";

  return "unknown";
}

function findExample(text) {
  const exact = data.examples.find(
    item => normalize(item.question) === text
  );

  if (exact) return exact;

  const noSpaces = data.examples.find(
    item => compact(item.question) === compact(text)
  );

  if (noSpaces) return noSpaces;

  const words = text.split(" ").filter(word => word.length > 2);

  if (words.length < 2) return null;

  let best = null;
  let bestScore = 0;

  for (const item of data.examples) {
    const candidateWords = normalize(item.question)
      .split(" ")
      .filter(word => word.length > 2);

    const matches = words.filter(
      word => candidateWords.includes(word)
    ).length;

    const score = matches /
      Math.max(words.length, candidateWords.length, 1);

    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }

  return bestScore >= 0.65 ? best : null;
}

function think(message) {
  const original = String(message || "").trim();
  const text = normalize(original);

  if (!text) {
    return {
      handled: true,
      intent: "empty",
      text: "Pode escrever sua mensagem!"
    };
  }

  const teaching = original.match(
    /^ensine\s*:\s*(.+?)\s*=>\s*(.+)$/i
  );

  if (teaching) {
    learn(teaching[1], teaching[2]);

    return {
      handled: true,
      intent: "learning",
      text: "Aprendi um novo exemplo! Vou guardar essa associação."
    };
  }

  const example = findExample(text);

  if (example) {
    return {
      handled: true,
      intent: "learned",
      text: example.answer
    };
  }

  const intent = classify(original);

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
        text: "Bora! 🚀 Estou pronta. O que vamos fazer?"
      };

    case "positive":
      return {
        handled: true,
        intent,
        text: "Que bom! 😄 Vamos continuar!"
      };

    case "thanks":
      return {
        handled: true,
        intent,
        text: "Por nada! Estou aqui para ajudar. 😊"
      };

    case "wellbeing":
      return {
        handled: true,
        intent,
        text: "Estou funcionando direitinho! E você, tudo bem?"
      };

    case "goodbye":
      return {
        handled: true,
        intent,
        text: "Até mais! Estarei aqui quando voltar. 👋"
      };

    case "identity":
      return {
        handled: true,
        intent,
        text: "Sou a BACH AI 🧠, uma inteligência artificial própria em desenvolvimento, com memória, aprendizado e ferramentas de pesquisa."
      };

    case "time":
      return {
        handled: true,
        intent,
        text: "Agora são " +
          new Date().toLocaleTimeString("pt-BR") + "."
      };

    case "date":
      return {
        handled: true,
        intent,
        text: "Hoje é " +
          new Date().toLocaleDateString("pt-BR") + "."
      };

    case "name": {
      const match = original.match(
        /meu nome (?:e|é)\s+(.+)/i
      );

      if (match) {
        remember("userName", match[1].trim());

        return {
          handled: true,
          intent: "remember_name",
          text: "Prazer, " + match[1].trim() +
            "! Guardei seu nome."
        };
      }

      const name = recall("userName");

      return {
        handled: true,
        intent: "recall_name",
        text: name
          ? "Seu nome é " + name + "."
          : "Ainda não sei seu nome."
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
  version: "0.3.0",
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
