/* BACH AI 5.1 — REDE NEURAL PRÓPRIA (MLP + Backpropagation + N-gramas)
 * 100% desenvolvida no projeto, sem modelos externos.
 * Classifica intenções em frases livres/gírias, executa treino online por correção
 * e carrega pesos treinados automaticamente na nuvem (pesos_neurais.json).
 */

const K_NEURAL = "bach_neural_local_v1";
const DIM = 256;
const HIDDEN = 48;

export const INTENCOES = [
  "saudacao",       // 0: oi, bom dia, tudo bem, aqui ta tudo bem
  "habilidades",    // 1: o que vc sabe, do que entende, para que serve
  "pesquisa",       // 2: pesquise, quem foi, qm foi, o que e, historia de
  "criar_app",      // 3: cria um app, /app, calculadora, jogo html
  "termux_dev",     // 4: termux, terminal, programar, codigo, python, js
  "reclamacao",     // 5: errou, nada a ver, burro, nao entende, ruim
  "humor_jogo",     // 6: piada, jogar forca, velha, quiz, charada
  "utilidades",     // 7: senha, cpf, dado, moeda, sorteio, calcular, clima
  "traducao_texto", // 8: traduzir, significado, sinonimo, revisar, silabas
  "recomendacao",   // 9: recomenda filme, musica, anime, serie
  "memoria_eu",     // 10: meu nome, o que lembra de mim, do que falamos
  "conversa_geral"  // 11: obrigado, tchau, uai, tudo bem sim, curiosidade
];

const BASE_TREINO = [
  ["oi", "saudacao"], ["ola", "saudacao"], ["bom dia", "saudacao"], ["boa tarde", "saudacao"],
  ["boa noite", "saudacao"], ["e ai tudo bem", "saudacao"], ["aqui ta tudo bem", "saudacao"],
  ["to bem e vc", "saudacao"], ["como voce esta", "saudacao"], ["oie bach", "saudacao"],

  ["o que voce sabe fazer", "habilidades"], ["no oq vc sabe", "habilidades"],
  ["no oq vc sabe fazer", "habilidades"], ["me fala oq vc entende", "habilidades"],
  ["do que voce entende", "habilidades"], ["para que voce serve", "habilidades"],
  ["quais sao suas funcoes", "habilidades"], ["o que voce consegue fazer", "habilidades"],
  ["vc auto corrige", "habilidades"], ["como funciona sua autocorrecao", "habilidades"],

  ["pesquise sobre buraco negro", "pesquisa"], ["pesquisa como melhorar uma ia sozinha", "pesquisa"],
  ["quem foi adao e eva", "pesquisa"], ["qm foi eva", "pesquisa"], ["qm foi adam", "pesquisa"],
  ["o que e fotossintese", "pesquisa"], ["me fala do sol", "pesquisa"],
  ["qual a distancia da terra ate marte", "pesquisa"], ["historia da segunda guerra", "pesquisa"],
  ["quem inventou o aviao", "pesquisa"], ["oq eu queria era para vc pesquisar", "pesquisa"],

  ["cria um app de pomodoro", "criar_app"], ["faz um aplicativo de notas", "criar_app"],
  ["crie um jogo da cobrinha", "criar_app"], ["cria uma calculadora html", "criar_app"],
  ["abre meu painel de gastos", "criar_app"], ["quero criar um app", "criar_app"],
  ["monte uma tela de tarefas", "criar_app"],

  ["como usar termux", "termux_dev"], ["instalar python no termux", "termux_dev"],
  ["abre terminal do termux aqui", "termux_dev"], ["abre o terminal", "termux_dev"],
  ["como criar script sh", "termux_dev"], ["o que e uma funcao em javascript", "termux_dev"],
  ["me ajuda a programar em python", "termux_dev"], ["revisar esse codigo js", "termux_dev"],

  ["voce errou", "reclamacao"], ["respondeu errado", "reclamacao"], ["nada a ver isso", "reclamacao"],
  ["voce nao entende nada", "reclamacao"], ["nunca entende nada", "reclamacao"],
  ["vc e burro", "reclamacao"], ["para de errar", "reclamacao"],
  ["pse entt nao fala bosta", "reclamacao"], ["pqp que erro", "reclamacao"],
  ["so foca em melhorar", "reclamacao"],

  ["conta uma piada", "humor_jogo"], ["vamos jogar forca", "humor_jogo"],
  ["jogar jogo da velha", "humor_jogo"], ["quero jogar quiz", "humor_jogo"],
  ["me manda uma charada", "humor_jogo"], ["me faz rir", "humor_jogo"],

  ["gera uma senha forte", "utilidades"], ["manda um cpf aleatorio de teste", "utilidades"],
  ["joga um dado d20", "utilidades"], ["cara ou coroa", "utilidades"],
  ["quanto e 15 por cento de 200", "utilidades"], ["converter 10 km para metros", "utilidades"],
  ["como esta o clima hoje", "utilidades"], ["previsao do tempo em sao paulo", "utilidades"],

  ["traduz isso para portugues", "traducao_texto"], ["como se diz obrigado em japones", "traducao_texto"],
  ["o que significa efemero", "traducao_texto"], ["sinonimo de feliz", "traducao_texto"],
  ["revisa esse texto de portugues", "traducao_texto"], ["separe as silabas de computador", "traducao_texto"],

  ["me recomenda filmes de acao", "recomendacao"], ["indica animes bons", "recomendacao"],
  ["recomenda musicas de sertanejo", "recomendacao"], ["quais series boas para assistir", "recomendacao"],
  ["me indica um filme de terror", "recomendacao"],

  ["meu nome e rizik", "memoria_eu"], ["qual e meu nome", "memoria_eu"],
  ["o que voce lembra de mim", "memoria_eu"], ["do que nos falamos desde o inicio", "memoria_eu"],
  ["eu gosto de programacao", "memoria_eu"], ["lembra do comeco da conversa", "memoria_eu"],

  ["muito obrigado pela ajuda", "conversa_geral"], ["tchau ate mais", "conversa_geral"],
  ["eu so te respondi", "conversa_geral"], ["so segue a conversa", "conversa_geral"],
  ["nao quero jogar agora", "conversa_geral"], ["me conta uma curiosidade", "conversa_geral"],
  ["entre essas duas qual e a melhor", "conversa_geral"], ["pode parar o timer", "conversa_geral"]
];

