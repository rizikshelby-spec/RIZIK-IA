/* BACH AI 4.8 — Motor de Voz Natural (TTS)
 * Corrige travamentos do iOS/Safari, divide textos longos em frases curtas,
 * limpa markdown/emojis e escolhe automaticamente a melhor voz em português do Brasil.
 */

const K_RATE = "bach_voz_rate_v1";

let falando = false;
let btnAtual = null;
let fila = [];
let sessaoId = 0;
let vozEscolhida = null;

function limparParaFala(texto) {
  return String(texto || "")
    .replace(/```[\s\S]*?```/g, " (bloco de código na tela). ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/https?:\/\/\S+/g, " link ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/[*_#>|•↩]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escolherVoz() {
  if (!("speechSynthesis" in window)) return null;
  const vozes = speechSynthesis.getVoices() || [];
  if (!vozes.length) return null;

  const ptBR = vozes.filter(v => /pt[-_]br/i.test(v.lang));
  const ptGeral = vozes.filter(v => /^pt/i.test(v.lang));
  const candidatas = ptBR.length ? ptBR : ptGeral;
  if (!candidatas.length) return null;

  const preferidas = /(google português|luciana|francisca|thalita|antonio|joana|maria|felipe|natural|enhanced|premium)/i;
  vozEscolhida = candidatas.find(v => preferidas.test(v.name)) || candidatas[0];
  return vozEscolhida;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  escolherVoz();
  try {
    speechSynthesis.addEventListener?.("voiceschanged", escolherVoz);
  } catch {}
}

function getRate() {
  try {
    const r = Number(localStorage.getItem(K_RATE));
    return r >= 0.7 && r <= 1.5 ? r : 1.03;
  } catch {
    return 1.03;
  }
}

function setRate(v) {
  try { localStorage.setItem(K_RATE, String(v)); } catch {}
}

function quebrarEmTrechos(texto) {
  const limpo = limparParaFala(texto);
  if (!limpo) return [];
  const frases = limpo.match(/[^.!?;:\n]+[.!?;:\n]*/g) || [limpo];
  const out = [];
  let buf = "";

  for (const f of frases) {
    const t = f.trim();
    if (!t) continue;
    if ((buf + " " + t).length <= 170) {
      buf = buf ? buf + " " + t : t;
    } else {
      if (buf) out.push(buf);
      if (t.length <= 170) {
        buf = t;
      } else {
        const palavras = t.split(/\s+/);
        let sub = "";
        for (const p of palavras) {
          if ((sub + " " + p).length > 165) {
            if (sub) out.push(sub);
            sub = p;
          } else {
            sub = sub ? sub + " " + p : p;
          }
        }
        buf = sub;
      }
    }
  }
  if (buf) out.push(buf);
  return out.slice(0, 30);
}

function restaurarBotao() {
  if (btnAtual) {
    btnAtual.textContent = "🔊 Ouvir";
    btnAtual = null;
  }
}

function parar() {
  sessaoId++;
  falando = false;
  fila = [];
  restaurarBotao();
  if ("speechSynthesis" in window) {
    try { speechSynthesis.cancel(); } catch {}
  }
}

function falarProximo(id) {
  if (id !== sessaoId || !fila.length) {
    if (id === sessaoId) {
      falando = false;
      restaurarBotao();
    }
    return;
  }

  const trecho = fila.shift();
  const u = new SpeechSynthesisUtterance(trecho);
  const voz = vozEscolhida || escolherVoz();
  if (voz) u.voice = voz;
  u.lang = voz?.lang || "pt-BR";
  u.rate = getRate();
  u.pitch = 1.0;
  u.volume = 1.0;

  u.onend = () => {
    if (id !== sessaoId) return;
    falarProximo(id);
  };
  u.onerror = () => {
    if (id !== sessaoId) return;
    if (fila.length) falarProximo(id);
    else {
      falando = false;
      restaurarBotao();
    }
  };

  try {
    speechSynthesis.resume?.();
    speechSynthesis.speak(u);
  } catch {
    falando = false;
    restaurarBotao();
  }
}

function ler(texto, btn = null) {
  if (!("speechSynthesis" in window)) return false;

  // Se clicou no mesmo botão que já está falando, apenas para
  if (falando && btn && btn === btnAtual) {
    parar();
    return false;
  }

  const trechos = quebrarEmTrechos(texto);
  parar();
  if (!trechos.length) return false;

  falando = true;
  btnAtual = btn || null;
  if (btnAtual) btnAtual.textContent = "⏹ Parar";

  fila = trechos;
  const id = sessaoId;
  // Dispara o primeiro trecho sincronamente dentro do clique (essencial no iPhone/iOS!)
  falarProximo(id);
  return true;
}

function comando(raw) {
  const t = String(raw || "").trim().toLowerCase();
  if (/^\/voz\s+(lenta|devagar)$/i.test(t)) {
    setRate(0.88);
    return "🔊 Velocidade da voz ajustada para **mais calma** (0.88x).";
  }
  if (/^\/voz\s+normal$/i.test(t)) {
    setRate(1.03);
    return "🔊 Velocidade da voz ajustada para **natural** (1.03x).";
  }
  if (/^\/voz\s+(rapida|rápida)$/i.test(t)) {
    setRate(1.2);
    return "🔊 Velocidade da voz ajustada para **rápida** (1.2x).";
  }
  if (/^\/voz\s+teste$/i.test(t)) {
    ler("Olá! Eu sou a BACH AI. Minha voz está funcionando perfeitamente agora!");
    return "🔊 Testando a voz da BACH AI em português!";
  }
  return null;
}

export const Voz = { ler, parar, comando, getRate };
