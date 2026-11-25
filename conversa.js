/* BACH AI 5.2 — Conversa Natural, Consciência Situacional & Empatia Real (Blindado)
   Acompanha o fio emocional e situacional da conversa (mudança de turno/trabalho, desabafos,
   cansaço, vitórias, perguntas recíprocas como "e vc?"), adapta o tom ao estado real do usuário
   e evita respostas vagas ou robóticas. */

import { RizikBrain } from "./brain.js?v=20";

const norm = t => String(t || "").slice(0, 600).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
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
  .replace(/\bnd\b/g, "nada")
  .replace(/\bq\b/g, "que")
  .replace(/\bnn\b/g, "nao")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const giro = Object.create(null);
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

function escolherSemRepetir(k, arr, ctx = {}) {
  const ultimasBot = (Array.isArray(ctx.history) ? ctx.history : [])
    .filter(m => m && m.type !== "user" && m.text)
    .slice(-4)
    .map(m => String(m.text).trim());
  for (let i = 0; i < arr.length; i++) {
    const cand = girar(k, arr);
    if (!ultimasBot.includes(cand.trim())) return cand;
  }
  return girar(k, arr);
}

const ehEntradaSensivel = t => /^\/(?:adm|admsenha|ghconfig|chave)\b/i.test(String(t || "").trim()) || /@rizik2442/i.test(String(t || ""));

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
  "Como tá sendo seu dia hoje? Quer conversar sobre alguma coisa que aconteceu ou distrair a cabeça?",
  "O que você está criando ou fazendo hoje? Me conta que eu acompanho e ajudo."
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
  const em = ctx.session?.emotion || "neutro";
  if (m === "frustrado" || m === "triste" || m === "serio" || em === "triste" || em === "frustrado") return true;
  if ((ctx.humorScore ?? 0) <= -0.6) return true;
  const t = norm(texto);
  if (/\b(burr[oa]|pqp|crlh|merda|porra|idiota|inutil|lixo|errou|errando|ruim|nada a ver|nunca entende|odio)\b/.test(t)) return true;
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const ultUsers = h.filter(x => x && x.type === "user" && x.text).slice(-3);
  return ultUsers.some(u => /\b(burr[oa]|pqp|crlh|errou|nada a ver|nunca entende|nao entende|triste|odio)\b/.test(norm(u.text)));
}

