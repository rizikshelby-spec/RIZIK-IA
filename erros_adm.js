/* BACH AI 5.1 — Central de Erros ADM Blindada
 * Captura automaticamente respostas inválidas, não entendidas, comandos errados ou reclamações.
 * Segurança: mascara segredos/tokens antes de salvar ou enviar, exige HTTPS no envio remoto,
 * bloqueia endereços locais/privados (anti-SSRF) e limita rajadas de envio remoto.
 */

const K_ERROS = "bach_adm_erros_v1";
const K_REMOTE = "bach_adm_erro_remote_v1";
const MAX_ERROS = 250;
const BT = String.fromCharCode(96).repeat(3);

// Se quiser receber erros de OUTROS celulares no seu canal sem precisar configurar em cada aparelho,
// coloque sua URL HTTPS entre as aspas abaixo (ex.: "https://ntfy.sh/bach-erros-rizik"):
const DEFAULT_REMOTE = "";

let ultimoEnvioRemoto = 0;

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

function hostPrivadoOuLocal(hostname) {
  const h = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (!h || h === "localhost" || h === "::1" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^(?:127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h)) return true;
  const m172 = h.match(/^172\.(\d{1,3})\./);
  if (m172 && Number(m172[1]) >= 16 && Number(m172[1]) <= 31) return true;
  return false;
}

function urlRemotaSegura(url) {
  const s = String(url || "").trim();
  if (!s) return "";
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return "";
    if (hostPrivadoOuLocal(u.hostname)) return "";
    return u.href;
  } catch {
    return "";
  }
}

function ler() {
  try {
    const arr = JSON.parse(localStorage.getItem(K_ERROS) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function gravar(lista) {
  try {
    localStorage.setItem(K_ERROS, JSON.stringify(lista.slice(-MAX_ERROS)));
  } catch {}
}

function getRemote() {
  try {
    return urlRemotaSegura(localStorage.getItem(K_REMOTE) || DEFAULT_REMOTE);
  } catch {
    return urlRemotaSegura(DEFAULT_REMOTE);
  }
}

function setRemote(url) {
  try {
    if (!url) localStorage.removeItem(K_REMOTE);
    else {
      const segura = urlRemotaSegura(url);
      if (segura) localStorage.setItem(K_REMOTE, segura);
    }
  } catch {}
}

function enviarRemoto(item) {
  const url = getRemote();
  if (!url) return;
  const agora = Date.now();
  if (agora - ultimoEnvioRemoto < 3000) return;
  ultimoEnvioRemoto = agora;

  try {
    const corpo = ("[" + item.tipo + "] " + new Date(item.at).toLocaleString("pt-BR") +
      "\nUsuário: " + item.entrada +
      (item.resposta ? "\nBACH: " + item.resposta : "") +
      (item.motivo ? "\nMotivo: " + item.motivo : ""))
      .replace(new RegExp(BT, "g"), "'''")
      .replace(/@(everyone|here)/gi, "@ $1");

    if (/^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\//i.test(url)) {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "🚨 **Erro BACH AI**\n" + BT + "txt\n" + corpo.slice(0, 1800) + "\n" + BT })
      }).catch(() => {});
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Title": "Erro BACH AI (" + String(item.tipo).replace(/[\r\n]/g, "") + ")" },
        body: corpo.slice(0, 2000)
      }).catch(() => {});
    }
  } catch {}
}

function registrar({ tipo = "nao-entendeu", entrada = "", resposta = "", motivo = "" }) {
  const entBruta = String(entrada || "").trim();
  if (!entBruta) return null;
  if (/^\/(?:adm|admsenha|ghconfig|chave)\b/i.test(entBruta) || /@rizik2442/i.test(entBruta)) {
    return null;
  }

  const ent = redigirSegredos(entBruta).slice(0, 300);
  const resp = redigirSegredos(String(resposta || "").trim()).slice(0, 240);
  const mot = redigirSegredos(String(motivo || "").trim()).slice(0, 140);

  const lista = ler();
  const ultimo = lista[lista.length - 1];
  if (ultimo && ultimo.entrada === ent && ultimo.tipo === tipo && (Date.now() - ultimo.at) < 12000) {
    return ultimo;
  }

  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    at: Date.now(),
    tipo: String(tipo).slice(0, 40),
    entrada: ent,
    resposta: resp,
    motivo: mot
  };

  lista.push(item);
  gravar(lista);
  enviarRemoto(item);
  return item;
}

