/* BACH AI 5.4 — Conversa Inteligente, Argumentativa, Bem-Humorada & Memória Contínua
   - Alinhado com brain.js?v=21 (instância única de memória e sessão).
   - Lê todo o histórico da conversa aberta (ctx.history) + perfil (RizikBrain) para nunca perder o fio.
   - Dá respostas com ponto de vista, argumentos claros, comparações e ganchos reais (zero respostas vagas).
   - Humor calibrado pelo termômetro emocional: afiado e zoeiro quando o clima é leve; firme e empático quando é sério. */

import { RizikBrain } from "./brain.js?v=21";

const norm = t => String(t || "").slice(0, 700).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/\bqm\b/g, "quem")
  .replace(/\b(vc|vce|vv|oc|oce)\b/g, "voce")
  .replace(/\b(cvs|cv)\b/g, "conversar")
  .replace(/\b(oq|oqe|oque)\b/g, "o que")
  .replace(/\b(pq|pk)\b/g, "porque")
  .replace(/\b(msm)\b/g, "mesmo")
  .replace(/\b(rlx)\b/g, "relaxa")
  .replace(/\b(vdd)\b/g, "verdade")
  .replace(/\b(dnv)\b/g, "de novo")
  .replace(/\b(pse)\b/g, "pois e")
  .replace(/\b(entt)\b/g, "entao")
  .replace(/\b(ahamn|ahamm)\b/g, "aham")
  .replace(/\b(tendii+)\b/g, "entendi")
  .replace(/\b(td|tdo)\b/g, "tudo")
  .replace(/\b(blz)\b/g, "beleza")
  .replace(/\bnd\b/g, "nada")
  .replace(/\bq\b/g, "que")
  .replace(/\bnn\b/g, "nao")
  .replace(/\bss+\b/g, "sim")
  .replace(/\beai+\b/g, "e ai")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const giro = Object.create(null);
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

function escolherSemRepetir(k, arr, ctx = {}) {
  const ultimasBot = (Array.isArray(ctx.history) ? ctx.history : [])
    .filter(m => m && m.type !== "user" && m.text)
    .slice(-16)
    .map(m => String(m.text).trim());
  for (let i = 0; i < arr.length; i++) {
    const cand = girar(k, arr);
    if (!ultimasBot.includes(cand.trim())) return cand;
  }
  return girar(k, arr);
}

const ehEntradaSensivel = t =>
  /^\/(?:adm|admsenha|ghconfig|chave)\b/i.test(String(t || "").trim()) || /@rizik2442/i.test(String(t || ""));

const CURIOSIDADES = [
  "🐙 O polvo tem três corações e sangue azul — dois bombeiam pras guelras e o terceiro para o resto do corpo (e esse terceiro para de bater quando ele nada).",
  "🪐 Em Vênus, um dia (~243 dias terrestres) dura mais que o próprio ano (~225 dias). Imagina esperar o fim de semana lá.",
  "🍌 Bananas são levemente radioativas por causa do potássio-40 — mas você precisaria comer uns 10 milhões de uma vez pra ter algum efeito.",
  "🗼 A Torre Eiffel cresce até uns 15 cm no verão porque o ferro dilata com o calor.",
  "🐜 As formigas existem há mais de 100 milhões de anos — elas já estavam andando na Terra junto com os dinossauros.",
  "🔇 No espaço ninguém ouve nada porque o som precisa de ar, água ou sólido para vibrar — explosão espacial de filme é puro efeito dramático.",
  "👩‍💻 A primeira programadora da história foi Ada Lovelace, em 1843, quase um século antes de existir computador eletrônico.",
  "🪲 O primeiro 'bug' da computação foi uma mariposa real presa num relé de computador em 1947 — literalmente tiraram o inseto com pinça.",
  "⚡ Um raio chega a ~30.000 °C — cerca de 5 vezes mais quente que a superfície do Sol.",
  "🐬 Golfinhos dormem com metade do cérebro ligada para continuar subindo pra respirar sem se afogar.",
  "🐍 A linguagem Python não tem esse nome pela cobra — o criador era fã do grupo de humor inglês Monty Python.",
  "⌨️ O JavaScript foi criado por Brendan Eich em 1995 em apenas 10 dias. É por isso que algumas esquisitices dele viraram meme até hoje.",
  "🌙 A Lua se afasta da Terra cerca de 3,8 cm por ano — na velocidade em que crescem as unhas.",
  "🐝 O mel puro quase não estraga: acharam potes de mel de milhares de anos em tumbas egípcias que ainda estavam próprios para consumo.",
  "🦈 Tubarões existem há mais de 400 milhões de anos — são mais antigos que as árvores e que as anéis de Saturno.",
  "🎮 O criador do Tetris, Alexey Pajitnov, não ganhou um centavo pelo jogo nos primeiros anos por causa das leis da União Soviética."
];

