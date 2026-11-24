/* BACH AI 4.5 — Utilidades práticas locais
   Gerador de senhas seguras, sorteios, dado, moeda, datas/dias e contador de texto. */

const norm = t => String(t || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const DIAS_SEMANA = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado"
];

function aleatorio(max) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function gerarSenha(tamanho = 14) {
  const n = Math.min(64, Math.max(8, Number(tamanho) || 14));
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-+=";
  let out = "";
  for (let i = 0; i < n; i++) out += chars[aleatorio(chars.length)];
  return "🔐 **Senha forte gerada (" + n + " caracteres):**\n\n`" + out + "`\n\nℹ️ Gerada localmente no seu aparelho (não salvo senhas).";
}

function validarCPF(num) {
  const d = String(num || "").replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(d[i]) * (10 - i);
  let r1 = (soma * 10) % 11;
  if (r1 === 10) r1 = 0;
  if (r1 !== Number(d[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(d[i]) * (11 - i);
  let r2 = (soma * 10) % 11;
  if (r2 === 10) r2 = 0;
  return r2 === Number(d[10]);
}

function parseData(str) {
  const m = String(str || "").match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
  if (!m) return null;
  const dia = Number(m[1]), mes = Number(m[2]);
  let ano = m[3] ? Number(m[3]) : new Date().getFullYear();
  if (ano < 100) ano += 2000;
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  const d = new Date(ano, mes - 1, dia);
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
  return d;
}

function analisarTexto(txt) {
  const s = String(txt || "").trim();
  if (!s) return "Envie o texto depois de `/contar` para eu analisar.";
  const chars = s.length;
  const semEsp = s.replace(/\s/g, "").length;
  const palavras = s.split(/\s+/).filter(Boolean).length;
  const linhas = s.split(/\n/).length;
  const frases = (s.match(/[.!?]+(?=\s|$)/g) || []).length || 1;
  const min = Math.max(1, Math.round(palavras / 180));
  return "📊 **Análise do texto:**\n" +
    "• Palavras: **" + palavras + "**\n" +
    "• Caracteres: **" + chars + "** (" + semEsp + " sem espaços)\n" +
    "• Frases: ~" + frases + " • Linhas: " + linhas + "\n" +
    "• Tempo estimado de leitura: ~" + min + " min";
}

function handle(text) {
  const raw = String(text || "").trim();
  const t = norm(raw);

  // 1) Senha forte
  let m = raw.match(/^(?:\/senha(?:\s+(\d{1,2}))?|(?:gere|gerar|crie|criar|faz|faca|me da|manda)\s+(?:uma\s+)?senha(?:\s+(?:forte|segura))?(?:\s+(?:de|com)\s+(\d{1,2})\s*(?:caracteres|digitos|letras)?)?)$/i);
  if (m) return gerarSenha(m[1] || m[2] || 14);

  // 2) Cara ou coroa
  if (/^(?:\/moeda|cara ou coroa|(?:joga|jogue|lanca|lance|gira|gire)\s+(?:uma\s+)?moeda)$/i.test(t)) {
    return aleatorio(2) === 0 ? "🪙 Deu **CARA**!" : "🪙 Deu **COROA**!";
  }

  // 3) Dado (d6, d20, etc.)
  m = t.match(/^(?:\/dado(?:\s+(\d{1,4}))?|d(\d{1,4})|(?:joga|jogue|rola|role|lanca|lance)\s+(?:um\s+)?dado(?:\s+de\s+(\d{1,4})\s+lados)?)$/);
  if (m) {
    const lados = Math.min(1000, Math.max(2, Number(m[1] || m[2] || m[3] || 6)));
    return "🎲 Rolei um d" + lados + ": saiu **" + (aleatorio(lados) + 1) + "**!";
  }

  // 4) Sorteio de número ou lista
  m = t.match(/^(?:\/sortear|sorteia|sortear|escolhe|escolher)\s+(?:um\s+numero\s+)?(?:de|entre)\s+(\d+)\s+(?:e|a|ate)\s+(\d+)$/);
  if (m) {
    let a = Number(m[1]), b = Number(m[2]);
    if (a > b) [a, b] = [b, a];
    if (b - a > 1000000) return "Escolha um intervalo de até 1 milhão.";
    return "🎯 Número sorteado entre " + a + " e " + b + ": **" + (a + aleatorio(b - a + 1)) + "**!";
  }
  m = raw.match(/^(?:\/sortear|sorteia|sortear|escolhe|escolher)(?:\s+entre)?\s+(.+)$/i);
  if (m && /[,;]| ou /i.test(m[1])) {
    const itens = m[1].split(/\s*[,;]\s*|\s+ou\s+/i).map(x => x.trim()).filter(Boolean);
    if (itens.length >= 2) {
      return "🎯 Entre **" + itens.join(", ") + "**, o sorteado foi: **" + itens[aleatorio(itens.length)] + "**!";
    }
  }

  // 5) Datas e contagem de dias
  m = t.match(/^quantos dias (?:faltam|tem|da|ate) (?:para|pra|pro|ate)?\s*(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\??$/);
  if (m) {
    let d = parseData(m[1]);
    if (!d) return "Não reconheci essa data. Use o formato DD/MM/AAAA (ex.: 25/12/2026).";
    const hoje = new Date();
    const h0 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    if (!/\d{4}/.test(m[1]) && d < h0) d = new Date(hoje.getFullYear() + 1, d.getMonth(), d.getDate());
    const diff = Math.round((d - h0) / 86400000);
    const fmt = d.toLocaleDateString("pt-BR") + " (" + DIAS_SEMANA[d.getDay()] + ")";
    if (diff === 0) return "📅 **" + fmt + "** é **hoje**! 🎉";
    if (diff > 0) return "📅 Faltam **" + diff + " dia(s)** para " + fmt + ".";
    return "📅 " + fmt + " já passou há **" + Math.abs(diff) + " dia(s)**.";
  }

  m = t.match(/^que dia (?:da semana )?(?:e|foi|sera|cai) (\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\??$/);
  if (m) {
    const d = parseData(m[1]);
    if (!d) return "Data inválida. Use DD/MM/AAAA.";
    return "📅 O dia **" + d.toLocaleDateString("pt-BR") + "** cai em uma **" + DIAS_SEMANA[d.getDay()] + "**.";
  }

  // 6) Validador matemático de CPF
  m = raw.match(/^\/cpf\s+([0-9.\-]+)$/i);
  if (m) {
    const ok = validarCPF(m[1]);
    return (ok ? "✅ **Dígitos válidos**" : "❌ **Dígitos inválidos**") + " na regra matemática do CPF.\n\nℹ️ Isso confere apenas os dígitos verificadores (não consulta Receita Federal nem guarda o número).";
  }

  // 7) Contador de texto
  m = raw.match(/^\/contar\s+([\s\S]+)$/i);
  if (m) return analisarTexto(m[1]);

  return null;
}

export const Utilidades = { handle };
