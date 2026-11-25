/* BACH AI 5.4 — REDE NEURAL PRÓPRIA (MLP 384 -> 64 -> 12 + Backpropagation + L2 + Recursos Linguísticos)
 * 100% desenvolvida no projeto, sem IAs externas.
 * - Extrai unigramas, radicais (stems), bigramas, 3-gramas de caracteres e 16 sinais estruturais do português.
 * - Treina em lotes assíncronos na inicialização para não travar a interface no celular.
 * - Migra exemplos aprendidos de v1/v2 e permite exportar pesos_neurais.json via /neural exportar.
 */

const K_NEURAL_V1 = "bach_neural_local_v1";
const K_NEURAL_V2 = "bach_neural_local_v2";
const K_NEURAL = "bach_neural_local_v3";

const DIM = 384;
const HASH_DIM = 368; // 368..383 reservados para sinais linguísticos explícitos
const HIDDEN = 64;

export const INTENCOES = [
  "saudacao",       // 0
  "habilidades",    // 1
  "pesquisa",       // 2
  "criar_app",      // 3
  "termux_dev",     // 4
  "reclamacao",     // 5
  "humor_jogo",     // 6
  "utilidades",     // 7
  "traducao_texto", // 8
  "recomendacao",   // 9
  "memoria_eu",     // 10
  "conversa_geral"  // 11
];