function norm(t) {
  return String(t || "").toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bqm\b/g, "quem")
    .replace(/\b(vc|vce|vv|oc|oce)\b/g, "voce")
    .replace(/\b(oq|oqe|oque)\b/g, "o que")
    .replace(/\bpq\b/g, "porque")
    .replace(/\b(tb|tbm)\b/g, "tambem")
    .replace(/\bcvs\b/g, "conversar")
    .replace(/\bpse\b/g, "pois e")
    .replace(/\bentt\b/g, "entao")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  const t = norm(texto);
  if (!t) return vec;

  const palavras = t.split(" ").filter(Boolean);
  for (let i = 0; i < palavras.length; i++) {
    const w = palavras[i];
    vec[hashStr("w:" + w) % DIM] += 1.6;
    if (i + 1 < palavras.length) {
      vec[hashStr("b:" + w + "_" + palavras[i + 1]) % DIM] += 1.3;
    }
    const pad = "#" + w + "#";
    for (let j = 0; j <= pad.length - 3; j++) {
      vec[hashStr("c:" + pad.slice(j, j + 3)) % DIM] += 0.55;
    }
  }

  let norma = 0;
  for (let i = 0; i < DIM; i++) norma += vec[i] * vec[i];
  norma = Math.sqrt(norma) || 1;
  for (let i = 0; i < DIM; i++) vec[i] /= norma;
  return vec;
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
  const rnd = mulberry32(42026);
  const escala1 = Math.sqrt(2 / (DIM + HIDDEN));
  const escala2 = Math.sqrt(2 / (HIDDEN + INTENCOES.length));

  const W1 = new Float32Array(DIM * HIDDEN);
  const b1 = new Float32Array(HIDDEN);
  const W2 = new Float32Array(HIDDEN * INTENCOES.length);
  const b2 = new Float32Array(INTENCOES.length);

  for (let i = 0; i < W1.length; i++) W1[i] = (rnd() * 2 - 1) * escala1;
  for (let i = 0; i < W2.length; i++) W2[i] = (rnd() * 2 - 1) * escala2;

  return { W1, b1, W2, b2, epochs: 0, acc: 0, source: "local-bootstrap", extraSamples: [] };
}

let net = criarRede();
let pronto = false;

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
      net.W2[idx] -= lr * h[j] * dLogits[k];
    }
    dH[j] = err * (1 - h[j] * h[j]);
  }
  for (let k = 0; k < outLen; k++) net.b2[k] -= lr * dLogits[k];

  for (let i = 0; i < DIM; i++) {
    if (x[i] === 0) continue;
    const base = i * HIDDEN;
    for (let j = 0; j < HIDDEN; j++) {
      net.W1[base + j] -= lr * x[i] * dH[j];
    }
  }
  for (let j = 0; j < HIDDEN; j++) net.b1[j] -= lr * dH[j];

  return -Math.log(Math.max(probs[targetIdx], 1e-7));
}

function treinarLote(amostras = BASE_TREINO, epocas = 35, lr = 0.09) {
  const idxMap = Object.fromEntries(INTENCOES.map((name, i) => [name, i]));
  const tudo = [...amostras, ...(net.extraSamples || [])].filter(x => idxMap[x[1]] !== undefined);
  let lastLoss = 0;

  for (let ep = 0; ep < epocas; ep++) {
    const taxa = lr * (1 - ep / (epocas * 1.3));
    const ordem = tudo.slice().sort(() => Math.random() - 0.5);
    let loss = 0;
    for (const [txt, label] of ordem) {
      loss += trainSample(txt, idxMap[label], taxa);
    }
    lastLoss = loss / (ordem.length || 1);
  }

  let acertos = 0;
  for (const [txt, label] of tudo) {
    const p = predict(txt);
    if (p.intent === label) acertos++;
  }
  net.epochs += epocas;
  net.acc = Math.round((acertos / (tudo.length || 1)) * 100);
  salvarLocal();
  return { loss: Number(lastLoss.toFixed(4)), acc: net.acc, total: tudo.length };
}