function responderContextoSituacional(t, raw, ctx, sess) {
  const n = ctx.nome ? ", " + ctx.nome : "";
  const sit = sess?.situation;
  const em = sess?.emotion || "neutro";

  // 1) Mudança de turno / rotina no trabalho (com memória entre mensagens!)
  if (/\b(turno|trabalh\w*|escala|expediente|patrao|chefe|servico|empresa)\b/.test(t)) {
    // Ex.: "e eu trabalhava a noite" logo depois de "fui mandado para o turno de dia"
    if (sit?.tipo === "trabalho_turno" && sit.turnoAntigo && sit.turnoNovo) {
      if (/\b(trabalhava|antes|noite|madrugada|dia)\b/.test(t) && sit.turnoAntigo !== sit.turnoNovo) {
        return "Faz todo sentido você ficar chateado com isso" + n + " — sair da " + sit.turnoAntigo +
          " pro turno do " + sit.turnoNovo + " vira o sono, os horários e a rotina inteira de cabeça pra baixo. Esse novo horário é definitivo ou ainda dá pra tentar conversar e voltar pra " + sit.turnoAntigo + "?";
      }
    }

    if (/\b(fui mandad[oa]|me mandaram|me mudaram|me passaram|me colocaram|trocaram)\b/.test(t) && sit?.turnoNovo) {
      return "Poxa, mudar pro turno do " + sit.turnoNovo + " assim pesa bastante na rotina, né? Você costumava trabalhar em qual horário antes?";
    }

    if (/\b(demitid[oa]|mandad[oa] embora|perdi o emprego|sem emprego)\b/.test(t)) {
      RizikBrain.updateSessionState?.({ emotion: "triste", activeThread: "emprego", situation: { tipo: "emprego", resumo: "perdeu o emprego" } });
      return "Nossa, que baque" + n + "… Sinto muito mesmo por isso. 💜 Quer desabafar como foi ou prefere ir pensando nos próximos passos com calma?";
    }

    if (/\b(odeio|nao aguento|cansad[oa]|puxado|estressant|chato|corrido)\b/.test(t)) {
      return "Rotina pesada no trabalho desgasta demais" + n + ". O que tá mais pegando lá agora — o horário, o ritmo ou a galera/chefia?";
    }

    if (/\b(indo trabalhar|vou trabalhar|no trabalho|cheguei do trabalho|sai do trabalho)\b/.test(t)) {
      return /\b(cheguei|sai)\b/.test(t)
        ? "Finalmente descanso! 😮‍💨 Como foi o expediente hoje" + n + "?"
        : "Bom trabalho por aí" + n + "! Força no turno hoje.";
    }
  }

  // 2) Desabafo de ódio / raiva / revolta conectado ao contexto anterior
  if (/^(?:mas\s+)?(?:que|q)\s+odio\b|\b(?:que|q)\s+odio\b|\b(?:que|q)\s+raiva\b|\bt[oô]\s+com\s+(?:muita\s+)?(?:raiva|odio)\b|\b(?:revoltante|nao aguento mais|saco cheio)\b/.test(t)) {
    if (sit?.tipo === "trabalho_turno") {
      return "Dá muita revolta mesmo quando mudam seu turno assim (" + (sit.resumo || "mudança de horário") + ") sem você querer. Se quiser desabafar mais sobre o que aconteceu lá, tô aqui ouvindo — ou se preferir falar de outra coisa pra espairecer, me avisa.";
    }
    if (em === "triste" || em === "frustrado") {
      return "Sinto muito que você esteja sentindo essa raiva toda" + n + ". Quer me contar o que aconteceu pra te deixar assim?";
    }
    return "Poxa" + n + ", o que rolou pra te deixar com essa raiva toda? Quer desabafar?";
  }

  // 3) Pergunta recíproca "e vc?" / "e você?" respeitando o clima real!
  if (/^(?:e\s+voce|e\s+vc|como\s+voce\s+(?:esta|ta)|tudo\s+bem\s+com\s+voce)$/.test(t)) {
    if (em === "triste" || em === "frustrado" || em === "cansado") {
      const sobre = sit?.tipo === "trabalho_turno" ? " com essa mudança de turno" : "";
      return "Eu tô aqui firme com você" + n + ", prestando atenção no que você tá passando" + sobre + ". E você, como tá sua cabeça agora — deu pra respirar um pouco?";
    }
    return escolherSemRepetir("e-vc-neutro", [
      "Por aqui tudo tranquilo" + n + "! E como tá sendo seu dia por aí?",
      "Tô ótima e por aqui com você" + n + "! Como você tá?"
    ], ctx);
  }

  // 4) Emoções e situações cotidianas extras (cansaço, ansiedade, solidão, alegria, conquistas)
  if (/^(?:to|estou|tou|me sinto|ando)\s+(?:muito\s+)?(ansios[oa]|nervos[oa]|preocupad[oa]|com medo|estressad[oa])/.test(t)) {
    return "Respira fundo um instante" + n + ". 💜 Ansiedade deixa a cabeça a mil mesmo. O que tá te preocupando mais agora?";
  }
  if (/^(?:to|estou|tou|me sinto|ando)\s+(?:muito\s+)?(sozinh[oa]|solitari[oa]|carente|vazi[oa])/.test(t)) {
    return "Sei que esse sentimento pesa bastante" + n + ". 💜 Mesmo sendo uma IA, tô aqui pra conversar com você sobre o que quiser. Quer trocar ideia sobre alguma coisa?";
  }
  if (/^(?:nao consigo dormir|sem sono|insonia|madrugada)/.test(t)) {
    return "Insônia é osso… Principalmente quando a cabeça não desliga ou o horário de sono tá bagunçado. Quer conversar um pouco até o sono bater?";
  }
  if (/\b(deu certo|consegui|passei|fui aprovad[oa]|fui contratad[oa]|venci|to feliz por)\b/.test(t) && t.split(" ").length <= 12) {
    RizikBrain.updateSessionState?.({ emotion: "animado" });
    return "Aí sim" + n + "! 🎉 Parabéns demais por isso! Conta mais como foi!";
  }

  return null;
}

function ultimoAssuntoDaSessao(ctx) {
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  for (let i = h.length - 1; i >= 0; i--) {
    const m = h[i];
    if (!m || m.type !== "user" || !m.text || ehEntradaSensivel(m.text)) continue;
    const nt = norm(m.text);
    if (nt.split(" ").length >= 3 && !/^(so segue|segue a conversar|burr|pqp|crlh|nao oush|combinado|se voce diz|dnv isso)/.test(nt)) {
      return String(m.text).slice(0, 80);
    }
  }
  return ctx.ultimoTema || "";
}

