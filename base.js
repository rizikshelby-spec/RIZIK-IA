/* BACH AI 5.1 — base de dados, backup completo e exportador .txt alinhado (ADM).
 * Exporta memórias, conversas, arquivos e o código de todos os 42 módulos.
 * Chaves secretas nunca são incluídas no backup.
 */

export const ARQUIVOS = [
  ["index.html", "Interface, temas transparentes, esfera animada, 10 modos, painel de erros ADM e chat"],
  ["cerebro_avancado.js", "NLU, comparação de sites, controle de preview, recomendações e escrita"],
  ["rede_neural.js", "Rede Neural MLP própria (256->48->12) com backpropagation e pesos da nuvem"],
  ["nlu_neural.js", "Roteamento neural, autoaprendizado por reformulação e sincronização com Cloudflare D1"],
  ["llm.js", "Motor nativo próprio da BACH AI (100% independente de IAs externas)"],
  ["brain.js", "Cérebro, memória de longo prazo, termômetro de humor e aprendizado"],
  ["mente.js", "Contexto, jogos, inspeção de módulos, criação de apps e pastas"],
  ["conversa.js", "Personalidade adaptativa e conversação natural"],
  ["fatos.js", "Base de fatos e distâncias"],
  ["saberes.js", "Conhecimento adicional"],
  ["saberes_pro.js", "Sabedoria geral avançada (web, ciência, direito, economia, filosofia)"],
  ["conhecimento.js", "Conhecimento de programação"],
  ["programacao_termux.js", "Termux, Bash/Linux, scripts e criador autônomo de apps"],
  ["executor_sandbox.js", "Executor seguro de JavaScript e preview ao vivo de apps HTML/CSS/JS"],
  ["saber.js", "Leitura de textos, código, links e pesquisa"],
  ["dicionario.js", "Dicionário, definições e tradução"],
  ["arquivos.js", "Arquivos e leitura de mídia/OCR"],
  ["programacao.js", "Programação e humor existente"],
  ["historico.js", "Histórico de conversas"],
  ["base.js", "Exportação, importação de backup e pacote .txt"],
  ["autoguard.js", "Monitoramento, Watchdog, Failure Memory, Self-Healing e Rollback"],
  ["registry.js", "Catálogo, instruções de modo e roteador de habilidades"],
  ["autocorretor.js", "Autocorreção pelo histórico, auditoria /auditar e envio à Central ADM"],
  ["erros_adm.js", "Central de erros do público para o ADM com busca, seleção, exclusão e envio remoto"],
  ["voz.js", "Motor de voz natural (TTS) corrigido para iOS/Android/PC"],
  ["revisor.js", "Revisor fiel de português, sílabas, código e avaliação de sites"],
  ["editor_adm.js", "Editor interativo ADM (/editar), /tudotxt e central /ajuda"],
  ["utilidades.js", "Senhas, dados, moeda, sorteios, datas, CPF de teste e contador"],
  ["conversor_texto.js", "Link WhatsApp, maiúsculo/minúsculo, slug, sem acento e Base64"],
  ["saude_bemestar.js", "IMC, meta de água, calorias, respiração 4-7-8 e pausa ativa"],
  ["estudos.js", "Flashcards, simulado com pontuação e técnicas de estudo"],
  ["dev_ferramentas.js", "Conversor HEX/RGB/HSL, CSS vidro, meta tags e paletas"],
  ["intelligence.js", "Cálculo local e raciocínio aritmético"],
  ["personality.js", "Piadas interativas que aguardam a resposta do usuário"],
  ["creativity.js", "Ideias, personagens e histórias offline"],
  ["planning.js", "Planejamento de etapas"],
  ["security.js", "Triagem de sinais de golpes"],
  ["units.js", "Conversão de unidades"],
  ["finance.js", "Juros simples e compostos"],
  ["science.js", "Fórmulas introdutórias de física"],
  ["education.js", "Quiz educativo offline"],
  ["automation.js", "Roteiros seguros de automação"]
];

