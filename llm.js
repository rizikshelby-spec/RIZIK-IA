/* BACH AI 4.1 — Provedor híbrido de IA (Offline, Ollama local, OpenAI-compatível ou Gemini).
 * Mantém a BACH AI como identidade principal e permite trocar o motor sem reescrever o app.
 */

const K_PROV = "bach_llm_provider";
const K_URL = "bach_llm_url";
const K_KEY = "bach_gemini_key";
const K_MOD = "bach_gemini_model";

function getConfig() {
  let key = "", url = "", savedProv = "", model = "";
  try {
    key = localStorage.getItem(K_KEY) || "";
    url = localStorage.getItem(K_URL) || "";
    savedProv = localStorage.getItem(K_PROV) || "";
    model = localStorage.getItem(K_MOD) || "";
  } catch {}

  const provider = savedProv || (url ? "openai" : key ? "gemini" : "offline");
  const defaultModel =
    provider === "ollama" ? "llama3.2" :
    provider === "openai" ? "gpt-4o-mini" :
    "gemini-3.5-flash-lite";

  return {
    provider,
    key,
    url,
    model: model || defaultModel
  };
}

function hasModel() {
  const c = getConfig();
  if (c.provider === "offline") return false;
  if (c.provider === "ollama") return true;
  if (c.provider === "openai") return Boolean(c.url);
  return Boolean(c.key);
}

function label() {
  const c = getConfig();
  if (!hasModel()) return "Local (Offline)";
  if (c.provider === "ollama") return "Ollama (" + c.model + ")";
  if (c.provider === "openai") return "API (" + c.model + ")";
  return "Gemini (" + c.model + ")";
}

function command(raw) {
  const t = String(raw || "").trim();

  if (/^\/chave\s+/i.test(t)) {
    const v = t.replace(/^\/chave\s+/i, "").trim();
    if (/^(apagar|remover|off)$/i.test(v)) {
      localStorage.removeItem(K_KEY);
      if (localStorage.getItem(K_PROV) === "gemini") localStorage.setItem(K_PROV, "offline");
      return { handled: true, secret: true, text: "Chave removida. Voltei ao modo local (offline)." };
    }
    if (v.length < 20) {
      return { handled: true, secret: true, text: "Essa chave parece curta demais. Cole a chave inteira." };
    }
    localStorage.setItem(K_KEY, v);
    localStorage.setItem(K_PROV, "gemini");
    return { handled: true, secret: true, text: "Chave salva neste aparelho ✅ Motor ativo: " + label() };
  }

  if (/^\/modelo\s+/i.test(t)) {
    const m = t.replace(/^\/modelo\s+/i, "").trim();
    if (!m) return { handled: true, text: "Informe o nome do modelo. Ex.: /modelo gemini-3.5-flash-lite ou /modelo llama3.2" };
    localStorage.setItem(K_MOD, m);
    return { handled: true, text: "Modelo alterado para: " + m };
  }

  if (/^\/ia(?:\s+|$)/i.test(t)) {
    const args = t.replace(/^\/ia\s*/i, "").trim();
    if (!args || /^status$/i.test(args)) {
      const c = getConfig();
      return {
        handled: true,
        text: "🤖 MOTOR DA BACH AI\n• Modo atual: " + label() +
          "\n• Provedor: " + c.provider +
          "\n• Modelo: " + c.model +
          "\n\nComandos para configurar:\n" +
          "• /ia offline — usa apenas o cérebro local sem IA externa\n" +
          "• /ia ollama llama3.2 — conecta no Ollama rodando no seu PC\n" +
          "• /ia gemini — usa a chave salva com /chave\n" +
          "• /ia openai URL CHAVE MODELO — conecta Groq, OpenRouter, LM Studio etc."
      };
    }

    const parts = args.split(/\s+/);
    const p = parts[0].toLowerCase();

    if (p === "offline") {
      localStorage.setItem(K_PROV, "offline");
      return { handled: true, text: "🔌 Motor ajustado para 100% local (offline). Suas chaves continuam salvas caso queira reativar." };
    }

    if (p === "ollama") {
      localStorage.setItem(K_PROV, "ollama");
      if (parts[1]) localStorage.setItem(K_MOD, parts[1]);
      if (parts[2]) localStorage.setItem(K_URL, parts[2]);
      else localStorage.removeItem(K_URL);
      return { handled: true, text: "🦙 Conectado ao Ollama local! Modelo: " + getConfig().model + "\n(Certifique-se de rodar o Ollama com OLLAMA_ORIGINS=* se abrir pelo navegador.)" };
    }

    if (p === "gemini") {
      localStorage.setItem(K_PROV, "gemini");
      if (parts[1]) localStorage.setItem(K_MOD, parts[1]);
      return { handled: true, text: hasModel() ? "✨ Motor Gemini ativado: " + getConfig().model : "Configure sua chave primeiro com: /chave SUA_CHAVE" };
    }

    if (p === "openai") {
      if (parts.length < 2) {
        return { handled: true, text: "Use: /ia openai URL CHAVE MODELO\nEx.: /ia openai https://api.groq.com/openai/v1/chat/completions gsk_xxx llama-3.3-70b-versatile" };
      }
      localStorage.setItem(K_PROV, "openai");
      localStorage.setItem(K_URL, parts[1]);
      if (parts[2] && parts[2] !== "-") localStorage.setItem(K_KEY, parts[2]);
      if (parts[3]) localStorage.setItem(K_MOD, parts[3]);
      return { handled: true, secret: true, text: "🔗 API compatível configurada! Motor: " + label() };
    }

    return { handled: true, text: "Opção não reconhecida. Use /ia status para ver os comandos." };
  }

  return null;
}

