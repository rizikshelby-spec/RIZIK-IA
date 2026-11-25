/* BACH AI — Treinador Automático na Nuvem (GitHub Actions / Node 20+)
 * Zero dependências externas: treina a MLP 256 -> 48 -> 12 por 150 épocas
 * unindo a base fixa + dados coletados na nuvem Cloudflare D1 e gera pesos_neurais.json.
 */

import fs from "node:fs";

const DIM = 256;
const HIDDEN = 48;

const INTENCOES = [
  "saudacao", "habilidades", "pesquisa", "criar_app",
  "termux_dev", "reclamacao", "humor_jogo", "utilidades",
  "traducao_texto", "recomendacao", "memoria_eu", "conversa_geral"
];

const DATASET_BASE = [
  ["oi", "saudacao"], ["ola", "saudacao"], ["bom dia", "saudacao"], ["boa tarde", "saudacao"],
  ["boa noite", "saudacao"], ["e ai tudo bem", "saudacao"], ["aqui ta tudo bem", "saudacao"],
  ["to bem e vc", "saudacao"], ["como voce esta", "saudacao"], ["oie bach", "saudacao"],

  ["o que voce sabe fazer", "habilidades"], ["no oq vc sabe", "habilidades"],
  ["no oq vc sabe fazer", "habilidades"], ["me fala oq vc entende", "habilidades"],
  ["do que voce entende", "habilidades"], ["para que voce serve", "habilidades"],
  ["quais sao suas funcoes", "habilidades"], ["vc auto corrige", "habilidades"],
  ["como funciona sua autocorrecao", "habilidades"],

  ["pesquise sobre buraco negro", "pesquisa"], ["pesquisa como melhorar uma ia sozinha", "pesquisa"],
  ["quem foi adao e eva", "pesquisa"], ["qm foi eva", "pesquisa"], ["qm foi adam", "pesquisa"],
  ["o que e fotossintese", "pesquisa"], ["me fala do sol", "pesquisa"],
  ["qual a distancia da terra ate marte", "pesquisa"], ["historia da segunda guerra", "pesquisa"],
  ["quem inventou o aviao", "pesquisa"], ["oq eu queria era para vc pesquisar", "pesquisa"],

  ["cria um app de pomodoro", "criar_app"], ["faz um aplicativo de notas", "criar_app"],
  ["crie um jogo da cobrinha", "criar_app"], ["cria uma calculadora html", "criar_app"],
  ["abre meu painel de gastos", "criar_app"], ["quero criar um app", "criar_app"],

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
    .replace(/\b(vc|vce|vv)\b/g, "voce")
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
    if (i + 1 < palavras.length) vec[hashStr("b:" + w + "_" + palavras[i + 1]) % DIM] += 1.3;
    const pad = "#" + w + "#";
    for (let j = 0; j <= pad.length - 3; j++) vec[hashStr("c:" + pad.slice(j, j + 3)) % DIM] += 0.55;
  }
  let n = 0;
  for (let i = 0; i < DIM; i++) n += vec[i] * vec[i];
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < DIM; i++) vec[i] /= n;
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

async function baixarExtrasNuvem() {
  const url = process.env.CLOUD_URL || "";
  const key = process.env.CLOUD_KEY || "";
  if (!url) return [];
  try {
    const r = await fetch(url.replace(/\/+$/, "") + "/dataset", {
      headers: key ? { "x-adm-key": key } : {}
    });
    if (!r.ok) return [];
    const arr = await r.json();
    return Array.isArray(arr) ? arr.filter(x => Array.isArray(x) && x.length === 2) : [];
  } catch (e) {
    console.warn("Aviso nuvem:", e.message);
    return [];
  }
}

