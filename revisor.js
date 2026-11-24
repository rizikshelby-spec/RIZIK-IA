/* BACH AI 4.8 — REVISOR FIEL (Ortografia, Sílabas, Código e Avaliação de Sites)
   Permite revisar textos, sílabas, códigos e analisar sites direto no chat. */

const VOGAIS = "aáàâãeéêiíoóôõuúüy";
const V_RE = new RegExp("[" + VOGAIS + "]", "i");
const INSEPARAVEIS = new Set(["bl","br","cl","cr","dr","fl","fr","gl","gr","pl","pr","tl","tr","vr","ch","lh","nh"]);
const DIG_SEP = new Set(["rr","ss","sc","sç","xc","xs"]);

function separarSilabaPalavra(raw) {
  const w = String(raw || "").trim().toLowerCase().replace(/[^a-záàâãéêíóôõúüç-]/gi, "");
  if (!w) return "";
  if (w.includes("-")) return w.split("-").map(separarSilabaPalavra).join("-");

  const chars = [...w];
  const grupos = [];
  let i = 0;

  while (i < chars.length) {
    const c = chars[i];
    if ((c === "q" || c === "g") && chars[i + 1] === "u" && chars[i + 2] && V_RE.test(chars[i + 2])) {
      grupos.push({ tipo: "C", txt: c + "u" });
      i += 2;
      continue;
    }
    if (V_RE.test(c)) {
      let v = c;
      while (i + 1 < chars.length && V_RE.test(chars[i + 1])) {
        const prox = chars[i + 1];
        const par = v.slice(-1) + prox;
        const ehHiato = /[íú]/.test(prox) ||
          /^(aa|ee|oo|ao|ea|eo|oa|oe|aá|eé|oó|ía|ío|úa|úo)$/.test(par.normalize("NFC"));
        if (ehHiato) break;
        v += prox;
        i++;
      }
      grupos.push({ tipo: "V", txt: v });
      i++;
    } else {
      let cons = c;
      while (i + 1 < chars.length && !V_RE.test(chars[i + 1])) {
        const nxt = chars[i + 1];
        if ((nxt === "q" || nxt === "g") && chars[i + 2] === "u" && chars[i + 3] && V_RE.test(chars[i + 3])) break;
        cons += nxt;
        i++;
      }
      grupos.push({ tipo: "C", txt: cons });
      i++;
    }
  }

  const numV = grupos.filter(g => g.tipo === "V").length;
  if (numV <= 1) return w;

  const silabas = [];
  let buf = "";

  for (let idx = 0; idx < grupos.length; idx++) {
    const g = grupos[idx];
    if (g.tipo === "V") {
      buf += g.txt;
      if (grupos[idx + 1]?.tipo === "V") {
        silabas.push(buf);
        buf = "";
      }
    } else {
      const temVAntes = silabas.length > 0 || V_RE.test(buf);
      const temVDepois = grupos.slice(idx + 1).some(x => x.tipo === "V");

      if (!temVAntes || !temVDepois) {
        buf += g.txt;
      } else {
        const ct = g.txt;
        if (ct.length === 1) {
          silabas.push(buf);
          buf = ct;
        } else if (ct.length === 2) {
          if (INSEPARAVEIS.has(ct) && !DIG_SEP.has(ct)) {
            silabas.push(buf);
            buf = ct;
          } else {
            silabas.push(buf + ct[0]);
            buf = ct[1];
          }
        } else {
          const ult2 = ct.slice(-2);
          if (INSEPARAVEIS.has(ult2) && !DIG_SEP.has(ult2)) {
            silabas.push(buf + ct.slice(0, -2));
            buf = ult2;
          } else {
            silabas.push(buf + ct.slice(0, -1));
            buf = ct.slice(-1);
          }
        }
      }
    }
  }
  if (buf) silabas.push(buf);
  return silabas.join("-");
}

