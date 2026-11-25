/* BACH AI 5.2 — AUTOCORRETOR REAL BLINDADO, TOM ADAPTATIVO & APRENDIZADO CONTÍNUO
   1) Captura seguimentos pós-erro como "queria que vc falasse ah ta", "era pra falar..." etc.
   2) Respeita o tom do usuário e usa a mensagem citada (↩ Responder) quando marcada.
   3) Pula reações curtas/xingamentos e palavras soltas ("erro", "errou") para achar a pergunta real.
   4) Grava falhas na Central ADM mascarando segredos. */

import { RizikBrain } from "./brain.js?v=20";

let errosAdmMod = null;
import("./erros_adm.js?v=2").then(m => { errosAdmMod = m?.ErrosADM || null; }).catch(() => {});

const K_CORR = "bach_autocorrecoes_v1";
const K_FAIL = "bach_failures_v1";

const giro = Object.create(null);
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

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

const norm = t => String(t || "").slice(0, 600).toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\bqm\b/g, "quem")
  .replace(/\b(vc|vce|vv|oc|oce)\b/g, "voce")
  .replace(/\b(oq|oqe|oque)\b/g, "o que")
  .replace(/\bpq\b/g, "porque")
  .replace(/\b(pra|oara|praa)\b/g, "para")
  .replace(/\b(msm)\b/g, "mesmo")
  .replace(/\b(hj)\b/g, "hoje")
  .replace(/\b(tip)\b/g, "tipo")
  .replace(/\b(mn)\b/g, "mano")
  .replace(/\bcvs\b/g, "conversar")
  .replace(/\bpse\b/g, "pois e")
  .replace(/\bentt\b/g, "entao")
  .replace(/\b(ahamn|ahamm)\b/g, "aham")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const reduzirRepetidas = t => String(t || "").slice(0, 600).replace(/([a-zA-ZÀ-ÿ])\1{2,}/g, "$1");

const RE_RECLAMACAO = /^(?:erro|errou)$|\b(voce errou|vc errou|vc erro|voce erro|errou|e errou ainda|para de errar|esses erros|nesses erros|nao foi isso|nao era isso|fugiu do assunto|saiu do assunto|mudou de assunto|nada a ver|nada aver|nada haver|nao entende|nao entendeu|nunca entende|nao capta|respondeu errado|falou errado|disse errado|ta errado|esta errado|nao mandei pesquisar|nao mandei vc falar|nao pedi isso|nem disse isso|texto do nada|isso ta errado|fazendo pesquisa|fazer pesquisa agora|para de pesquisar|so pesquisa|o que (?:voce )?nao entendeu|senha bosta|chatao|pqp bach|o droga)\b/;

const RE_REACAO_RUIDO = /^(?:erro|errou|exatamente|oush+|oxe+|oxente|ue+|uai+|eita+|vixi+|vish+|ave+|nossa+|caramba+|aff+|mds+|pqp|crlh|vsf|kct|porra|merda|burr[oa](?:\s+ate\s+d\+?)?|idiota|inutil|meu deus|o deus+|meu ovo|meu obo|aham|uhum|ok|okay|claro|dnv isso|de novo isso|se vc diz ne|so segue a cvs|viu entende nada|combinado oq|o que|oque|nao oush|ruim de vc|reacao ruim de vc|sentiu o que|nao quero|so foca em melhorar|pois e entao nao fala bosta|mas eu marquei a palavra|larga de ser burra)$/;

function ehReclamacao(texto) {
  const s = String(texto || "");
  if (!s || s.length > 300) return false;
  const t = norm(reduzirRepetidas(s));
  if (!t || t.split(" ").length > 16) return false;
  return RE_RECLAMACAO.test(t);
}

function ehRisada(t) {
  const s = String(t || "").slice(0, 120).replace(/\s+/g, "");
  return /(?:[ai]*k{3,}[ais]*|h[aei]+h[aei]+|r+s+r+s+|(?:k+s+){2,}|(?:s+k+){2,}|(?:a+k+){2,}|(?:h+a+){2,})/i.test(s);
}

