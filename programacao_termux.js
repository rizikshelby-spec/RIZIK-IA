/* BACH AI 4.8 — Programação Completa, Termux, Bash, Python, Node & Gerador Autônomo de Apps
 * Cria aplicativos HTML/CSS/JS completos e funcionais sob demanda e ensina/gera scripts Termux.
 */

const norm = s => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const GUIAS_TERMUX = [
  [/\b(comecar|instalar|basico|o que e|comandos|ajuda|tudo)\b.*\btermux\b|\btermux\b.*\b(comecar|basico|comandos|ajuda|tudo)\b|^termux$/,
   "📱 **GUIA COMPLETO DE TERMUX (Android):**\n\n" +
   "**1. Primeira configuração (obrigatória):**\n" +
   "```bash\npkg update && pkg upgrade -y\ntermux-setup-storage\n```\n" +
   "**2. Instalar ferramentas principais:**\n" +
   "```bash\npkg install git python nodejs nano curl wget openssh -y\n```\n" +
   "**3. Comandos essenciais de pasta/arquivo:**\n" +
   "• `pwd` (onde estou) • `ls -la` (listar tudo)\n" +
   "• `cd pasta` (entrar) • `cd ..` (voltar) • `cd ~` (início)\n" +
   "• `mkdir projeto` (criar pasta) • `touch app.py` (criar arquivo)\n" +
   "• `nano app.py` (editar: Ctrl+O salva, Ctrl+X sai)\n" +
   "• `rm -rf pasta` (apagar pasta — cuidado!)\n\n" +
   "**4. Rodar um servidor web no celular:**\n" +
   "```bash\npython -m http.server 8080\n```\n" +
   "Depois abra `http://localhost:8080` no navegador!\n\n" +
   "💡 Peça coisas específicas como: `termux python`, `termux node`, `termux git`, `script termux backup` ou `criar script sh`."],

  [/\btermux\b.*\b(python|pip|flask|bot)\b|\bpython\b.*\btermux\b/,
   "🐍 **Python no Termux:**\n```bash\npkg install python -y\npython --version\npip install --upgrade pip\n```\nPara criar um ambiente virtual e rodar scripts:\n```bash\npython -m venv venv\nsource venv/bin/activate\npip install requests flask\npython meu_script.py\n```"],

  [/\btermux\b.*\b(node|nodejs|npm|javascript|js|express)\b|\b(node|nodejs)\b.*\btermux\b/,
   "🟢 **Node.js no Termux:**\n```bash\npkg install nodejs-lts -y\nnode -v && npm -v\nmkdir meu-app && cd meu-app\nnpm init -y\n```\nPara rodar um servidor Express ou script:\n```bash\nnode index.js\n```"],

  [/\btermux\b.*\b(git|github|clonar|clone|push)\b/,
   "🌿 **Git e GitHub no Termux:**\n```bash\npkg install git -y\ngit config --global user.name \"Seu Nome\"\ngit config --global user.email \"seu@email.com\"\ngit clone https://github.com/usuario/repositorio.git\n```\nPara enviar alterações:\n```bash\ngit add .\ngit commit -m \"atualizacao\"\ngit push\n```"],

  [/\btermux\b.*\b(ssh|servidor|acesso remoto|tmux)\b/,
   "🔐 **SSH & Sessões em 2º Plano (`tmux`) no Termux:**\n```bash\npkg install openssh tmux -y\npasswd          # define sua senha\nsshd            # inicia servidor SSH na porta 8022\nwhoami          # descobre seu usuário (ex: u0_a123)\n```\nNo PC, conecte com: `ssh -p 8022 USUARIO@IP_DO_CELULAR`\nPara deixar rodando em segundo plano: `tmux new -s robo` (Ctrl+B depois D minimiza; `tmux attach -t robo` volta)."],

  [/\b(script|criar script|fazer script)\b.*\b(sh|bash|linux|termux|automacao)\b|\b(chmod|shebang|bash)\b/,
   "📜 **Como criar e executar um Script `.sh` no Termux/Linux:**\n\n1. Crie o arquivo `nano rodar.sh`:\n```bash\n#!/data/data/com.termux/files/usr/bin/bash\necho \"🚀 Iniciando tarefa...\"\ndate\npkg list-installed | head -n 10\n```\n2. Dê permissão de execução e rode:\n```bash\nchmod +x rodar.sh\n./rodar.sh\n```\n*(No Linux padrão, a 1ª linha é `#!/usr/bin/env bash`.)*"]
];

