/* BACH AI 5.6 - PROGRAMAÇÃO + HUMOR + FALLBACK NATURAL (ESTILO CLAUDE)
 * - Remove o bordão robótico "Entendi que você está falando sobre **X**...".
 * - Mantém detector rigoroso de digitação aleatória/teclas soltas.
 * - Responde de forma curta, direta e humana quando algo realmente não fica claro.
 */

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9+# ]+/g, " ").replace(/\s+/g, " ").trim();
const pick = a => a[Math.floor(Math.random() * a.length)];

const TOPICOS = [
  { amb: true, k: ["variavel", "variaveis", "const", "let"], t: "📦 Variável é um nome associado a um valor na memória.\n\nJavaScript:\nlet idade = 20;\nconst nome = \"Ana\";\n\nPython:\nidade = 20\nnome = \"Ana\"\n\nPrefira `const` quando a referência não vai mudar." },
  { amb: true, k: ["funcao", "funcoes", "function", "def"], t: "⚙️ Função é um bloco reutilizável que recebe entradas e devolve um resultado.\n\nJavaScript:\nfunction soma(a, b) {\n  return a + b;\n}\n\nPython:\ndef soma(a, b):\n    return a + b" },
  { amb: true, k: ["loop", "loops", "laco", "repeticao", "for", "while"], t: "🔁 Loop repete um bloco enquanto uma condição valer.\n\nJavaScript:\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n\nPython:\nfor i in range(5):\n    print(i)" },
  { amb: true, k: ["condicional", "condicionais", "if", "else", "se senao"], t: "🔀 Condicional escolhe o fluxo conforme uma condição booleana.\n\nJavaScript:\nif (idade >= 18) {\n  console.log(\"Maior\");\n} else {\n  console.log(\"Menor\");\n}" },
  { amb: true, k: ["array", "arrays", "lista", "listas", "vetor"], t: "📋 Array (ou lista) organiza vários valores em sequência.\n\nJavaScript:\nconst frutas = [\"maçã\", \"uva\"];\nfrutas.push(\"pera\");\n\nPython:\nfrutas = [\"maçã\", \"uva\"]\nfrutas.append(\"pera\")" },
  { amb: true, k: ["objeto", "objetos", "dicionario", "dict", "json"], t: "🗂️ Objeto (JS) ou dicionário (Python) guarda pares chave → valor.\n\nJavaScript:\nconst pessoa = { nome: \"Ana\", idade: 20 };\nJSON.stringify(pessoa);" },
  { amb: true, k: ["classe", "classes", "orientacao a objetos", "poo", "oop"], t: "🏗️ Classe define um molde de dados e comportamentos.\n\nclass Pessoa {\n  constructor(nome) { this.nome = nome; }\n  falar() { return \"Oi, sou \" + this.nome; }\n}" },
  { amb: false, k: ["javascript", "js"], t: "🟨 JavaScript é a linguagem nativa dos navegadores (e roda no servidor com Node.js). Dominar funções, arrays, DOM e `async/await` resolve a maior parte dos projetos web." },
  { amb: false, k: ["python"], t: "🐍 Python prioriza legibilidade e é muito forte em automação, ciência de dados e IA:\n\nnome = input(\"Seu nome: \")\nprint(f\"Olá, {nome}\")" },
  { amb: false, k: ["html"], t: "🧱 HTML estrutura o conteúdo da página (títulos, parágrafos, botões e formulários), enquanto CSS cuida do visual e JS da interatividade." },
  { amb: true, k: ["css", "estilo", "estilizar"], t: "🎨 CSS controla cores, tipografia, espaçamento e responsividade (Flexbox e Grid)." },
  { amb: false, k: ["api", "apis", "fetch", "requisicao"], t: "🌐 API é a ponte de dados entre cliente e servidor. Em JS, `fetch()` busca ou envia JSON de forma assíncrona com `try/catch`." },
  { amb: false, k: ["git", "github", "commit"], t: "🌿 Git versiona alterações do código; GitHub hospeda o repositório remoto e publica sites estáticos com GitHub Pages." },
  { amb: false, k: ["sql", "banco de dados", "database", "mysql"], t: "🗄️ SQL consulta e altera tabelas relacionais com comandos como `SELECT`, `INSERT`, `UPDATE` e `JOIN`." },
  { amb: false, k: ["recursao", "recursiva"], t: "🪞 Recursão é uma função que chama a si mesma até atingir um caso base de parada." },
  { amb: false, k: ["algoritmo", "algoritmos", "logica de programacao"], t: "🧩 Algoritmo é uma sequência clara e finita de passos para transformar uma entrada em saída esperada." },
  { amb: true, k: ["bug", "bugs", "erro no codigo", "debug", "depurar", "nao funciona"], t: "🐛 Para isolar um bug rápido:\n1. Leia o erro exato e a linha.\n2. Reduza o caso ao menor trecho que ainda falha.\n3. Confira valores intermediários antes da falha.\n\nSe quiser, cole o trecho aqui que eu reviso." },
  { amb: false, k: ["criar uma ia", "criar ia", "fazer uma ia", "construir uma ia", "criar inteligencia artificial", "criar um chatbot", "criar chatbot"], t: "🤖 Uma assistente como a BACH junta cinco camadas: memória contínua, interpretação de intenção, execução segura de ferramentas, recuperação em arquivos (RAG) e busca na web quando falta fato atualizado." },
  { amb: false, k: ["aprender a programar", "como programar", "comecar a programar", "aprender programacao", "o que e programacao"], t: "💻 Comece pela lógica (variáveis, condições, loops e funções), pratique criando ferramentas pequenas do dia a dia e leia erros sem pressa." }
];

