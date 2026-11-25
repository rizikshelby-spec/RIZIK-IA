/* BACH AI 5.1 — NLU NEURAL & AUTO-APRENDIZADO CONTÍNUO BLINDADO
 * Liga a RedeNeural às decisões da BACH AI, aprende automaticamente por reformulação
 * e sincroniza eventos de melhoria com o Cloudflare Worker + Banco D1 gratuito.
 * Segurança: HTTPS obrigatório, anti-SSRF (bloqueia IPs locais/privados),
 * mascaramento de tokens/senhas e limite de taxa no envio à nuvem.
 */

import { RedeNeural, INTENCOES } from "./rede_neural.js?v=2";
import { RizikBrain } from "./brain.js?v=20";

const K_CLOUD = "bach_cloud_url_v1";

// Depois que criar seu Worker gratuito na Cloudflare, cole a URL HTTPS abaixo para todos os usuários enviarem aprendizados:
const DEFAULT_CLOUD_URL = "";

let ultimaFalha = null;
let ultimoEnvioNuvem = 0;

function hostPrivadoOuLocal(hostname) {
  const h = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (!h || h === "localhost" || h === "::1" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^(?:127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h)) return true;
  const m172 = h.match(/^172\.(\d{1,3})\./);
  if (m172 && Number(m172[1]) >= 16 && Number(m172[1]) <= 31) return true;
  return false;
}

function urlNuvemSegura(url) {
  const s = String(url || "").trim().replace(/\/+$/, "");
  if (!s) return "";
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return "";
    if (hostPrivadoOuLocal(u.hostname)) return "";
    return u.origin + u.pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function redigirSegredos(texto) {
  let s = String(texto || "");
  s = s.replace(/(\/(?:adm|admsenha|ghconfig|chave)\b)[^\n]*/gi, "$1 [OCULTO]");
  s = s.replace(/@rizik2442/gi, "[ADM]");
  s = s.replace(/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{12,}\b/g, "[TOKEN_GH]");
  s = s.replace(/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "[TOKEN_GH]");
  s = s.replace(/\b(?:sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z\-_]{20,})\b/g, "[CHAVE_API]");
  s = s.replace(/\bBearer\s+[A-Za-z0-9._\-]{12,}/gi, "Bearer [OCULTO]");
  return s;
}

function ehEntradaSensivel(texto) {
  const s = String(texto || "").trim();
  return /^\/(?:adm|admsenha|ghconfig|chave)\b/i.test(s) || /@rizik2442/i.test(s);
}

function getCloudUrl() {
  try {
    return urlNuvemSegura(localStorage.getItem(K_CLOUD) || DEFAULT_CLOUD_URL);
  } catch {
    return urlNuvemSegura(DEFAULT_CLOUD_URL);
  }
}

function setCloudUrl(url) {
  try {
    if (!url) localStorage.removeItem(K_CLOUD);
    else {
      const segura = urlNuvemSegura(url);
      if (segura) localStorage.setItem(K_CLOUD, segura);
    }
  } catch {}
}

function enviarParaNuvem({ tipo = "evento", entrada = "", intencao = "", motivo = "" }) {
  const base = getCloudUrl();
  if (!base) return;
  if (ehEntradaSensivel(entrada)) return;

  const agora = Date.now();
  if (agora - ultimoEnvioNuvem < 2000) return;
  ultimoEnvioNuvem = agora;

  try {
    fetch(base + "/evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: String(tipo).slice(0, 40),
        entrada: redigirSegredos(entrada).slice(0, 300),
        intencao: String(intencao).slice(0, 40),
        motivo: redigirSegredos(motivo).slice(0, 140),
        at: agora
      })
    }).catch(() => {});
  } catch {}
}

function marcarFalha(texto) {
  const s = String(texto || "").trim();
  if (!s || s.length < 2 || ehEntradaSensivel(s)) return;
  ultimaFalha = { texto: s, at: Date.now() };
  enviarParaNuvem({ tipo: "falha", entrada: s, motivo: "nao-entendeu" });
}

function registrarSucessoAposFalha(textoAtual, intencaoCerta) {
  if (!ultimaFalha) return false;
  if ((Date.now() - ultimaFalha.at) > 3 * 60 * 1000) {
    ultimaFalha = null;
    return false;
  }
  const falhaTxt = ultimaFalha.texto;
  ultimaFalha = null;

  if (!intencaoCerta || !INTENCOES.includes(intencaoCerta)) return false;
  if (ehEntradaSensivel(falhaTxt) || ehEntradaSensivel(textoAtual)) return false;
  if (falhaTxt.toLowerCase() === String(textoAtual || "").trim().toLowerCase()) return false;

  // Aprende sozinha na Rede Neural que a frase anterior que falhou tem essa intenção!
  RedeNeural.reinforce(falhaTxt, intencaoCerta);
  enviarParaNuvem({
    tipo: "aprendido",
    entrada: falhaTxt,
    intencao: intencaoCerta,
    motivo: "reformulado para: " + String(textoAtual).slice(0, 80)
  });
  return true;
}

