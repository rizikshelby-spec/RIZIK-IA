/* BACH AI 4.7 — EDITOR ADM, PACOTE .TXT (/tudotxt) & CENTRAL /ajuda
   Permite trocar/criar módulos direto pelo chat, exportar todos os 35 módulos
   alinhados com extensão .txt no final (/tudotxt) e listar todos os comandos (/ajuda). */

const K_GH = "gh_adm_token_v1";

export const MODULOS_SITE = [
  "index.html",
  "brain.js",
  "mente.js",
  "cerebro_avancado.js",
  "autocorretor.js",
  "revisor.js",
  "editor_adm.js",
  "saber.js",
  "fatos.js",
  "saberes.js",
  "conversa.js",
  "dicionario.js",
  "programacao.js",
  "conhecimento.js",
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

function getGH() {
  try {
    const o = JSON.parse(localStorage.getItem(K_GH) || "null");
    return o && o.repo && o.token ? o : null;
  } catch {
    return null;
  }
}

function setGH(repo, token, branch = "main") {
  localStorage.setItem(K_GH, JSON.stringify({ repo, token, branch }));
}

function clearGH() {
  try { localStorage.removeItem(K_GH); } catch {}
}

function resetar() {
  sessao = null;
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
      pad(arq, 24) + " -> " +
      pad(arqTxt, 24) +
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
    "BACH AI 4.7 — TODOS OS MÓDULOS E CÓDIGOS ALINHADOS EM .TXT (MODO ADM)\n" +
    "Gerado em: " + new Date().toLocaleString("pt-BR") + "\n" +
    "Módulos lidos: " + lidos + " de " + MODULOS_SITE.length + "\n" +
    "====================================================================================\n\n" +
    pad("N°", 4) + pad("MÓDULO ORIGINAL", 24) + "    " + pad("ARQUIVO FINAL .TXT", 24) + pad("LINHAS", 14) + "KB\n" +
    "-".repeat(86) + "\n" +
    indice.join("\n") + "\n" +
    "-".repeat(86) + "\n\n";

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
    (gh ? "🟢 GitHub conectado: `" + gh.repo + "` (" + gh.branch + ")\n\n" : "🟡 GitHub ainda não conectado (use `/ghconfig usuario/repo TOKEN` para publicar automático; sem isso, gero o arquivo pronto para baixar).\n\n") +
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

async function publicarGitHub(path, conteudo, mensagem = "Atualização via BACH AI ADM") {
  const cfg = getGH();
  if (!cfg) return { ok: false, motivo: "sem-config" };

  const cleanPath = String(path).replace(/^\/+/, "");
  const url = "https://api.github.com/repos/" + cfg.repo + "/contents/" + cleanPath;
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
    }
  } catch {}

  const body = {
    message: mensagem,
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
  return { ok: true, repo: cfg.repo, path: cleanPath };
}

function comandoConfig(raw, isAdm) {
  const t = String(raw || "").trim();

  if (/^\/ghsair\b/i.test(t)) {
    if (!isAdm) return { handled: true, texto: "🔒 Comando exclusivo de administrador." };
    clearGH();
    return { handled: true, texto: "🔌 Conexão com o GitHub removida deste aparelho." };
  }

  const m = t.match(/^\/ghconfig(?:\s+(\S+)\s+(\S+)(?:\s+(\S+))?)?$/i);
  if (m) {
    if (!isAdm) return { handled: true, secret: Boolean(m[2]), texto: "🔒 Comando exclusivo de administrador." };
    if (!m[1] || !m[2]) {
      const atual = getGH();
      return {
        handled: true,
        texto: "⚙️ **Configurar publicação direta no GitHub (ADM):**\n" +
          (atual ? "• Atual: `" + atual.repo + "` (branch `" + atual.branch + "`)\n" : "• Ainda não configurado.\n") +
          "Use: `/ghconfig usuario/repositorio SEU_TOKEN`\n" +
          "Para remover: `/ghsair`"
      };
    }
    const repo = m[1].trim(), token = m[2].trim(), branch = (m[3] || "main").trim();
    if (!repo.includes("/") || token.length < 10) {
      return { handled: true, secret: true, texto: "Confira o formato: `/ghconfig usuario/repositorio SEU_TOKEN`" };
    }
    setGH(repo, token, branch);
    return {
      handled: true,
      secret: true,
      texto: "✅ GitHub conectado (`" + repo + "` • branch `" + branch + "`)!\nAgora quando usar `/editar`, eu já publico direto no repositório."
    };
  }
  return null;
}

function ehPedidoTudoTxt(raw) {
  const t = String(raw || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^\/(tudotxt|pacotetotxt|pacotetxts?|modulos?txt|codigostxt)\b/.test(t) ||
    (/\b(todos|tudo)\b/.test(t) && /\b(modulos?|codigos?|arquivos?)\b/.test(t) && /\btxt\b/.test(t));
}

async function processar(raw, isAdm, passo = () => {}) {
  const t = String(raw || "").trim();

  if (ehPedidoTudoTxt(t)) {
    if (!isAdm) return { texto: "🔒 O comando `/tudotxt` é exclusivo do modo administrador." };
    const pac = await gerarPacoteTxt(passo);
    return {
      texto: "📦 **PACOTE COMPLETO EM `.TXT` PRONTO (" + pac.lidos + "/" + pac.total + " módulos • " + pac.kb + " KB)!**\n\n" +
        "Todos os nomes terminam em **`.txt`** e estão alinhados com `--- START OF FILE nome.txt ---`.\n\n" +
        "```txt\n" + pac.indice + "\n```\n\n" +
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
      texto: "📄 Módulo **" + nomeMod + "** anotado!\nAgora digite o **nome do arquivo** (pode incluir pasta, ex.: `agenda.js` ou `modulos/agenda.js`):"
    };
  }

  if (sessao.passo === "nome_arquivo") {
    let arq = t.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._\/-]/g, "").replace(/^\/+/, "");
    if (!arq || arq.length < 3) return { texto: "Digite um nome de arquivo válido, ex.: `meu_modulo.js`." };
    if (!/\.[a-z0-9]+$/i.test(arq)) arq += ".js";
    sessao.arquivo = arq;
    sessao.passo = "codigo";
    return {
      texto: "📁 Arquivo definido: **`" + arq + "`** (módulo **" + sessao.modulo + "**).\n\nAgora cole o **código 100% inteiro** desse arquivo aqui no chat!"
    };
  }

  if (sessao.passo === "codigo") {
    if (t.length < 15) return { texto: "Esse código parece curto demais. Cole o arquivo completo (ou `/cancelar`)." };
    let codigoLimpo = t;
    const bloco = t.match(/^```[\w+-]*\n([\s\S]*?)```$/);
    if (bloco) codigoLimpo = bloco[1];

    const arquivoAlvo = sessao.arquivo;
    const moduloAlvo = sessao.modulo;
    resetar();

    const gh = getGH();
    if (gh) {
      passo("🚀 Publicando `" + arquivoAlvo + "` no GitHub...");
      const res = await publicarGitHub(arquivoAlvo, codigoLimpo, "Atualiza " + arquivoAlvo + " (" + moduloAlvo + ") via BACH AI");
      if (res.ok) {
        return {
          texto: "✅ **Publicado direto no GitHub!**\n• Repositório: `" + res.repo + "`\n• Arquivo: `" + res.path + "`\n• Tamanho: " + codigoLimpo.length + " caracteres\n\n⏳ Aguarde ~1 minuto para o GitHub Pages publicar e recarregue a página.",
          arquivo: arquivoAlvo,
          codigo: codigoLimpo
        };
      }
      return {
        texto: "⚠️ Não consegui enviar direto para o GitHub (" + res.motivo + ").\nGerei o arquivo abaixo para você baixar ou copiar manualmente!",
        arquivo: arquivoAlvo,
        codigo: codigoLimpo
      };
    }

    return {
      texto: "📦 Código de **`" + arquivoAlvo + "`** recebido (" + codigoLimpo.split("\n").length + " linhas)!\n\n" +
        "💡 Para publicar **direto no GitHub sem sair do chat**, configure uma vez com:\n`/ghconfig usuario/repositorio SEU_TOKEN`\n\nPor enquanto, você pode baixar ou copiar no cartão abaixo:",
      arquivo: arquivoAlvo,
      codigo: codigoLimpo
    };
  }

  return null;
}

