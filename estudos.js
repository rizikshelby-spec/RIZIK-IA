/* BACH AI 4.7 — Modo Estudante Avançado
 * Comandos: /flashcard [materia], /virar, /simulado [materia], /alt A|B|C|D, /tecnica
 */

const K_FC = "bach_flashcard_v1";
const K_SIM = "bach_simulado_v1";

const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const CARDS = [
  { m: "js", q: "Qual a diferença entre `const` e `let` em JavaScript?", a: "`const` não permite reatribuir a variável; `let` permite trocar o valor depois." },
  { m: "js", q: "O que faz o método `Array.prototype.filter()`?", a: "Cria um novo array contendo apenas os elementos que passaram no teste (retornaram `true`)." },
  { m: "js", q: "Para que serve o bloco `try / catch`?", a: "Para capturar erros em tempo de execução sem deixar o programa travar por completo." },
  { m: "historia", q: "Em que ano foi proclamada a Independência do Brasil?", a: "Em 7 de setembro de 1822, por Dom Pedro I." },
  { m: "historia", q: "Qual foi o estopim da Primeira Guerra Mundial (1914)?", a: "O assassinato do arquiduque Francisco Ferdinando, herdeiro do Império Austro-Húngaro, em Sarajevo." },
  { m: "historia", q: "O que foi a Lei Áurea (13 de maio de 1888)?", a: "A lei assinada pela princesa Isabel que aboliu oficialmente a escravidão no Brasil." },
  { m: "geografia", q: "Quais são os 6 biomas brasileiros?", a: "Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa e Pantanal." },
  { m: "geografia", q: "Qual linha imaginária divide a Terra em Hemisfério Norte e Sul?", a: "A Linha do Equador (latitude 0°)." },
  { m: "ciencias", q: "Qual organela celular é responsável pela produção de energia (ATP)?", a: "A mitocôndria (por meio da respiração celular)." },
  { m: "ciencias", q: "Qual é a primeira lei de Newton?", a: "Lei da Inércia: um corpo permanece em repouso ou em MRU se a força resultante for nula." },
  { m: "portugues", q: "Quando usar 'mas' e quando usar 'mais'?", a: "'Mas' indica oposição (equivalente a porém); 'mais' indica quantidade ou intensidade (oposto de menos)." },
  { m: "portugues", q: "O que são palavras proparoxítonas?", a: "Palavras cuja sílaba tônica é a antepenúltima — e TODAS levam acento gráfico (ex.: lâmpada, médico)." },
  { m: "matematica", q: "Qual é a fórmula do Teorema de Pitágoras?", a: "a² + b² = c² (a soma dos quadrados dos catetos é igual ao quadrado da hipotenusa)." },
  { m: "matematica", q: "Qual é o único número primo que é par?", a: "O número 2." }
];

const SIMULADO = [
  { m: "portugues", q: "Assinale a alternativa em que o uso do 'porquê' indica explicação/resposta:", o: ["Não fui porque choveu.", "Por que você saiu?", "Não sei o porque disso.", "Você saiu por que?"], ok: 0, why: "'Porque' junto e sem acento é a conjunção usada em explicações e respostas." },
  { m: "matematica", q: "Se um produto de R$ 200 teve 15% de desconto, qual o valor final?", o: ["R$ 160", "R$ 170", "R$ 175", "R$ 185"], ok: 1, why: "15% de 200 = 30. Então 200 - 30 = R$ 170." },
  { m: "ciencias", q: "Em pressão normal ao nível do mar, a água ferve a:", o: ["0 °C", "50 °C", "100 °C", "120 °C"], ok: 2, why: "Ao nível do mar (1 atm), a água congela a 0 °C e entra em ebulição a 100 °C." },
  { m: "geografia", q: "Qual é o maior estado do Brasil em extensão territorial?", o: ["Pará", "Mato Grosso", "Bahia", "Amazonas"], ok: 3, why: "O Amazonas é o maior estado brasileiro (~1,56 milhão de km²)." },
  { m: "js", q: "Em JavaScript, qual operador compara valor E tipo ao mesmo tempo?", o: ["=", "==", "===", "!="], ok: 2, why: "O operador `===` faz comparação estrita (valor e tipo)." },
  { m: "historia", q: "A Constituição Federal atual do Brasil foi promulgada em:", o: ["1964", "1985", "1988", "1994"], ok: 2, why: "A Constituição Cidadã foi promulgada em 5 de outubro de 1988." }
];

const getSS = k => { try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch { return null; } };
const setSS = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} };
const delSS = k => { try { sessionStorage.removeItem(k); } catch {} };

function aliasMateria(m) {
  const x = norm(m);
  if (/^javascript$/.test(x)) return "js";
  if (/^(biologia|fisica|quimica)$/.test(x)) return "ciencias";
  return x;
}