export const COMANDOS = [
  "/ajuda", "/neural status", "/neural testar", "/neural treinar", "/nuvem status",
  "/termux", "/app pomodoro", "/executar codigo", "/preview html",
  "/calc (2+3)*4", "/converter 10 km para m",
  "/juros simples 1000 2 12", "/fisica velocidade 100 2",
  "/golpe mensagem suspeita", "/quiz", "/resposta A",
  "/flashcard", "/virar", "/simulado", "/alt A", "/tecnica",
  "/imc 70 1.75", "/agua 70", "/calorias 70 1.75 25 m leve", "/respiracao", "/pausa",
  "/linkzap 11999999999", "/slug titulo", "/base64 texto", "/debase64 codigo",
  "/maiusculo texto", "/minusculo texto", "/semacento texto", "/inverter texto",
  "/cor #8266ff", "/vidro", "/meta Titulo | Descricao", "/paleta oceano",
  "/senha 16", "/dado 20", "/moeda", "/sortear A, B, C", "/cpf 000.000.000-00", "/contar texto",
  "/revisar texto", "/silabas palavra", "/site https://...",
  "/voz normal", "/voz rapida", "/voz lenta", "/voz teste",
  "/ideia assunto", "/historia tema", "/personagem tema",
  "/plano objetivo", "/automacao tarefa", "/humor",
  "/auditar", "/copiar", "/diagnostico", "/rollback",
  "/modulos", "/modulo ID on|off", "/editar", "/tudotxt", "/erroremoto URL",
  "/ia status", "/historico", "/nova", "/arquivos",
  "/abrir nome", "/buscar palavra", "/apagar nome",
  "/pasta Nome/Sub", "/pastas", "/mover nome para Pasta",
  "/palavra gíria = significado", "/palavras", "/profundo assunto",
  "/clear", "sobre"
];

const CHAVES_OCULTAS = new Set([
  "bach_gemini_key",
  "bach_creator_v1",
  "gh_adm_token_v1",
  "bach_adm_erro_remote_v1",
  "bach_cloud_url_v1"
]);

const CONHECIDAS = {
  rizik_brain_v1: "memoria",
  bach_arquivos_v1: "arquivos",
  bach_conhecimento_v2: "pesquisas",
  bach_conhecimento_v1: "pesquisasAntigas",
  bach_mente_v1: "mente",
  bach_sessoes_v1: "conversas",
  bach_chat_history_v1: "conversaAberta",
  bach_neural_local_v1: "redeNeural"
};

const analisar = value => {
  try { return JSON.parse(value); }
  catch { return value; }
};

const tamanhoKB = value => +(new Blob([value]).size / 1024).toFixed(1);
const quantidade = value => Array.isArray(value) ? value.length : Object.keys(value || {}).length;
const pad = (value, size) => String(value).padEnd(size);

function lerArmazenamento() {
  const dados = {};
  const outros = {};

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || CHAVES_OCULTAS.has(key)) continue;

      const value = analisar(localStorage.getItem(key));
      if (CONHECIDAS[key]) dados[CONHECIDAS[key]] = value;
      else if (/^(bach|rizik)_/i.test(key)) outros[key] = value;
    }
  } catch (error) {
    console.warn("Não foi possível ler todo o armazenamento:", error);
  }

  return { dados, outros };
}

async function lerFonte(path) {
  try {
    const response = await fetch("./" + path + "?v=" + Date.now());
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.text();
  } catch (error) {
    console.warn("Não foi possível incluir:", path, error);
    return null;
  }
}

function nomeTxt(path) {
  return String(path).replace(/\.(js|html)$/i, "") + ".txt";
}