function usuarioEstaIrritadoOuSerio(history = [], textoAtual = "") {
  const moodInfo = RizikBrain.getMood?.() || { mood: "neutro", score: 0 };
  const tomAtual = RizikBrain.detectTone?.(textoAtual) || "neutro";
  if (tomAtual === "frustrado" || tomAtual === "triste" || tomAtual === "serio") return true;
  if (moodInfo.mood === "frustrado" || moodInfo.mood === "serio" || moodInfo.score <= -0.8) return true;

  const ultimasUser = (Array.isArray(history) ? history : [])
    .filter(m => m && m.type === "user" && m.text)
    .slice(-4)
    .map(m => String(m.text));

  for (const u of ultimasUser) {
    const t = RizikBrain.detectTone?.(u);
    if (t === "frustrado" || t === "triste" || ehReclamacao(u)) return true;
  }
  return false;
}

function registrarFalhaPublica({ tipo = "nao-entendeu", entrada = "", resposta = "", motivo = "" }) {
  if (ehEntradaSensivel(entrada)) return;
  if (errosAdmMod?.registrar) {
    errosAdmMod.registrar({ tipo, entrada, resposta, motivo });
    return;
  }
  try {
    const K = "bach_adm_erros_v1";
    const parsed = JSON.parse(localStorage.getItem(K) || "[]");
    const arr = Array.isArray(parsed) ? parsed : [];
    arr.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      at: Date.now(),
      tipo: String(tipo).slice(0, 40),
      entrada: redigirSegredos(entrada).slice(0, 300),
      resposta: redigirSegredos(resposta).slice(0, 240),
      motivo: redigirSegredos(motivo).slice(0, 140)
    });
    localStorage.setItem(K, JSON.stringify(arr.slice(-250)));
  } catch {}
}

function tratarExclamacao(texto, history = []) {
  const raw = String(texto || "").trim();
  if (!raw || raw.length > 260) return null;

  const serioOuBravo = usuarioEstaIrritadoOuSerio(history, raw);

  if (/^[;:.,\-_^~><()'`´=]+$/.test(raw) && raw.length >= 2) {
    if (/[;:].*[-_]/.test(raw) || raw.includes(":(")) {
      return "Percebi a carinha triste. Fui eu que errei ou aconteceu algo? Se quiser me explicar, estou aqui.";
    }
    return "Estou por aqui. Pode mandar o que você precisa agora.";
  }

  if (ehReclamacao(raw)) return null;

  const limpo = norm(reduzirRepetidas(raw));
  if (!limpo) return null;

  const semGiria = limpo.replace(/\b(uai|mano|aff|nossa|eita|oxi|oxe|nada a ver)\b/g, "").trim();
  if (semGiria && ehRisada(semGiria) && limpo.split(" ").length <= 5) {
    return serioOuBravo
      ? "Entendi. Me diga como posso te ajudar agora."
      : girar("ris-ok", ["Haha 😂 Boa! Manda a próxima.", "Rindo junto 😄 Pode mandar a próxima."]);
  }

  if (/^(?:ah+|oh+|eh+|ih+|uh+|uai+|eita+|nossa+|vixi+|vish+|socorro+|meu deus|o deus+|deus+|caramba+|misericordia+|aff+s?|mds+|ave+|aiai+|ai+|oxi+|oxe+)(?:\s+(?:ah+|oh+|deus+|meu deus|o deus+|nossa+|eita+|senhor+|socorro+|ave+|mds+))*$/.test(limpo)) {
    return serioOuBravo
      ? girar("exc-serio", [
          "O que não saiu certo? Me diga direto o que você queria fazer agora.",
          "Percebi que algo falhou aqui. Qual comando ou pergunta você quer tentar?",
          "Me diga em uma frase direta o que você precisa agora que eu foco só nisso."
        ])
      : girar("exc-leve", [
          "O que foi? Se algo ficou estranho ou quiser tentar outro comando, me avisa.",
          "Uai, o que aconteceu? Pode mandar a pergunta direta ou explicar o que queria."
        ]);
  }

  if (/\b(tem|possui|existe|voce tem)\b/.test(limpo) && /\b(consciencia|sentimentos|emocoes|alma)\b/.test(limpo) && limpo.split(" ").length <= 10) {
    return "Não tenho consciência humana, mas acompanho o contexto da conversa, o que você tá sentindo e tudo que já falamos para conversar de forma natural.";
  }

  if (/^(?:eu que pergunto|tipo o que|o que voce quer fazer|fazer o que agora)/.test(limpo) && limpo.split(" ").length <= 8) {
    return "Você escolhe: podemos só bater papo sobre qualquer coisa, falar do seu dia ou pesquisar algo se você quiser.";
  }
  if (/^(?:desde quando (?:voce )?entende|sabe o que exatamente|nah sabe o que)/.test(limpo)) {
    return "Entendo programação, Termux, criação de apps (`/app`), ortografia/sílabas, avaliação de sites, traduções, clima, contas e pesquisa na web. Se alguma frase comum falhar, você pode me corrigir que eu aprendo.";
  }
  if (/^(?:acertei mesmo|acertei|ganhei)$/.test(limpo)) {
    return "Acertou sim! 🎉 Quer jogar outro (`forca`, `quiz`, `velha`, `adivinhe` ou `piada`) ou mudar de assunto?";
  }

  return null;
}

function registrarCorrecao(pergunta, motivo, acao) {
  if (ehEntradaSensivel(pergunta)) return;
  const pergSegura = redigirSegredos(pergunta).slice(0, 120);
  const motSeguro = redigirSegredos(motivo).slice(0, 80);
  const acaoSegura = redigirSegredos(acao).slice(0, 80);
  try {
    const parsed = JSON.parse(localStorage.getItem(K_CORR) || "[]");
    const lista = Array.isArray(parsed) ? parsed : [];
    lista.push({
      at: Date.now(),
      pergunta: pergSegura,
      motivo: motSeguro,
      acao: acaoSegura
    });
    localStorage.setItem(K_CORR, JSON.stringify(lista.slice(-30)));
  } catch {}
  registrarFalhaPublica({
    tipo: "autocorrecao",
    entrada: pergSegura,
    motivo: motSeguro + " → " + acaoSegura
  });
}

function encontrarAlvoMarcado(history, textoMarcado) {
  if (!textoMarcado || !Array.isArray(history)) return null;
  const trecho = String(textoMarcado).trim().slice(0, 90);
  if (!trecho) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m && m.type !== "user" && m.text && String(m.text).includes(trecho)) {
      for (let j = i - 1; j >= 0; j--) {
        if (history[j] && history[j].type === "user" && history[j].text) {
          return {
            pergunta: String(history[j].text),
            cit: history[j].cit || "",
            respostaBot: String(m.text)
          };
        }
      }
      return { pergunta: "(mensagem marcada)", cit: "", respostaBot: String(m.text) };
    }
  }
  return { pergunta: "(mensagem marcada)", cit: "", respostaBot: String(textoMarcado) };
}