function decidir(texto, ctx = {}) {
  const raw = String(texto || "").trim();
  if (!raw || raw.startsWith("/")) return null;

  const pred = RedeNeural.predict(raw);
  const conf = pred.confidence;
  const intent = pred.intent;
  const nome = ctx.nome ? ", " + ctx.nome : "";
  const serio = ctx.mood === "frustrado" || ctx.mood === "serio" || ctx.mood === "triste";

  if (conf < 0.54) return null;

  switch (intent) {
    case "saudacao":
      return {
        intent,
        confidence: conf,
        texto: serio
          ? "Olá" + nome + ". Em que posso ajudar agora?"
          : "Olá" + nome + "! Como posso te ajudar hoje?"
      };

    case "habilidades":
      return {
        intent,
        confidence: conf,
        texto: "Eu entendo e faço: **programação e Termux** (`/termux`), **criação de apps** (`/app`), **cálculos e conversões**, **revisão de português e sílabas** (`/revisar`, `/silabas`), **avaliação de sites** (`/site`), **tradução**, **recomendações** e **pesquisa na web**! Digite `/ajuda` para ver tudo."
      };

    case "pesquisa":
      if (raw.split(/\s+/).length >= 2) {
        return { intent, confidence: conf, pesquisar: raw };
      }
      return null;

    case "criar_app":
      return {
        intent,
        confidence: conf,
        criarApp: raw
      };

    case "termux_dev":
      return {
        intent,
        confidence: conf,
        texto: "💻 Sobre **Termux / Programação**: digite `/termux` para ver o guia completo, `/executar codigo` para rodar JavaScript ou me pergunte sua dúvida direta (ex.: `o que é função em JS?`)."
      };

    case "reclamacao":
      return {
        intent,
        confidence: conf,
        texto: "Entendi que algo não saiu como você queria" + nome + ". Me diga em uma frase direta o que você esperava que eu respondesse — eu ajusto o foco e aprendo com isso."
      };

    case "humor_jogo":
      return {
        intent,
        confidence: conf,
        texto: "🎮 Quer jogar **forca**, **velha**, **adivinhe** ou **quiz**? É só mandar o nome do jogo (ou `piada` para uma piada interativa!)."
      };

    case "utilidades":
      return {
        intent,
        confidence: conf,
        texto: "🧰 Ferramentas rápidas disponíveis:\n• `/senha 16` • `/cpf` • `/dado 20` • `/moeda` • `/sortear A, B`\n• `/calc conta` • `/converter 10 km para m` • ou pergunte `clima em Cidade`"
      };

    case "traducao_texto":
      return {
        intent,
        confidence: conf,
        texto: "🌍 Para traduzir ou revisar: use `como se diz X em inglês`, `o que significa palavra`, `/revisar seu texto` ou `/silabas palavra`."
      };

    case "recomendacao":
      return {
        intent,
        confidence: conf,
        texto: "🎬🎵 Posso recomendar **filmes** (ação, drama, terror, comédia...), **séries**, **animes** ou **músicas** (sertanejo, MPB, rock, rap, pagode). Qual estilo você quer?"
      };

    case "memoria_eu":
      return {
        intent,
        confidence: conf,
        texto: RizikBrain.think("o que voce lembra de mim")?.text || "Ainda estou guardando nossas informações — me conte seu nome ou o que você gosta!"
      };

    case "conversa_geral":
      if (conf >= 0.65) {
        return {
          intent,
          confidence: conf,
          texto: serio
            ? "Certo. Pode mandar a próxima pergunta ou comando que estou acompanhando."
            : "Estou acompanhando! Pode mandar a próxima pergunta, assunto ou comando."
        };
      }
      return null;

    default:
      return null;
  }
}

function comando(raw, isAdm) {
  const s = String(raw || "").trim();
  const m = s.match(/^\/nuvem(?:\s+([\s\S]+))?$/i);
  if (!m) return null;

  const arg = (m[1] || "").trim();
  if (!arg || /^status$/i.test(arg)) {
    const u = getCloudUrl();
    return "☁️ **NUVEM DE APRENDIZADO BACH AI (Cloudflare D1):**\n" +
      (u ? "• Status: 🟢 Conectada (`" + u + "`)\n" : "• Status: ⚪ Ainda não configurada neste aparelho.\n") +
      "\nPara ativar (no modo ADM): `/nuvem https://seu-worker.workers.dev`";
  }

  if (!isAdm) return "🔒 Apenas o administrador pode configurar a URL da nuvem.";

  if (/^(off|desligar)$/i.test(arg)) {
    setCloudUrl("");
    return "🔌 Conexão com a nuvem desligada neste aparelho.";
  }

  const segura = urlNuvemSegura(arg);
  if (!segura) {
    return "Envie uma URL **HTTPS** válida e pública (não pode ser `http://` nem endereço local). Ex.: `/nuvem https://bach-nuvem.seuuser.workers.dev`";
  }

  setCloudUrl(segura);
  return "✅ Nuvem conectada (`" + getCloudUrl() + "`)! Para funcionar no celular de todos os visitantes, cole essa mesma URL em `DEFAULT_CLOUD_URL` dentro de `nlu_neural.js`.";
}

export const NLUNeural = {
  decidir,
  marcarFalha,
  registrarSucessoAposFalha,
  enviarParaNuvem,
  comando,
  getCloudUrl
};
