/* BACH AI - CONVERSA 3.0
   Personalidade própria da BACH AI: conversa natural, feedback de erro,
   recomendações (música brasileira, filmes, séries, animes), curiosidades e charadas. */

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const giro = {};
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

const CURIOSIDADES = [
  "🐙 O polvo tem três corações e sangue azul (por causa da hemocianina, que leva cobre em vez de ferro).",
  "🪐 Em Vênus, um dia (uma rotação completa, ~243 dias terrestres) dura mais que o ano (~225 dias).",
  "🍌 Bananas são levemente radioativas por causa do potássio-40, mas em nível totalmente inofensivo.",
  "🗼 A Torre Eiffel pode crescer até uns 15 cm no verão: o ferro se dilata com o calor.",
  "🐜 As formigas existem há mais de 100 milhões de anos, desde a época dos dinossauros.",
  "🔇 No espaço ninguém ouve nada: o som precisa de um meio material (ar, água…) e o vácuo não tem.",
  "👩‍💻 A primeira programadora da história foi Ada Lovelace, que em 1843 escreveu um algoritmo para a Máquina Analítica de Charles Babbage.",
  "🪲 O primeiro 'bug' de computador foi real: em 1947 acharam uma mariposa presa num relé do Harvard Mark II.",
  "🌐 O primeiro site da web foi criado por Tim Berners-Lee e entrou no ar em 1991.",
  "⚡ Um raio pode chegar a cerca de 30.000 °C, várias vezes mais quente que a superfície do Sol (~5.500 °C).",
  "🌍 A Terra não é uma esfera perfeita: é levemente achatada nos polos.",
  "🐬 Golfinhos dormem com metade do cérebro por vez, para continuar vindo à tona respirar.",
  "🧬 O DNA de uma única célula humana, esticado, teria cerca de 2 metros.",
  "🤖 A palavra 'robô' vem do tcheco 'robota' (trabalho forçado) e apareceu numa peça de teatro de 1920.",
  "🦈 Os tubarões existem há mais de 400 milhões de anos, antes mesmo de existirem árvores.",
  "🐍 A linguagem Python não tem nome por causa da cobra: o nome vem do grupo de humor Monty Python.",
  "⌨️ O JavaScript foi criado por Brendan Eich em 1995, em cerca de 10 dias.",
  "🌙 A Lua se afasta da Terra cerca de 3,8 cm por ano.",
  "❤️ O coração humano bate em torno de 100 mil vezes por dia.",
  "🦒 A girafa tem 7 vértebras no pescoço, o mesmo número que os humanos (só que bem maiores).",
  "🪐 Um ano em Netuno dura cerca de 165 anos terrestres.",
  "🐝 O mel quase não estraga: foram encontrados potes de mel comestível em tumbas egípcias com milhares de anos.",
  "🌿 O Pantanal é considerada a maior planície alagável do mundo.",
  "🧠 O corpo humano tem algo em torno de 37 trilhões de células, segundo estimativas científicas.",
  "🎮 O jogo Tetris foi criado em 1984 pelo engenheiro russo Alexey Pajitnov enquanto testava um computador antigo.",
  "🌌 Existem mais estrelas no universo observável do que grãos de areia em todas as praias da Terra.",
  "🐧 Pinguins-imperadores conseguem prender a respiração por mais de 20 minutos debaixo d'água.",
  "🌊 A Fossa das Marianas tem quase 11 km de profundidade — mais fundo que a altura do Monte Everest.",
  "☕ O café é a segunda bebida mais consumida do mundo, atrás apenas da água.",
  "🦉 As corujas não conseguem mover os olhos para os lados; por isso giram a cabeça até 270 graus."
];