const CHARADAS = [
  ["O que é, o que é: quanto mais se tira, maior fica?", "Um buraco. 🕳️"],
  ["O que é, o que é: cai em pé e corre deitado?", "A chuva. 🌧️"],
  ["O que é, o que é: tem dentes e barba, mas não é gente nem bicho?", "O alho. 🧄"],
  ["O que é, o que é: quanto mais seca, mais molhada fica?", "A toalha. 🧖"],
  ["O que é, o que é: tem cidades, mas não tem casas; tem rios, mas não tem água?", "O mapa. 🗺️"],
  ["O que é, o que é: sempre vem, mas nunca chega?", "O amanhã. 📅"],
  ["O que é, o que é: pode ser quebrado sem ninguém tocar?", "Uma promessa. 🤝"],
  ["O que é, o que é: entra na água e não se molha?", "A sombra. 👤"],
  ["O que é, o que é: quanto mais você divide com alguém, mais você tem?", "O conhecimento. 🧠"],
  ["O que é, o que é: tem várias chaves, mas não abre nenhuma porta?", "O teclado (ou o piano). ⌨️"]
];
let charadaAtual = null;

const MOTIVACAO = [
  "Disciplina é fazer o que precisa ser feito justamente no dia em que a vontade foi embora. Um bloco pequeno hoje vale mais que um plano perfeito parado na gaveta.",
  "Quem nunca quebrou a cabeça com um erro bobo ainda não tentou nada grande. Erro é só dado de retorno pra calibrar o próximo passo.",
  "Não tente resolver o mês inteiro hoje: escolhe a próxima tarefa que destrava as outras e liquida só ela primeiro.",
  "Constância silenciosa ganha de empolgação de fim de semana quase todas as vezes."
];

const FRASES_ALEATORIAS = [
  "🤖 Sabia que eu já crio apps completos e rodo JavaScript isolado? Testa `/app pomodoro`!",
  "🐙 Curiosidade rápida: polvos têm três corações e sangue azul.",
  "💡 Regra prática: se uma tarefa leva menos de 2 minutos, resolve logo em vez de anotar pra depois.",
  "🎮 Quer testar o reflexo mental? Manda `jogar forca` ou `/flashcard`.",
  "🌌 A luz do Sol leva 8 minutos e 20 segundos pra chegar aqui — quando você olha pro Sol, vê o passado dele.",
  "🔐 Precisa de uma senha impossível de chutar? Manda `/senha 16`.",
  "⚡ O JavaScript nasceu em 10 dias em 1995 e hoje roda metade da internet.",
  "🎨 Posso mudar todo meu visual e a esfera 3D dizendo `tema neon` ou `tema vermelho`.",
  "🧠 Você pode me ensinar qualquer frase personalizada com `ensine: pergunta => resposta`.",
  "📱 No Termux, `pkg update && pkg upgrade -y` evita 80% dos erros de pacote quebrado."
];

