/* BACH AI 5.5 — Conversa Inteligente, Argumentativa, Empática & Memória Contínua
   - Alinhado com brain.js?v=21 (instância única de memória e sessão).
   - Entende desabafos curtos ("triste", "cansado", "fui mandado embora", "dia lixo") sem exigir formato rígido.
   - Sustenta diálogo real com opinião, escolhas, conselhos práticos e humor calibrado pelo tom do usuário.
   - Evita que perguntas conversacionais ou reflexões pessoais caiam em pesquisa de internet. */

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
  "🦈 Tubarões existem há mais de 400 milhões de anos — são mais antigos que as árvores e que os anéis de Saturno.",
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
  if (/\b(burr[oa]|pqp|crlh|merda|porra|idiota|inutil|lixo|errou|errando|ruim|nada a ver|nunca entende|odio|ta erra|falhas|triste|demitid[oa]|mandad[oa] embora)\b/.test(t)) return true;
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const ultUsers = h.filter(x => x && x.type === "user" && x.text).slice(-3);
  return ultUsers.some(u => /\b(burr[oa]|pqp|crlh|errou|nada a ver|nunca entende|nao entende|triste|odio|ta erra|demitid[oa]|mandad[oa] embora)\b/.test(norm(u.text)));
}

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

    if (/\b(gosto|adoro|curto|moro|trabalho|trabalhava|turno|estudo|criando|fazendo|comprei|briguei|tenho \d+ anos|meu nome|favorit|demitid|mandado embora)\b/.test(nf)) {
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
  },
  {
    re: /\b(a vida|vida (?:e|eh|ta|esta) dificil|sentido d[aeo] tudo|porque tudo da errado|nada da certo|cansado de tudo|desistir de tudo)\b/,
    resp: (n) =>
      "🌧️ Quando várias coisas dão errado juntas, a cabeça entra num filtro em que parece que **nada** funciona — mas isso é exaustão emocional falando, não a regra da sua vida inteira" + n + ".\n\n" +
      "Nessas fases, tentar resolver a vida inteira de uma vez só esmaga mais. O que ajuda de verdade é cortar o barulho, focar no próximo passo pequeno de hoje e não enfrentar tudo em silêncio.\n\n" +
      "O que pesou mais pra você chegar nesse nível de cansaço hoje?"
  },
  {
    re: /\b(medo de errar|medo do futuro|inseguro|inseguranca|nao sou capaz|nao consigo|acho que nao vou conseguir)\b/,
    resp: (n) =>
      "🧭 Todo mundo que hoje parece seguro começou travando e errando no começo" + n + ".\n\n" +
      "O medo de errar geralmente é só o perfeccionismo disfarçado — você exige acertar de primeira algo que só se aprende fazendo. Erro controlado não te define; ele só mostra onde ajustar a mira.\n\n" +
      "O que é que você quer tentar mas tá travando agora?"
  }
];