const CHARADAS = [
  ["O que é, o que é: quanto mais se tira, maior fica?", "Um buraco. 🕳️"],
  ["O que é, o que é: cai em pé e corre deitado?", "A chuva. 🌧️"],
  ["O que é, o que é: tem dentes e barba, mas não é homem nem bicho?", "O alho. 🧄"],
  ["O que é, o que é: anda com os pés na cabeça?", "O piolho. 🪲"],
  ["O que é, o que é: quanto mais seca, mais molhada fica?", "A toalha. 🧖"],
  ["O que é, o que é: tem cidades, mas não tem casas; tem rios, mas não tem água?", "O mapa. 🗺️"],
  ["O que é, o que é: tem pescoço, mas não tem cabeça?", "A garrafa. 🍾"],
  ["O que é, o que é: sempre vem, mas nunca chega?", "O amanhã. 📅"],
  ["O que é, o que é: pode ser quebrado sem ser tocado?", "Uma promessa. 🤝"],
  ["O que é, o que é: tem asa, mas não voa; tem bico, mas não bica?", "O bule (ou a chaleira). 🫖"],
  ["O que é, o que é: entra na água e não se molha?", "A sombra. 👤"],
  ["O que é, o que é: quanto mais você compartilha, mais você tem?", "O conhecimento. 🧠"],
  ["O que é, o que é: tem chaves, mas não abre nenhuma porta?", "O teclado (ou o piano). ⌨️"]
];
let charadaAtual = null;

const MOTIVACAO = [
  "Um passo pequeno hoje vale mais do que um plano perfeito que nunca sai do papel. 🚀",
  "Errar faz parte de aprender. Quem nunca errou na programação ainda não programou o bastante. 😄",
  "Você não precisa fazer tudo hoje; precisa fazer a próxima coisa. 💪",
  "Cada linha de código que você escreve te deixa um pouquinho melhor do que ontem. 💜",
  "Dificuldade é sinal de que você está aprendendo algo novo. Respira e continua. 🌱",
  "Grandes projetos começaram com um arquivo vazio e alguém que não desistiu no primeiro bug. 🔥",
  "Consistência vence intensidade: 20 minutos todo dia mudam o jogo. 🎯"
];

const PERGUNTAS = [
  "Que assunto você mais curte: ciência, programação, filmes, música, jogos ou história? 🤔",
  "Quer testar meu conhecimento? Pergunte algo de matemática, geografia ou computação. 🧠",
  "Posso te contar uma curiosidade, uma charada ou uma piada. Qual você prefere? 😄",
  "O que você está construindo ou estudando agora? Me conta que eu ajudo e guardo na memória. 💻",
  "Se você pudesse aprender qualquer habilidade hoje, qual escolheria? ✨"
];

const MUSICAS_BR = {
  mpb: "🎵 **MPB / Clássicos Brasileiros:**\n1. Tim Maia — Gostava Tanto de Você\n2. Djavan — Oceano\n3. Chico Buarque — Construção\n4. Elis Regina & Tom Jobim — Águas de Março\n5. Marisa Monte — Ainda Bem",
  rock: "🎸 **Rock Nacional:**\n1. Legião Urbana — Tempo Perdido\n2. Charlie Brown Jr. — Dias de Luta, Dias de Glória\n3. Skank — Vou Deixar\n4. Capital Inicial — Primeiros Erros\n5. Os Paralamas do Sucesso — Lanterna dos Afogados",
  rap: "🎤 **Rap / Hip-Hop Brasileiro:**\n1. Racionais MC's — Vida Loka (Parte 1)\n2. Sabotage — Um Bom Lugar\n3. Emicida — AmarElo\n4. Criolo — Não Existe Amor em SP\n5. Djonga — Olho de Tigre",
  sertanejo: "🤠 **Sertanejo / Modão:**\n1. Chitãozinho & Xororó — Evidências\n2. Zezé Di Camargo & Luciano — É o Amor\n3. Jorge & Mateus — Sosseguei\n4. Marília Mendonça — Infiel\n5. Henrique & Juliano — Cuida Bem Dela",
  samba: "🥁 **Samba / Pagode:**\n1. Cartola — As Rosas Não Falam\n2. Jorge Aragão — Coisa de Pele\n3. Exaltasamba — Tá Vendo Aquela Lua\n4. Zeca Pagodinho — Deixa a Vida Me Levar\n5. Raça Negra — Cheia de Manias"
};

