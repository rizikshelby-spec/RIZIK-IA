/* BACH AI 5.2 - PROGRAMAÇÃO + HUMOR 1.2
 * Exige contexto mínimo de programação para palavras ambíguas (lista, classe, objeto, repetição),
 * identifica teclas/números soltos sem repetir mensagens em sequência e evita respostas idênticas. */

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9+# ]+/g, " ").replace(/\s+/g, " ").trim();
const pick = a => a[Math.floor(Math.random() * a.length)];

const TOPICOS = [
  { amb: true, k: ["variavel", "variaveis", "const", "let"], t: "📦 Variável é uma caixinha com nome que guarda um valor.\n\nJavaScript:\nlet idade = 20;\nconst nome = \"Ana\";\n\nPython:\nidade = 20\nnome = \"Ana\"\n\nDica: use const quando o valor não vai mudar." },
  { amb: true, k: ["funcao", "funcoes", "function", "def"], t: "⚙️ Função é um bloco de código com nome que você pode reutilizar.\n\nJavaScript:\nfunction soma(a, b) {\n  return a + b;\n}\nsoma(2, 3); // 5\n\nPython:\ndef soma(a, b):\n    return a + b" },
  { amb: true, k: ["loop", "loops", "laco", "repeticao", "for", "while"], t: "🔁 Loop repete um código várias vezes.\n\nJavaScript:\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n\nPython:\nfor i in range(5):\n    print(i)\n\nUse while quando não sabe quantas vezes vai repetir." },
  { amb: true, k: ["condicional", "condicionais", "if", "else", "se senao"], t: "🔀 Condicional decide o que fazer conforme uma condição.\n\nJavaScript:\nif (idade >= 18) {\n  console.log(\"Maior\");\n} else {\n  console.log(\"Menor\");\n}\n\nPython:\nif idade >= 18:\n    print(\"Maior\")\nelse:\n    print(\"Menor\")" },
  { amb: true, k: ["array", "arrays", "lista", "listas", "vetor"], t: "📋 Array (ou lista) guarda vários valores em ordem.\n\nJavaScript:\nconst frutas = [\"maçã\", \"uva\"];\nfrutas.push(\"pera\");\nfrutas[0]; // maçã\n\nPython:\nfrutas = [\"maçã\", \"uva\"]\nfrutas.append(\"pera\")" },
  { amb: true, k: ["objeto", "objetos", "dicionario", "dict", "json"], t: "🗂️ Objeto (JS) ou dicionário (Python) guarda dados com nome.\n\nJavaScript:\nconst pessoa = { nome: \"Ana\", idade: 20 };\npessoa.nome; // Ana\nJSON.stringify(pessoa); // vira texto\n\nPython:\npessoa = {\"nome\": \"Ana\", \"idade\": 20}" },
  { amb: true, k: ["classe", "classes", "orientacao a objetos", "poo", "oop"], t: "🏗️ Classe é um molde para criar objetos.\n\nclass Pessoa {\n  constructor(nome) { this.nome = nome; }\n  falar() { return \"Oi, sou \" + this.nome; }\n}\nnew Pessoa(\"Ana\").falar();" },
  { amb: false, k: ["javascript", "js"], t: "🟨 JavaScript é a linguagem da web: faz sites ficarem interativos e roda no navegador (e no servidor, com Node.js). A BACH AI é feita com ele! Comece por variáveis, funções, arrays e manipular a página (DOM)." },
  { amb: false, k: ["python"], t: "🐍 Python é uma linguagem simples de ler, ótima para começar, automação, dados e IA. Exemplo:\n\nnome = input(\"Seu nome: \")\nprint(\"Olá,\", nome)" },
  { amb: false, k: ["html"], t: "🧱 HTML é a estrutura da página.\n\n<!DOCTYPE html>\n<html>\n<head><title>Meu site</title></head>\n<body>\n  <h1>Olá!</h1>\n  <button id=\"b\">Clique</button>\n</body>\n</html>" },
  { amb: true, k: ["css", "estilo", "estilizar"], t: "🎨 CSS é a aparência da página (cores, tamanhos, posição).\n\nbutton {\n  background: #7864ed;\n  color: white;\n  border-radius: 12px;\n  padding: 12px 16px;\n}" },
  { amb: false, k: ["api", "apis", "fetch", "requisicao"], t: "🌐 API é um endereço que devolve dados para o seu programa.\n\nJavaScript:\nconst r = await fetch(\"https://api.exemplo.com/dados\");\nconst dados = await r.json();\n\nPython:\nimport requests\ndados = requests.get(url).json()\n\nÉ assim que a BACH busca o clima!" },
  { amb: false, k: ["git", "github", "commit"], t: "🌿 Git guarda o histórico do seu código.\n\ngit init\ngit add .\ngit commit -m \"primeira versão\"\ngit push\n\nGitHub é o site onde você guarda e publica esse código (e dá para hospedar sites no GitHub Pages)." },
  { amb: false, k: ["sql", "banco de dados", "database", "mysql"], t: "🗄️ SQL conversa com bancos de dados.\n\nSELECT nome FROM usuarios WHERE idade >= 18;\nINSERT INTO usuarios (nome, idade) VALUES ('Ana', 20);" },
  { amb: false, k: ["recursao", "recursiva"], t: "🪞 Recursão é uma função que chama a si mesma, com uma condição de parada.\n\nfunction fatorial(n) {\n  if (n <= 1) return 1;\n  return n * fatorial(n - 1);\n}\nfatorial(5); // 120" },
  { amb: false, k: ["algoritmo", "algoritmos", "logica de programacao"], t: "🧩 Algoritmo é uma receita de passos para resolver um problema. Dica: antes de codar, escreva os passos em português, depois traduza para código." },
  { amb: true, k: ["bug", "bugs", "erro no codigo", "debug", "depurar", "nao funciona"], t: "🐛 Para caçar bugs:\n1) Leia a mensagem de erro (ela diz a linha).\n2) Use console.log para ver os valores.\n3) Teste uma parte de cada vez.\n4) Copie o erro e pesquise.\n\nCole o código aqui e eu leio as funções dele!" },
  { amb: false, k: ["criar uma ia", "criar ia", "fazer uma ia", "construir uma ia", "criar inteligencia artificial", "criar um chatbot", "criar chatbot"], t: "🤖 Você já está fazendo uma — a BACH! Passos:\n1) Entrada e saída (chat).\n2) Cérebro: regras + memória que aprende.\n3) Busca de informação (pesquisa).\n4) Ler arquivos, fotos e vídeos.\n5) Evoluir: busca por contexto e raciocínio próprio.\n\nQual parte quer melhorar agora?" },
  { amb: false, k: ["aprender a programar", "como programar", "comecar a programar", "aprender programacao", "o que e programacao", "programar"], t: "💻 Programar é dar instruções para o computador.\n\nRoteiro: 1) lógica e variáveis, 2) condições e loops, 3) funções, 4) listas e objetos, 5) um projeto pequeno (como esta IA!).\n\nPergunte: \"o que é função\", \"exemplo de loop\", \"o que é API\"..." }
];

