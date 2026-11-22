/* BACH AI - BASE DE DADOS 1.0
   Comando /basedados: reúne TUDO dela num arquivo só:
   memória, arquivos, pesquisas, vocabulário, TODAS as conversas, estado da tela
   e o código-fonte de cada módulo (inclusive a interface, index.html).
   A chave da IA externa nunca entra. */

export const ARQUIVOS = [
  ["index.html", "Tela, chat, histórico, voz, pesquisa, /basedados"],
  ["brain.js", "Cérebro: regras, memória, ensine:"],
  ["mente.js", "Contexto, vocabulário, jogos, apps, pastas"],
  ["fatos.js", "Base de fatos e respostas sobre a própria BACH"],
  ["conhecimento.js", "Base de programação e erros comuns"],
  ["saber.js", "Leitura de texto/código/links e pesquisa profunda"],
  ["arquivos.js", "Pastas e leitura de fotos, vídeos e textos"],
  ["programacao.js", "Programação básica e humor"],
  ["historico.js", "Histórico de conversas (15 páginas)"],
  ["base.js", "Exportação /basedados"]
];

export const COMANDOS = ["/basedados", "/importarbase", "/historico", "/nova", "/arquivos", "/abrir nome", "/buscar palavra", "/apagar nome",
  "/pasta Nome/Sub", "/pastas", "/mover nome para Pasta", "/palavra gíria = significado", "/palavras", "/profundo assunto", "/chave SUA_CHAVE",
  "/modelo nome", "/clear", "ensine: pergunta => resposta", "corrija: pergunta => nova", "esqueça: pergunta", "sinônimo: a = b", "lembre: algo",
  "/exportar", "importar memória: {...}", "pesquise sobre ...", "pesquise a fundo sobre ...", "clima em (cidade)"];

const CHAVE_SECRETA = "bach_gemini_key";
const CONHECIDAS = {
  rizik_brain_v1: "memoria", bach_arquivos_v1: "arquivos", bach_conhecimento_v2: "pesquisas", bach_conhecimento_v1: "pesquisasAntigas",
  bach_mente_v1: "mente", bach_sessoes_v1: "conversas", bach_chat_history_v1: "conversaAberta"
};

const analisar = v => { try { return JSON.parse(v); } catch { return v; } };

function lerArmazenamento() {
  const out = {}, outros = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === CHAVE_SECRETA) continue;
      if (CONHECIDAS[k]) out[CONHECIDAS[k]] = analisar(localStorage.getItem(k));
      else if (/^(bach|rizik)_/i.test(k)) outros[k] = analisar(localStorage.getItem(k));
    }
  } catch (e) { console.warn(e); }
  return { out, outros };
}

async function lerFonte(nome) {
  try {
    const r = await fetch("./" + nome + "?_=" + Date.now());
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } catch { return null; }
}

const kb = t => +(new Blob([t]).size / 1024).toFixed(1);
const pad = (x, n) => String(x).padEnd(n);
const n = o => Array.isArray(o) ? o.length : Object.keys(o || {}).length;