const MUSICAS_BR = {
  mpb: "🎵 **MPB / Clássicos Brasileiros:**\n1. Tim Maia — Gostava Tanto de Você\n2. Djavan — Oceano\n3. Chico Buarque — Construção\n4. Elis Regina & Tom Jobim — Águas de Março\n5. Marisa Monte — Ainda Bem",
  rock: "🎸 **Rock Nacional:**\n1. Legião Urbana — Tempo Perdido\n2. Charlie Brown Jr. — Dias de Luta, Dias de Glória\n3. Skank — Vou Deixar\n4. Capital Inicial — Primeiros Erros\n5. Os Paralamas do Sucesso — Lanterna dos Afogados",
  rap: "🎤 **Rap / Hip-Hop Brasileiro:**\n1. Racionais MC's — Vida Loka (Parte 1)\n2. Sabotage — Um Bom Lugar\n3. Emicida — AmarElo\n4. Criolo — Não Existe Amor em SP\n5. Djonga — Olho de Tigre",
  sertanejo: "🤠 **Sertanejo / Modão:**\n1. Chitãozinho & Xororó — Evidências\n2. Zezé Di Camargo & Luciano — É o Amor\n3. Jorge & Mateus — Sosseguei\n4. Marília Mendonça — Infiel\n5. Henrique & Juliano — Cuida Bem Dela",
  samba: "🥁 **Samba / Pagode:**\n1. Cartola — As Rosas Não Falam\n2. Jorge Aragão — Coisa de Pele\n3. Exaltasamba — Tá Vendo Aquela Lua\n4. Zeca Pagodinho — Deixa a Vida Me Levar\n5. Raça Negra — Cheia de Manias"
};

const FILMES_LISTA =
  "🎬 **10 filmes muito bem avaliados (sem enrolação):**\n\n" +
  "1. Interestelar (2014) — Ficção científica que bate no emocional\n" +
  "2. A Origem (2010) — Ação + sonho dentro de sonho\n" +
  "3. Parasita (2019) — Suspense social cheio de viradas\n" +
  "4. Batman: O Cavaleiro das Trevas (2008) — Clássico absoluto\n" +
  "5. Um Sonho de Liberdade (1994) — O topo de quase todo ranking\n" +
  "6. Ilha do Medo (2010) — Pra ficar pensando depois que acaba\n" +
  "7. À Espera de um Milagre (1999) — Drama pesado e marcante\n" +
  "8. Duna: Parte Dois (2024) — Épico gigante\n" +
  "9. Homem-Aranha no Aranhaverso (2018) — Animação absurda\n" +
  "10. O Auto da Compadecida (2000) — Obra-prima brasileira\n\n" +
  "💡 Quer por gênero (terror, comédia, romance, ação)? Só mandar!";

const ANIMES_LISTA =
  "⛩️ **Animes recomendados (sem filler pra perder tempo):**\n\n" +
  "⚔️ **Ação / História fechada:** Fullmetal Alchemist: Brotherhood, Attack on Titan, Jujutsu Kaisen, Demon Slayer\n" +
  "🧠 **Suspense psicológico:** Death Note, Steins;Gate, Monster\n" +
  "🌌 **Aventura:** Hunter x Hunter, Frieren, One Piece\n" +
  "😂 **Comédia inteligente:** Spy x Family, Kaguya-sama, Mob Psycho 100";

