/* BACH AI 4.0 — criatividade offline básica.
 * Com Gemini conectado, as solicitações criativas passam para o modelo.
 */

const pick = list =>
  list[Math.floor(Math.random() * list.length)];

const normalize = text =>
  String(text || "").replace(/\s+/g, " ").trim();

function handle(text, context = {}) {
  const raw = normalize(text);

  const m = raw.match(
    /^\/(ideia|historia|história|personagem)\s*(.*)$/i
  );

  if (!m) return null;

  if (context.hasAI) return null;

  const action = m[1].toLowerCase();
  const topic = m[2] || "uma aventura inesperada";

  if (action === "ideia") {
    return "💡 IDEIAS PARA: " + topic + "\n\n" + [
      "1. Criar uma versão simples para testar a ideia rapidamente.",
      "2. Transformar o tema em uma história com começo, conflito e solução.",
      "3. Fazer um desafio ou jogo em que o usuário participe.",
      "4. Criar uma versão visual com personagens e cenários próprios."
    ].join("\n") +
    "\n\nEste é um brainstorming inicial; posso desenvolver cada ideia com mais detalhes quando houver um modelo de linguagem conectado.";
  }

  if (action === "personagem") {
    const nomes = ["Luna", "Kael", "Maya", "Noah", "Íris", "Theo"];

    const talentos = [
      "encontrar padrões escondidos",
      "construir invenções",
      "decifrar mapas",
      "conversar com animais",
      "resolver enigmas"
    ];

    const defeitos = [
      "é impaciente",
      "tem medo de errar",
      "confia demais nos outros",
      "guarda tudo para si"
    ];

    return "🎭 PERSONAGEM — " + topic +
      "\n\nNome: " + pick(nomes) +
      "\nTalento: " + pick(talentos) +
      "\nPonto fraco: " + pick(defeitos) +
      "\nObjetivo: descobrir algo importante sobre " + topic +
      "\nConflito: precisa escolher entre o caminho fácil e o caminho correto.";
  }

  const inicio = [
    "Naquela manhã,",
    "Quando tudo parecia normal,",
    "Em uma cidade distante,"
  ];

  const virada = [
    "um detalhe mudou tudo",
    "uma mensagem apareceu sem explicação",
    "um estranho trouxe uma pergunta impossível"
  ];

  const final = [
    "e a maior descoberta foi sobre coragem.",
    "mas a solução estava bem diante dos seus olhos.",
    "e a amizade acabou sendo mais importante que o prêmio."
  ];

  return "📖 HISTÓRIA — " + topic +
    "\n\n" + pick(inicio) + " " + topic +
    ", " + pick(virada) +
    ". O protagonista decidiu investigar, reuniu pistas e pediu ajuda em vez de agir por impulso. Depois de algumas tentativas, percebeu que precisava mudar de estratégia; " +
    pick(final);
}

export const Creativity = { handle };