async function main() {
  let extrasArquivo = [];
  if (fs.existsSync("dataset_neural.json")) {
    try {
      extrasArquivo = JSON.parse(fs.readFileSync("dataset_neural.json", "utf8"));
    } catch {}
  }
  const extrasNuvem = await baixarExtrasNuvem();

  const vistos = new Set();
  const dataset = [];
  for (const item of [...DATASET_BASE, ...extrasArquivo, ...extrasNuvem]) {
    if (!Array.isArray(item) || item.length < 2) continue;
    const chave = norm(item[0]);
    if (!chave || !INTENCOES.includes(item[1]) || vistos.has(chave)) continue;
    vistos.add(chave);
    dataset.push([item[0], item[1]]);
  }

  const rnd = mulberry32(42026);
  const escala1 = Math.sqrt(2 / (DIM + HIDDEN));
  const escala2 = Math.sqrt(2 / (HIDDEN + INTENCOES.length));
  const W1 = new Float32Array(DIM * HIDDEN);
  const b1 = new Float32Array(HIDDEN);
  const W2 = new Float32Array(HIDDEN * INTENCOES.length);
  const b2 = new Float32Array(INTENCOES.length);
  for (let i = 0; i < W1.length; i++) W1[i] = (rnd() * 2 - 1) * escala1;
  for (let i = 0; i < W2.length; i++) W2[i] = (rnd() * 2 - 1) * escala2;

  const outLen = INTENCOES.length;
  const idxMap = Object.fromEntries(INTENCOES.map((n, i) => [n, i]));
  const epochs = 150;

  function forward(x) {
    const h = new Float32Array(HIDDEN);
    for (let j = 0; j < HIDDEN; j++) {
      let s = b1[j];
      for (let i = 0; i < DIM; i++) if (x[i] !== 0) s += x[i] * W1[i * HIDDEN + j];
      h[j] = Math.tanh(s);
    }
    const logits = new Float32Array(outLen);
    let mx = -Infinity;
    for (let k = 0; k < outLen; k++) {
      let s = b2[k];
      for (let j = 0; j < HIDDEN; j++) s += h[j] * W2[j * outLen + k];
      logits[k] = s;
      if (s > mx) mx = s;
    }
    const probs = new Float32Array(outLen);
    let se = 0;
    for (let k = 0; k < outLen; k++) { probs[k] = Math.exp(logits[k] - mx); se += probs[k]; }
    for (let k = 0; k < outLen; k++) probs[k] /= se || 1;
    return { h, probs };
  }

  for (let ep = 0; ep < epochs; ep++) {
    const lr = 0.09 * (1 - ep / (epochs * 1.25));
    const ordem = dataset.slice().sort(() => rnd() - 0.5);
    for (const [txt, lab] of ordem) {
      const target = idxMap[lab];
      const x = vetorizar(txt);
      const { h, probs } = forward(x);
      const dLog = new Float32Array(outLen);
      for (let k = 0; k < outLen; k++) dLog[k] = probs[k] - (k === target ? 1 : 0);

      const dH = new Float32Array(HIDDEN);
      for (let j = 0; j < HIDDEN; j++) {
        let err = 0;
        for (let k = 0; k < outLen; k++) {
          const id = j * outLen + k;
          err += dLog[k] * W2[id];
          W2[id] -= lr * h[j] * dLog[k];
        }
        dH[j] = err * (1 - h[j] * h[j]);
      }
      for (let k = 0; k < outLen; k++) b2[k] -= lr * dLog[k];
      for (let i = 0; i < DIM; i++) {
        if (x[i] === 0) continue;
        const base = i * HIDDEN;
        for (let j = 0; j < HIDDEN; j++) W1[base + j] -= lr * x[i] * dH[j];
      }
      for (let j = 0; j < HIDDEN; j++) b1[j] -= lr * dH[j];
    }
  }

  let ok = 0;
  for (const [txt, lab] of dataset) {
    const { probs } = forward(vetorizar(txt));
    let best = 0;
    for (let k = 1; k < outLen; k++) if (probs[k] > probs[best]) best = k;
    if (INTENCOES[best] === lab) ok++;
  }
  const acc = Math.round((ok / (dataset.length || 1)) * 100);
  const round = arr => Array.from(arr, v => Math.round(v * 10000) / 10000);

  fs.writeFileSync("pesos_neurais.json", JSON.stringify({
    v: 1,
    updatedAt: new Date().toISOString(),
    epochs,
    acc,
    totalSamples: dataset.length,
    source: "nuvem-github-actions",
    W1: round(W1),
    b1: round(b1),
    W2: round(W2),
    b2: round(b2)
  }));

  fs.writeFileSync("dataset_neural.json", JSON.stringify(dataset, null, 2));
  console.log("Treino concluido! Exemplos:", dataset.length, "Acuracia:", acc + "%");
}

main();
