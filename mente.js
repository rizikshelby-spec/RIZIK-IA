/* BACH AI - MENTE 2.5
   Contexto, leitura/cadeia de código colado, jogos, criação de apps seguros, pastas e vocabulário.
   Sem lookbehind e sem eval/Function. */
import { Saber } from "./saber.js?v=12";
import { KB, ERROS } from "./conhecimento.js?v=1";

const BT = "\x60\x60\x60";
const KF = "bach_arquivos_v1";
const lf = () => { try { return JSON.parse(localStorage.getItem(KF)) || []; } catch { return []; } };
const sf = a => { try { localStorage.setItem(KF, JSON.stringify(a.slice(-40))); } catch (e) { console.warn(e); } };
const pick = a => a[Math.floor(Math.random() * a.length)];

const VOCAB = {
  oque: "o que", oq: "o que", oqe: "o que", q: "que", ke: "que", qe: "que",
  vc: "voce", vce: "voce", vcs: "voces", voces: "voces", nois: "nos", gnt: "gente",
  pq: "porque", pk: "porque", prq: "porque",
  tb: "tambem", tbm: "tambem", tmb: "tambem",
  mt: "muito", mto: "muito", mta: "muita", mts: "muitos",
  blz: "beleza", fmz: "firmeza", suave: "tranquilo", dboa: "de boa", deboa: "de boa",
  vlw: "valeu", vlws: "valeu", obg: "obrigado", obgd: "obrigado", obgda: "obrigada",
  hj: "hoje", ontm: "ontem", amnh: "amanha", agr: "agora", dps: "depois", smp: "sempre", nnc: "nunca",
  td: "tudo", tdo: "tudo", tds: "todos", nd: "nada", nda: "nada", msm: "mesmo", ctz: "certeza",
  dnv: "de novo", denovo: "de novo", vdd: "verdade", fds: "fim de semana", sdds: "saudade",
  ta: "esta", tao: "estao", to: "estou", tava: "estava", tamo: "estamos", vamo: "vamos",
  pra: "para", oara: "para", praa: "para", pro: "para o", pras: "para as", pros: "para os",
  qro: "quero", fzer: "fazer", assitir: "assistir", asist: "assistir", recomnda: "recomenda", recomeda: "recomenda",
  cmg: "comigo", entt: "entao", msc: "musica", sla: "sei la", rlx: "relaxa", nmrl: "na moral",
  ngm: "ninguem", algm: "alguem", msg: "mensagem",
  pf: "por favor", pfv: "por favor", plis: "por favor", pls: "por favor",
  n: "nao", naum: "nao", nn: "nao", s: "sim", ss: "sim", eh: "e",
  kd: "cade", qnd: "quando", qdo: "quando", qm: "quem", cm: "como", cmo: "como",
  qto: "quanto", qtos: "quantos", qtas: "quantas", ctg: "contigo",
  add: "adicionar", app: "app", apps: "app", cel: "celular", pc: "computador", net: "internet",
  zap: "whatsapp", wpp: "whatsapp", yt: "youtube", insta: "instagram", face: "facebook",
  cod: "codigo", progamacao: "programacao", programaçao: "programacao", codigo: "codigo",
  iries: "iris", bash: "bach", bax: "bach", arcoiris: "arco iris", sao: "sao",
  ola: "ola", oii: "oi", oiii: "oi", oie: "oi", roi: "oi", roii: "oi", roiii: "oi",
  eae: "e ai", eai: "e ai", flw: "falou", bora: "bora",
  tmj: "tamo junto", slc: "voce e louco", slk: "voce e louco", mds: "meu deus",
  pco: "pouco", mlr: "melhor", mior: "melhor", btf: "boto fe", tlg: "ta ligado", tlgd: "ta ligado",
  daora: "legal", massa: "legal", brabo: "bom", braba: "boa", top: "bom", show: "bom",
  hello: "ola", hi: "ola", hey: "oi", thanks: "obrigado", thx: "obrigado", please: "por favor", sorry: "desculpa",
  hola: "ola", gracias: "obrigado", bonjour: "ola", merci: "obrigado", ciao: "ola", hallo: "ola", danke: "obrigado"
};

const BASE_LEX = (
  "mundo noticia noticias hoje agora ontem amanha semana mes ano seculo tempo clima chuva calor frio sol lua estrela terra planeta universo galaxia " +
  "pais cidade estado capital brasil mundo pessoa gente homem mulher crianca jovem adulto idoso amigo amiga familia pai mae irmao irma filho filha " +
  "casa apartamento quarto cozinha sala rua bairro escola faculdade universidade trabalho emprego empresa dinheiro banco salario preco compra venda " +
  "comida agua cafe leite pao arroz feijao carne frango peixe fruta banana maca laranja doce bolo pizza lanche suco cerveja vinho " +
  "animal cachorro gato cavalo passaro peixe pato leao tigre urso lobo macaco cobra tubarao baleia dinossauro inseto planta arvore flor floresta " +
  "cores azul verde vermelho amarelo preto branco rosa roxo laranja marrom cinza dourado prateado pintar pintura quadro quadros desenho desenhar " +
  "tema temas esfera bolinha transparente modulo modulos melhorar risos musica cantar dancar instrumento violao guitarra piano bateria banda show album letra " +
  "filme filmes serie series anime animes desenho desenhos livro livros historia conto novela cinema ator atriz diretor lancamento estreia trailer sinopse critica nota " +
  "jogo jogos game games console computador celular internet site pagina rede social aplicativo programa codigo codigos algoritmo dado dados banco servidor nuvem " +
  "erro bug falha problema solucao texto textos resumo explicar explicacao significa significado diferenca exemplo pergunta resposta ajuda ajudar " +
  "aprender ensinar estudar escrever falar ouvir ler ver assistir pensar lembrar esquecer comecar terminar continuar tentar conseguir " +
  "criar fazer construir montar editar apagar excluir salvar abrir fechar buscar procurar pesquisar encontrar saber entender conhecer " +
  "esporte futebol basquete volei tenis corrida natacao luta campeonato copa time jogador gol " +
  "carro moto bicicleta aviao onibus trem navio viagem turismo hotel mapa estrada transito " +
  "hospital medico doenca saude remedio vacina corpo cabeca olho boca mao pe coracao cerebro sangue " +
  "amor feliz felicidade triste tristeza raiva medo susto calma paz alegria saudade sonho esperanca " +
  "importante facil dificil grande pequeno alto baixo novo velho rapido devagar muito pouco tudo nada algum alguem ninguem " +
  "sempre nunca depois antes durante porque quando quanto onde quem qual qualquer outro mesmo primeiro ultimo ultimas " +
  "politica economia ciencia tecnologia cultura arte geografia matematica fisica quimica biologia filosofia psicologia direito " +
  "presidente governo eleicao lei guerra paz energia eletricidade bateria motor robo inteligencia artificial " +
  "imagem video foto audio som voz tela teclado mouse camera microfone arquivo pasta pastas documento " +
  "praia montanha rio mar oceano lago ilha deserto neve vento tempestade raio trovao fogo gelo pedra areia " +
  "javascript python html css sql java php csharp ruby rust go kotlin swift react node linux windows android ios github"
).split(" ");