function montarHTML(titulo, css, body, script) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titulo}</title>
<style>
*{box-sizing:border-box;font-family:Arial,sans-serif}
body{margin:0;min-height:100vh;background:#0e1020;color:#f4f5ff;padding:18px;display:flex;flex-direction:column;align-items:center}
.card{width:100%;max-width:480px;background:rgba(255,255,255,.06);border:1px solid rgba(138,118,255,.35);border-radius:16px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
h1{margin:0 0 12px;font-size:20px;color:#fff;text-align:center}
input,select,textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.35);color:#fff;font-size:15px;margin-bottom:10px}
button{padding:10px 14px;border:0;border-radius:10px;background:linear-gradient(135deg,#8266ff,#e056fd);color:#fff;font-weight:bold;cursor:pointer}
button.sec{background:rgba(255,255,255,.12)}
${css}
</style>
</head>
<body>
${body}
<script>
${script}
<\/script>
</body>
</html>`;
}

function appPomodoro() {
  return montarHTML(
    "Timer Pomodoro",
    ".tempo{font-size:52px;font-weight:bold;text-align:center;margin:16px 0;letter-spacing:2px}.row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}",
    `<div class="card">
      <h1>⏱️ Timer Pomodoro</h1>
      <div class="tempo" id="t">25:00</div>
      <div class="row">
        <button onclick="iniciar()">▶ Iniciar</button>
        <button class="sec" onclick="pausar()">⏸ Pausar</button>
        <button class="sec" onclick="modo(25)">Foco 25m</button>
        <button class="sec" onclick="modo(5)">Pausa 5m</button>
      </div>
    </div>`,
    `let seg = 25 * 60, iv = null;
function desenha() {
  const m = String(Math.floor(seg / 60)).padStart(2, "0");
  const s = String(seg % 60).padStart(2, "0");
  document.getElementById("t").textContent = m + ":" + s;
}
function iniciar() {
  if (iv) return;
  iv = setInterval(() => {
    if (seg > 0) { seg--; desenha(); }
    else { pausar(); alert("⏰ Tempo concluído!"); }
  }, 1000);
}
function pausar() { clearInterval(iv); iv = null; }
function modo(min) { pausar(); seg = min * 60; desenha(); }`
  );
}

function appNotas() {
  return montarHTML(
    "Bloco de Notas",
    ".item{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px;background:rgba(0,0,0,.28);border-radius:10px;margin-top:8px}.item span{flex:1;white-space:pre-wrap}",
    `<div class="card">
      <h1>📝 Bloco de Notas</h1>
      <textarea id="txt" rows="3" placeholder="Escreva sua anotação..."></textarea>
      <button style="width:100%" onclick="add()">💾 Salvar Nota</button>
      <div id="lista"></div>
    </div>`,
    `let notas = [];
try { notas = JSON.parse(localStorage.getItem("app_notas_v1") || "[]"); } catch {}
function salvar() { try { localStorage.setItem("app_notas_v1", JSON.stringify(notas)); } catch {} }
function render() {
  const el = document.getElementById("lista");
  el.innerHTML = "";
  notas.forEach((n, i) => {
    const d = document.createElement("div"); d.className = "item";
    const s = document.createElement("span"); s.textContent = n;
    const b = document.createElement("button"); b.className = "sec"; b.textContent = "🗑";
    b.onclick = () => { notas.splice(i, 1); salvar(); render(); };
    d.append(s, b); el.append(d);
  });
}
function add() {
  const i = document.getElementById("txt");
  if (!i.value.trim()) return;
  notas.unshift(i.value.trim()); i.value = ""; salvar(); render();
}
render();`
  );
}

function appFinancas() {
  return montarHTML(
    "Controle de Gastos",
    ".saldo{font-size:28px;font-weight:bold;text-align:center;margin:10px 0 14px}.row{display:flex;gap:8px;margin-bottom:10px}.item{display:flex;justify-content:space-between;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.28);margin-top:6px}",
    `<div class="card">
      <h1>💰 Controle Financeiro</h1>
      <div class="saldo" id="saldo">R$ 0,00</div>
      <input id="desc" placeholder="Descrição (ex: Salário, Mercado)">
      <input id="val" type="number" step="0.01" placeholder="Valor (ex: 50)">
      <div class="row">
        <button style="flex:1" onclick="add(1)">+ Entrada</button>
        <button style="flex:1;background:#d63031" onclick="add(-1)">- Gasto</button>
      </div>
      <div id="lista"></div>
    </div>`,
    `let itens = [];
try { itens = JSON.parse(localStorage.getItem("app_fin_v1") || "[]"); } catch {}
function salvar() { try { localStorage.setItem("app_fin_v1", JSON.stringify(itens)); } catch {} }
function fmt(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function render() {
  const total = itens.reduce((a, b) => a + b.v, 0);
  const s = document.getElementById("saldo");
  s.textContent = fmt(total); s.style.color = total >= 0 ? "#2ecc71" : "#ff6b6b";
  const l = document.getElementById("lista"); l.innerHTML = "";
  itens.forEach((x, i) => {
    const d = document.createElement("div"); d.className = "item";
    const t = document.createElement("span"); t.textContent = x.d + " (" + fmt(x.v) + ")";
    const b = document.createElement("button"); b.className = "sec"; b.textContent = "✕";
    b.onclick = () => { itens.splice(i, 1); salvar(); render(); };
    d.append(t, b); l.append(d);
  });
}
function add(sinal) {
  const d = document.getElementById("desc"), v = document.getElementById("val");
  const num = Number(v.value);
  if (!d.value.trim() || !(num > 0)) return;
  itens.unshift({ d: d.value.trim(), v: num * sinal });
  d.value = ""; v.value = ""; salvar(); render();
}
render();`
  );
}

function appCobrinha() {
  return montarHTML(
    "Jogo da Cobrinha",
    "canvas{background:#05060e;border:2px solid #8266ff;border-radius:12px;display:block;margin:10px auto}.ctrl{display:grid;grid-template-columns:repeat(3,56px);gap:6px;justify-content:center;margin-top:8px}.ctrl button{padding:12px;font-size:18px}",
    `<div class="card">
      <h1>🐍 Jogo da Cobrinha — Pontos: <span id="pts">0</span></h1>
      <canvas id="c" width="280" height="280"></canvas>
      <div class="ctrl">
        <span></span><button onclick="dir(0,-1)">⬆️</button><span></span>
        <button onclick="dir(-1,0)">⬅️</button><button onclick="dir(0,1)">⬇️</button><button onclick="dir(1,0)">➡️</button>
      </div>
    </div>`,
    `const cv = document.getElementById("c"), ctx = cv.getContext("2d"), T = 20, N = 14;
let cobra = [{x:7,y:7}], dx = 1, dy = 0, maca = {x:3,y:3}, pts = 0;
function dir(x, y) { if (dx !== -x || dy !== -y) { dx = x; dy = y; } }
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") dir(0, -1);
  if (e.key === "ArrowDown") dir(0, 1);
  if (e.key === "ArrowLeft") dir(-1, 0);
  if (e.key === "ArrowRight") dir(1, 0);
});
setInterval(() => {
  const cab = { x: (cobra[0].x + dx + N) % N, y: (cobra[0].y + dy + N) % N };
  if (cobra.some(p => p.x === cab.x && p.y === cab.y)) {
    cobra = [{x:7,y:7}]; pts = 0; document.getElementById("pts").textContent = 0; return;
  }
  cobra.unshift(cab);
  if (cab.x === maca.x && cab.y === maca.y) {
    pts++; document.getElementById("pts").textContent = pts;
    maca = { x: Math.floor(Math.random()*N), y: Math.floor(Math.random()*N) };
  } else cobra.pop();
  ctx.clearRect(0, 0, 280, 280);
  ctx.fillStyle = "#ff4fd8"; ctx.fillRect(maca.x*T, maca.y*T, T-2, T-2);
  ctx.fillStyle = "#8266ff"; cobra.forEach(p => ctx.fillRect(p.x*T, p.y*T, T-2, T-2));
}, 145);`
  );
}

function appGenerico(tema) {
  const titulo = tema.charAt(0).toUpperCase() + tema.slice(1);
  const safeKey = "bach_custom_" + norm(tema).replace(/[^a-z0-9]/g, "_").slice(0, 24);
  return montarHTML(
    titulo,
    ".row{display:flex;gap:8px;margin-bottom:10px}.item{display:flex;align-items:center;gap:8px;padding:10px;background:rgba(0,0,0,.28);border-radius:10px;margin-top:8px}.item.ok span{text-decoration:line-through;opacity:.55}.item span{flex:1}.info{font-size:12px;color:#b4b8d8;margin-bottom:10px;text-align:center}",
    `<div class="card">
      <h1>✨ ${titulo}</h1>
      <div class="info">App gerado pela BACH AI • Dados salvos no navegador</div>
      <div class="row">
        <input id="inp" style="margin:0" placeholder="Adicionar item em ${titulo}...">
        <button onclick="add()">+</button>
      </div>
      <input id="busca" placeholder="🔎 Filtrar itens..." oninput="render()">
      <div id="lista"></div>
    </div>`,
    `const K = ${JSON.stringify(safeKey)};
let dados = [];
try { dados = JSON.parse(localStorage.getItem(K) || "[]"); } catch {}
function salvar() { try { localStorage.setItem(K, JSON.stringify(dados)); } catch {} }
function render() {
  const q = document.getElementById("busca").value.toLowerCase();
  const l = document.getElementById("lista"); l.innerHTML = "";
  dados.filter(x => x.t.toLowerCase().includes(q)).forEach((x) => {
    const idx = dados.indexOf(x);
    const d = document.createElement("div"); d.className = "item" + (x.ok ? " ok" : "");
    const s = document.createElement("span"); s.textContent = x.t;
    s.onclick = () => { dados[idx].ok = !dados[idx].ok; salvar(); render(); };
    const del = document.createElement("button"); del.className = "sec"; del.textContent = "🗑";
    del.onclick = () => { dados.splice(idx, 1); salvar(); render(); };
    d.append(s, del); l.append(d);
  });
}
function add() {
  const i = document.getElementById("inp");
  if (!i.value.trim()) return;
  dados.unshift({ t: i.value.trim(), ok: false });
  i.value = ""; salvar(); render();
}
render();`
  );
}

function criarAppSobMedida(pedido) {
  const t = norm(pedido);
  let html = "";
  let nome = "app-personalizado.html";

  if (/\b(pomodoro|cronometro|temporizador|timer)\b/.test(t)) {
    html = appPomodoro(); nome = "pomodoro.html";
  } else if (/\b(notas|bloco de notas|anotacoes|diario)\b/.test(t)) {
    html = appNotas(); nome = "bloco-de-notas.html";
  } else if (/\b(gastos|financas|financeiro|orcamento|dinheiro|despesas)\b/.test(t)) {
    html = appFinancas(); nome = "controle-gastos.html";
  } else if (/\b(cobrinha|snake)\b/.test(t)) {
    html = appCobrinha(); nome = "jogo-cobrinha.html";
  } else {
    const tema = pedido
      .replace(/^(?:crie|cria|criar|faz|faca|fazer|monte|monta|gere|gera|programe|desenvolva)\s+(?:um\s+|uma\s+)?(?:app|aplicativo|sistema|site|programa|jogo)\s*(?:de|sobre|para|com)?\s*/i, "")
      .trim() || "Meu App";
    html = appGenerico(tema);
    nome = (norm(tema).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "meu-app") + ".html";
  }

  return {
    texto: "🛠️ **App criado completo (`" + nome + "`):**\n\n" +
      "```html\n" + html + "\n```\n\n" +
      "▶️ Você já pode testar este app funcionando **aqui no chat** logo abaixo ou baixar/copiar o código!",
    previewHtml: html,
    previewTitle: "▶️ Preview ao vivo: " + nome
  };
}

function handle(text) {
  const raw = String(text || "").trim();
  const t = norm(raw);
  if (!t) return null;

  // 1) Guias Termux / Linux / Bash / Scripts
  for (const [re, resp] of GUIAS_TERMUX) {
    if (re.test(t)) return resp;
  }

  // 2) Pedido explícito de criar app (/app ... ou frase natural)
  let m = raw.match(/^\/app(?:\s+([\s\S]+))?$/i);
  if (m) {
    if (!m[1]) {
      return "🛠️ **Criador de Apps da BACH AI:**\n" +
        "Diga o que você quer criar! Exemplos:\n" +
        "• `/app pomodoro` (cronômetro de estudos)\n" +
        "• `/app bloco de notas`\n" +
        "• `/app controle de gastos`\n" +
        "• `/app jogo da cobrinha`\n" +
        "• `/app academia` (qualquer tema — gero HTML/CSS/JS completo e abro o preview ao vivo!)";
    }
    return criarAppSobMedida(m[1]);
  }

  if (/^(?:crie|cria|criar|faz|faca|fazer|monte|monta|gere|gera|programe|desenvolva)\s+(?:um\s+|uma\s+)?(?:app|aplicativo|sistema|programa)\b/i.test(t) &&
      !/\b(ia|inteligencia artificial|chatbot|velha|calculadora|tarefas)\b/.test(t)) {
    return criarAppSobMedida(raw);
  }

  return null;
}

export const ProgramacaoTermux = { handle, criarAppSobMedida };