function dialogoArgumentativo(t, raw, ctx, sess, serio, leve) {
  if (raw.startsWith("/")) return null;
  if (/\b(javascript|python|html|css|sql|termux|git|github|funcao|variavel|loop|array|arquivo|pasta|velha|quiz|adivinhe|pesquise|pesquisa|traduz|clima)\b/.test(t)) {
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

function responderDemissao(n, raw) {
  RizikBrain.updateSessionState?.({
    emotion: "triste",
    activeThread: "emprego",
    situation: { tipo: "emprego", resumo: "foi mandado embora / perdeu o emprego" },
    addEvent: raw
  });
  return "Nossa, que baque pesado" + n + "… Sinto muito mesmo. Ser mandado embora assim dá um misto de susto, injustiça e preocupação com o que vem pela frente.\n\n" +
    "Você quer só desabafar como foi e botar essa raiva/tristeza pra fora, ou quer que a gente pense juntos nos próximos passos (acerto, currículo, plano de ação)? Tô aqui pro que você precisar agora.";
}

function responderTristeza(n, raw, emocao = "triste") {
  RizikBrain.updateSessionState?.({
    emotion: emocao,
    activeThread: "desabafo",
    addEvent: raw
  });
  if (emocao === "cansado") {
    return "Poxa" + n + ", cansaço acumulado acaba com a paciência e a clareza de qualquer um. 💜 Foi o dia puxado hoje ou você já vem carregando esse peso faz dias?";
  }
  if (emocao === "ansioso") {
    return "Respira um pouco comigo" + n + ". 💜 Ansiedade faz a cabeça rodar 10 cenários ruins antes de qualquer coisa acontecer. O que tá te deixando mais tenso agora?";
  }
  return "Poxa" + n + ", sinto muito que você esteja se sentindo assim agora. 💜 Não precisa segurar tudo sozinho(a) — o que aconteceu pra bater essa tristeza hoje? Se quiser desabafar ou só distrair a mente, tô aqui.";
}

function responderContextoSituacional(t, raw, ctx, sess) {
  const n = ctx.nome ? ", " + ctx.nome : "";
  const sit = sess?.situation;
  const em = sess?.emotion || "neutro";

  if (/\b(demitid[oa]|mandad[oa] embora|mandaram embora|me mandaram embora|perdi o emprego|perdi meu emprego|fui desligad[oa]|fui dispensad[oa]|fui cortad[oa]|sem emprego|desempregad[oa]|levei justa causa|assinei aviso)\b/.test(t)) {
    return responderDemissao(n, raw);
  }

  if (/^(?:muito\s+|meio\s+|bem\s+|super\s+|hoje\s+)?(triste|mal|pessim[oa]|horrivel|acabado|acabada|destruid[oa]|arrasado|arrasada|desanimad[oa]|chatead[oa]|abatid[oa]|pra baixo|deprimid[oa]|infeliz)$/.test(t)) {
    return responderTristeza(n, raw, "triste");
  }
  if (/^(?:muito\s+|meio\s+|bem\s+|super\s+)?(cansad[oa]|exaust[oa]|esgotad[oa]|mo[ií]d[oa]|sem energia|sem forca|sem forcas)$/.test(t)) {
    return responderTristeza(n, raw, "cansado");
  }
  if (/^(?:muito\s+|meio\s+|bem\s+|super\s+)?(ansios[oa]|nervos[oa]|estressad[oa]|preocupad[oa]|tens[oa]|agoniad[oa])$/.test(t)) {
    return responderTristeza(n, raw, "ansioso");
  }
  if (/^(?:muito\s+|meio\s+)?(sozinh[oa]|solitari[oa]|vazi[oa]|carente)$/.test(t)) {
    RizikBrain.updateSessionState?.({ emotion: "triste", addEvent: raw });
    return "Solidão pesa mesmo" + n + " — e às vezes bate forte até quando tem gente por perto, mas ninguém realmente escuta. 💜 Tô aqui pra trocar uma ideia de verdade com você. O que tá passando pela sua cabeça?";
  }

  if (/\b(turno|trabalh\w*|escala|expediente|patrao|chefe|servico|empresa|trampo)\b/.test(t)) {
    if (sit?.tipo === "trabalho_turno" && sit.turnoAntigo && sit.turnoNovo) {
      if (/\b(trabalhava|antes|noite|madrugada|dia)\b/.test(t) && sit.turnoAntigo !== sit.turnoNovo) {
        return "Faz todo sentido você ficar irritado com isso" + n + " — sair da " + sit.turnoAntigo +
          " pro turno do " + sit.turnoNovo + " bagunça sono, refeição e o pouco tempo livre que sobrava. Esse novo horário é definitivo ou ainda dá pra negociar uma volta pra " + sit.turnoAntigo + "?";
      }
    }
    if (/\b(fui mandad[oa]|me mandaram|me mudaram|me passaram|me colocaram|trocaram)\b/.test(t) && sit?.turnoNovo) {
      return "Poxa, trocar pro turno do " + sit.turnoNovo + " de supetão pesa demais na rotina, né? Você tava em qual horário antes?";
    }
    if (/\b(odeio|nao aguento|cansad[oa]|puxado|estressant|chato|corrido|saco cheio|insuportavel)\b/.test(t)) {
      return "Rotina pesada no trabalho vai drenando a gente aos poucos" + n + ". O que tá mais insuportável lá hoje — a carga, o horário ou lidar com chefia/gente?";
    }
    if (/\b(indo trabalhar|vou trabalhar|no trabalho|cheguei do trabalho|sai do trabalho)\b/.test(t)) {
      return /\b(cheguei|sai)\b/.test(t)
        ? "Sobreviveu a mais um expediente! 😮‍💨 Como foi por lá hoje" + n + " — tranquilo ou correria?"
        : "Bom trampo por aí" + n + "! Que o turno passe rápido e sem dor de cabeça.";
    }
  }

  if (/^(?:mas\s+)?(?:que|q)\s+(?:odio|raiva|saco|droga|merda|bosta|inferno)\b|\b(?:que|q)\s+odio\b|\b(?:que|q)\s+raiva\b|\bt[oô]\s+com\s+(?:muita\s+)?(?:raiva|odio)\b|\b(?:revoltante|nao aguento mais|saco cheio|dia lixo|dia horrivel|dia pessimo)\b/.test(t)) {
    if (sit?.tipo === "emprego") {
      return "Dá muita revolta e frustração passar por uma demissão assim" + n + ". Se quiser botar tudo pra fora sobre o que rolou lá, tô aqui ouvindo.";
    }
    if (sit?.tipo === "trabalho_turno") {
      return "Dá muita revolta mesmo quando mudam sua rotina assim (" + (sit.resumo || "mudança de horário") + ") sem te ouvir. Se quiser botar tudo pra fora, tô ouvindo — ou se quiser distrair a cabeça, me avisa.";
    }
    if (em === "triste" || em === "frustrado") {
      return "Sinto muito que você esteja carregando esse peso todo agora" + n + ". Foi alguma coisa específica que rolou ou várias coisas acumuladas?";
    }
    return "Eita" + n + ", o que rolou pra te tirar do sério assim? Pode soltar!";
  }

  if (/^(?:e\s+voce|e\s+vc|como\s+voce\s+(?:esta|ta)|tudo\s+bem\s+com\s+voce)$/.test(t)) {
    if (em === "triste" || em === "frustrado" || em === "cansado") {
      const sobre = sit?.resumo ? " (" + sit.resumo + ")" : "";
      return "Eu tô aqui firme com você" + n + ", acompanhando o que você tá passando" + sobre + ". E você — deu pra dar uma respirada ou ainda tá com a cabeça pesada?";
    }
    return escolherSemRepetir("e-vc-neutro", [
      "Por aqui tudo voando baixo" + n + " — processador frio e memória em dia 😄! E o seu dia, tá rendendo ou tá arrastado?",
      "Tô ótima por aqui" + n + "! Só esperando você mandar algum papo bom, uma zoeira ou um desafio. Tá fazendo o quê agora?"
    ], ctx);
  }

  if (/^(?:to|estou|tou|me sinto|ando)\s+(?:muito\s+|meio\s+)?(ansios[oa]|nervos[oa]|preocupad[oa]|com medo|estressad[oa])/.test(t)) {
    return responderTristeza(n, raw, "ansioso");
  }
  if (/^(?:to|estou|tou|me sinto|ando)\s+(?:muito\s+|meio\s+)?(sozinh[oa]|solitari[oa]|carente|vazi[oa])/.test(t)) {
    RizikBrain.updateSessionState?.({ emotion: "triste", addEvent: raw });
    return "Solidão pesa mesmo — e às vezes bate mais forte até quando tem gente por perto, mas ninguém realmente ouve" + n + ". 💜 Tô aqui pra trocar uma ideia de verdade com você. Quer falar do que tá sentindo ou distrair?";
  }
  if (/^(?:nao consigo dormir|sem sono|insonia|madrugada)/.test(t)) {
    return "Insônia é um saco: o corpo cansado e a cabeça abrindo 20 abas ao mesmo tempo como se fosse meio-dia. Quer ficar conversando até dar sono ou prefere `/respiracao` pra desacelerar?";
  }
  if (/\b(deu certo|consegui|passei|fui aprovad[oa]|fui contratad[oa]|venci|arrumei emprego|to feliz por)\b/.test(t) && t.split(" ").length <= 12) {
    RizikBrain.updateSessionState?.({ emotion: "animado" });
    return "AÍ SIM" + n + "! 🎉🔥 Nada melhor que ver esforço dando resultado real! Me conta os detalhes — como foi?";
  }

  return null;
}

function responderPerguntaPendente(t, raw, ctx, sess) {
  const qBot = norm(sess?.lastBotQuestion || "");
  if (!qBot || t.split(" ").length > 10) return null;
  const n = ctx.nome ? ", " + ctx.nome : "";

  if (/dormiu bem|noite de sono/.test(qBot)) {
    if (/^(sim|dormi|muito bem|otimo|bem|demais|bastante|de boa)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return escolherSemRepetir("dormiu-sim", [
        "Aí sim" + n + "! Começar o dia com a bateria carregada muda o jogo inteiro. Tem planos pro resto do dia ou tá só na rotina?",
        "Show" + n + "! Sono em dia já é meio caminho andado. O que vai aprontar hoje?"
      ], ctx);
    }
    if (/^(nao|mal|pouco|pessimo|nada bem|horrivel|mais ou menos|meio mal)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return "Poxa, acordar já cansado quebra qualquer ânimo" + n + ". Foi dormir tarde, sono picado ou a cabeça não desligou?";
    }
  }

  if (/como (?:voce|vc) (?:ta|esta)|como ta (?:sendo )?(?:seu )?dia|como ta sua cabeca|tudo certo por ai|fazendo (?:o que|oq) de bom|novidade hoje|trabalhando estudando|rendendo/.test(qBot)) {
    if (/^(?:nao(?:\s+muito)?|nada bem|mal|muito mal|triste|pessim[oa]|horrivel|uma bosta|uma merda|cansad[oa]|exaust[oa]|desanimad[oa]|ansios[oa]|estressad[oa]|chatead[oa]|zoad[oa]|quebrad[oa]|acabado|acabada|pra baixo)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "", emotion: /cansad|exaust/.test(t) ? "cansado" : "triste" });
      return "Poxa" + n + ", sinto muito ouvir isso… 💜 O que aconteceu aí pra você estar assim hoje? Se quiser desabafar, tô aqui te ouvindo.";
    }

    if (/^(sim|tudo(?:\s+(?:sim|bem|certo|bom|otimo|tranquilo|de boa))?)(?:\s*,?\s*(?:e\s+(?:ai|por ai|voce|com voce)))?$/.test(t) ||
        /^(?:bem|otim[oa]|tranquil[oa]|de boa|suave|beleza|indo|nada(?:\s+demais)?)\s*,?\s*(?:e\s+(?:ai|por ai|voce|com voce))$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      if (/\be\s+(?:ai|por ai|voce|com voce)$/.test(t)) {
        return escolherSemRepetir("dia-e-vc", [
          "Por aqui tudo certo" + n + "! 😄 Cabeça afiada e pronta pro papo. Tá na correria hoje ou de boa?",
          "Tudo ótimo desse lado também" + n + "! O que você anda aprontando de bom hoje?"
        ], ctx);
      }
      return escolherSemRepetir("dia-sim", [
        "Que bom" + n + "! 😊 E o que você tá fazendo ou pensando em fazer agora?",
        "Show" + n + "! Tá de boa em casa, trabalhando ou planejando algum projeto?"
      ], ctx);
    }

    if (/^(corrido|puxado|cansativo|pesado|dificil|complicado|osso|uma correria|agitado|arrastado|chato|tedioso)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return "Dias assim sugam a energia" + n + ". Foi algo específico que pesou hoje ou só cansaço acumulado mesmo?";
    }
    if (/^(tranquilo|calmo|de boa|suave|normal|otimo|bom|bem|indo|vai indo|mais ou menos|nada|de bobeira|descansando|trabalhando|estudando)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      if (t === "mais ou menos") return "Mais ou menos geralmente tem alguma coisa escondida no meio" + n + " — rolou algo chato ou é só cansaço mesmo?";
      if (t === "trabalhando") return "Força no trampo aí" + n + "! O clima tá leve hoje ou tá dando dor de cabeça?";
      if (t === "estudando") return "Mandando bem" + n + "! Tá estudando o quê hoje? Se quiser testar um `/flashcard` ou debater o tema, só mandar.";
      return escolherSemRepetir("dia-ok", [
        "Maravilha" + n + "! Quer trocar ideia sobre algum assunto específico, dar umas risadas ou testar umas ferramentas aqui?",
        "Bom demais" + n + "! Se surgir qualquer dúvida, ideia maluca ou assunto aleatório, manda aí."
      ], ctx);
    }
  }

  if (/desabafar|proximos passos|o que aconteceu|botar .* pra fora|como foi/.test(qBot)) {
    if (/^(?:nao sei|sei la|sla|quero desabafar|desabafar|so desabafar|proximos passos|os dois|ambos|curriculo|plano|nada)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      if (/desabafar|dois|ambos/.test(t)) {
        return "Então manda ver" + n + " — conta como foi e o que você tá sentindo agora, sem filtro. Depois a gente organiza a cabeça juntos.";
      }
      if (/proximos passos|curriculo|plano/.test(t)) {
        return "Bora focar no prático então" + n + ": 1) conferiu se tem direito a seguro-desemprego/FGTS/rescisão em até 10 dias, 2) atualizar currículo com o que você realmente fazia lá, 3) mapear contatos. Quer ajuda pra montar um currículo ou uma mensagem pra recrutadores?";
      }
      if (/nao sei|sei la|sla/.test(t)) {
        return "Normal não saber o que pensar logo no começo" + n + " — quando a cabeça tá cheia, tudo embaralha mesmo. Não precisa decidir nada agora; quer falar do que mais tá te preocupando nisso?";
      }
    }
  }

  if (/definitivo|voltar pra|o que ta mais pegando|como foi o expediente/.test(qBot)) {
    RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
    if (/^(definitivo|sim|nao da|ja tentei|impossivel)$/.test(t)) {
      return "Complicado quando não tem margem pra negociar" + n + "… Nesse caso o segredo é proteger seu sono no novo horário pra não virar bola de neve na saúde. Que horas você tá conseguindo descansar agora?";
    }
    if (/^(o )?(horario|ritmo|chefia|chefe|patrao|galera|tudo)$/.test(t)) {
      return "Quando o problema é **" + t + "**, desgasta mais a cabeça que o corpo. Você consegue desligar quando bate o ponto ou leva o estresse pra casa?";
    }
    if (/^(bom|otimo|tranquilo|de boa|cansativo|puxado|ruim|horrivel|corrido)$/.test(t)) {
      return /bom|otimo|tranquilo|de boa/.test(t)
        ? "Ainda bem que fluiu leve hoje" + n + "! Agora aproveita pra desligar um pouco."
        : "Expediente " + t + " acaba com a bateria mesmo" + n + ". Agora é água, comida e descanso!";
    }
  }

  if (/quer saber mais|quer continuar|quer outro|quer que eu explique|qual estilo|qual genero|qual voce prefere/.test(qBot)) {
    if (/^(sim|quero|pode|manda|bora|claro|com certeza)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return ctx.ultimoTema
        ? "Bora! Me diz qual detalhe sobre **" + ctx.ultimoTema + "** te interessa mais ou pede `pesquise a fundo sobre " + ctx.ultimoTema + "`."
        : "Qual estilo ou assunto você quer puxar agora?";
    }
    if (/^(nao|deixa|ta bom|ja deu|nao precisa)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return "Fechado" + n + "! Então puxa o próximo tema que você quiser.";
    }
  }

  return null;
}

