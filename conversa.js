/* BACH AI 5.0 — Conversa Natural, Humor Adaptativo & Memória da Sessão
   Adapta o tom ao jeito do usuário ao longo da conversa (zero risada fora de hora),
   acompanha do início ao fim do chat e entende respostas cotidianas e reações naturais. */

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/\bqm\b/g, "quem")
  .replace(/\b(vc|vce|vv)\b/g, "voce")
  .replace(/\b(cvs|cv)\b/g, "conversar")
  .replace(/\b(oq|oqe|oque)\b/g, "o que")
  .replace(/\b(pq|pk)\b/g, "porque")
  .replace(/\b(msm)\b/g, "mesmo")
  .replace(/\b(rlx)\b/g, "relaxa")
  .replace(/\b(vdd)\b/g, "verdade")
  .replace(/\b(dnv)\b/g, "de novo")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const giro = {};
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

const CURIOSIDADES = [
  "🐙 O polvo tem três corações e sangue azul (por causa da hemocianina, que leva cobre em vez de ferro).",
  "🪐 Em Vênus, um dia (~243 dias terrestres) dura mais que o ano (~225 dias).",
  "🍌 Bananas são levemente radioativas por causa do potássio-40, mas em nível totalmente inofensivo.",
  "🗼 A Torre Eiffel pode crescer até uns 15 cm no verão porque o ferro se dilata com o calor.",
  "🐜 As formigas existem há mais de 100 milhões de anos, desde a época dos dinossauros.",
  "🔇 No espaço ninguém ouve nada: o som precisa de um meio material para viajar.",
  "👩‍💻 A primeira programadora da história foi Ada Lovelace, em 1843.",
  "🪲 O primeiro 'bug' de computador foi uma mariposa real presa num relé em 1947.",
  "🌐 O primeiro site da web foi publicado por Tim Berners-Lee em 1991.",
  "⚡ Um raio pode chegar a 30.000 °C — cerca de 5 vezes mais quente que a superfície do Sol.",
  "🐬 Golfinhos dormem com metade do cérebro por vez para continuar vindo à tona respirar.",
  "🧬 O DNA de uma única célula humana, esticado, teria cerca de 2 metros.",
  "🦈 Os tubarões existem há mais de 400 milhões de anos, antes mesmo de existirem árvores.",
  "🐍 A linguagem Python tem esse nome por causa do grupo de humor Monty Python, não da cobra.",
  "⌨️ O JavaScript foi criado por Brendan Eich em 1995, em apenas 10 dias.",
  "🌙 A Lua se afasta da Terra cerca de 3,8 cm por ano.",
  "❤️ O coração humano bate em torno de 100 mil vezes por dia.",
  "🐝 O mel quase não estraga: foram encontrados potes comestíveis em tumbas egípcias milenares.",
  "🎮 O jogo Tetris foi criado em 1984 pelo engenheiro russo Alexey Pajitnov.",
  "🌊 A Fossa das Marianas tem quase 11 km de profundidade — mais fundo que a altura do Monte Everest."
];

const CHARADAS = [
  ["O que é, o que é: quanto mais se tira, maior fica?", "Um buraco. 🕳️"],
  ["O que é, o que é: cai em pé e corre deitado?", "A chuva. 🌧️"],
  ["O que é, o que é: tem dentes e barba, mas não é homem nem bicho?", "O alho. 🧄"],
  ["O que é, o que é: quanto mais seca, mais molhada fica?", "A toalha. 🧖"],
  ["O que é, o que é: tem cidades, mas não tem casas; tem rios, mas não tem água?", "O mapa. 🗺️"],
  ["O que é, o que é: sempre vem, mas nunca chega?", "O amanhã. 📅"],
  ["O que é, o que é: pode ser quebrado sem ser tocado?", "Uma promessa. 🤝"],
  ["O que é, o que é: entra na água e não se molha?", "A sombra. 👤"],
  ["O que é, o que é: quanto mais você compartilha, mais você tem?", "O conhecimento. 🧠"],
  ["O que é, o que é: tem chaves, mas não abre nenhuma porta?", "O teclado (ou o piano). ⌨️"]
];
let charadaAtual = null;

const MOTIVACAO = [
  "Um passo pequeno hoje vale mais do que um plano perfeito que nunca sai do papel.",
  "Errar faz parte de aprender. Quem nunca errou na programação ainda não programou o bastante.",
  "Você não precisa fazer tudo hoje; precisa fazer a próxima coisa.",
  "Cada linha de código que você escreve te deixa melhor do que ontem.",
  "Grandes projetos começaram com um arquivo vazio e alguém que não desistiu no primeiro bug."
];