function responder(texto) {
  const raw = String(texto || "").trim();
  const t = " " + norm(raw) + " ";
  const palavras = t.trim().split(/\s+/).filter(Boolean);

  const ehPerguntaOuPedido = /\?$/.test(raw) ||
    /\b(o que e|oque e|como funciona|como usar|como fazer|explica|explique|exemplo|aprender|comecar|sintaxe|pra que serve|para que serve|ensina|ajuda)\b/.test(t) ||
    palavras.length <= 2;
  if (!ehPerguntaOuPedido) return null;

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
  { c: "dev", t: "Por que o programador confunde Halloween com Natal?\n\nPorque 31 OCT = 25 DEC." },
  { c: "dev", t: "— Seu código tem comentários?\n— Tem: “não mexe aqui”, “não sei por que funciona” e “TODO: arrumar (2019)”." },
  { c: "dev", t: "Existem 10 tipos de pessoas no mundo: as que entendem binário e as que não." },
  { c: "dev", t: "O que o HTML disse ao CSS?\n\nSem você eu seria só texto." },
  { c: "geral", t: "O que o zero disse para o oito?\n\nBonito cinto!" },
  { c: "geral", t: "Por que o livro de matemática ficou triste?\n\nPorque tinha muitos problemas." },
  { c: "geral", t: "O que o tomate foi fazer no banco?\n\nTirar extrato." },
  { c: "geral", t: "Qual é o cúmulo da paciência?\n\nSentar na beira da estrada e esperar o tempo passar." }
];
let saco = [], jaContou = false;
let ruidosSeguidos = 0;

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
    return proximaPiada(cat) + "\n\n(Se quiser outra, peça “outra”.)";
  }

  if (/^(k+a+k+a+|k+s+k+s+|s+k+s+k+|j+k+|k{3,}|haha+|rs+|rsrs+|hehe+)$/.test(t.replace(/\s+/g, ""))) {
    return pick(["Haha, boa! Manda a próxima.", "Ri aqui também. Pode continuar."]);
  }
  if (/(voce e engracada|voce e legal|voce e inteligente|gostei de voce)/.test(t)) {
    return "Obrigada! Gosto quando a conversa flui bem assim.";
  }
  return null;
}