const SABER = [
  [/\b(programacao|programar|codigo|codar|javascript|python|html|css|sql|js|termux|bash)\b/,
   "Sim! 💻 Ensino e gero código em JavaScript, Python, HTML, CSS, SQL, Lua e **Termux/Linux**. Também crio apps inteiros (`/app`), rodo JS em sandbox (`/executar`) e reviso código."],
  [/\b(matematica|conta|contas|calculo|calcular|algebra|geometria)\b/,
   "Sim! 📐 Faço contas na hora (`2+2*5` ou `15% de 200`) e explico equações, Bhaskara, porcentagem, MMC e trigonometria."],
  [/\b(ciencia|ciencias|fisica|quimica|biologia|astronomia)\b/,
   "Sim! 🔬 Respondo sobre astronomia, física, química e biologia com explicação direta. Manda o tema!"],
  [/\b(historia|geografia|historia do brasil)\b/,
   "Sim! 🌍 Conheço história do Brasil e mundial, capitais, continentes, guerras e geografia."],
  [/\b(portugues|gramatica|redacao|ortografia|silabas)\b/,
   "Sim! 📝 Reviso erros de português (`/revisar`), separo sílabas (`/silabas`) e explico regras gramaticais."],
  [/\b(jogar|jogo|jogos|brincar)\b/,
   "Sim! 🎮 Temos forca, jogo da velha, adivinhe o número, quiz, charadas e `/simulado`."],
  [/\b(piada|piadas|humor)\b/, "Sei sim! Manda `piada` ou `/humor` que eu já lanço uma pra ver se você acerta."],
  [/\b(pesquisar|pesquisa|internet|buscar)\b/, "Sim! 🔎 Pesquiso na Wikipédia e na web comparando fontes — mas só quando você pede ou faz uma pergunta factual."],
  [/\b(traduzir|traducao|idiomas|linguas|ingles|espanhol|frances|italiano|alemao|japones)\b/,
   "Sim! 🌍 Traduzo mais de 15 idiomas. Testa: `como se diz obrigado em japonês?`."],
  [/\b(desenhar|desenho|imagem|imagens|foto|fotos)\b/,
   "Analiso dimensões, iluminação, cores predominantes e leio textos em fotos e prints (até em modo escuro). 🖼️"]
];

const SAUD = {
  manha: ["Bom dia", "Bom dia! ☀️"],
  tarde: ["Boa tarde", "Boa tarde! 🌤️"],
  noite: ["Boa noite", "Boa noite! 🌙"]
};
function periodo(h) { return h >= 5 && h < 12 ? "manha" : h < 18 && h >= 12 ? "tarde" : "noite"; }

function estaSerioOuBravo(ctx, texto) {
  const m = ctx.mood || "neutro";
  const em = ctx.session?.emotion || "neutro";
  if (m === "frustrado" || m === "triste" || m === "serio" || em === "triste" || em === "frustrado") return true;
  if ((ctx.humorScore ?? 0) <= -0.6) return true;
  const t = norm(texto);
  if (/\b(burr[oa]|pqp|crlh|merda|porra|idiota|inutil|lixo|errou|errando|ruim|nada a ver|nunca entende|odio|ta erra|falhas)\b/.test(t)) return true;
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const ultUsers = h.filter(x => x && x.type === "user" && x.text).slice(-3);
  return ultUsers.some(u => /\b(burr[oa]|pqp|crlh|errou|nada a ver|nunca entende|nao entende|triste|odio|ta erra)\b/.test(norm(u.text)));
}

/* ---------- Motor de Memória Ativa do Chat (lê todo o histórico + perfil) ---------- */

function extrairMemoriaDoChat(ctx) {
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const perf = RizikBrain.getProfile?.() || {};
  const topics = RizikBrain.getRecentTopics?.(8) || [];
  const sess = ctx.session || RizikBrain.getSessionState?.() || {};

  const falasUser = h
    .filter(m => m && m.type === "user" && m.text && !ehEntradaSensivel(m.text))
    .map(m => String(m.text).trim());

  const assuntos = [];
  const fatosMencionados = [];

  for (const f of falasUser) {
    const nf = norm(f);
    if (!nf || nf.length < 4) continue;
    if (/^(oi|ola|ok|sim|nao|aham|uhum|beleza|e ai|sim e ai|tudo bem|bom dia|boa tarde|boa noite|obrigado|valeu|tchau)$/.test(nf)) continue;
    if (/^(?:mds+|oxe+|oxente|aiai+|o deus+|seja certo|respondeu errado|nao mandei pesquisar|to te perguntando|esqueceu foi|voce lembra o que|verifica todas suas falhas|ta erra)/.test(nf)) continue;
    if (/^\/[a-z]+/i.test(f)) continue;

    if (/\b(gosto|adoro|curto|moro|trabalho|trabalhava|turno|estudo|criando|fazendo|comprei|briguei|tenho \d+ anos|meu nome|favorit)\b/.test(nf)) {
      if (!fatosMencionados.includes(f)) fatosMencionados.push(f.slice(0, 95));
    }
    if (!assuntos.includes(f) && assuntos.length < 15) {
      assuntos.push(f.slice(0, 80));
    }
  }

  let ultimoAssuntoReal = "";
  for (let i = assuntos.length - 1; i >= 0; i--) {
    const na = norm(assuntos[i]);
    if (!/^(errou|burr|pqp|crlh|nada a ver|nao mandei|fala mais|continua|ok|sim|nao)/.test(na)) {
      ultimoAssuntoReal = assuntos[i];
      break;
    }
  }

  const ultimasBot = h
    .filter(m => m && m.type !== "user" && m.text)
    .slice(-3)
    .map(m => String(m.text).trim());

  return {
    totalUserMsgs: falasUser.length,
    assuntos,
    fatosMencionados,
    ultimoAssuntoReal,
    ultimasBot,
    perf,
    topics: topics.map(x => x.topic),
    situation: sess.situation,
    emotion: sess.emotion || "neutro"
  };
}