let LEXS = null;
const lexico = () => {
  if (!LEXS) {
    LEXS = new Set(BASE_LEX);
    KB.forEach(e => e[0].split("|").forEach(k => k.split(" ").forEach(w => w.length > 3 && LEXS.add(w))));
    Object.values(VOCAB).forEach(v => v.split(" ").forEach(w => w.length > 3 && LEXS.add(w)));
    (ctx.lex || []).forEach(w => LEXS.add(w));
  }
  return LEXS;
};

function lev(a, b) {
  const m = a.length, n = b.length;
  let pr = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const c = [i];
    for (let j = 1; j <= n; j++) {
      c[j] = Math.min(pr[j] + 1, c[j - 1] + 1, pr[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    pr = c;
  }
  return pr[n];
}

function corrigir(w) {
  if (w.length < 5 || /\d/.test(w)) return w;
  if (/^(passe|passa|passar|passou|arroz|manda|mande|pede|pedir|quero|prece|pesse|lancou|lanca|lancar|estreou|saiu|presta|recomenda|indica|bugado|bugada|fazem|travou|arrumo|consertar)$/.test(w)) return w;
  const L = lexico();
  if (L.has(w)) return w;
  const max = w.length >= 8 ? 2 : 1;
  let best = w, bd = max + 1;
  for (const c of L) {
    if (c[0] !== w[0] || Math.abs(c.length - w.length) > max || w.startsWith(c) || c.startsWith(w)) continue;
    const d = lev(w, c);
    if (d < bd) { bd = d; best = c; }
  }
  return bd <= max ? best : w;
}

function lembrarTema(q) {
  const t = String(q || "").trim();
  if (!t) return;
  ctx.tema = t;
  ctx.lex = ctx.lex || [];
  prep(t).split(" ").forEach(w => w.length > 3 && !ctx.lex.includes(w) && ctx.lex.push(w));
  ctx.lex = ctx.lex.slice(-300);
  LEXS = null;
  persist();
}

const normSimples = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const prep = t => " " + normSimples(t)
  .replace(/([a-z])-([a-z])/g, "$1 $2")
  .replace(/[^a-z0-9+\-*/().,\s]/g, " ")
  .replace(/[.,]+(?=\s|$)/g, " ")
  .split(/\s+/).filter(Boolean)
  .map(w => (ctx.vocab && ctx.vocab[w]) || VOCAB[w] || w)
  .map(corrigir).join(" ") + " ";

function tema(t) {
  let x = prep(t).trim();
  const CMD = /^(?:(?:pode|poderia|consegue|faz|faca|fazer|quero|gostaria)\s+)?(?:me\s+)?(?:explica|explique|explicar|fala|fale|falar|diz|diga|conta|conte|mostra|mostre|pesquisa|pesquise|pesquisar|procure|procura|procurar|busca|busque|buscar|indica|indique|recomenda|recomende)(?:\s+uma\s+pesquisa)?(?:\s+na\s+(?:internet|web|net)|no\s+google|\s+online)?(?:\s+pra\s+mim|\s+por\s+favor)?(?:\s+(?:sobre|de|por|a\s+respeito\s+de))?(?:\s+|$)/;
  const PERG = /^(?:o\s+que|quem|quais|qual|quantos|quantas|quanto|onde|quando|como|por\s+que|porque|para\s+que|sera\s+que)\s+(?:e|sao|foi|foram|era|eram|esta|estao|significa|significam|funciona|funcionam|aconteceu|existe|existem|fica|ficam|fazer|faz|faco|tem|vai|vao)?\s*/;
  const ART = /^(?:a|o|as|os|um|uma|uns|umas|de|do|da|dos|das|no|na|nos|nas|que|sobre|na\s+internet|na\s+web|no\s+google|por\s+favor|pra\s+mim)\s+/;
  const SUF = /\s+(?:ja\s+lancou|lancou|vai\s+lancar|ja\s+saiu|vai\s+sair|e\s+bom|e\s+boa|sao\s+bons|sao\s+boas|vale\s+a\s+pena|presta|e\s+legal|sao\s+legais|legais|legal|bom|boa|melhor|melhores|hoje|agora|atualmente|por\s+favor)$/;

  for (let k = 0; k < 4; k++) {
    x = x.replace(CMD, "").replace(PERG, "").replace(ART, "").replace(SUF, "").trim();
  }
  if (/^(isso|aquilo|ele|ela|eles|elas|esse|essa|este|esta|falar|perguntei|aqui|travou|rir|audio)$/.test(x)) return "";
  return x;
}

const has = (p, re) => re.test(p);

const KC = "bach_mente_v1";
const ctx = { texto: null, nome: "", pasta: null, jogo: null, ultimo: null, ultimoMidia: null, assuntos: [], esperando: null, vocab: {}, tema: null, lex: [] };
try {
  const o = JSON.parse(localStorage.getItem(KC));
  if (o) Object.assign(ctx, {
    texto: o.texto, nome: o.nome || "", pasta: o.pasta, ultimo: o.ultimo,
    ultimoMidia: o.ultimoMidia || null, assuntos: o.assuntos || [],
    vocab: o.vocab || {}, tema: o.tema || null, lex: o.lex || []
  });
} catch {}

function persist() {
  try {
    localStorage.setItem(KC, JSON.stringify({
      texto: ctx.texto && ctx.texto.slice(0, 12000),
      nome: ctx.nome, pasta: ctx.pasta, ultimo: ctx.ultimo, ultimoMidia: ctx.ultimoMidia,
      assuntos: ctx.assuntos, vocab: ctx.vocab, tema: ctx.tema, lex: (ctx.lex || []).slice(-300)
    }));
  } catch {}
}

const setTexto = (nome, texto) => {
  ctx.nome = nome;
  ctx.texto = texto;
  ctx.tema = null;
  ctx.ultimo = { t: "texto" };
  persist();
};

const setMidia = (nome, tipo, textoExtraido = "") => {
  ctx.ultimoMidia = { nome, tipo };
  ctx.tema = null;
  if (textoExtraido && textoExtraido.trim().length > 10) {
    ctx.nome = nome;
    ctx.texto = textoExtraido;
    ctx.ultimo = { t: "texto" };
  } else {
    ctx.texto = null;
    ctx.ultimo = { t: "midia", tipo };
  }
  persist();
};
const pasta = def => ctx.pasta || def;

/* ---------- pastas ---------- */
function comandoPasta(t) {
  let m = t.match(/^\/pasta(?:\s+(.+))?$/i);
  if (m) {
    if (!m[1]) return ctx.pasta ? "📂 Pasta atual: " + ctx.pasta + "\nPara sair: /pasta sair" : "Nenhuma pasta escolhida. Use: /pasta Estudos/IA (pode criar pastas dentro de pastas com /).";
    if (/^sair$/i.test(m[1].trim())) { ctx.pasta = null; persist(); return "Voltei para as pastas automáticas."; }
    ctx.pasta = m[1].trim().replace(/\s*\/\s*/g, "/").slice(0, 60); persist();
    return "📂 Pasta atual: " + ctx.pasta + "\nTudo que eu guardar agora (textos, pesquisas, arquivos) vai para ela.";
  }
  if (/^\/pastas$/i.test(t)) {
    const c = {}; lf().forEach(a => c[a.pasta] = (c[a.pasta] || 0) + 1);
    const k = Object.keys(c).sort();
    return k.length ? "📂 Suas pastas:\n" + k.map(x => "• " + x + " (" + c[x] + ")").join("\n") : "Ainda não há pastas. Use /pasta Nome.";
  }
  m = t.match(/^\/mover\s+(.+?)\s+para\s+(.+)$/i);
  if (m) {
    const L = lf(), n = m[1].trim().toLowerCase(), a = L.find(x => x.nome.toLowerCase() === n) || L.find(x => x.nome.toLowerCase().includes(n));
    if (!a) return "Não achei esse arquivo. Veja com /arquivos";
    a.pasta = m[2].trim().replace(/\s*\/\s*/g, "/"); sf(L);
    return "📦 Movi “" + a.nome + "” para " + a.pasta;
  }
  return null;
}

/* ---------- ler/analisar/explicar/encadear o texto atual ---------- */
function revisar(t) {
  const p = [];
  if (/localStorage\.getItem/.test(t) && !/try\s*\{/.test(t)) p.push("Usa localStorage sem try/catch (pode quebrar em modo privado).");
  if (/fetch\(/.test(t) && !/catch/.test(t)) p.push("Faz fetch sem tratar erro (catch).");
  if (/\bvar\s/.test(t)) p.push("Usa var; prefira let/const.");
  if (/[^=!]==[^=]/.test(t)) p.push("Usa == ; prefira === para comparar.");
  if (/\beval\s*\(|new\s+Function\s*\(/.test(t)) p.push("Usa eval/Function dinâmica (risco de segurança).");
  const a = (t.match(/\{/g) || []).length, b = (t.match(/\}/g) || []).length;
  if (a !== b) p.push("Chaves desbalanceadas: " + a + " “{” e " + b + " “}”.");
  const x = (t.match(/\(/g) || []).length, y = (t.match(/\)/g) || []).length;
  if (x !== y) p.push("Parênteses desbalanceados: " + x + " “(” e " + y + " “)”.");
  if (/\bTODO\b|\bFIXME\b/.test(t)) p.push("Tem TODO/FIXME pendentes.");
  return "🔍 Revisão rápida do código (" + t.split("\n").length + " linhas):\n" + (p.length ? p.map(s => "• " + s).join("\n") : "• Não achei problemas óbvios.") +
    "\n\nObs.: sou uma revisão estática por regras; não executo o código.";
}

function cadeiaCodigoLocal(t) {
  const funcs = new Set();
  for (const m of t.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)) funcs.add(m[1]);
  for (const m of t.matchAll(/(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?[^=;(]*\)?\s*=>/g)) funcs.add(m[1]);
  for (const m of t.matchAll(/\bdef\s+([A-Za-z_]\w*)/g)) funcs.add(m[1]);

  const exportsMatch = t.match(/export\s+const\s+([A-Za-z_$][\w$]*)/) || t.match(/export\s+\{\s*([^}]+)\}/);
  const expNome = exportsMatch ? exportsMatch[1].trim() : "Modulo";
  const arq = (ctx.nome || "modulo.js").replace(/\s+/g, "-").toLowerCase();
  const listaFuncs = [...funcs].slice(0, 12);

  const blocoExemplo = "import { " + expNome + " } from \"./" + (arq.endsWith(".js") ? arq : arq + ".js") + "\";\n\n" +
    "// Fluxo encadeado usando o código enviado:\n" +
    "async function executarFluxo(entrada) {\n" +
    "  // Funções internas detectadas: " + (listaFuncs.join(", ") || "bloco direto") + "\n" +
    "  console.log(\"Módulo carregado:\", " + expNome + ");\n" +
    "  return " + expNome + ";\n" +
    "}";

  return "🔗 **Cadeia de uso para “" + (ctx.nome || "seu código") + "”:**\n\n" +
    "Funções encontradas (" + funcs.size + "): " + (listaFuncs.join(" → ") || "nenhuma função nomeada") + "\n\n" +
    "Aqui está um modelo pronto para copiar e encadear no seu projeto:\n\n" +
    BT + "js\n" + blocoExemplo + "\n" + BT +
    "\n\n💡 Se quiser copiar o código original inteiro de volta, diga “manda o código de novo”.";
}

function explicarCodigoLocal(t) {
  const linhas = t.split("\n").length;
  const partes = [];
  if (/<!doctype html>|<html|<head|<body|<style|<script/i.test(t)) partes.push("• Monta uma página web completa (HTML com estrutura da tela, estilos CSS e lógica em JavaScript).");
  if (/\bimport\b/.test(t)) partes.push("• Importa funções, módulos ou dados de outros arquivos.");
  if (/\bexport\b/.test(t)) partes.push("• Exporta funções/objetos para serem usados em outros módulos.");
  if (/localStorage/.test(t)) partes.push("• Salva e carrega dados localmente no navegador (localStorage).");
  if (/fetch\(/.test(t)) partes.push("• Faz chamadas na internet/APIs usando fetch().");
  if (/addEventListener|onclick|onkeydown|onchange/.test(t)) partes.push("• Reage a ações do usuário na tela (cliques, envio de arquivos, teclado, voz).");
  if (/RegExp|\.test\(|\.match\(|\.replace\(/.test(t)) partes.push("• Usa expressões regulares (regex) para interpretar frases, limpar texto ou procurar padrões.");
  if (/try\s*\{[\s\S]*catch/.test(t)) partes.push("• Usa blocos try/catch para evitar que erros quebrem o app.");
  if (/async\s+function|await\s+/.test(t)) partes.push("• Executa tarefas assíncronas (async/await), esperando respostas da rede ou leitura de arquivos sem travar a tela.");
  if (/if\s*\(/.test(t)) partes.push("• Toma decisões com condicionais (if/else) para escolher qual resposta ou ação executar.");
  if (/\b(for|while)\s*\(|\.forEach\(|\.map\(|\.filter\(/.test(t)) partes.push("• Percorre listas ou repete ações com loops e métodos de array.");

  const leitura = Saber.lerTexto(t);
  return "🧠 Explicação de **" + ctx.nome + "** (" + linhas + " linhas):\n\n" +
    leitura +
    (partes.length ? "\n\n⚙️ O que esses códigos fazem na prática:\n" + partes.join("\n") : "") +
    "\n\n💡 Diga “revisar” para caçar erros, “cadeia de códigos” para ligar em outro arquivo ou “resumir” para encurtar.";
}

function sobreTexto(p) {
  const t = ctx.texto, cod = Saber.isCode(t);
  if (has(p, /escrito|diz|leia|aqui|foto|imagem|print/)) {
    return "📝 Texto lido em **" + (ctx.nome || "arquivo recente") + "**:\n\n“" + t.slice(0, 2000) + "”";
  }
  if (cod && has(p, /cadeia|ligar|importar|como usar|copiar|estrutura|fluxo/)) return cadeiaCodigoLocal(t);
  if (has(p, /resum/)) {
    const r = Saber.summarize(t, 4);
    return r.length ? "📝 Resumo de " + ctx.nome + ":\n• " + r.join("\n• ") : Saber.lerTexto(t);
  }
  if (cod && has(p, /erro|problema|bug|revis|melhor|conserta|arruma/)) return revisar(t);
  if (cod && has(p, /explic|o que faz|faz o que|fazem o que|o que fazem|para que serve|pra que serve|entend|como funciona|o que e/)) return explicarCodigoLocal(t);
  return "📄 " + ctx.nome + "\n" + Saber.lerTexto(t) + "\n\nPosso também: explicar em detalhes, montar uma cadeia de uso, resumir ou revisar o código.";
}

/* ---------- jogos no chat ---------- */
const PAL = "computador programacao javascript internet teclado algoritmo navegador variavel funcao servidor python aplicativo memoria pesquisa inteligencia arquivo biblioteca notebook".split(" ");
const QUIZ = [
  ["Qual linguagem roda no navegador?", ["Python", "JavaScript", "SQL"], 1],
  ["O que significa HTML?", ["Linguagem de marcação de hipertexto", "Banco de dados", "Editor de fotos"], 0],
  ["Qual comando mostra algo no console do JS?", ["print()", "echo", "console.log()"], 2],
  ["Quanto é 7 x 8?", ["54", "56", "64"], 1],
  ["Qual é a capital do Brasil?", ["Rio de Janeiro", "São Paulo", "Brasília"], 2],
  ["CSS serve para...", ["estilo e aparência", "guardar dados", "criar servidores"], 0]
];
const LV = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const venc = b => { for (const [a, c, d] of LV) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.includes("") ? null : "E"; };
function mm(b, p) {
  const r = venc(b); if (r) return { s: r === "O" ? 1 : r === "X" ? -1 : 0 };
  let best = null;
  for (let i = 0; i < 9; i++) if (!b[i]) { b[i] = p; const s = mm(b, p === "O" ? "X" : "O").s; b[i] = ""; if (!best || (p === "O" ? s > best.s : s < best.s)) best = { s, i }; }
  return best;
}
const tab = b => [0, 3, 6].map(i => [0, 1, 2].map(j => b[i + j] === "X" ? "❌" : b[i + j] === "O" ? "⭕" : ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"][i + j]).join(" ")).join("\n");
const forca = j => "Palavra: " + j.p.split("").map(c => j.ok.includes(c) ? c : "_").join(" ") + "\nVidas: " + "❤️".repeat(6 - j.er.length) + (j.er.length ? "\nErros: " + j.er.join(" ") : "");
const MENU = "🎮 Escolha um jogo:\n• forca\n• jogo da velha\n• adivinhe o número\n• quiz\n\nDiga, por exemplo: jogar forca. (Para sair: sair)";
const perg = i => (i + 1) + ") " + QUIZ[i][0] + "\n" + QUIZ[i][1].map((o, k) => "abc"[k] + ") " + o).join("\n");

function iniciar(p) {
  if (has(p, /\bforca\b/)) { ctx.jogo = { t: "forca", p: pick(PAL), ok: [], er: [] }; return "🪢 FORCA! Mande uma letra (ou chute a palavra inteira).\n\n" + forca(ctx.jogo); }
  if (has(p, /\bvelha\b/)) { ctx.jogo = { t: "velha", b: Array(9).fill("") }; return "⭕❌ JOGO DA VELHA! Você é ❌. Mande o número da casa:\n\n" + tab(ctx.jogo.b); }
  if (has(p, /\badivinh/)) { ctx.jogo = { t: "num", n: 1 + Math.floor(Math.random() * 100), c: 0 }; return "🔢 Pensei num número de 1 a 100. Qual é?"; }
  if (has(p, /\bquiz\b/)) { ctx.jogo = { t: "quiz", i: 0, pts: 0 }; return "🧠 QUIZ!\n\n" + perg(0); }
  return MENU;
}

function jogar(p, raw) {
  const j = ctx.jogo, w = p.trim();
  const rawClean = normSimples(raw).trim();
  if (/^(sair|parar|desistir|chega)$/.test(rawClean) || /^(sair|parar|desistir|chega)$/.test(w)) { ctx.jogo = null; return "Jogo encerrado. Quando quiser, é só dizer: jogar ..."; }
  if (rawClean.split(/\s+/).length > 2) return null;
  if (j.t === "forca") {
    const ch = rawClean.length === 1 && /[a-z]/.test(rawClean) ? rawClean : w;
    if (ch.length === 1 && /[a-z]/.test(ch)) {
      if (j.ok.includes(ch) || j.er.includes(ch)) return "Você já tentou “" + ch + "”.\n\n" + forca(j);
      j.p.includes(ch) ? j.ok.push(ch) : j.er.push(ch);
    } else if (rawClean.length > 1 && /^[a-z]+$/.test(rawClean)) {
      if (rawClean === j.p) j.ok = [...j.p]; else j.er.push(rawClean.slice(0, 6) + "…");
    } else return "Mande uma letra.";
    if (j.p.split("").every(c => j.ok.includes(c))) { ctx.jogo = null; return "🎉 Acertou! A palavra era “" + j.p + "”."; }
    if (j.er.length >= 6) { ctx.jogo = null; return "💀 Perdeu! A palavra era “" + j.p + "”. Diga “jogar forca” para outra."; }
    return forca(j);
  }
  if (j.t === "velha") {
    const n = parseInt(rawClean, 10) - 1;
    if (!(n >= 0 && n < 9) || j.b[n]) return "Escolha uma casa livre de 1 a 9.\n\n" + tab(j.b);
    j.b[n] = "X"; let r = venc(j.b);
    if (!r) { j.b[mm(j.b, "O").i] = "O"; r = venc(j.b); }
    if (r) { ctx.jogo = null; return tab(j.b) + "\n\n" + (r === "E" ? "🤝 Empate!" : r === "X" ? "🎉 Você ganhou!" : "😎 Eu ganhei!"); }
    return tab(j.b);
  }
  if (j.t === "num") {
    const v = parseInt(rawClean, 10); if (isNaN(v)) return "Mande um número de 1 a 100.";
    j.c++; if (v === j.n) { ctx.jogo = null; return "🎉 Acertou em " + j.c + " tentativa(s)!"; }
    return v < j.n ? "⬆️ Maior!" : "⬇️ Menor!";
  }
  if (j.t === "quiz") {
    const k = "abc".indexOf(rawClean[0]); if (k < 0 || rawClean.length > 2) return "Responda com a, b ou c.";
    const q = QUIZ[j.i], ok = k === q[2]; if (ok) j.pts++;
    const fb = ok ? "✅ Certo!" : "❌ Errado. Era: " + q[1][q[2]];
    if (++j.i >= QUIZ.length) { ctx.jogo = null; return fb + "\n\n🏁 Fim! Você fez " + j.pts + "/" + QUIZ.length + " pontos."; }
    return fb + "\n\n" + perg(j.i);
  }
  return null;
}

/* ---------- criar apps/jogos/telas (sem eval ou Function) ---------- */
const H = (titulo, css, corpo) => "<!DOCTYPE html><html lang=\"pt-BR\"><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>" + titulo + "</title><style>body{font-family:Arial;background:#10111a;color:#fff;text-align:center}button{border:0;border-radius:10px;background:#7864ed;color:#fff}" + css + "</style>" + corpo + "</html>";
const TEMPLATES = {
  velha: ["jogo-da-velha.html", H("Jogo da Velha", "#t{display:grid;grid-template-columns:repeat(3,90px);gap:6px;justify-content:center;margin:20px}#t button{height:90px;font-size:40px}", "<h2>Jogo da Velha</h2><p id=m></p><div id=t></div><button onclick=novo() style=padding:10px>Reiniciar</button><script>let b,fim;const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];function v(b){for(const[a,c,d]of L)if(b[a]&&b[a]==b[c]&&b[a]==b[d])return b[a];return b.includes('')?null:'E'}function mm(b,p){const r=v(b);if(r)return{s:r=='O'?1:r=='X'?-1:0};let best=null;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;const s=mm(b,p=='O'?'X':'O').s;b[i]='';if(!best||(p=='O'?s>best.s:s<best.s))best={s,i}}return best}function desenha(){t.innerHTML='';b.forEach((x,i)=>{const e=document.createElement('button');e.textContent=x;e.onclick=()=>jogar(i);t.append(e)})}function jogar(i){if(fim||b[i])return;b[i]='X';let r=v(b);if(!r){b[mm(b,'O').i]='O';r=v(b)}desenha();if(r){fim=1;m.textContent=r=='E'?'Empate!':r=='X'?'Você ganhou!':'Eu ganhei!'}}function novo(){b=Array(9).fill('');fim=0;m.textContent='Sua vez (X)';desenha()}novo()</script>")],
  calculadora: ["calculadora.html", H("Calculadora", "#c{width:280px;margin:30px auto}#d{width:100%;font-size:28px;text-align:right;padding:12px;box-sizing:border-box;border-radius:10px;border:0}#g{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}#g button{padding:16px;font-size:20px}", "<div id=c><input id=d readonly><div id=g></div></div><script>function calc(s){if(!/^[0-9.+\\-*/() ]+$/.test(s))throw 1;let p=0,t=s.match(/\\d+(?:\\.\\d+)?|[()+\\-*/]/g)||[];const pk=()=>t[p],tk=()=>t[p++];function pr(){const x=tk();if(x=='('){const v=ad();if(tk()!=')')throw 1;return v}return Number(x)}function un(){return pk()=='-'?(tk(),-un()):pr()}function ml(){let v=un();while(pk()=='*'||pk()=='/'){const o=tk(),r=un();if(o=='/'&&r==0)throw 1;v=o=='*'?v*r:v/r}return v}function ad(){let v=ml();while(pk()=='+'||pk()=='-'){const o=tk(),r=ml();v=o=='+'?v+r:v-r}return v}const res=ad();if(p!=t.length||!isFinite(res))throw 1;return Number(res.toPrecision(10))}'789/456*123-0.C+='.split('').forEach(k=>{const b=document.createElement('button');b.textContent=k;b.onclick=()=>{if(k=='C')d.value='';else if(k=='=')try{d.value=calc(d.value)}catch{d.value='Erro'}else d.value+=k};g.append(b)})</script>")],
  tarefas: ["tarefas.html", H("Tarefas", "body{max-width:420px;margin:20px auto;text-align:left;padding:0 12px}input{width:65%;padding:10px;border-radius:8px;border:0}button{padding:10px}li{margin:8px 0}.f{text-decoration:line-through;opacity:.5}", "<h2>Minhas tarefas</h2><input id=i placeholder='Nova tarefa'> <button onclick=add()>Adicionar</button><p style=font-size:12px>Toque = feita • Toque duplo = apagar</p><ul id=l></ul><script>let T=[];try{T=JSON.parse(localStorage.getItem('t')||'[]')}catch{}function r(){l.innerHTML='';T.forEach((x,n)=>{const e=document.createElement('li');e.textContent=x.t;if(x.f)e.className='f';e.onclick=()=>{x.f=!x.f;s()};e.ondblclick=()=>{T.splice(n,1);s()};l.append(e)})}function s(){try{localStorage.setItem('t',JSON.stringify(T))}catch{}r()}function add(){if(i.value.trim()){T.push({t:i.value.trim(),f:0});i.value='';s()}}r()</script>")],
  adivinhacao: ["adivinhe-o-numero.html", H("Adivinhe", "body{margin-top:40px}input,button{padding:12px;font-size:18px;border-radius:8px;border:0}", "<h2>Adivinhe o número (1 a 100)</h2><input id=n type=number> <button onclick=t()>Chutar</button><p id=m></p><script>let s=Math.ceil(Math.random()*100),c=0;function t(){const v=+n.value;c++;m.textContent=v==s?'Acertou em '+c+' tentativas! 🎉':v<s?'Maior ⬆️':'Menor ⬇️';if(v==s){s=Math.ceil(Math.random()*100);c=0}}</script>")],
  pagina: ["meu-site.html", H("Meu site", "header{padding:60px 20px;background:linear-gradient(#5141a0,#10111a)}button{padding:14px 22px;font-size:16px}section{padding:24px 20px;max-width:600px;margin:auto}", "<header><h1>Meu site</h1><p>Uma frase que explica o que você faz.</p><button onclick=\"alert('Olá!')\">Começar</button></header><section><h2>Sobre</h2><p>Escreva aqui sobre você ou seu projeto.</p></section>")]
};
function criar(p) {
  const k = has(p, /velha/) ? "velha" : has(p, /calculadora/) ? "calculadora" : has(p, /tarefa|todo|lista/) ? "tarefas" : has(p, /adivinh|numero/) ? "adivinhacao" : has(p, /site|pagina|tela|landing/) ? "pagina" : null;
  if (!k) return "Sei montar prontos: jogo da velha, calculadora, lista de tarefas, adivinhe o número e uma página/tela. Diga, por exemplo: crie uma calculadora.";
  const [nome, cod] = TEMPLATES[k];
  return "Aqui está o arquivo " + nome + ". Cole num arquivo com esse nome e abra no navegador (ou suba no GitHub Pages):\n\n" + BT + "html\n" + cod + "\n" + BT + "\n\nPara mudar cores e textos, edite o trecho <style> e os textos entre as tags.";
}

const PASSOS = [
  ["index.html: a tela do chat (campo, botão e área de mensagens)", "Crie um input, um botão e uma div. Ao clicar, pegue o texto, mostre na div e chame uma função responder(texto).\n\n" + BT + "html\n<div id=\"chat\"></div>\n<input id=\"i\"><button id=\"b\">Enviar</button>\n<script>\nb.onclick = () => {\n  chat.innerHTML += \"<p>\" + i.value + \"</p>\";\n  i.value = \"\";\n};\n</script>\n" + BT],
  ["brain.js: o cérebro (regras e intenção)", "Crie normalize(texto) (minúsculas, sem acento), uma lista de regras {padrão, resposta} e think(msg), que devolve a resposta da primeira regra que bater ou null.\n\n" + BT + "js\nconst regras = [{ p: /oi|ola/, r: \"Olá!\" }];\nexport const think = m => (regras.find(x => x.p.test(m)) || {}).r || null;\n" + BT],
  ["Memória: guardar o que ela aprende", "Use localStorage.setItem com JSON.stringify e carregue com JSON.parse dentro de try/catch. O comando ensine: pergunta => resposta guarda pares pergunta/resposta."],
  ["saber.js: pesquisar e resumir", "Faça fetch na API da Wikipédia (api.php?action=query&origin=*), pegue o texto e escolha as frases que têm as palavras da pergunta."],
  ["arquivos.js: pastas", "Salve objetos {nome, pasta, texto} numa lista no localStorage. /arquivos lista agrupando por pasta; nomes como Estudos/IA criam pastas dentro de pastas."],
  ["mente.js: contexto", "Guarde o último texto e o último assunto. Assim ela entende “esse texto”, “mais”, “detalhe” e “passo 3”."],
  ["Evoluir", "Adicione TF-IDF (palavras raras valem mais) para achar a resposta mais parecida, mais exemplos ensinados e modos especializados."]
];
const GUIA = "🤖 Como fazer uma IA do zero (o caminho da BACH):\n\n" + PASSOS.map((x, i) => (i + 1) + ") " + x[0]).join("\n") + "\n\nOrdem: 1 → 2 → 3, teste, e só depois 4 a 7.\nDiga “passo 1” (ou só o número) para ver o que colar.";

/* ---------- programação ---------- */
const LING = { javascript: "JavaScript", js: "JavaScript", python: "Python", html: "HTML", css: "CSS", sql: "SQL" };
const ROTEIRO = "🗺️ Roteiro: 1) variáveis e tipos, 2) condicionais, 3) loops, 4) funções, 5) arrays e objetos, 6) DOM e eventos (JS), 7) fetch/API e async, 8) um projeto pequeno. Depois: classes, módulos, testes e Git.\nPergunte por qualquer um (ex.: “o que é função?”). Diga “mais” para o nível avançado.";
const ASSUNTOS = "variáveis, condicionais, loops, funções, arrays, objetos/JSON, classes, async/await, DOM, fetch/API, closures, recursão, algoritmos, regex, Git, SQL, HTML, CSS, Python, módulos, localStorage, debug, testes, jogos, apps e IA";

const FRACA = new Set("for let var if map get post py ui def then this select join click clique evento eventos cores estilo lista listas jogo jogos game app aplicativo interface teste testes testar bug bugs dict tag tags estrutura scope push pull se senao".split(" "));
function achaTopico(p) {
  let best = null, sc = 0;
  KB.forEach((e, i) => {
    let s = 0;
    for (const k of e[0].split("|")) if (p.includes(" " + k + " ")) s += FRACA.has(k) ? 0.5 : k.length > 3 ? 2 : 1;
    if (s > sc) { sc = s; best = i; }
  });
  return sc >= 1 ? best : null;
}

const ACAO_TELA = /\b(cliquei|clique|cliquem|clicar|clica|cliquei nisso|toquei|toca|tocar|apertei|aperta|apertar|botao|menu|aba|tela|opcao)\b/;
function topico(i, p) {
  const [, b, ex, av] = KB[i], fundo = has(p, /avancad|profund|detalhad|completo/);
  ctx.ultimo = { t: "prog", i };
  const assunto = b.slice(3, 28);
  ctx.assuntos = (ctx.assuntos || []).filter(a => a !== assunto);
  ctx.assuntos.push(assunto);
  ctx.assuntos = ctx.assuntos.slice(-10);
  persist();
  return b + "\n\n" + BT + (i === 17 ? "python" : "js") + "\n" + ex + "\n" + BT + (fundo ? "\n\n" + av : "\n\nDiga “mais” para o nível avançado ou “outro exemplo”.");
}
function seguimento(p, w) {
  const u = ctx.ultimo; if (!u) return null;
  if (u.t === "guia") {
    const n = (w.match(/^(?:passo\s*)?(\d)$/) || w.match(/^passo (\d)/) || [])[1];
    if (n && PASSOS[n - 1]) return "📌 Passo " + n + " — " + PASSOS[n - 1][0] + "\n\n" + PASSOS[n - 1][1];
    if (has(p, /^ ?(detalh\w*|mais|explica\w*|continue|sim|quero|pode) ?$/)) return "Qual passo? Diga “passo 1” até “passo 7”.\n\n" + PASSOS.map((x, i) => (i + 1) + ") " + x[0]).join("\n");
  }
  if (u.t === "prog" && KB[u.i]) {
    if (has(p, /^ ?(mais|avancado|avancada|aprofunda|aprofundar|detalhe|detalhes|detalhar|explica melhor|continue|continua|e mais|sim|quero) ?$/)) return KB[u.i][3];
    if (has(p, /^ ?(exemplo|outro exemplo|mostra|mostre|codigo|me mostra) ?$/)) return BT + "js\n" + KB[u.i][2] + "\n" + BT + "\nTente mudar os valores e ver o que acontece. 😉";
  }
  return null;
}
function ajudaProg() {
  ctx.esperando = "prog"; persist();
  return "Claro! 💻 Me diga o que você quer:\n• aprender um assunto (ex.: “o que é função?”)\n• corrigir um erro (cole a mensagem de erro ou o código)\n• criar algo (ex.: “crie uma calculadora”)\n\nLinguagens que conheço: JavaScript, Python, HTML, CSS e SQL.\nAssuntos: " + ASSUNTOS + ".";
}

/* ---------- principal ---------- */
function responder(msg) {
  const raw = String(msg || "").trim();
  const cp = comandoPasta(raw); if (cp) return { texto: cp, origem: "📂 pastas" };
  const mv = raw.match(/^\/palavra\s+(\S+)\s*=\s*(.+)$/i);
  if (mv) {
    const k = normSimples(mv[1]);
    ctx.vocab[k] = prep(mv[2]).trim();
    persist();
    return { texto: "📚 Aprendi: “" + k + "” = “" + ctx.vocab[k] + "”.\nAgora entendo isso em qualquer frase.", origem: "📚 vocabulário" };
  }
  if (/^\/palavras$/i.test(raw)) {
    return { texto: "📚 Sei " + (Object.keys(VOCAB).length + Object.keys(ctx.vocab).length) + " gírias/abreviações e " + lexico().size + " palavras no dicionário base.\nEnsine mais: /palavra tbm = também", origem: "📚 vocabulário" };
  }
  if (raw.length > 260) return null;
  const p = prep(raw), w = p.trim();

  if (ctx.jogo) { const r = jogar(w, raw); if (r) return { texto: r, origem: "🎮 jogo" }; }

  const sg = seguimento(p, w); if (sg) return { texto: sg, origem: "🧠 lembrei do assunto" };
  const criarV = has(p, / (cria|crie|criar|faz|faca|fazer|monta|monte|gera|gere|programa|programe|constroi) /);
  if (criarV && has(p, / (jogo|jogos|app|aplicativo|tela|site|pagina|calculadora|tarefas|lista de tarefas|landing) /)) return { texto: criar(p), origem: "🛠️ criador de apps" };

  const nomeJogo = w.split(" ").length <= 5 && has(p, /\b(forca|jogo da velha|velha|adivinhe|quiz)\b/) && !criarV;
  if ((has(p, / (jogar|joguinho|jogo|brincar) /) || nomeJogo) && !criarV) return { texto: iniciar(p), origem: "🎮 jogos" };

  if (criarV && has(p, / (ia|inteligencia artificial|chatbot|bot) /)) return { texto: (ctx.ultimo = { t: "guia" }, persist(), GUIA), origem: "🤖 guia" };
  if (has(p, /(como|onde) (comeco|comecar|faco|fazer).*(ia|chatbot)/)) return { texto: (ctx.ultimo = { t: "guia" }, persist(), GUIA), origem: "🤖 guia" };

  const m = p.match(/ (?:escreve|escreva|redija|faz|faca|crie|cria) (?:um |uma )?(?:texto|redacao|artigo|resumo) (?:sobre|de|do|da) (.+)/);
  if (m && !has(p, / (livro|filme|serie|historia|conto|desenho|novela|anime) /)) return { pesquisa: m[1].trim(), fundo: true };
  if (has(p, / (email|carta) /) && criarV) {
    const t = (p.match(/ sobre (.+)/) || [])[1] || "[assunto]";
    return { texto: "✉️ Modelo:\n\nAssunto: " + t + "\n\nOlá,\n\nEspero que esteja bem. Escrevo para tratar de " + t + ".\n\n[explique seu pedido em 2 ou 3 frases]\n\nFico à disposição e agradeço desde já.\n\nAtenciosamente,\n[seu nome]", origem: "✍️ escrita" };
  }

  if (has(p, / (exclu\w*|apag\w*|deleta\w*) /) && has(p, / (isso|esse texto|esse arquivo|ele|este) /)) {
    if (!ctx.nome) return { texto: "Não tenho nenhum arquivo recente guardado pra apagar. Veja os nomes com /arquivos e use /apagar nome.", origem: "📂 arquivos" };
    return { apagar: ctx.nome };
  }
  if (has(p, / (manda|mande|envia|reenvia|repete|coloca) /) && has(p, / (codigo|codigos|texto|isso|arquivo) /) && has(p, / (de novo|novamente|outra vez|ai|aqui) /)) {
    if (!ctx.texto) return { texto: "Não tenho nenhum texto ou código guardado agora. Cole ou anexe de novo. 📎", origem: "🧠 contexto" };
    const lang = Saber.isCode(ctx.texto) ? "js" : "txt";
    return { texto: "📄 " + ctx.nome + "\n\n" + BT + lang + "\n" + ctx.texto.slice(0, 3500) + (ctx.texto.length > 3500 ? "\n\n[...]" : "") + "\n" + BT, origem: "📄 reenvio" };
  }

  if (ctx.ultimoMidia && (!ctx.texto) && has(p, / (esse|essa|esses|essas|este|nesse|nessa) /) && has(p, / (filme|video|cena|imagem|foto|pessoa|objeto|lugar) /)) {
    return {
      texto: ctx.ultimoMidia.tipo === "video"
        ? "Nesse vídeo analisei duração, resolução, iluminação, cores e eventuais textos visíveis nos quadros. 🎬"
        : "Nessa imagem analisei dimensões, iluminação, cores e procurei texto escrito, mas não encontrei texto legível nela. 🖼️",
      origem: "🧠 contexto"
    };
  }

  const PEDIDO_TEXTO_BARE = /^ ?((me\s+)?explic\w*|resum\w*|revis\w*|analis\w*|conserta\w*|arruma\w*|o que (e|faz|fazem|esta escrito) (isso|aqui)|cadeia de codigos?)(\s+(isso|esse texto|esse codigo|esses codigos|o codigo|os codigos|o texto|essa imagem|essa foto))? ?$/;
  const REF_ARQUIVO = / (esse|este|esses|estes|isso|aqui|texto|textos|codigo|codigos|arquivo|arquivos|ele|eles|imagem|foto|print|cadeia) /;
  const ACAO_ARQUIVO = /(o que e|o que faz|faz o que|fazem o que|o que fazem|para que serve|pra que serve|como funciona|explica|explique|resum|erro|problema|entend|leia|le |analis|revis|conserta|arruma|escrito|diz|cadeia|copiar|usar)/;
  if (PEDIDO_TEXTO_BARE.test(p) || (has(p, REF_ARQUIVO) && has(p, ACAO_ARQUIVO))) {
    if (ctx.texto) return { texto: sobreTexto(p), origem: "📖 leitura do seu arquivo" };
    if (ctx.ultimoMidia) return { texto: "Na última mídia (“" + ctx.ultimoMidia.nome + "”) não encontrei texto legível para explicar. 🖼️", origem: "🧠 contexto" };
    if (ctx.tema) return { pesquisa: ctx.tema, fundo: true };
    return { texto: "O que você quer que eu explique? Cole o texto/código aqui, envie uma foto pelo + ou me diga o assunto. 🤔", origem: "🧠 contexto" };
  }

  if (has(p, /(o que (a gente |nos |voce )?(falou|falamos|conversou|conversamos|vimos)|voce lembra|lembra do que|do que falamos)/))
    return { texto: ctx.assuntos.length ? "🧠 Lembro que falamos de:\n• " + ctx.assuntos.join("\n• ") + (ctx.texto ? "\n\nE guardei o texto “" + ctx.nome + "”." : "") : "Ainda não conversamos sobre nada que eu tenha guardado. 😊", origem: "🧠 memória" };

  for (const [k, r] of ERROS) if (new RegExp(k, "i").test(raw)) return { texto: "🛠️ " + r + "\n\nSe quiser, cole o código e eu reviso.", origem: "🐛 erros comuns" };

  const rb = p.match(/ resum\w* (?:de |do |da )?(?:um |uma |o |a )?(livro|filme|serie|historia|conto|desenho|novela|anime) (?:de |do |da |chamado |chamada )?(.+)/);
  if (rb) { lembrarTema(rb[2].trim()); return { pesquisa: rb[2].trim() + " sinopse", fundo: true }; }

  if (has(p, / (noticia|noticias|novidades|novidade|manchete|manchetes|acontecendo) /)) { ctx.tema = "noticias"; return { noticias: true, q: has(p, / brasil /) ? "ultimas noticias do brasil hoje" : "ultimas noticias do mundo hoje" }; }

  const ti = ACAO_TELA.test(p) ? null : achaTopico(p);
  if (ti !== null) return { texto: topico(ti, p), origem: "💻 programação" };
  const lg = Object.keys(LING).find(l => w === l);
  if (lg) return { texto: "📘 " + LING[lg] + "\n\n" + ROTEIRO, origem: "💻 programação" };
  if (has(p, /(programa|codigo|codar|codificar|desenvolv)/) && has(p, /(ajud|ensin|aprend|duvida|como|quero|preciso)/)) return { texto: ajudaProg(), origem: "💻 programação" };

  const cap = p.match(/^ (?:voce )?(?:sabe|consegue|pode|poderia|sabe me) (.+)/);
  if (cap && !has(p, / (horas|hora) /)) {
    const x = cap[1].trim();
    if (has(p, / (programar|codigo|codar|jogar|resumir|pesquisar|escrever|criar|calcular|ler|traduzir|rir) /) && !has(p, / (quadro|desenho|musica|carro|cozinhar|dancar|cantar) /)) {
      if (/\brir\b/.test(x)) return { texto: "Haha claro! 😂😂 Manda uma piada ou pede “conta uma piada”!", origem: "😄 humor" };
      return { texto: "Sim! 😊 Eu sei: programar, jogar (forca, velha, quiz, adivinhação), resumir e revisar textos, recomendar filmes/animes/músicas, pesquisar na internet, traduzir idiomas e ler fotos/vídeos.", origem: "🧠 minhas habilidades" };
    }
    const tmCap = tema(x) || x;
    if (tmCap.length >= 2) { lembrarTema(tmCap); return { pesquisa: tmCap, fundo: true }; }
  }

  if (ctx.tema && has(p, / (essa|essas|esse|esses|isso|isto|disso|dele|dela|deles|delas|nisso|aquilo|ele|ela|eles|elas) /) && (pergunta(raw) || has(p, / (faz|fazem|serve|servem|significa) /))) {
    const PR = new Set("essa essas esse esses isso isto disso dele dela deles delas nisso aquilo ele ela eles elas faz fazem fazer serve servem o que e sao por para qual quais como me explica".split(" "));
    const seen = new Set(prep(ctx.tema).split(" ")), novo = p.trim().split(" ").filter(x => !PR.has(x) && !seen.has(x) && x.length > 2);
    if (!novo.length) return { texto: "Estamos falando de “" + ctx.tema + "”. O que você quer saber sobre isso? Por exemplo: significado, origem, como funciona ou para que serve. 🤔", origem: "🧠 lembrei do assunto" };
    return { pesquisa: ctx.tema + " " + novo.join(" "), fundo: true };
  }

  if (pergunta(raw) && !has(p, / (voce|horas|hora|dia|data|bach|meu nome|seu nome) /)) {
    const tm = tema(raw);
    if (tm.length >= 2) {
      lembrarTema(tm);
      return { pesquisa: raw, fundo: true };
    }
  }

  if (ctx.esperando === "prog") { ctx.esperando = null; if (w.split(" ").length <= 3 && w.length > 3) return { pesquisa: w + " programação", fundo: false }; }
  return null;
}

const SMALL = /(tudo bem|como vai|como voce|e voce|bom dia|boa tarde|boa noite|voce esta|voce e |que bom|tudo certo|vamos falar sobre|falar sobre o que|nao foi isso|travou foi|sabe rir|velho do ceu|conversa comigo)/;
const pergunta = t => {
  const p = prep(t);
  if (has(p, SMALL)) return false;
  return has(p, /^ ?(o que|quem|quais|qual|quantos|quantas|quanto|onde|quando|como|por que|porque|para que|me explica|explique|explica|fale sobre|fala sobre|fala de|me fala|diga)/) ||
    (/\?\s*$/.test(String(t)) && p.trim().split(" ").length >= 2);
};

const stats = () => ({ girias: Object.keys(VOCAB).length, lexBase: BASE_LEX.length, kbProg: KB.length, erros: ERROS.length, jogos: 4, modelosApps: Object.keys(TEMPLATES).length, pasta: ctx.pasta, tema: ctx.tema });
const jogando = () => !!ctx.jogo;
export const Mente = { jogando, responder, setTexto, setMidia, pasta, pergunta, tema, lembrarTema, stats };