function classificarSilabas(n) {
  return n <= 1 ? "monossílaba" : n === 2 ? "dissílaba" : n === 3 ? "trissílaba" : "polissílaba";
}

function analisarSilabas(frase) {
  const palavras = String(frase || "").trim().split(/\s+/).filter(Boolean).slice(0, 12);
  if (!palavras.length) return "🔤 Envie uma ou mais palavras depois de `/silabas`. Ex.: `/silabas computador programacao`";
  const linhas = palavras.map(p => {
    const sep = separarSilabaPalavra(p);
    const qtd = sep ? sep.split("-").length : 0;
    return "• **" + p + "** → `" + sep + "` (" + qtd + " sílaba" + (qtd > 1 ? "s" : "") + " — " + classificarSilabas(qtd) + ")";
  });
  return "🔤 **Separação Silábica:**\n\n" + linhas.join("\n");
}

const REGRAS_PT = [
  [/\bconcerteza\b/gi, "com certeza", "“concerteza” não existe junto; o correto é **com certeza**."],
  [/\bderrepente\b/gi, "de repente", "“derrepente” escreve-se separado: **de repente**."],
  [/\bporisso\b/gi, "por isso", "“porisso” escreve-se separado: **por isso**."],
  [/\bmenas\b/gi, "menos", "“menas” não existe; use sempre **menos** (invariável)."],
  [/\bseje\b/gi, "seja", "“seje” está errado; o certo é **seja**."],
  [/\besteje\b/gi, "esteja", "“esteje” está errado; o certo é **esteja**."],
  [/\bfaze\b/gi, "fazer", "Verbo no infinitivo precisa do R: **fazer**."],
  [/\bpode cre\b/gi, "pode crer", "Faltou o R final em **crer**."],
  [/\beh\b/gi, "é", "Evite “eh”; o verbo correto leva acento: **é**."],
  [/\bvc\b/gi, "você", "Abreviação informal “vc” → em textos formais use **você**."],
  [/\bpq\b/gi, "por que / porque", "Abreviação “pq” → use **por que** (pergunta) ou **porque** (resposta)."],
  [/\btb\b|\btbm\b/gi, "também", "Abreviação “tb/tbm” → use **também**."],
  [/\bhj\b/gi, "hoje", "Abreviação “hj” → use **hoje**."],
  [/\bmsm\b/gi, "mesmo", "Abreviação “msm” → use **mesmo**."],
  [/\bnao\b/gi, "não", "Faltou o til (~) em **não**."],
  [/\bvoce\b/gi, "você", "Faltou o acento circunflexo (^) em **você**."],
  [/\btambem\b/gi, "também", "Faltou o acento agudo em **também**."],
  [/\bagente\s+(vai|vamos|foi|fomos|ta|esta|estamos|pode|quer|fez|faz|sabe|tem)\b/gi, "a gente $1", "“agente” junto significa profissão/substância; para “nós”, use separado: **a gente**."],
  [/\bpra\s+mim\s+(fazer|ir|ver|ler|comer|sair|dar|pegar|falar|mandar|enviar|copiar|colar)\b/gi, "para eu $1", "Antes de verbo no infinitivo, use **para eu** em vez de “para mim”."],
  [/\bmais\s+(nao|nunca|tambem|eu|ela|ele|isso|como|se|quando|porem)\b/gi, "mas $1", "Possível troca de **mas** (oposição = porém) por “mais” (quantidade)."],
  [/\bnada\s+haver\b|\bnada\s+aver\b/gi, "nada a ver", "A expressão correta é **nada a ver** (com 'a' separado e 'ver')."],
  [/\bpara\s+mim\s+ajuda\b/gi, "para me ajudar", "Faltou o R final em **ajudar** e o pronome **me**."],
  [/([a-zA-ZÀ-ÿ])\1{2,}/g, "$1", "Letras repetidas em excesso (ex.: *aaaa*, *ssss*)."]
];