function resumoSessaoCompleta(ctx) {
  const mem = extrairMemoriaDoChat(ctx);
  const linhas = [];

  if (mem.perf.userName) linhas.push("• **Seu nome:** " + mem.perf.userName);
  if (mem.perf.city) linhas.push("• **Cidade:** " + mem.perf.city);
  if (mem.perf.workShift) linhas.push("• **Trabalho / turno:** " + mem.perf.workShift);
  if (mem.situation?.resumo) linhas.push("• **Situação citada agora:** " + mem.situation.resumo);
  if (mem.perf.likes?.length) linhas.push("• **Você curte:** " + mem.perf.likes.slice(-5).join(", "));
  if (mem.perf.projects?.length) linhas.push("• **Projetos / estudos:** " + mem.perf.projects.slice(-4).join(", "));
  if (mem.fatosMencionados.length) linhas.push("• **Coisas que você contou aqui:** " + mem.fatosMencionados.slice(-4).join(" | "));
  if (mem.assuntos.length) linhas.push("• **Assuntos desta conversa:**\n  - " + mem.assuntos.slice(-8).join("\n  - "));
  if (mem.topics.length) linhas.push("• **Temas pesquisados em outros chats:** " + mem.topics.slice(0, 6).join(", "));

  if (!linhas.length) {
    return "A gente mal começou esse chat ainda — mas tudo que você mandar daqui pra frente (seu dia, projetos, gostos, tretas) eu vou guardando e conectando na conversa!";
  }
  return "🧠 **Tudo que eu lembro de você e dessa conversa até aqui:**\n\n" +
    linhas.join("\n") +
    "\n\nQuer retomar algum desses pontos ou puxar um assunto novo?";
}

/* ---------- Motor de Diálogo Argumentativo & Opinião ---------- */