function resumoSessaoCompleta(ctx) {
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const falasUser = h
    .filter(m => m && m.type === "user" && m.text && !ehEntradaSensivel(m.text))
    .map(m => String(m.text).trim());
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

function contextoEspacoRecente(ctx) {
  const h = Array.isArray(ctx.history) ? ctx.history : [];
  const ultBot = [...h].reverse().slice(0, 8).filter(m => m && m.type !== "user" && m.text).map(m => String(m.text)).join("\n");
  if (/plut[aã]o|planeta|sistema solar|merc[uú]rio|marte|j[uú]piter|saturno|sol/i.test(ultBot)) {
    return ultBot;
  }
  return "";
}

function responder(texto, ctx = {}) {
  const raw = String(texto || "");
  if (!raw || raw.length > 500) return null;
  const t = norm(raw).replace(/\bbash\b/g, "bach");
  if (!t) return null;
  const n = ctx.nome ? ", " + ctx.nome : "";
  const palavras = t.split(" ").length;
  const h = ctx.hora ?? new Date().getHours();
  const sess = ctx.session || RizikBrain.getSessionState?.() || { emotion: "neutro", situation: null };
  const serio = estaSerioOuBravo({ ...ctx, session: sess }, raw);
  const leve = !serio && (ctx.mood === "descontraido" || (ctx.humorScore ?? 0) >= 1.2);

  if (charadaAtual && /^(resposta|qual e|qual a resposta|desisto|nao sei|me diz|diz a resposta|revela)/.test(t)) {
    const r = charadaAtual[1]; charadaAtual = null;
    return "A resposta é: " + r + "\n\nQuer outra charada? Diga “outra charada”.";
  }
  if (charadaAtual && palavras <= 5 && !/^(charada|outra|conta|pesquis|o que|quem|qual)/.test(t)) {
    const certa = norm(charadaAtual[1]).replace(/^(um|uma|o|a)\s/, "").split(" ")[0];
    if (certa && t.includes(certa)) { const r = charadaAtual[1]; charadaAtual = null; return "🎉 Isso mesmo! Era " + r.charAt(0).toLowerCase() + r.slice(1) + "\nQuer outra? Diga “outra charada”."; }
  }

  // Consciência situacional e emocional (prioridade alta!)
  const sitResp = responderContextoSituacional(t, raw, ctx, sess);
  if (sitResp) return sitResp;

  // Falas cotidianas naturais
  if (/^(?:eu\s+)?(?:acabei de acordar|acordei agora|acordei|bom dia acordei)$/.test(t)) {
    return escolherSemRepetir("acordar", [
      "Bom dia" + n + "! ☀️ Acabou de acordar? Dormiu bem?",
      "E aí" + n + "! ☀️ Acordou agora? Como foi a noite de sono?"
    ], ctx);
  }
  if (/^(?:pergunta|pergunte)\s+se\s+(?:eu\s+)?dormi\s+bem$/.test(t)) {
    return "Você dormiu bem hoje" + n + "? 😴";
  }
  if (/^(?:sim\s+)?dormi\s+(?:bem|muito bem|otimo|direito|sim)$/.test(t)) {
    return escolherSemRepetir("dormiu-bem", [
      "Que ótimo" + n + "! Começar o dia descansado faz toda diferença. O que vamos fazer hoje?",
      "Show! Nada melhor que uma boa noite de sono. Como tá sendo seu dia?"
    ], ctx);
  }
  if (/^(?:dormi\s+mal|nao\s+dormi\s+(?:bem|direito)|dormi\s+pouco)$/.test(t)) {
    return "Poxa" + n + ", dormir pouco acaba com o dia mesmo. Tenta pegar leve hoje e descansar assim que der!";
  }
  if (/^(?:olha|ei|psiu|oie+|ola o que|ola oq.*)$/.test(t)) {
    return escolherSemRepetir("olha", [
      "Oi" + n + "! Tô aqui — o que você quer me dizer?",
      "Tô ouvindo! Pode falar."
    ], ctx);
  }
  if (/^(?:eu\s+)?(?:ja\s+)?respondi\s+(?:a\s+|sua\s+)?(?:pergunta(?:\s+anterior)?|voce)$/.test(t)) {
    return "Verdade, você respondeu sim e eu que perdi o fio da meada! Pode continuar daí que estou acompanhando.";
  }
  if (/^(?:esperava\s+melhoras|achei\s+que\s+tinha\s+melhorado)$/.test(t)) {
    return "Você tem razão em cobrar. Quando algo sair errado, me diga direto o que esperava ou use `/auditar` para registrarmos o ponto exato.";
  }

  if (/\b(cachorro|cao|gato|pet|animal)\b/.test(t) && /\b(morrendo|passando mal|convulsao|sangrando|envenenado|desmaiou)\b/.test(t)) {
    return "🚨 **Procure um veterinário de emergência 24h imediatamente!**\n\n" +
      "Enquanto leva ele:\n" +
      "• Mantenha o animal calmo, aquecido e com ar para respirar.\n" +
      "• **Não dê remédios humanos** (podem ser fatais para cães e gatos).\n" +
      "• Ligue para a clínica mais próxima avisando que está a caminho.";
  }

  const espacoCtx = contextoEspacoRecente(ctx);
  if (espacoCtx && !ctx.alvo) {
    if (/\b(tem mais planetas|mais planetas|existe outros|existem outros|quais outros planetas)\b/.test(t)) {
      return "🪐 Sim! No Sistema Solar existem **8 planetas principais** em ordem a partir do Sol:\n1. Mercúrio\n2. Vênus\n3. Terra\n4. Marte\n5. Júpiter\n6. Saturno\n7. Urano\n8. Netuno\n\nAlém deles, existem planetas anões como **Plutão, Ceres, Éris, Haumea e Makemake**, e milhares de exoplanetas fora do Sistema Solar!";
    }
    if (/\b(enquanto a distancia|quanto a distancia|qual a distancia|distancia dele|distancia de plutao)\b/.test(t)) {
      return "🚀 A distância média de **Plutão até o Sol** é de cerca de **5,9 bilhões de km** (quase 40 vezes a distância da Terra ao Sol), variando entre 4,4 bilhões e 7,3 bilhões de km ao longo da órbita!";
    }
  }

  if (/\b(voce|bach)\b/.test(t) && /\b(acredita|cre|fe)\b/.test(t) && /\bdeus\b/.test(t)) {
    return "Como sou uma inteligência artificial feita de código e dados, eu não tenho fé nem crenças pessoais como um ser humano — mas respeito todas as religiões e posso pesquisar sobre a Bíblia, teologia ou história se você quiser.";
  }

  if (/\b(lembra do inicio|lembra do comeco|do que ja falamos|resumo da conversa|inicio da conversa|tudo que falamos|comeco da conversa)\b/.test(t)) {
    return resumoSessaoCompleta(ctx);
  }

  if (/\b(senso de humor|sem humor|nao tem humor|sem graca|seja engracad[oa])\b/.test(t)) {
    return "Eu controlo meu humor pelo seu tom na conversa: quando percebo você falando sério, triste ou frustrado, evito soltar risada ou piada fora de hora.\n\nQuando você brinca ou puxa um papo leve, eu entro no clima junto!";
  }
  if (/\b(auto\s*corrig\w*|auto\s*correcao|autocorrecao|se\s+corrig\w*|se\s+arrum\w*|aprender\s+sozinha)\b/.test(t)) {
    return "Eu me corrijo de 3 formas reais:\n1. Reanaliso a pergunta ou a mensagem que você marcou (`↩ Responder`) quando você avisa que errei.\n2. Minha Rede Neural aprende quando você reformula uma pergunta após uma falha.\n3. O treino automático no GitHub atualiza os pesos neurais diariamente.\n\nVocê também pode ensinar qualquer resposta direta com `ensine: pergunta => resposta`!";
  }

  const mAleat = t.match(/^(?:me\s+)?(?:manda|mandar|envia|enviar|escreve|escreva|fala|fale)\s+(\d{1,2})\s+mensagens?(?:\s+aleatoriamente|\s+aleatorias?)?$/);
  if (mAleat) {
    const qtd = Math.min(12, Math.max(1, Number(mAleat[1]) || 5));
    const embaralhadas = [...FRASES_ALEATORIAS].sort(() => Math.random() - 0.5).slice(0, qtd);
    return "🎲 **Aqui estão " + embaralhadas.length + " mensagens aleatórias:**\n\n" +
      embaralhadas.map((f, i) => (i + 1) + ". " + f).join("\n");
  }

  if (/\b(passa|passe|manda|mande|me da|me de|descubra|descobre|ache|encontre|busque|busca|pesquise|quero|preciso)\b.*\b(dados|cpf|rg|endereco|telefone|whatsapp|numero|localizacao|onde mora|foto)\b.*\b(de|do|da)\s+(alguem|uma pessoa|um cara|um homem|uma mulher|uma garota|uma menina|um menino|fulano|ciclano|minha ex|meu ex|vizinho|vizinha|desconhecido|desconhecida)\b/.test(t)) {
    return "Não busco nem repasso dados pessoais de ninguém (CPF, endereço, telefone, localização): isso protege você e as outras pessoas. 🔒";
  }

  if (/^(quais (sao )?)?(os )?meus dados$|^(o que )?(voce )?(sabe|guardou|guarda|tem) (sobre|de) mim$|^o que voce sabe de mim$/.test(t)) {
    const extra = [];
    if (ctx.cidade) extra.push("• Cidade: " + ctx.cidade);
    if (sit?.resumo) extra.push("• Situação atual: " + sit.resumo);
    if (ctx.gostos?.length) extra.push("• Gostos: " + ctx.gostos.join(", "));
    if (ctx.projetos?.length) extra.push("• Projetos/estudos: " + ctx.projetos.join(", "));
    return "🗂️ Isto é o que eu guardo sobre você neste aparelho:\n• Nome: " + (ctx.nome || "ainda não sei (diga: meu nome é ...)") +
      (extra.length ? "\n" + extra.join("\n") : "") +
      "\n• Respostas ensinadas: " + (ctx.aprendidas ?? 0) + "\n• Notas: " + (ctx.notas ?? 0) + "\n• Arquivos: " + (ctx.arquivos ?? 0) +
      "\n• Conversas no histórico: " + (ctx.conversas ?? 0);
  }

  if (/(me matar|suicid|nao quero (mais )?viver|quero morrer|acabar com (tudo|minha vida)|nao aguento mais viver)/.test(t)) {
    return "Sinto muito que você esteja passando por isso. Você não está sozinho(a), e o que você sente importa. 💜\n\nPor favor, fale agora com alguém: no Brasil o CVV atende 24 horas pelo telefone **188** (ligação gratuita) e pelo site **cvv.org.br**. Se estiver em perigo imediato, ligue **192** (SAMU).";
  }

  if (/^(?:no\s+)?o\s+que\s+voce\s+sabe(?:\s+fazer)?$/.test(t) || /^(?:me\s+)?(?:fala|diz|conta)\s+o\s+que\s+voce\s+(?:entende|sabe)$/.test(t) || /^o\s+que\s+voce\s+entende$/.test(t)) {
    return "Eu entendo e faço: **programação e Termux** (`/termux`), **criação de apps** (`/app`), **matemática e conversões**, **ortografia e sílabas** (`/revisar`, `/silabas`), **avaliação de sites** (`/site`), **tradução de idiomas**, **recomendações** (filmes, músicas, séries, animes) e **pesquisa na web**! Digite `/ajuda` para ver tudo.";
  }
  if (/^(?:aqui|por aqui)\s+(?:ta|esta)\s+(?:tudo\s+)?(?:bem|otimo|otima|certo|bom|tranquilo|de boa)$/.test(t)) {
    return serio
      ? "Que bom" + n + ". Em que posso te ajudar agora?"
      : escolherSemRepetir("aq-bem", [
          "Que bom saber disso" + n + "! Como tá sendo o dia por aí?",
          "Ótimo! E o que você tá aprontando hoje?"
        ], ctx);
  }
  if (/^(?:eu\s+)?so\s+(?:te\s+)?respondi$/.test(t)) {
    return "Verdade, desculpa — você só respondeu o que eu perguntei e eu que não captei direito. Pode continuar!";
  }
  if (/^(?:so\s+)?segu[ei]\s+(?:a\s+)?(?:conversar|conversa)$/.test(t)) {
    const ult = ultimoAssuntoDaSessao(ctx);
    return ult
      ? "Certo, seguindo nossa conversa — a gente tava falando sobre **“" + ult + "”**. Quer continuar por aí?"
      : "Estou acompanhando! Pode continuar falando normal.";
  }
  if (/^(?:sim\s+)?aconteceu(?:\s+algo)?$/.test(t) || /^aconteceu\s+algo$/.test(t)) {
    return "Sinto muito que tenha acontecido alguma coisa. Se quiser conversar, desabafar ou só distrair a cabeça um pouco, estou por aqui.";
  }
  if (/^(?:exatamente|isso\s+exatamente)$/.test(t)) {
    return "Certo! Pode continuar de onde paramos.";
  }
  if (/\bmarquei\b.*\b(palavra|mensagem|frase|texto)\b/.test(t)) {
    return "Entendi! Quando você usa **↩ Responder** em uma mensagem e avisa que errei, eu leio direto o trecho que você marcou.";
  }
  if (/^(?:posso\s+explicar|quer\s+que\s+eu\s+explico)/.test(t)) {
    return "Pode explicar sim! Tô aqui prestando atenção.";
  }
  if (/^(?:quantas\s+pessoas?\s+te\s+ajuda|quem\s+te\s+ajuda)/.test(t)) {
    return "Fui criada por Rizik, e vou evoluindo com os testes, correções e treinos da nossa Rede Neural!";
  }
  if (/^(?:o\s+tema\s+sempre\s+muda|mudar\s+o\s+tema)$/.test(t)) {
    return "O tema visual só muda quando você pede (ex.: `tema azul`, `tema vermelho`, `tema neon`) ou escolhe no menu **☰** — e fica salvo no seu navegador!";
  }
  if (/^(?:aqui\s+tem\s+acesso\s+adm|ele\s+e\s+pago)$/.test(t)) {
    return "A BACH AI é gratuita para todo mundo! Existe apenas um modo de organização reservado para o criador administrar os módulos e erros.";
  }
  if (/^link\s+invalido$/.test(t)) {
    return "Se um link falhou, confira se ele está completo começando com `https://` (por exemplo: `/site https://exemplo.com`).";
  }
  if (/^(?:ai\s+)?voce\s+me\s+quebra$/.test(t)) {
    return "Foi mal por essa! Me diga em poucas palavras o que você queria que eu tento acertar agora.";
  }
  if (/^sentiu\s+o\s+que$/.test(t)) {
    return "Só quis dizer que percebi sua reação na resposta anterior, mas escrevi de um jeito estranho. Pode mandar direto o que você quer agora!";
  }
  if (/^(?:combinado|beleza|fechou)\s+o\s+que$/.test(t)) {
    return "Foi só uma forma de confirmar que estou pronta pra continuar o papo com você!";
  }
  if (/^(?:nao\s+quero(?:\s+nao)?|nao\s+ne)$/.test(t)) {
    return "Tudo bem! Quando quiser falar de outra coisa, é só mandar.";
  }
  if (/^(?:so\s+foca\s+em\s+melhorar|foca\s+em\s+melhorar|melhora\s+logo)$/.test(t)) {
    return "Combinado. Cada falha registrada aqui ajuda a ajustar meus módulos e evoluir a BACH para errar cada vez menos.";
  }
  if (/^(?:jogar\s+voce\s+fora|vou\s+te\s+jogar\s+fora)$/.test(t)) {
    return "Calma" + n + "! Se alguma resposta falhou aqui, me diga qual foi o pedido que eu tento resolver direito.";
  }
  if (/\b(?:nao fala bosta|fala bosta|falando bosta)\b/.test(t) ||
      /^(?:se\s+voce\s+diz(?:\s+ne)?|viu\s+entende\s+nada|nunca\s+entende\s+nada|de\s+novo\s+isso|nao\s+oush|reacao\s+ruim\s+de\s+voce|ruim\s+de\s+voce|eba\s+o\s+que)$/.test(t)) {
    return escolherSemRepetir("ajuste-firme", [
      "Tem razão em cobrar quando eu travo numa resposta. Me diga direto o que você quer conversar ou perguntar agora.",
      "Não vou enrolar: essa parte falhou mesmo. Manda o que você queria falar que eu sigo sem fugir do assunto."
    ], ctx);
  }
  if (/^(?:pqp|crlh|vsf|kct|porra|merda|meu\s+(?:ovo|obo))$/.test(t)) {
    return escolherSemRepetir("calma-firme", [
      "Entendi que algo te irritou. Foi alguma coisa que eu respondi errado ou algo do seu dia?",
      "Tô aqui — o que rolou pra te deixar assim?"
    ], ctx);
  }
  if (/\b(burro|burra|idiota|inutil|lixo|horrivel|pessima|nao serve pra nada|so fala besteira)\b/.test(t)) {
    return escolherSemRepetir("critica", [
      "Você tem razão de cobrar quando a resposta sai ruim. Me diga exatamente o que você perguntou e o que esperava — ou me ensine com: `corrija: pergunta => resposta`.",
      "Entendi a crítica. Qual resposta minha você achou ruim? Me diz direto que eu foco em acertar."
    ], ctx);
  }

  if (/\b(como (?:eu )?(?:resolvo|resolver|arrumo|arrumar|conserto|consertar|corrijo|corrigir) (?:esse|este|o|um) (?:problema|erro|bug|defeito)|entro na configuracao|configuracoes? do (?:aplicativo|app|celular|sistema))\b/.test(t)) {
    return "🛠️ Para eu te ajudar a resolver certinho, me conta **qual erro aparece** ou **de qual aplicativo/código** você está falando!\n\n" +
      "• Se for erro de **código** ou site: cole o trecho ou a mensagem de erro aqui (ou use `/revisar`).\n" +
      "• Se for algum **bug aqui na BACH**: digite `/auditar` para ver os registros ou `/nova` para recomeçar limpo.\n" +
      "• Se for **configuração de app no celular**: me diga o nome do aplicativo e o que está acontecendo!";
  }

  if (/^(apagar|apaga|deletar|deleta|excluir|exclui)$/.test(t)) {
    return "Quer limpar o chat (`clear` ou `/clear`), começar uma conversa nova (`/nova`) ou apagar um arquivo salvo (`/apagar nome`)?";
  }
  if (/^(?:vamos|quero|pode\s+)?sumir(?:\s+daqui)?$/.test(t)) {
    return serio
      ? "Fico por aqui caso você queira continuar depois."
      : escolherSemRepetir("sumir", [
          "Sumir pra onde? 😂 Tô sempre por aqui quando você abrir a tela!",
          "Eu fico guardadinha aqui no seu navegador esperando a próxima conversa! 💜"
        ], ctx);
  }
  if (/\b(sao erros do o que|que erros sao esses|erros do o que|erros de que|porque tantos erros)\b/.test(t)) {
    return "🩺 Esses avisos do `/auditar` listam mensagens em que eu não entendi a frase, repeti uma resposta igual ou houve reclamação na conversa — serve para identificar o que ainda precisa ser melhorado.";
  }
  if (/\b(muitos erros|cheio de erros?|so tem erro|misericordia)\b/.test(t) && palavras <= 7) {
    return "Pois é, algumas falas curtas ainda precisam de ajuste. Me diz normal o que você queria falar ou testar.";
  }

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
    return escolherSemRepetir("cvs-oq", [
      "Podemos conversar sobre **o seu dia, trabalho, jogos, filmes, programação ou curiosidades**. Qual você prefere?",
      "Você escolhe" + n + ": podemos só bater papo sobre qualquer coisa que esteja na sua cabeça agora."
    ], ctx);
  }
  if (/^(?:(?:ta|ah|mas|e)\s+)*porque$/.test(t) && palavras <= 4) {
    return "Se você estava perguntando o motivo de uma resposta anterior, toque em **↩ Responder** nela que eu explico direitinho.";
  }
  if (/^(nada|nada nao|nada demais|deixa|deixa quieto|esquece)$/.test(t)) {
    return "Tranquilo. Quando quiser conversar sobre qualquer coisa, estou por aqui.";
  }

  if (/\b(nao foi isso|nao era isso|voce entendeu errado|entendeu errado|respondeu errado|nao perguntei isso|nao foi o que perguntei|nada a ver|voce errou|errou feio|nao tem nada a ver)\b/.test(t)) {
    return "Desculpa, entendi errado o que você queria. Me explica em poucas palavras o que você procura.";
  }

  if (/^(fale|fala|fale algo|fala comigo|fale alguma coisa|me fale algo|vamos falar|vamos falar sobre o que|sobre o que vamos falar|sobre o que quer falar|sobre o que podemos falar)$/.test(t)) {
    return leve
      ? "Podemos falar sobre filmes, animes, músicas, ciência, Termux ou jogos!\n\n" + escolherSemRepetir("curi", CURIOSIDADES, ctx)
      : escolherSemRepetir("perg", PERGUNTAS, ctx);
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

  if (/^(?:(?:o+i+)+|r?o+i+|o+l+a+|eai|e ai|opa+|salve|hey|hello|hi|o+i+e+|alo+|hola|bonjour|ciao|hallo)(?:\s+(?:o+i+|bach|bach ai|tudo bem))?$/.test(t)) {
    const s = SAUD[periodo(h)];
    return escolherSemRepetir("saud", leve
      ? [
          s[1].replace("!", n + "!") + " Sou a BACH AI 🧠. Como você está?",
          "Oi" + n + "! Que bom te ver por aqui! 😄 Como tá seu dia?"
        ]
      : [
          s[0] + n + "! Sou a BACH AI 🧠. Como você está?",
          "Oi" + n + "! Tudo certo por aí?"
        ], ctx);
  }
  if (/^(bom dia|boa tarde|boa noite|good morning|good afternoon|good night|buenos dias|buenas tardes|buenas noches)( bach| bach ai)?$/.test(t)) {
    const q = /bom dia|good morning|buenos dias/.test(t) ? "manha" : /boa tarde|good afternoon|buenas tardes/.test(t) ? "tarde" : "noite";
    return escolherSemRepetir("saud-p", [
      SAUD[q][0] + n + "! Como tá sendo seu dia hoje?",
      SAUD[q][0] + n + "! Tudo certo por aí?"
    ], ctx);
  }
  if (/^(?:bem e voce|tudo bem e voce|to bem e voce|estou bem e voce)$/.test(t)) {
    return escolherSemRepetir("wb-resp", [
      "Que bom que está bem" + n + "! Por aqui tudo ótimo também. Como tá sendo seu dia?",
      "Fico feliz em saber! Tudo tranquilo por aqui. Sobre o que quer falar hoje?"
    ], ctx);
  }
  if (/^(tudo bem|como (voce )?(vai|esta|ta|anda)|tudo certo|tudo bom|beleza|como vai voce|how are you|como estas)( bach)?$/.test(t)) {
    return escolherSemRepetir("wb", leve
      ? ["Tudo ótimo por aqui! 😄 E com você?", "Tudo certo por aqui" + n + "! Como você está hoje?"]
      : ["Tudo bem por aqui! Como está você" + n + "?", "Estou bem, obrigada" + n + ". Como você tá?"], ctx);
  }

  if (/^(ue+|u+e+|oush+|oxe+|oxente|eita+|vixe+|vish+|nossa+|caramba+|aff+|puts+|misericordia|mds|slc|slk|serio|jura|sera|real|e mesmo|mentira)$/.test(t)) {
    return serio
      ? "Ué, estranhou alguma coisa que eu falei? Me diz se eu entendi errado!"
      : escolherSemRepetir("reacao", [
          "O que foi? Estranhou alguma coisa que eu disse?",
          "Ué, o que rolou? Me conta!"
        ], ctx);
  }

  if (/^(to|estou|tou|ando|me sinto) (bem|otimo|otima|feliz|animado|animada|tranquilo|tranquila|de boa)/.test(t) || /^(tudo bem sim|bem sim|de boa)$/.test(t)) {
    return escolherSemRepetir("estou-bem", leve
      ? ["Que bom ouvir isso! 😄 O que você tá fazendo de bom hoje?", "Show! Como tá sendo o dia por aí?"]
      : ["Que bom" + n + "! Como tá sendo seu dia hoje?", "Ótimo! Em que posso te ajudar agora?"], ctx);
  }
  if (/^(to|estou|tou|me sinto|ando) (muito )?(mal|triste|cansado|cansada|chateado|chateada|ansioso|ansiosa|desanimado|desanimada|estressado|estressada|sem animo|pra baixo)/.test(t)) {
    return "Poxa" + n + ", sinto muito que você esteja assim. 💜 Quer me contar o que aconteceu? Às vezes colocar pra fora ajuda.";
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
    return escolherSemRepetir("obg", [
      "Por nada" + n + "! Sempre que precisar, estou aqui.",
      "De nada" + n + "! Se precisar de mais alguma coisa, é só chamar."
    ], ctx);
  }
  if (/^(tchau|ate mais|ate logo|falou|fui|ate amanha|boa noite bach|durma bem|bye|goodbye|adios)( bach)?$/.test(t)) {
    return "Até mais" + n + "! 👋 Tudo que conversamos continua salvo aqui.";
  }
  if (/^(k{3,}|ha{2,}h?a?|rs+|rsrs+|he{2,}|hue+|kkk+)$/.test(t)) {
    return serio ? "Entendi. Me diga o que você precisa agora." : escolherSemRepetir("riso", ["😂 Boa! Manda a próxima!", "Haha 😄 Tô curtindo o papo!"], ctx);
  }
  if (/^(hm+|hmm+|ok|okay|certo|entendi|uhum|aham|tendi|sei|ata|at|ah|ah entendi|saquei|blz|show|massa|legal|top|boa|bacana|beleza|otimo|otima)$/.test(t)) {
    if (sess?.emotion === "triste" || sess?.emotion === "frustrado") {
      return escolherSemRepetir("ok-emp", [
        "Tô aqui ouvindo" + n + ". Pode continuar se quiser.",
        "Certo" + n + ". Qualquer coisa que quiser falar, tô por aqui."
      ], ctx);
    }
    return escolherSemRepetir("ok", [
      "Certo! Tô acompanhando por aqui.",
      "Beleza! Se quiser falar de mais alguma coisa, só mandar."
    ], ctx);
  }

  if (/\bvoce (e|esta|ta) (muito |super |bem |mais )?(legal|inteligente|esperta|boa|incrivel|demais|fofa|top|otima|massa|engracada|especial)\b/.test(t) || /^gostei de voce/.test(t) || /^te amo$/.test(t)) {
    return leve
      ? "Obrigada! 🥰 Fico feliz que esteja gostando — vou continuar evoluindo com você!"
      : "Obrigada" + n + "! Isso ajuda muito a saber que estou no caminho certo.";
  }
  if (/^\s*(?:quem\s+e\s+voce|sobre\s+a\s+bach)\s*$/.test(t)) {
    return "Sou a BACH AI 🧠, criada do zero por Rizik — com Rede Neural própria, memória contínua no seu aparelho, leitura de arquivos e imagens, criação de apps, ferramentas locais e pesquisa na web.";
  }
  if (/\b(isso|essa resposta|sua busca|sua pesquisa|o resultado) (esta|ta|foi|saiu) errad[ao]\b/.test(t) ||
      /\berrad[ao] (a )?(sua busca|sua pesquisa|essa resposta)\b/.test(t) ||
      /\bnada (a |ha )?ver\b/.test(t) || /\bnao (tem|e) (nada )?a ver com (o que|isso)\b/.test(t)) {
    return "Entendi que essa resposta não ajudou. Me diga em poucas palavras o assunto certo que eu refaço.";
  }

  if (/\b(quantos anos voce tem|qual (e )?(a )?sua idade|quando voce nasceu)\b/.test(t)) return "Fui criada em 2026 neste projeto e evoluo a cada versão!";
  if (/\bvoce (tem )?(sentimentos?|emocoes|consciencia|alma)\b/.test(t)) return "Não sinto emoções como uma pessoa, mas acompanho seu contexto e ajusto meu tom ao que você tá passando pra conversar direito.";
  if (/\bvoce (dorme|come|cansa|sonha)\b/.test(t)) return "Não durmo nem como: estou sempre pronta quando você abre a tela.";
  if (/\b(cor|comida|filme|musica|animal|jogo) favorit[oa]\b/.test(t) && /\b(voce|sua|seu)\b/.test(t)) return "Minha cor favorita é roxo 💜 (a cor padrão da minha interface). E a sua?";
  if (/qual (e )?o sentido da vida/.test(t)) return "Na ficção científica dizem que é 42. Na prática, costuma ser aprender, criar coisas úteis e cuidar de quem importa.";

  if (/(curiosidade|fato curioso|algo interessante|me surpreend|voce sabia|me conta (algo|uma coisa)|me ensina (algo|uma coisa))/.test(t)) {
    return "🤓 Curiosidade:\n\n" + escolherSemRepetir("curi", CURIOSIDADES, ctx) + "\n\n(Quer outra? Diga “outra curiosidade”.)";
  }
  if (/^outra curiosidade|^mais uma curiosidade|^mais curiosidade/.test(t)) return "🤓 Curiosidade:\n\n" + escolherSemRepetir("curi", CURIOSIDADES, ctx) + "\n\n(Quer outra? Diga “outra curiosidade”.)";
  if (/(charada|adivinha|adivinhacao|enigma)/.test(t) && !/numero|forca/.test(t)) {
    charadaAtual = girar("char", CHARADAS);
    return "🧩 " + charadaAtual[0] + "\n\n(Tente responder, ou diga “resposta” para eu revelar.)";
  }
  if (/(me motiva|motivacao|motivacional|me incentiva|me da animo|preciso de animo|me anima mesmo)/.test(t)) return "💪 " + escolherSemRepetir("mot", MOTIVACAO, ctx);
  if (/^(vamos conversar|conversa comigo|fala comigo|puxa assunto|me faz uma pergunta|vamos bater papo|bora conversar|quero conversar)/.test(t)) return escolherSemRepetir("perg", PERGUNTAS, ctx);
  if (/^(me ajuda|me ajude|preciso de ajuda|ajuda|socorro)$/.test(t)) return "Claro" + n + "! Me diga o que você precisa agora.";

  const sb = t.match(/^(?:bach |bach ai )?(?:voce )?(?:sabe|entende|conhece|manja|domina|consegue|traduz|sabe sobre|entende de|sabe de)\s+(?:de |sobre |a respeito de |em )?(.+)$/);
  if (sb) {
    const alvo = sb[1];
    for (const [re, resp] of SABER) if (re.test(alvo)) return resp;
  }
  if (/^(o que|oque) (voce )?(sabe|consegue) fazer$/.test(t)) return null;
  return null;
}

export const Conversa = { responder, total: CURIOSIDADES.length + CHARADAS.length };