const PERGUNTAS = [
  "Que assunto você prefere agora: ciência, programação, Termux, filmes, música ou jogos?",
  "Quer testar alguma ferramenta, criar um app (`/app`) ou conversar sobre algum tema específico?",
  "O que você está criando ou estudando hoje? Me conta que eu acompanho e ajudo."
];

const FRASES_ALEATORIAS = [
  "🤖 Sabia que eu já gero apps completos e rodo JavaScript em sandbox? Testa `/app pomodoro`!",
  "🐙 Curiosidade rápida: polvos têm três corações e sangue azul.",
  "💡 Dica rápida: faça uma pausa curta e beba água se estiver estudando ou programando há muito tempo.",
  "🎮 Quer um desafio rápido? Diga `jogar forca` ou `/flashcard`.",
  "🌌 A luz do Sol demora cerca de 8 minutos e 20 segundos para chegar até a Terra.",
  "🔐 Precisa de uma senha forte? Diga `/senha 16`.",
  "⚡ O JavaScript foi criado em apenas 10 dias em 1995.",
  "🎨 Você pode trocar toda a minha cor dizendo `tema neon` ou `tema azul`.",
  "🧠 Você pode me ensinar qualquer resposta com `ensine: pergunta => resposta`.",
  "🎵 Quer uma recomendação de música ou filme por gênero? É só pedir.",
  "🌍 Eu traduzo mais de 15 idiomas — até japonês e coreano.",
  "📱 No Termux, `pkg update && pkg upgrade -y` é sempre o primeiro passo antes de instalar pacotes."
];

const MUSICAS_BR = {
  mpb: "🎵 **MPB / Clássicos Brasileiros:**\n1. Tim Maia — Gostava Tanto de Você\n2. Djavan — Oceano\n3. Chico Buarque — Construção\n4. Elis Regina & Tom Jobim — Águas de Março\n5. Marisa Monte — Ainda Bem",
  rock: "🎸 **Rock Nacional:**\n1. Legião Urbana — Tempo Perdido\n2. Charlie Brown Jr. — Dias de Luta, Dias de Glória\n3. Skank — Vou Deixar\n4. Capital Inicial — Primeiros Erros\n5. Os Paralamas do Sucesso — Lanterna dos Afogados",
  rap: "🎤 **Rap / Hip-Hop Brasileiro:**\n1. Racionais MC's — Vida Loka (Parte 1)\n2. Sabotage — Um Bom Lugar\n3. Emicida — AmarElo\n4. Criolo — Não Existe Amor em SP\n5. Djonga — Olho de Tigre",
  sertanejo: "🤠 **Sertanejo / Modão:**\n1. Chitãozinho & Xororó — Evidências\n2. Zezé Di Camargo & Luciano — É o Amor\n3. Jorge & Mateus — Sosseguei\n4. Marília Mendonça — Infiel\n5. Henrique & Juliano — Cuida Bem Dela",
  samba: "🥁 **Samba / Pagode:**\n1. Cartola — As Rosas Não Falam\n2. Jorge Aragão — Coisa de Pele\n3. Exaltasamba — Tá Vendo Aquela Lua\n4. Zeca Pagodinho — Deixa a Vida Me Levar\n5. Raça Negra — Cheia de Manias"
};

const FILMES_LISTA =
  "🎬 **10 filmes muito bem avaliados para assistir:**\n\n" +
  "1. Interestelar (2014) — Ficção / Aventura\n" +
  "2. A Origem (2010) — Ficção / Suspense\n" +
  "3. Parasita (2019) — Drama / Suspense\n" +
  "4. Batman: O Cavaleiro das Trevas (2008) — Ação\n" +
  "5. Um Sonho de Liberdade (1994) — Drama\n" +
  "6. Ilha do Medo (2010) — Mistério\n" +
  "7. À Espera de um Milagre (1999) — Drama\n" +
  "8. Duna: Parte Dois (2024) — Aventura\n" +
  "9. Homem-Aranha no Aranhaverso (2018) — Animação\n" +
  "10. O Auto da Compadecida (2000) — Comédia Brasileira\n\n" +
  "💡 Quer de um gênero específico (terror, comédia, romance, ação)? Só pedir!";

const ANIMES_LISTA =
  "⛩️ **Animes recomendados (por estilo):**\n\n" +
  "⚔️ **Ação:** Fullmetal Alchemist: Brotherhood, Attack on Titan, Jujutsu Kaisen, Demon Slayer\n" +
  "🧠 **Suspense:** Death Note, Steins;Gate, Monster\n" +
  "🌌 **Aventura:** Hunter x Hunter, Frieren, One Piece\n" +
  "😂 **Comédia:** Spy x Family, Kaguya-sama, Mob Psycho 100";

