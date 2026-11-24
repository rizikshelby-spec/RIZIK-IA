/* BACH AI 4.9 — AUTOCORRETOR & AUDITORIA FIEL + INTEGRAÇÃO CENTRAL DE ERROS ADM
   1) Detecta reclamações, lê o histórico completo e reprocessa a pergunta original.
   2) Trata falas emotivas/esticadas, kaomojis, risadas brasileiras e perguntas sobre a própria IA.
   3) Envia toda resposta inválida, não entendida ou erro do público direto para a Central ADM. */

let errosAdmMod = null;
import("./erros_adm.js?v=1").then(m => { errosAdmMod = m?.ErrosADM || null; }).catch(() => {});

const K_CORR = "bach_autocorrecoes_v1";
const K_FAIL = "bach_failures_v1";

const norm = t => String(t || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\b(vc|vce)\b/g, "voce")
  .replace(/\b(oq|oqe|oque)\b/g, "o que")
  .replace(/\b(pq|pk)\b/g, "porque")
  .replace(/\b(pra|oara|praa)\b/g, "para")
  .replace(/\b(msm)\b/g, "mesmo")
  .replace(/\b(hj)\b/g, "hoje")
  .replace(/\b(tip)\b/g, "tipo")
  .replace(/\b(mn)\b/g, "mano")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const reduzirRepetidas = t => String(t || "").replace(/([a-zA-ZÀ-ÿ])\1{2,}/g, "$1");

const RE_RECLAMACAO = /\b(voce errou|vc errou|vc erro|voce erro|errou|para de errar|esses erros|nesses erros|nao foi isso|nao era isso|fugiu do assunto|saiu do assunto|mudou de assunto|nada a ver|nada aver|nada haver|nao entende|nao entendeu|nao capta|respondeu errado|falou errado|disse errado|ta errado|esta errado|nao mandei pesquisar|nao mandei vc falar|nao pedi isso|nem disse isso|texto do nada|isso ta errado|fazendo pesquisa|fazer pesquisa agora|para de pesquisar|so pesquisa|o que (?:voce )?nao entendeu|senha bosta|chatao|pqp bach|o droga)\b/;

function ehReclamacao(texto) {
  const t = norm(reduzirRepetidas(texto));
  if (!t || t.split(" ").length > 16) return false;
  return RE_RECLAMACAO.test(t);
}

function ehRisada(t) {
  const s = t.replace(/\s+/g, "");
  return /(?:[ai]*k{3,}[ais]*|h[aei]+h[aei]+|r+s+r+s+|(?:k+s+){2,}|(?:s+k+){2,}|(?:a+k+){2,}|(?:h+a+){2,})/i.test(s);
}

function registrarFalhaPublica({ tipo = "nao-entendeu", entrada = "", resposta = "", motivo = "" }) {
  if (errosAdmMod?.registrar) {
    errosAdmMod.registrar({ tipo, entrada, resposta, motivo });
    return;
  }
  try {
    const K = "bach_adm_erros_v1";
    const arr = JSON.parse(localStorage.getItem(K) || "[]");
    arr.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      at: Date.now(),
      tipo: String(tipo).slice(0, 40),
      entrada: String(entrada || "").slice(0, 300),
      resposta: String(resposta || "").slice(0, 240),
      motivo: String(motivo || "").slice(0, 140)
    });
    localStorage.setItem(K, JSON.stringify(arr.slice(-250)));
  } catch {}
}

