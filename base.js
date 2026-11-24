/* BACH AI 4.5 — base de dados e backup completo.
 * Exporta memórias, conversas, arquivos e o código de todos os módulos.
 * Chaves secretas nunca são incluídas no backup.
 */

export const ARQUIVOS = [
  ["index.html", "Interface, temas transparentes, esfera animada, 10 modos, roteamento e chat"],
  ["cerebro_avancado.js", "NLU, recomendações por gênero, comparações e escrita estruturada"],
  ["llm.js", "Provedor híbrido opcional (ADM)"],
  ["brain.js", "Cérebro, memória de longo prazo e aprendizado"],
  ["mente.js", "Contexto, jogos, criação de apps e pastas"],
  ["conversa.js", "Personalidade e conversação"],
  ["fatos.js", "Base de fatos"],
  ["saberes.js", "Conhecimento adicional"],
  ["conhecimento.js", "Conhecimento de programação"],
  ["saber.js", "Leitura de textos, código, links e pesquisa"],
  ["dicionario.js", "Dicionário, definições e tradução"],
  ["arquivos.js", "Arquivos e leitura de mídia/OCR"],
  ["programacao.js", "Programação e humor existente"],
  ["historico.js", "Histórico de conversas"],
  ["base.js", "Exportação e importação de backup"],
  ["autoguard.js", "Monitoramento, Watchdog, Failure Memory, Self-Healing e Rollback"],
  ["registry.js", "Catálogo, instruções de modo e roteador de habilidades"],
  ["intelligence.js", "Cálculo local e raciocínio aritmético"],
  ["personality.js", "Piadas e humor local"],
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
  "/calc (2+3)*4", "/converter 10 km para m",
  "/juros simples 1000 2 12",
  "/fisica velocidade 100 2",
  "/golpe mensagem suspeita",
  "/quiz", "/resposta A",
  "/ideia assunto", "/historia tema",
  "/personagem tema", "/plano objetivo",
  "/automacao tarefa", "/humor",
  "/diagnostico", "/rollback",
  "/modulos", "/modulo ID on|off",
  "/ia status", "/modelo nome",
  "/historico", "/nova", "/arquivos",
  "/abrir nome", "/buscar palavra", "/apagar nome",
  "/pasta Nome/Sub", "/pastas",
  "/mover nome para Pasta",
  "/palavra gíria = significado",
  "/palavras", "/profundo assunto",
  "/clear", "sobre",
  "ensine: pergunta => resposta",
  "corrija: pergunta => nova",
  "esqueça: pergunta", "sinônimo: a = b",
  "lembre: algo", "pesquise sobre ...",
  "pesquise a fundo sobre ...", "clima em (cidade)"
];

const CHAVES_OCULTAS = new Set(["bach_gemini_key", "bach_creator_v1"]);

const CONHECIDAS = {
  rizik_brain_v1: "memoria",
  bach_arquivos_v1: "arquivos",
  bach_conhecimento_v2: "pesquisas",
  bach_conhecimento_v1: "pesquisasAntigas",
  bach_mente_v1: "mente",
  bach_sessoes_v1: "conversas",
  bach_chat_history_v1: "conversaAberta"
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
    console.warn("Não foi possível incluir no backup:", path, error);
    return null;
  }
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
    ["Departamentos no catálogo", 24],
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
      versao: "4.5",
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
  importar,
  ARQUIVOS,
  COMANDOS
};