const BASE_TREINO = [
  // 0: saudacao
  ["oi", "saudacao"], ["ola", "saudacao"], ["oie", "saudacao"], ["bom dia", "saudacao"],
  ["boa tarde", "saudacao"], ["boa noite", "saudacao"], ["e ai tudo bem", "saudacao"],
  ["aqui ta tudo bem", "saudacao"], ["to bem e vc", "saudacao"], ["como voce esta", "saudacao"],
  ["oie bach", "saudacao"], ["salve bach", "saudacao"], ["opa tudo certo", "saudacao"],
  ["tudo bem por ai", "saudacao"], ["como vai voce", "saudacao"], ["eae como ta", "saudacao"],
  ["ola tudo bom", "saudacao"], ["oi gente", "saudacao"],

  // 1: habilidades
  ["o que voce sabe fazer", "habilidades"], ["no oq vc sabe", "habilidades"],
  ["no oq vc sabe fazer", "habilidades"], ["me fala oq vc entende", "habilidades"],
  ["do que voce entende", "habilidades"], ["para que voce serve", "habilidades"],
  ["quais sao suas funcoes", "habilidades"], ["o que voce consegue fazer", "habilidades"],
  ["vc auto corrige", "habilidades"], ["como funciona sua autocorrecao", "habilidades"],
  ["que dia voce foi criado", "habilidades"], ["quem criou voce", "habilidades"],
  ["quais comandos existem", "habilidades"], ["como voce funciona por dentro", "habilidades"],
  ["voce tem rede neural", "habilidades"], ["o que a bach ai faz", "habilidades"],
  ["quais sao seus limites", "habilidades"], ["quem e seu criador", "habilidades"],

  // 2: pesquisa
  ["pesquise sobre buraco negro", "pesquisa"], ["pesquisa como melhorar uma ia sozinha", "pesquisa"],
  ["quem foi adao e eva", "pesquisa"], ["qm foi eva", "pesquisa"], ["qm foi albert einstein", "pesquisa"],
  ["o que e fotossintese", "pesquisa"], ["me fala do sol", "pesquisa"],
  ["qual a distancia da terra ate marte", "pesquisa"], ["historia da segunda guerra", "pesquisa"],
  ["quem inventou o aviao", "pesquisa"], ["oq eu queria era para vc pesquisar", "pesquisa"],
  ["como dormir confortavel na gravidez", "pesquisa"], ["qual a formula de pi", "pesquisa"],
  ["de qual fruta e feito o chocolate", "pesquisa"], ["sereias existem", "pesquisa"],
  ["quantos episodios lancados tem one piece", "pesquisa"], ["qual o nome dos membros do bts", "pesquisa"],
  ["quantos dentes tem um ser humano adulto", "pesquisa"], ["como fazer um bolo de chocolate", "pesquisa"],
  ["o que e crispr", "pesquisa"], ["como funciona docker", "pesquisa"],
  ["o que e efeito estufa", "pesquisa"], ["qual a capital da franca", "pesquisa"],
  ["por que o ceu e azul", "pesquisa"], ["o que e rag em ia", "pesquisa"],
  ["quem descobriu o brasil", "pesquisa"], ["quantos ossos tem o corpo humano", "pesquisa"],

  // 3: criar_app
  ["cria um app de pomodoro", "criar_app"], ["faz um aplicativo de notas", "criar_app"],
  ["crie um jogo da cobrinha", "criar_app"], ["cria uma calculadora html", "criar_app"],
  ["abre meu painel de gastos", "criar_app"], ["quero criar um app", "criar_app"],
  ["monte uma tela de tarefas", "criar_app"], ["faz um site simples em html", "criar_app"],
  ["cria um painel de academia", "criar_app"], ["gera um aplicativo web de cronometro", "criar_app"],
  ["monta um jogo da velha em html", "criar_app"], ["quero fazer um aplicativo aqui", "criar_app"],
  ["crie um app para organizar estudos", "criar_app"], ["faz um controle financeiro html", "criar_app"],

  // 4: termux_dev
  ["como usar termux", "termux_dev"], ["instalar python no termux", "termux_dev"],
  ["abre terminal do termux aqui", "termux_dev"], ["abre o terminal", "termux_dev"],
  ["como criar script sh", "termux_dev"], ["o que e uma funcao em javascript", "termux_dev"],
  ["me ajuda a programar em python", "termux_dev"], ["revisar esse codigo js", "termux_dev"],
  ["como fazer commit no git", "termux_dev"], ["o que e um array em js", "termux_dev"],
  ["erro cannot read properties of undefined", "termux_dev"], ["como rodar servidor no termux", "termux_dev"],
  ["instalar nodejs no termux", "termux_dev"], ["o que e async await", "termux_dev"],
  ["converter cor hex para rgb", "termux_dev"], ["css efeito vidro transparente", "termux_dev"],

  // 5: reclamacao
  ["voce errou", "reclamacao"], ["respondeu errado", "reclamacao"], ["nada a ver isso", "reclamacao"],
  ["voce nao entende nada", "reclamacao"], ["nunca entende nada", "reclamacao"],
  ["vc e burro", "reclamacao"], ["para de errar", "reclamacao"],
  ["pse entt nao fala bosta", "reclamacao"], ["pqp que erro", "reclamacao"],
  ["so foca em melhorar", "reclamacao"], ["tu mandou tudo errado", "reclamacao"],
  ["nao pedi pra pesquisar", "reclamacao"], ["fugiu do assunto", "reclamacao"],
  ["resposta muito vaga", "reclamacao"], ["para de repetir a mesma coisa", "reclamacao"],
  ["que resposta ruim", "reclamacao"], ["nao foi isso que perguntei", "reclamacao"],
  ["ta tudo bugado", "reclamacao"],

  // 6: humor_jogo
  ["conta uma piada", "humor_jogo"], ["vamos jogar forca", "humor_jogo"],
  ["jogar jogo da velha", "humor_jogo"], ["quero jogar quiz", "humor_jogo"],
  ["me manda uma charada", "humor_jogo"], ["me faz rir", "humor_jogo"],
  ["manda outra piada", "humor_jogo"], ["quero brincar de adivinhe o numero", "humor_jogo"],
  ["me conta algo engracado", "humor_jogo"], ["vamos jogar algum joguinho", "humor_jogo"],
  ["me distrai com uma charada", "humor_jogo"], ["faz um quiz de historia", "humor_jogo"],

  // 7: utilidades
  ["gera uma senha forte", "utilidades"], ["manda um cpf aleatorio de teste", "utilidades"],
  ["joga um dado d20", "utilidades"], ["cara ou coroa", "utilidades"],
  ["quanto e 15 por cento de 200", "utilidades"], ["converter 10 km para metros", "utilidades"],
  ["como esta o clima hoje", "utilidades"], ["previsao do tempo em sao paulo", "utilidades"],
  ["quantos dias faltam para o natal", "utilidades"], ["que dia cai o natal", "utilidades"],
  ["sorteia um numero de 1 a 50", "utilidades"], ["calcular meu imc", "utilidades"],
  ["quanta agua preciso beber por dia", "utilidades"], ["calcula juros compostos", "utilidades"],
  ["esse link e golpe", "utilidades"], ["que horas sao agora", "utilidades"],
  ["que dia e hoje", "utilidades"],

  // 8: traducao_texto
  ["traduz isso para portugues", "traducao_texto"], ["como se diz obrigado em japones", "traducao_texto"],
  ["o que significa efemero", "traducao_texto"], ["sinonimo de feliz", "traducao_texto"],
  ["revisa esse texto de portugues", "traducao_texto"], ["separe as silabas de computador", "traducao_texto"],
  ["antonimo de rapido", "traducao_texto"], ["traduzir good morning", "traducao_texto"],
  ["como escreve casa em frances", "traducao_texto"], ["corrige a ortografia desse texto", "traducao_texto"],
  ["qual o significado da giria paia", "traducao_texto"], ["separa as silabas de programacao", "traducao_texto"],

  // 9: recomendacao
  ["me recomenda filmes de acao", "recomendacao"], ["indica animes bons", "recomendacao"],
  ["recomenda musicas de sertanejo", "recomendacao"], ["quais series boas para assistir", "recomendacao"],
  ["me indica um filme de terror", "recomendacao"], ["sugere filmes de drama", "recomendacao"],
  ["quero ouvir rock nacional", "recomendacao"], ["indica um filme de comedia", "recomendacao"],
  ["quais melhores animes para comecar", "recomendacao"], ["recomenda musicas de rap", "recomendacao"],
  ["me indica uma serie de suspense", "recomendacao"], ["sugere filmes brasileiros", "recomendacao"],

  // 10: memoria_eu
  ["meu nome e rizik", "memoria_eu"], ["qual e meu nome", "memoria_eu"],
  ["o que voce lembra de mim", "memoria_eu"], ["do que nos falamos desde o inicio", "memoria_eu"],
  ["eu gosto de programacao", "memoria_eu"], ["lembra do comeco da conversa", "memoria_eu"],
  ["onde eu moro mesmo", "memoria_eu"], ["quantos anos eu tenho", "memoria_eu"],
  ["do que eu gosto", "memoria_eu"], ["quais assuntos ja conversamos", "memoria_eu"],
  ["eu moro em curitiba", "memoria_eu"], ["meu filme favorito e interestelar", "memoria_eu"],
  ["lembra da minha situacao", "memoria_eu"],

  // 11: conversa_geral
  ["muito obrigado pela ajuda", "conversa_geral"], ["tchau ate mais", "conversa_geral"],
  ["eu so te respondi", "conversa_geral"], ["so segue a conversa", "conversa_geral"],
  ["nao quero jogar agora", "conversa_geral"], ["me conta uma curiosidade", "conversa_geral"],
  ["entre essas duas qual e a melhor", "conversa_geral"], ["pode parar o timer", "conversa_geral"],
  ["acabei de acordar", "conversa_geral"], ["dormi bem hoje", "conversa_geral"],
  ["pergunta se eu dormi bem", "conversa_geral"], ["olha isso aqui", "conversa_geral"],
  ["nao quero testar comando", "conversa_geral"], ["so queria ter um dialogo bom", "conversa_geral"],
  ["fui mandado para o turno do dia", "conversa_geral"], ["eu trabalhava a noite que odio", "conversa_geral"],
  ["to muito cansado hoje", "conversa_geral"], ["to triste com umas coisas", "conversa_geral"],
  ["comprei um celular novo", "conversa_geral"], ["to sem dinheiro esse mes", "conversa_geral"],
  ["qual sua opiniao sobre redes sociais", "conversa_geral"], ["me da um conselho", "conversa_geral"],
  ["voce concorda com isso", "conversa_geral"], ["sim e ai", "conversa_geral"],
  ["aham entendi", "conversa_geral"], ["beleza valeu", "conversa_geral"]
];

