/* BACH AI 4.8 — Executor Seguro de Scripts & Preview de Apps (Sandbox)
 * Executa código JavaScript em iframe isolado (sandbox="allow-scripts", sem acesso aos dados da BACH)
 * e renderiza aplicativos HTML/CSS/JS ao vivo dentro do chat e em tela cheia isolada.
 */

function extrairCodigoDoTexto(raw) {
  const s = String(raw || "").trim();
  const bloco = s.match(/```(?:[\w+-]*)\n([\s\S]*?)```/);
  if (bloco) return bloco[1].trim();
  return s
    .replace(/^\/(?:executar|rodar|run|preview)\s*:?\s*/i, "")
    .trim();
}

function ehHTML(codigo) {
  return /<!doctype html>|<html\b|<body\b|<div\b|<button\b|<canvas\b|<style\b/i.test(codigo);
}

function pareceBashOuPython(codigo) {
  const s = String(codigo || "");
  if (/^#!\/.*(bash|sh|python)/m.test(s) || /\b(pkg install|apt update|apt-get|chmod \+x|pip install|npm install|termux-)\b/.test(s)) {
    return "bash";
  }
  if (/\bdef\s+\w+\([^)]*\)\s*:|\bimport\s+(?:os|sys|math|random|requests|json)\b|\bprint\s*\(/.test(s) && !/;/.test(s)) {
    return "python";
  }
  return null;
}

function executarJS(codigo, timeoutMs = 4000) {
  return new Promise(resolve => {
    const id = "sb_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.style.display = "none";

    let terminado = false;
    const logs = [];

    const limpar = () => {
      window.removeEventListener("message", onMsg);
      clearTimeout(timer);
      frame.remove();
    };

    const onMsg = ev => {
      if (!ev.data || ev.data.id !== id) return;
      if (ev.data.tipo === "log") {
        logs.push(ev.data.txt);
      } else if (ev.data.tipo === "fim") {
        if (terminado) return;
        terminado = true;
        limpar();
        resolve({ ok: true, logs, retorno: ev.data.retorno, ms: ev.data.ms });
      } else if (ev.data.tipo === "erro") {
        if (terminado) return;
        terminado = true;
        limpar();
        resolve({ ok: false, logs, erro: ev.data.erro });
      }
    };

    const timer = setTimeout(() => {
      if (terminado) return;
      terminado = true;
      limpar();
      resolve({ ok: false, logs, erro: "Tempo limite de " + (timeoutMs / 1000) + "s atingido (possível loop infinito)." });
    }, timeoutMs);

    window.addEventListener("message", onMsg);

    const safeCode = JSON.stringify(String(codigo || ""));
    frame.srcdoc = `<!DOCTYPE html><html><script>
const ID = ${JSON.stringify(id)};
const fmt = v => {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
};
const enviar = (tipo, dados) => parent.postMessage(Object.assign({ id: ID, tipo }, dados), "*");
console.log = (...a) => enviar("log", { txt: a.map(fmt).join(" ") });
console.warn = (...a) => enviar("log", { txt: "⚠️ " + a.map(fmt).join(" ") });
console.error = (...a) => enviar("log", { txt: "❌ " + a.map(fmt).join(" ") });
const t0 = performance.now();
try {
  const fn = new Function(${safeCode});
  const res = fn();
  enviar("fim", { retorno: res === undefined ? null : fmt(res), ms: Math.round(performance.now() - t0) });
} catch (e) {
  enviar("erro", { erro: (e && e.name ? e.name + ": " : "") + (e && e.message ? e.message : String(e)) });
}
<\/script></html>`;

    document.body.appendChild(frame);
  });
}

function abrirTelaCheiaSegura(html, titulo) {
  const back = document.createElement("div");
  back.style.cssText = "position:fixed;inset:0;z-index:99;background:rgba(8,9,18,.94);display:flex;flex-direction:column;padding:10px;gap:8px";

  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;color:#fff;font-size:14px;font-weight:bold";

  const span = document.createElement("span");
  span.textContent = titulo;

  const btnFechar = document.createElement("button");
  btnFechar.textContent = "✕ Fechar";
  btnFechar.style.cssText = "padding:6px 12px;border-radius:10px;border:0;background:#c0392b;color:#fff;font-weight:bold;cursor:pointer";
  btnFechar.onclick = () => back.remove();

  bar.append(span, btnFechar);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts allow-forms");
  iframe.style.cssText = "flex:1;width:100%;border:1px solid rgba(138,118,255,.35);border-radius:12px;background:#0e1020";
  iframe.srcdoc = html;

  back.append(bar, iframe);
  document.body.appendChild(back);
}