function tratarExclamacao(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return null;

  if (/^[;:.,\-_^~><()'`´=]+$/.test(raw) && raw.length >= 2) {
    if (/[;:].*[-_]/.test(raw) || raw.includes(":(")) {
      return "😢 Eita, que carinha triste é essa? Fui eu que errei ou aconteceu alguma coisa?";
    }
    return "👀 Tô por aqui! Manda o que você quer conversar ou testar.";
  }

  if (ehReclamacao(raw)) return null;

  const limpo = norm(reduzirRepetidas(raw));
  if (!limpo) return null;

  const semGiria = limpo.replace(/\b(uai|mano|aff|nossa|eita|oxi|oxe|nada a ver)\b/g, "").trim();
  if (semGiria && ehRisada(semGiria) && limpo.split(" ").length <= 5) {
    return "Haha 😂😂! Boa! Manda a próxima!";
  }

  if (/^(?:ah+|oh+|eh+|ih+|uh+|uai+|eita+|nossa+|vixi+|vish+|socorro+|meu deus|o deus+|deus+|caramba+|misericordia+|aff+s?|mds+|ave+|aiai+|ai+|oxi+|oxe+)(?:\s+(?:ah+|oh+|deus+|meu deus|o deus+|nossa+|eita+|senhor+|socorro+|ave+|mds+))*$/.test(limpo)) {
    return "Eita! 😂 Senti a reação daqui! Me conta o que rolou ou o que você precisa agora.";
  }

  if (/\b(tem|possui|existe|voce tem)\b/.test(limpo) && /\b(consciencia|sentimentos|emocoes|alma)\b/.test(limpo) && limpo.split(" ").length <= 10) {
    return "Eu não tenho consciência nem sentimentos como uma pessoa — sou uma inteligência artificial feita de código e memória, mas tô sempre evoluindo para conversar melhor com você! 🤖💜";
  }

  if (/^(?:eu que pergunto|tipo o que|o que voce quer fazer|fazer o que agora)/.test(limpo) && limpo.split(" ").length <= 8) {
    return "Haha, você que manda! 😄 Pode pedir uma curiosidade, música, filme, um app (`/app`), senha forte (`/senha`), revisão de texto ou previsão do tempo!";
  }
  if (/^(?:desde quando (?:voce )?entende|sabe o que exatamente|nah sabe o que)/.test(limpo)) {
    return "Estou aprendendo cada vez mais com você! 🧠 Entendo de programação, Termux, criação de apps (`/app`), ortografia/sílabas, avaliação de sites, traduções, clima, curiosidades e senhas. Testa aí!";
  }
  if (/^(?:acertei mesmo|acertei|ganhei)$/.test(limpo)) {
    return "Acertou sim! 🎉 Manda outro jogo (`forca`, `quiz`, `velha`, `adivinhe` ou `piada`) ou pergunta quando quiser!";
  }

  return null;
}

function registrarCorrecao(pergunta, motivo, acao) {
  try {
    const lista = JSON.parse(localStorage.getItem(K_CORR) || "[]");
    lista.push({
      at: Date.now(),
      pergunta: String(pergunta || "").slice(0, 120),
      motivo: String(motivo || "").slice(0, 80),
      acao: String(acao || "").slice(0, 80)
    });
    localStorage.setItem(K_CORR, JSON.stringify(lista.slice(-30)));
  } catch {}
  registrarFalhaPublica({
    tipo: "autocorrecao",
    entrada: pergunta,
    motivo: motivo + " → " + acao
  });
}

function encontrarPerguntaAnterior(history) {
  if (!Array.isArray(history) || !history.length) return null;

  let ultimaBotErrada = "";
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (!m || !m.text) continue;
    if (m.type !== "user" && !ultimaBotErrada) {
      ultimaBotErrada = String(m.text);
      continue;
    }
    if (m.type === "user") {
      const txt = String(m.text).trim();
      if (!txt || ehReclamacao(txt)) continue;
      if (tratarExclamacao(txt)) continue;
      return {
        pergunta: txt,
        cit: m.cit || "",
        respostaBot: ultimaBotErrada
      };
    }
  }
  return null;
}