function ehEntradaSensivel(texto) {
  const s = String(texto || "").trim();
  return /^\/(?:adm|admsenha|ghconfig|chave)\b/i.test(s) ||
    /@rizik2442/i.test(s) ||
    /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{12,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z\-_]{20,}\b/.test(s);
}

function norm(t) {
  return String(t || "").slice(0, 600).toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bqm\b/g, "quem")
    .replace(/\b(vc|vce|vv|oc|oce)\b/g, "voce")
    .replace(/\b(oq|oqe|oque)\b/g, "o que")
    .replace(/\bpq\b/g, "porque")
    .replace(/\b(tb|tbm|tmb)\b/g, "tambem")
    .replace(/\bcvs\b/g, "conversar")
    .replace(/\bpse\b/g, "pois e")
    .replace(/\bentt\b/g, "entao")
    .replace(/\bpra\b/g, "para")
    .replace(/\bhj\b/g, "hoje")
    .replace(/\bmsm\b/g, "mesmo")
    .replace(/\bnd\b/g, "nada")
    .replace(/\bss+\b/g, "sim")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stemPt(w) {
  if (w.length <= 4) return w;
  return w
    .replace(/(coes|oes|aes)$/, "ao")
    .replace(/(ando|endo|indo|mento|mente)$/, "")
    .replace(/(ar|er|ir|ou|ei|am|em)$/, "")
    .replace(/s$/, "");
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function vetorizar(texto) {
  const vec = new Float32Array(DIM);
  const raw = String(texto || "").slice(0, 600);
  const t = norm(raw);
  if (!t) return vec;

  const palavras = t.split(" ").filter(Boolean).slice(0, 80);
  for (let i = 0; i < palavras.length; i++) {
    const w = palavras[i];
    const st = stemPt(w);
    vec[hashStr("w:" + w) % HASH_DIM] += 1.6;
    if (st && st !== w) vec[hashStr("s:" + st) % HASH_DIM] += 0.9;
    if (i + 1 < palavras.length) {
      vec[hashStr("b:" + w + "_" + palavras[i + 1]) % HASH_DIM] += 1.35;
    }
    const pad = "#" + w + "#";
    for (let j = 0; j <= pad.length - 3; j++) {
      vec[hashStr("c:" + pad.slice(j, j + 3)) % HASH_DIM] += 0.45;
    }
  }

  // 16 sinais linguísticos estruturais (368..383)
  if (/\?/.test(raw) || /^(?:quem|qual|quais|como|onde|quando|porque|quanto|quantos|quantas|o que)\b/.test(t)) vec[368] = 1.4;
  if (/\b(nao|nem|nunca|jamais|nada)\b/.test(t)) vec[369] = 1.3;
  if (/\b(eu|meu|minha|meus|minhas|to|estou|tou|comigo|mim)\b/.test(t)) vec[370] = 1.2;
  if (/\b(voce|bach|tu)\b/.test(t)) vec[371] = 1.2;
  if (palavras.length <= 3) vec[372] = 1.1;
  if (palavras.length >= 8) vec[373] = 1.1;
  if (/\d/.test(raw)) vec[374] = 1.0;
  if (/\b(termux|terminal|bash|script|python|javascript|js|html|css|git|github|codigo|funcao|array|pkg|npm)\b/.test(t) || /[{}=><]/.test(raw)) vec[375] = 1.5;
  if (/\b(errou|errado|errando|burro|burra|idiota|lixo|ruim|bosta|merda|pqp|crlh|nada a ver|vaga|bugado|fugiu)\b/.test(t)) vec[376] = 1.7;
  if (/\b(cria|crie|criar|monta|monte|gera|gere|faz|faca|app|aplicativo|painel|tela)\b/.test(t)) vec[377] = 1.4;
  if (/\b(recomenda|recomende|indica|indique|sugere|sugira|filme|filmes|serie|series|anime|animes|musica|musicas)\b/.test(t)) vec[378] = 1.6;
  if (/^(?:oi|ola|oie|e ai|opa|salve|bom dia|boa tarde|boa noite)\b/.test(t)) vec[379] = 1.6;
  if (/\b(traduz|traduza|traduzir|traducao|significa|significado|sinonimo|antonimo|revisa|silaba|silabas|ortografia|ingles|japones|frances|espanhol)\b/.test(t)) vec[380] = 1.7;
  if (/\b(piada|charada|forca|velha|quiz|jogar|adivinhe|engracado|rir)\b/.test(t)) vec[381] = 1.6;
  if (/\b(senha|cpf|dado|moeda|sorteia|sortear|clima|previsao|tempo|chuva|dias|natal|imc|agua|juros|converter|golpe|horas|data)\b/.test(t)) vec[382] = 1.6;
  if (/\b(lembra|meu nome|moro|anos|gosto|favorito|turno|trabalho|trabalhava|odio|triste|cansado|acordei|dormi|conselho|opiniao)\b/.test(t)) vec[383] = 1.5;

  let norma = 0;
  for (let i = 0; i < DIM; i++) norma += vec[i] * vec[i];
  norma = Math.sqrt(norma) || 1;
  for (let i = 0; i < DIM; i++) vec[i] /= norma;
  return vec;
}

function semanticSimilarity(a, b) {
  const va = vetorizar(a);
  const vb = vetorizar(b);
  let dot = 0;
  for (let i = 0; i < DIM; i++) dot += va[i] * vb[i];
  return Math.max(0, Math.min(1, dot));
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function criarRede() {
  const rnd = mulberry32(542026);
  const escala1 = Math.sqrt(2 / (DIM + HIDDEN));
  const escala2 = Math.sqrt(2 / (HIDDEN + INTENCOES.length));

  const W1 = new Float32Array(DIM * HIDDEN);
  const b1 = new Float32Array(HIDDEN);
  const W2 = new Float32Array(HIDDEN * INTENCOES.length);
  const b2 = new Float32Array(INTENCOES.length);

  for (let i = 0; i < W1.length; i++) W1[i] = (rnd() * 2 - 1) * escala1;
  for (let i = 0; i < W2.length; i++) W2[i] = (rnd() * 2 - 1) * escala2;

  return { W1, b1, W2, b2, epochs: 0, acc: 0, source: "local-v3", extraSamples: [] };
}

let net = criarRede();
let pronto = false;
let bgTimer = null;

function forward(x) {
  const h = new Float32Array(HIDDEN);
  for (let j = 0; j < HIDDEN; j++) {
    let sum = net.b1[j];
    for (let i = 0; i < DIM; i++) {
      if (x[i] !== 0) sum += x[i] * net.W1[i * HIDDEN + j];
    }
    h[j] = Math.tanh(sum);
  }

  const outLen = INTENCOES.length;
  const logits = new Float32Array(outLen);
  let maxL = -Infinity;
  for (let k = 0; k < outLen; k++) {
    let sum = net.b2[k];
    for (let j = 0; j < HIDDEN; j++) sum += h[j] * net.W2[j * outLen + k];
    logits[k] = sum;
    if (sum > maxL) maxL = sum;
  }

  const probs = new Float32Array(outLen);
  let sumExp = 0;
  for (let k = 0; k < outLen; k++) {
    probs[k] = Math.exp(logits[k] - maxL);
    sumExp += probs[k];
  }
  for (let k = 0; k < outLen; k++) probs[k] /= sumExp || 1;

  return { h, probs };
}

function trainSample(texto, targetIdx, lr = 0.08) {
  const x = vetorizar(texto);
  const { h, probs } = forward(x);
  const outLen = INTENCOES.length;
  const decay = 0.00035;

  const dLogits = new Float32Array(outLen);
  for (let k = 0; k < outLen; k++) {
    dLogits[k] = probs[k] - (k === targetIdx ? 1 : 0);
  }

  const dH = new Float32Array(HIDDEN);
  for (let j = 0; j < HIDDEN; j++) {
    let err = 0;
    for (let k = 0; k < outLen; k++) {
      const idx = j * outLen + k;
      err += dLogits[k] * net.W2[idx];
      net.W2[idx] -= lr * (h[j] * dLogits[k] + decay * net.W2[idx]);
    }
    dH[j] = err * (1 - h[j] * h[j]);
  }
  for (let k = 0; k < outLen; k++) net.b2[k] -= lr * dLogits[k];

  for (let i = 0; i < DIM; i++) {
    if (x[i] === 0) continue;
    const base = i * HIDDEN;
    for (let j = 0; j < HIDDEN; j++) {
      net.W1[base + j] -= lr * (x[i] * dH[j] + decay * net.W1[base + j]);
    }
  }
  for (let j = 0; j < HIDDEN; j++) net.b1[j] -= lr * dH[j];

  return -Math.log(Math.max(probs[targetIdx], 1e-7));
}

function avaliarAcuracia(amostras) {
  let acertos = 0;
  for (const [txt, label] of amostras) {
    if (predict(txt).intent === label) acertos++;
  }
  return Math.round((acertos / (amostras.length || 1)) * 100);
}

function treinarLote(amostras = BASE_TREINO, epocas = 26, lr = 0.08) {
  const idxMap = new Map(INTENCOES.map((name, i) => [name, i]));
  const tudo = [...amostras, ...(net.extraSamples || [])].filter(x => Array.isArray(x) && idxMap.has(x[1]));
  let lastLoss = 0;

  for (let ep = 0; ep < epocas; ep++) {
    const taxa = lr * (1 - ep / (epocas * 1.25));
    const ordem = tudo.slice().sort(() => Math.random() - 0.5);
    let loss = 0;
    for (const [txt, label] of ordem) {
      loss += trainSample(txt, idxMap.get(label), taxa);
    }
    lastLoss = loss / (ordem.length || 1);
  }

  net.epochs += epocas;
  net.acc = avaliarAcuracia(tudo);
  salvarLocal();
  return { loss: Number(lastLoss.toFixed(4)), acc: net.acc, total: tudo.length };
}

function treinarEmSegundoPlano(epocasTotais = 22, lr = 0.075) {
  if (bgTimer) clearTimeout(bgTimer);
  const idxMap = new Map(INTENCOES.map((name, i) => [name, i]));
  const tudo = [...BASE_TREINO, ...(net.extraSamples || [])].filter(x => Array.isArray(x) && idxMap.has(x[1]));
  let feita = 0;

  function passoLote() {
    const bloco = Math.min(4, epocasTotais - feita);
    if (bloco <= 0) {
      net.acc = avaliarAcuracia(tudo);
      salvarLocal();
      bgTimer = null;
      return;
    }
    for (let ep = 0; ep < bloco; ep++) {
      const taxa = lr * (1 - (feita + ep) / (epocasTotais * 1.25));
      const ordem = tudo.slice().sort(() => Math.random() - 0.5);
      for (const [txt, label] of ordem) {
        trainSample(txt, idxMap.get(label), taxa);
      }
    }
    feita += bloco;
    net.epochs += bloco;
    net.acc = avaliarAcuracia(tudo);
    bgTimer = setTimeout(passoLote, 16);
  }

  bgTimer = setTimeout(passoLote, 16);
}

function serializarPesos() {
  const round = arr => Array.from(arr, v => Math.round(v * 10000) / 10000);
  return {
    v: 3,
    dim: DIM,
    hidden: HIDDEN,
    classes: INTENCOES.length,
    epochs: net.epochs,
    acc: net.acc,
    source: net.source,
    extraSamples: (net.extraSamples || []).slice(-160),
    W1: round(net.W1),
    b1: round(net.b1),
    W2: round(net.W2),
    b2: round(net.b2)
  };
}

function salvarLocal() {
  try {
    localStorage.setItem(K_NEURAL, JSON.stringify(serializarPesos()));
  } catch (e) { console.warn("Neural save:", e); }
}

function vetorValido(arr, tamanho) {
  if (!Array.isArray(arr) || arr.length !== tamanho) return false;
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "number" || !Number.isFinite(arr[i]) || Math.abs(arr[i]) > 1000) return false;
  }
  return true;
}