function encontrarPerguntaAnterior(history) {
  if (!Array.isArray(history) || !history.length) return null;

  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (!m || m.type !== "user" || !m.text) continue;
    const txt = String(m.text).trim();
    const n = norm(reduzirRepetidas(txt));
    if (!txt || ehReclamacao(txt) || RE_REACAO_RUIDO.test(n) || ehRisada(n)) continue;
    if (/^(?:ah+|oh+|eh+|ih+|uh+|uai+|eita+|nossa+|vixi+|vish+|ave+|meu deus|o deus+|mds+|pqp|crlh)\b/.test(n) && n.split(" ").length <= 3) continue;

    let respBot = "";
    for (let j = i + 1; j < history.length; j++) {
      if (history[j] && history[j].type !== "user" && history[j].text) {
        respBot = String(history[j].text);
        break;
      }
    }
    return {
      pergunta: txt,
      cit: m.cit || "",
      respostaBot: respBot
    };
  }
  return null;
}

function botPediuExplicacaoPosErro(history = []) {
  const ultBot = [...(Array.isArray(history) ? history : [])].reverse().find(m => m && m.type !== "user" && m.text)?.text || "";
  return /esperava dessa mensagem|Me diga o que estava errado|Me diga em poucas palavras o que você esperava|o que você queria saber de fato/i.test(ultBot);
}

function ehPerguntaMuitoGenericaParaSalvar(perg) {
  const np = norm(perg);
  if (!np || np === "mensagem marcada") return true;
  if (/^(?:e |mas )?(?:isso|isto|aquilo|ele|ela)\b/.test(np) && np.split(" ").length <= 5) return true;
  return false;
}