function revisarPortugues(texto) {
  const orig = String(texto || "").trim();
  if (!orig) return "📝 Cole o texto depois de `/revisar` para eu revisar cada erro!";

  const erros = [];
  let corrigido = orig;

  for (const [re, sub, desc] of REGRAS_PT) {
    if (re.test(corrigido)) {
      erros.push("• " + desc);
      corrigido = corrigido.replace(re, sub);
    }
    re.lastIndex = 0;
  }

  if (/\s+[,.;!?]/.test(corrigido)) {
    erros.push("• Há **espaço antes da pontuação**.");
    corrigido = corrigido.replace(/\s+([,.;!?])/g, "$1");
  }
  if (/[,.;!?][A-Za-zÀ-ÿ]/.test(corrigido)) {
    erros.push("• Falta **espaço depois da vírgula ou ponto**.");
    corrigido = corrigido.replace(/([,;!?])([A-Za-zÀ-ÿ])/g, "$1 $2");
  }
  if (/\s{2,}/.test(corrigido)) {
    erros.push("• Há **espaços duplos** sobrando entre palavras.");
    corrigido = corrigido.replace(/ {2,}/g, " ");
  }
  if (/^[a-zà-ÿ]/.test(corrigido)) {
    erros.push("• A frase começa com **letra minúscula**.");
    corrigido = corrigido.charAt(0).toUpperCase() + corrigido.slice(1);
  }
  if (/[A-Za-zÀ-ÿ0-9]$/.test(corrigido) && corrigido.split(/\s+/).length >= 4) {
    erros.push("• Faltou **pontuação final** (`.`, `?` ou `!`).");
    corrigido += ".";
  }

  const palavras = orig.split(/\s+/).map(w => w.replace(/[^a-záàâãéêíóôõúüç]/gi, "")).filter(w => w.length >= 4);
  for (const p of palavras) {
    if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(p)) {
      erros.push("• Palavra suspeita **“" + p + "”** (muitas consoantes seguidas; sílabas: `" + separarSilabaPalavra(p) + "`).");
    }
  }

  if (!erros.length) {
    return "✅ **Revisão de texto:** não encontrei erros óbvios de ortografia, espaçamento ou pontuação!\n\n" +
      "Texto analisado:\n“" + orig + "”\n\n💡 Se quiser ver a divisão silábica, use `/silabas palavra`.";
  }

  return "📝 **REVISÃO FIEL DO TEXTO (" + erros.length + " ponto(s) encontrado(s)):**\n\n" +
    erros.join("\n") +
    "\n\n✨ **Sugestão corrigida:**\n“" + corrigido + "”";
}