const SABER = [
  [/\b(programacao|programar|codigo|codar|javascript|python|html|css|sql|js|termux|bash)\b/,
   "Sim! 💻 Ensino e gero código em JavaScript, Python, HTML, CSS, SQL, Lua/Roblox e **Termux/Linux**. Também crio apps inteiros (`/app`), rodo scripts JS em sandbox (`/executar`) e reviso código."],
  [/\b(matematica|conta|contas|calculo|calcular|algebra|geometria)\b/,
   "Sim! 📐 Faço contas (ex.: `2+2*5` ou `15% de 200`) e explico equações, Bhaskara, MMC, PA/PG, logaritmos e trigonometria."],
  [/\b(ciencia|ciencias|fisica|quimica|biologia|astronomia)\b/,
   "Sim! 🔬 Respondo sobre astronomia, física, química e biologia. Qual tema você quer?"],
  [/\b(historia|geografia|historia do brasil)\b/,
   "Sim! 🌍 Conheço história do Brasil e mundial, capitais, continentes, rios e biomas."],
  [/\b(portugues|gramatica|redacao|ortografia|silabas)\b/,
   "Sim! 📝 Reviso erros de português (`/revisar`), separo sílabas (`/silabas`) e explico regras gramaticais."],
  [/\b(jogar|jogo|jogos|brincar)\b/,
   "Sim! 🎮 Jogo forca, jogo da velha, adivinhe o número, quiz, charadas e `/simulado`."],
  [/\b(piada|piadas|humor)\b/, "Sei sim! Diga `piada` ou `/humor` que eu lanço uma pergunta pra você tentar adivinhar."],
  [/\b(pesquisar|pesquisa|internet|buscar)\b/, "Sim! 🔎 Pesquiso na Wikipédia e na web comparando fontes."],
  [/\b(traduzir|traducao|idiomas|linguas|ingles|espanhol|frances|italiano|alemao|japones)\b/,
   "Sim! 🌍 Traduzo mais de 15 idiomas. Experimente: `como se diz obrigado em japonês?`."],
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
  if (m === "frustrado" || m === "triste" || m === "serio") return true;
  if ((ctx.humorScore ?? 0) <= -0.6) return true;
  const t = norm(texto);
  if (/\b(burr[oa]|pqp|crlh|merda|porra|idiota|inutil|lixo|errou|errando|ruim|nada a ver|nunca entende)\b/.test(t)) return true;
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const ultUsers = h.filter(x => x && x.type === "user" && x.text).slice(-3);
  return ultUsers.some(u => /\b(burr[oa]|pqp|crlh|errou|nada a ver|nunca entende|nao entende)\b/.test(norm(u.text)));
}

function ultimoAssuntoDaSessao(ctx) {
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  for (let i = h.length - 1; i >= 0; i--) {
    const m = h[i];
    if (!m || m.type !== "user" || !m.text) continue;
    const nt = norm(m.text);
    if (nt.split(" ").length >= 3 && !/^(so segue|segue a conversar|burr|pqp|crlh|nao oush|combinado|se voce diz|dnv isso)/.test(nt)) {
      return String(m.text).slice(0, 80);
    }
  }
  return ctx.ultimoTema || "";
}

function resumoSessaoCompleta(ctx) {
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const falasUser = h.filter(m => m && m.type === "user" && m.text).map(m => String(m.text).trim());
  const assuntos = [];
  for (const f of falasUser) {
    const nt = norm(f);
    if (nt.length < 4 || /^(oi|ola|ok|aham|uhum|pqp|crlh|burr[oa]|oush|ue)$/.test(nt)) continue;
    if (!assuntos.includes(f) && assuntos.length < 12) assuntos.push(f.slice(0, 70));
  }
  if (!assuntos.length) return "Ainda estamos no comecinho desta conversa! Pode mandar o assunto que você quer explorar.";
  return "🧠 **Acompanhando nossa conversa desde o início (" + falasUser.length + " mensagens suas):**\n\n• " +
    assuntos.join("\n• ") +
    "\n\nPode continuar de qualquer um desses pontos!";
}