const CURTAS_VALIDAS = new Set((
  "ai ui ei oi ok ue au eu tu vc vcs pq oq oqe qm hj td nd mt mto tb tbm tmb ta to ne ja so fe pe ar hi " +
  "app bug pix cep cpf imc bts sol lua ceu mar rio som luz cor dia dor paz bom mal bem ovo rei lei ser ter ver dar " +
  "ir vir por com sem sob ate mas nem ou se que quem como onde ali ca la va me te nos vos meu minha seu sua " +
  "oxe uai opa eai eita vish vixi aff mds pqp crlh vsf kct obg obgd obgda vlw vlws blz blza tmj flw sla rlx vdd ctz dnv " +
  "web bot dev top gif pdf zip sql css php xml txt ram cpu ssd rgb pi dna pib api git js py ts html json " +
  "sim nao ss nn qro qria fz fzr cmg ctg dms pfv pfvr suav tlg tlgd nois gnt vamo bora " +
  "tal tao dor flor pao cha sal mel gol voo mae pai tio tia avo irma irmao " +
  "rua lar bar par cor voz vez mes ano hora hoje ontem agora tudo nada algo cada todo outro mesmo " +
  "ela ele nos voce mim ti si lhe um uma uns umas dois tres dez cem mil onu " +
  "frio calor fome sede sono medo odio amor raiva triste feliz calma"
).split(" "));

const CLUSTERS_INI = new Set("bl br ch cl cr dr fl fr gl gr gu kn ph pl pr ps qu sh sk sl sm sn sp st sw th tr vr wh".split(" "));
const EN_OR_TECH = new Set("ok okay web wifi show rock punk funk byte link bike kiwi play xbox kpop wiki sony copy type sync york work word week wait want what when will with keep kind king know look make take like book good time year way why who how you yes hey bye new now day boy toy key sky try dry fly cry gym spy".split(" "));

function tokenRuido(w, hasWeirdPunct = false) {
  if (!w) return true;
  if (hasWeirdPunct && w.length <= 2) return true;
  if (CURTAS_VALIDAS.has(w)) return false;
  if (/^\d+$/.test(w) || w.length <= 2) return true;
  if (!/[aeiou]/.test(w)) return true;
  if (/\d/.test(w) && /[a-z]/.test(w) && w.length <= 7) return true;
  if (/[bcdfghjklmnpqrstvwxyz]{3,}/.test(w) && !/(str|scr|spr|ntr|ndr|mbr|mpr|ngr|nch)/.test(w)) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{2}/.test(w) && !CLUSTERS_INI.has(w.slice(0, 2))) return true;
  if (/[bcdfghjklmnpqrstvwxyz]{2}$/.test(w) && !/(ns|rs|ls|st|nt|nd|rd|ld|rk|ck|ng|sh|th|ch|pt)$/.test(w)) return true;
  if (/[bcdfghjklmnpqrstvwxyz]$/.test(w) && !/[lmnrsxz]$/.test(w) && w.length <= 6) return true;
  if (/[kyw]/.test(w) && w.length <= 6 && !EN_OR_TECH.has(w)) return true;
  if (w.length <= 4 && (/^(?:iu|uo|oiu|aei)/.test(w) || (w.length <= 3 && /[bcdfghjklmnpqrstvwxyz]u$/.test(w)))) return true;
  if (hasWeirdPunct && w.length <= 4) return true;
  return false;
}