async function gerarTudoTxt(progresso = () => {}) {
  const linhasIndice = [];
  const blocos = [];
  let lidos = 0;

  for (let i = 0; i < ARQUIVOS.length; i++) {
    const [path, funcao] = ARQUIVOS[i];
    const arqTxt = nomeTxt(path);
    progresso("📦 Lendo (" + (i + 1) + "/" + ARQUIVOS.length + "): " + path + " → " + arqTxt);
    let source = await lerFonte(path);
    if (source === null && path === "index.html") {
      source = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    }

    const ok = source !== null;
    if (ok) lidos++;
    const qtdLinhas = ok ? source.split("\n").length : 0;
    const kb = ok ? tamanhoKB(source) + " KB" : "FALHOU";

    linhasIndice.push(
      pad((i + 1) + ".", 4) +
      pad(path, 26) + " -> " +
      pad(arqTxt, 26) +
      pad(ok ? qtdLinhas + " linhas" : "NÃO LIDO", 14) +
      pad(kb, 11) +
      funcao
    );

    if (ok) {
      blocos.push(
        "--- START OF FILE " + arqTxt + " ---\n\n" +
        source.trimEnd() + "\n\n" +
        "--- END OF FILE " + arqTxt + " ---"
      );
    } else {
      blocos.push(
        "--- START OF FILE " + arqTxt + " ---\n" +
        "[AVISO: arquivo " + path + " não encontrado ou falhou ao carregar]\n" +
        "--- END OF FILE " + arqTxt + " ---"
      );
    }
  }

  const cabecalho =
    "====================================================================================\n" +
    "BACH AI 5.1 — PACOTE COMPLETO DE MÓDULOS E CÓDIGOS EM .TXT (MODO ADM)\n" +
    "Gerado em: " + new Date().toLocaleString("pt-BR") + "\n" +
    "Arquivos lidos: " + lidos + " de " + ARQUIVOS.length + "\n" +
    "====================================================================================\n\n" +
    pad("N°", 4) + pad("ORIGEM", 26) + "    " + pad("DESTINO .TXT", 26) + pad("TAMANHO", 14) + pad("KB", 11) + "FUNÇÃO\n" +
    "-".repeat(112) + "\n" +
    linhasIndice.join("\n") + "\n" +
    "-".repeat(112) + "\n\n";

  const conteudo = cabecalho + blocos.join("\n\n");
  const date = new Date().toISOString().slice(0, 10);

  return {
    nome: "bach-todos-modulos-" + date + ".txt",
    conteudo,
    lidos,
    total: ARQUIVOS.length,
    kb: tamanhoKB(conteudo)
  };
}