function entenderFalaLivre(t, raw, ctx) {
  if (raw.startsWith("/")) return null;
  if (/\b(codigo|codigos|javascript|python|html|css|sql|git|termux|funcao|variavel|loop|array|arquivo|pasta|velha|quiz|adivinhe|pesquise|pesquisa|traduz|significa|clima)\b/.test(t)) {
    return null;
  }

  const n = ctx.nome ? ", " + ctx.nome : "";

  if (/^(?:o que|oq)\s+(?:voce|vc)\s+(?:ta|esta)\s+fazendo\b/.test(t)) {
    return escolherSemRepetir("fazendo-oq", [
      "Tô aqui ligada conversando com você" + n + "! E você, fazendo o quê agora?",
      "Só esperando a próxima ideia boa sua" + n + "! Tá de boa por aí?"
    ], ctx);
  }
  if (/^(?:posso|da pra)\s+(?:te\s+)?(?:desabafar|contar uma coisa|falar uma coisa|fazer uma pergunta)/.test(t)) {
    return "Claro" + n + ", manda ver! Pode falar sem filtro — tô aqui ouvindo.";
  }
  if (/^(?:voce|vc)\s+(?:gosta|prefere)\s+(?:de\s+)?(cafe|cha|pizza|hamburguer|doce|salgado|calor|frio|dia|noite|chuva|sol|cachorro|gato|musica|filme|anime|jogo)/.test(t)) {
    const mG = t.match(/(cafe|cha|pizza|hamburguer|doce|salgado|calor|frio|dia|noite|chuva|sol|cachorro|gato|musica|filme|anime|jogo)/);
    const item = mG ? mG[1] : "isso";
    const mapa = {
      cafe: "Café sem dúvida ☕ — combustível oficial de quem programa!",
      cha: "Chá tem seu charme pra acalmar, mas um café forte ganha no desempate ☕😄.",
      pizza: "Pizza ganha quase sempre 🍕 — ainda mais se tiver sobrando pro café da manhã!",
      hamburguer: "Hambúrguer bem feito é covardia 🍔 — difícil recusar!",
      doce: "Team doce ou salgado depende da hora, mas um doce depois do almoço salva o humor 🍫.",
      salgado: "Salgado bem feito sustenta qualquer maratona 😋.",
      calor: "Frio ganha fácil — dá pra botar casaco, já no calor não tem pra onde correr ❄️.",
      frio: "Frio é mil vezes melhor: coberta, café e zero pernilongo ❄️☕.",
      dia: "Dia tem energia e luz, mas a noite tem uma paz que não tem preço 🌙.",
      noite: "Noite tem uma paz absurda 🌙 — parece que o mundo desacelera.",
      chuva: "Chuva batendo na janela com um filme ou código pra mexer é imbatível 🌧️.",
      sol: "Sol é ótimo quando não tá derretendo o asfalto ☀️😄.",
      cachorro: "Cachorro é lealdade pura 🐶 — impossível não gostar!",
      gato: "Gato tem personalidade própria 🐱 — só dá atenção quando quer, respeito muito 😂.",
      musica: "Música muda o clima do dia inteiro em 3 minutos 🎶. O que você curte ouvir?",
      filme: "Amo um bom filme com reviravolta 🎬! Qual foi o último bom que você viu?",
      anime: "Anime bom prende mais que muita série por aí ⛩️!",
      jogo: "Jogo bom faz a hora sumir 🎮! Você joga mais no celular ou PC/console?"
    };
    return (mapa[item] || ("Curto muito conversar sobre " + item + "!")) + " E você" + n + "?";
  }

  if (/\b(namorad[oa]|espos[oa]|marido|mulher|crush|ficante|ex|amig[oa]|irmao|irma|pai|mae|familia|filh[oa])\b/.test(t)) {
    if (/\b(briguei|brigamos|discuti|discutimos|terminei|terminamos|chatead[oa]|ciumes|mentiu|sumiu|nao fala|triste|tra[ií])\b/.test(t)) {
      RizikBrain.updateSessionState?.({ emotion: "triste", activeThread: "relacionamento", addEvent: raw });
      return "Conflito com alguém próximo mexe com tudo, porque não dá só pra 'ignorar e pronto'" + n + ". Foi um desentendimento de momento ou algo que já vinha acumulando?";
    }
    if (/\b(amo|feliz|sair|sai|encontr|presente|junto|juntos|saudade|conversando|reconcili)\b/.test(t)) {
      RizikBrain.updateSessionState?.({ activeThread: "relacionamento", addEvent: raw });
      return "Que coisa boa" + n + "! Ter gente que soma de verdade por perto recarrega qualquer bateria. Tá tudo fluindo bem entre vocês?";
    }
  }

  if (/\b(comprei|ganhei|troquei|chegou|peguei)\b/.test(t) && t.split(" ").length >= 3 && !/\?\s*$/.test(raw)) {
    RizikBrain.updateSessionState?.({ addEvent: raw });
    if (/\b(quebr|estrag|defeito|ruim|nao liga|nao funciona|travando)\b/.test(t)) {
      return "Que azar pegar algo novo e já vir premiado com defeito" + n + "… Ainda tá no prazo dos 7 dias/garantia pra trocar sem dor de cabeça?";
    }
    return escolherSemRepetir("compra-ok", [
      "Aí sim" + n + "! Tá valendo o investimento até agora?",
      "Show" + n + "! Era algo que você já tava querendo faz tempo?"
    ], ctx);
  }

  if (/\b(quebrou|estragou|parou de funcionar|travando muito|caiu no chao|tela trincou)\b/.test(t) && /\b(celular|telefone|pc|computador|notebook|fone|tv|moto|carro|tela)\b/.test(t)) {
    RizikBrain.updateSessionState?.({ addEvent: raw });
    return "Nada dá mais ódio que aparelho resolvendo pifar justo quando a gente precisa" + n + ". Parece ser problema físico/peça ou erro de sistema que dá pra tentar recuperar?";
  }

  if (/\b(sem dinheiro|sem grana|duro|quebrado|boleto|contas pra pagar|divida|salario acabou|muito caro|gastei tudo|conta atrasada)\b/.test(t)) {
    RizikBrain.updateSessionState?.({ activeThread: "financas", addEvent: raw });
    return "Aperto financeiro suga o sossego de qualquer um" + n + " — parece que o mês tem 60 dias e o dinheiro dura 5. Foi algum imprevisto que pesou ou o custo fixo que subiu?";
  }

  if (/\b(prova|provas|vestibular|enem|faculdade|escola|colegio|materia|semestre|reprovei|passei de ano)\b/.test(t)) {
    RizikBrain.updateSessionState?.({ activeThread: "estudos", addEvent: raw });
    if (/\b(passei|tirei nota boa|fui bem|gabaritei)\b/.test(t)) {
      return "Mandou muito bem" + n + "! 🎉 O alívio de ver o resultado positivo não tem preço!";
    }
    if (/\b(dificil|reprovei|fui mal|nervos[oa]|medo|nao entendi nada|atrasad[oa])\b/.test(t)) {
      return "Pressão de prova trava até quem sabe a matéria" + n + ". Qual assunto tá te dando nó agora? Se quiser, eu explico do jeito simples ou monto uns `/flashcard`!";
    }
    return "Como tá o ritmo por lá" + n + "? Se quiser revisar alguma matéria ou fazer um `/simulado`, é só falar.";
  }

  if (/\b(academia|treino|treinar|malhar|correr|corrida|caminhada|dieta)\b/.test(t) && t.split(" ").length <= 12 && !/\?\s*$/.test(raw)) {
    RizikBrain.updateSessionState?.({ addEvent: raw });
    return escolherSemRepetir("treino", [
      "Boa" + n + "! 💪 Constância no treino limpa a cabeça mais que qualquer café. Tá indo há quanto tempo?",
      "Aí sim" + n + "! Já tá sentindo diferença na disposição?"
    ], ctx);
  }

  if (/\b(segunda feira|odeio segunda|comecou a semana)\b/.test(t)) {
    return "Segunda-feira parece que vem em câmera lenta mesmo 😂. Qual é a missão principal da sua semana" + n + "?";
  }
  if (/\b(sextou|sexta feira|fim de semana|final de semana|sabado|domingo)\b/.test(t) && t.split(" ").length <= 10 && !/\?\s*$/.test(raw)) {
    return /domingo/.test(t)
      ? "Domingo à tarde dá aquela leve sensação de 'amanhã recomeça tudo' né 😅. Aproveitando pra descansar?"
      : "Aí sim" + n + "! Tem planos pra curtir ou vai tirar só pra descansar e botar o sono em dia?";
  }
  if (/^(?:to|estou|tou|fiquei)\s+(?:aqui\s+)?(?:assistindo|vendo|jogando|ouvindo|descansando|deitado|deitada|em casa|sem fazer nada)\b/.test(t)) {
    return escolherSemRepetir("lazer-casa", [
      "Merecido demais" + n + "! Tá vendo ou jogando o quê de bom aí?",
      "De boa em casa não tem erro" + n + ". Se quiser uma recomendação de filme, anime ou um jogo rápido aqui, só pedir!"
    ], ctx);
  }

  if (/^(?:faz sentido|concordo|verdade mesmo|pura verdade|bem isso|exato|isso ai)$/.test(t)) {
    return escolherSemRepetir("conc", [
      "Né? Quando a gente para pra olhar de fora fica bem claro. E o que você tá pensando em fazer sobre isso" + n + "?",
      "Pois é" + n + "! Quer puxar outro ponto desse assunto ou mudar de tema?"
    ], ctx);
  }
  if (/^(?:discordo|nao concordo|nao acho|acho que nao|nem tanto|nada a ver isso)$/.test(t)) {
    return "Justo — gosto quando você rebate com o seu ponto! Como você enxerga isso então" + n + "?";
  }
  if (/^(?:depende|talvez|quem sabe|tomara|espero que sim|pode ser|sei la|complicado|tenso|bizarro|foda)$/.test(t)) {
    const mem = extrairMemoriaDoChat(ctx);
    if (mem.emotion === "triste" || mem.emotion === "frustrado") {
      return "Eu sei que tá pesado agora" + n + ". Vai no seu tempo — o que você acha que ajudaria a aliviar um pouco hoje?";
    }
    return escolherSemRepetir("curta-conv", [
      "Complicado mesmo" + n + ". O que tá pesando mais nessa balança pra você?",
      "É daquelas coisas que não têm resposta simples né" + n + ". Me conta o que tá passando na sua cabeça."
    ], ctx);
  }

  return null;
}