function salvarLocal() {
  try {
    const round = arr => Array.from(arr, v => Math.round(v * 10000) / 10000);
    localStorage.setItem(K_NEURAL, JSON.stringify({
      v: 1,
      epochs: net.epochs,
      acc: net.acc,
      source: net.source,
      extraSamples: (net.extraSamples || []).slice(-120),
      W1: round(net.W1),
      b1: round(net.b1),
      W2: round(net.W2),
      b2: round(net.b2)
    }));
  } catch (e) { console.warn("Neural save:", e); }
}

function carregarPayload(obj, sourceLabel) {
  if (!obj || !Array.isArray(obj.W1) || obj.W1.length !== DIM * HIDDEN) return false;
  net.W1 = new Float32Array(obj.W1);
  net.b1 = new Float32Array(obj.b1);
  net.W2 = new Float32Array(obj.W2);
  net.b2 = new Float32Array(obj.b2);
  net.epochs = obj.epochs || 0;
  net.acc = obj.acc || 0;
  net.source = sourceLabel || obj.source || "pesos-carregados";
  if (Array.isArray(obj.extraSamples)) net.extraSamples = obj.extraSamples;
  return true;
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
        carregarPayload(local, local.source || "local-salvo");
      } else if (Array.isArray(local.extraSamples) && local.extraSamples.length) {
        net.extraSamples = local.extraSamples;
        treinarLote(local.extraSamples, 6, 0.05);
      }
    }
  } catch {}

  if (net.epochs === 0) {
    treinarLote(BASE_TREINO, 40, 0.09);
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
  if (idx < 0 || !String(texto || "").trim()) return false;
  net.extraSamples = (net.extraSamples || []).filter(s => norm(s[0]) !== norm(texto));
  net.extraSamples.push([String(texto).trim().slice(0, 140), intencao]);
  net.extraSamples = net.extraSamples.slice(-120);
  for (let i = 0; i < 12; i++) trainSample(texto, idx, 0.08);
  salvarLocal();
  return true;
}

function comando(raw) {
  const s = String(raw || "").trim();
  if (!/^\/neural\b/i.test(s)) return null;

  const arg = s.replace(/^\/neural\s*/i, "").trim();
  if (!arg || /^status$/i.test(arg)) {
    return "🧠 **REDE NEURAL PRÓPRIA DA BACH AI**\n\n" +
      "• Arquitetura: **MLP " + DIM + " → " + HIDDEN + " (tanh) → " + INTENCOES.length + " (softmax)**\n" +
      "• Origem dos pesos: `" + net.source + "`\n" +
      "• Épocas treinadas: **" + net.epochs + "**\n" +
      "• Acurácia na base: **" + net.acc + "%**\n" +
      "• Exemplos aprendidos na sessão: **" + (net.extraSamples?.length || 0) + "**\n\n" +
      "Comandos:\n" +
      "• `/neural testar sua frase aqui`\n" +
      "• `/neural treinar` (re-treina no aparelho)\n" +
      "• `/neural ensinar Roii tudo bem? => saudacao`";
  }

  let m = arg.match(/^testar\s+([\s\S]+)$/i);
  if (m) {
    const p = predict(m[1]);
    return "🧪 **Previsão Neural para “" + m[1] + "”:**\n\n" +
      p.top3.map((x, i) => (i + 1) + ". `" + x.intent + "` — **" + (x.prob * 100).toFixed(1) + "%**").join("\n");
  }

  if (/^treinar$/i.test(arg)) {
    const res = treinarLote(BASE_TREINO, 30, 0.08);
    return "⚡ **Treinamento local concluído!**\n• Exemplos: " + res.total + "\n• Loss: " + res.loss + "\n• Acurácia: **" + res.acc + "%**";
  }

  m = arg.match(/^ensinar\s+(.+?)\s*=>\s*([a-z_]+)$/i);
  if (m) {
    const ok = reinforce(m[1], m[2].toLowerCase());
    if (!ok) return "Categoria inválida. Use uma destas:\n" + INTENCOES.map(x => "`" + x + "`").join(", ");
    return "✅ Rede neural treinada! Agora `" + m[1] + "` aponta para **`" + m[2].toLowerCase() + "`** (" + (predict(m[1]).confidence * 100).toFixed(1) + "% de confiança).";
  }

  if (/^ensinar\b/i.test(arg)) {
    return "🧠 Para ensinar a Rede Neural, coloque **`=>` e a categoria** no final!\n\n" +
      "Exemplo certo:\n`/neural ensinar Roii tudo bem? => saudacao`\n\n" +
      "Categorias válidas: " + INTENCOES.map(x => "`" + x + "`").join(", ");
  }

  return "Use `/neural status`, `/neural testar frase`, `/neural treinar` ou `/neural ensinar Roii tudo bem? => saudacao`.";
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
  comando,
  getStats,
  INTENCOES
};