async function montar(context = {}) {
  const fontes = {};
  const modulos = [];

  for (const [path, funcao] of ARQUIVOS) {
    const source = await lerFonte(path);
    if (source !== null) fontes[path] = source;

    modulos.push({
      arquivo: path,
      linhas: source !== null ? source.split("\n").length : "não lido",
      kb: source !== null ? tamanhoKB(source) : "não lido",
      funcao
    });
  }

  if (!fontes["index.html"]) {
    fontes["index.html"] = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  }

  const { dados: memoria, outros } = lerArmazenamento();
  const cerebro = memoria.memoria || {};
  const arquivos = Array.isArray(memoria.arquivos) ? memoria.arquivos : [];
  const pesquisas = Array.isArray(memoria.pesquisas) ? memoria.pesquisas : [];
  const mente = memoria.mente || {};
  const sessoes = Array.isArray(memoria.conversas) ? memoria.conversas : [];

  const totalMensagens = sessoes.reduce(
    (sum, session) => sum + (session.msgs || []).length,
    0
  );

  const stats = context.statsMente || {};

  const contagens = [
    ["Respostas ensinadas", quantidade(cerebro.examples)],
    ["Sinônimos ensinados", quantidade(cerebro.synonyms)],
    ["Fatos e notas", quantidade(cerebro.facts) + quantidade(cerebro.notes)],
    ["Arquivos", arquivos.length],
    ["Pastas", new Set(arquivos.map(item => item.pasta)).size],
    ["Pesquisas salvas", pesquisas.length],
    ["Conversas no histórico", sessoes.length],
    ["Mensagens no histórico", totalMensagens],
    ["Mensagens na conversa aberta", (context.history || []).length],
    ["Gírias base", stats.girias ?? "?"],
    ["Palavras aprendidas", quantidade(mente.lex)],
    ["Assuntos lembrados", quantidade(mente.assuntos)],
    ["Fatos cadastrados", context.totalFatos ?? "?"],
    ["Departamentos no catálogo", 36],
    ["Arquivos de código listados", ARQUIVOS.length]
  ];

  const width = Math.max(...contagens.map(item => item[0].length)) + 2;

  const tabelaModulos =
    pad("ARQUIVO", 32) + pad("LINHAS", 14) + pad("KB", 12) + "FUNÇÃO\n" +
    modulos.map(item =>
      pad(item.arquivo, 32) + pad(item.linhas, 14) + pad(item.kb, 12) + item.funcao
    ).join("\n");

  const tabelaDados =
    pad("DADO", width) + "QTD\n" +
    contagens.map(item => pad(item[0], width) + item[1]).join("\n");

  const css = (fontes["index.html"].match(/<style>([\s\S]*?)<\/style>/) || [])[1] || "";

  const backup = {
    bach: {
      versao: "5.1",
      geradoEm: new Date().toISOString()
    },
    tabelas: {
      modulos,
      contagens: Object.fromEntries(contagens),
      comandos: COMANDOS
    },
    interface: {
      arquivo: "index.html",
      linhas: fontes["index.html"].split("\n").length,
      estilos: css.trim(),
      menu: context.menu || [],
      status: context.status || "",
      estado: context.estado || {},
      tela: {
        largura: window.innerWidth,
        altura: window.innerHeight,
        idioma: navigator.language
      }
    },
    conversas: {
      aberta: context.history || [],
      historico: sessoes,
      idAtual: context.idAtual || null
    },
    memoria: cerebro,
    arquivos,
    pesquisas,
    pesquisasAntigas: memoria.pesquisasAntigas || [],
    mente,
    outrosDados: outros,
    codigo: fontes,
    aviso: "Chaves secretas foram excluídas deste backup por segurança."
  };

  const json = JSON.stringify(backup, null, 1);
  const date = new Date().toISOString().slice(0, 10);

  return {
    json,
    nome: "bach-basedados-" + date + ".json",
    tabelaModulos,
    tabelaDados,
    tamanhoKb: tamanhoKB(json),
    conversas: sessoes.length
  };
}

function importar(obj) {
  if (!obj || typeof obj !== "object" || !obj.bach) {
    throw new Error("Esse arquivo não é um backup da BACH.");
  }

  const mapa = {
    memoria: "rizik_brain_v1",
    arquivos: "bach_arquivos_v1",
    pesquisas: "bach_conhecimento_v2",
    mente: "bach_mente_v1"
  };

  let feitos = 0;

  for (const [campo, key] of Object.entries(mapa)) {
    if (obj[campo] != null) {
      localStorage.setItem(key, JSON.stringify(obj[campo]));
      feitos++;
    }
  }

  if (Array.isArray(obj.conversas?.historico)) {
    localStorage.setItem("bach_sessoes_v1", JSON.stringify(obj.conversas.historico));
    feitos++;
  }

  if (Array.isArray(obj.conversas?.aberta)) {
    localStorage.setItem("bach_chat_history_v1", JSON.stringify(obj.conversas.aberta));
    feitos++;
  }

  for (const [key, value] of Object.entries(obj.outrosDados || {})) {
    if (/^(bach|rizik)_/i.test(key) && !CHAVES_OCULTAS.has(key)) {
      localStorage.setItem(key, JSON.stringify(value));
      feitos++;
    }
  }

  return feitos;
}

export const Base = {
  montar,
  gerarTudoTxt,
  importar,
  ARQUIVOS,
  COMANDOS
};
