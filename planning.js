/* BACH AI 4.0 — planejamento local e organização de tarefas. */

function handle(text, context = {}) {
  const raw = String(text || "").trim();

  const m = raw.match(
    /^(?:\/plano(?:\s+simples)?|planeje|planejar|organize|organizar|monte um plano para|montar um plano para)\s*:?[ ]*(.+)$/i
  );

  if (!m) return null;

  if (context.hasAI && !/^\/plano\s+simples\b/i.test(raw)) {
    return null;
  }

  const goal = m[1].replace(/^simples\s+/i, "").trim();

  if (!goal) {
    return "Diga o objetivo. Exemplo: /plano criar um jogo no Roblox";
  }

  return "🗺️ PLANO INICIAL: " + goal +

    "\n\n1. Definir o resultado: escreva exatamente o que precisa estar pronto." +

    "\n2. Separar etapas: divida o objetivo em tarefas pequenas e verificáveis." +

    "\n3. Priorizar: comece pelo que bloqueia as outras tarefas." +

    "\n4. Executar e conferir: conclua uma etapa por vez e teste o resultado." +

    "\n5. Revisar: registre o que funcionou, o que falhou e o próximo passo." +

    "\n\n✅ Primeira ação: descreva o resultado esperado em uma frase." +

    "\nℹ️ Este é um roteiro-base; prazos, custos e dependências precisam dos detalhes do projeto.";
}

export const Planning = { handle };