function listar(filtro = "") {
  const q = String(filtro || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const todos = ler().slice().reverse();
  if (!q) return todos;
  return todos.filter(e => {
    const txt = (e.tipo + " " + e.entrada + " " + e.resposta + " " + e.motivo)
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return txt.includes(q);
  });
}

function contar() {
  return ler().length;
}

function excluir(id) {
  const antes = ler();
  const depois = antes.filter(x => x.id !== id);
  gravar(depois);
  return antes.length - depois.length;
}

function excluirVarios(ids) {
  const set = new Set(ids || []);
  const antes = ler();
  const depois = antes.filter(x => !set.has(x.id));
  gravar(depois);
  return antes.length - depois.length;
}

function limparTudo() {
  try { localStorage.removeItem(K_ERROS); } catch {}
}

function formatarParaCopiar(lista = ler().slice().reverse()) {
  if (!lista.length) return "Nenhum erro registrado na Central ADM.";
  const linhas = [
    "=== CENTRAL DE ERROS BACH AI (" + lista.length + " registro(s)) ===",
    "Data: " + new Date().toLocaleString("pt-BR"),
    ""
  ];
  lista.forEach((e, i) => {
    linhas.push(
      "#" + (i + 1) + " [" + e.tipo + "] " + new Date(e.at).toLocaleString("pt-BR") +
      "\n   Usuário: " + e.entrada +
      (e.resposta ? "\n   BACH: " + e.resposta.replace(/\s+/g, " ") : "") +
      (e.motivo ? "\n   Motivo: " + e.motivo : "") +
      "\n"
    );
  });
  return linhas.join("\n");
}

function comando(raw, isAdm) {
  const t = String(raw || "").trim();
  const m = t.match(/^\/erroremoto(?:\s+([\s\S]+))?$/i);
  if (!m) return null;
  if (!isAdm) return null;

  const arg = (m[1] || "").trim();
  if (!arg) {
    const atual = getRemote();
    return "📡 **Envio Remoto de Erros do Público (ADM):**\n" +
      (atual ? "• Destino atual: `" + atual + "`\n" : "• Ainda não configurado (os erros ficam salvos localmente).\n") +
      "\nPara receber erros de **outros celulares** direto no seu canal gratuito:\n" +
      "1. Abra `https://ntfy.sh/seu-canal-secreto` no app ntfy (ou use Webhook do Discord).\n" +
      "2. Configure aqui com: `/erroremoto https://ntfy.sh/seu-canal-secreto`\n" +
      "3. Para desligar: `/erroremoto off`";
  }

  if (/^(off|desligar|limpar|sair)$/i.test(arg)) {
    setRemote("");
    return "🔌 Envio remoto de erros desligado. Os erros continuam sendo salvos localmente no Painel ADM.";
  }

  const segura = urlRemotaSegura(arg);
  if (!segura) {
    return "Envie uma URL **HTTPS** válida e pública (não pode ser `http://` nem endereço local). Ex.: `/erroremoto https://ntfy.sh/bach-erros-rizik`";
  }

  setRemote(segura);
  return "✅ Envio remoto ativado neste aparelho para: `" + segura + "`\n💡 Para funcionar também no celular de **outras pessoas**, cole essa URL no `DEFAULT_REMOTE` dentro de `erros_adm.js`!";
}

export const ErrosADM = {
  registrar,
  listar,
  contar,
  excluir,
  excluirVarios,
  limparTudo,
  formatarParaCopiar,
  comando,
  getRemote
};