function analisarEPreparar(history, ctx = {}) {
  const alvoAnt = encontrarPerguntaAnterior(history);
  if (!alvoAnt) {
    registrarCorrecao("(sem pergunta anterior)", "reclamacao-sem-alvo", "pediu-clareza");
    return {
      tipo: "direto",
      texto: "Desculpa mesmo por ter errado! 😅 Prometo não pesquisar à toa. Me diga em uma frase direta o que você quer saber ou fazer agora!"
    };
  }

  const orig = alvoAnt.pergunta;
  const t = norm(reduzirRepetidas(orig));
  const botErr = String(alvoAnt.respostaBot || "");

  if (/\bresum/.test(t) && /\bcodig/.test(t) && ctx.ultimoArquivo?.texto) {
    registrarCorrecao(orig, "faltou-resumo-com-codigo", "entregou-resumo-e-codigo");
    const linhas = ctx.ultimoArquivo.texto.split(/\n+/).map(x => x.trim()).filter(Boolean);
    return {
      tipo: "direto",
      texto: "Desculpa! 😅 Antes eu mandei só o bloco para copiar e esqueci o resumo.\n\n" +
        "📝 **Resumo de " + ctx.ultimoArquivo.nome + ":**\n" +
        linhas.slice(0, 5).map(l => "• " + l.slice(0, 110)).join("\n") +
        "\n\n💡 Se quiser tudo traduzido para português, toque em **↩ Responder** no texto da foto e mande **“só traduz”**."
    };
  }

  if (/\b(clima|tempo|chuva|chover|chovendo|previsao|calor|frio)\b/.test(t) &&
      !/\b(tempo de|linha do tempo|passatempo|o que e tempo)\b/.test(t)) {
    registrarCorrecao(orig, "clima-nao-detectado", "reencaminhar-clima");
    return {
      tipo: "clima",
      pergunta: orig,
      aviso: "Desculpa por ter saído do assunto! 😅 Vi que antes você perguntou sobre o tempo (**“" + orig + "”**). Vou consultar a previsão certa agora:"
    };
  }

  if (/\b(traduz|traduza|traduzir|traducao|em portugues)\b/.test(t) &&
      (alvoAnt.cit || ctx.ultimoArquivo?.texto)) {
    registrarCorrecao(orig, "traducao-alvo", "reencaminhar-traducao");
    return {
      tipo: "traducao",
      pergunta: orig,
      cit: alvoAnt.cit,
      aviso: "Desculpa! 😅 Entendi agora que você queria traduzir **“" + orig.slice(0, 60) + "”**. Fazendo a tradução certa:"
    };
  }

  if (/Sobre “|Aqui está o resumo sobre|Pesquisei “/i.test(botErr)) {
    registrarCorrecao(orig, "pesquisa-indevida", "pediu-acao-direta");
    return {
      tipo: "direto",
      texto: "Desculpa mesmo por ter pesquisado na internet sem você pedir! 😅\n\nVi que antes você tinha mandado: **“" + orig + "”**.\n" +
        "Me diga rapidinho o que você queria com isso — conversar, revisar texto, fazer conta ou traduzir — que eu respondo direto!"
    };
  }

  if (/Não captei bem|Não entendi direito|Essa ficou meio vaga/i.test(botErr)) {
    if (/^(o que e|o que sao|quem foi|quem e|onde fica|como funciona|me explica)\b/.test(t) || /\bdistancia\b/.test(t)) {
      registrarCorrecao(orig, "nao-entendeu-pergunta", "pesquisar-pergunta");
      return {
        tipo: "pesquisar",
        query: orig,
        aviso: "Desculpa por não ter captado antes! 😅 Reanalisei sua pergunta **“" + orig + "”** e fui buscar a resposta:"
      };
    }
    registrarCorrecao(orig, "nao-entendeu-conversa", "explicou-motivo");
    return {
      tipo: "direto",
      texto: "O que me confundiu foi a frase **“" + orig + "”**, porque ficou muito curta ou aberta para eu adivinhar a intenção. 😅\n\nMe diga em poucas palavras o que você quer (ex.: *pesquise..., traduz..., recomenda..., calcula...*) que eu acerto!"
    };
  }

  registrarCorrecao(orig, "desvio-geral", "confirmou-contexto");
  return {
    tipo: "direto",
    texto: "Desculpa mesmo por ter fugido do assunto! 😅\n\n" +
      "Olhei o histórico e vi que sua mensagem anterior era: **“" + orig + "”**.\n" +
      "Me diga em poucas palavras o que você esperava dessa mensagem que eu já respondo certinho!"
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
      if (/Não captei bem|Não entendi direito|Essa ficou meio vaga|Deu um erro inesperado/i.test(txt)) {
        erros.push("• [" + num + "] Não entendeu: “" + antUser.slice(0, 65) + "”");
      }
      if (/Sobre “|Aqui está o resumo sobre/i.test(txt)) {
        if (antUser && !/\b(pesquis|procur|busc|o que e|quem foi|quem e|como funciona|me explica|distancia|historia)\b/i.test(norm(antUser))) {
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
  registrarFalhaPublica,
  analisarEPreparar,
  formatarChat,
  auditarChat
};