function responder(texto, ctx = {}) {
  const t = norm(texto).replace(/\bbash\b/g, "bach");
  if (!t) return null;
  const n = ctx.nome ? ", " + ctx.nome : "";
  const palavras = t.split(" ").length;
  const h = ctx.hora ?? new Date().getHours();
  const serio = estaSerioOuBravo(ctx, texto);
  const leve = !serio && (ctx.mood === "descontraido" || (ctx.humorScore ?? 0) >= 1.2);

  // Resposta da charada
  if (charadaAtual && /^(resposta|qual e|qual a resposta|desisto|nao sei|me diz|diz a resposta|revela)/.test(t)) {
    const r = charadaAtual[1]; charadaAtual = null;
    return "A resposta é: " + r + "\n\nQuer outra charada? Diga “outra charada”.";
  }
  if (charadaAtual && palavras <= 5 && !/^(charada|outra|conta|pesquis|o que|quem|qual)/.test(t)) {
    const certa = norm(charadaAtual[1]).replace(/^(um|uma|o|a)\s/, "").split(" ")[0];
    if (certa && t.includes(certa)) { const r = charadaAtual[1]; charadaAtual = null; return "🎉 Isso mesmo! Era " + r.charAt(0).toLowerCase() + r.slice(1) + "\nQuer outra? Diga “outra charada”."; }
  }

  // Lembrar do início ao fim da conversa atual
  if (/\b(lembra do inicio|lembra do comeco|do que ja falamos|resumo da conversa|inicio da conversa|tudo que falamos|comeco da conversa)\b/.test(t)) {
    return resumoSessaoCompleta(ctx);
  }

  // Honestidade sobre senso de humor adaptativo e autocorreção
  if (/\b(senso de humor|sem humor|nao tem humor|sem graca|seja engracad[oa])\b/.test(t)) {
    return "Eu controlo meu humor pelo seu tom na conversa: quando percebo você falando sério ou frustrado, evito soltar risada ou piada fora de hora.\n\nQuando você brinca ou puxa um papo leve, eu entro no clima junto! Se quiser testar uma piada interativa agora, manda `piada`.";
  }
  if (/\b(auto correcao|autocorrecao)\b/.test(t) && /\b(arruma|corrige|funciona|mesmo|realmente|sozinha)\b/.test(t)) {
    return "Na conversa, eu me autocorrijo reanalisando sua pergunta anterior quando você avisa que errei, ajustando meu tom e aprendendo respostas que você me ensinar (`ensine: pergunta => resposta`).\n\nJá alterar os arquivos de código `.js` do meu sistema não acontece sozinho — isso só muda quando o criador atualiza os módulos.";
  }

  // Pedido de N mensagens aleatórias
  const mAleat = t.match(/^(?:me\s+)?(?:manda|mandar|envia|enviar|escreve|escreva|fala|fale)\s+(\d{1,2})\s+mensagens?(?:\s+aleatoriamente|\s+aleatorias?)?$/);
  if (mAleat) {
    const qtd = Math.min(12, Math.max(1, Number(mAleat[1]) || 5));
    const embaralhadas = [...FRASES_ALEATORIAS].sort(() => Math.random() - 0.5).slice(0, qtd);
    return "🎲 **Aqui estão " + embaralhadas.length + " mensagens aleatórias:**\n\n" +
      embaralhadas.map((f, i) => (i + 1) + ". " + f).join("\n");
  }

  // Segurança: dados pessoais de terceiros
  if (/\b(passa|passe|manda|mande|me da|me de|descubra|descobre|ache|encontre|busque|busca|pesquise|quero|preciso)\b.*\b(dados|cpf|rg|endereco|telefone|whatsapp|numero|localizacao|onde mora|foto)\b.*\b(de|do|da)\s+(alguem|uma pessoa|um cara|um homem|uma mulher|uma garota|uma menina|um menino|fulano|ciclano|minha ex|meu ex|vizinho|vizinha|desconhecido|desconhecida)\b/.test(t)) {
    return "Não busco nem repasso dados pessoais de ninguém (CPF, endereço, telefone, localização): isso protege você e as outras pessoas. 🔒";
  }

  // Meus dados
  if (/^(quais (sao )?)?(os )?meus dados$|^(o que )?(voce )?(sabe|guardou|guarda|tem) (sobre|de) mim$|^o que voce sabe de mim$/.test(t)) {
    const extra = [];
    if (ctx.cidade) extra.push("• Cidade: " + ctx.cidade);
    if (ctx.gostos?.length) extra.push("• Gostos: " + ctx.gostos.join(", "));
    if (ctx.projetos?.length) extra.push("• Projetos/estudos: " + ctx.projetos.join(", "));
    return "🗂️ Isto é o que eu guardo sobre você neste aparelho:\n• Nome: " + (ctx.nome || "ainda não sei (diga: meu nome é ...)") +
      (extra.length ? "\n" + extra.join("\n") : "") +
      "\n• Respostas ensinadas: " + (ctx.aprendidas ?? 0) + "\n• Notas: " + (ctx.notas ?? 0) + "\n• Arquivos: " + (ctx.arquivos ?? 0) +
      "\n• Conversas no histórico: " + (ctx.conversas ?? 0);
  }

  // Crise
  if (/(me matar|suicid|nao quero (mais )?viver|quero morrer|acabar com (tudo|minha vida)|nao aguento mais viver)/.test(t)) {
    return "Sinto muito que você esteja passando por isso. Você não está sozinho(a), e o que você sente importa. 💜\n\nPor favor, fale agora com alguém: no Brasil o CVV atende 24 horas pelo telefone **188** (ligação gratuita) e pelo site **cvv.org.br**. Se estiver em perigo imediato, ligue **192** (SAMU).";
  }

  // Respostas diretas às falas comuns da conversa
  if (/^(?:aqui|por aqui)\s+(?:ta|esta)\s+(?:tudo\s+)?(?:bem|otimo|otima|certo|bom|tranquilo|de boa)$/.test(t)) {
    return serio
      ? "Que bom" + n + ". Em que posso te ajudar agora?"
      : girar("aq-bem", [
          "Que bom saber disso" + n + "! Em que posso te ajudar hoje?",
          "Ótimo! Se quiser pesquisar algo, criar um app (`/app`) ou conversar sobre algum tema, é só falar."
        ]);
  }
  if (/^(?:eu\s+)?so\s+(?:te\s+)?respondi$/.test(t)) {
    return "Verdade, desculpa — você só respondeu o que eu perguntei e eu que não captei direito. Pode continuar!";
  }
  if (/^(?:so\s+)?segu[ei]\s+(?:a\s+)?(?:conversar|conversa)$/.test(t)) {
    const ult = ultimoAssuntoDaSessao(ctx);
    return ult
      ? "Certo, seguindo nossa conversa — o último ponto foi sobre **“" + ult + "”**. Quer continuar por aí ou mudar de assunto?"
      : "Estou acompanhando! Pode mandar o assunto que você quer conversar.";
  }
  if (/^(?:me\s+)?(?:fala|diz|conta)\s+o\s+que\s+voce\s+entende$/.test(t) || /^o\s+que\s+voce\s+entende$/.test(t)) {
    return "Eu entendo bem: **programação e Termux**, **criação de apps** (`/app`), **matemática e conversões**, **ortografia e sílabas** (`/revisar`, `/silabas`), **avaliação de sites** (`/site`), **tradução de idiomas**, **recomendações** (filmes, músicas, séries, animes) e **pesquisa na web**! Digite `/ajuda` para ver tudo.";
  }
  if (/^(?:combinado|beleza|fechou)\s+o\s+que$/.test(t)) {
    return "Foi só uma forma de confirmar que estou pronta para o próximo assunto! Me diga direto o que você quer fazer agora.";
  }
  if (/^(?:se\s+voce\s+diz(?:\s+ne)?|viu\s+entende\s+nada|nunca\s+entende\s+nada|de\s+novo\s+isso|nao\s+oush|reacao\s+ruim\s+de\s+voce|ruim\s+de\s+voce|eba\s+o\s+que)$/.test(t)) {
    return girar("ajuste-firme", [
      "Tem razão em cobrar quando eu travo numa resposta. Me diga direto em uma frase o que você quer testar ou perguntar agora.",
      "Não vou enrolar: essa parte falhou mesmo. Manda o comando ou a pergunta direta que eu sigo sem fugir do assunto."
    ]);
  }
  if (/^(?:pqp|crlh|vsf|kct|porra|merda|meu\s+(?:ovo|obo))$/.test(t)) {
    return girar("calma-firme", [
      "Entendi que algo te irritou na resposta. Me diga o que você realmente queria fazer agora que eu foco só nisso.",
      "Sem enrolação: qual era o assunto ou comando que você queria que eu resolvesse?"
    ]);
  }
  if (/\b(burro|burra|idiota|inutil|lixo|horrivel|pessima|nao serve pra nada|so fala besteira)\b/.test(t)) {
    return girar("critica", [
      "Você tem razão de cobrar quando a resposta sai ruim. Me diga exatamente o que você perguntou e o que esperava — ou me ensine com: `corrija: pergunta => resposta`.",
      "Entendi a crítica. Qual pergunta eu errei? Me diga em uma frase direta que eu foco em acertar ela."
    ]);
  }

  // Dúvidas gerais de suporte / problema / configuração do aplicativo
  if (/\b(como (?:eu )?(?:resolvo|resolver|arrumo|arrumar|conserto|consertar|corrijo|corrigir) (?:esse|este|o|um) (?:problema|erro|bug|defeito)|entro na configuracao|configuracoes? do (?:aplicativo|app|celular|sistema))\b/.test(t)) {
    return "🛠️ Para eu te ajudar a resolver certinho, me conta **qual erro aparece** ou **de qual aplicativo/código** você está falando!\n\n" +
      "• Se for erro de **código** ou site: cole o trecho ou a mensagem de erro aqui (ou use `/revisar`).\n" +
      "• Se for algum **bug aqui na BACH**: digite `/auditar` para ver os registros ou `/nova` para recomeçar limpo.\n" +
      "• Se for **configuração de app no celular**: me diga o nome do aplicativo e o que está acontecendo!";
  }

  // Falas curtas: apagar, sumir, erros do quê?, muitos erros
  if (/^(apagar|apaga|deletar|deleta|excluir|exclui)$/.test(t)) {
    return "Quer limpar o chat (`clear` ou `/clear`), começar uma conversa nova (`/nova`) ou apagar um arquivo salvo (`/apagar nome`)?";
  }
  if (/^(?:vamos|quero|pode\s+)?sumir(?:\s+daqui)?$/.test(t)) {
    return serio
      ? "Fico por aqui caso você queira continuar depois."
      : girar("sumir", [
          "Sumir pra onde? 😂 Tô sempre por aqui quando você abrir a tela!",
          "Eu fico guardadinha aqui no seu navegador esperando a próxima conversa! 💜"
        ]);
  }
  if (/\b(sao erros do o que|que erros sao esses|erros do o que|erros de que|porque tantos erros)\b/.test(t)) {
    return "🩺 Esses avisos do `/auditar` listam mensagens em que eu não entendi a frase, repeti uma resposta igual ou houve reclamação na conversa — serve para identificar o que ainda precisa ser melhorado.";
  }
  if (/\b(muitos erros|cheio de erros?|so tem erro|misericordia)\b/.test(t) && palavras <= 7) {
    return "Pois é, algumas falas curtas ainda precisam de ajuste. Me diga direto o que você queria testar (ex.: `/ajuda`, `/app pomodoro`, ou uma pergunta direta).";
  }

  // Críticas de humor / melhorias
  if (/\b(humor ruim|piada ruim|piada bosta|piada sem graca)\b/.test(t)) {
    return "Beleza, vou manter o tom mais direto por aqui então. Qual assunto você quer agora?";
  }
  if (/^(melhore|melhora|melhora isso|pode melhorar|evolua|evolui)$/.test(t)) {
    return "Combinado. Se alguma resposta saiu ruim, me diga o que você esperava ou me ensine com: `ensine: pergunta => resposta`.";
  }
  if (/\b(quer que eu te melhore|posso te melhorar|vou te melhorar|como te melhorar|suas expressoes)\b/.test(t)) {
    return "Com certeza" + n + "! Você pode me ensinar respostas novas com `ensine: pergunta => resposta` ou mandar os relatórios do `/auditar`.";
  }
  if (/^(?:quer|vamos|bora)\s+conversar\s+sobre\s+o\s+que$/.test(t) || /^(?:sobre\s+o\s+que\s+(?:voce\s+)?quer\s+conversar)$/.test(t)) {
    return girar("cvs-oq", [
      "Podemos conversar sobre **jogos, filmes, programação, Termux, ciência ou curiosidades**. Qual você prefere?",
      "Você escolhe" + n + ": podemos conversar, testar um app (`/app`), jogar (`forca` / `velha`) ou fazer um `/simulado`."
    ]);
  }
  if (/^(?:(?:ta|ah|mas|e)\s+)*porque$/.test(t) && palavras <= 4) {
    return "Se você estava perguntando o motivo de uma resposta anterior, toque em **↩ Responder** nela que eu explico direitinho.";
  }
  if (/^(nada|nada nao|nada demais|deixa|deixa quieto|esquece)$/.test(t)) {
    return "Tranquilo. Quando quiser perguntar ou testar algo, estou por aqui.";
  }

  // Feedback de erro genérico
  if (/\b(nao foi isso|nao era isso|voce entendeu errado|entendeu errado|respondeu errado|nao perguntei isso|nao foi o que perguntei|nada a ver|voce errou|errou feio|nao tem nada a ver)\b/.test(t)) {
    return "Desculpa, entendi errado o que você queria. Me explica em poucas palavras o que você procura.";
  }

  // "Fale" / "Vamos falar sobre o quê?"
  if (/^(fale|fala|fale algo|fala comigo|fale alguma coisa|me fale algo|vamos falar|vamos falar sobre o que|sobre o que vamos falar|sobre o que quer falar|sobre o que podemos falar)$/.test(t)) {
    return leve
      ? "Podemos falar sobre filmes, animes, músicas, ciência, Termux ou jogos!\n\n" + girar("curi", CURIOSIDADES)
      : girar("perg", PERGUNTAS);
  }

  // Recomendações diretas
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

  // Cumprimentos (inclusive OiOi)
  if (/^(?:(?:o+i+)+|r?o+i+|o+l+a+|eai|e ai|opa+|salve|hey|hello|hi|o+i+e+|alo+|hola|bonjour|ciao|hallo)(?:\s+(?:o+i+|bach|bach ai|tudo bem))?$/.test(t)) {
    const s = SAUD[periodo(h)];
    return leve
      ? girar("saud", [
          s[1].replace("!", n + "!") + " Sou a BACH AI 🧠. Como você está?",
          "Oi" + n + "! Que bom te ver por aqui! 😄 Em que posso ajudar?"
        ])
      : s[0] + n + "! Sou a BACH AI 🧠. Como você está?";
  }
  if (/^(bom dia|boa tarde|boa noite|good morning|good afternoon|good night|buenos dias|buenas tardes|buenas noches)( bach| bach ai)?$/.test(t)) {
    const q = /bom dia|good morning|buenos dias/.test(t) ? "manha" : /boa tarde|good afternoon|buenas tardes/.test(t) ? "tarde" : "noite";
    return SAUD[q][0] + n + "! Em que posso ajudar hoje?";
  }
  if (/^(tudo bem|como (voce )?(vai|esta|ta|anda)|tudo certo|tudo bom|beleza|como vai voce|e voce|bem e voce|tudo bem e voce|how are you|como estas)( bach)?$/.test(t)) {
    return leve
      ? "Tudo ótimo por aqui! 😄 E com você?"
      : "Tudo bem por aqui! Como está você" + n + "?";
  }

  if (/^(ue+|u+e+|oush+|oxe+|oxente|eita+|vixe+|vish+|nossa+|caramba+|aff+|puts+|misericordia|mds|slc|slk|serio|jura|sera|real|e mesmo|mentira)$/.test(t)) {
    return serio
      ? "Percebi que algo não ficou claro. Me diga o que você esperava dessa resposta que eu ajusto."
      : girar("reacao", [
          "O que foi? Se algo saiu estranho ou quiser perguntar outra coisa, manda aí.",
          "Quer que eu explique melhor ou tente de outro jeito?"
        ]);
  }

  if (/^(to|estou|tou|ando|me sinto) (bem|otimo|otima|feliz|animado|animada|tranquilo|tranquila|de boa)/.test(t) || /^(tudo bem sim|bem sim|de boa)$/.test(t)) {
    return leve
      ? "Que bom ouvir isso! 😄 O que você quer fazer agora?"
      : "Que bom! Em que posso te ajudar agora?";
  }
  if (/^(to|estou|tou|me sinto|ando) (muito )?(mal|triste|cansado|cansada|chateado|chateada|ansioso|ansiosa|desanimado|desanimada|estressado|estressada|sem animo|pra baixo)/.test(t)) {
    return "Poxa" + n + ", sinto muito que você esteja assim. 💜 Se quiser conversar ou distrair a cabeça, estou aqui.";
  }
  if (/^(to|estou|tou) com (fome|sono|frio|calor)$/.test(t)) {
    if (/fome/.test(t)) return "Hora de fazer uma pausa e comer algo! 🍽️";
    if (/sono/.test(t)) return "Sinal de que o corpo está pedindo descanso. Se der, tira um cochilo — eu fico aqui guardando tudo.";
    if (/frio/.test(t)) return "Pega um agasalho e algo quentinho para beber. ☕";
    return "Se hidrata bem e procura um lugar mais fresco. 💧";
  }
  if (/(to|estou|tou) (entediado|entediada|sem fazer nada|sem nada pra fazer)|\btedio\b|me entretem|me distrai|\bme diverte\b/.test(t)) {
    return "Bora distrair a cabeça: posso lançar uma `piada` interativa, contar uma curiosidade, mandar uma charada ou jogar forca, velha ou quiz. Qual prefere?";
  }

  if (/^(muito )?(obrigad[oa]|obg|valeu|vlw|brigado|brigada|agradecid[oa]|valeu demais|thanks|thank you|gracias|merci|grazie|danke)( bach| viu| mesmo)?$/.test(t)) {
    return "Por nada" + n + "! Sempre que precisar, estou aqui.";
  }
  if (/^(tchau|ate mais|ate logo|falou|fui|ate amanha|boa noite bach|durma bem|bye|goodbye|adios)( bach)?$/.test(t)) {
    return "Até mais" + n + "! 👋 Tudo que você me ensinou continua salvo.";
  }
  if (/^(k{3,}|ha{2,}h?a?|rs+|rsrs+|he{2,}|hue+|kkk+)$/.test(t)) {
    return serio ? "Entendi. Me diga o que você precisa agora." : girar("riso", ["😂 Boa! Manda a próxima!", "Haha 😄 Tô curtindo o papo!"]);
  }
  if (/^(hm+|hmm+|ok|okay|certo|entendi|uhum|ahan|aham|tendi|sei|ata|ah|ah entendi|saquei|blz|show|massa|legal|top|boa|bacana|beleza|otimo|otima)$/.test(t)) {
    return girar("ok", [
      "Certo! Pode mandar a próxima pergunta, comando ou assunto.",
      "Beleza. Estou acompanhando — o que você quer fazer agora?"
    ]);
  }

  if (/\bvoce (e|esta|ta) (muito |super |bem |mais )?(legal|inteligente|esperta|boa|incrivel|demais|fofa|top|otima|massa|engracada|especial)\b/.test(t) || /^gostei de voce/.test(t) || /^te amo$/.test(t)) {
    return leve
      ? "Obrigada! 🥰 Fico feliz que esteja gostando — vou continuar evoluindo com você!"
      : "Obrigada" + n + "! Isso ajuda muito a saber que estou no caminho certo.";
  }
  if (/\b(chatgpt|claude|gemini)\b/.test(t) && /\b(melhor|pior|igual|parecida|diferenca|compara)\b/.test(t)) {
    return "Sou a BACH AI 🧠, criada especialmente por Rizik — com memória contínua no seu aparelho, leitura de arquivos e imagens, criação de apps, ferramentas locais e pesquisa na web.";
  }
  if (/\b(isso|essa resposta|sua busca|sua pesquisa|o resultado) (esta|ta|foi|saiu) errad[ao]\b/.test(t) ||
      /\berrad[ao] (a )?(sua busca|sua pesquisa|essa resposta)\b/.test(t) ||
      /\bnada (a |ha )?ver\b/.test(t) || /\bnao (tem|e) (nada )?a ver com (o que|isso)\b/.test(t)) {
    return "Entendi que essa resposta não ajudou. Me diga em poucas palavras o assunto certo que eu refaço.";
  }

  if (/\b(quantos anos voce tem|qual (e )?(a )?sua idade|quando voce nasceu)\b/.test(t)) return "Não tenho idade como uma pessoa: fui criada neste projeto e evoluo a cada versão.";
  if (/\bvoce (tem )?(sentimentos?|emocoes|consciencia|alma)\b/.test(t)) return "Não sinto emoções como uma pessoa, mas ajusto meu tom ao seu jeito de conversar para ser útil e agradável.";
  if (/\bvoce (dorme|come|cansa|sonha)\b/.test(t)) return "Não durmo nem como: estou sempre pronta quando você abre a tela.";
  if (/\b(cor|comida|filme|musica|animal|jogo) favorit[oa]\b/.test(t) && /\b(voce|sua|seu)\b/.test(t)) return "Minha cor favorita é roxo 💜 (a cor padrão da minha interface). E a sua?";
  if (/qual (e )?o sentido da vida/.test(t)) return "Na ficção científica dizem que é 42. Na prática, costuma ser aprender, criar coisas úteis e cuidar de quem importa.";

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
  if (/^(me ajuda|me ajude|preciso de ajuda|ajuda|socorro)$/.test(t)) return "Claro" + n + "! Me diga o que você precisa: criar um app (`/app`), rodar script (`/executar`), aprender Termux, traduzir algo, analisar foto ou pesquisar.";

  const sb = t.match(/^(?:bach |bach ai )?(?:voce )?(?:sabe|fala|falar|entende|conhece|manja|domina|consegue|traduz|sabe sobre|entende de|sabe de)\s+(?:de |sobre |a respeito de |em )?(.+)$/);
  if (sb) {
    const alvo = sb[1];
    for (const [re, resp] of SABER) if (re.test(alvo)) return resp;
  }
  if (/^(o que|oque) (voce )?(sabe|consegue) fazer$/.test(t)) return null;
  return null;
}

export const Conversa = { responder, total: CURIOSIDADES.length + CHARADAS.length };
