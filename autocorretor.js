/* BACH AI 4.5 — AUTOCORRETOR & AUDITORIA DE CHAT
   1) Detecta quando a BACH errou ou fugiu do assunto, analisa o histórico da conversa e reprocessa a pergunta original.
   2) Trata falas emotivas/esticadas (ex.: "aaaaah", "deusss").
   3) Formata a conversa inteira para copiar sem prints e audita erros com /auditar. */

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
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const reduzirRepetidas = t => String(t || "").replace(/([a-zA-ZÀ-ÿ])\1{2,}/g, "$1");

const RE_RECLAMACAO = /\b(voce errou|vc errou|errou|nao foi isso|nao era isso|fugiu do assunto|saiu do assunto|mudou de assunto|nada a ver|nada aver|nada haver|nao entende|nao entendeu|nao capta|respondeu errado|falou errado|disse errado|ta errado|esta errado|nao mandei pesquisar|nao pedi isso|isso ta errado)\b/;

function ehReclamacao(texto) {
  const t = norm(reduzirRepetidas(texto));
  if (!t || t.split(" ").length > 16) return false;
  return RE_RECLAMACAO.test(t);
}

function tratarExclamacao(texto) {
  const limpo = norm(reduzirRepetidas(texto));
  if (!limpo) return null;

  if (/^(?:ah+|oh+|eh+|ih+|uh+|uai+|eita+|nossa+|vixi+|vish+|socorro+|meu deus|o deus+|deus+|caramba+|misericordia+|aff+)(?:\s+(?:ah+|oh+|deus+|meu deus|o deus+|nossa+|eita+|senhor+|socorro+))*$/.test(limpo)) {
    return "Eita! 😂 Senti a emoção daqui! Respira fundo e me conta o que aconteceu ou o que você precisa agora.";
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
      texto: "Desculpa mesmo por ter errado! 😅 Olhei nossa conversa e não achei uma pergunta anterior clara. Me diga em uma frase direta o que você quer saber ou fazer agora!"
    };
  }

  const orig = alvoAnt.pergunta;
  const t = norm(reduzirRepetidas(orig));
  const botErr = String(alvoAnt.respostaBot || "");

  // 1) Se a pergunta original era sobre clima/tempo
  if (/\b(clima|tempo|chuva|chover|chovendo|previsao|calor|frio)\b/.test(t) &&
      !/\b(tempo de|linha do tempo|passatempo|o que e tempo)\b/.test(t)) {
    registrarCorrecao(orig, "clima-nao-detectado", "reencaminhar-clima");
    return {
      tipo: "clima",
      pergunta: orig,
      aviso: "Desculpa por ter saído do assunto! 😅 Vi que antes você perguntou sobre o tempo (**“" + orig + "”**). Vou consultar a previsão certa agora:"
    };
  }

  // 2) Se a pergunta original pedia tradução de foto/citação
  if (/\b(traduz|traduza|traduzir|traducao)\b/.test(t) &&
      (alvoAnt.cit || ctx.ultimoArquivo?.texto)) {
    registrarCorrecao(orig, "traducao-alvo", "reencaminhar-traducao");
    return {
      tipo: "traducao",
      pergunta: orig,
      cit: alvoAnt.cit,
      aviso: "Desculpa! 😅 Entendi agora que você queria traduzir **“" + orig.slice(0, 60) + "”**. Fazendo a tradução certa:"
    };
  }

  // 3) Se a resposta errada foi uma pesquisa indesejada na Wikipédia ("Sobre ...", "Aqui está o resumo sobre...")
  if (/Sobre “|Aqui está o resumo sobre|Pesquisei “/i.test(botErr)) {
    registrarCorrecao(orig, "pesquisa-indevida", "pediu-acao-direta");
    return {
      tipo: "direto",
      texto: "Desculpa por ter pesquisado na internet sem você pedir! 😅\n\nVi que você tinha mandado: **“" + orig + "”**.\n" +
        "Me diga rapidinho o que você queria com isso:\n" +
        "• responder em conversa normal\n• fazer uma conta ou utilidade\n• ou explicar/traduzir algum texto ou foto?"
    };
  }

  // 4) Se a resposta errada foi "Não captei bem" / "Não entendi"
  if (/Não captei bem|Não entendi direito/i.test(botErr)) {
    if (/\?/.test(orig) || /^(o que|quem|qual|quais|como|onde|quando|porque|por que)\b/.test(t)) {
      registrarCorrecao(orig, "nao-entendeu-pergunta", "pesquisar-pergunta");
      return {
        tipo: "pesquisar",
        query: orig,
        aviso: "Desculpa por não ter captado antes! 😅 Reanalisei sua pergunta **“" + orig + "”** e fui buscar a resposta:"
      };
    }
  }

  // 5) Caso geral: mostra o que encontrou no histórico e oferece reenvio claro
  registrarCorrecao(orig, "desvio-geral", "confirmou-contexto");
  return {
    tipo: "direto",
    texto: "Desculpa mesmo por ter fugido do assunto! 😅\n\n" +
      "Olhei o histórico e vi que sua mensagem anterior era: **“" + orig + "”**.\n" +
      "Se quiser que eu:\n" +
      "• **pesquise** isso na web → mande: `pesquise " + orig + "`\n" +
      "• **traduza** → responda (↩) o texto e mande `só traduz`\n" +
      "• ou me diga em poucas palavras o resultado que você esperava que eu corrijo na hora!"
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

function auditarChat(history) {
  const erros = [];
  const lista = Array.isArray(history) ? history : [];

  for (let i = 0; i < lista.length; i++) {
    const m = lista[i];
    if (!m || !m.text) continue;
    const txt = String(m.text);

    if (m.type !== "user" && /Não captei bem|Não entendi direito|Deu um erro inesperado/i.test(txt)) {
      const ant = lista[i - 1]?.type === "user" ? lista[i - 1].text : "(desconhecida)";
      erros.push("• Não entendeu: “" + String(ant).slice(0, 70) + "”");
    }
    if (m.type === "user" && ehReclamacao(txt)) {
      const alvoU = lista[i - 2]?.type === "user" ? lista[i - 2].text : "(anterior)";
      erros.push("• Usuário reclamou (“" + txt.slice(0, 45) + "”) após: “" + String(alvoU).slice(0, 60) + "”");
    }
  }

  let fails = [], corrs = [];
  try { fails = JSON.parse(localStorage.getItem(K_FAIL) || "[]"); } catch {}
  try { corrs = JSON.parse(localStorage.getItem(K_CORR) || "[]"); } catch {}

  const out = [
    "🩺 **AUDITORIA DE ERROS DA BACH AI**",
    "• Mensagens analisadas nesta conversa: " + lista.length,
    "• Falhas encontradas no chat atual: " + erros.length,
    "• Auto-correções registradas: " + corrs.length,
    "• Falhas técnicas (AutoGuard): " + fails.length,
    ""
  ];

  if (erros.length) {
    out.push("❌ **Pontos onde a IA errou / não entendeu neste chat:**");
    out.push(...erros.slice(-10));
    out.push("");
  }
  if (fails.length) {
    out.push("⚠️ **Últimos registros técnicos:**");
    out.push(...fails.slice(-5).map(f => "• [" + f.module + "] " + (f.input || f.detail)));
    out.push("");
  }
  if (!erros.length && !fails.length) {
    out.push("✅ Nenhuma falha detectada nesta conversa!");
  } else {
    out.push("💡 Toque em **📋 Copiar** abaixo e me mande esse relatório para eu melhorar os módulos!");
  }

  return out.join("\n");
}

export const AutoCorretor = {
  ehReclamacao,
  tratarExclamacao,
  analisarEPreparar,
  formatarChat,
  auditarChat
};
