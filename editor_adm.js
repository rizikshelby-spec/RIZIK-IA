/* BACH AI 5.4 — EDITOR ADM BLINDADO, VALIDAÇÃO PRÉ-COMMIT, ROLLBACK & PACOTE .TXT
 * - Valida sintaxe estrutural JS/HTML e bloqueia segredos antes de enviar ao GitHub.
 * - Salva a versão anterior do arquivo para reversão rápida com /desfazer_edicao.
 * - Exporta todos os 42 módulos alinhados em .txt (/tudotxt) e lista /ajuda.
 */

const K_GH = "gh_adm_token_v1";
const K_GH_BACKUP = "gh_adm_last_backup_v1";
const BT = "\x60\x60\x60";
const RE_BLOCO = new RegExp("^\\x60\\x60\\x60[\\w+-]*\\r?\\n([\\s\\S]*?)\\x60\\x60\\x60$");
const RE_REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const RE_BRANCH = /^[A-Za-z0-9._\/-]+$/;
const EXT_PERMITIDAS = /\.(js|html|css|json|txt|md)$/i;
const MAX_ARQUIVO_CHARS = 500000;

export const MODULOS_SITE = [
  "index.html",
  "brain.js",
  "mente.js",
  "cerebro_avancado.js",
  "rede_neural.js",
  "nlu_neural.js",
  "autocorretor.js",
  "erros_adm.js",
  "voz.js",
  "revisor.js",
  "editor_adm.js",
  "saber.js",
  "fatos.js",
  "saberes.js",
  "saberes_pro.js",
  "conversa.js",
  "dicionario.js",
  "programacao.js",
  "conhecimento.js",
  "programacao_termux.js",
  "executor_sandbox.js",
  "arquivos.js",
  "historico.js",
  "base.js",
  "autoguard.js",
  "registry.js",
  "utilidades.js",
  "conversor_texto.js",
  "saude_bemestar.js",
  "estudos.js",
  "dev_ferramentas.js",
  "intelligence.js",
  "personality.js",
  "creativity.js",
  "planning.js",
  "security.js",
  "units.js",
  "finance.js",
  "science.js",
  "education.js",
  "automation.js",
  "llm.js"
];

let sessao = null;

function validarCfgGH(o) {
  if (!o || typeof o !== "object") return null;
  const repo = String(o.repo || "").trim();
  const token = String(o.token || "").trim();
  const branch = String(o.branch || "main").trim();
  if (!RE_REPO.test(repo) || repo.includes("..")) return null;
  if (!RE_BRANCH.test(branch) || branch.includes("..")) return null;
  if (token.length < 10 || /\s/.test(token)) return null;
  return { repo, token, branch, fixo: Boolean(o.fixo) };
}

function getGH() {
  try {
    const ss = JSON.parse(sessionStorage.getItem(K_GH) || "null");
    const validSS = validarCfgGH(ss);
    if (validSS) return validSS;
  } catch {}
  try {
    const ls = JSON.parse(localStorage.getItem(K_GH) || "null");
    return validarCfgGH(ls);
  } catch {
    return null;
  }
}

function setGH(repo, token, branch = "main", fixo = false) {
  const payload = JSON.stringify({ repo, token, branch, fixo: Boolean(fixo) });
  try { sessionStorage.setItem(K_GH, payload); } catch {}
  if (fixo) {
    try { localStorage.setItem(K_GH, payload); } catch {}
  } else {
    try { localStorage.removeItem(K_GH); } catch {}
  }
}

function clearGH() {
  try { sessionStorage.removeItem(K_GH); } catch {}
  try { localStorage.removeItem(K_GH); } catch {}
}

function resetar() {
  sessao = null;
}

function sanitizarCaminhoRepo(path) {
  const p = String(path || "").replace(/\\/g, "/").replace(/^\/+/, "").trim();
  if (!p || p.length > 140 || p.includes("..") || p.includes("?") || p.includes("#") || /[\x00-\x1f]/.test(p)) {
    return null;
  }
  const segs = p.split("/").filter(Boolean);
  if (!segs.length || segs.some(s => s === "." || s === ".." || s.startsWith(".git"))) {
    return null;
  }
  const limpo = segs.join("/");
  if (!EXT_PERMITIDAS.test(limpo)) return null;
  return limpo;
}