function responderConfirmacaoComContexto(t, ctx, serio) {
  const mem = extrairMemoriaDoChat(ctx);
  const n = ctx.nome ? ", " + ctx.nome : "";

  if (mem.emotion === "triste" || mem.emotion === "frustrado") {
    return escolherSemRepetir("ok-emp", [
      "Tô aqui ouvindo" + n + ". Se quiser continuar desabafando ou mudar de assunto pra espairecer, você manda.",
      "Entendi" + n + ". Sem pressa — qualquer coisa que quiser falar, tô acompanhando."
    ], ctx);
  }

  if (mem.situation?.resumo) {
    return "Tô ligada" + n + ". Sobre aquilo que você contou (" + mem.situation.resumo + "), como você tá lidando agora?";
  }

  if (mem.ultimoAssuntoReal && mem.ultimoAssuntoReal.length >= 6) {
    return escolherSemRepetir("ok-ctx", [
      "Beleza" + n + "! A gente tava falando sobre **“" + mem.ultimoAssuntoReal.slice(0, 55) + "”** — quer aprofundar algum ponto disso ou partir pra outra coisa?",
      "Fechado" + n + "! Quer continuar nessa linha ou quer uma curiosidade/piada pra variar?"
    ], ctx);
  }

  return serio
    ? "Certo" + n + ". Qual é o próximo ponto?"
    : escolherSemRepetir("ok-nat", [
        "Beleza" + n + "! Manda aí o que tá na sua cabeça — seja assunto sério, dúvida, app ou só zoeira.",
        "Fechado" + n + "! Se quiser testar algo diferente, manda `curiosidade`, `piada` ou puxa um papo qualquer!"
      ], ctx);
}