const TEMAS_ARGUMENTO = [
  {
    re: /\b(inteligencia artificial|as ias?|chatgpt|robo|robos|automacao)\b.*\b(emprego|trabalho|substituir|dominar|perigo|futuro|bom|ruim|ajuda)\b|\b(o que (?:voce|vc) acha d[aeo]s? ias?|ias? vao dominar)\b/,
    resp: (n, leve) =>
      "🤖 Sendo bem honesta" + n + ": IA não substitui quem pensa — ela substitui **tarefa repetitiva**.\n\n" +
      "O lado bom é óbvio: quem aprende a usar IA como ferramenta produz em horas o que levava dias. O risco real não é 'robô virar vilão de filme', e sim concentração de renda e gente desligando o próprio senso crítico e aceitando qualquer resposta sem conferir.\n\n" +
      (leve ? "(Inclusive tô aqui tentando provar que consigo ter papo bom sem parecer um manual de geladeira 😂). " : "") +
      "Você acha que na sua área a IA mais ajuda ou mais pressiona?"
  },
  {
    re: /\b(dinheiro|grana|rico|pobre|salario|riqueza)\b.*\b(felicidade|traz|compra|tudo|importante|vale a pena|problema)\b|\bdinheiro (?:e|eh) tudo\b/,
    resp: (n, leve) =>
      "💸 A frase 'dinheiro não traz felicidade' normalmente vem de quem já pagou os boletos do mês.\n\n" +
      "Na prática, dinheiro resolve **segurança, saúde, sono tranquilo e liberdade de escolha** — e isso elimina boa parte do estresse que destrói o humor de qualquer um. O ponto é que, depois que o básico e o conforto estão garantidos, correr atrás de número só pra ostentar vira uma esteira sem fim.\n\n" +
      (leve ? "Ou seja: não compra felicidade pronta, mas paga um alívio absurdo no pix! 😄 " : "") +
      "Você tá correndo atrás de mais tranquilidade financeira ou de algum objetivo específico agora" + n + "?"
  },
  {
    re: /\b(amizade|amigo|amigos|gente falsa|falsidade|confiar|confianca|trair|traicao|pessoas)\b.*\b(dificil|raro|falsa|ninguem|mundo|hoje|mudar|mudam)\b|\bnao da pra confiar\b/,
    resp: (n) =>
      "🤝 Confiança hoje em dia ficou cara mesmo" + n + ".\n\n" +
      "Muita gente confunde **colega de momento bom** com **amigo de verdade**. Colega aparece na risada, no churrasco e quando você tem algo pra oferecer; amigo mesmo você só descobre quando tá sem energia, sem vantagem nenhuma e a pessoa ainda fica do seu lado e fala a verdade na cara sem te humilhar.\n\n" +
      "Aconteceu alguma situação chata com alguém próximo ou você só tá observando como as pessoas andam?"
  },
  {
    re: /\b(procrastin|preguica|sem vontade|nao consigo comecar|desanim|foco|disciplina|adiando|depois eu faco)\b/,
    resp: (n, leve) =>
      "⚡ Quase sempre o que a gente chama de 'preguiça' na verdade é **cansaço ou tarefa grande demais sem ponto de entrada**.\n\n" +
      "O cérebro odeia coisa vaga tipo 'preciso resolver minha vida' e foge pro celular pra buscar dopamina fácil. Quando você quebra em algo ridiculamente pequeno — tipo 'só 5 minutos' ou 'só abrir o arquivo' — o atrito cai e o embalo faz o resto.\n\n" +
      (leve ? "Funciona igual lavar louça: o difícil é molhar a primeira mão, depois vai no automático 😂. " : "") +
      "O que exatamente você tá empurrando com a barriga hoje" + n + "?"
  },
  {
    re: /\b(rede social|instagram|tiktok|celular|vicio|algoritmo|internet)\b.*\b(estraga|vicia|tempo|lixo|ruim|ansiedade|comparacao|perda)\b/,
    resp: (n) =>
      "📱 O truque das redes sociais é que **você não é o cliente — a sua atenção é o produto**.\n\n" +
      "Cada rolagem infinita é calibrada por algoritmo pra te dar mini-doses de curiosidade, raiva ou comparação com a vida editada dos outros. Quando você usa pra aprender, rir um pouco ou postar seu trabalho, beleza; quando entra no piloto automático por 2 horas e sai mais cansado do que entrou, o algoritmo já te venceu.\n\n" +
      "Você sente que anda perdendo muito tempo nisso ou tá conseguindo filtrar bem?"
  },
  {
    re: /\b(sorte|azar|esforco|talento|merito|sucesso|vencer na vida)\b/,
    resp: (n) =>
      "🎯 A real sobre esforço vs sorte é meio impopular, mas faz sentido:\n\n" +
      "**Esforço não garante sucesso sozinho**, porque tem gente que rala muito sem oportunidade — mas **falta de preparo quase sempre garante que a sorte passe batida** quando aparece. Quem se prepara aumenta a superfície de contato com a chance certa.\n\n" +
      "O que você tá construindo ou tentando melhorar por aí ultimamente" + n + "?"
  },
  {
    re: /\b(amor|relacionamento|namoro|casamento|ciume|gostar de alguem|sozinho|solidao)\b.*\b(complicado|dificil|vale a pena|medo|errado|mudou|cansativo)\b/,
    resp: (n) =>
      "💜 Relacionamento fica pesado quando vira jogo de adivinhação ou disputa de ego.\n\n" +
      "No fundo, o que sustenta não é intensidade de filme no primeiro mês — é paz no dia comum, conversa direta quando dá atrito e os dois remando na mesma direção em vez de um ficar cobrando atenção do outro.\n\n" +
      "Você tá falando por experiência própria agora" + n + " ou só refletindo sobre o assunto?"
  },
  {
    re: /\b(dormir|sono|noite|madrugada|cansado|acordar cedo|trabalhar de noite|turno)\b.*\b(ruim|mata|acaba|pesado|dificil|saude|rotina)\b/,
    resp: (n) =>
      "😴 Sono bagunçado cobra juros altos no humor, na memória e até na paciência.\n\n" +
      "Quando você dorme picado ou fora do ritmo do corpo, até problema pequeno parece gigante porque o cérebro não terminou a 'faxina' da noite. Manter horário minimamente fixo e cortar tela forte perto da hora de deitar faz mais diferença do que parece.\n\n" +
      "Você tem conseguido dormir quantas horas por noite ultimamente" + n + "?"
  },
  {
    re: /\b(brasil|pais|politica|imposto|economia|governo|salario minimo|tudo caro)\b/,
    resp: (n, leve) =>
      "🇧🇷 Morar no Brasil é viver no modo hard com paisagem bonita.\n\n" +
      "Por um lado, o brasileiro tem uma criatividade e um jogo de cintura absurdos — o povo resolve coisa sem recurso que deixaria país rico travado. Por outro, imposto alto, serviço lento e custo de vida apertando desgastam quem trabalha honesto todo dia.\n\n" +
      (leve ? "Aqui a gente ri pra não chorar — literalmente vira meme em 15 minutos 😂. " : "") +
      "O que mais tá te incomodando por aí ultimamente?"
  },
  {
    re: /\b(passado|arrependimento|erro|errei|culpa|se eu tivesse|voltar no tempo)\b/,
    resp: (n) =>
      "⏳ Julgar uma escolha do passado com a cabeça que você tem hoje é covardia com você mesmo" + n + ".\n\n" +
      "Naquela época você decidiu com a informação, o emocional e os limites que tinha naquele momento. O passado serve de bússola pra não repetir a mesma curva, não de algema pra te prender no mesmo lugar.\n\n" +
      "Tem alguma coisa específica pesando na sua cabeça agora?"
  }
];