/* ---------- Validação Léxica JS/JSON/HTML antes de publicar ---------- */

function validarChavesJS(src) {
  const pilha = [];
  const par = { "{": "}", "(": ")", "[": "]" };
  const fechaParaAbre = { "}": "{", ")": "(", "]": "[" };
  let estado = "normal"; // normal | sq | dq | tpl | line | block | regex | regex_class
  let linha = 1;
  let prevTokenChar = "";

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const nxt = src[i + 1] || "";
    if (c === "\n") linha++;

    if (estado === "line") {
      if (c === "\n") estado = "normal";
      continue;
    }
    if (estado === "block") {
      if (c === "*" && nxt === "/") { estado = "normal"; i++; }
      continue;
    }
    if (estado === "sq" || estado === "dq") {
      if (c === "\\") { i++; continue; }
      if ((estado === "sq" && c === "'") || (estado === "dq" && c === '"')) estado = "normal";
      else if (c === "\n") return "String aberta sem fechamento na linha " + linha + ".";
      continue;
    }
    if (estado === "tpl") {
      if (c === "\\") { i++; continue; }
      if (c === "`") estado = "normal";
      continue;
    }
    if (estado === "regex" || estado === "regex_class") {
      if (c === "\\") { i++; continue; }
      if (estado === "regex_class") {
        if (c === "]") estado = "regex";
      } else {
        if (c === "[") estado = "regex_class";
        else if (c === "/") estado = "normal";
        else if (c === "\n") estado = "normal";
      }
      continue;
    }

    if (c === "/" && nxt === "/") { estado = "line"; i++; continue; }
    if (c === "/" && nxt === "*") { estado = "block"; i++; continue; }
    if (c === "'") { estado = "sq"; continue; }
    if (c === '"') { estado = "dq"; continue; }
    if (c === "`") { estado = "tpl"; continue; }

    if (c === "/") {
      const podeRegex = !prevTokenChar || /[=({[,;:!&|?+\-*~^%<>]/.test(prevTokenChar);
      if (podeRegex) { estado = "regex"; continue; }
    }

    if (par[c]) {
      pilha.push({ ch: c, linha });
    } else if (fechaParaAbre[c]) {
      const topo = pilha.pop();
      if (!topo || topo.ch !== fechaParaAbre[c]) {
        return "Símbolo `" + c + "` inesperado ou sem abertura na linha " + linha + ".";
      }
    }

    if (!/\s/.test(c)) prevTokenChar = c;
  }

  if (estado === "sq" || estado === "dq" || estado === "tpl") {
    return "Existe uma string ou template literal (`) aberta e não fechada no arquivo.";
  }
  if (pilha.length) {
    const ult = pilha[pilha.length - 1];
    return "Bloco `" + ult.ch + "` aberto na linha " + ult.linha + " não foi fechado.";
  }
  return null;
}

function validarCodigoAntesDePublicar(arquivo, codigo) {
  const src = String(codigo || "");
  if (/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{12,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{18,}|AIza[0-9A-Za-z\-_]{20,}\b/.test(src)) {
    return "Detectei uma possível chave ou token secreto dentro do código! Remova antes de publicar.";
  }

  if (/\.json$/i.test(arquivo)) {
    try { JSON.parse(src); }
    catch (e) { return "JSON inválido: " + (e?.message || "erro de sintaxe"); }
    return null;
  }

  if (/\.js$/i.test(arquivo)) {
    return validarChavesJS(src);
  }

  if (/\.html?$/i.test(arquivo)) {
    if (!/<html/i.test(src) || !/<\/html>/i.test(src)) {
      return "HTML incompleto: falta tag `<html>` ou `</html>`.";
    }
    const abres = (src.match(/<script\b/gi) || []).length;
    const fechas = (src.match(/<\/script>/gi) || []).length;
    if (abres !== fechas) {
      return "Tags `<script>` desbalanceadas (" + abres + " abrem, " + fechas + " fecham).";
    }
  }

  return null;
}

const ativo = isAdm => Boolean(isAdm && sessao);
const paraTxt = nome => String(nome || "").replace(/\.(js|html)$/i, "") + ".txt";
const pad = (v, n) => String(v).padEnd(n);

async function gerarPacoteTxt(passo = () => {}) {
  const indice = [];
  const blocos = [];
  let lidos = 0;

  for (let i = 0; i < MODULOS_SITE.length; i++) {
    const arq = MODULOS_SITE[i];
    const arqTxt = paraTxt(arq);
    passo("📦 Lendo (" + (i + 1) + "/" + MODULOS_SITE.length + "): " + arq + " → " + arqTxt);

    let codigo = null;
    try {
      const r = await fetch("./" + arq + "?v=" + Date.now());
      if (r.ok) codigo = await r.text();
    } catch {}

    if (codigo === null && arq === "index.html") {
      codigo = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    }

    const ok = codigo !== null;
    if (ok) lidos++;
    const linhas = ok ? codigo.split("\n").length : 0;
    const kb = ok ? +(new Blob([codigo]).size / 1024).toFixed(1) + " KB" : "FALHOU";

    indice.push(
      pad((i + 1) + ".", 4) +
      pad(arq, 26) + " -> " +
      pad(arqTxt, 26) +
      pad(ok ? linhas + " linhas" : "NÃO LIDO", 14) +
      kb
    );

    if (ok) {
      blocos.push(
        "--- START OF FILE " + arqTxt + " ---\n\n" +
        codigo.trimEnd() + "\n\n" +
        "--- END OF FILE " + arqTxt + " ---"
      );
    } else {
      blocos.push(
        "--- START OF FILE " + arqTxt + " ---\n" +
        "[AVISO: " + arq + " não encontrado neste endereço]\n" +
        "--- END OF FILE " + arqTxt + " ---"
      );
    }
  }

  const header =
    "====================================================================================\n" +
    "BACH AI 5.4 — TODOS OS MÓDULOS E CÓDIGOS ALINHADOS EM .TXT (MODO ADM)\n" +
    "Gerado em: " + new Date().toLocaleString("pt-BR") + "\n" +
    "Módulos lidos: " + lidos + " de " + MODULOS_SITE.length + "\n" +
    "====================================================================================\n\n" +
    pad("N°", 4) + pad("MÓDULO ORIGINAL", 26) + "    " + pad("ARQUIVO FINAL .TXT", 26) + pad("LINHAS", 14) + "KB\n" +
    "-".repeat(90) + "\n" +
    indice.join("\n") + "\n" +
    "-".repeat(90) + "\n\n";

  const conteudo = header + blocos.join("\n\n");
  const kbTotal = +(new Blob([conteudo]).size / 1024).toFixed(1);
  const dataStr = new Date().toISOString().slice(0, 10);

  return {
    nome: "bach-todos-modulos-" + dataStr + ".txt",
    conteudo,
    indice: indice.join("\n"),
    lidos,
    total: MODULOS_SITE.length,
    kb: kbTotal
  };
}

function menuLista() {
  const gh = getGH();
  return "🛠️ **EDITOR DE MÓDULOS (MODO ADM)**\n" +
    (gh ? "🟢 GitHub conectado: `" + gh.repo + "` (branch `" + gh.branch + "`" + (gh.fixo ? " • salvo fixo" : " • sessão") + ")\n\n" : "🟡 GitHub ainda não conectado (use `/ghconfig usuario/repo TOKEN` para publicar automático; sem isso, gero o arquivo pronto para baixar).\n\n") +
    "Escolha o número do arquivo que quer trocar ou `0` para criar um novo:\n\n" +
    "**0.** ➕ Criar um novo módulo/arquivo\n" +
    MODULOS_SITE.map((m, i) => "**" + (i + 1) + ".** `" + m + "`").join("\n") +
    "\n\nDigite o **número** (ou `/cancelar` para sair).";
}

function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(String(str));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64Utf8(b64) {
  const bin = atob(String(b64).replace(/\s+/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function publicarGitHub(path, conteudo, mensagem = "Atualização via BACH AI ADM", salvarBackup = true) {
  const cfg = getGH();
  if (!cfg) return { ok: false, motivo: "sem-config" };

  const cleanPath = sanitizarCaminhoRepo(path);
  if (!cleanPath) return { ok: false, motivo: "caminho-invalido" };
  if (String(conteudo || "").length > MAX_ARQUIVO_CHARS) {
    return { ok: false, motivo: "arquivo-muito-grande" };
  }

  const encodedPath = cleanPath.split("/").map(encodeURIComponent).join("/");
  const url = "https://api.github.com/repos/" + cfg.repo + "/contents/" + encodedPath;
  const headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": "Bearer " + cfg.token,
    "Content-Type": "application/json"
  };

  let sha = null;
  try {
    const g = await fetch(url + "?ref=" + encodeURIComponent(cfg.branch), { headers });
    if (g.ok) {
      const info = await g.json();
      sha = info.sha || null;
      if (salvarBackup && info.content) {
        try {
          const antigo = fromBase64Utf8(info.content);
          sessionStorage.setItem(K_GH_BACKUP, JSON.stringify({
            repo: cfg.repo,
            branch: cfg.branch,
            path: cleanPath,
            content: antigo,
            at: Date.now()
          }));
        } catch {}
      }
    }
  } catch {}

  const body = {
    message: String(mensagem || "Atualização via BACH AI ADM").slice(0, 120),
    content: toBase64Utf8(conteudo),
    branch: cfg.branch
  };
  if (sha) body.sha = sha;

  const r = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body)
  });
  const res = await r.json().catch(() => null);
  if (!r.ok) {
    return { ok: false, motivo: res?.message || ("HTTP " + r.status) };
  }
  return { ok: true, repo: cfg.repo, branch: cfg.branch, path: cleanPath };
}

function comandoConfig(raw, isAdm) {
  const t = String(raw || "").trim();

  if (/^\/ghsair\b/i.test(t)) {
    if (!isAdm) return { handled: true, texto: "🔒 Comando exclusivo de administrador." };
    clearGH();
    return { handled: true, texto: "🔌 Conexão com o GitHub removida deste aparelho." };
  }

  const m = t.match(/^\/ghconfig(?:\s+(\S+)\s+(\S+)(?:\s+(\S+))?(?:\s+(fixo))?)?$/i);
  if (m) {
    if (!isAdm) return { handled: true, secret: Boolean(m[2]), texto: "🔒 Comando exclusivo de administrador." };
    if (!m[1] || !m[2]) {
      const atual = getGH();
      return {
        handled: true,
        texto: "⚙️ **Configurar publicação direta no GitHub (ADM):**\n" +
          (atual ? "• Atual: `" + atual.repo + "` (branch `" + atual.branch + "`" + (atual.fixo ? ", salvo fixo" : ", só nesta sessão") + ")\n" : "• Ainda não configurado.\n") +
          "Use: `/ghconfig usuario/repositorio SEU_TOKEN`\n" +
          "*(Opcional: passe outra branch antes de publicar em produção: `/ghconfig usuario/repo TOKEN teste`.)*\n" +
          "Para remover: `/ghsair`"
      };
    }
    const repo = m[1].trim(), token = m[2].trim(), branch = (m[3] || "main").trim(), fixo = Boolean(m[4]);
    if (!RE_REPO.test(repo) || repo.includes("..") || !RE_BRANCH.test(branch) || branch.includes("..") || token.length < 10) {
      return { handled: true, secret: true, texto: "Confira o formato: `/ghconfig usuario/repositorio SEU_TOKEN`" };
    }
    setGH(repo, token, branch, fixo);
    return {
      handled: true,
      secret: true,
      texto: "✅ GitHub conectado (`" + repo + "` • branch `" + branch + "` • " + (fixo ? "salvo fixo" : "sessão segura") + ")!\nAgora quando usar `/editar`, eu valido a sintaxe e salvo backup para `/desfazer_edicao`."
    };
  }
  return null;
}

function ehPedidoTudoTxt(raw) {
  const s = String(raw || "").trim();
  if (s.length > 90 || /<\/?[a-z]+>|\bfunction\b|\bconst\b|\n/i.test(s)) return false;
  const t = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^\/(tudotxt|pacotetotxt|pacotetxts?|modulos?txt|codigostxt)\b/.test(t) ||
    (/\b(todos|tudo)\b/.test(t) && /\b(modulos?|codigos?|arquivos?)\b/.test(t) && /\btxt\b/.test(t));
}

async function processar(raw, isAdm, passo = () => {}) {
  const t = String(raw || "").trim();

  if (/^\/desfazer_edicao\b/i.test(t)) {
    if (!isAdm) return { texto: "🔒 Comando exclusivo de administrador." };
    let bkp = null;
    try { bkp = JSON.parse(sessionStorage.getItem(K_GH_BACKUP) || "null"); } catch {}
    if (!bkp || !bkp.path || !bkp.content) {
      return { texto: "ℹ️ Não há nenhuma edição recente na sessão para desfazer." };
    }
    passo("♻️ Revertendo `" + bkp.path + "` no GitHub...");
    const res = await publicarGitHub(bkp.path, bkp.content, "Reverte " + bkp.path + " via BACH AI ADM", false);
    if (!res.ok) return { texto: "⚠️ Não foi possível reverter no GitHub (" + res.motivo + ")." };
    try { sessionStorage.removeItem(K_GH_BACKUP); } catch {}
    return {
      texto: "♻️ **Edição desfeita no GitHub!**\n• Arquivo restaurado: `" + res.path + "` (branch `" + res.branch + "`)\n⏳ Aguarde ~1 minuto para atualizar."
    };
  }

  if (ehPedidoTudoTxt(t)) {
    if (!isAdm) return { texto: "🔒 O comando `/tudotxt` é exclusivo do modo administrador." };
    const pac = await gerarPacoteTxt(passo);
    return {
      texto: "📦 **PACOTE COMPLETO EM `.TXT` PRONTO (" + pac.lidos + "/" + pac.total + " módulos • " + pac.kb + " KB)!**\n\n" +
        "Todos os nomes terminam em **`.txt`** e estão alinhados com `--- START OF FILE nome.txt ---`.\n\n" +
        BT + "txt\n" + pac.indice + "\n" + BT + "\n\n" +
        "👇 Toque em **📋 Copiar** ou **⬇️ Baixar** no cartão abaixo para pegar tudo de uma vez!",
      arquivo: pac.nome,
      codigo: pac.conteudo
    };
  }

  if (/^\/(editar|trocareditor|editarmodulo)\b/i.test(t)) {
    if (!isAdm) return { texto: "🔒 O comando `/editar` é exclusivo do modo administrador." };
    sessao = { passo: "escolher", modulo: "", arquivo: "" };
    return { texto: menuLista() };
  }

  if (!sessao || !isAdm) return null;

  if (/^\/?(cancelar|sair)$/i.test(t)) {
    resetar();
    return { texto: "❌ Edição de módulos cancelada." };
  }

  if (sessao.passo === "escolher") {
    if (t === "0") {
      sessao.passo = "nome_modulo";
      return { texto: "🆕 **Criar novo módulo:**\nQual será o **nome do módulo**? (Ex.: `Agenda`)" };
    }
    const num = parseInt(t, 10);
    let arq = (!isNaN(num) && num >= 1 && num <= MODULOS_SITE.length) ? MODULOS_SITE[num - 1] : null;
    if (!arq) {
      arq = MODULOS_SITE.find(m => m.toLowerCase() === t.toLowerCase()) || null;
    }
    if (!arq) {
      return { texto: "Escolha um número de **0** a **" + MODULOS_SITE.length + "** (ou `/cancelar`)." };
    }
    sessao.arquivo = arq;
    sessao.modulo = arq;
    sessao.passo = "codigo";
    return {
      texto: "✏️ Selecionado: **`" + arq + "`**.\n\nAgora cole aqui no chat o **código 100% inteiro** desse arquivo (ou `/cancelar` para desistir)."
    };
  }

  if (sessao.passo === "nome_modulo") {
    const nomeMod = t.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().slice(0, 40);
    if (nomeMod.length < 2) return { texto: "Digite um nome válido para o módulo (ex.: `Agenda`)." };
    sessao.modulo = nomeMod;
    sessao.passo = "nome_arquivo";
    return {
      texto: "📄 Módulo **" + nomeMod + "** anotado!\nAgora digite o **nome do arquivo** (extensões aceitas: `.js`, `.html`, `.css`, `.json`, `.txt`, `.md`; ex.: `agenda.js`):"
    };
  }

  if (sessao.passo === "nome_arquivo") {
    let arq = t.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._\/-]/g, "");
    if (!/\.[a-z0-9]+$/i.test(arq)) arq += ".js";
    const limpo = sanitizarCaminhoRepo(arq);
    if (!limpo || limpo.length < 4) {
      return { texto: "Nome de arquivo inválido ou extensão não permitida. Use `.js`, `.html`, `.css`, `.json`, `.txt` ou `.md` sem `..`." };
    }
    sessao.arquivo = limpo;
    sessao.passo = "codigo";
    return {
      texto: "📁 Arquivo definido: **`" + limpo + "`** (módulo **" + sessao.modulo + "**).\n\nAgora cole o **código 100% inteiro** desse arquivo aqui no chat!"
    };
  }

  if (sessao.passo === "codigo") {
    if (t.length < 15) return { texto: "Esse código parece curto demais. Cole o arquivo completo (ou `/cancelar`)." };
    let codigoLimpo = t;
    const bloco = t.match(RE_BLOCO);
    if (bloco) codigoLimpo = bloco[1];
    if (codigoLimpo.length > MAX_ARQUIVO_CHARS) {
      return { texto: "⚠️ O código passou do limite de 500 KB por arquivo." };
    }

    const erroSintaxe = validarCodigoAntesDePublicar(sessao.arquivo, codigoLimpo);
    if (erroSintaxe) {
      return {
        texto: "🛑 **Publicação bloqueada na pré-checagem de segurança/sintaxe (`" + sessao.arquivo + "`):**\n• " +
          erroSintaxe + "\n\nCorrija o código e cole novamente (ou digite `/cancelar`)."
      };
    }

    const arquivoAlvo = sessao.arquivo;
    const moduloAlvo = sessao.modulo;
    resetar();

    const gh = getGH();
    if (gh) {
      passo("🚀 Validado! Publicando `" + arquivoAlvo + "` no GitHub...");
      const res = await publicarGitHub(arquivoAlvo, codigoLimpo, "Atualiza " + arquivoAlvo + " (" + moduloAlvo + ") via BACH AI", true);
      if (res.ok) {
        return {
          texto: "✅ **Publicado direto no GitHub (sintaxe verificada)!**\n• Repositório: `" + res.repo + "` (branch `" + res.branch + "`)\n• Arquivo: `" + res.path + "`\n• Tamanho: " + codigoLimpo.length + " caracteres\n\n♻️ Se precisar voltar atrás: `/desfazer_edicao`.\n⏳ Aguarde ~1 minuto para o GitHub Pages publicar e recarregue a página.",
          arquivo: arquivoAlvo,
          codigo: codigoLimpo
        };
      }
      return {
        texto: "⚠️ Não consegui enviar direto para o GitHub (" + res.motivo + ").\nGerei o arquivo validado abaixo para você baixar ou copiar manualmente!",
        arquivo: arquivoAlvo,
        codigo: codigoLimpo
      };
    }

    return {
      texto: "📦 Código de **`" + arquivoAlvo + "`** validado (" + codigoLimpo.split("\n").length + " linhas)!\n\n" +
        "💡 Para publicar **direto no GitHub sem sair do chat**, configure uma vez com:\n`/ghconfig usuario/repositorio SEU_TOKEN`\n\nPor enquanto, você pode baixar ou copiar no cartão abaixo:",
      arquivo: arquivoAlvo,
      codigo: codigoLimpo
    };
  }

  return null;
}