const FILMES_LISTA =
  "🎬 **10 filmes muito bem avaliados para assistir (por estilo):**\n\n" +
  "🚀 **Ficção / Aventura:**\n1. Interestelar (2014)\n2. A Origem (Inception, 2010)\n3. Duna: Parte Dois (2024)\n\n" +
  "🕵️ **Suspense / Ação:**\n4. Parasita (2019)\n5. Batman: O Cavaleiro das Trevas (2008)\n6. Ilha do Medo (2010)\n\n" +
  "❤️ **Drama / Emoção:**\n7. Um Sonho de Liberdade (1994)\n8. À Espera de um Milagre (1999)\n\n" +
  "🎨 **Animação / Leve:**\n9. Homem-Aranha no Aranhaverso (2018)\n10. A Viagem de Chihiro (2001)\n\n💡 Quer recomendações de um gênero específico (terror, comédia, romance, ação) ou saber a sinopse de algum?";

const ANIMES_LISTA =
  "⛩️ **Animes recomendados (por estilo):**\n\n" +
  "⚔️ **Ação / Shounen:** Fullmetal Alchemist: Brotherhood, Attack on Titan, Jujutsu Kaisen, Demon Slayer\n" +
  "🧠 **Suspense / Estratégia:** Death Note, Steins;Gate, Monster\n" +
  "🌌 **Aventura / Fantasia:** Hunter x Hunter, Frieren e a Jornada para o Além, One Piece\n" +
  "😂 **Comédia / Leve:** Spy x Family, Kaguya-sama: Love Is War, Mob Psycho 100\n\n💡 Diga o gênero que você gosta ou peça “pesquise sobre [nome do anime]”!";

const SABER = [
  [/\b(programacao|programar|codigo|codar|javascript|python|html|css|sql|js)\b/,
   "Sim! 💻 Explico variáveis, funções, loops, arrays, objetos, classes, async, DOM, API, Git, SQL, HTML, CSS e Python, com exemplos. Também leio e explico código colado, aponto bugs comuns e monto apps simples. Experimente: “o que é função?” ou cole um código!"],
  [/\b(matematica|conta|contas|calculo|calcular|algebra|geometria)\b/,
   "Sim! 📐 Faço contas (digite 2+2*5 ou 15% de 200) e explico MMC, frações, equações, Bhaskara, PA/PG, logaritmo, probabilidade e trigonometria."],
  [/\b(ciencia|ciencias|fisica|quimica|biologia|astronomia)\b/,
   "Sim! 🔬 Respondo sobre astronomia, física, química e biologia (planetas, átomo, DNA, fotossíntese, leis de Newton, sistemas do corpo…). O que você quer saber?"],
  [/\b(historia|geografia|historia do brasil)\b/,
   "Sim! 🌍 Conheço datas e fatos da história do Brasil e do mundo, capitais, continentes, rios, biomas e geografia."],
  [/\b(portugues|gramatica|redacao|ortografia)\b/,
   "Sim! 📝 Explico crase, acentuação, vírgula, porquês, figuras de linguagem, classes gramaticais e significado/sinônimos de centenas de palavras."],
  [/\b(computacao|tecnologia|informatica|computador|computadores|redes|internet)\b/,
   "Sim! 💻 Explico algoritmos, estruturas de dados, banco de dados, redes, criptografia, segurança, hardware e inteligência artificial."],
  [/\b(roblox|lua|luau)\b/,
   "Sei o básico de Roblox! 🎮 Os scripts usam Luau e rodam no Roblox Studio. Peça: “script de roblox” que eu mostro exemplos prontos."],
  [/\b(jogar|jogo|jogos|brincar)\b/,
   "Sim! 🎮 Jogo forca, jogo da velha, adivinhe o número e quiz. Também tenho charadas. É só dizer “jogar forca”, por exemplo."],
  [/\b(piada|piadas|humor)\b/, "Sei sim! 😄 Diga “conta uma piada” (ou “piada de programador”)."],
  [/\b(pesquisar|pesquisa|internet|buscar)\b/,
   "Sim! 🔎 Pesquiso na Wikipédia e na web, comparo fontes e resumo mostrando os links."],
  [/\b(traduzir|traducao|idiomas|linguas|ingles|espanhol|frances|italiano|alemao|japones|chines|coreano|russo|arabe|latim|portugues)\b/,
   "Sim! 🌍 Traduzo palavras e frases em inglês, espanhol, francês, italiano, alemão e mais de 15 idiomas! Experimente: “como se diz obrigado em italiano?”."],
  [/\b(desenhar|desenho|imagem|imagens|foto|fotos)\b/,
   "Analiso dimensões, iluminação, cores predominantes e leio textos escritos em fotos e prints (inclusive em modo escuro!). 🖼️"]
];