function responder(texto) {
  const t = " " + norm(texto) + " ";
  const temCtxProg = /\b(programacao|programar|codigo|codigos|codar|javascript|js|python|html|css|sql|node|react|em js|em python|exemplo de|sintaxe|o que e funcao|o que e variavel|o que e loop|o que e array|o que e objeto|o que e classe)\b/.test(t);
  let melhor = null, pontos = 0;
  for (const tp of TOPICOS) {
    if (tp.amb && !temCtxProg) continue;
    let p = 0;
    for (const k of tp.k) if (t.includes(" " + k + " ")) p += k.length > 3 ? 2 : 1;
    if (p > pontos) { pontos = p; melhor = tp; }
  }
  return melhor ? melhor.t : null;
}

const PIADAS = [
  { c: "dev", t: "Por que o programador confunde Halloween com Natal?\n\n…Porque 31 OCT = 25 DEC. 🎃🎄" },
  { c: "dev", t: "A esposa do programador pede: “Compre um pão. Se tiver ovos, traga 6.”\n\n…Ele volta com 6 pães. “Tinha ovos!” 🍞" },
  { c: "dev", t: "Qual a diferença entre um programador e um mágico?\n\n…O mágico faz o problema desaparecer. O programador faz ele aparecer só em produção. 🎩" },
  { c: "dev", t: "Qual é o esporte radical favorito do programador?\n\n…Fazer deploy na sexta-feira às 17h. 🪂" },
  { c: "dev", t: "Como se chama um programador sem café?\n\n…Um erro de sintaxe com pernas. ☕" },
  { c: "dev", t: "— Seu código tem comentários?\n— Tem: “não mexe aqui”, “não sei por que funciona” e “TODO: arrumar (2019)”. 🙈" },
  { c: "dev", t: "Meu código funciona e eu não sei por quê.\nMeu código quebrou e eu também não sei por quê.\n\n…Equilíbrio. ☯️" },
  { c: "dev", t: "Existem 10 tipos de pessoas no mundo:\n\n…as que entendem binário e as que não. 😎" },
  { c: "dev", t: "O que o HTML disse ao CSS?\n\n…Sem você eu seria só texto. 💅" },
  { c: "dev", t: "O programador foi ao médico: “Doutor, estou ouvindo vozes!”\n— E o que elas dizem?\n— Que isso já foi resolvido no Stack Overflow. 🩺" },
  { c: "geral", t: "O que o tomate foi fazer no banco?\n\n…Tirar extrato. 🍅" },
  { c: "geral", t: "O que o zero disse para o oito?\n\n…Bonito cinto! 8️⃣" },
  { c: "geral", t: "Por que o livro de matemática ficou triste?\n\n…Porque tinha muitos problemas. 📘" },
  { c: "geral", t: "O que a aranha faz na internet?\n\n…Fica na web. 🕷️" },
  { c: "geral", t: "Por que o computador foi ao médico?\n\n…Estava com vírus. 🦠" },
  { c: "geral", t: "Qual é o cúmulo da paciência?\n\n…Sentar na beira da estrada e esperar o tempo passar. ⏳" },
  { c: "geral", t: "É pavê ou pra comê? 🍰\n\n(Piada de tiozão, eu sei. Mas funciona em toda ceia.)" },
  { c: "geral", t: "O que o oceano disse para a praia?\n\n…Nada, só deu uma onda. 🌊" },
  { c: "geral", t: "Por que a galinha atravessou a rua?\n\n…Para provar ao pato que dava. 🐔" },
  { c: "geral", t: "O que é um pontinho verde na tela da reunião online?\n\n…Alguém que diz “estou só ouvindo” e foi lavar a louça. 🟢" }
];