function filtrarAmostras(lista) {
  if (!Array.isArray(lista)) return [];
  const validas = new Set(INTENCOES);
  const out = [];
  for (const item of lista.slice(-160)) {
    if (
      Array.isArray(item) &&
      typeof item[0] === "string" &&
      typeof item[1] === "string" &&
      validas.has(item[1]) &&
      !ehEntradaSensivel(item[0])
    ) {
      out.push([item[0].trim().slice(0, 160), item[1]]);
    }
  }
  return out;
}

function carregarPayload(obj, sourceLabel) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  if (
    !vetorValido(obj.W1, DIM * HIDDEN) ||
    !vetorValido(obj.b1, HIDDEN) ||
    !vetorValido(obj.W2, HIDDEN * INTENCOES.length) ||
    !vetorValido(obj.b2, INTENCOES.length)
  ) {
    return false;
  }
  net.W1 = new Float32Array(obj.W1);
  net.b1 = new Float32Array(obj.b1);
  net.W2 = new Float32Array(obj.W2);
  net.b2 = new Float32Array(obj.b2);
  net.epochs = Number.isFinite(obj.epochs) && obj.epochs >= 0 ? Math.round(obj.epochs) : 0;
  net.acc = Number.isFinite(obj.acc) ? Math.max(0, Math.min(100, Math.round(obj.acc))) : 0;
  net.source = String(sourceLabel || obj.source || "pesos-carregados").replace(/[<>"'`]/g, "").slice(0, 40);
  net.extraSamples = filtrarAmostras(obj.extraSamples);
  return true;
}

function migrarExtrasAntigas() {
  const vistas = new Set();
  const extras = [];
  for (const key of [K_NEURAL_V1, K_NEURAL_V2]) {
    try {
      const ant = JSON.parse(localStorage.getItem(key) || "null");
      for (const item of filtrarAmostras(ant?.extraSamples)) {
        const k = norm(item[0]);
        if (k && !vistas.has(k)) {
          vistas.add(k);
          extras.push(item);
        }
      }
    } catch {}
  }
  return extras;
}

async function init() {
  if (pronto) return;
  pronto = true;

  let carregouNuvem = false;
  try {
    const r = await fetch("./pesos_neurais.json?v=" + Date.now());
    if (r.ok) {
      const json = await r.json();
      if (carregarPayload(json, "nuvem-github")) carregouNuvem = true;
    }
  } catch {}

  try {
    const local = JSON.parse(localStorage.getItem(K_NEURAL) || "null");
    if (local) {
      if (!carregouNuvem) {
        carregarPayload(local, local.source || "local-v3");
      } else {
        const extras = filtrarAmostras(local.extraSamples);
        if (extras.length) {
          net.extraSamples = extras;
          treinarLote(extras, 5, 0.05);
        }
      }
    } else {
      const migrados = migrarExtrasAntigas();
      if (migrados.length) net.extraSamples = migrados;
    }
  } catch {}

  if (net.epochs === 0) {
    // 6 épocas rápidas para resposta imediata + 22 em segundo plano sem travar a UI
    treinarLote(BASE_TREINO, 6, 0.09);
    treinarEmSegundoPlano(22, 0.075);
  }
}

function predict(texto) {
  const x = vetorizar(texto);
  const { probs } = forward(x);
  const ranking = INTENCOES.map((intent, i) => ({ intent, prob: probs[i] }))
    .sort((a, b) => b.prob - a.prob);
  return {
    intent: ranking[0].intent,
    confidence: ranking[0].prob,
    top3: ranking.slice(0, 3)
  };
}

function reinforce(texto, intencao) {
  const idx = INTENCOES.indexOf(intencao);
  const txt = String(texto || "").trim();
  if (idx < 0 || !txt || ehEntradaSensivel(txt)) return false;
  net.extraSamples = (net.extraSamples || []).filter(s => norm(s[0]) !== norm(txt));
  net.extraSamples.push([txt.slice(0, 160), intencao]);
  net.extraSamples = net.extraSamples.slice(-160);
  for (let i = 0; i < 12; i++) trainSample(txt, idx, 0.07);
  net.acc = avaliarAcuracia([...BASE_TREINO, ...net.extraSamples]);
  salvarLocal();
  return true;
}

function comando(raw) {
  const s = String(raw || "").trim();
  if (!/^\/neural\b/i.test(s)) return null;

  const arg = s.replace(/^\/neural\s*/i, "").trim();
  if (!arg || /^status$/i.test(arg)) {
    return "🧠 **REDE NEURAL PRÓPRIA DA BACH AI (v3.0)**\n\n" +
      "• Arquitetura: **MLP " + DIM + " → " + HIDDEN + " (tanh) → " + INTENCOES.length + " (softmax)**\n" +
      "• Origem dos pesos: `" + net.source + "`\n" +
      "• Épocas treinadas: **" + net.epochs + "**\n" +
      "• Exemplos base + aprendidos: **" + (BASE_TREINO.length + (net.extraSamples?.length || 0)) + "**\n" +
      "• Acurácia na base: **" + net.acc + "%**\n\n" +
      "Comandos:\n" +
      "• `/neural testar sua frase aqui`\n" +
      "• `/neural treinar` (re-treina completo no aparelho)\n" +
      "• `/neural ensinar Roii tudo bem? => saudacao`\n" +
      "• `/neural exportar` (gera `pesos_neurais.json` para o GitHub)";
  }

  let m = arg.match(/^testar\s+([\s\S]+)$/i);
  if (m) {
    const p = predict(m[1]);
    return "🧪 **Previsão Neural para “" + m[1] + "”:**\n\n" +
      p.top3.map((x, i) => (i + 1) + ". `" + x.intent + "` — **" + (x.prob * 100).toFixed(1) + "%**").join("\n");
  }

  if (/^treinar$/i.test(arg)) {
    if (bgTimer) { clearTimeout(bgTimer); bgTimer = null; }
    const res = treinarLote(BASE_TREINO, 26, 0.08);
    return "⚡ **Treinamento completo concluído!**\n• Exemplos: " + res.total + "\n• Loss: " + res.loss + "\n• Acurácia: **" + res.acc + "%**";
  }

  if (/^exportar$/i.test(arg)) {
    const payload = JSON.stringify(serializarPesos());
    return "📦 **Pesos da Rede Neural prontos (`pesos_neurais.json`):**\n" +
      "Salve este JSON na raiz do seu repositório com o nome `pesos_neurais.json` (ou use `/editar`):\n\n" +
      "```json\n" + payload + "\n```";
  }

  m = arg.match(/^ensinar\s+(.+?)\s*=>\s*([a-z_]+)$/i);
  if (m) {
    const ok = reinforce(m[1], m[2].toLowerCase());
    if (!ok) return "Categoria inválida ou conteúdo bloqueado. Use uma destas categorias:\n" + INTENCOES.map(x => "`" + x + "`").join(", ");
    return "✅ Rede neural treinada! Agora `" + m[1] + "` aponta para **`" + m[2].toLowerCase() + "`** (" + (predict(m[1]).confidence * 100).toFixed(1) + "% de confiança).";
  }

  if (/^ensinar\b/i.test(arg)) {
    return "🧠 Para ensinar a Rede Neural, coloque **`=>` e a categoria** no final!\n\n" +
      "Exemplo certo:\n`/neural ensinar Roii tudo bem? => saudacao`\n\n" +
      "Categorias válidas: " + INTENCOES.map(x => "`" + x + "`").join(", ");
  }

  return "Use `/neural status`, `/neural testar frase`, `/neural treinar`, `/neural exportar` ou `/neural ensinar frase => categoria`.";
}

function getStats() {
  return {
    dim: DIM,
    hidden: HIDDEN,
    classes: INTENCOES.length,
    epochs: net.epochs,
    acc: net.acc,
    source: net.source,
    learnedCount: net.extraSamples?.length || 0
  };
}

init();

export const RedeNeural = {
  init,
  predict,
  reinforce,
  treinarLote,
  semanticSimilarity,
  vetorizar,
  comando,
  getStats,
  INTENCOES
};
/* BACH AI 5.4 — NLU NEURAL & AUTO-APRENDIZADO CONTÍNUO
 * 100% BACH AI própria (sem IAs externas).
 * - Roteia todas as 12 intenções da Rede Neural com validação de contexto.
 * - Cruza perguntas com a base interna (SaberesPro + Fatos) antes de acionar pesquisa web.
 * - Aprende automaticamente quando o usuário reformula após uma falha.
 */

import { RedeNeural, INTENCOES } from "./rede_neural.js?v=2";
import { RizikBrain } from "./brain.js?v=20";
import { Fatos } from "./fatos.js?v=8";
import { SaberesPro } from "./saberes_pro.js?v=1";

const K_CLOUD = "bach_cloud_url_v1";
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
  if (!base || ehEntradaSensivel(entrada)) return;

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

const CURTAS_VALIDAS = new Set([
  "oi", "ok", "ei", "ue", "ai", "hi", "eu", "tu", "vc", "pq", "oq", "qm",
  "hj", "td", "nd", "oxe", "uai", "opa", "sim", "nao", "bom", "mal", "sol", "lua", "ss"
]);
const CLUSTERS_INI = new Set([
  "bl","br","ch","cl","cr","dr","fl","fr","gl","gr","gu","kn","ph","pl","pr",
  "ps","qu","sh","sk","sl","sm","sn","sp","st","sw","th","tr","vr","wh"
]);

function ehRuidoOuTeclaSolta(raw) {
  const limpo = String(raw || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!limpo) return true;
  if (/^\d+$/.test(limpo)) return true;

  const palavras = limpo.split(" ").filter(Boolean);
  if (palavras.length === 1) {
    const w = palavras[0].toLowerCase();
    if (CURTAS_VALIDAS.has(w)) return false;
    if (w.length <= 2) return true;
    if (!/[aeiou]/i.test(w)) return true;
    if (/\d/.test(w) && /[a-z]/i.test(w) && w.length <= 7) return true;
    if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(w) && !/(str|scr|spr|ntr|ndr|mbr|mpr|ngr|nch)/i.test(w)) return true;
    if (/^[bcdfghjklmnpqrstvwxyz]{2}/i.test(w) && !CLUSTERS_INI.has(w.slice(0, 2))) return true;
    if (/[bcdfghjklmnpqrstvwxyz]{2}$/i.test(w) && !/(ns|rs|ls|st|nt|nd|rd|ld|rk|ck|ng|sh|th|ch|pt)$/i.test(w)) return true;
    if (/[bcdfghjklmnpqrstvwxyz]$/i.test(w) && !/[lmnrsxz]$/i.test(w) && w.length <= 6) return true;
  }
  return false;
}

