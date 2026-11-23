/* BACH AI - MENTE 1.0
   Entende contexto, texto colado, jogos, criação de apps, pastas e perguntas.
   100% sua, sem IA externa. */
import { Saber } from "./saber.js?v=5";
import { KB, ERROS } from "./conhecimento.js?v=1";

const KF = "bach_arquivos_v1";
const lf = () => { try { return JSON.parse(localStorage.getItem(KF)) || []; } catch { return []; } };
const sf = a => { try { localStorage.setItem(KF, JSON.stringify(a.slice(-300))); } catch (e) { console.warn(e); } };
const pick = a => a[Math.floor(Math.random() * a.length)];
/* Vocabulário: gírias, abreviações e jeitos de escrever -> forma padrão */
const VOCAB = { oque: "o que", oq: "o que", oqe: "o que", vc: "voce", vce: "voce", voces: "voces", pq: "porque", pk: "porque", q: "que", ke: "que", qe: "que",
  tb: "tambem", tbm: "tambem", tmb: "tambem", mt: "muito", mto: "muito", mta: "muita", blz: "beleza", vlw: "valeu", vlws: "valeu", obg: "obrigado", obgd: "obrigado",
  hj: "hoje", td: "tudo", tds: "todos", msm: "mesmo", ctz: "certeza", dnv: "de novo", denovo: "de novo", ta: "esta", tao: "estao", to: "estou", tava: "estava", tamo: "estamos",
  pra: "para", pro: "para o", pras: "para as", pros: "para os", ngm: "ninguem", msg: "mensagem", pf: "por favor", pfv: "por favor", plis: "por favor", pls: "por favor",
  n: "nao", naum: "nao", nn: "nao", s: "sim", ss: "sim", eh: "e", kd: "cade", qnd: "quando", qdo: "quando", qm: "quem", cm: "como", qto: "quanto", qtos: "quantos",
  agr: "agora", vdd: "verdade", fds: "fim de semana", sdds: "saudade", add: "adicionar", app: "app", apps: "app", cel: "celular", pc: "computador", net: "internet",
  iries: "iris", bash: "bach", bax: "bach", arcoiris: "arco iris", sao: "sao", ola: "ola", oii: "oi", oie: "oi", eae: "e ai", eai: "e ai", flw: "falou", vamo: "vamos", bora: "bora",
  progamacao: "programacao", programaçao: "programacao", codigo: "codigo", kd: "cade", cmo: "como", cmg: "comigo", ctg: "contigo", dps: "depois", ate: "ate", gnt: "gente", mlr: "mulher" };