function criarCardPreview(html, titulo = "▶️ Preview ao vivo (Sandbox)") {
  const wrap = document.createElement("div");
  wrap.className = "cartao";
  wrap.style.width = "100%";

  const top = document.createElement("div");
  top.className = "topo";
  const span = document.createElement("span");
  span.textContent = titulo;

  const btnRecarregar = document.createElement("button");
  btnRecarregar.textContent = "🔄 Reiniciar";
  const btnTela = document.createElement("button");
  btnTela.textContent = "⛶ Tela cheia";

  top.append(span, btnRecarregar, btnTela);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts allow-forms");
  iframe.style.width = "100%";
  iframe.style.height = "360px";
  iframe.style.border = "0";
  iframe.style.background = "#0e1020";
  iframe.style.display = "block";
  iframe.srcdoc = html;

  btnRecarregar.onclick = () => { iframe.srcdoc = html; };
  btnTela.onclick = () => abrirTelaCheiaSegura(html, titulo);

  wrap.append(top, iframe);
  return wrap;
}

function detectarPedido(raw) {
  const s = String(raw || "").trim();
  if (/^\/(executar|rodar|run|preview)\b/i.test(s)) return true;
  if (/^(?:roda|rode|rodar|executa|execute|executar|testa|teste|testar|abre|abrir)\s+(?:esse|este|o)?\s*(?:codigo|script|app|html|programa|preview)\b/i.test(s)) return true;
  return false;
}

async function executar(raw, ctx = {}) {
  const s = String(raw || "").trim();
  let codigo = extrairCodigoDoTexto(s);

  if (!codigo || /^(?:esse|este|o)?\s*(?:codigo|script|app|html|programa|preview)$/i.test(codigo)) {
    codigo = ctx.ultimoArquivo?.texto || "";
  }

  if (!codigo) {
    return {
      texto: "▶️ **Executor Seguro (Sandbox):**\n" +
        "Cole o código depois do comando para rodar ao vivo!\n" +
        "• `/executar console.log(2 + 2)` — roda JavaScript isolado\n" +
        "• `/preview <h1>Oi!</h1>` — abre o app HTML/CSS/JS na tela\n" +
        "• Ou peça um app (ex.: `/app pomodoro`) e eu já abro funcionando!"
    };
  }

  const outro = pareceBashOuPython(codigo);
  if (outro === "bash") {
    return {
      texto: "📱 **Script Termux / Bash detectado:**\n" +
        "Por segurança do Android/iOS, o navegador não executa comandos diretamente no sistema.\n\n" +
        "Para rodar no seu **Termux**:\n```bash\ncat << 'EOF' > script.sh\n" + codigo.slice(0, 2000) + "\nEOF\nchmod +x script.sh && ./script.sh\n```"
    };
  }
  if (outro === "python") {
    return {
      texto: "🐍 **Script Python detectado:**\n" +
        "O navegador não tem interpretador Python nativo embutido aqui, mas no **Termux** você roda em 1 comando:\n```bash\ncat << 'EOF' > app.py\n" + codigo.slice(0, 2000) + "\nEOF\npython app.py\n```"
    };
  }

  if (ehHTML(codigo)) {
    return {
      texto: "▶️ **App HTML/CSS/JS iniciado no Preview Isolado!** Teste direto abaixo ou toque em **⛶ Tela cheia**.",
      previewHtml: codigo,
      previewTitle: "▶️ App em execução (Sandbox)"
    };
  }

  const res = await executarJS(codigo);
  if (!res.ok) {
    return {
      texto: "❌ **Erro ao executar JavaScript (" + (res.logs.length ? res.logs.length + " log(s) antes do erro" : "falha") + "):**\n\n" +
        (res.logs.length ? "📋 **Console:**\n```txt\n" + res.logs.join("\n") + "\n```\n\n" : "") +
        "🚨 `" + res.erro + "`"
    };
  }

  const saida = [];
  if (res.logs.length) saida.push("📋 **Console (`console.log`):**\n```txt\n" + res.logs.join("\n") + "\n```");
  if (res.retorno !== null) saida.push("↩️ **Retorno:** `" + res.retorno + "`");
  if (!saida.length) saida.push("✅ Código executado sem erros (nenhum `console.log` ou retorno exibido).");

  return {
    texto: "▶️ **Script JavaScript executado com sucesso** (" + res.ms + " ms):\n\n" + saida.join("\n\n")
  };
}

export const ExecutorSandbox = {
  detectarPedido,
  executar,
  executarJS,
  criarCardPreview
};