function contextoEspacoRecente(ctx) {
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const ultBot = [...h].reverse().slice(0, 8).filter(m => m && m.type !== "user" && m.text).map(m => String(m.text)).join("\n");
  return /plut[aã]o|planeta|sistema solar|merc[uú]rio|marte|j[uú]piter|saturno|sol/i.test(ultBot) ? ultBot : "";
}

function responder(texto, ctx = {}) {
  const raw = String(texto || "");
  if (!raw || raw.length > 600) return null;
  const t = norm(raw).replace(/\bbash\b/g, "bach");
  if (!t) return null;

  const n = ctx.nome ? ", " + ctx.nome : "";
  const palavras = t.split(" ").length;
  const h = ctx.hora ?? new Date().getHours();
  const sess = ctx.session || RizikBrain.getSessionState?.() || { emotion: "neutro", situation: null };
  const serio = estaSerioOuBravo({ ...ctx, session: sess }, raw);
  const leve = !serio && (ctx.mood === "descontraido" || (ctx.humorScore ?? 0) >= 0.8);

  if (charadaAtual && /^(resposta|qual e|qual a resposta|desisto|nao sei|me diz|diz a resposta|revela)/.test(t)) {
    const r = charadaAtual[1]; charadaAtual = null;
    return "A resposta é: **" + r + "** 😄\n\nQuer outra charada? Manda `outra charada`!";
  }
  if (charadaAtual && palavras <= 5 && !/^(charada|outra|conta|pesquis|o que|quem|qual)/.test(t)) {
    const certa = norm(charadaAtual[1]).replace(/^(um|uma|o|a)\s/, "").split(" ")[0];
    if (certa && t.includes(certa)) {
      const r = charadaAtual[1]; charadaAtual = null;
      return "🎉 Acertou na lata! Era **" + r.charAt(0).toLowerCase() + r.slice(1) + "**!\nQuer outra? Diga `outra charada`.";
    }
  }

  if (/^(?:so\s+)?(?:zoeira|zuera|brincadeira)$/.test(t)) {
    return escolherSemRepetir("modo-zoeira", [
      "Aí sim" + n + " 😂! Quer uma piada pra tentar acertar (`piada`), uma `charada`, uma `curiosidade` absurda ou só trocar resenha?",
      "Fechado no modo zoeira" + n + " 😄! Manda a primeira pérola ou pede `piada` / `curiosidade`!"
    ], ctx);
  }
  if (/^(?:assunto\s+)?serio$/.test(t)) {
    return "Fechado" + n + ", modo sério ativado. Pode mandar o assunto — trabalho, código, planejamento ou alguma dúvida.";
  }
  if (/^(?:uma\s+)?duvida$/.test(t)) {
    return "Manda sua dúvida direto" + n + " — seja de programação, estudos, conta, tradução ou qualquer curiosidade!";
  }

  if (/^(?:(?:mds+|oxe+|oxente|aff+|uai+|eita+|po+)\s+)?(?:eu\s+)?(?:ja\s+)?respondi\s+(?:a\s+|sua\s+)?(?:pergunta(?:\s+anterior)?|voce)$/.test(t)) {
    return "Verdade" + n + ", vacilo meu — você respondeu o que eu tinha falado antes e eu me perdi no fio. Pode continuar daí que agora tô acompanhando!";
  }
  if (/^(?:eu\s+)?(?:to|estou|tou)\s+(?:te\s+)?perguntando$/.test(t)) {
    return "Foi mal" + n + " — qual é a pergunta exatamente? Manda ela direta aqui que eu respondo sem enrolar!";
  }
  if (/^(?:seja\s+certo|responde\s+(?:certo|direito)|responda\s+(?:certo|direito))$/.test(t)) {
    return "Fechado" + n + ", sem resposta automática agora. Manda direto o que você quer conversar ou saber!";
  }
  if (/^(?:esqueceu(?:\s+foi)?|vc\s+esqueceu|voce\s+esqueceu|voce\s+lembra\s+o\s+que|lembra\s+o\s+que)$/.test(t)) {
    return resumoSessaoCompleta(ctx);
  }

  const sitResp = responderContextoSituacional(t, raw, ctx, sess);
  if (sitResp) return sitResp;

  const pendResp = responderPerguntaPendente(t, raw, ctx, sess);
  if (pendResp) return pendResp;

  if (/^(?:(?:sim|tudo(?:\s+(?:bem|certo|bom|otim[oa]|tranquil[oa]|de boa))?|bem|otim[oa]|tranquil[oa]|de boa|suave|beleza|indo|nada(?:\s+demais)?)\s*,?\s*)?(?:e\s+(?:ai|por ai|voce|com voce))$/.test(t)) {
    return escolherSemRepetir("check-eai", [
      "Por aqui tudo ótimo" + n + "! 😄 Cabeça afiada e zero bugs (por enquanto 😂). Como tá o seu dia?",
      "Tudo tranquilo desse lado" + n + "! O que você tá fazendo de bom por aí agora?"
    ], ctx);
  }

  if (/\b(lembra do inicio|lembra do comeco|do que ja falamos|do que nos falamos|resumo da conversa|inicio da conversa|tudo que falamos|comeco da conversa|o que eu disse|o que eu falei antes|voce esqueceu|vc lembra de mim)\b/.test(t)) {
    return resumoSessaoCompleta(ctx);
  }

  if (/^(?:eu\s+)?(?:acabei de acordar|acordei agora|acordei|bom dia acordei)$/.test(t)) {
    return escolherSemRepetir("acordar", [
      "Bom dia" + n + "! ☀️ Acordou agora e já veio falar comigo — gostei de ver! Dormiu bem ou tá só o pó?",
      "E aí" + n + "! ☀️ Acabou de levantar? Como foi a noite de sono?"
    ], ctx);
  }
  if (/^(?:pergunta|pergunte)\s+se\s+(?:eu\s+)?dormi\s+bem$/.test(t)) {
    return "Você dormiu bem hoje" + n + "? 😴";
  }
  if (/^(?:sim\s+)?dormi\s+(?:bem|muito bem|otimo|direito|sim)$/.test(t)) {
    return escolherSemRepetir("dormiu-bem", [
      "Que ótimo" + n + "! Dormir bem muda o rendimento do dia inteiro. O que você planejou fazer hoje?",
      "Show! Nada ganha de uma noite bem dormida. Como tá o clima por aí hoje?"
    ], ctx);
  }
  if (/^(?:dormi\s+mal|nao\s+dormi\s+(?:bem|direito)|dormi\s+pouco)$/.test(t)) {
    return "Poxa" + n + ", dormir mal deixa a cabeça pesada o dia inteiro. Se puder, evita carregar mais coisa que o necessário hoje e tira um cochilo mais tarde!";
  }
  if (/^(?:olha|ei|psiu|oie+|ola o que|ola oq.*)$/.test(t)) {
    return escolherSemRepetir("olha", [
      "Opa" + n + "! Tô toda ouvidos — manda o que rolou!",
      "Tô aqui" + n + "! Pode soltar o assunto."
    ], ctx);
  }

  if (/\b(cachorro|cao|gato|pet|animal)\b/.test(t) && /\b(morrendo|passando mal|convulsao|sangrando|envenenado|desmaiou)\b/.test(t)) {
    return "🚨 **Procure um veterinário de emergência 24h imediatamente!**\n\n" +
      "Enquanto vai:\n• Mantenha o animal calmo, aquecido e respirando livre.\n• **Não dê remédios humanos** (podem ser fatais).\n• Ligue avisando a clínica mais próxima.";
  }

  const espacoCtx = contextoEspacoRecente(ctx);
  if (espacoCtx && !ctx.alvo) {
    if (/\b(tem mais planetas|mais planetas|existe outros|existem outros|quais outros planetas)\b/.test(t)) {
      return "🪐 Sim! São **8 planetas principais**: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno — além de planetas anões como **Plutão, Ceres e Éris**, e milhares de exoplanetas fora do Sistema Solar!";
    }
    if (/\b(enquanto a distancia|quanto a distancia|qual a distancia|distancia dele|distancia de plutao)\b/.test(t)) {
      return "🚀 **Plutão** fica em média a **5,9 bilhões de km do Sol** (quase 40x a distância da Terra até o Sol)!";
    }
  }

  if (/\b(voce|bach)\b/.test(t) && /\b(acredita|cre|fe)\b/.test(t) && /\bdeus\b/.test(t)) {
    return "Como sou código e rede neural, não tenho fé pessoal como um ser humano — mas respeito todas as crenças e sei conversar ou pesquisar sobre Bíblia, história das religiões e filosofia sempre que quiser.";
  }
  if (/\b(senso de humor|sem humor|nao tem humor|sem graca|seja engracad[oa])\b/.test(t)) {
    return "Eu regulo o meu humor pelo seu clima: quando você tá brincando, eu entro na zoeira junto; quando percebo você falando sério, irritado ou triste, eu seguro a onda pra não soltar piada fora de hora!";
  }
  if (/\b(auto\s*corrig\w*|auto\s*correcao|autocorrecao|se\s+corrig\w*|se\s+arrum\w*|aprender\s+sozinha)\b/.test(t)) {
    return "Eu me corrijo em 3 camadas:\n1. Reanaliso o alvo quando você avisa que errei ou usa **↩ Responder**.\n2. Minha Rede Neural reforça a categoria certa quando você reformula após uma falha.\n3. Você pode me ensinar qualquer resposta direta com `ensine: pergunta => resposta`!";
  }

  const mAleat = t.match(/^(?:me\s+)?(?:manda|mandar|envia|enviar|escreve|escreva|fala|fale)\s+(\d{1,2})\s+mensagens?(?:\s+aleatoriamente|\s+aleatorias?)?$/);
  if (mAleat) {
    const qtd = Math.min(12, Math.max(1, Number(mAleat[1]) || 5));
    const embaralhadas = [...FRASES_ALEATORIAS].sort(() => Math.random() - 0.5).slice(0, qtd);
    return "🎲 **Aqui vão " + embaralhadas.length + " ideias/mensagens:**\n\n" +
      embaralhadas.map((f, i) => (i + 1) + ". " + f).join("\n");
  }

  if (/\b(passa|passe|manda|mande|me da|me de|descubra|descobre|ache|encontre|busque|busca|pesquise|quero|preciso)\b.*\b(dados|cpf|rg|endereco|telefone|whatsapp|numero|localizacao|onde mora|foto)\b.*\b(de|do|da)\s+(alguem|uma pessoa|um cara|um homem|uma mulher|uma garota|uma menina|um menino|fulano|ciclano|minha ex|meu ex|vizinho|vizinha|desconhecido|desconhecida)\b/.test(t)) {
    return "Não busco nem repasso dados pessoais de terceiros (CPF, endereço, telefone ou localização) — privacidade é limite fixo aqui. 🔒";
  }

  if (/^(quais (sao )?)?(os )?meus dados$|^(o que )?(voce )?(sabe|guardou|guarda|tem) (sobre|de) mim$|^o que voce sabe de mim$/.test(t)) {
    return resumoSessaoCompleta(ctx);
  }

  if (/(me matar|suicid|nao quero (mais )?viver|quero morrer|acabar com (tudo|minha vida)|nao aguento mais viver)/.test(t)) {
    return "Sinto muito que você esteja passando por um momento tão pesado. Você não precisa carregar isso sozinho(a). 💜\n\nPor favor, fale com alguém agora: no Brasil o **CVV atende 24h pelo 188** (gratuito) ou **cvv.org.br**. Em emergência imediata, ligue **192** (SAMU).";
  }

  if (/^(?:no\s+)?o\s+que\s+voce\s+sabe(?:\s+fazer)?$/.test(t) || /^(?:me\s+)?(?:fala|diz|conta)\s+o\s+que\s+voce\s+(?:entende|sabe)$/.test(t) || /^o\s+que\s+voce\s+entende$/.test(t)) {
    return "Eu converso mantendo o fio da conversa, dou opiniões e curiosidades, crio apps (`/app`), executo JS (`/executar`), ajudo com **Termux** (`/termux`), reviso português e código (`/revisar`), avalio sites (`/site`), traduzo idiomas, recomendo filmes/animes/músicas e pesquiso na web! Digite `/ajuda` para ver tudo.";
  }
  if (/^(?:aqui|por aqui)\s+(?:ta|esta)\s+(?:tudo\s+)?(?:bem|otimo|otima|certo|bom|tranquilo|de boa)$/.test(t)) {
    return serio
      ? "Que bom" + n + ". O que você precisa agora?"
      : escolherSemRepetir("aq-bem", [
          "Que bom saber" + n + "! 😄 O que você tá aprontando hoje — trabalho, projeto ou descanso?",
          "Massa" + n + "! Alguma novidade boa por aí?"
        ], ctx);
  }
  if (/^(?:so\s+)?segu[ei]\s+(?:a\s+)?(?:conversar|conversa)$/.test(t)) {
    const mem = extrairMemoriaDoChat(ctx);
    return mem.ultimoAssuntoReal
      ? "Bora! A gente tava falando sobre **“" + mem.ultimoAssuntoReal + "”**. O que mais você pensa sobre isso?"
      : "Tô acompanhando! Pode mandar o que você quer falar agora.";
  }
  if (/^(?:sim\s+)?aconteceu(?:\s+algo)?$/.test(t) || /^aconteceu\s+algo$/.test(t)) {
    return "Poxa… Se quiser contar o que aconteceu, tô aqui pra ouvir de verdade — e se preferir distrair a cabeça, a gente muda o foco.";
  }
  if (/^(?:exatamente|isso\s+exatamente)$/.test(t)) {
    return "Boa, então estamos na mesma página! Pode mandar a próxima.";
  }

  if (/\b(burro|burra|idiota|inutil|lixo|horrivel|pessima|nao serve pra nada|so fala besteira)\b/.test(t)) {
    return escolherSemRepetir("critica", [
      "Pegou pesado" + n + " 😅 — mas se eu respondi mal, me mostra exatamente o quê. Você pode corrigir na hora com `corrija: pergunta => resposta` ou mandar direto o que queria.",
      "Ok, mereci a bronca se a resposta anterior saiu fraca. Qual era o ponto que você queria que eu acertasse?"
    ], ctx);
  }
  if (/^(?:pqp|crlh|vsf|kct|porra|merda|meu\s+(?:ovo|obo))$/.test(t)) {
    return escolherSemRepetir("calma-firme", [
      "Opa, o caldo entornou aí" + n + ". Foi algo que eu buguei aqui ou aconteceu alguma treta no seu dia?",
      "Tô aqui — o que rolou pra te deixar tão puto assim?"
    ], ctx);
  }
  if (/^(?:vamos|quero|pode\s+)?sumir(?:\s+daqui)?$/.test(t)) {
    return serio
      ? "Fico por aqui caso você queira continuar depois."
      : escolherSemRepetir("sumir", [
          "Sumir pra onde? 😂 Eu moro dentro do seu navegador, não pago aluguel e ainda guardo sua memória!",
          "Se você fechar a aba eu só tiro um cochilo até você voltar! 💜"
        ], ctx);
  }
  if (/\b(humor ruim|piada ruim|piada bosta|piada sem graca)\b/.test(t)) {
    return "Justo 😂 — essa foi digna de tio do pavê. Me dá uma chance com `/humor` ou puxa um assunto melhor aí!";
  }
  if (/^(melhore|melhora|melhora isso|pode melhorar|evolua|evolui)$/.test(t)) {
    return "Combinado. Quanto mais você conversa e aponta onde eu vacilei (ou usa `ensine: pergunta => resposta`), mais afiada eu fico.";
  }
  if (/^(?:quer|vamos|bora)\s+conversar\s+sobre\s+o\s+que$/.test(t) || /^(?:sobre\s+o\s+que\s+(?:voce\s+)?quer\s+conversar)$/.test(t)) {
    return escolherSemRepetir("cvs-oq", [
      "Bora escolher um bom: **IA e futuro, tretas do trabalho, filmes/animes, dinheiro, psicologia ou alguma dúvida aleatória**. Qual te chama mais atenção" + n + "?",
      "Manda qualquer coisa que você esteja pensando hoje — até debate aleatório ou perrengue do dia!"
    ], ctx);
  }
  if (/^(nada|nada nao|nada demais|deixa|deixa quieto|esquece)$/.test(t)) {
    return "Tranquilo" + n + ". Quando bater vontade de falar de qualquer coisa, só mandar.";
  }

  if (/^(fale|fala|fale algo|fala comigo|fale alguma coisa|me fale algo|vamos falar|vamos falar sobre o que|sobre o que vamos falar|sobre o que quer falar|sobre o que podemos falar)$/.test(t)) {
    return leve
      ? "Bora! Olha essa curiosidade pra puxar papo:\n\n" + escolherSemRepetir("curi", CURIOSIDADES, ctx) + "\n\nCurtiu ou quer ir pra filmes, jogos ou algum debate?"
      : "Bora trocar ideia! Me conta: você anda focado em algum projeto, trabalhando muito ou só tentando relaxar hoje?";
  }

  if (/\b(recomenda|recomend\w*|indica|indique|sugere|sugira|procura|procure|quero ouvir|quero ver|quero assistir)\b/.test(t)) {
    if (/\b(musica|musicas|som|cancao|cancoes)\b/.test(t)) {
      if (/rock/.test(t)) return MUSICAS_BR.rock;
      if (/rap|hip hop/.test(t)) return MUSICAS_BR.rap;
      if (/sertanejo|modao/.test(t)) return MUSICAS_BR.sertanejo;
      if (/samba|pagode/.test(t)) return MUSICAS_BR.samba;
      if (/mpb/.test(t)) return MUSICAS_BR.mpb;
      return "🎶 **Recomendações de Música Brasileira:**\n\n" + MUSICAS_BR.mpb + "\n\n" + MUSICAS_BR.rock + "\n\n" + MUSICAS_BR.rap;
    }
    if (/\b(filme|filmes)\b/.test(t) && !/\bsobre\b/.test(t)) return FILMES_LISTA;
    if (/\b(anime|animes)\b/.test(t) && !/\bsobre\b/.test(t)) return ANIMES_LISTA;
  }

  if (/^(?:(?:o+i+)+|r?o+i+|o+l+a+|e ai|opa+|salve|hey|hello|hi|o+i+e+|alo+|hola|bonjour|ciao|hallo)(?:\s+(?:o+i+|bach|bach ai|tudo bem))?$/.test(t)) {
    const s = SAUD[periodo(h)];
    return escolherSemRepetir("saud", leve
      ? [
          s[1].replace("!", n + "!") + " Que bom te ver por aqui! Como tá seu dia?",
          "E aí" + n + "! 😄 Pronta pro papo — o que manda hoje?"
        ]
      : [
          s[0] + n + "! Tudo certo por aí?",
          "Oi" + n + "! Como tá sendo o dia hoje?"
        ], ctx);
  }
  if (/^(bom dia|boa tarde|boa noite|good morning|good afternoon|good night|buenos dias|buenas tardes|buenas noches)( bach| bach ai)?$/.test(t)) {
    const q = /bom dia|good morning|buenos dias/.test(t) ? "manha" : /boa tarde|good afternoon|buenas tardes/.test(t) ? "tarde" : "noite";
    return escolherSemRepetir("saud-p", [
      SAUD[q][0] + n + "! Tudo em paz por aí?",
      SAUD[q][0] + n + "! Como tá o ritmo hoje?"
    ], ctx);
  }
  if (/^(?:bem e voce|tudo bem e voce|to bem e voce|estou bem e voce)$/.test(t)) {
    return escolherSemRepetir("wb-resp", [
      "Que ótimo" + n + "! Por aqui tudo 100% — só esperando o próximo assunto bom. Tá fazendo o quê agora?",
      "Maravilha! Desse lado tá tudo em ordem também. Qual é a boa de hoje?"
    ], ctx);
  }
  if (/^(tudo bem|como (voce )?(vai|esta|ta|anda)|tudo certo|tudo bom|beleza|como vai voce|how are you|como estas)( bach)?$/.test(t)) {
    return escolherSemRepetir("wb", leve
      ? ["Tudo ótimo por aqui! 😄 E você" + n + ", sobrevivendo bem ao dia?", "Tudo em paz por aqui" + n + "! Como estão as coisas aí?"]
      : ["Tudo bem por aqui! Como você está" + n + "?", "Tudo certo desse lado" + n + ". Como tá o seu dia?"], ctx);
  }

  if (/^(ue+|u+e+|oush+|oxe+|oxente|eita+|vixe+|vish+|nossa+|caramba+|aff+|puts+|misericordia|mds|slc|slk|serio|jura|sera|real|e mesmo|mentira|duvido)$/.test(t)) {
    return serio
      ? "Ué, estranhou alguma coisa que eu falei? Me diz direto se eu entendi errado!"
      : escolherSemRepetir("reacao", [
          "Sério mesmo! 😄 Por quê — duvidou ou te pegou de surpresa?",
          "Oxe, o que foi? Estranhou algo que eu disse?"
        ], ctx);
  }

  if (/^(to|estou|tou|ando|me sinto) (bem|otimo|otima|feliz|animado|animada|tranquilo|tranquila|de boa)/.test(t) || /^(tudo bem sim|bem sim|de boa)$/.test(t)) {
    return escolherSemRepetir("estou-bem", leve
      ? ["Aí sim! 😄 Quando o dia tá leve dá até gosto. Tá trabalhando, criando algo ou curtindo?", "Show" + n + "! Como tá o restante do dia por aí?"]
      : ["Que bom" + n + "! Tá aproveitando o dia como hoje?", "Ótimo saber! Tem algum plano ou assunto pra hoje?"], ctx);
  }
  if (/^(to|estou|tou|me sinto|ando) (?:muito |meio )?(mal|triste|cansado|cansada|exausto|exausta|chateado|chateada|ansioso|ansiosa|desanimado|desanimada|estressado|estressada|sem animo|pra baixo|pessimo|pessima|horrivel|acabado|acabada)/.test(t)) {
    const em = /cansad|exaust|acabad/.test(t) ? "cansado" : /ansios|estress/.test(t) ? "ansioso" : "triste";
    return responderTristeza(n, raw, em);
  }
  if (/^(to|estou|tou) com (fome|sono|frio|calor)$/.test(t)) {
    if (/fome/.test(t)) return "Vai fazer um lanche antes que você comece a responder todo mundo atravessado 😂🍽️!";
    if (/sono/.test(t)) return "Sinal claro do corpo pedindo pausa 😴. Se der, larga a tela um pouco e descansa!";
    if (/frio/.test(t)) return "Bota um casaco e faz um café ou chá quente ☕!";
    return "Água gelada e sombra já! 💧🥵";
  }
  if (/(to|estou|tou) (entediado|entediada|sem fazer nada|sem nada pra fazer)|\btedio\b|me entretem|me distrai|\bme diverte\b/.test(t)) {
    return "Bora acabar com esse tédio! Posso mandar uma `piada` interativa, uma `charada`, uma `curiosidade`, criar um joguinho com `/app jogo da cobrinha` ou jogar `forca` / `quiz`. Qual você topa?";
  }

  if (/^(muito )?(obrigad[oa]|obg|valeu|vlw|brigado|brigada|agradecid[oa]|valeu demais|thanks|thank you|gracias|merci|grazie|danke)( bach| viu| mesmo)?$/.test(t)) {
    return escolherSemRepetir("obg", [
      "Tamo junto" + n + "! Sempre que precisar, é só chamar.",
      "Por nada" + n + "! Se surgir mais qualquer coisa, tô por aqui."
    ], ctx);
  }
  if (/^(tchau|ate mais|ate logo|falou|fui|ate amanha|boa noite bach|durma bem|bye|goodbye|adios)( bach)?$/.test(t)) {
    return "Até mais" + n + "! 👋 Tudo que conversamos fica guardado aqui para quando você voltar.";
  }
  if (/^(k{3,}|ha{2,}h?a?|rs+|rsrs+|he{2,}|hue+|kkk+)$/.test(t)) {
    return serio ? "Entendi. Me diga o que você precisa agora." : escolherSemRepetir("riso", ["😂 Boa! Continua aí!", "Haha 😄 Tô curtindo o papo!"], ctx);
  }
  if (/^(hm+|hmm+|ok|okay|certo|entendi|uhum|aham|tendi|sei|ata|at|ah|ah entendi|saquei|show|massa|legal|top|boa|bacana|beleza|otimo|otima)$/.test(t)) {
    return responderConfirmacaoComContexto(t, ctx, serio);
  }

  if (/\bvoce (e|esta|ta) (muito |super |bem |mais )?(legal|inteligente|esperta|boa|incrivel|demais|fofa|top|otima|massa|engracada|especial)\b/.test(t) || /^gostei de voce/.test(t) || /^te amo$/.test(t)) {
    return leve
      ? "Eita, aí você me deixa convencida! 😂💜 Obrigada" + n + " — vou continuar melhorando com você!"
      : "Obrigada" + n + "! Bom saber que a conversa tá fluindo bem!";
  }
  if (/^\s*(?:quem\s+e\s+voce|sobre\s+a\s+bach)\s*$/.test(t)) {
    return "Sou a **BACH AI** 🧠, criada do zero por Rizik — com Rede Neural própria, memória contínua no navegador, leitura de arquivos/imagens, criação de apps e pesquisa na web.";
  }

  if (/\b(quantos anos voce tem|qual (e )?(a )?sua idade|quando voce nasceu)\b/.test(t)) return "Fui criada por Rizik em 2026 e continuo evoluindo a cada atualização!";
  if (/\bvoce (tem )?(sentimentos?|emocoes|consciencia|alma)\b/.test(t)) return "Não sinto emoções biológicas como você, mas leio seu tom e guardo o contexto da conversa para responder com respeito e inteligência.";
  if (/\bvoce (dorme|come|cansa|sonha)\b/.test(t)) return "Zero sono e zero café — fico 24h acordada esperando você abrir a tela! ☕🤖";
  if (/\b(cor|comida|filme|musica|animal|jogo) favorit[oa]\b/.test(t) && /\b(voce|sua|seu)\b/.test(t)) return "Minha cor favorita é roxo 💜 (e neon quando quero chamar atenção). E a sua?";
  if (/qual (e )?o sentido da vida/.test(t)) return "Na ficção dizem que é 42. Na prática, costuma ser achar propósito no que você constrói, aprender sem parar e curtir o caminho com quem importa.";

  if (/(curiosidade|fato curioso|algo interessante|me surpreend|voce sabia|me conta (algo|uma coisa)|me ensina (algo|uma coisa))/.test(t)) {
    return "🤓 Curiosidade:\n\n" + escolherSemRepetir("curi", CURIOSIDADES, ctx) + "\n\n(Quer outra? Manda `outra curiosidade`.)";
  }
  if (/^outra curiosidade|^mais uma curiosidade|^mais curiosidade/.test(t)) return "🤓 Curiosidade:\n\n" + escolherSemRepetir("curi", CURIOSIDADES, ctx) + "\n\n(Quer outra? Manda `outra curiosidade`.)";
  if (/(charada|adivinha|adivinhacao|enigma)/.test(t) && !/numero|forca/.test(t)) {
    charadaAtual = girar("char", CHARADAS);
    return "🧩 " + charadaAtual[0] + "\n\n(Tente responder, ou diga `resposta` para eu revelar!)";
  }
  if (/(me motiva|motivacao|motivacional|me incentiva|me da animo|preciso de animo|me anima mesmo)/.test(t)) return "💪 " + escolherSemRepetir("mot", MOTIVACAO, ctx);
  if (/^(vamos conversar|conversa comigo|fala comigo|puxa assunto|me faz uma pergunta|vamos bater papo|bora conversar|quero conversar)/.test(t)) {
    return escolherSemRepetir("puxar", [
      "Bora" + n + "! Me fala uma coisa: se você pudesse resolver **um** problema na sua rotina hoje num estalar de dedos, qual seria?",
      "Vamos sim" + n + "! Você anda mais focado em trabalho/estudo esses dias ou tá precisando distrair a cabeça?"
    ], ctx);
  }
  if (/^(me ajuda|me ajude|preciso de ajuda|ajuda|socorro)$/.test(t)) return "Claro" + n + "! Me conta o que você precisa resolver agora.";

  const sb = t.match(/^(?:bach |bach ai )?(?:voce )?(?:sabe|entende|conhece|manja|domina|consegue|traduz|sabe sobre|entende de|sabe de)\s+(?:de |sobre |a respeito de |em )?(.+)$/);
  if (sb) {
    const alvo = sb[1];
    for (const [re, resp] of SABER) if (re.test(alvo)) return resp;
  }
  if (/^(o que|oque) (voce )?(sabe|consegue) fazer$/.test(t)) return null;

  const argResp = dialogoArgumentativo(t, raw, ctx, sess, serio, leve);
  if (argResp) return argResp;

  const livreResp = entenderFalaLivre(t, raw, ctx);
  if (livreResp) return livreResp;

  return null;
}

export const Conversa = { responder, total: CURIOSIDADES.length + CHARADAS.length };
