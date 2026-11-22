/* BACH AI 4.0 — humor e personalidade local.
 * Humor é opcional e leve; não substitui o modelo de linguagem.
 */

const JOKES = [
  "Por que o computador foi ao médico? Porque estava com um vírus. 🤧💻",
  "O que o zero disse para o oito? Belo cinto! 😂",
  "Por que o livro de matemática ficou triste? Porque tinha muitos problemas. 📘",
  "Qual é o café mais perigoso? O ex-presso. ☕",
  "Por que o celular foi para a escola? Para melhorar a memória. 📱",
  "O que um bit falou para o outro? Você é muito elétrico hoje! ⚡",
  "Por que o programador não gosta da natureza? Porque tem muitos bugs. 🐛",
  "Qual é o contrário de volátil? Vem cá, sobrinho. 😅",
  "O que a parede falou para a outra? A gente se encontra na esquina. 🧱",
  "Por que a internet foi ao terapeuta? Estava cheia de conexões mal resolvidas. 🌐"
];

let last = -1;

function pick() {
  if (JOKES.length === 1) return JOKES[0];

  let next = Math.floor(Math.random() * JOKES.length);

  while (next === last) {
    next = Math.floor(Math.random() * JOKES.length);
  }

  last = next;

  return JOKES[next];
}

function handle(text) {
  const t = String(text || "").trim().toLowerCase();

  if (
    /^(\/humor|\/piada|conte uma piada|conta uma piada|me conta uma piada|outra piada|mais uma piada)$/.test(t)
  ) {
    return "😄 " + pick() + "\n\nQuer outra? Digite /humor.";
  }

  return null;
}

export const Personality = {
  handle,
  nextJoke: pick
};