/* ctx: { history, estado, menu, status, mente } vindo da tela */
async function montar(ctx = {}) {
  const fontes = {}, mods = [];
  for (const [nome, funcao] of ARQUIVOS) {
    const t = await lerFonte(nome);
    if (t != null) fontes[nome] = t;
    mods.push({ arquivo: nome, linhas: t != null ? t.split("\n").length : "?", kb: t != null ? kb(t) : "?", funcao });
  }
  if (!fontes["index.html"]) fontes["index.html"] = "<!DOCTYPE html>\n" + document.documentElement.outerHTML; // plano B: a tela como está agora

  const { out: mem, outros } = lerArmazenamento();
  const cer = mem.memoria || {}, arqs = mem.arquivos || [], pesq = mem.pesquisas || [], mente = mem.mente || {};
  const sessoes = Array.isArray(mem.conversas) ? mem.conversas : [];
  const msgsSessoes = sessoes.reduce((a, s) => a + (s.msgs || []).length, 0);
  const st = ctx.statsMente || {};

  const cont = [
    ["Respostas aprendidas (ensine:)", n(cer.examples)], ["Sinônimos ensinados", n(cer.synonyms)], ["Fatos guardados", n(cer.facts)], ["Notas (lembre:)", n(cer.notes)],
    ["Arquivos guardados", n(arqs)], ["Pastas", new Set(arqs.map(a => a.pasta)).size], ["Pesquisas guardadas", n(pesq)],
    ["Conversas no histórico", sessoes.length], ["Mensagens em todas as conversas", msgsSessoes], ["Mensagens na conversa aberta", (ctx.history || []).length],
    ["Gírias/abreviações de fábrica", st.girias ?? "?"], ["Gírias que você ensinou", n(mente.vocab)], ["Palavras do léxico (base)", st.lexBase ?? "?"], ["Palavras aprendidas", n(mente.lex)],
    ["Assuntos de programação", st.kbProg ?? "?"], ["Erros comuns reconhecidos", st.erros ?? "?"], ["Fatos verificados (fatos.js)", ctx.totalFatos ?? "?"],
    ["Jogos", st.jogos ?? "?"], ["Modelos de apps prontos", st.modelosApps ?? "?"], ["Assuntos lembrados", n(mente.assuntos)]
  ];
  const W = Math.max(...cont.map(c => c[0].length)) + 2;
  const t1 = pad("ARQUIVO", 17) + pad("LINHAS", 8) + pad("KB", 7) + "FUNÇÃO\n" + mods.map(m => pad(m.arquivo, 17) + pad(m.linhas, 8) + pad(m.kb, 7) + m.funcao).join("\n");
  const t2 = pad("DADO", W) + "QTD\n" + cont.map(c => pad(c[0], W) + c[1]).join("\n");

  const css = (fontes["index.html"].match(/<style>([\s\S]*?)<\/style>/) || [])[1] || "";
  const interfaceInfo = {
    arquivo: "index.html", linhas: fontes["index.html"].split("\n").length,
    estilos: css.trim(), menu: ctx.menu || [], status: ctx.status || "", estado: ctx.estado || {},
    tela: { largura: window.innerWidth, altura: window.innerHeight, idioma: navigator.language, navegador: navigator.userAgent }
  };

  const dados = {
    bach: { versao: "3.0", geradoEm: new Date().toISOString() },
    tabelas: { modulos: mods, contagens: Object.fromEntries(cont), comandos: COMANDOS },
    interface: interfaceInfo,
    conversas: { aberta: ctx.history || [], historico: sessoes, idAtual: ctx.idAtual || null },
    memoria: cer, arquivos: arqs, pesquisas: pesq, pesquisasAntigas: mem.pesquisasAntigas || [], mente,
    outrosDados: outros,
    codigo: fontes,
    aviso: "A chave da IA externa (Gemini) nunca entra neste backup."
  };
  const json = JSON.stringify(dados, null, 1);
  const data = new Date().toISOString().slice(0, 10);
  return { json, nome: "bach-basedados-" + data + ".json", tabelaModulos: t1, tabelaDados: t2, tamanhoKb: kb(json), conversas: sessoes.length };
}

/* Restaurar um /basedados salvo (memória, arquivos, pesquisas, vocabulário e conversas). */
function importar(obj) {
  if (!obj || typeof obj !== "object" || !obj.bach) throw new Error("Esse arquivo não é um backup da BACH.");
  const mapa = { memoria: "rizik_brain_v1", arquivos: "bach_arquivos_v1", pesquisas: "bach_conhecimento_v2", mente: "bach_mente_v1" };
  let feitos = 0;
  for (const [campo, chave] of Object.entries(mapa)) {
    if (obj[campo] != null) { localStorage.setItem(chave, JSON.stringify(obj[campo])); feitos++; }
  }
  if (Array.isArray(obj.conversas?.historico)) { localStorage.setItem("bach_sessoes_v1", JSON.stringify(obj.conversas.historico)); feitos++; }
  if (Array.isArray(obj.conversas?.aberta)) { localStorage.setItem("bach_chat_history_v1", JSON.stringify(obj.conversas.aberta)); feitos++; }
  for (const [k, v] of Object.entries(obj.outrosDados || {})) if (/^(bach|rizik)_/i.test(k) && k !== CHAVE_SECRETA) { localStorage.setItem(k, JSON.stringify(v)); feitos++; }
  return feitos;
}

export const Base = { montar, importar, ARQUIVOS, COMANDOS };