function ajudaComandos(isAdm) {
  let out = "⌨️ **TODOS OS COMANDOS COM `/` DA BACH AI**\n\n" +
    "🔢 **Cálculos, Física, Finanças & Unidades:**\n" +
    "• `/calc (2+3)*4` — calculadora segura\n" +
    "• `/converter 10 km para m` — converte medidas, peso, volume e °C/°F\n" +
    "• `/juros simples 1000 2 12` (ou `compostos`) — calcula juros\n" +
    "• `/fisica velocidade 100 2` — velocidade, força, densidade, energia\n\n" +
    "🧰 **Utilidades & Segurança:**\n" +
    "• `/senha 16` — gera senha forte local\n" +
    "• `/dado 20` — rola um dado (d6, d20, etc.)\n" +
    "• `/moeda` — cara ou coroa\n" +
    "• `/sortear A, B, C` — sorteia itens ou números\n" +
    "• `/cpf 000.000.000-00` — valida dígitos matemáticos\n" +
    "• `/contar texto` — conta palavras, letras e tempo de leitura\n" +
    "• `/golpe mensagem` — analisa sinais de golpe/link suspeito\n\n" +
    "🔤 **Conversor de Texto & Links:**\n" +
    "• `/linkzap 11999999999 oi` — cria link direto do WhatsApp\n" +
    "• `/maiusculo texto` • `/minusculo texto` • `/semacento texto` • `/inverter texto`\n" +
    "• `/slug titulo` • `/base64 texto` • `/debase64 codigo`\n\n" +
    "🩺 **Saúde & Bem-Estar (Educacional):**\n" +
    "• `/imc 70 1.75` • `/agua 70` • `/calorias 70 1.75 25 m leve`\n" +
    "• `/respiracao` (guia 4-7-8) • `/pausa` (alongamento rápido)\n\n" +
    "🎓 **Estudos Avançados & Quiz:**\n" +
    "• `/flashcard [materia]` • `/virar` — cartões de memorização\n" +
    "• `/simulado [materia]` • `/alt A` — simulado com nota\n" +
    "• `/tecnica` — métodos de memorização\n" +
    "• `/quiz` • `/resposta A` — quiz rápido\n\n" +
    "🛠️ **Ferramentas Dev Web:**\n" +
    "• `/cor #8266ff` — converte HEX ↔ RGB ↔ HSL\n" +
    "• `/vidro` — gera CSS de vidro transparente\n" +
    "• `/meta Titulo | Descricao` — gera tags HTML SEO\n" +
    "• `/paleta oceano` — paletas prontas de cores\n\n" +
    "📝 **Revisão Fiel, Sílabas & Sites:**\n" +
    "• `/revisar texto` — aponta erros de ortografia/pontuação ou código\n" +
    "• `/silabas palavra` — separa sílabas e classifica\n" +
    "• `/site https://...` — avalia se um site está bom ou ruim\n\n" +
    "🎨 **Criatividade, Arquivos & Chat:**\n" +
    "• `/humor` • `/ideia tema` • `/historia tema` • `/personagem tema`\n" +
    "• `/plano objetivo` • `/automacao tarefa`\n" +
    "• `/arquivos` • `/abrir nome` • `/buscar palavra` • `/apagar nome`\n" +
    "• `/pasta Nome` • `/pastas` • `/mover arquivo para Pasta`\n" +
    "• `/palavra giria = significado` • `/palavras` • `/profundo assunto`\n" +
    "• `/historico` • `/nova` • `/clear` • `/copiar` • `/auditar` • `/exportar`";

  if (isAdm) {
    out += "\n\n👑 **COMANDOS DE ADMINISTRADOR:**\n" +
      "• `/tudotxt` — gera todos os 35 módulos alinhados com final `.txt` para copiar/baixar\n" +
      "• `/editar` — trocar ou criar módulo/arquivo direto pelo chat\n" +
      "• `/ghconfig usuario/repo TOKEN` • `/ghsair` — publicação direta no GitHub\n" +
      "• `/basedados` • `/importarbase` — backup completo do sistema\n" +
      "• `/diagnostico` • `/rollback` — saúde do sistema e restauração\n" +
      "• `/modulos` • `/modulo ID on|off` — ligar/desligar departamentos\n" +
      "• `/ia status` • `/chave ...` • `/modelo ...` — motor externo opcional";
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