function ajudaComandos(isAdm) {
  let out = "⌨️ **TODOS OS COMANDOS COM `/` DA BACH AI**\n\n" +
    "🧬 **Rede Neural & Motor Próprio:**\n" +
    "• `/neural status` • `/neural testar frase` • `/neural treinar`\n" +
    "• `/neural ensinar frase => intencao` • `/neural exportar`\n" +
    "• `/ia status` • `/ia rapido` • `/ia normal` • `/ia profundo`\n\n" +
    "🛠️ **Apps, Scripts & Termux:**\n" +
    "• `/app pomodoro` (ou `notas`, `gastos`, `cobrinha`, ou qualquer tema) — cria app completo + preview!\n" +
    "• `/executar console.log(2+2)` — executa script JS em sandbox seguro\n" +
    "• `/preview <h1>Oi</h1>` — abre app HTML/CSS/JS ao vivo no chat\n" +
    "• `/cadeia 10+5 ; converter 10 km para m` — executa passos em sequência\n" +
    "• `/termux` — guia completo de Termux e scripts `.sh`\n\n" +
    "📚 **Arquivos, IndexedDB & RAG Local:**\n" +
    "• `/arquivos` • `/abrir nome` • `/buscar palavra` • `/rag pergunta`\n" +
    "• `/apagar nome` (ou `/excluir nome`) • `/pasta Nome` • `/pastas` • `/mover arquivo para Pasta`\n\n" +
    "🔢 **Cálculos, Física, Finanças & Unidades:**\n" +
    "• `/calc (2+3)*4` • `/converter 10 km para m`\n" +
    "• `/juros simples 1000 2 12` • `/fisica velocidade 100 2`\n\n" +
    "🧰 **Utilidades & Segurança:**\n" +
    "• `/senha 16` • `/dado 20` • `/moeda` • `/sortear A, B, C`\n" +
    "• `/cpf 000.000.000-00` • `/contar texto` • `/golpe mensagem`\n\n" +
    "🔤 **Conversor de Texto & Links:**\n" +
    "• `/linkzap 11999999999 oi` • `/slug titulo` • `/base64 texto` • `/debase64 codigo`\n" +
    "• `/maiusculo texto` • `/minusculo texto` • `/semacento texto` • `/inverter texto`\n\n" +
    "🩺 **Saúde & Bem-Estar (Educacional):**\n" +
    "• `/imc 70 1.75` • `/agua 70` • `/calorias 70 1.75 25 m leve` • `/respiracao` • `/pausa`\n\n" +
    "🎓 **Estudos Avançados & Quiz:**\n" +
    "• `/flashcard [materia]` • `/virar` • `/simulado [materia]` • `/alt A` • `/tecnica` • `/quiz` • `/resposta A`\n\n" +
    "💻 **Ferramentas Dev Web, Revisão & Voz:**\n" +
    "• `/cor #8266ff` • `/vidro` • `/meta Titulo | Descricao` • `/paleta oceano`\n" +
    "• `/revisar texto` • `/silabas palavra` • `/site https://...`\n" +
    "• `/voz normal` (`rapida`, `lenta`, `teste`)\n\n" +
    "🎨 **Piadas, Criatividade & Chat:**\n" +
    "• `/humor` • `/ideia tema` • `/historia tema` • `/personagem tema` • `/plano objetivo` • `/automacao tarefa`\n" +
    "• `/palavra giria = significado` • `/palavras` • `/profundo assunto`\n" +
    "• `/historico` • `/nova` • `/clear` • `/copiar` • `/auditar` • `/exportar`";

  if (isAdm) {
    out += "\n\n👑 **COMANDOS DE ADMINISTRADOR:**\n" +
      "• **Menu ☰ → 🚨 Erros do Público** — ver, buscar, selecionar, excluir ou copiar todos os erros\n" +
      "• `/admsenha SENHA` e `/adm SENHA` — senha ADM com hash SHA-256 (`sai do adm` para sair)\n" +
      "• `/nuvem status` • `/nuvem https://seu-worker.workers.dev` — nuvem gratuita Cloudflare D1\n" +
      "• `/erroremoto https://ntfy.sh/canal` — receber erros de outros aparelhos\n" +
      "• `/tudotxt` — gera todos os 42 módulos alinhados em `.txt`\n" +
      "• `/editar` e `/desfazer_edicao` — editar módulos com validação prévia e reversão no GitHub\n" +
      "• `/ghconfig usuario/repo TOKEN [branch]` • `/ghsair`\n" +
      "• `/basedados` • `/importarbase` • `/diagnostico` • `/rollback`\n" +
      "• `/modulos` • `/modulo ID on|off`";
  }

  return out;
}

export const EditorADM = {
  MODULOS_SITE,
  ativo,
  resetar,
  ehPedidoTudoTxt,
  gerarPacoteTxt,
  comandoConfig,
  processar,
  ajudaComandos
};