function ehTeclaOuNumeroSolto(raw) {
  const s = String(raw || "").trim();
  if (!s) return true;
  const n = norm(s);
  if (!n || /^[\d\s]+$/.test(n)) return true;

  const hasWeirdPunct = /[;[\]~´`\\/=_+*<>{}|]|\.{2,}|^\.|^[.,]|,[a-z]|[a-z],[.,;]?$/i.test(s);
  const toks = n.split(/\s+/).filter(Boolean);

  if (toks.length === 1) return tokenRuido(toks[0], hasWeirdPunct);
  if (toks.length <= 3) {
    if (toks.every(tk => tokenRuido(tk, hasWeirdPunct))) return true;
    if (hasWeirdPunct && toks.every(tk => tk.length <= 2)) return true;
  }
  return false;
}

function escolherInedita(opcoes, ctx = {}) {
  const ultimas = new Set(
    (Array.isArray(ctx?.history) ? ctx.history : [])
      .filter(m => m && m.type !== "user" && m.text)
      .slice(-12)
      .map(m => String(m.text).trim())
  );
  const livre = opcoes.find(o => !ultimas.has(o.trim()));
  return livre || pick(opcoes);
}

function desconhecido(t = "", ctx = {}) {
  const raw = String(t || "").trim();

  if (ehTeclaOuNumeroSolto(raw)) {
    ruidosSeguidos++;
    if (ruidosSeguidos >= 2) {
      return escolherInedita([
        "Parece que você está testando o teclado (`" + raw.slice(0, 18) + "`). Fico por aqui quando quiser mandar algo.",
        "Recebi só teclas soltas (`" + raw.slice(0, 18) + "`). Quando quiser conversar ou testar algo de verdade, é só escrever."
      ], ctx);
    }
    return "Recebi `" + raw.slice(0, 20) + "`, que não forma uma palavra ou comando. O que você queria dizer?";
  }

  ruidosSeguidos = 0;
  const n = norm(raw);
  const em = ctx?.session?.emotion || ctx?.mood || "neutro";
  const sit = ctx?.session?.situation?.resumo || "";

  const temSinalEmocionalAtual = /\b(triste|mal|chatead|cansad|exaust|ansios|sozinh|desanimad|dificil|pesado|demitid|mandad|emprego|raiva|odio|problema|desabaf|choro|medo)\b/.test(n);
  if ((em === "triste" || em === "cansado" || em === "ansioso") && (temSinalEmocionalAtual || (raw.split(/\s+/).length >= 4 && !/^(vc|voce|eu|ele|ela|oi|ola)\b/.test(n)))) {
    const gancho = sit ? " considerando o que você contou (" + sit + ")" : "";
    return escolherInedita([
      "Estou te ouvindo" + gancho + ". O que está pesando mais para você nesse momento?",
      "Faz sentido sentir isso" + gancho + ". Se quiser organizar os próximos passos com calma ou só colocar pra fora, estou aqui."
    ], ctx);
  }

  if (ctx?.mood === "frustrado" || /\b(erra\w*|falh\w*|bug\w*|burr\w*|pior\w*|mds|seja certo|respondeu|nao entendeu)\b/.test(n)) {
    return escolherInedita([
      "Realmente não acertei a interpretação aqui. Me diga em uma frase direta o que você queria dizer ou saber.",
      "Essa resposta passou longe do que você esperava. Pode mandar direto o que queria?"
    ], ctx);
  }

  if (/^tudo$/.test(n) && ctx?.ultimoBot) {
    return "Quando parece que tudo está falhando junto, normalmente tem um ponto específico puxando os outros. Qual foi a resposta minha que mais te incomodou agora?";
  }

  if (/^(?:ai|e ai|entao|depois|hoje|ontem|eu|ela|ele|a gente|nois|nos)\b/.test(n) && raw.split(/\s+/).length >= 3) {
    if (/\b(comprei|ganhei|consegui|passei|fui|assisti|joguei|terminei|comecei|fiz|aprendi|encontrei|vi|achei)\b/.test(n)) {
      return escolherInedita([
        "Interessante — e como isso se desenrolou depois?",
        "Boa! E valeu a pena no resultado final?"
      ], ctx);
    }
    if (/\b(perdi|quebrou|estragou|briguei|briga|falhou|dificil|complicado|puxado|corrido|problema|preocupad|medo|estress|chato|triste|ruim|foda|merda|bosta)\b/.test(n)) {
      return escolherInedita([
        "Situação chata mesmo. Você já vê uma saída prática ou ainda está avaliando as opções?",
        "Entendi o peso disso. Quer detalhar o que aconteceu para pensarmos no próximo passo?"
      ], ctx);
    }
    return "Estou acompanhando. O que veio logo depois disso?";
  }

  if (/^(?:eu\s+)?(?:quero|queria|preciso|to pensando em|estou pensando em|vou|pretendo)\b/.test(n)) {
    return escolherInedita([
      "Certo — qual é o principal obstáculo nisso hoje?",
      "Se quiser, podemos quebrar esse objetivo em passos simples para você começar agora."
    ], ctx);
  }

  if (/\?\s*$/.test(raw)) {
    return "Não peguei o contexto completo dessa pergunta. Pode dar só mais um detalhe (ou pedir `pesquise sobre ...` se quiser busca na internet)?";
  }

  return escolherInedita([
    "Não peguei bem o que você quis dizer com isso — pode escrever com outras palavras?",
    "Faltou contexto para eu responder direito essa frase. O que você queria dizer ou fazer exatamente?"
  ], ctx);
}

export const Prog = { responder, humor, desconhecido, ehTeclaOuNumeroSolto };