function processarSeguimentoDeCorrecao(texto, history = []) {
  const raw = String(texto || "").trim();
  if (!raw || ehEntradaSensivel(raw)) return null;

  if (/\*$/.test(raw) && raw.length <= 60) {
    const limpoAst = raw.replace(/\*+$/, "").trim();
    const ultUser = [...(Array.isArray(history) ? history : [])].reverse().find(m => m && m.type === "user" && m.text !== raw);
    if (ultUser) {
      const a = norm(ultUser.text).split(" ");
      const b = norm(limpoAst).split(" ");
      if (a.length === 1 && b.length === 1 && a[0] !== b[0] && a[0].length >= 2 && b[0].length >= 2) {
        RizikBrain.learnSynonym?.(a[0], b[0]);
      }
    }
    return {
      tipo: "direto",
      texto: "Entendi a correção (“" + limpoAst + "”). Pode continuar, estou acompanhando."
    };
  }

  const pend = RizikBrain.getPendingError?.();
  const aguardandoPosErro = Boolean(pend) || botPediuExplicacaoPosErro(history);
  const n = norm(raw);

  const mFala = raw.match(/^(?:eu\s+)?(?:queria|esperava|gostaria)\s+(?:que\s+(?:vc|voce|você)\s+)?(?:falasse|dissesse|respondesse|fizesse|fosse)\s+([\s\S]+)$/i) ||
    raw.match(/^(?:era\s+(?:para|pra)\s+(?:vc|voce|você)\s+(?:falar|dizer|responder)|pode\s+responder)\s+([\s\S]+)$/i);

  if (mFala && (aguardandoPosErro || mFala[1].trim().split(/\s+/).length <= 8)) {
    const esperado = mFala[1].trim().replace(/^["“']|["”']$/g, "");
    const pergOriginal = pend?.question || "";
    RizikBrain.clearPendingError?.();

    if (pergOriginal && !ehPerguntaMuitoGenericaParaSalvar(pergOriginal) && esperado.length >= 2) {
      RizikBrain.learn?.(pergOriginal, esperado);
      return {
        tipo: "direto",
        texto: "Ah, entendi! 😅 Da próxima vez que mandarem **“" + pergOriginal + "”**, eu já respondo: **“" + esperado + "”**!"
      };
    }

    return {
      tipo: "direto",
      texto: "Ah, tá! 😅 Entendi — você queria uma resposta direta tipo **“" + esperado + "”** em vez de pesquisa na internet. Anotado aqui!"
    };
  }

  const mExp = n.match(/^(?:o que eu queria|eu queria|queria|era para|era pra|eu quis dizer|quis dizer|eu estava falando de|eu falei sobre|eu falei de)\s+(?:que\s+(?:voce\s+)?)?(.+)$/);
  if (aguardandoPosErro && mExp) {
    const intencao = mExp[1].trim();
    RizikBrain.clearPendingError?.();

    if (/^(?:pesquis|procur|busc)/.test(intencao)) {
      const temaLimpo = intencao.replace(/^(?:voce\s+)?(?:pesquis\w*|procur\w*|busc\w*)\s*(?:sobre)?\s*/, "").trim();
      const query = temaLimpo.length >= 3 ? temaLimpo : (pend?.question || "");
      if (query) {
        return {
          tipo: "pesquisar",
          query,
          aviso: "Agora entendi! Vou pesquisar direito sobre **“" + query + "”**:"
        };
      }
    }

    if (intencao.length >= 3 && !/^(?:isso|aquilo|nada)$/.test(intencao)) {
      if (pend?.question && !ehPerguntaMuitoGenericaParaSalvar(pend.question)) {
        RizikBrain.learn?.(pend.question, intencao);
      }
      return {
        tipo: "direto",
        texto: "Entendi! Guardei o que você esperava" + (pend?.question ? " para **“" + pend.question + "”**" : "") + " e não vou repetir esse erro."
      };
    }
  }

  return null;
}

function analisarEPreparar(history, ctx = {}) {
  const alvoAnt = (ctx.alvo ? encontrarAlvoMarcado(history, ctx.alvo) : null) || encontrarPerguntaAnterior(history);
  if (!alvoAnt) {
    registrarCorrecao("(sem pergunta anterior)", "reclamacao-sem-alvo", "pediu-clareza");
    return {
      tipo: "direto",
      texto: "Desculpa por ter saído do alvo. Me diga em uma frase direta o que você quer saber ou conversar agora que eu sigo daqui."
    };
  }

  const orig = alvoAnt.pergunta;
  const t = norm(reduzirRepetidas(orig));
  const botErr = String(alvoAnt.respostaBot || "");
  RizikBrain.setPendingError?.(orig, botErr);

  if (/\bresum/.test(t) && /\bcodig/.test(t) && ctx.ultimoArquivo?.texto) {
    registrarCorrecao(orig, "faltou-resumo-com-codigo", "entregou-resumo-e-codigo");
    const linhas = ctx.ultimoArquivo.texto.split(/\n+/).map(x => x.trim()).filter(Boolean);
    return {
      tipo: "direto",
      texto: "Desculpa! Antes mandei só o bloco para copiar e faltou o resumo.\n\n" +
        "📝 **Resumo de " + ctx.ultimoArquivo.nome + ":**\n" +
        linhas.slice(0, 5).map(l => "• " + l.slice(0, 110)).join("\n") +
        "\n\n💡 Se quiser traduzir para português, toque em **↩ Responder** no texto da foto e mande **“só traduz”**."
    };
  }

  if (/\b(clima|tempo|chuva|chover|chovendo|previsao|calor|frio)\b/.test(t) &&
      !/\b(tempo de|linha do tempo|passatempo|o que e tempo)\b/.test(t)) {
    registrarCorrecao(orig, "clima-nao-detectado", "reencaminhar-clima");
    return {
      tipo: "clima",
      pergunta: orig,
      aviso: "Vi que antes você perguntou sobre o tempo (**“" + orig + "”**). Vou consultar a previsão certa agora:"
    };
  }

  if (/\b(traduz|traduza|traduzir|traducao|em portugues)\b/.test(t) &&
      (alvoAnt.cit || ctx.ultimoArquivo?.texto)) {
    registrarCorrecao(orig, "traducao-alvo", "reencaminhar-traducao");
    return {
      tipo: "traducao",
      pergunta: orig,
      cit: alvoAnt.cit,
      aviso: "Entendi que você queria traduzir **“" + orig.slice(0, 60) + "”**. Fazendo a tradução agora:"
    };
  }

  if (/Sobre “|Aqui está o resumo sobre|Pesquisei “|Já pesquisei isso/i.test(botErr)) {
    const pediuPesquisa = /\b(pesquis|procur|busc|quem foi|quem e|o que e|me explica|me fala|me fale)\b/.test(t);
    if (pediuPesquisa || ctx.alvo) {
      registrarCorrecao(orig, "pesquisa-resultado-ruim", "pediu-especificacao");
      return {
        tipo: "direto",
        texto: "Entendi que você marcou essa resposta sobre **“" + orig + "”** como errada.\n\nMe diga o que estava errado ou o que você queria que eu respondesse!"
      };
    }
    registrarCorrecao(orig, "pesquisa-indevida", "pediu-acao-direta");
    return {
      tipo: "direto",
      texto: "Desculpa por ter pesquisado na internet sem você pedir.\n\nVi que antes você mandou: **“" + orig + "”**.\nMe diga rapidinho o que você esperava dessa mensagem que eu respondo direto."
    };
  }

  if (/Não captei bem|Não entendi direito|Essa ficou meio vaga|Não peguei bem|Fiquei na dúvida/i.test(botErr)) {
    if (/^(o que e|o que sao|quem foi|quem e|onde fica|como funciona|me explica)\b/.test(t) || /\bdistancia\b/.test(t)) {
      registrarCorrecao(orig, "nao-entendeu-pergunta", "pesquisar-pergunta");
      return {
        tipo: "pesquisar",
        query: orig,
        aviso: "Entendi agora — reanalisei sua pergunta **“" + orig + "”** e fui buscar a resposta:"
      };
    }
    registrarCorrecao(orig, "nao-entendeu-conversa", "explicou-motivo");
    return {
      tipo: "direto",
      texto: "O que eu não entendi foi **“" + orig + "”**.\n\nMe diga o que você queria com essa frase (ex.: “queria que você respondesse ...”) que eu já ajusto!"
    };
  }

  registrarCorrecao(orig, "desvio-geral", "confirmou-contexto");
  return {
    tipo: "direto",
    texto: "Desculpa por ter fugido do assunto.\n\nSua mensagem marcada/anterior era **“" + orig + "”**. Me diga em poucas palavras o que você esperava que eu respondesse."
  };
}

function formatarChat(history) {
  if (!Array.isArray(history) || !history.length) return "Conversa vazia.";
  const linhas = [
    "=== CONVERSA BACH AI (" + new Date().toLocaleString("pt-BR") + ") ===",
    ""
  ];
  for (const m of history) {
    if (!m || !m.text) continue;
    const quem = m.type === "user" ? "👤 Você" : "🧠 BACH";
    const cit = m.cit ? "\n   [Em resposta a: " + m.cit + "]" : "";
    linhas.push(quem + ":" + cit + "\n" + String(m.text).trim() + "\n");
  }
  return linhas.join("\n");
}

function auditarChat(history, isAdm = false) {
  const erros = [];
  const lista = Array.isArray(history) ? history : [];
  let ultimaBot = "";

  for (let i = 0; i < lista.length; i++) {
    const m = lista[i];
    if (!m || !m.text) continue;
    const txt = String(m.text);
    const num = "#" + (i + 1);
    const antUser = lista[i - 1]?.type === "user" ? String(lista[i - 1].text) : "";

    if (m.type !== "user") {
      if (/Não captei bem|Não entendi direito|Essa ficou meio vaga|Não peguei bem|Fiquei na dúvida|Deu um erro inesperado/i.test(txt)) {
        erros.push("• [" + num + "] Não entendeu: “" + antUser.slice(0, 65) + "”");
      }
      if (/Sobre “|Aqui está o resumo sobre/i.test(txt)) {
        if (antUser && !/\b(pesquis|procur|busc|o que e|quem foi|qm foi|quem e|como funciona|me explica|distancia|historia|cor d)\b/i.test(norm(antUser))) {
          erros.push("• [" + num + "] Pesquisa automática fora de hora para: “" + antUser.slice(0, 60) + "”");
        }
      }
      if (/^📄\s+IMG_|^📝 Texto lido em \*\*IMG_/i.test(txt) && antUser && !/\b(foto|imagem|print|escrito|texto|codigo|ler|leia|resume)\b/i.test(norm(antUser))) {
        erros.push("• [" + num + "] Vazou arquivo/foto antiga ao responder: “" + antUser.slice(0, 60) + "”");
      }
      if (/Tradução automática \(MyMemory\)/i.test(txt) && antUser && /\b(responde|fala|escreve)\s+em\s+portugues/i.test(norm(antUser))) {
        erros.push("• [" + num + "] Traduziu comando de idioma como se fosse palavra: “" + antUser.slice(0, 50) + "”");
      }
      if (ultimaBot && txt === ultimaBot && txt.length > 25 && !/Nova conversa|Alguns módulos não carregaram/i.test(txt)) {
        erros.push("• [" + num + "] Resposta idêntica repetida em sequência para: “" + antUser.slice(0, 50) + "”");
      }
      ultimaBot = txt;
    } else if (ehReclamacao(txt)) {
      const alvoU = lista[i - 2]?.type === "user" ? String(lista[i - 2].text) : "(anterior)";
      erros.push("• [" + num + "] Usuário reclamou (“" + txt.slice(0, 40) + "”) após: “" + alvoU.slice(0, 55) + "”");
    }
  }

  let fails = [], corrs = [], admCount = 0;
  try { fails = JSON.parse(localStorage.getItem(K_FAIL) || "[]"); } catch {}
  try { corrs = JSON.parse(localStorage.getItem(K_CORR) || "[]"); } catch {}
  if (isAdm) {
    try { admCount = (JSON.parse(localStorage.getItem("bach_adm_erros_v1") || "[]")).length; } catch {}
  }

  const out = [
    "🩺 **AUDITORIA FIEL DE ERROS DA BACH AI**",
    "• Mensagens analisadas nesta conversa: " + lista.length,
    "• Total de erros detectados no chat: " + erros.length
  ];
  if (isAdm) out.push("• Erros salvos na Central ADM: " + admCount);
  out.push("• Auto-correções registradas: " + corrs.length);
  out.push("• Registros técnicos (AutoGuard): " + fails.length);
  out.push("");

  if (erros.length) {
    out.push("❌ **Todos os erros encontrados (do mais antigo ao atual):**");
    out.push(...erros.slice(-30));
    out.push("");
  }
  if (corrs.length) {
    out.push("🔄 **Últimas auto-correções:**");
    out.push(...corrs.slice(-5).map(c => "• [" + c.motivo + "] “" + c.pergunta + "”"));
    out.push("");
  }
  if (fails.length) {
    out.push("⚠️ **Últimos registros técnicos:**");
    out.push(...fails.slice(-8).map(f => "• [" + f.module + "] " + (f.input || f.detail)));
    out.push("");
  }
  if (!erros.length && !fails.length) {
    out.push("✅ Nenhuma falha detectada nesta conversa!");
  } else {
    out.push(isAdm
      ? "💡 Toque em **📋 Copiar** abaixo ou abra **☰ → 🚨 Erros do Público**!"
      : "💡 Toque em **📋 Copiar** abaixo se quiser guardar este relatório!");
  }

  return out.join("\n");
}

export const AutoCorretor = {
  ehReclamacao,
  tratarExclamacao,
  processarSeguimentoDeCorrecao,
  usuarioEstaIrritadoOuSerio,
  registrarFalhaPublica,
  analisarEPreparar,
  formatarChat,
  auditarChat
};
