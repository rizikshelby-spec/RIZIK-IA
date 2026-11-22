/* BACH AI 4.0 — quiz local simples.
 * Use /quiz, depois /resposta a|b|c|d.
 */

const QUESTIONS = [
  {
    c: "matemática",
    q: "Quanto é 7 × 8?",
    a: ["54", "56", "64", "48"],
    ok: 1,
    why: "7 × 8 = 56."
  },
  {
    c: "matemática",
    q: "Qual é a raiz quadrada de 81?",
    a: ["7", "8", "9", "10"],
    ok: 2,
    why: "9 × 9 = 81."
  },
  {
    c: "ciências",
    q: "Qual gás as plantas absorvem principalmente na fotossíntese?",
    a: ["Oxigênio", "Nitrogênio", "Gás carbônico", "Hélio"],
    ok: 2,
    why: "As plantas usam dióxido de carbono, água e luz para produzir açúcares."
  },
  {
    c: "ciências",
    q: "Qual é a unidade de força no Sistema Internacional?",
    a: ["Joule", "Newton", "Watt", "Pascal"],
    ok: 1,
    why: "A força é medida em newtons (N)."
  },
  {
    c: "geografia",
    q: "Qual é o maior oceano da Terra?",
    a: ["Atlântico", "Índico", "Ártico", "Pacífico"],
    ok: 3,
    why: "O oceano Pacífico é o maior."
  },
  {
    c: "programação",
    q: "Em JavaScript, qual palavra declara uma variável que pode receber novo valor?",
    a: ["const", "let", "static", "define"],
    ok: 1,
    why: "let permite reatribuição; const impede reatribuir a variável."
  },
  {
    c: "história",
    q: "Em que ano terminou a Segunda Guerra Mundial?",
    a: ["1918", "1939", "1945", "1950"],
    ok: 2,
    why: "A guerra terminou em 1945."
  },
  {
    c: "matemática",
    q: "Quanto é 15% de 200?",
    a: ["15", "20", "25", "30"],
    ok: 3,
    why: "0,15 × 200 = 30."
  }
];

const KEY = "bach_quiz_active_v1";

function getCurrent() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function setCurrent(q) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(q));
  } catch {}
}

function handle(text) {
  const raw = String(text || "").trim();

  const start = raw.match(
    /^\/quiz(?:\s+(matemática|matematica|ci[eê]ncias|geografia|programa[cç][aã]o|hist[oó]ria))?$/i
  );

  if (start) {
    const category = start[1]
      ? start[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : null;

    const list = category
      ? QUESTIONS.filter(q =>
          q.c.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === category
        )
      : QUESTIONS;

    const q = list[Math.floor(Math.random() * list.length)];

    if (!q) {
      return "Ainda não tenho perguntas dessa categoria.";
    }

    setCurrent(q);

    return "🧩 QUIZ — " + q.c.toUpperCase() +
      "\n\n" + q.q +
      "\n\n" + q.a.map((x, i) =>
        String.fromCharCode(65 + i) + ") " + x
      ).join("\n") +
      "\n\nResponda com: /resposta A";
  }

  const answer = raw.match(/^\/resposta\s+([a-d])$/i);

  if (!answer) return null;

  const q = getCurrent();

  if (!q) {
    return "Nenhum quiz ativo. Comece com /quiz.";
  }

  try {
    sessionStorage.removeItem(KEY);
  } catch {}

  const chosen =
    answer[1].toUpperCase().charCodeAt(0) - 65;

  return chosen === q.ok
    ? "✅ Acertou! " + q.why +
      "\n\nQuer outra pergunta? Digite /quiz."
    : "❌ Não foi dessa vez. A resposta certa era " +
      String.fromCharCode(65 + q.ok) + ") " +
      q.a[q.ok] + ". " + q.why +
      "\n\nTente outra com /quiz.";
}

export const Education = {
  handle,
  total: QUESTIONS.length
};