function marcarFalha(texto) {
  const s = String(texto || "").trim();
  if (!s || s.length < 3 || ehRuidoOuTeclaSolta(s) || ehEntradaSensivel(s)) return;
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
  if (ehRuidoOuTeclaSolta(falhaTxt)) return false;
  if (falhaTxt.toLowerCase() === String(textoAtual || "").trim().toLowerCase()) return false;

  RedeNeural.reinforce(falhaTxt, intencaoCerta);
  enviarParaNuvem({
    tipo: "aprendido",
    entrada: falhaTxt,
    intencao: intencaoCerta,
    motivo: "reformulado para: " + String(textoAtual).slice(0, 80)
  });
  return true;
}

function normBasico(t) {
  return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function pareceDesabafoOuConversa(tn) {
  return /\b(estou|to|tou|fui|estava|tava|trabalh\w*|turno|mandado|mandaram|demitid\w*|odio|raiva|triste|mal|cansad\w*|queria que|era pra|falasse|dissesse|respondesse|dialogo|conversar|testar|nao quero|vc|voce|bach|meu dia|hoje eu|ontem eu|aconteceu|comprei|briguei|amig[oa]|namorad[oa]|familia|escola|prova|dinheiro|celular|eu|digo|disse|falei|respondi|resposta|pergunta|referente|sua|seu|e ai|ss)\b/.test(tn);
}

function parecePedidoInformacional(raw, tn) {
  if (pareceDesabafoOuConversa(tn)) return false;
  return /^(?:quem|o que|qual|quais|como|onde|quantos|quantas|porque|por que|pesquis\w*|procur\w*|busc\w*|me fala sobre|fala sobre|explica|(?:quando)\s+(?:foi|sera|aconteceu|comecou|terminou|surgiu|nasceu|morreu|estreia|lanca|e|eh))\b/.test(tn) ||
    /\b(historia de|significa|origem de|distancia|formula de|quantos episodios|membros d[oa]|existem?)\b/.test(tn);
}

function decidir(texto, ctx = {}) {
  const raw = String(texto || "").trim();
  if (!raw || raw.startsWith("/") || ehRuidoOuTeclaSolta(raw) || ctx.alvo) return null;

  const tn = normBasico(raw);
  const palavras = tn.replace(/[^a-z0-9\s]/g, " ").trim().split(/\s+/).filter(Boolean);
  const pred = RedeNeural.predict(raw);
  const conf = pred.confidence;
  const intent = pred.intent;
  const nome = ctx.nome ? ", " + ctx.nome : "";
  const serio = ctx.mood === "frustrado" || ctx.mood === "serio" || ctx.mood === "triste";

  // Antes de qualquer roteamento neural, confere se SaberesPro ou Fatos já têm resposta local exata
  const localPro = SaberesPro?.handle?.(raw);
  if (localPro) return { intent: "pesquisa", confidence: 0.95, texto: localPro };

  const localFato = Fatos?.responder?.(raw);
  if (localFato) return { intent: "pesquisa", confidence: 0.95, texto: localFato };

  if (conf < 0.78) return null;

  switch (intent) {
    case "saudacao":
      if (palavras.length > 5 || /\?/.test(raw)) return null;
      return {
        intent,
        confidence: conf,
        texto: serio
          ? "Olá" + nome + ". Como você está agora?"
          : "Oi" + nome + "! Tudo certo por aí?"
      };

    case "habilidades":
      if (!/\b(sabe|faz|entende|serve|func|consegue|capacidad|criou|criada|limite|neural)\b/.test(tn)) return null;
      return {
        intent,
        confidence: conf,
        texto: "Eu converso mantendo o contexto, crio apps (`/app`), rodo JS (`/executar`), reviso textos e códigos (`/revisar`), traduzo idiomas, analiso fotos e pesquiso na web — tudo 100% no meu próprio motor. Digite `/ajuda` para ver a lista!"
      };

    case "pesquisa":
      if (palavras.length >= 2 && parecePedidoInformacional(raw, tn)) {
        return { intent, confidence: conf, pesquisar: raw };
      }
      return null;

    case "criar_app":
      if (!/\b(app|aplicativo|painel|site|tela|jogo|calculadora|pomodoro|cobrinha)\b/.test(tn) ||
          !/\b(cria|crie|criar|monta|monte|gera|faz|faca|quero)\b/.test(tn)) return null;
      return { intent, confidence: conf, criarApp: raw };

    case "termux_dev":
      if (!/\b(termux|terminal|bash|script|pkg|apt|chmod|python|javascript|js|git|css|html|codigo)\b/.test(tn)) return null;
      return {
        intent,
        confidence: conf,
        texto: "💻 Para Termux/Bash, use `/termux` para abrir o guia completo — ou cole o código/erro que você quer analisar aqui!"
      };

    case "reclamacao":
      if (palavras.length > 14) return null;
      RizikBrain.setPendingError?.(raw, ctx.ultimoBot || "");
      return {
        intent,
        confidence: conf,
        texto: "Percebi que essa resposta não bateu com o que você queria" + nome + ". Me diz em uma frase direta o que você esperava (ou use **↩ Responder** na mensagem certa) que eu aprendo na hora!"
      };

    case "humor_jogo":
      if (/\bnao\b/.test(tn) || !/\b(piada|forca|velha|quiz|charada|jogar|adivinhe|rir|engracado)\b/.test(tn)) return null;
      return {
        intent,
        confidence: conf,
        texto: "🎮 Quer jogar **forca**, **velha**, **adivinhe** ou **quiz**? É só mandar o nome do jogo (ou `piada`!)."
      };

    case "utilidades":
      if (!/\b(senha|cpf|dado|moeda|sorte|clima|previsao|tempo|imc|agua|juros|converter|golpe)\b/.test(tn) || palavras.length > 7) return null;
      return {
        intent,
        confidence: conf,
        texto: "🧰 Ferramentas rápidas: `/senha 16`, `/cpf`, `/dado 20`, `/moeda`, `/sortear A, B`, `/imc 70 1.75` ou `clima em Cidade`."
      };

    case "traducao_texto":
      if (!/\b(traduz|significa|sinonimo|antonimo|revisa|silaba|ortografia|ingles|espanhol|frances|japones)\b/.test(tn)) return null;
      return {
        intent,
        confidence: conf,
        texto: "🌍 Para traduzir ou revisar: use `como se diz X em inglês`, `/revisar seu texto`, `/silabas palavra` ou responda (↩) a uma mensagem dizendo **“traduz”**."
      };

    case "recomendacao":
      if (!/\b(filme|serie|anime|musica|rock|rap|sertanejo|mpb|terror|acao|drama|comedia)\b/.test(tn) ||
          !/\b(recomend|indic|suger|bom|boas|assistir|ouvir|melhores)\b/.test(tn)) return null;
      return {
        intent,
        confidence: conf,
        texto: "🎬🎵 Posso recomendar **filmes**, **séries**, **animes** ou **músicas**. Qual estilo você prefere agora?"
      };

    case "memoria_eu":
      if (!/\b(meu nome|lembra|sobre mim|de mim|moro|anos|gosto|conversamos|falamos)\b/.test(tn)) return null;
      return {
        intent,
        confidence: conf,
        texto: RizikBrain.think("o que voce lembra de mim")?.text || "Ainda estou guardando nossas informações — me conte seu nome ou o que você gosta!"
      };

    case "conversa_geral":
      if (palavras.length <= 8 && /\b(entendi|beleza|valeu|obrigado|tchau|aham|uhum|ok)\b/.test(tn)) {
        return {
          intent,
          confidence: conf,
          texto: serio ? "Certo" + nome + ". Pode continuar." : "Tô acompanhando" + nome + "! Pode mandar a próxima."
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