function revisarCodigoFiel(codigo) {
  const linhas = String(codigo || "").split("\n");
  const erros = [];

  linhas.forEach((l, idx) => {
    const n = idx + 1;
    if (/\bvar\s+/.test(l)) erros.push("• Linha " + n + ": usa `var` (prefira `let` ou `const`).");
    if (/[^=!<>]==[^=]/.test(l)) erros.push("• Linha " + n + ": usa `==` (prefira `===` para evitar bugs de tipo).");
    if (/\.innerHTML\s*=/.test(l)) erros.push("• Linha " + n + ": usa `.innerHTML =` (cuidado com XSS; prefira `.textContent` para textos).");
    if (/\beval\s*\(|new\s+Function\s*\(/.test(l)) erros.push("• Linha " + n + ": usa `eval`/`Function` (risco de segurança).");
    if (/\bconsole\.log\(/.test(l)) erros.push("• Linha " + n + ": `console.log` de debug deixado no código.");
    if (/TODO|FIXME/i.test(l)) erros.push("• Linha " + n + ": pendência `TODO/FIXME` aberta.");
  });

  const abreCh = (codigo.match(/\{/g) || []).length, fechaCh = (codigo.match(/\}/g) || []).length;
  if (abreCh !== fechaCh) erros.push("• Estrutura: chaves `{}` desbalanceadas (" + abreCh + " abrem, " + fechaCh + " fecham).");

  const abrePar = (codigo.match(/\(/g) || []).length, fechaPar = (codigo.match(/\)/g) || []).length;
  if (abrePar !== fechaPar) erros.push("• Estrutura: parênteses `()` desbalanceados (" + abrePar + " abrem, " + fechaPar + " fecham).");

  if (/<html/i.test(codigo) && !/name=["']viewport["']/i.test(codigo)) {
    erros.push("• HTML: falta `<meta name=\"viewport\" ...>` para funcionar bem no celular.");
  }
  if (/localStorage\./.test(codigo) && !/try\s*\{/.test(codigo)) {
    erros.push("• Armazenamento: usa `localStorage` sem `try/catch` (pode quebrar em aba anônima).");
  }
  if (/fetch\(/.test(codigo) && !/catch/.test(codigo)) {
    erros.push("• Rede: usa `fetch()` sem tratar erro com `catch`.");
  }

  return "💻 **AUDITORIA DE CÓDIGO (" + linhas.length + " linhas):**\n\n" +
    (erros.length ? erros.slice(0, 18).join("\n") : "✅ Nenhum erro estrutural ou má prática óbvia encontrada!") +
    (erros.length > 18 ? "\n... e mais " + (erros.length - 18) + " aviso(s)." : "");
}

async function avaliarSite(url) {
  const u = String(url || "").trim();
  if (!/^https?:\/\//i.test(u)) return "🌐 Envie um link completo começando com `http://` ou `https://`. Ex.: `/site https://google.com`";

  const pontos = [];
  const problemas = [];
  let nota = 10;

  if (/^https:\/\//i.test(u)) pontos.push("Usa HTTPS (conexão criptografada)");
  else { problemas.push("Não usa HTTPS (conexão insegura)"); nota -= 2.5; }

  if (/bit\.ly|tinyurl|t\.co|cutt\.ly|is\.gd/i.test(u)) {
    problemas.push("Usa link encurtado (esconde o destino real)");
    nota -= 1.5;
  }

  const t0 = performance.now();
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), 14000);
  try {
    const r = await fetch("https://r.jina.ai/" + u, { signal: c.signal });
    const ms = Math.round(performance.now() - t0);
    if (!r.ok) {
      return "❌ **Avaliação do site:** `" + u + "`\n\nO site retornou erro **HTTP " + r.status + "** (" + ms + " ms). Parece fora do ar ou bloqueando acesso.";
    }
    const txt = await r.text();

    if (ms > 5000) { problemas.push("Resposta lenta (" + (ms / 1000).toFixed(1) + "s)"); nota -= 1.5; }
    else pontos.push("Carregamento rápido (" + ms + " ms)");

    if (/\b(404|page not found|página não encontrada|error 500|502 bad gateway|site can't be reached)\b/i.test(txt.slice(0, 800))) {
      problemas.push("Página parece quebrada ou com erro 404/500");
      nota -= 4;
    }
    if (/Just a moment|Checking your browser|Cloudflare/i.test(txt.slice(0, 600))) {
      problemas.push("Bloqueio anti-bot na entrada (dificulta leitura externa)");
    }

    const palavras = txt.replace(/[#*_`>|[\]()]/g, " ").trim().split(/\s+/).filter(Boolean).length;
    if (palavras < 40) { problemas.push("Quase nenhum texto visível (" + palavras + " palavras — pode ser site só de script ou vazio)"); nota -= 2; }
    else pontos.push("Bom volume de conteúdo (" + palavras + " palavras)");

    const temTitulo = /^Title:|^#\s+.+/m.test(txt);
    if (temTitulo) pontos.push("Tem título definido");
    else { problemas.push("Sem título principal claro"); nota -= 0.5; }

    const links = (txt.match(/https?:\/\/[^\s)]+/g) || []).length;
    if (links > 150) { problemas.push("Muitos links na mesma página (" + links + ") — pode parecer poluído"); nota -= 1; }

    if (/\b(urgen|clique aqui para ganhar|prêmio grátis|pix liberado|cassino|tigrinho)\b/i.test(txt)) {
      problemas.push("Contém palavras comuns em páginas de spam/aposta/golpe");
      nota -= 2.5;
    }

    nota = Math.max(0, Math.min(10, Number(nota.toFixed(1))));
    const veredito = nota >= 8 ? "🟢 Site BOM" : nota >= 5.5 ? "🟡 Site MEDIANO (precisa de ajustes)" : "🔴 Site RUIM ou suspeito";

    return "🌐 **AVALIAÇÃO DO SITE:** `" + u + "`\n" +
      "**Nota:** " + nota + "/10 — **" + veredito + "**\n\n" +
      (pontos.length ? "✅ **Pontos positivos:**\n• " + pontos.join("\n• ") + "\n\n" : "") +
      (problemas.length ? "❌ **Problemas encontrados:**\n• " + problemas.join("\n• ") : "✅ Nenhum problema grave detectado.");
  } catch (e) {
    return "❌ Não consegui acessar `" + u + "` (" + (e.name === "AbortError" ? "tempo esgotado" : e.message || "erro de rede") + "). O site pode estar fora do ar.";
  } finally {
    clearTimeout(timer);
  }
}

function detectarPedidoDireto(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;

  if (/^\/silabas$/i.test(s)) {
    return { tipo: "sync", texto: "🔤 Envie a palavra depois de `/silabas`. Ex.: `/silabas computador programacao`" };
  }
  if (/^\/(revisar|ortografia|corrigirtexto)$/i.test(s)) {
    return { tipo: "sync", texto: "📝 Cole o texto ou código depois de `/revisar` para eu apontar cada erro!" };
  }
  if (/^\/site$/i.test(s)) {
    return { tipo: "sync", texto: "🌐 Envie o endereço do site depois de `/site`. Ex.: `/site https://google.com`" };
  }

  let m = s.match(/^(?:\/silabas|silabas de|separe? as silabas(?: de)?|divisao silabica(?: de)?)\s+([\s\S]+)$/i);
  if (m) return { tipo: "sync", texto: analisarSilabas(m[1]) };

  m = s.match(/^(?:\/revisar|\/ortografia|\/corrigirtexto|corrija esse texto|corrige esse texto|revise esse texto|revisa esse texto|tem erro nesse texto\??|achar erros nesse texto)\s*:?\s*([\s\S]+)$/i);
  if (m) {
    const corpo = m[1].trim();
    const pareceCod = /(\bconst\b|\bfunction\b|=>|<\/?[a-z]+>|\bimport\b|\bexport\b)/i.test(corpo);
    return { tipo: "sync", texto: pareceCod ? revisarCodigoFiel(corpo) : revisarPortugues(corpo) };
  }

  m = s.match(/^(?:\/site|avalia(?:r)? (?:esse|o) site|ve(?:r|ja) se (?:esse|o) site (?:ta|esta) (?:bom|ruim)|(?:esse|o) site (?:ta|esta) (?:bom|ruim))\s*:?\s*(https?:\/\/\S+)/i) ||
      s.match(/(https?:\/\/\S+)\s+(?:ta bom|esta bom|ta ruim|esta ruim|e bom|e ruim|presta|vale a pena)\??$/i);
  if (m) return { tipo: "site", url: m[1].replace(/[.,;!?]+$/, "") };

  return null;
}

export const Revisor = {
  revisarPortugues,
  analisarSilabas,
  separarSilabaPalavra,
  revisarCodigoFiel,
  avaliarSite,
  detectarPedidoDireto
};