/* Léxico: palavras que ela conhece (corrige erros de digitação como "mindo" -> "mundo") */
const BASE_LEX = ("mundo noticia noticias hoje agora ontem amanha tempo clima chuva calor frio sol lua estrela terra planeta pais cidade estado brasil pessoa gente homem mulher crianca amigo familia casa escola trabalho dinheiro comida agua cafe carne fruta animal cachorro gato cavalo passaro peixe pato planta arvore flor cores azul verde vermelho amarelo preto branco rosa roxo laranja marrom cinza pintar pintura quadro quadros desenho desenhar musica cantar dancar filme livro historia jogo esporte futebol campeonato carro moto aviao onibus trem viagem hotel hospital medico doenca saude remedio corpo cabeca coracao amor feliz triste raiva medo computador celular internet site programa codigo erro texto resumo explicar explicacao significa significado diferenca exemplo pergunta resposta ajuda ajudar aprender ensinar estudar escrever falar ouvir fazer criar jogar pesquisar procurar encontrar saber entender lembrar esquecer comecar terminar importante facil dificil grande pequeno melhor pior rapido devagar muito pouco alguem ninguem sempre nunca depois antes porque quando quanto qualquer outro mesmo primeiro ultimo ultimas politica economia ciencia tecnologia cultura arte geografia matematica fisica quimica biologia presidente governo guerra energia imagem video foto praia montanha floresta deserto neve vento tempestade tinta pincel tela").split(" ");
let LEXS = null;
const lexico = () => { if (!LEXS) { LEXS = new Set(BASE_LEX); KB.forEach(e => e[0].split("|").forEach(k => k.split(" ").forEach(w => w.length > 3 && LEXS.add(w)))); Object.values(VOCAB).forEach(v => v.split(" ").forEach(w => w.length > 3 && LEXS.add(w))); (ctx.lex || []).forEach(w => LEXS.add(w)); } return LEXS; };
function lev(a, b) { const m = a.length, n = b.length; let pr = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(pr[j] + 1, c[j - 1] + 1, pr[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); pr = c; } return pr[n]; }
function corrigir(w) {
  if (w.length < 5 || /\d/.test(w)) return w;
  if (/^(passe|passa|passar|passou|arroz|manda|mande|pede|pedir|quero|prece|pesse)$/.test(w)) return w;
  const L = lexico(); if (L.has(w)) return w;
  const max = w.length >= 8 ? 2 : 1; let best = w, bd = max + 1;
  for (const c of L) { if (c[0] !== w[0] || Math.abs(c.length - w.length) > max || w.startsWith(c) || c.startsWith(w)) continue; const d = lev(w, c); if (d < bd) { bd = d; best = c; } }
  return bd <= max ? best : w;
}
function lembrarTema(q) { const t = String(q || "").trim(); if (!t) return; ctx.tema = t; (ctx.lex = ctx.lex || []); prep(t).split(" ").forEach(w => w.length > 3 && !ctx.lex.includes(w) && ctx.lex.push(w)); ctx.lex = ctx.lex.slice(-300); LEXS = null; persist(); }
const prep = t => " " + String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/(?<=[a-z])-(?=[a-z])/g, " ").replace(/[^a-z0-9+\-*/().,\s]/g, " ").replace(/[.,]+(?=\s|$)/g, " ")
  .split(/\s+/).filter(Boolean).map(w => (ctx.vocab && ctx.vocab[w]) || VOCAB[w] || w).map(corrigir).join(" ") + " ";
/* tira as palavras de pergunta e fica só com o assunto: "o que é um pato?" -> "pato" */
function tema(t) {
  let x = prep(t).trim();
  const A = /^(me )?(explica|explique|fala|fale|diz|diga|conta|conte|mostra|mostre|pesquisa|pesquise|procure)\s+(sobre |de |a respeito de )?/;
  const B = /^(o que|quem|quais|qual|quantos|quantas|quanto|onde|quando|como|por que|porque)\s+(e |sao |foi |foram |era |eram |esta |estao |significa |significam |funciona |funcionam |aconteceu |existe |existem |fica |ficam |fazer |faz |faco |tem )?/;
  const C = /^(a |o |as |os |um |uma |uns |umas |de |do |da |dos |das |no |na |nos |nas |que |sobre )+/;
  for (let k = 0; k < 3; k++) x = x.replace(A, "").replace(B, "").replace(C, "").trim();
  return x;
}
const has = (p, re) => re.test(p);

const KC = "bach_mente_v1";
const ctx = { texto: null, nome: "", pasta: null, jogo: null, ultimo: null, ultimoMidia: null, assuntos: [], esperando: null, vocab: {}, tema: null, lex: [] };
try { const o = JSON.parse(localStorage.getItem(KC)); if (o) Object.assign(ctx, { texto: o.texto, nome: o.nome || "", pasta: o.pasta, ultimo: o.ultimo, ultimoMidia: o.ultimoMidia || null, assuntos: o.assuntos || [], vocab: o.vocab || {}, tema: o.tema || null, lex: o.lex || [] }); } catch {}
function persist() { try { localStorage.setItem(KC, JSON.stringify({ texto: ctx.texto && ctx.texto.slice(0, 60000), nome: ctx.nome, pasta: ctx.pasta, ultimo: ctx.ultimo, ultimoMidia: ctx.ultimoMidia, assuntos: ctx.assuntos, vocab: ctx.vocab, tema: ctx.tema, lex: (ctx.lex || []).slice(-300) })); } catch {} }
const setTexto = (nome, texto) => { ctx.nome = nome; ctx.texto = texto; ctx.ultimo = { t: "texto" }; persist(); };
const setMidia = (nome, tipo) => { ctx.ultimoMidia = { nome, tipo }; ctx.ultimo = { t: "midia", tipo }; persist(); };
const pasta = def => ctx.pasta || def;