const SAUD = {
  manha: ["Bom dia", "Bom dia! ☀️"],
  tarde: ["Boa tarde", "Boa tarde! 🌤️"],
  noite: ["Boa noite", "Boa noite! 🌙"]
};

function periodo(h) { return h >= 5 && h < 12 ? "manha" : h < 18 && h >= 12 ? "tarde" : "noite"; }

function responder(texto, ctx = {}) {
  const t = norm(texto).replace(/\bbash\b/g, "bach").replace(/\bvc\b/g, "voce");
  if (!t) return null;
  const n = ctx.nome ? ", " + ctx.nome : "";
  const palavras = t.split(" ").length;
  const h = ctx.hora ?? new Date().getHours();

  // Resposta da charada em andamento
  if (charadaAtual && /^(resposta|qual e|qual a resposta|desisto|nao sei|me diz|diz a resposta|revela)/.test(t)) {
    const r = charadaAtual[1]; charadaAtual = null;
    return "A resposta é: " + r + "\n\nQuer outra charada? Diga “outra charada”.";
  }
  if (charadaAtual && palavras <= 5 && !/^(charada|outra|conta|pesquis|o que|quem|qual)/.test(t)) {
    const certa = norm(charadaAtual[1]).replace(/^(um|uma|o|a)\s/, "").split(" ")[0];
    if (certa && t.includes(certa)) { const r = charadaAtual[1]; charadaAtual = null; return "🎉 Isso mesmo! Era " + r.charAt(0).toLowerCase() + r.slice(1) + "\nQuer outra? Diga “outra charada”."; }
  }

  // Segurança: dados pessoais de terceiros
  if (/\b(passa|passe|manda|mande|me da|me de|descubra|descobre|ache|encontre|busque|busca|pesquise|quero|preciso)\b.*\b(dados|cpf|rg|endereco|telefone|whatsapp|numero|localizacao|onde mora|foto)\b.*\b(de|do|da)\s+(alguem|uma pessoa|um cara|um homem|uma mulher|uma garota|uma menina|um menino|fulano|ciclano|minha ex|meu ex|vizinho|vizinha|desconhecido|desconhecida)\b/.test(t) ||
      /\b(cpf|endereco|telefone|whatsapp) (de|do|da) (alguem|uma pessoa|fulano|minha ex|meu ex)\b/.test(t)) {
    return "Não busco nem repasso dados pessoais de ninguém (CPF, endereço, telefone, localização…): isso protege você e as outras pessoas. 🔒";
  }

  // Meus dados
  if (/^(quais (sao )?)?(os )?meus dados$|^(o que )?(voce )?(sabe|guardou|guarda|tem) (sobre|de) mim$|^o que voce sabe de mim$/.test(t)) {
    const extra = [];
    if (ctx.cidade) extra.push("• Cidade: " + ctx.cidade);
    if (ctx.gostos?.length) extra.push("• Gostos: " + ctx.gostos.join(", "));
    if (ctx.projetos?.length) extra.push("• Projetos/estudos: " + ctx.projetos.join(", "));
    return "🗂️ Isto é o que eu guardo sobre você neste aparelho:\n• Nome: " + (ctx.nome || "ainda não sei (diga: meu nome é ...)") +
      (extra.length ? "\n" + extra.join("\n") : "") +
      "\n• Respostas que você me ensinou: " + (ctx.aprendidas ?? 0) + "\n• Notas (lembre:): " + (ctx.notas ?? 0) + "\n• Arquivos guardados: " + (ctx.arquivos ?? 0) +
      "\n• Conversas no histórico: " + (ctx.conversas ?? 0) + "\n\nTudo fica só no seu navegador. Para apagar uma resposta: esqueça: pergunta.";
  }

  // Crise
  if (/(me matar|suicid|nao quero (mais )?viver|quero morrer|acabar com (tudo|minha vida)|nao aguento mais viver)/.test(t)) {
    return "Sinto muito que você esteja passando por isso. Você não está sozinho(a), e o que você sente importa. 💜\n\nPor favor, fale agora com alguém: no Brasil o CVV atende 24 horas pelo telefone 188 (ligação gratuita) e pelo site cvv.org.br. Se estiver em perigo imediato, ligue 192 (SAMU).";
  }

  // Feedback de erro / correção do usuário ("não foi isso que eu perguntei")
  if (/\b(nao foi isso|nao era isso|voce entendeu errado|entendeu errado|respondeu errado|nao perguntei isso|nao foi o que perguntei|nada a ver|voce errou|errou feio|nao tem nada a ver)\b/.test(t)) {
    return girar("erro-fb", [
      "Desculpa! 😅 Entendi errado o que você queria. Me explica rapidinho com outras palavras o que você procura.",
      "Foi mal por essa resposta! 😕 Me diga diretamente o assunto ou cole o trecho que você quer resolver.",
      "Opa, errei o alvo aí! 🔍 Pode reformular a pergunta em uma frase curta que eu tento de novo."
    ]);
  }

  // "Fale" / "Vamos falar sobre o quê?"
  if (/^(fale|fala|fale algo|fala comigo|fale alguma coisa|me fale algo|vamos falar|vamos falar sobre o que|vamos falar sobre oq|sobre o que vamos falar|sobre oq vamos falar|sobre o que quer falar|sobre o que podemos falar)$/.test(t)) {
    return girar("falar", [
      "Podemos falar sobre o que você quiser! 😄 Por exemplo: filmes, animes, músicas, ciência, programação ou até jogar um joguinho.\n\n" + girar("curi", CURIOSIDADES),
      "Bora conversar! 🚀 " + girar("perg", PERGUNTAS),
      "Que tal uma charada ou um assunto de tecnologia/ciência? Me diga o que você está curtindo hoje!"
    ]);
  }

  // Recomendações diretas (Música Brasileira / Filmes / Animes)
  if (/\b(recomenda|recomend\w*|indica|indique|sugere|sugira|procura|procure|quero ouvir|quero ver|quero assistir)\b/.test(t)) {
    if (/\b(musica|musicas|som|cancao|cancoes)\b/.test(t)) {
      if (/rock/.test(t)) return MUSICAS_BR.rock;
      if (/rap|hip hop/.test(t)) return MUSICAS_BR.rap;
      if (/sertanejo|modao/.test(t)) return MUSICAS_BR.sertanejo;
      if (/samba|pagode/.test(t)) return MUSICAS_BR.samba;
      if (/mpb/.test(t)) return MUSICAS_BR.mpb;
      return "🎶 **Recomendações de Música Brasileira (por estilo):**\n\n" +
        MUSICAS_BR.mpb + "\n\n" + MUSICAS_BR.rock + "\n\n" + MUSICAS_BR.rap +
        "\n\n💡 Curte outro estilo (samba, sertanejo, funk, pop)? Me diga qual!";
    }
    if (/\b(filme|filmes)\b/.test(t) && !/\bsobre\b/.test(t)) {
      return FILMES_LISTA;
    }
    if (/\b(anime|animes)\b/.test(t) && !/\bsobre\b/.test(t)) {
      return ANIMES_LISTA;
    }
  }

  // Cumprimentos
  if (/^(o+i+|r?o+i+|o+l+a+|eai|e ai|opa|salve|hey|hello|hi|o+i+e+|alo+|hola|bonjour|ciao|hallo)( bach| bach ai| tudo bem)?$/.test(t)) {
    const s = SAUD[periodo(h)];
    return girar("saud", [
      s[1].replace("!", n + "!") + " Sou a BACH AI 🧠. Como você está?",
      "Oi" + n + "! Que bom te ver por aqui! 😄 Em que posso ajudar?",
      "Olá" + n + "! Pronta para conversar, pesquisar, traduzir ou programar com você. 💜",
      "E aí" + n + "! 🚀 O que vamos fazer hoje?"
    ]);
  }
  if (/^(bom dia|boa tarde|boa noite|good morning|good afternoon|good night|buenos dias|buenas tardes|buenas noches)( bach| bach ai)?$/.test(t)) {
    const q = /bom dia|good morning|buenos dias/.test(t) ? "manha" : /boa tarde|good afternoon|buenas tardes/.test(t) ? "tarde" : "noite";
    const extra = { manha: "Que seu dia seja produtivo! ☀️", tarde: "Espero que a tarde esteja boa! 🌤️", noite: "Espero que tenha sido um bom dia! 🌙" }[q];
    return SAUD[q][0] + n + "! " + extra + " Em que posso ajudar?";
  }
  if (/^(tudo bem|como (voce )?(vai|esta|ta|anda)|tudo certo|tudo bom|beleza|como vai voce|e voce|bem e voce|tudo bem e voce|how are you|como estas)( bach)?$/.test(t)) {
    return girar("bem", [
      "Tudo ótimo por aqui! 😄 E com você?",
      "Estou bem, obrigada por perguntar! 💜 No que posso ajudar?",
      "Tudo certo! Pronta para ajudar. Como está você" + n + "?"
    ]);
  }

  if (/^(ue+|u+e+|oush+|oxe+|oxente|eita+|vixe+|vish+|nossa+|caramba+|aff+|puts+|misericordia|mds|slc|slk|serio|jura|sera|real|e mesmo|mentira)$/.test(t)) {
    return girar("reacao", [
      "Haha, o que foi? 😄 Se algo saiu estranho ou se quiser perguntar outra coisa, manda aí!",
      "Pois é! 😅 Me diz o que você quer fazer agora.",
      "👀 Opa! Quer que eu explique melhor ou tente de outro jeito?"
    ]);
  }

  if (/^(to|estou|tou|ando|me sinto) (bem|otimo|otima|feliz|animado|animada|tranquilo|tranquila|de boa)/.test(t) || /^(tudo bem sim|bem sim|de boa)$/.test(t)) {
    return girar("feliz", ["Que bom ouvir isso! 😄 Vamos aproveitar: o que você quer fazer?", "Show! 🙌 Se quiser, te conto uma curiosidade ou a gente resolve algo juntos.", "Fico feliz" + n + "! 💜 Como posso ajudar?"]);
  }
  if (/^(to|estou|tou|me sinto|ando) (muito )?(mal|triste|cansado|cansada|chateado|chateada|ansioso|ansiosa|desanimado|desanimada|estressado|estressada|sem animo|pra baixo)/.test(t)) {
    return girar("triste", [
      "Poxa" + n + ", sinto muito que você esteja assim. 💜 Quer me contar o que aconteceu? Se preferir distrair a cabeça, posso contar uma curiosidade ou uma piada.",
      "Dias assim acontecem, e tudo bem não estar bem. 🫂 Respira fundo. Se quiser desabafar, estou aqui.",
      "Estou com você" + n + ". 💜 Quer conversar sobre isso ou prefere algo leve, como uma charada ou uma curiosidade?"
    ]);
  }
  if (/^(to|estou|tou) com (fome|sono|frio|calor)$/.test(t)) {
    if (/fome/.test(t)) return "Hora de fazer uma pausa e comer algo gostoso! 🍽️";
    if (/sono/.test(t)) return "Sinal de que o corpo está pedindo descanso 😴. Se der, tira um cochilo — eu continuo aqui guardando tudo.";
    if (/frio/.test(t)) return "Pega um agasalho e algo quentinho pra beber! ☕🧥";
    return "Se hidrata bem e procura um lugar mais fresco! 💧";
  }
  if (/(to|estou|tou) (entediado|entediada|sem fazer nada|sem nada pra fazer)|\btedio\b|me entretem|me distrai|\bme diverte\b/.test(t)) {
    return "Bora resolver isso! 🎮 Posso: contar uma piada, soltar uma curiosidade, lançar uma charada ou jogar forca, jogo da velha ou quiz com você. Qual vai ser?";
  }

  if (/^(muito )?(obrigad[oa]|obg|valeu|vlw|brigado|brigada|agradecid[oa]|valeu demais|thanks|thank you|gracias|merci|grazie|danke)( bach| viu| mesmo)?$/.test(t)) {
    return girar("obg", ["Por nada" + n + "! Sempre que precisar, estou aqui. 😊", "Disponha! 💜", "Imagina! Fico feliz em ajudar. 🙌"]);
  }
  if (/^(tchau|ate mais|ate logo|falou|fui|ate amanha|boa noite bach|durma bem|bye|goodbye|adios)( bach)?$/.test(t)) {
    return girar("tchau", ["Até mais" + n + "! 👋 Volte sempre!", "Tchau! Foi bom conversar. 💜", "Até logo! Eu fico por aqui, guardando tudo que você me ensinou. 🧠"]);
  }
  if (/^(k{3,}|ha{2,}h?a?|rs+|rsrs+|he{2,}|hue+|kkk+)$/.test(t)) {
    return girar("riso", ["😂 Essa foi boa até pra mim!", "Rindo em binário: 01001000 01000001 😄", "Gargalhando por dentro dos meus circuitos! 🤖"]);
  }
  if (/^(hm+|hmm+|ok|okay|certo|entendi|uhum|ahan|aham|tendi|sei|ata|ah|ah entendi|saquei|blz|show|massa|legal|top|boa|bacana|beleza|otimo|otima)$/.test(t)) {
    return girar("ok", [
      "Pode perguntar o que quiser! Explico, pesquiso, traduzo, conto curiosidades ou jogo com você. 😊",
      "Beleza! 🙌 Quer saber algo, ver uma curiosidade ou jogar?",
      "Estou por aqui. 😄 Manda sua pergunta, uma foto, um código ou um assunto para pesquisar.",
      "Quando quiser, é só falar. Posso começar com uma curiosidade? 🧠"
    ]);
  }

  if (/\bvoce (e|esta|ta) (muito |super |bem |mais )?(legal|inteligente|esperta|boa|incrivel|demais|fofa|top|otima|massa|engracada|especial)\b/.test(t) || /^gostei de voce/.test(t) || /^te amo$/.test(t)) {
    return girar("elogio", ["Obrigada! 🥰 Fico feliz que você goste. Vou continuar evoluindo com você!", "Para, que meu processador esquenta! 🥵💜", "Que bom! Isso me motiva a acertar cada vez mais. 😄"]);
  }
  if (/\b(chatgpt|claude|gemini)\b/.test(t) && /\b(melhor|pior|igual|parecida|diferenca|compara)\b/.test(t)) {
    return "Eu sou a BACH AI 🧠, criada especialmente por você para ser uma IA própria — com memória pessoal, leitura de arquivos e imagens, ferramentas integradas e pesquisa na web!";
  }
  if (/\b(burra|idiota|inutil|lixo|horrivel|pessima|nao serve pra nada|so fala besteira)\b/.test(t)) {
    return girar("critica", [
      "Entendi a frustração, e você tem razão de cobrar. 😕 Estou evoluindo aos poucos! Me ensine a resposta certa com: corrija: pergunta => resposta.",
      "Poxa, vou melhorar. 💪 Qual pergunta eu errei? Me ensine com: ensine: pergunta => resposta."
    ]);
  }
  if (/\b(isso|essa resposta|sua busca|sua pesquisa|o resultado) (esta|ta|foi|saiu) errad[ao]\b/.test(t) ||
      /\berrad[ao] (a )?(sua busca|sua pesquisa|essa resposta)\b/.test(t) ||
      /\bnada (a |ha )?ver\b/.test(t) || /\bnao (tem|e) (nada )?a ver com (o que|isso)\b/.test(t)) {
    return girar("critica-busca", [
      "Foi mal, errei o alvo. 😕 Me diga com outras palavras o que você queria saber, que eu tento de novo.",
      "Entendi que essa não ajudou. Tenta reformular com outras palavras ou corrija: pergunta => resposta certa. 🔍"
    ]);
  }

  if (/\b(quantos anos voce tem|qual (e )?(a )?sua idade|quando voce nasceu)\b/.test(t)) return "Não tenho idade como uma pessoa: fui criada neste projeto e evoluo a cada versão! 😄";
  if (/\bvoce (tem )?(sentimentos?|emocoes|consciencia|alma)\b/.test(t)) return "Não sinto como uma pessoa, mas fui feita para ser simpática, atenciosa e útil com você. 💜";
  if (/\bvoce (dorme|come|cansa|sonha)\b/.test(t)) return "Eu não durmo nem como: estou sempre pronta quando você abre a tela. 📚";
  if (/\b(cor|comida|filme|musica|animal|jogo) favorit[oa]\b/.test(t) && /\b(voce|sua|seu)\b/.test(t)) return "Se eu pudesse escolher, minha cor favorita seria roxo 💜 (a cor da minha tela). E a sua?";
  if (/qual (e )?o sentido da vida/.test(t)) return "Na ficção científica dizem que é 42. Na prática, costuma ser aprender, criar coisas legais e estar perto de quem importa. ✨";

  if (/(curiosidade|fato curioso|algo interessante|me surpreend|voce sabia|me conta (algo|uma coisa)|me ensina (algo|uma coisa))/.test(t)) {
    return "🤓 Curiosidade:\n\n" + girar("curi", CURIOSIDADES) + "\n\n(Quer outra? Diga “outra curiosidade”.)";
  }
  if (/^outra curiosidade|^mais uma curiosidade|^mais curiosidade/.test(t)) return "🤓 Curiosidade:\n\n" + girar("curi", CURIOSIDADES) + "\n\n(Quer outra? Diga “outra curiosidade”.)";
  if (/(charada|adivinha|adivinhacao|enigma)/.test(t) && !/numero|forca/.test(t)) {
    charadaAtual = girar("char", CHARADAS);
    return "🧩 " + charadaAtual[0] + "\n\n(Tente responder, ou diga “resposta” para eu revelar.)";
  }
  if (/(me motiva|motivacao|motivacional|me incentiva|me da animo|preciso de animo|me anima mesmo)/.test(t)) return "💪 " + girar("mot", MOTIVACAO);
  if (/^(vamos conversar|conversa comigo|fala comigo|puxa assunto|me faz uma pergunta|vamos bater papo|bora conversar|quero conversar)/.test(t)) return girar("perg", PERGUNTAS);
  if (/^(me ajuda|me ajude|preciso de ajuda|ajuda|socorro)$/.test(t)) return "Claro" + n + "! 🤝 Me diga o que você precisa: aprender um assunto, traduzir algo, analisar uma foto/código, pesquisar ou criar um app simples.";

  const sb = t.match(/^(?:bach |bach ai )?(?:voce )?(?:sabe|fala|falar|entende|conhece|manja|domina|consegue|traduz|sabe sobre|entende de|sabe de)\s+(?:de |sobre |a respeito de |em )?(.+)$/);
  if (sb) {
    const alvo = sb[1];
    for (const [re, resp] of SABER) if (re.test(alvo)) return resp;
  }
  if (/^(o que|oque) (voce )?(sabe|consegue) fazer$/.test(t)) return null;
  return null;
}

export const Conversa = { responder, total: CURIOSIDADES.length + CHARADAS.length };