async function generate({ system, messages, image = null, temperature = 0.35, signal }) {
  const cfg = getConfig();
  if (!hasModel()) throw new Error("Nenhum modelo externo configurado.");

  if (cfg.provider === "gemini") {
    const contents = messages.map((m, idx) => {
      const parts = [{ text: m.content }];
      if (image && idx === messages.length - 1 && m.role === "user") {
        parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
      }
      return { role: m.role === "assistant" ? "model" : "user", parts };
    });

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(cfg.model) + ":generateContent",
      {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: 8192, temperature, topP: 0.9 }
        })
      }
    );

    const data = await r.json().catch(() => null);
    if (!r.ok) {
      const msg = data?.error?.message || ("Erro HTTP " + r.status);
      const err = new Error(msg);
      err.status = r.status;
      throw err;
    }

    const cand = data?.candidates?.[0];
    const text = (cand?.content?.parts || []).map(x => x.text || "").join("").trim();
    return { text, truncated: cand?.finishReason === "MAX_TOKENS" };
  }

  const endpoint = cfg.provider === "ollama"
    ? (cfg.url || "http://localhost:11434/v1/chat/completions")
    : cfg.url;

  const formatted = [
    { role: "system", content: system },
    ...messages.map((m, idx) => {
      if (image && idx === messages.length - 1 && m.role === "user") {
        return {
          role: "user",
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: "data:" + image.mimeType + ";base64," + image.base64 } }
          ]
        };
      }
      return { role: m.role === "assistant" ? "assistant" : "user", content: m.content };
    })
  ];

  const headers = { "Content-Type": "application/json" };
  if (cfg.key) headers.Authorization = "Bearer " + cfg.key;

  const r = await fetch(endpoint, {
    method: "POST",
    signal,
    headers,
    body: JSON.stringify({
      model: cfg.model,
      messages: formatted,
      temperature
    })
  });

  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = data?.error?.message || ("Erro HTTP " + r.status);
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }

  const choice = data?.choices?.[0];
  const text = String(choice?.message?.content || "").trim();
  return { text, truncated: choice?.finish_reason === "length" };
}

export const LLM = { getConfig, hasModel, label, command, generate };