/* ---------- pastas ---------- */
function comandoPasta(t) {
  let m = t.match(/^\/pasta(?:\s+(.+))?$/i);
  if (m) {
    if (!m[1]) return ctx.pasta ? "📂 Pasta atual: " + ctx.pasta + "\nPara sair: /pasta sair" : "Nenhuma pasta escolhida. Use: /pasta Estudos/IA (pode criar pastas dentro de pastas com /).";
    if (/^sair$/i.test(m[1].trim())) { ctx.pasta = null; return "Voltei para as pastas automáticas."; }
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

/* ---------- ler/analisar o texto atual ---------- */
function revisar(t) {
  const p = [];
  if (/localStorage\.getItem/.test(t) && !/try\s*\{/.test(t)) p.push("Usa localStorage sem try/catch (pode quebrar em modo privado).");
  if (/fetch\(/.test(t) && !/catch/.test(t)) p.push("Faz fetch sem tratar erro (catch).");
  if (/\bvar\s/.test(t)) p.push("Usa var; prefira let/const.");
  if (/[^=!]==[^=]/.test(t)) p.push("Usa == ; prefira === para comparar.");
  const a = (t.match(/\{/g) || []).length, b = (t.match(/\}/g) || []).length;
  if (a !== b) p.push("Chaves desbalanceadas: " + a + " “{” e " + b + " “}”.");
  const x = (t.match(/\(/g) || []).length, y = (t.match(/\)/g) || []).length;
  if (x !== y) p.push("Parênteses desbalanceados: " + x + " “(” e " + y + " “)”.");
  if (/\bTODO\b|\bFIXME\b/.test(t)) p.push("Tem TODO/FIXME pendentes.");
  return "🔍 Revisão rápida do código (" + t.split("\n").length + " linhas):\n" + (p.length ? p.map(s => "• " + s).join("\n") : "• Não achei problemas óbvios.") +
    "\n\nObs.: sou uma revisão por regras; não executo o código.";
}
function sobreTexto(p) {
  const t = ctx.texto, cod = Saber.isCode(t);
  if (has(p, /resum/)) { const r = Saber.summarize(t, 4); return r.length ? "📝 Resumo de " + ctx.nome + ":\n• " + r.join("\n• ") : Saber.lerTexto(t); }
  if (cod && has(p, /erro|problema|bug|revis|melhor|conserta|arruma/)) return revisar(t);
  return "📄 " + ctx.nome + "\n" + Saber.lerTexto(t) + "\n\nPosso também: resumir, revisar o código ou guardar numa pasta (/pasta Nome).";
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

function iniciar(p) {
  if (has(p, /forca/)) { ctx.jogo = { t: "forca", p: pick(PAL), ok: [], er: [] }; return "🪢 FORCA! Mande uma letra (ou chute a palavra inteira).\n\n" + forca(ctx.jogo); }
  if (has(p, /velha/)) { ctx.jogo = { t: "velha", b: Array(9).fill("") }; return "⭕❌ JOGO DA VELHA! Você é ❌. Mande o número da casa:\n\n" + tab(ctx.jogo.b); }
  if (has(p, /adivinh|numero/)) { ctx.jogo = { t: "num", n: 1 + Math.floor(Math.random() * 100), c: 0 }; return "🔢 Pensei num número de 1 a 100. Qual é?"; }
  if (has(p, /quiz|pergunta/)) { ctx.jogo = { t: "quiz", i: 0, pts: 0 }; return "🧠 QUIZ!\n\n" + perg(0); }
  return MENU;
}
const perg = i => (i + 1) + ") " + QUIZ[i][0] + "\n" + QUIZ[i][1].map((o, k) => "abc"[k] + ") " + o).join("\n");

function jogar(p, raw) {
  const j = ctx.jogo, w = p.trim();
  if (/^(sair|parar|desistir|chega)$/.test(w)) { ctx.jogo = null; return "Jogo encerrado. Quando quiser, é só dizer: jogar ..."; }
  if (w.split(" ").length > 2) return null; // frase normal durante o jogo: deixa responder
  if (j.t === "forca") {
    if (w.length === 1 && /[a-z]/.test(w)) {
      if (j.ok.includes(w) || j.er.includes(w)) return "Você já tentou “" + w + "”.\n\n" + forca(j);
      j.p.includes(w) ? j.ok.push(w) : j.er.push(w);
    } else if (w.length > 1) { if (w === j.p) j.ok = [...j.p]; else j.er.push(w.slice(0, 6) + "…"); }
    else return "Mande uma letra.";
    if (j.p.split("").every(c => j.ok.includes(c))) { ctx.jogo = null; return "🎉 Acertou! A palavra era “" + j.p + "”."; }
    if (j.er.length >= 6) { ctx.jogo = null; return "💀 Perdeu! A palavra era “" + j.p + "”. Diga “jogar forca” para outra."; }
    return forca(j);
  }
  if (j.t === "velha") {
    const n = parseInt(w, 10) - 1;
    if (!(n >= 0 && n < 9) || j.b[n]) return "Escolha uma casa livre de 1 a 9.\n\n" + tab(j.b);
    j.b[n] = "X"; let r = venc(j.b);
    if (!r) { j.b[mm(j.b, "O").i] = "O"; r = venc(j.b); }
    if (r) { ctx.jogo = null; return tab(j.b) + "\n\n" + (r === "E" ? "🤝 Empate!" : r === "X" ? "🎉 Você ganhou!" : "😎 Eu ganhei!"); }
    return tab(j.b);
  }
  if (j.t === "num") {
    const v = parseInt(w, 10); if (isNaN(v)) return "Mande um número de 1 a 100.";
    j.c++; if (v === j.n) { ctx.jogo = null; return "🎉 Acertou em " + j.c + " tentativa(s)!"; }
    return v < j.n ? "⬆️ Maior!" : "⬇️ Menor!";
  }
  if (j.t === "quiz") {
    const k = "abc".indexOf(w[0]); if (k < 0 || w.length > 2) return "Responda com a, b ou c.";
    const q = QUIZ[j.i], ok = k === q[2]; if (ok) j.pts++;
    const fb = ok ? "✅ Certo!" : "❌ Errado. Era: " + q[1][q[2]];
    if (++j.i >= QUIZ.length) { ctx.jogo = null; return fb + "\n\n🏁 Fim! Você fez " + j.pts + "/" + QUIZ.length + " pontos."; }
    return fb + "\n\n" + perg(j.i);
  }
  return null;
}

/* ---------- criar apps/jogos/telas ---------- */
const H = (titulo, css, corpo) => "<!DOCTYPE html><html lang=\"pt-BR\"><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>" + titulo + "</title><style>body{font-family:Arial;background:#10111a;color:#fff;text-align:center}button{border:0;border-radius:10px;background:#7864ed;color:#fff}" + css + "</style>" + corpo + "</html>";
const TEMPLATES = {
  velha: ["jogo-da-velha.html", H("Jogo da Velha", "#t{display:grid;grid-template-columns:repeat(3,90px);gap:6px;justify-content:center;margin:20px}#t button{height:90px;font-size:40px}", "<h2>Jogo da Velha</h2><p id=m></p><div id=t></div><button onclick=novo() style=padding:10px>Reiniciar</button><script>let b,fim;const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];function v(b){for(const[a,c,d]of L)if(b[a]&&b[a]==b[c]&&b[a]==b[d])return b[a];return b.includes('')?null:'E'}function mm(b,p){const r=v(b);if(r)return{s:r=='O'?1:r=='X'?-1:0};let best=null;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;const s=mm(b,p=='O'?'X':'O').s;b[i]='';if(!best||(p=='O'?s>best.s:s<best.s))best={s,i}}return best}function desenha(){t.innerHTML='';b.forEach((x,i)=>{const e=document.createElement('button');e.textContent=x;e.onclick=()=>jogar(i);t.append(e)})}function jogar(i){if(fim||b[i])return;b[i]='X';let r=v(b);if(!r){b[mm(b,'O').i]='O';r=v(b)}desenha();if(r){fim=1;m.textContent=r=='E'?'Empate!':r=='X'?'Você ganhou!':'Eu ganhei!'}}function novo(){b=Array(9).fill('');fim=0;m.textContent='Sua vez (X)';desenha()}novo()</script>")],
  calculadora: ["calculadora.html", H("Calculadora", "#c{width:280px;margin:30px auto}#d{width:100%;font-size:28px;text-align:right;padding:12px;box-sizing:border-box;border-radius:10px;border:0}#g{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}#g button{padding:16px;font-size:20px}", "<div id=c><input id=d readonly><div id=g></div></div><script>'789/456*123-0.C+='.split('').forEach(k=>{const b=document.createElement('button');b.textContent=k;b.onclick=()=>{if(k=='C')d.value='';else if(k=='=')try{d.value=Function('return '+d.value)()}catch{d.value='Erro'}else d.value+=k};g.append(b)})</script>")],
  tarefas: ["tarefas.html", H("Tarefas", "body{max-width:420px;margin:20px auto;text-align:left;padding:0 12px}input{width:65%;padding:10px;border-radius:8px;border:0}button{padding:10px}li{margin:8px 0}.f{text-decoration:line-through;opacity:.5}", "<h2>Minhas tarefas</h2><input id=i placeholder='Nova tarefa'> <button onclick=add()>Adicionar</button><p style=font-size:12px>Toque = feita • Toque duplo = apagar</p><ul id=l></ul><script>let T=[];try{T=JSON.parse(localStorage.getItem('t')||'[]')}catch{}function r(){l.innerHTML='';T.forEach((x,n)=>{const e=document.createElement('li');e.textContent=x.t;if(x.f)e.className='f';e.onclick=()=>{x.f=!x.f;s()};e.ondblclick=()=>{T.splice(n,1);s()};l.append(e)})}function s(){try{localStorage.setItem('t',JSON.stringify(T))}catch{}r()}function add(){if(i.value.trim()){T.push({t:i.value.trim(),f:0});i.value='';s()}}r()</script>")],
  adivinhacao: ["adivinhe-o-numero.html", H("Adivinhe", "body{margin-top:40px}input,button{padding:12px;font-size:18px;border-radius:8px;border:0}", "<h2>Adivinhe o número (1 a 100)</h2><input id=n type=number> <button onclick=t()>Chutar</button><p id=m></p><script>let s=Math.ceil(Math.random()*100),c=0;function t(){const v=+n.value;c++;m.textContent=v==s?'Acertou em '+c+' tentativas! 🎉':v<s?'Maior ⬆️':'Menor ⬇️';if(v==s){s=Math.ceil(Math.random()*100);c=0}}</script>")],
  pagina: ["meu-site.html", H("Meu site", "header{padding:60px 20px;background:linear-gradient(#5141a0,#10111a)}button{padding:14px 22px;font-size:16px}section{padding:24px 20px;max-width:600px;margin:auto}", "<header><h1>Meu site</h1><p>Uma frase que explica o que você faz.</p><button onclick=\"alert('Olá!')\">Começar</button></header><section><h2>Sobre</h2><p>Escreva aqui sobre você ou seu projeto.</p></section>")]
};
function criar(p) {
  const k = has(p, /velha/) ? "velha" : has(p, /calculadora/) ? "calculadora" : has(p, /tarefa|todo|lista/) ? "tarefas" : has(p, /adivinh|numero/) ? "adivinhacao" : has(p, /site|pagina|tela|landing/) ? "pagina" : null;
  if (!k) return "Sei montar prontos: jogo da velha, calculadora, lista de tarefas, adivinhe o número e uma página/tela. Diga, por exemplo: crie uma calculadora.";
  const [nome, cod] = TEMPLATES[k];
  return "Aqui está o arquivo " + nome + ". Cole num arquivo com esse nome e abra no navegador (ou suba no GitHub Pages):\n\n```html\n" + cod + "\n```\n\nPara mudar cores e textos, edite o trecho <style> e os textos entre as tags.";
}

const PASSOS = [
 ["index.html: a tela do chat (campo, botão e área de mensagens)", "Crie um input, um botão e uma div. Ao clicar, pegue o texto, mostre na div e chame uma função responder(texto).\n\n```html\n<div id=\"chat\"></div>\n<input id=\"i\"><button id=\"b\">Enviar</button>\n<script>\nb.onclick = () => {\n  chat.innerHTML += \"<p>\" + i.value + \"</p>\";\n  i.value = \"\";\n};\n</script>\n```"],
 ["brain.js: o cérebro (regras e intenção)", "Crie normalize(texto) (minúsculas, sem acento), uma lista de regras {padrão, resposta} e think(msg), que devolve a resposta da primeira regra que bater ou null.\n\n```js\nconst regras = [{ p: /oi|ola/, r: \"Olá!\" }];\nexport const think = m => (regras.find(x => x.p.test(m)) || {}).r || null;\n```"],
 ["Memória: guardar o que ela aprende", "Use localStorage.setItem com JSON.stringify e carregue com JSON.parse dentro de try/catch. O comando ensine: pergunta => resposta guarda pares pergunta/resposta."],
 ["saber.js: pesquisar e resumir", "Faça fetch na API da Wikipédia (api.php?action=query&origin=*), pegue o texto e escolha as frases que têm as palavras da pergunta."],
 ["arquivos.js: pastas", "Salve objetos {nome, pasta, texto} numa lista no localStorage. /arquivos lista agrupando por pasta; nomes como Estudos/IA criam pastas dentro de pastas."],
 ["mente.js: contexto", "Guarde o último texto e o último assunto. Assim ela entende “esse texto”, “mais”, “detalhe” e “passo 3”."],
 ["Evoluir", "Adicione TF-IDF (palavras raras valem mais) para achar a resposta mais parecida, mais exemplos ensinados e, no futuro, um modelo pequeno no navegador."]
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
/* Evita confundir "cliquei/toquei no módulo" (ação na tela, menu do app) com o
   tópico de programação "módulo" (import/export). Só entra na base de
   programação se a frase não falar de clicar/apertar/tocar em algo da tela. */
const ACAO_TELA = /\b(cliquei|clique|cliquem|clicar|clica|cliquei nisso|toquei|toca|tocar|apertei|aperta|apertar|botao|botão|menu|aba|tela|opcao|opção)\b/;
function topico(i, p) {
  const [, b, ex, av] = KB[i], fundo = has(p, /avancad|profund|detalhad|completo/);
  ctx.ultimo = { t: "prog", i };
  const assunto = b.slice(3, 28);
  ctx.assuntos = (ctx.assuntos || []).filter(a => a !== assunto);
  ctx.assuntos.push(assunto);
  ctx.assuntos = ctx.assuntos.slice(-10);
  persist();
  return b + "\n\n```" + (i === 17 ? "python" : "js") + "\n" + ex + "\n```" + (fundo ? "\n\n" + av : "\n\nDiga “mais” para o nível avançado ou “outro exemplo”.");
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
    if (has(p, /^ ?(exemplo|outro exemplo|mostra|mostre|codigo|me mostra) ?$/)) return "```js\n" + KB[u.i][2] + "\n```\nTente mudar os valores e ver o que acontece. 😉";
  }
  return null;
}
function ajudaProg(p) {
  ctx.esperando = "prog"; persist();
  return "Claro! 💻 Me diga o que você quer:\n• aprender um assunto (ex.: “o que é função?”)\n• corrigir um erro (cole a mensagem de erro ou o código)\n• criar algo (ex.: “crie uma calculadora”)\n\nLinguagens que conheço: JavaScript, Python, HTML, CSS e SQL.\nAssuntos: " + ASSUNTOS + ".";
}
/* ---------- principal ---------- */
function responder(msg) {
  const raw = String(msg || "").trim();
  const cp = comandoPasta(raw); if (cp) return { texto: cp, origem: "📂 pastas" };
  const mv = raw.match(/^\/palavra\s+(\S+)\s*=\s*(.+)$/i);
  if (mv) { const k = mv[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); ctx.vocab[k] = prep(mv[2]).trim(); persist(); return { texto: "📚 Aprendi: “" + k + "” = “" + ctx.vocab[k] + "”.\nAgora entendo isso em qualquer frase.", origem: "📚 vocabulário" }; }
  if (/^\/palavras$/i.test(raw)) return { texto: "📚 Sei " + (Object.keys(VOCAB).length + Object.keys(ctx.vocab).length) + " gírias e abreviações (como vc, pq, oque, hj, blz, tbm).\nEnsine mais: /palavra tbm = também", origem: "📚 vocabulário" };
  if (raw.length > 160) return null;
  const p = prep(raw), w = p.trim();

  if (ctx.jogo) { const r = jogar(w, raw); if (r) return { texto: r, origem: "🎮 jogo" }; }

  const mat = raw.match(/^(?:quanto (?:e|é)\s+|calcule\s+|calcula\s+)?([\d\s+\-*/x×÷().,]{3,})\??$/i);
  if (mat && /[+\-*/x×÷]/.test(mat[1].replace(/^\s*-/, "")) && /\d/.test(mat[1])) {
    const ex = mat[1].replace(/[x×]/gi, "*").replace(/÷/g, "/").replace(/,/g, ".");
    if (/^[\d+\-*/().\s]+$/.test(ex)) { try { const v = Function("return (" + ex + ")")(); if (isFinite(v)) return { texto: "🧮 " + mat[1].trim() + " = " + +v.toFixed(8), origem: "🧮 conta" }; } catch {} }
  }

  const sg = seguimento(p, w); if (sg) return { texto: sg, origem: "🧠 lembrei do assunto" };
  const criarV = has(p, / (cria|crie|criar|faz|faca|fazer|monta|monte|gera|gere|programa|programe|constroi) /);
  if (criarV && has(p, / (jogo|jogos|app|aplicativo|tela|site|pagina|calculadora|tarefas|lista de tarefas|landing) /)) return { texto: criar(p), origem: "🛠️ criador de apps" };
  const nomeJogo = w.split(" ").length <= 5 && has(p, /(forc|velh|adivinh|numero|quiz)/) && !criarV;
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
  if (has(p, / (manda|mande|envia|reenvia|repete|coloca) /) && has(p, / (codigo|texto|isso|arquivo) /) && has(p, / (de novo|novamente|outra vez|ai|aqui) /)) {
    if (!ctx.texto) return { texto: "Não tenho nenhum texto ou código guardado agora. Cole ou anexe de novo. 📎", origem: "🧠 contexto" };
    const lang = Saber.isCode(ctx.texto) ? "js" : "txt";
    return { texto: "📄 " + ctx.nome + "\n\n```" + lang + "\n" + ctx.texto.slice(0, 3500) + (ctx.texto.length > 3500 ? "\n\n[...]" : "") + "\n```", origem: "📄 reenvio" };
  }
  /* "qual o nome desse filme/vídeo" depois de enviar uma foto/vídeo: ela ainda
     não reconhece o conteúdo de imagens além de texto escrito, nem vídeos.
     Antes isso virava uma pesquisa aleatória na internet; agora ela avisa. */
  if (ctx.ultimoMidia && (!ctx.texto) && has(p, / (esse|essa|esses|essas|este|nesse|nessa) /) && has(p, / (filme|video|cena|imagem|foto|pessoa|objeto|lugar) /)) {
    return {
      texto: ctx.ultimoMidia.tipo === "video"
        ? "Eu ainda não reconheço o que acontece dentro de um vídeo (cenas, pessoas, objetos) — só consigo descrever duração, cores e iluminação. 🎬"
        : "Nessa imagem eu só leio texto escrito, se houver. Ainda não reconheço pessoas, objetos ou do que se trata uma foto. 🖼️",
      origem: "🧠 contexto"
    };
  }
  const PEDIDO_TEXTO_BARE = /^ ?(resum\w*|revis\w*|analis\w*|conserta\w*|arruma\w*)(\s+(isso|esse texto|esse codigo|o codigo|o texto))? ?$/;
  if (PEDIDO_TEXTO_BARE.test(p) || (has(p, / (esse|este|isso|texto|codigo|arquivo|ele) /) && has(p, /(o que e|explica|explique|resum|o que faz|pra que serve|erro|problema|entend|leia|le |analis|revis|conserta|arruma)/))) {
    if (!ctx.texto) return { texto: "Ainda não tenho nenhum texto seu. Cole o texto aqui ou anexe um arquivo no botão + e depois me pergunte. 📎", origem: "🧠 contexto" };
    return { texto: sobreTexto(p), origem: "📖 leitura do seu texto" };
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
  if (has(p, /(programa|codigo|codar|codificar|desenvolv)/) && has(p, /(ajud|ensin|aprend|duvida|como|quero|preciso)/)) return { texto: ajudaProg(p), origem: "💻 programação" };
  const cap = p.match(/^ (?:voce )?(?:sabe|consegue|pode|poderia|sabe me) (.+)/);
  if (cap && !has(p, / (horas|hora) /)) {
    const x = cap[1].trim();
    if (has(p, / (programar|codigo|codar|jogar|resumir|pesquisar|escrever|criar|calcular|ler|traduzir) /) && !has(p, / (quadro|desenho|musica|carro|cozinhar|dancar|cantar) /)) return { texto: "Sim! 😊 Eu sei: programar (JS, Python, HTML, CSS, SQL), jogar (forca, velha, quiz, adivinhação), resumir e revisar textos, criar apps prontos, pesquisar na internet, contar e guardar arquivos em pastas.\nDiga o que quer fazer!", origem: "🧠 minhas habilidades" };
    lembrarTema("como " + x); return { pesquisa: "como " + x, fundo: true };
  }
  if (ctx.tema && has(p, / (essa|essas|esse|esses|isso|isto|disso|dele|dela|deles|delas|nisso|aquilo|ele|ela|eles|elas) /) && (pergunta(raw) || has(p, / (faz|fazem|serve|servem|significa) /))) {
    const PR = new Set("essa essas esse esses isso isto disso dele dela deles delas nisso aquilo ele ela eles elas faz fazem fazer serve servem o que e sao por para qual quais como me explica".split(" "));
    const seen = new Set(prep(ctx.tema).split(" ")), novo = p.trim().split(" ").filter(w => !PR.has(w) && !seen.has(w) && w.length > 2);
    if (!novo.length) return { texto: "Estamos falando de “" + ctx.tema + "”. O que você quer saber sobre isso? Por exemplo: significado, origem, como funciona ou para que serve. 🤔", origem: "🧠 lembrei do assunto" };
    return { pesquisa: ctx.tema + " " + novo.join(" "), fundo: true };
  }
  if (pergunta(raw) && !has(p, / (voce|horas|hora|dia|data|bach|meu nome|seu nome) /)) { const tm = tema(raw); if (tm.length > 2) { lembrarTema(tm); return { pesquisa: tm, fundo: true }; } }
  if (ctx.esperando === "prog") { ctx.esperando = null; if (w.split(" ").length <= 3 && w.length > 3) return { pesquisa: w + " programação", fundo: false }; }
  return null;
}
const SMALL = /(tudo bem|como vai|como voce|e voce|bom dia|boa tarde|boa noite|voce esta|voce e |que bom|tudo certo)/;
const pergunta = t => { const p = prep(t); if (has(p, SMALL)) return false; return has(p, /^ ?(o que|quem|quais|qual|quantos|quantas|quanto|onde|quando|como|por que|porque|para que|me explica|explique|explica|fale sobre|fala sobre|fala de|me fala|diga)/) || (/\?\s*$/.test(String(t)) && p.trim().split(" ").length >= 3); };

const stats = () => ({ girias: Object.keys(VOCAB).length, lexBase: BASE_LEX.length, kbProg: KB.length, erros: ERROS.length, jogos: 4, modelosApps: Object.keys(TEMPLATES).length, pasta: ctx.pasta, tema: ctx.tema });
const jogando = () => !!ctx.jogo;
export const Mente = { jogando, responder, setTexto, pasta, pergunta, tema, lembrarTema, stats };
