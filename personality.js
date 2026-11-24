/* BACH AI 4.8 — Piadas Interativas & Humor Local
 * Faz a pergunta da piada e espera o usuário tentar responder antes de revelar
 * se acertou ou errou!
 */

const K_PIADA = "bach_piada_ativa_v1";

const JOKES = [
  {
    q: "Por que o computador foi ao médico?",
    a: "Porque estava com um vírus! 🤧💻",
    k: ["virus", "doente", "febre", "gripe", "malware", "infectado"]
  },
  {
    q: "O que o zero disse para o oito?",
    a: "Bonito cinto! 😂8️⃣",
    k: ["cinto", "aperto", "apertado", "cintura"]
  },
  {
    q: "Por que o livro de matemática ficou triste?",
    a: "Porque tinha muitos problemas! 📘😅",
    k: ["problema", "problemas", "conta", "contas", "calculo"]
  },
  {
    q: "Qual é o café mais perigoso do mundo?",
    a: "O ex-presso! ☕🚨",
    k: ["expresso", "ex presso", "presso", "preso"]
  },
  {
    q: "Por que o celular foi para a escola?",
    a: "Para melhorar a memória! 📱🎓",
    k: ["memoria", "aprender", "estudar", "inteligente", "espaco"]
  },
  {
    q: "O que um bit falou para o outro?",
    a: "A gente se encontra no barramento — ou: você é muito elétrico hoje! ⚡💻",
    k: ["barramento", "eletrico", "ligado", "byte", "energia"]
  },
  {
    q: "Por que o programador não gosta da natureza?",
    a: "Porque tem muitos bugs! 🐛🌿",
    k: ["bug", "bugs", "inseto", "insetos", "bicho"]
  },
  {
    q: "O que o tomate foi fazer no banco?",
    a: "Tirar extrato! 🍅🏦",
    k: ["extrato", "dinheiro", "conta", "molho"]
  },
  {
    q: "O que a aranha faz na internet?",
    a: "Fica na web! 🕷️🌐",
    k: ["web", "teia", "site", "rede"]
  },
  {
    q: "Qual é o cúmulo da paciência?",
    a: "Sentar na beira da estrada e esperar o tempo passar! ⏳😄",
    k: ["tempo", "esperar", "estrada", "passar"]
  },
  {
    q: "O que o oceano disse para a praia?",
    a: "Nada, só deu uma onda! 🌊😎",
    k: ["onda", "nada", "aceno", "tchau", "agua"]
  },
  {
    q: "Por que a galinha atravessou a rua?",
    a: "Para provar ao pato que dava — ou simplesmente para chegar do outro lado! 🐔",
    k: ["outro lado", "atravessar", "pato", "provar", "chegar"]
  },
  {
    q: "Qual é o esporte radical favorito do programador?",
    a: "Fazer deploy na sexta-feira às 17h! 🪂💻",
    k: ["deploy", "sexta", "codigo", "producao", "subir"]
  },
  {
    q: "Como se chama um programador sem café?",
    a: "Um erro de sintaxe com pernas! ☕😂",
    k: ["erro", "sintaxe", "sono", "morto", "bugado", "cansado"]
  },
  {
    q: "O que o HTML disse para o CSS?",
    a: "Sem você eu seria só texto sem graça! 💅💻",
    k: ["estilo", "bonito", "feio", "texto", "aparencia", "nada"]
  },
  {
    q: "Por que o jacaré tirou o filho da escola?",
    a: "Porque ele réptil de ano! 🐊📚",
    k: ["reptil", "repetiu", "repetil", "ano"]
  },
  {
    q: "O que é um pontinho amarelo no meio do mar?",
    a: "Um Ruffles à deriva! 🟡🌊",
    k: ["ruffles", "batata", "salgadinho", "peixe", "sol"]
  },
  {
    q: "Por que a planta não responde quando você chama?",
    a: "Porque ela é mudinha! 🌱🤫",
    k: ["muda", "mudinha", "nao fala", "quieta"]
  }
];

let last = -1;

const norm = t => String(t || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

function getAtiva() {
  try { return JSON.parse(sessionStorage.getItem(K_PIADA) || "null"); } catch { return null; }
}

function setAtiva(obj) {
  try {
    if (!obj) sessionStorage.removeItem(K_PIADA);
    else sessionStorage.setItem(K_PIADA, JSON.stringify(obj));
  } catch {}
}

function temAtiva() {
  return Boolean(getAtiva());
}

function pick() {
  if (JOKES.length === 1) return JOKES[0];
  let next = Math.floor(Math.random() * JOKES.length);
  while (next === last) next = Math.floor(Math.random() * JOKES.length);
  last = next;
  return JOKES[next];
}

function iniciarPiada() {
  const j = pick();
  setAtiva(j);
  return "😄 Lá vai uma charada/piada pra você:\n\n**" + j.q + "** 🤔\n\nTenta adivinhar! *(Ou diga “não sei” / “qual é” para eu revelar!)*";
}

function handle(text) {
  const raw = String(text || "").trim();
  const t = norm(raw);
  if (!t) return null;

  // 1) Pedido explícito de piada / humor
  if (
    /^(\/humor|\/piada|piada|conta uma piada|conte uma piada|me conta uma piada|outra piada|mais uma piada|manda uma piada|manda outra piada|quero uma piada|me faz rir|me faca rir|algo engracado|conta uma graca)$/.test(t) ||
    /^(outra|mais uma|manda outra)$/.test(t) && temAtiva()
  ) {
    return iniciarPiada();
  }

  // 2) Se há uma piada esperando resposta do usuário
  const ativa = getAtiva();
  if (ativa) {
    // Não rouba comandos (/...), links ou mensagens longas/perguntas sobre outros assuntos
    const comandoOuOutroAssunto = /^[/]/.test(raw) || /https?:\/\//.test(raw) || t.split(" ").length > 9 ||
      /\b(pesquise|pesquisa|clima|tempo|traduz|tema|auditar|copiar|arquivo|codigo|modulo|imc|agua|senha|flashcard|simulado|quiz|forca|velha)\b/.test(t);

    if (!comandoOuOutroAssunto) {
      setAtiva(null);

      if (/^(nao sei|n sei|sei la|sla|desisto|qual e|qual a resposta|resposta|fala|diz|me diz|conta|revela|nao faco ideia|sem ideia|pq|porque)$/.test(t)) {
        return "😄 Haha, a resposta era:\n\n**" + ativa.a + "**\n\nQuer tentar outra? Diga **“outra piada”** ou `/humor`!";
      }

      const acertou = ativa.k.some(kw => t.includes(kw));
      if (acertou) {
        return "🎉 **Acertou em cheio!** 😂\n\nIsso mesmo: **" + ativa.a + "**\n\nQuer outra? Diga **“outra piada”** ou `/humor`!";
      }

      return "😅 **Quase! Não foi dessa vez!**\n\nA resposta certa era: **" + ativa.a + "** 😂\n\nQuer tentar outra? Diga **“outra piada”**!";
    }
  }

  return null;
}

export const Personality = {
  handle,
  temAtiva,
  iniciarPiada,
  nextJoke: () => pick().q
};
