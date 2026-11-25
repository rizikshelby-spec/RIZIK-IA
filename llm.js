/* BACH AI 5.4 — Motor Nativo 100% Próprio
 * Criada do zero por Rizik — sem modelos ou APIs de IAs externas.
 * Coordena o perfil do motor local (Rede Neural + Memória + Regras + Pesquisa Web).
 */

const K_ENGINE = "bach_engine_prefs_v1";

const DEFAULT_CFG = {
  provider: "bach-nativa",
  key: "",
  url: "",
  model: "BACH-AI-5.4-Nativa",
  reasoningDepth: "normal" // "rapido" | "normal" | "profundo"
};

function loadPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(K_ENGINE) || "null");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const depth = ["rapido", "normal", "profundo"].includes(raw.reasoningDepth)
        ? raw.reasoningDepth
        : "normal";
      return { ...DEFAULT_CFG, reasoningDepth: depth };
    }
  } catch {}
  return { ...DEFAULT_CFG };
}

function savePrefs(patch = {}) {
  const atual = loadPrefs();
  const next = {
    ...DEFAULT_CFG,
    reasoningDepth: ["rapido", "normal", "profundo"].includes(patch.reasoningDepth)
      ? patch.reasoningDepth
      : atual.reasoningDepth
  };
  try { localStorage.setItem(K_ENGINE, JSON.stringify(next)); } catch {}
  return next;
}

function getConfig() {
  return loadPrefs();
}

function hasModel() {
  // Mantido false para indicar que não há IA externa acoplada;
  // toda a inteligência roda nos módulos próprios da BACH AI.
  return false;
}

function label() {
  const c = loadPrefs();
  return "BACH AI 5.4 (Motor Próprio • " + c.reasoningDepth + ")";
}

function command(raw) {
  const t = String(raw || "").trim();
  if (!/^\/(ia|chave|modelo)(?:\s+|$)/i.test(t)) return null;

  const arg = t.replace(/^\/(ia|chave|modelo)\s*/i, "").trim().toLowerCase();

  if (/^\/chave\b/i.test(t)) {
    return {
      handled: true,
      secret: true,
      text: "🧠 A **BACH AI** não usa chaves de IAs externas — ela opera 100% com cérebro, rede neural, memória e pesquisa próprios."
    };
  }

  if (/^(rapido|rápido|normal|profundo)$/.test(arg)) {
    const depth = arg.replace("á", "a");
    savePrefs({ reasoningDepth: depth });
    return {
      handled: true,
      secret: false,
      text: "⚙️ Profundidade do motor próprio ajustada para **`" + depth + "`**."
    };
  }

  const c = loadPrefs();
  return {
    handled: true,
    secret: false,
    text: "🧠 **MOTOR PRÓPRIO DA BACH AI**\n" +
      "• Motor ativo: **BACH AI 5.4 (100% Própria)**\n" +
      "• Arquitetura: **Rede Neural MLP + Memória Contínua + 36 Departamentos + Pesquisa Web**\n" +
      "• Profundidade atual: **`" + c.reasoningDepth + "`**\n" +
      "• IAs externas: **Nenhuma (100% independente)**\n\n" +
      "Ajuste o ritmo com: `/ia rapido`, `/ia normal` ou `/ia profundo`."
  };
}

async function generate() {
  throw new Error("A BACH AI opera exclusivamente com motor próprio local.");
}

export const LLM = { getConfig, hasModel, label, command, generate, savePrefs };
