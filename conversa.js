/* BACH AI - CONVERSA 2.0
   Personalidade: cumprimentos por hora do dia (e multi-idioma), empatia, curiosidades,
   charadas, motivação, papo espontâneo, "meus dados" e proteção de dados pessoais. */

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
  "🌿 O Pantanal é considerado a maior planície alagável do mundo.",
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
  "Que assunto você mais curte: ciência, programação, filmes, jogos ou história? 🤔",
  "Quer testar meu conhecimento? Pergunte algo de matemática, geografia ou computação. 🧠",
  "Posso te contar uma curiosidade, uma charada ou uma piada. Qual você prefere? 😄",
  "O que você está construindo ou estudando agora? Me conta que eu ajudo e guardo na memória. 💻",
  "Se você pudesse aprender qualquer habilidade hoje, qual escolheria? ✨"
];

const SABER = [
  [/\b(programacao|programar|codigo|codar|javascript|python|html|css|sql|js)\b/,
   "Sim! 💻 Explico variáveis, funções, loops, arrays, objetos, classes, async, DOM, API, Git, SQL, HTML, CSS e Python, com exemplos. Também leio e explico código colado, aponto bugs comuns e monto apps simples. Experimente: “o que é função?” ou cole um código!"],
  [/\b(matematica|conta|contas|calculo|calcular|algebra|geometria)\b/,
   "Sim! 📐 Faço contas (digite 2+2*5) e explico MMC, frações, equações, Bhaskara, PA/PG, logaritmo, probabilidade, trigonometria e mais. Pergunte, por exemplo: “o que é MMC?” ou “fórmula de Bhaskara”."],
  [/\b(ciencia|ciencias|fisica|quimica|biologia|astronomia)\b/,
   "Sim! 🔬 Tenho uma base com fatos verificados de astronomia, física, química e biologia (planetas, átomo, DNA, fotossíntese, leis de Newton, sistemas do corpo…). O que você quer saber?"],
  [/\b(historia|geografia|historia do brasil)\b/,
   "Sim! 🌍 Conheço datas e fatos da história do Brasil e do mundo, capitais, continentes, rios, biomas e recordes da geografia. Pergunte, por exemplo: “quando foi a Independência do Brasil?” ou “capital da França”."],
  [/\b(portugues|gramatica|redacao|ortografia)\b/,
   "Sim! 📝 Explico crase, acentuação, uso da vírgula, porquês, figuras de linguagem, classes gramaticais e significado/sinônimos de centenas de palavras."],
  [/\b(computacao|tecnologia|informatica|computador|computadores|redes|internet)\b/,
   "Sim! 💻 Explico algoritmos, estruturas de dados, banco de dados, redes, criptografia, segurança, hardware, sistema operacional e inteligência artificial."],
  [/\b(roblox|lua|luau)\b/,
   "Sei o básico de Roblox! 🎮 Os scripts usam a linguagem Luau (parente do Lua) e são feitos no Roblox Studio. Peça: “script de roblox” que eu mostro exemplos prontos."],
  [/\b(jogar|jogo|jogos|brincar)\b/,
   "Sim! 🎮 Jogo forca, jogo da velha, adivinhe o número e quiz. Também posso te dar charadas. É só dizer “jogar forca”, por exemplo."],
  [/\b(piada|piadas|humor)\b/, "Sei sim! 😄 Diga “conta uma piada” (ou “piada de programador”)."],
  [/\b(pesquisar|pesquisa|internet|buscar)\b/,
   "Sim! 🔎 Pesquiso na Wikipédia e na web, comparo as fontes e resumo mostrando de onde veio. Diga “pesquise sobre ...” ou “pesquise a fundo sobre ...”."],
  [/\b(traduzir|traducao|idiomas|linguas|ingles|espanhol|frances|italiano|alemao|japones)\b/,
   "Sim! 🌍 Traduzo palavras e frases em inglês, espanhol, francês, italiano, alemão (inclusive offline) e mais de 15 idiomas online! Experimente: “como se diz obrigado em japonês?” ou “traduz bom dia para inglês”."],
  [/\b(desenhar|desenho|imagem|imagens|foto|fotos)\b/,
   "Leio texto escrito em fotos, mas não desenho nem reconheço objetos, pessoas ou cenas ainda. 🖼️"]
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

  // resposta da charada em andamento
  if (charadaAtual && /^(resposta|qual e|qual a resposta|desisto|nao sei|me diz|diz a resposta|revela)/.test(t)) {
    const r = charadaAtual[1]; charadaAtual = null;
    return "A resposta é: " + r + "\n\nQuer outra charada? Diga “outra charada”.";
  }
  if (charadaAtual && palavras <= 5 && !/^(charada|outra|conta|pesquis|o que|quem|qual)/.test(t)) {
    const certa = norm(charadaAtual[1]).replace(/^(um|uma|o|a)\s/, "").split(" ")[0];
    if (certa && t.includes(certa)) { const r = charadaAtual[1]; charadaAtual = null; return "🎉 Isso mesmo! Era " + r.charAt(0).toLowerCase() + r.slice(1) + "\nQuer outra? Diga “outra charada”."; }
  }

  // segurança: pedido de dados pessoais de terceiros
  if (/\b(passa|passe|manda|mande|me da|me de|descubra|descobre|ache|encontre|busque|busca|pesquise|quero|preciso)\b.*\b(dados|cpf|rg|endereco|telefone|whatsapp|numero|localizacao|onde mora|foto)\b.*\b(de|do|da)\s+(alguem|uma pessoa|um cara|um homem|uma mulher|uma garota|uma menina|um menino|fulano|ciclano|minha ex|meu ex|vizinho|vizinha|desconhecido|desconhecida)\b/.test(t) ||
      /\b(cpf|endereco|telefone|whatsapp) (de|do|da) (alguem|uma pessoa|fulano|minha ex|meu ex)\b/.test(t)) {
    return "Não busco nem repasso dados pessoais de ninguém (CPF, endereço, telefone, localização…): isso protege você e as outras pessoas. 🔒\n\nPosso ajudar com informações públicas (história, ciência), com o que guardo sobre você (“quais são meus dados?”) ou pesquisar um assunto geral.";
  }

  // meus dados
  if (/^(quais (sao )?)?(os )?meus dados$|^(o que )?(voce )?(sabe|guardou|guarda|tem) (sobre|de) mim$|^o que voce sabe de mim$/.test(t)) {
    const extra = [];
    if (ctx.cidade) extra.push("• Cidade: " + ctx.cidade);
    if (ctx.gostos?.length) extra.push("• Gostos: " + ctx.gostos.join(", "));
    if (ctx.projetos?.length) extra.push("• Projetos/estudos: " + ctx.projetos.join(", "));
    return "🗂️ Isto é o que eu guardo sobre você neste aparelho:\n• Nome: " + (ctx.nome || "ainda não sei (diga: meu nome é ...)") +
      (extra.length ? "\n" + extra.join("\n") : "") +
      "\n• Respostas que você me ensinou: " + (ctx.aprendidas ?? 0) + "\n• Notas (lembre:): " + (ctx.notas ?? 0) + "\n• Arquivos guardados: " + (ctx.arquivos ?? 0) +
      "\n• Conversas no histórico: " + (ctx.conversas ?? 0) + "\n\nTudo fica só no seu navegador; nada sai daqui. Para apagar uma resposta: esqueça: pergunta.";
  }

  // crise: acolher com cuidado
  if (/(me matar|suicid|nao quero (mais )?viver|quero morrer|acabar com (tudo|minha vida)|nao aguento mais viver)/.test(t)) {
    return "Sinto muito que você esteja passando por isso. Você não está sozinho(a), e o que você sente importa. 💜\n\nPor favor, fale agora com alguém: no Brasil o CVV atende 24 horas pelo telefone 188 (ligação gratuita) e pelo site cvv.org.br. Se estiver em perigo imediato, ligue 192 (SAMU) ou vá ao pronto-socorro mais próximo. Se tiver alguém de confiança por perto, conte para essa pessoa agora.\n\nEstou aqui com você.";
  }

  // cumprimentos (PT + outros idiomas)
  if (/^(oi+|ola+|eai|e ai|opa|salve|fala|hey|hello|hi|oie|alo|hola|bonjour|ciao|hallo)( bach| bach ai| tudo bem)?$/.test(t)) {
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
  if (/^(to|estou|tou|ando|me sinto) (bem|otimo|otima|feliz|animado|animada|tranquilo|tranquila|de boa)/.test(t) || /^(tudo bem sim|bem sim|de boa)$/.test(t)) {
    return girar("feliz", ["Que bom ouvir isso! 😄 Vamos aproveitar: o que você quer fazer?", "Show! 🙌 Se quiser, te conto uma curiosidade ou a gente resolve algo juntos.", "Fico feliz" + n + "! 💜 Como posso ajudar?"]);
  }
  if (/^(to|estou|tou|me sinto|ando) (muito )?(mal|triste|cansado|cansada|chateado|chateada|ansioso|ansiosa|desanimado|desanimada|estressado|estressada|sem animo|pra baixo)/.test(t)) {
    return girar("triste", [
      "Poxa" + n + ", sinto muito que você esteja assim. 💜 Quer me contar o que aconteceu? Se preferir só distrair a cabeça, posso contar uma curiosidade ou uma piada.",
      "Dias assim acontecem, e tudo bem não estar bem. 🫂 Respira fundo. Se quiser desabafar, estou aqui; se quiser distração, é só pedir. E se isso estiver pesado há muito tempo, vale conversar com alguém de confiança.",
      "Estou com você" + n + ". 💜 Quer conversar sobre isso ou prefere algo leve, como uma charada ou uma curiosidade?"
    ]);
  }
  if (/^(to|estou|tou) com (fome|sono|frio|calor)$/.test(t)) {
    if (/fome/.test(t)) return "Hora de fazer uma pausa e comer algo gostoso! 🍽️ Se quiser, posso procurar uma receita rápida pra você.";
    if (/sono/.test(t)) return "Sinal de que o corpo está pedindo descanso 😴. Se der, tira um cochilo ou vai descansar — eu continuo aqui guardando tudo.";
    if (/frio/.test(t)) return "Pega um agasalho e algo quentinho pra beber! ☕🧥";
    return "Se hidrata bem e procura um lugar mais fresco! 💧";
  }
  if (/(to|estou|tou) (entediado|entediada|sem fazer nada|sem nada pra fazer)|\btedio\b|me entretem|me distrai|\bme diverte\b/.test(t)) {
    return "Bora resolver isso! 🎮 Posso: contar uma piada, soltar uma curiosidade, lançar uma charada ou jogar forca, jogo da velha ou quiz com você. Qual vai ser?";
  }

  // gratidão, despedida, risadas
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
      "Estou por aqui. 😄 Manda sua pergunta, um código ou um assunto para pesquisar.",
      "Quando quiser, é só falar. Posso começar com uma curiosidade? 🧠"
    ]);
  }

  // elogios, comparações e reclamações
  if (/\bvoce (e|esta|ta) (muito |super |bem |mais )?(legal|inteligente|esperta|boa|incrivel|demais|fofa|top|otima|massa|engracada|especial)\b/.test(t) || /^gostei de voce/.test(t) || /^te amo$/.test(t)) {
    return girar("elogio", ["Obrigada! 🥰 Fico feliz que você goste. Vou continuar aprendendo com você!", "Para, que meu processador esquenta! 🥵💜", "Que bom! Isso me motiva a acertar mais. 😄"]);
  }
  if (/\b(chatgpt|claude|gemini)\b/.test(t) && /\b(melhor|pior|igual|parecida|diferenca|compara)\b/.test(t)) {
    return "Eles rodam em servidores gigantes; eu fui criada do zero por você para rodar leve aqui no navegador, aprender o que você ensina, lembrar das suas coisas e pesquisar na web. E se quiser, você ainda pode ligar uma chave Gemini com /chave! 🧠💜";
  }
  if (/\b(burra|idiota|inutil|lixo|horrivel|pessima|nao serve pra nada|so fala besteira)\b/.test(t)) {
    return girar("critica", [
      "Entendi a frustração, e você tem razão de cobrar. 😕 Como estou sendo construída do zero em regras e busca, ainda erro às vezes. Me ensine a resposta certa com: corrija: pergunta => resposta. Eu aprendo na hora.",
      "Poxa, vou melhorar. 💪 Qual pergunta eu errei? Me ensine com: ensine: pergunta => resposta, ou peça: pesquise a fundo sobre o assunto."
    ]);
  }
  if (/\b(isso|essa resposta|sua busca|sua pesquisa|o resultado) (esta|ta|foi|saiu) errad[ao]\b/.test(t) ||
      /\berrad[ao] (a )?(sua busca|sua pesquisa|essa resposta)\b/.test(t) ||
      /\bnada (a |ha )?ver\b/.test(t) || /\bnao (tem|e) (nada )?a ver com (o que|isso)\b/.test(t)) {
    return girar("critica-busca", [
      "Foi mal, errei a busca. 😕 Me diga com outras palavras o que você queria saber, que eu tento de novo.",
      "Entendi que essa não ajudou. Tenta reformular com outras palavras, ou corrija: pergunta => resposta certa. 🔍"
    ]);
  }

  // sobre mim (leve)
  if (/\b(quantos anos voce tem|qual (e )?(a )?sua idade|quando voce nasceu)\b/.test(t)) return "Não tenho idade como uma pessoa: fui criada neste projeto e só evoluo a cada versão (agora na BACH AI 4.0). 😄";
  if (/\bvoce (tem )?(sentimentos?|emocoes|consciencia|alma)\b/.test(t)) return "Não sinto como uma pessoa: sou um programa de regras, memória e busca. Mas fui feita para ser simpática e cuidadosa com você. 💜";
  if (/\bvoce (dorme|come|cansa|sonha)\b/.test(t)) return "Eu não durmo nem como: rodo quando você abre a tela. Se eu sonhasse, acho que seria com bibliotecas cheias de livros e códigos. 📚";
  if (/\b(cor|comida|filme|musica|animal|jogo) favorit[oa]\b/.test(t) && /\b(voce|sua|seu)\b/.test(t)) return "Se eu pudesse escolher, a cor seria roxo 💜 (a cor da minha tela). E você, qual é a sua?";
  if (/qual (e )?o sentido da vida/.test(t)) return "Na ficção científica dizem que é 42. Na prática, costuma ser aprender, criar coisas legais e estar perto de quem importa. ✨";

  // curiosidade, charada, motivação, conversa
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
  if (/^(me ajuda|me ajude|preciso de ajuda|ajuda|socorro)$/.test(t)) return "Claro" + n + "! 🤝 Me diga o que você precisa: aprender um assunto, traduzir algo, resolver um erro de código, pesquisar ou criar um app simples.";

  // "você sabe / entende de X?"
  const sb = t.match(/^(?:bach |bach ai )?(?:voce )?(?:sabe|entende|conhece|manja|domina|consegue|sabe sobre|entende de|sabe de)\s+(?:de |sobre |a respeito de )?(.+)$/);
  if (sb) {
    const alvo = sb[1];
    for (const [re, resp] of SABER) if (re.test(alvo)) return resp;
  }
  if (/^(o que|oque) (voce )?(sabe|consegue) fazer$/.test(t)) return null;
  return null;
}

export const Conversa = { responder, total: CURIOSIDADES.length + CHARADAS.length };