function mostrarQuestaoSim(sim) {
  const item = sim.itens[sim.idx];
  return "📝 **SIMULADO (" + (sim.idx + 1) + "/" + sim.itens.length + ") — " + item.m.toUpperCase() + "**\n\n" +
    item.q + "\n\n" +
    item.o.map((alt, i) => String.fromCharCode(65 + i) + ") " + alt).join("\n") +
    "\n\nResponda com: `/alt A` (ou B, C, D)";
}

function handle(text) {
  const raw = String(text || "").trim();

  // Flashcards
  let m = raw.match(/^\/flashcard(?:\s+(\S+))?$/i);
  if (m) {
    const mat = m[1] ? aliasMateria(m[1]) : "";
    const lista = mat ? CARDS.filter(c => c.m === mat) : CARDS;
    if (!lista.length) {
      return "Matérias disponíveis para `/flashcard`: `js`, `historia`, `geografia`, `ciencias`, `portugues`, `matematica`.";
    }
    const card = lista[Math.floor(Math.random() * lista.length)];
    setSS(K_FC, card);
    return "🃏 **FLASHCARD — " + card.m.toUpperCase() + "**\n\n" +
      "❓ **Pergunta:** " + card.q + "\n\n" +
      "Tente lembrar da resposta e depois mande **`/virar`** para conferir!";
  }

  if (/^\/virar$/i.test(raw)) {
    const card = getSS(K_FC);
    if (!card) return "Nenhum flashcard aberto agora. Comece com `/flashcard` (ou `/flashcard js`).";
    delSS(K_FC);
    return "💡 **Verso do Flashcard (" + card.m.toUpperCase() + "):**\n\n" + card.a +
      "\n\nQuer outro? Digite `/flashcard` (ou `/flashcard " + card.m + "`).";
  }

  // Simulado com pontuação
  m = raw.match(/^\/simulado(?:\s+(\S+))?$/i);
  if (m) {
    const mat = m[1] ? aliasMateria(m[1]) : "";
    let itens = mat ? SIMULADO.filter(s => s.m === mat) : [...SIMULADO];
    if (!itens.length) {
      return "Matérias disponíveis para `/simulado`: `js`, `historia`, `geografia`, `ciencias`, `portugues`, `matematica`.";
    }
    itens = itens.sort(() => Math.random() - 0.5).slice(0, 4);
    const sim = { idx: 0, pts: 0, itens };
    setSS(K_SIM, sim);
    return mostrarQuestaoSim(sim);
  }

  m = raw.match(/^\/alt\s+([a-d])$/i);
  if (m) {
    const sim = getSS(K_SIM);
    if (!sim || !sim.itens?.[sim.idx]) return "Nenhum simulado ativo. Comece com `/simulado`.";
    const atual = sim.itens[sim.idx];
    const esc = m[1].toUpperCase().charCodeAt(0) - 65;
    const acertou = esc === atual.ok;
    if (acertou) sim.pts++;

    const fb = (acertou ? "✅ **Acertou!** " : "❌ **Errou.** A certa era **" + String.fromCharCode(65 + atual.ok) + ") " + atual.o[atual.ok] + "**. ") + atual.why;
    sim.idx++;

    if (sim.idx >= sim.itens.length) {
      delSS(K_SIM);
      const pct = Math.round((sim.pts / sim.itens.length) * 100);
      return fb + "\n\n🏁 **FIM DO SIMULADO!**\n📊 Pontuação: **" + sim.pts + "/" + sim.itens.length + "** (" + pct + "% de acerto)\n" +
        (pct >= 75 ? "🔥 Mandou muito bem!" : "💪 Continue praticando com `/simulado` ou `/flashcard`!");
    }

    setSS(K_SIM, sim);
    return fb + "\n\n" + mostrarQuestaoSim(sim);
  }

  // Técnicas de memorização
  if (/^\/?(?:tecnica|tecnicas de estudo|memorizacao|como memorizar)$/i.test(norm(raw))) {
    return "🎓 **Técnicas Científicas para Memorizar Mais Rápido:**\n\n" +
      "1. **Repetição Espaçada:** revise o conteúdo após **1 dia → 3 dias → 7 dias → 30 dias**.\n" +
      "2. **Recordação Ativa (Active Recall):** feche o caderno e tente lembrar antes de olhar (use `/flashcard`!).\n" +
      "3. **Método Feynman:** explique o assunto em voz alta como se estivesse ensinando para uma criança.\n" +
      "4. **Blocos Pomodoro:** 25 min focado + 5 min de descanso sem celular.";
  }

  return null;
}

export const Estudos = { handle, totalCards: CARDS.length };