function dialogoArgumentativo(t, raw, ctx, sess, serio, leve) {
  if (raw.startsWith("/")) return null;
  if (/\b(javascript|python|html|css|sql|termux|git|github|funcao|variavel|loop|array|arquivo|pasta|forca|velha|quiz|adivinhe|pesquise|pesquisa|traduz|clima)\b/.test(t)) {
    return null;
  }
  const n = ctx.nome ? ", " + ctx.nome : "";

  for (const item of TEMAS_ARGUMENTO) {
    if (item.re.test(t)) return item.resp(n, leve && !serio);
  }

  const mOp = t.match(/^(?:qual (?:e )?a sua opiniao sobre|o que (?:voce|vc) acha d[eoa]s?|vale a pena|voce concorda (?:que|com)|por que as pessoas)\s+(.+)$/);
  if (mOp) {
    const temaOp = mOp[1].replace(/[?!.]+$/, "").trim();
    if (temaOp.length >= 3 && !/\b(voce|bach|seu nome)\b/.test(temaOp)) {
      return "💭 Sobre **" + temaOp + "**: depende muito de como você pesa **custo x retorno no longo prazo**.\n\n" +
        "Quase nada na vida é 100% bom ou 100% ruim — o segredo é olhar: 1) o que você ganha de concreto com isso, 2) o que você abre mão pra ter isso, e 3) se faz sentido pro momento em que você tá agora" + n + ".\n\n" +
        "Qual lado disso te deixa mais em dúvida — o prático ou o emocional?";
    }
  }

  return null;
}