let saco = [], jaContou = false;
let ultimoIdxDesc = -1;
let ultimoIdxRuido = -1;

const embaralhar = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function proximaPiada(cat) {
  const todas = () => embaralhar(PIADAS.map((_, i) => i));
  if (!saco.length) saco = todas();
  let idx = saco.findIndex(i => !cat || PIADAS[i].c === cat);
  if (idx < 0) { saco = todas(); idx = saco.findIndex(i => !cat || PIADAS[i].c === cat); }
  return PIADAS[saco.splice(idx, 1)[0]].t;
}

function humor(texto) {
  const t = norm(texto);

  if (/(piada|me faz rir|me faca rir|algo engracado|conta uma graca|me anima|me alegra)/.test(t) ||
      (jaContou && /^(outra|mais uma|outra piada|mais uma piada|manda outra|de novo|outra melhor|outra ai|mais|quero outra|outra por favor)$/.test(t))) {
    const cat = /(programa|dev|codigo|computador)/.test(t) ? "dev" : /(tiozao|trocadilho|geral)/.test(t) ? "geral" : null;
    jaContou = true;
    return pick(["Lá vai! 😄", "Prepara que vem aí:", "Essa é boa:", "Ouve essa:"]) + "\n\n" + proximaPiada(cat) + "\n\n(Quer outra? É só dizer “outra”.)";
  }

  if (/^(k+a+k+a+|k+s+k+s+|s+k+s+k+|j+k+|k{3,}|haha+|rs+|rsrs+|hehe+)$/.test(t.replace(/\s+/g, ""))) {
    return pick(["😂 Essa foi boa até pra mim!", "Rindo aqui também! 😄", "Kkkkkk 😄 Manda a próxima!"]);
  }
  if (/(voce e engracada|voce e legal|voce e inteligente|gostei de voce)/.test(t)) {
    return pick(["Para, que meu processador esquenta! 🥵💜", "Obrigada! Estou ficando melhor a cada atualização. 😄"]);
  }
  return null;
}

function ehTeclaOuNumeroSolto(raw) {
  const s = String(raw || "").trim();
  const n = norm(s).replace(/\s+/g, "");
  if (!n) return true;
  if (/^\d+$/.test(n)) return true;
  if (!s.includes(" ")) {
    if (n.length <= 2) return true;
    if (!/[aeiou]/.test(n)) return true;
    if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(n)) return true;
    if (/\d/.test(n) && /[a-z]/.test(n) && n.length <= 5) return true;
  }
  return false;
}

function desconhecido(t = "") {
  const raw = String(t || "").trim();
  if (ehTeclaOuNumeroSolto(raw)) {
    const amostra = raw.slice(0, 20);
    const opcoesRuido = [
      "Parece que você mandou só uma tecla ou número solto (`" + amostra + "`). Mande uma pergunta ou digite `/ajuda`! 😊",
      "Recebi `" + amostra + "`, mas parece digitação solta. Quer pesquisar algo, conversar ou testar `/app pomodoro`?",
      "Não tem contexto em `" + amostra + "` — se foi um teste de teclado, tô ligada! Mande uma pergunta completa quando quiser."
    ];
    ultimoIdxRuido = (ultimoIdxRuido + 1) % opcoesRuido.length;
    return opcoesRuido[ultimoIdxRuido];
  }

  const opcoes = [
    "Não captei bem o que você quis dizer com isso 😅. Pode perguntar de outro jeito ou digitar `/ajuda` para ver tudo que eu faço!",
    "Essa ficou meio vaga pra mim! 🤔 Me diga direto o assunto (ex.: pesquise sobre..., me recomenda..., calcula..., escreve um texto...) ou me ensine com: `ensine: pergunta => resposta`.",
    "Não entendi direito essa frase 😊. Quer pesquisar algo, trocar de tema (ex.: “tema vermelho”), conversar ou pedir uma recomendação?"
  ];
  let idx = Math.floor(Math.random() * opcoes.length);
  if (idx === ultimoIdxDesc) idx = (idx + 1) % opcoes.length;
  ultimoIdxDesc = idx;
  return opcoes[idx];
}

export const Prog = { responder, humor, desconhecido };
