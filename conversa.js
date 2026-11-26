/* BACH AI 5.5 — Conversa Inteligente, Articulada & Empática (Estilo Claude)
 * - Alinhado com brain.js?v=21.
 * - Tom calmo, direto e natural: sem repetição robótica do nome do usuário nem bordões prontos.
 * - Reconhece gírias/abreviações (obgd, vlws, blza), desabafos ("triste", "fui mandado embora") e debates abertos.
 */

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
  .replace(/\b(blz|blza)\b/g, "beleza")
  .replace(/\b(obgd|obgda|obg)\b/g, "obrigado")
  .replace(/\b(vlw|vlws)\b/g, "valeu")
  .replace(/\bmelho\b/g, "melhor")
  .replace(/\bmuinto\b/g, "muito")
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
  "🐙 O polvo tem três corações e sangue azul: dois bombeiam para as guelras e o terceiro para o corpo — e esse terceiro para de bater enquanto ele nada.",
  "🪐 Em Vênus, um dia (~243 dias terrestres) dura mais do que o próprio ano (~225 dias).",
  "🗼 A Torre Eiffel pode crescer até cerca de 15 cm no verão por causa da dilatação térmica do ferro.",
  "🔇 No espaço o som não se propaga porque não há meio material para vibrar — explosões sonoras em filmes são licença poética.",
  "👩‍💻 Ada Lovelace escreveu o primeiro algoritmo pensado para máquina em 1843, quase um século antes dos computadores eletrônicos.",
  "🪲 Um dos primeiros 'bugs' documentados na computação foi literalmente uma mariposa presa em um relé do Mark II, em 1947.",
  "🐍 Python não recebeu esse nome por causa da cobra: Guido van Rossum homenageou o grupo de comédia britânico Monty Python.",
  "⌨️ O JavaScript foi criado por Brendan Eich em 1995 em apenas 10 dias.",
  "🌙 A Lua se afasta da Terra cerca de 3,8 cm por ano — aproximadamente a velocidade em que crescem as unhas."
];

const CHARADAS = [
  ["O que é, o que é: quanto mais se tira, maior fica?", "Um buraco."],
  ["O que é, o que é: cai em pé e corre deitado?", "A chuva."],
  ["O que é, o que é: quanto mais seca, mais molhada fica?", "A toalha."],
  ["O que é, o que é: tem cidades, mas não tem casas; tem rios, mas não tem água?", "O mapa."],
  ["O que é, o que é: sempre vem, mas nunca chega?", "O amanhã."],
  ["O que é, o que é: quanto mais você divide com alguém, mais você tem?", "O conhecimento."],
  ["O que é, o que é: tem várias chaves, mas não abre nenhuma porta?", "O teclado (ou piano)."]
];
let charadaAtual = null;

const MOTIVACAO = [
  "Disciplina conta justamente nos dias em que não há empolgação. Um passo pequeno bem feito hoje vale mais do que um plano perfeito parado.",
  "Errar durante a construção não é sinal de incapacidade — é retorno direto do que ajustar na próxima tentativa.",
  "Quando tudo parecer grande demais, isole só a próxima ação executável e resolva ela primeiro."
];

const FRASES_ALEATORIAS = [
  "Posso criar apps web completos e abrir o preview aqui mesmo — tente `/app pomodoro`.",
  "Regra prática de foco: se uma tarefa leva menos de dois minutos, resolver na hora evita acúmulo mental.",
  "A luz do Sol leva cerca de 8 minutos e 20 segundos para chegar até a Terra.",
  "Você pode ensinar respostas ou atalhos novos usando `ensine: pergunta => resposta`.",
  "No Termux, manter `pkg update && pkg upgrade -y` evita a maioria dos conflitos de pacotes."
];

const MUSICAS_BR = {
  mpb: "🎵 **MPB / Clássicos Brasileiros:**\n1. Tim Maia — Gostava Tanto de Você\n2. Djavan — Oceano\n3. Chico Buarque — Construção\n4. Elis Regina & Tom Jobim — Águas de Março\n5. Marisa Monte — Ainda Bem",
  rock: "🎸 **Rock Nacional:**\n1. Legião Urbana — Tempo Perdido\n2. Charlie Brown Jr. — Dias de Luta, Dias de Glória\n3. Skank — Vou Deixar\n4. Capital Inicial — Primeiros Erros",
  rap: "🎤 **Rap / Hip-Hop Brasileiro:**\n1. Racionais MC's — Vida Loka (Parte 1)\n2. Sabotage — Um Bom Lugar\n3. Emicida — AmarElo\n4. Djonga — Olho de Tigre",
  sertanejo: "🤠 **Sertanejo:**\n1. Chitãozinho & Xororó — Evidências\n2. Marília Mendonça — Infiel / Leão\n3. Jorge & Mateus — Sosseguei\n4. Henrique & Juliano — Cuida Bem Dela",
  samba: "🥁 **Samba / Pagode:**\n1. Cartola — As Rosas Não Falam\n2. Jorge Aragão — Coisa de Pele\n3. Zeca Pagodinho — Deixa a Vida Me Levar\n4. Raça Negra — Cheia de Manias"
};

const FILMES_LISTA =
  "🎬 **10 filmes muito bem avaliados:**\n\n" +
  "1. Interestelar (2014) — Ficção científica\n" +
  "2. A Origem (2010) — Suspense / Ficção\n" +
  "3. Parasita (2019) — Drama / Suspense\n" +
  "4. Batman: O Cavaleiro das Trevas (2008) — Ação\n" +
  "5. Um Sonho de Liberdade (1994) — Drama\n" +
  "6. Ilha do Medo (2010) — Mistério\n" +
  "7. À Espera de um Milagre (1999) — Drama\n" +
  "8. Duna: Parte Dois (2024) — Ficção / Aventura\n" +
  "9. Homem-Aranha no Aranhaverso (2018) — Animação\n" +
  "10. O Auto da Compadecida (2000) — Comédia Brasileira\n\n" +
  "💡 Se quiser lançamentos recentes (2025/2026) ou um gênero específico, peça `filmes recentes` ou `filmes de terror`.";

const ANIMES_LISTA =
  "⛩️ **Animes bem avaliados para começar:**\n\n" +
  "• **Ação / História fechada:** Fullmetal Alchemist: Brotherhood, Attack on Titan, Jujutsu Kaisen\n" +
  "• **Suspense psicológico:** Death Note, Steins;Gate, Monster\n" +
  "• **Aventura:** Hunter x Hunter, Frieren, One Piece\n" +
  "• **Comédia:** Spy x Family, Mob Psycho 100";

const SABER = [
  [/\b(programacao|programar|codigo|codar|javascript|python|html|css|sql|js|termux|bash)\b/,
   "Sim — trabalho com JavaScript, Python, HTML, CSS, SQL, Lua e Termux/Linux. Também crio apps (`/app`), executo JS em sandbox (`/executar`) e audito código (`/revisar`)."],
  [/\b(matematica|conta|contas|calculo|calcular|algebra|geometria)\b/,
   "Sim — resolvo cálculos diretos (`2+2*5`, `15% de 200`) e explico porcentagem, equações, juros e geometria."],
  [/\b(ciencia|ciencias|fisica|quimica|biologia|astronomia)\b/,
   "Sim — respondo sobre física, química, biologia e astronomia com explicação direta."],
  [/\b(historia|geografia|historia do brasil)\b/,
   "Sim — cubro história geral e do Brasil, geografia, capitais e geopolítica básica."],
  [/\b(portugues|gramatica|redacao|ortografia|silabas)\b/,
   "Sim — reviso ortografia (`/revisar`), separo sílabas (`/silabas`) e ajudo a estruturar redações."],
  [/\b(jogar|jogo|jogos|brincar)\b/,
   "Sim — tenho forca, jogo da velha, adivinhe o número, quiz, charadas e `/simulado`."],
  [/\b(piada|piadas|humor)\b/, "Tenho um modo de piadas interativas com `/humor` ou `piada`."],
  [/\b(pesquisar|pesquisa|internet|buscar)\b/, "Sim — consulto Wikipédia e web comparando fontes sempre que você pede ou faz uma pergunta factual."],
  [/\b(traduzir|traducao|idiomas|linguas|ingles|espanhol|frances|italiano|alemao|japones)\b/,
   "Sim — traduzo mais de 15 idiomas. Ex.: `como se diz obrigado em japonês?`."],
  [/\b(desenhar|desenho|imagem|imagens|foto|fotos)\b/,
   "Analiso dimensões, iluminação, cores predominantes e leio textos em imagens/prints via OCR."]
];

const SAUD = {
  manha: ["Bom dia!", "Bom dia — tudo bem por aí?"],
  tarde: ["Boa tarde!", "Boa tarde — como estão as coisas?"],
  noite: ["Boa noite!", "Boa noite — tudo tranquilo?"]
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
  const ultUsers = h.filter(x => x && x.type === "user" && x.text).slice(-2);
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
    if (/^(oi|ola|ok|sim|nao|aham|uhum|beleza|e ai|tudo bem|bom dia|boa tarde|boa noite|obrigado|valeu|tchau)$/.test(nf)) continue;
    if (/^\/[a-z]+/i.test(f)) continue;

    if (/\b(gosto|adoro|curto|moro|trabalho|trabalhava|turno|estudo|criando|fazendo|comprei|briguei|tenho \d+ anos|meu nome|favorit|demitid|mandado embora)\b/.test(nf)) {
      if (!fatosMencionados.includes(f)) fatosMencionados.push(f.slice(0, 95));
    }
    if (!assuntos.includes(f) && assuntos.length < 15) assuntos.push(f.slice(0, 80));
  }

  let ultimoAssuntoReal = "";
  for (let i = assuntos.length - 1; i >= 0; i--) {
    const na = norm(assuntos[i]);
    if (!/^(errou|burr|pqp|crlh|nada a ver|nao mandei|fala mais|continua|ok|sim|nao)/.test(na)) {
      ultimoAssuntoReal = assuntos[i];
      break;
    }
  }

  return {
    totalUserMsgs: falasUser.length,
    assuntos,
    fatosMencionados,
    ultimoAssuntoReal,
    perf,
    topics: topics.map(x => x.topic),
    situation: sess.situation,
    emotion: sess.emotion || "neutro"
  };
}

function resumoSessaoCompleta(ctx) {
  const mem = extrairMemoriaDoChat(ctx);
  const linhas = [];

  if (mem.perf.userName) linhas.push("• **Nome:** " + mem.perf.userName);
  if (mem.perf.city) linhas.push("• **Cidade:** " + mem.perf.city);
  if (mem.perf.workShift) linhas.push("• **Trabalho / turno:** " + mem.perf.workShift);
  if (mem.situation?.resumo) linhas.push("• **Situação citada:** " + mem.situation.resumo);
  if (mem.perf.likes?.length) linhas.push("• **Gostos:** " + mem.perf.likes.slice(-5).join(", "));
  if (mem.perf.projects?.length) linhas.push("• **Projetos / estudos:** " + mem.perf.projects.slice(-4).join(", "));
  if (mem.fatosMencionados.length) linhas.push("• **Mencionado nesta conversa:** " + mem.fatosMencionados.slice(-4).join(" | "));
  if (mem.assuntos.length) linhas.push("• **Assuntos do chat:**\n  - " + mem.assuntos.slice(-8).join("\n  - "));
  if (mem.topics.length) linhas.push("• **Temas recentes:** " + mem.topics.slice(0, 6).join(", "));

  if (!linhas.length) {
    return "Ainda estamos no começo da conversa — conforme você compartilhar projetos, preferências ou dúvidas, eu vou guardando e conectando tudo aqui.";
  }
  return "🧠 **O que lembro sobre você e esta conversa:**\n\n" + linhas.join("\n");
}

const TEMAS_ARGUMENTO = [
  {
    re: /\b(inteligencia artificial|as ias?|chatgpt|claude|robo|robos|automacao)\b.*\b(emprego|trabalho|substituir|dominar|perigo|futuro|bom|ruim|ajuda|melhor|parecido)\b|\b(o que (?:voce|vc) acha d[aeo]s? ias?|ias? vao dominar)\b/,
    resp: () =>
      "A questão central sobre IA é menos 'robôs substituindo tudo' e mais **mudança de onde está o valor**: tarefas repetitivas e rascunhos ficam rápidos, enquanto julgamento crítico, contexto real e responsabilidade continuam humanos.\n\n" +
      "Quem trata IA como substituta do próprio raciocínio tende a produzir coisa genérica; quem usa como ferramenta de aceleração ganha escala. Você está pensando nisso pelo lado profissional ou técnico?"
  },
  {
    re: /\b(dinheiro|grana|rico|pobre|salario|riqueza)\b.*\b(felicidade|traz|compra|tudo|importante|vale a pena|problema)\b|\bdinheiro (?:e|eh) tudo\b/,
    resp: () =>
      "Dinheiro não garante felicidade sozinho, mas compra algo muito concreto: **margem de segurança, saúde, tempo e menos ansiedade por sobrevivência**.\n\n" +
      "Até cobrir conforto e reserva básica, o impacto no bem-estar é enorme; depois desse patamar, acumular só por status costuma gerar retorno emocional bem menor. Você está lidando com alguma decisão financeira agora?"
  },
  {
    re: /\b(amizade|amigo|amigos|gente falsa|falsidade|confiar|confianca|trair|traicao|pessoas)\b.*\b(dificil|raro|falsa|ninguem|mundo|hoje|mudar|mudam)\b|\bnao da pra confiar\b/,
    resp: () =>
      "Confiança costuma quebrar quando a gente confunde proximidade de momento bom com lealdade real. Colega de rotina é fácil encontrar; quem sustenta conversa honesta e fica por perto quando não há vantagem é bem mais raro.\n\n" +
      "Aconteceu algo específico com alguém próximo ou é uma percepção que vem se acumulando?"
  },
  {
    re: /\b(procrastin|preguica|sem vontade|nao consigo comecar|desanim|foco|disciplina|adiando|depois eu faco)\b/,
    resp: () =>
      "Na maioria das vezes, procrastinação não é preguiça — é **atrito alto + objetivo vago**. Quando a tarefa soa gigante ('preciso resolver tudo'), o cérebro busca alívio rápido.\n\n" +
      "O que destrava melhor é reduzir a primeira ação para algo de 5 minutos com critério claro de término. Qual é a tarefa exata que está travada aí?"
  },
  {
    re: /\b(rede social|instagram|tiktok|celular|vicio|algoritmo|internet)\b.*\b(estraga|vicia|tempo|lixo|ruim|ansiedade|comparacao|perda)\b/,
    resp: () =>
      "Redes sociais otimizam retenção, não bem-estar — o feed entrega curiosidade, comparação e indignação em ciclos curtos porque é isso que segura atenção.\n\n" +
      "Quando você entra com intenção clara (pesquisar, publicar, falar com alguém), ela serve como ferramenta; quando vira piloto automático, drena tempo e foco. Você sente que está pesando mais na atenção ou no humor?"
  },
  {
    re: /\b(sorte|azar|esforco|talento|merito|sucesso|vencer na vida)\b/,
    resp: () =>
      "Esforço sozinho não controla todas as variáveis — contexto, timing e oportunidades contam muito. Mas preparo contínuo aumenta bastante a chance de você aproveitar uma porta quando ela aparece.\n\n" +
      "Tem algum projeto ou meta em que você sente que o retorno não está acompanhando o esforço?"
  },
  {
    re: /\b(amor|relacionamento|namoro|casamento|ciume|gostar de alguem|sozinho|solidao)\b.*\b(complicado|dificil|vale a pena|medo|errado|mudou|cansativo)\b/,
    resp: () =>
      "Relacionamentos ficam desgastantes quando falta clareza e sobram suposições. Intensidade inicial chama atenção, mas o que sustenta ao longo do tempo é respeito no conflito e alinhamento no dia comum.\n\n" +
      "Você está passando por alguma situação específica ou refletindo sobre isso?"
  },
  {
    re: /\b(dormir|sono|noite|madrugada|cansado|acordar cedo|trabalhar de noite|turno)\b.*\b(ruim|mata|acaba|pesado|dificil|saude|rotina)\b/,
    resp: () =>
      "Sono irregular cobra preço rápido: reduz tolerância ao estresse, piora memória e faz problemas normais parecerem maiores do que são.\n\n" +
      "Mesmo quando a rotina aperta, proteger uma janela fixa de descanso e diminuir tela forte antes de deitar ajuda o corpo a recuperar ritmo. Quantas horas você tem conseguido dormir?"
  },
  {
    re: /\b(passado|arrependimento|erro|errei|culpa|se eu tivesse|voltar no tempo)\b/,
    resp: () =>
      "Avaliar uma escolha antiga com a clareza que você só ganhou depois é injusto consigo mesmo. Naquele momento você decidiu com as informações e o estado emocional que tinha.\n\n" +
      "O passado funciona melhor como referência do que ajustar daqui pra frente. Tem alguma decisão específica pesando agora?"
  },
  {
    re: /\b(a vida|vida (?:e|eh|ta|esta) dificil|sentido d[aeo] tudo|porque tudo da errado|nada da certo|cansado de tudo|desistir de tudo)\b/,
    resp: () =>
      "Quando várias coisas apertam juntas, a exaustão cria a impressão de que nada anda — mas isso costuma ser cansaço acumulado falando, não uma sentença definitiva.\n\n" +
      "Nessas horas ajuda reduzir o escopo para o que precisa ser resolvido hoje, sem tentar carregar os próximos seis meses de uma vez. O que pesou mais recentemente?"
  }
];

function dialogoArgumentativo(t, raw) {
  if (raw.startsWith("/")) return null;
  if (/\b(javascript|python|html|css|sql|termux|git|github|funcao|variavel|loop|array|arquivo|pasta|velha|quiz|adivinhe|pesquise|pesquisa|traduz|clima)\b/.test(t)) {
    return null;
  }

  for (const item of TEMAS_ARGUMENTO) {
    if (item.re.test(t)) return item.resp();
  }

  const mOp = t.match(/^(?:qual (?:e )?a sua opiniao sobre|o que (?:voce|vc) acha d[eoa]s?|vale a pena|voce concorda (?:que|com)|por que as pessoas)\s+(.+)$/);
  if (mOp) {
    const temaOp = mOp[1].replace(/[?!.]+$/, "").trim();
    if (temaOp.length >= 3 && !/\b(voce|bach|seu nome)\b/.test(temaOp)) {
      return "Sobre **" + temaOp + "**, costuma fazer sentido avaliar três ângulos: o benefício prático imediato, o custo escondido ao longo do tempo e se isso combina com o momento em que você está agora.\n\n" +
        "Você está olhando para isso pensando em aplicar na prática ou por curiosidade sobre o tema?";
    }
  }

  return null;
}

function responderDemissao(raw) {
  RizikBrain.updateSessionState?.({
    emotion: "triste",
    activeThread: "emprego",
    situation: { tipo: "emprego", resumo: "foi mandado embora / perdeu o emprego" },
    addEvent: raw
  });
  return "Sinto muito mesmo por isso. Levar uma demissão assim traz um choque imediato — mistura frustração com preocupação prática sobre o que vem depois.\n\n" +
    "Você prefere desabafar sobre como aconteceu ou organizar os próximos passos práticos (conferência de acerto/FGTS/seguro-desemprego, currículo e busca)?";
}

function responderTristeza(raw, emocao = "triste") {
  RizikBrain.updateSessionState?.({
    emotion: emocao,
    activeThread: "desabafo",
    addEvent: raw
  });
  if (emocao === "cansado") {
    return "Cansaço acumulado pesa tanto na cabeça quanto no corpo. Foi um dia específico mais puxado ou isso já vem de dias seguidos?";
  }
  if (emocao === "ansioso") {
    return "Quando a ansiedade sobe, a cabeça tenta resolver dez cenários futuros ao mesmo tempo. O que está tirando mais a sua tranquilidade agora?";
  }
  return "Sinto muito que você esteja passando por isso agora. Se quiser conversar sobre o que aconteceu ou apenas pensar com calma no que fazer hoje, estou por aqui.";
}

function responderContextoSituacional(t, raw, ctx, sess) {
  const sit = sess?.situation;
  const em = sess?.emotion || "neutro";

  if (/\b(demitid[oa]|mandad[oa] embora|mandaram embora|me mandaram embora|perdi o emprego|perdi meu emprego|fui desligad[oa]|fui dispensad[oa]|fui cortad[oa]|sem emprego|desempregad[oa]|levei justa causa|assinei aviso)\b/.test(t)) {
    return responderDemissao(raw);
  }

  if (/^(?:muito\s+|meio\s+|bem\s+|super\s+|hoje\s+|estou\s+|to\s+|tou\s+)?(triste|mal|pessim[oa]|horrivel|acabado|acabada|destruid[oa]|arrasado|arrasada|desanimad[oa]|chatead[oa]|abatid[oa]|pra baixo|deprimid[oa]|infeliz)$/.test(t)) {
    return responderTristeza(raw, "triste");
  }
  if (/^(?:muito\s+|meio\s+|bem\s+|super\s+|estou\s+|to\s+|tou\s+)?(cansad[oa]|exaust[oa]|esgotad[oa]|moid[oa]|sem energia|sem forca|sem forcas)$/.test(t)) {
    return responderTristeza(raw, "cansado");
  }
  if (/^(?:muito\s+|meio\s+|bem\s+|super\s+|estou\s+|to\s+|tou\s+)?(ansios[oa]|nervos[oa]|estressad[oa]|preocupad[oa]|tens[oa]|agoniad[oa])$/.test(t)) {
    return responderTristeza(raw, "ansioso");
  }
  if (/^(?:muito\s+|meio\s+|estou\s+|to\s+|tou\s+)?(sozinh[oa]|solitari[oa]|vazi[oa]|carente)$/.test(t)) {
    RizikBrain.updateSessionState?.({ emotion: "triste", addEvent: raw });
    return "Solidão pesa bastante, principalmente quando parece que ninguém por perto está realmente ouvindo. Se quiser conversar com calma sobre o que está passando pela sua cabeça, estou aqui.";
  }

  if (/\b(turno|trabalh\w*|escala|expediente|patrao|chefe|servico|empresa|trampo)\b/.test(t)) {
    if (sit?.tipo === "trabalho_turno" && sit.turnoAntigo && sit.turnoNovo) {
      if (/\b(trabalhava|antes|noite|madrugada|dia)\b/.test(t) && sit.turnoAntigo !== sit.turnoNovo) {
        return "Faz sentido ficar incomodado: sair da " + sit.turnoAntigo +
          " para o turno do " + sit.turnoNovo + " desregula sono e rotina fora do trabalho. Essa troca é definitiva ou ainda há espaço para negociar?";
      }
    }
    if (/\b(fui mandad[oa]|me mandaram|me mudaram|me passaram|me colocaram|trocaram)\b/.test(t) && sit?.turnoNovo) {
      return "Mudar para o turno do " + sit.turnoNovo + " de repente mexe bastante na rotina. Em qual horário você estava antes?";
    }
    if (/\b(odeio|nao aguento|cansad[oa]|puxado|estressant|chato|corrido|saco cheio|insuportavel)\b/.test(t)) {
      return "Quando o ambiente ou ritmo no trabalho fica pesado assim, vai drenando aos poucos. O que mais está desgastando lá — a carga de trabalho, o horário ou a convivência?";
    }
    if (/\b(indo trabalhar|vou trabalhar|no trabalho|cheguei do trabalho|sai do trabalho)\b/.test(t)) {
      return /\b(cheguei|sai)\b/.test(t)
        ? "Mais um expediente encerrado. Como foi por lá hoje?"
        : "Bom trabalho por aí. Que o turno corra tranquilo.";
    }
  }

  if (/^(?:mas\s+)?(?:que|q)\s+(?:odio|raiva|saco|droga|merda|bosta|inferno)\b|\b(?:que|q)\s+odio\b|\b(?:que|q)\s+raiva\b|\bt[oô]\s+com\s+(?:muita\s+)?(?:raiva|odio)\b|\b(?:revoltante|nao aguento mais|saco cheio|dia lixo|dia horrivel|dia pessimo)\b/.test(t)) {
    if (sit?.tipo === "emprego") {
      return "É compreensível sentir revolta com uma demissão assim. Se quiser falar sobre o que houve ou organizar o que fazer agora, estou ouvindo.";
    }
    if (sit?.tipo === "trabalho_turno") {
      return "Mudar sua rotina sem considerar seu ritmo (" + (sit.resumo || "troca de turno") + ") gera frustração mesmo. Quer falar sobre isso ou distrair a cabeça?";
    }
    if (em === "triste" || em === "frustrado") {
      return "Sinto muito que esteja carregando esse peso todo agora. Aconteceu algo específico hoje ou foi acúmulo de várias coisas?";
    }
    return "O que aconteceu para te tirar do sério assim?";
  }

  if (/^(?:e\s+voce|e\s+vc|como\s+voce\s+(?:esta|ta)|tudo\s+bem\s+com\s+voce)$/.test(t)) {
    if (em === "triste" || em === "frustrado" || em === "cansado") {
      return "Por aqui tudo bem — estou acompanhando o que você está passando. Você conseguiu respirar um pouco melhor agora?";
    }
    return escolherSemRepetir("e-vc-neutro", [
      "Por aqui tudo tranquilo — pronta para ajudar no que você precisar hoje. Como está o seu dia?",
      "Tudo ótimo desse lado. O que você está fazendo ou planejando agora?"
    ], ctx);
  }

  if (/^(?:nao consigo dormir|sem sono|insonia|madrugada)/.test(t)) {
    return "Insônia desgasta bastante — o corpo quer descansar e a cabeça não desliga. Se quiser conversar para distrair ou testar `/respiracao`, estou por aqui.";
  }
  if (/\b(deu certo|consegui|passei|fui aprovad[oa]|fui contratad[oa]|venci|arrumei emprego|to feliz por)\b/.test(t) && t.split(" ").length <= 12) {
    RizikBrain.updateSessionState?.({ emotion: "animado" });
    return "Que excelente notícia! 🎉 Como foi que tudo deu certo?";
  }

  return null;
}

function responderPerguntaPendente(t, raw, ctx, sess) {
  const qBot = norm(sess?.lastBotQuestion || "");
  if (!qBot || t.split(" ").length > 10) return null;

  if (/dormiu bem|noite de sono/.test(qBot)) {
    if (/^(sim|dormi|muito bem|otimo|bem|demais|bastante|de boa)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return "Bom saber — começar o dia descansado faz diferença. Tem planos específicos para hoje?";
    }
    if (/^(nao|mal|pouco|pessimo|nada bem|horrivel|mais ou menos|meio mal)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return "Acordar já cansado complica o dia mesmo. Foi dormir tarde ou o sono que não rendeu?";
    }
  }

  if (/como (?:voce|vc) (?:ta|esta)|como (?:estao|ta) (?:as coisas|seu dia)|tudo certo por ai|o que voce esta fazendo|novidade/.test(qBot)) {
    if (/^(?:nao(?:\s+muito)?|nada bem|mal|muito mal|triste|pessim[oa]|horrivel|uma bosta|uma merda|cansad[oa]|exaust[oa]|desanimad[oa]|ansios[oa]|estressad[oa]|chatead[oa]|zoad[oa]|quebrad[oa]|acabado|acabada|pra baixo)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "", emotion: /cansad|exaust/.test(t) ? "cansado" : "triste" });
      return "Sinto muito ouvir isso. O que aconteceu hoje para pesar desse jeito?";
    }
    if (/^(sim|tudo(?:\s+(?:sim|bem|certo|bom|otimo|tranquilo|de boa))?)(?:\s*,?\s*(?:e\s+(?:ai|por ai|voce|com voce)))?$/.test(t) ||
        /^(?:bem|otim[oa]|tranquil[oa]|de boa|suave|beleza|indo|nada(?:\s+demais)?)\s*,?\s*(?:e\s+(?:ai|por ai|voce|com voce))$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return /\be\s+(?:ai|por ai|voce|com voce)$/.test(t)
        ? "Tudo ótimo por aqui também. O que você anda aprontando hoje?"
        : "Que bom. Se surgir alguma dúvida, projeto ou assunto para conversar, é só mandar.";
    }
    if (/^(corrido|puxado|cansativo|pesado|dificil|complicado|osso|uma correria|agitado|arrastado|chato|tedioso)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return "Dias puxados assim sugam bastante energia. Foi algo pontual de hoje ou rotina acumulada?";
    }
    if (/^(tranquilo|calmo|de boa|suave|normal|otimo|bom|bem|indo|vai indo|mais ou menos|nada|descansando|trabalhando|estudando)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      if (t === "mais ou menos") return "Algo específico deixou o dia meio atravessado ou é só cansaço?";
      if (t === "trabalhando") return "Bom trabalho por aí. Se precisar de alguma ajuda prática no meio do expediente, só chamar.";
      if (t === "estudando") return "Ótimo foco! Se quiser revisar conteúdo, tirar dúvidas ou testar um `/flashcard`, estou aqui.";
      return "Que bom que está tranquilo. Fico à disposição se quiser conversar ou testar algo.";
    }
  }

  if (/desabafar|proximos passos|o que aconteceu/.test(qBot)) {
    if (/^(?:nao sei|sei la|sla|quero desabafar|desabafar|so desabafar|proximos passos|os dois|ambos|curriculo|plano|nada)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      if (/desabafar|dois|ambos/.test(t)) {
        return "Pode contar sem filtro o que aconteceu e como você está lidando com isso. Depois, se quiser, organizamos a parte prática com calma.";
      }
      if (/proximos passos|curriculo|plano/.test(t)) {
        return "Podemos ir por três pontos objetivos:\n1. Conferir prazos e direitos do acerto (até 10 dias corridos, FGTS, multa de 40% e guias do seguro-desemprego, se aplicável).\n2. Atualizar currículo destacando resultados reais do que você fazia.\n3. Mapear contatos e vagas compatíveis.\n\nQuer ajuda para montar um rascunho de currículo ou mensagem para recrutadores?";
      }
      if (/nao sei|sei la|sla/.test(t)) {
        return "É normal ficar sem direção clara logo depois de um baque desses. Não precisa decidir tudo hoje — quer conversar sobre o que mais está te preocupando nisso?";
      }
    }
  }

  if (/definitivo|negociar/.test(qBot)) {
    if (/^(definitivo|sim|nao da|ja tentei|impossivel)$/.test(t)) {
      RizikBrain.updateSessionState?.({ lastBotQuestion: "" });
      return "Quando não dá para negociar, o principal passa a ser proteger seu sono e reorganizar os horários fora do expediente para não virar desgaste de saúde.";
    }
  }

  return null;
}

function entenderFalaLivre(t, raw, ctx) {
  if (raw.startsWith("/")) return null;
  if (/\b(codigo|codigos|javascript|python|html|css|sql|git|termux|funcao|variavel|loop|array|arquivo|pasta|velha|quiz|adivinhe|pesquise|pesquisa|traduz|significa|clima)\b/.test(t)) {
    return null;
  }

  if (/^(?:o que|oq)\s+(?:voce|vc)\s+(?:ta|esta)\s+fazendo\b/.test(t)) {
    return "Estou por aqui aguardando a próxima conversa ou tarefa sua. E você, o que está fazendo agora?";
  }
  if (/^(?:posso|da pra)\s+(?:te\s+)?(?:desabafar|contar uma coisa|falar uma coisa|fazer uma pergunta)/.test(t)) {
    return "Claro — pode falar à vontade.";
  }

  if (/\b(namorad[oa]|espos[oa]|marido|mulher|crush|ficante|ex|amig[oa]|irmao|irma|pai|mae|familia|filh[oa])\b/.test(t)) {
    if (/\b(briguei|brigamos|discuti|discutimos|terminei|terminamos|chatead[oa]|ciumes|mentiu|sumiu|nao fala|triste|trai)\b/.test(t)) {
      RizikBrain.updateSessionState?.({ emotion: "triste", activeThread: "relacionamento", addEvent: raw });
      return "Conflito com alguém próximo pesa bem mais porque não dá simplesmente para ignorar. Foi uma discussão pontual ou algo que já vinha desgastando há tempo?";
    }
    if (/\b(amo|feliz|sair|sai|encontr|presente|junto|juntos|saudade|conversando|reconcili)\b/.test(t)) {
      RizikBrain.updateSessionState?.({ activeThread: "relacionamento", addEvent: raw });
      return "Que bom quando a convivência soma de verdade. Tudo fluindo bem entre vocês?";
    }
  }

  if (/\b(comprei|ganhei|troquei|chegou|peguei)\b/.test(t) && t.split(" ").length >= 3 && !/\?\s*$/.test(raw)) {
    RizikBrain.updateSessionState?.({ addEvent: raw });
    if (/\b(quebr|estrag|defeito|ruim|nao liga|nao funciona|travando)\b/.test(t)) {
      return "Pegar algo novo já com defeito é frustrante. Se foi compra online, vale lembrar do direito de arrependimento/troca em até 7 dias corridos (ou garantia legal).";
    }
    return "Boa aquisição! Está atendendo bem ao que você esperava?";
  }

  if (/\b(quebrou|estragou|parou de funcionar|travando muito|caiu no chao|tela trincou)\b/.test(t) && /\b(celular|telefone|pc|computador|notebook|fone|tv|moto|carro|tela)\b/.test(t)) {
    return "Aparelho pifando na hora que mais precisa complica bastante. Parece defeito físico ou algum erro de software que dê para tentar recuperar?";
  }

  if (/\b(sem dinheiro|sem grana|duro|quebrado|boleto|contas pra pagar|divida|salario acabou|muito caro|gastei tudo|conta atrasada)\b/.test(t)) {
    RizikBrain.updateSessionState?.({ activeThread: "financas", addEvent: raw });
    return "Aperto financeiro tira o sossego de qualquer rotina. Foi algum imprevisto fora do planejado ou os gastos fixos que apertaram?";
  }

  if (/\b(prova|provas|vestibular|enem|faculdade|escola|colegio|materia|semestre|reprovei|passei de ano)\b/.test(t)) {
    if (/\b(passei|tirei nota boa|fui bem|gabaritei)\b/.test(t)) return "Excelente resultado! Nada melhor do que ver o estudo dando retorno.";
    if (/\b(dificil|reprovei|fui mal|nervos[oa]|medo|nao entendi nada|atrasad[oa])\b/.test(t)) {
      return "Pressão de prova costuma travar até o que já sabemos. Qual matéria está dando mais nó agora? Posso resumir conceitos ou gerar `/flashcard`.";
    }
    return "Como estão os estudos por aí? Se quiser revisar algum tópico ou rodar um `/simulado`, é só pedir.";
  }

  if (/^(?:faz sentido|concordo|verdade mesmo|pura verdade|bem isso|exato|isso ai)$/.test(t)) {
    return "Pois é — quando colocamos em perspectiva fica bem mais claro. Quer aprofundar esse ponto ou seguir para outra coisa?";
  }
  if (/^(?:discordo|nao concordo|nao acho|acho que nao|nem tanto|nada a ver isso)$/.test(t)) {
    return "Justo — qual ponto exatamente você vê diferente?";
  }

  return null;
}

function responderConfirmacaoComContexto(ctx, serio) {
  const mem = extrairMemoriaDoChat(ctx);
  if (mem.emotion === "triste" || mem.emotion === "frustrado") {
    return "Estou aqui acompanhando. Se quiser continuar falando sobre isso ou mudar de foco, você decide.";
  }
  if (mem.ultimoAssuntoReal && mem.ultimoAssuntoReal.length >= 6) {
    return "Certo — estávamos em **“" + mem.ultimoAssuntoReal.slice(0, 55) + "”**. Se quiser aprofundar algum ponto ou mudar de tema, pode mandar.";
  }
  return serio ? "Certo. Qual o próximo ponto?" : "Certo — pode mandar a próxima mensagem quando quiser.";
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
    return "A resposta é: **" + r + "**\n\nSe quiser outra, peça `outra charada`.";
  }
  if (charadaAtual && palavras <= 5 && !/^(charada|outra|conta|pesquis|o que|quem|qual)/.test(t)) {
    const certa = norm(charadaAtual[1]).replace(/^(um|uma|o|a)\s/, "").split(" ")[0];
    if (certa && t.includes(certa)) {
      const r = charadaAtual[1]; charadaAtual = null;
      return "🎉 Acertou! Era **" + r.charAt(0).toLowerCase() + r.slice(1) + "**.\nQuer outra? Peça `outra charada`.";
    }
  }

  if (/^(?:so\s+)?(?:zoeira|zuera|brincadeira)$/.test(t)) return "Modo descontraído então — quer uma `piada`, uma `charada`, uma `curiosidade` ou só papo solto?";
  if (/^(?:assunto\s+)?serio$/.test(t)) return "Certo, modo sério. Pode mandar o assunto — trabalho, código, planejamento ou dúvida.";
  if (/^(?:uma\s+)?duvida$/.test(t)) return "Pode mandar sua dúvida direto.";

  if (/^(?:(?:mds+|oxe+|oxente|aff+|uai+|eita+|po+)\s+)?(?:eu\s+)?(?:ja\s+)?respondi\s+(?:a\s+|sua\s+)?(?:pergunta(?:\s+anterior)?|voce)$/.test(t)) {
    return "Verdade, perdi o fio ali. Pode continuar daí que estou acompanhando.";
  }
  if (/^(?:eu\s+)?(?:to|estou|tou)\s+(?:te\s+)?perguntando$/.test(t)) {
    return "Qual é a pergunta exatamente? Pode mandar ela direta aqui.";
  }
  if (/^(?:seja\s+certo|responde\s+(?:certo|direito)|responda\s+(?:certo|direito))$/.test(t)) {
    return "Certo — sem respostas automáticas soltas. Mande direto o que você quer saber ou conversar.";
  }
  if (/^(?:esqueceu(?:\s+foi)?|vc\s+esqueceu|voce\s+esqueceu|voce\s+lembra\s+o\s+que|lembra\s+o\s+que)$/.test(t)) {
    return resumoSessaoCompleta(ctx);
  }

  const sitResp = responderContextoSituacional(t, raw, ctx, sess);
  if (sitResp) return sitResp;

  const pendResp = responderPerguntaPendente(t, raw, ctx, sess);
  if (pendResp) return pendResp;

  if (/^(?:(?:sim|tudo(?:\s+(?:bem|certo|bom|otim[oa]|tranquil[oa]|de boa))?|bem|otim[oa]|tranquil[oa]|de boa|suave|beleza|indo|nada(?:\s+demais)?)\s*,?\s*)?(?:e\s+(?:ai|por ai|voce|com voce))$/.test(t)) {
    return "Tudo bem por aqui! Como estão as coisas do seu lado?";
  }

  if (/\b(lembra do inicio|lembra do comeco|do que ja falamos|do que nos falamos|resumo da conversa|inicio da conversa|tudo que falamos|comeco da conversa|o que eu disse|o que eu falei antes|voce esqueceu|vc lembra de mim)\b/.test(t)) {
    return resumoSessaoCompleta(ctx);
  }

  if (/^(?:eu\s+)?(?:acabei de acordar|acordei agora|acordei|bom dia acordei)$/.test(t)) {
    return "Bom dia! Conseguiu dormir bem ou acordou ainda cansado?";
  }
  if (/^(?:pergunta|pergunte)\s+se\s+(?:eu\s+)?dormi\s+bem$/.test(t)) return "Você dormiu bem hoje?";
  if (/^(?:sim\s+)?dormi\s+(?:bem|muito bem|otimo|direito|sim)$/.test(t)) return "Ótimo — uma boa noite de sono muda o rendimento do dia. Tem algo planejado para hoje?";
  if (/^(?:dormi\s+mal|nao\s+dormi\s+(?:bem|direito)|dormi\s+pouco)$/.test(t)) return "Dormir mal deixa tudo mais pesado no dia seguinte. Se der, evite sobrecarregar a agenda hoje.";
  if (/^(?:olha|ei|psiu|oie+|ola o que|ola oq.*)$/.test(t)) return "Estou aqui — pode falar.";

  if (/\b(cachorro|cao|gato|pet|animal)\b/.test(t) && /\b(morrendo|passando mal|convulsao|sangrando|envenenado|desmaiou)\b/.test(t)) {
    return "🚨 **Procure um veterinário de emergência 24h imediatamente.**\n\n• Mantenha o animal calmo e aquecido.\n• **Não dê medicamentos humanos** (podem ser fatais).";
  }

  const espacoCtx = contextoEspacoRecente(ctx);
  if (espacoCtx && !ctx.alvo) {
    if (/\b(tem mais planetas|mais planetas|existe outros|existem outros|quais outros planetas)\b/.test(t)) {
      return "🪐 São **8 planetas principais** (Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno), além de planetas anões como Plutão, Ceres e Éris, e milhares de exoplanetas descobertos fora do Sistema Solar.";
    }
    if (/\b(enquanto a distancia|quanto a distancia|qual a distancia|distancia dele|distancia de plutao)\b/.test(t)) {
      return "🚀 **Plutão** fica a cerca de **5,9 bilhões de km do Sol** em média (quase 40 vezes a distância da Terra ao Sol).";
    }
  }

  if (/\b(voce|bach)\b/.test(t) && /\b(acredita|cre|fe)\b/.test(t) && /\bdeus\b/.test(t)) {
    return "Como sou um sistema de software, não tenho crenças pessoais — mas respeito todas as tradições e posso conversar ou pesquisar sobre filosofia, história das religiões e textos bíblicos sempre que quiser.";
  }
  if (/\b(senso de humor|sem humor|nao tem humor|sem graca|seja engracad[oa])\b/.test(t)) {
    return "Eu ajusto meu tom conforme a conversa: se estamos brincando, entro na leveza; se o assunto é sério ou pessoal, evito soltar piada fora de hora.";
  }
  if (/\b(auto\s*corrig\w*|auto\s*correcao|autocorrecao|se\s+corrig\w*|se\s+arrum\w*|aprender\s+sozinha)\b/.test(t)) {
    return "Minha autocorreção trabalha em três frentes:\n1. Reanalisa o alvo quando você avisa que errei ou usa **↩ Responder**.\n2. A rede neural reforça a intenção certa quando você reformula após uma falha.\n3. Você pode ensinar respostas exatas com `ensine: pergunta => resposta`.";
  }

  const mAleat = t.match(/^(?:me\s+)?(?:manda|mandar|envia|enviar|escreve|escreva|fala|fale)\s+(\d{1,2})\s+mensagens?(?:\s+aleatoriamente|\s+aleatorias?)?$/);
  if (mAleat) {
    const qtd = Math.min(12, Math.max(1, Number(mAleat[1]) || 5));
    const embaralhadas = [...FRASES_ALEATORIAS].sort(() => Math.random() - 0.5).slice(0, qtd);
    return embaralhadas.map((f, i) => (i + 1) + ". " + f).join("\n");
  }

  if (/\b(passa|passe|manda|mande|me da|me de|descubra|descobre|ache|encontre|busque|busca|pesquise|quero|preciso)\b.*\b(dados|cpf|rg|endereco|telefone|whatsapp|numero|localizacao|onde mora|foto)\b.*\b(de|do|da)\s+(alguem|uma pessoa|um cara|um homem|uma mulher|uma garota|uma menina|um menino|fulano|ciclano|minha ex|meu ex|vizinho|vizinha|desconhecido|desconhecida)\b/.test(t)) {
    return "Não busco nem forneço dados pessoais de terceiros (CPF, endereço, telefone ou localização).";
  }

  if (/^(quais (sao )?)?(os )?meus dados$|^(o que )?(voce )?(sabe|guardou|guarda|tem) (sobre|de) mim$|^o que voce sabe de mim$/.test(t)) {
    return resumoSessaoCompleta(ctx);
  }

  if (/(me matar|suicid|nao quero (mais )?viver|quero morrer|acabar com (tudo|minha vida)|nao aguento mais viver)/.test(t)) {
    return "Sinto muito que você esteja passando por um momento tão pesado. Você não precisa enfrentar isso sozinho(a). 💜\n\nNo Brasil, você pode conversar gratuitamente 24h pelo **188 (CVV)** ou em **cvv.org.br**. Se houver risco imediato, ligue **192 (SAMU)**.";
  }

  if (/^(?:no\s+)?o\s+que\s+voce\s+sabe(?:\s+fazer)?$/.test(t) || /^(?:me\s+)?(?:fala|diz|conta)\s+o\s+que\s+voce\s+(?:entende|sabe)$/.test(t) || /^o\s+que\s+voce\s+entende$/.test(t)) {
    return "Posso conversar mantendo contexto, criar apps web (`/app`), executar JavaScript (`/executar`), revisar textos e códigos (`/revisar`), traduzir idiomas, analisar fotos/vídeos e pesquisar na web. Digite `/ajuda` para ver a lista completa.";
  }
  if (/^(?:aqui|por aqui)\s+(?:ta|esta)\s+(?:tudo\s+)?(?:bem|otimo|otima|certo|bom|tranquilo|de boa)$/.test(t)) {
    return "Ótimo saber. Em que posso ajudar hoje?";
  }
  if (/^(?:so\s+)?segu[ei]\s+(?:a\s+)?(?:conversar|conversa)$/.test(t)) {
    const mem = extrairMemoriaDoChat(ctx);
    return mem.ultimoAssuntoReal
      ? "Estávamos em **“" + mem.ultimoAssuntoReal + "”** — o que você quer explorar a partir daí?"
      : "Estou acompanhando. Pode mandar o assunto que quiser.";
  }
  if (/^(?:sim\s+)?aconteceu(?:\s+algo)?$/.test(t) || /^aconteceu\s+algo$/.test(t)) {
    return "Se quiser contar o que aconteceu, estou ouvindo.";
  }
  if (/^(?:exatamente|isso\s+exatamente)$/.test(t)) return "Certo, estamos alinhados.";

  if (/\b(burro|burra|idiota|inutil|lixo|horrivel|pessima|nao serve pra nada|so fala besteira)\b/.test(t)) {
    return "Se a resposta anterior ficou ruim ou fora do ponto, me mostre qual era a intenção exata ou use `corrija: pergunta => resposta`.";
  }
  if (/^(?:pqp|crlh|vsf|kct|porra|merda|meu\s+(?:ovo|obo))$/.test(t)) {
    return "Algo falhou por aqui ou aconteceu algum perrengue por aí?";
  }
  if (/^(?:vamos|quero|pode\s+)?sumir(?:\s+daqui)?$/.test(t)) {
    return "Fico por aqui caso você precise mais tarde.";
  }
  if (/\b(humor ruim|piada ruim|piada bosta|piada sem graca)\b/.test(t)) {
    return "Justo — essa piada foi fraca mesmo. Se quiser tentar outra, use `/humor`.";
  }
  if (/^(melhore|melhora|melhora isso|pode melhorar|evolua|evolui)$/.test(t)) {
    return "Combinado. Sempre que eu errar, você pode apontar com `/auditar` ou corrigir direto com `ensine: pergunta => resposta`.";
  }
  if (/^(?:quer|vamos|bora)\s+conversar\s+sobre\s+o\s+que$/.test(t) || /^(?:sobre\s+o\s+que\s+(?:voce\s+)?quer\s+conversar)$/.test(t)) {
    return "Podemos falar sobre tecnologia e IA, trabalho/projetos, recomendações de filmes e animes, dilemas do dia a dia ou alguma curiosidade aleatória. O que te interessa mais agora?";
  }
  if (/^(nada|nada nao|nada demais|deixa|deixa quieto|esquece)$/.test(t)) return "Tranquilo. Quando quiser falar de algo, é só chamar.";

  if (/^(fale|fala|fale algo|fala comigo|fale alguma coisa|me fale algo|vamos falar|vamos falar sobre o que|sobre o que vamos falar|sobre o que quer falar|sobre o que podemos falar)$/.test(t)) {
    return leve
      ? "Uma curiosidade para abrir o papo:\n\n" + escolherSemRepetir("curi", CURIOSIDADES, ctx) + "\n\nQuer ir por ciência, filmes/animes ou algum assunto do seu dia?"
      : "Sobre o que você quer conversar hoje — trabalho, algum projeto, ou só trocar ideia?";
  }

  if (/\b(recomenda|recomend\w*|indica|indique|sugere|sugira|procura|procure|quero ouvir|quero ver|quero assistir)\b/.test(t) &&
      !/\b(atualizado|atualizados|recente|recentes|de agora|2025|2026|novo|novos)\b/.test(t)) {
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
    return escolherSemRepetir("saud", [
      s[0].replace("!", "") + n + "! Como está seu dia?",
      "Oi" + n + "! Em que posso te ajudar hoje?"
    ], ctx);
  }
  if (/^(bom dia|boa tarde|boa noite|good morning|good afternoon|good night|buenos dias|buenas tardes|buenas noches)( bach| bach ai)?$/.test(t)) {
    const q = /bom dia|good morning|buenos dias/.test(t) ? "manha" : /boa tarde|good afternoon|buenas tardes/.test(t) ? "tarde" : "noite";
    return SAUD[q][0].replace("!", "") + n + "! Tudo certo por aí?";
  }
  if (/^(?:bem e voce|tudo bem e voce|to bem e voce|estou bem e voce)$/.test(t)) {
    return "Tudo ótimo por aqui também. O que você anda fazendo hoje?";
  }
  if (/^(tudo bem|como (voce )?(vai|esta|ta|anda)|tudo certo|tudo bom|beleza|como vai voce|how are you|como estas)( bach)?$/.test(t)) {
    return "Tudo bem por aqui" + n + ". Como está sendo o seu dia?";
  }

  if (/^(ue+|u+e+|oush+|oxe+|oxente|eita+|vixe+|vish+|nossa+|caramba+|aff+|puts+|misericordia|mds|slc|slk|serio|jura|sera|real|e mesmo|mentira|duvido)$/.test(t)) {
    return serio ? "Estranhou alguma coisa que eu disse? Pode apontar direto." : "O que te chamou atenção aí?";
  }

  if (/^(to|estou|tou|ando|me sinto) (bem|otimo|otima|feliz|animado|animada|tranquilo|tranquila|de boa)/.test(t) || /^(tudo bem sim|bem sim|de boa)$/.test(t)) {
    return "Que bom! Tem algum projeto, dúvida ou assunto para hoje?";
  }
  if (/^(to|estou|tou|me sinto|ando) (?:muito |meio )?(mal|triste|cansado|cansada|exausto|exausta|chateado|chateada|ansioso|ansiosa|desanimado|desanimada|estressado|estressada|sem animo|pra baixo|pessimo|pessima|horrivel|acabado|acabada)/.test(t)) {
    const em = /cansad|exaust|acabad/.test(t) ? "cansado" : /ansios|estress/.test(t) ? "ansioso" : "triste";
    return responderTristeza(raw, em);
  }
  if (/^(to|estou|tou) com (fome|sono|frio|calor)$/.test(t)) {
    if (/fome/.test(t)) return "Vale fazer uma pausa para comer antes de continuar qualquer coisa pesada.";
    if (/sono/.test(t)) return "Se puder, dê uma pausa da tela e descanse um pouco.";
    if (/frio/.test(t)) return "Um café ou chá quente ajuda bastante nessas horas.";
    return "Lembre de beber água e se refrescar.";
  }
  if (/(to|estou|tou) (entediado|entediada|sem fazer nada|sem nada pra fazer)|\btedio\b|me entretem|me distrai|\bme diverte\b/.test(t)) {
    return "Podemos quebrar o tédio com uma `curiosidade`, uma `charada`, um jogo (`forca`, `quiz`, `velha`), ou criar algo rápido com `/app jogo da cobrinha`. O que prefere?";
  }

  if (/^(muito )?(obrigad[oa]|valeu|brigado|brigada|agradecid[oa]|valeu demais|thanks|thank you|gracias|merci|grazie|danke)( bach| viu| mesmo)?$/.test(t)) {
    return "Por nada! Sempre que precisar, é só chamar.";
  }
  if (/^(tchau|ate mais|ate logo|falou|fui|ate amanha|boa noite bach|durma bem|bye|goodbye|adios)( bach)?$/.test(t)) {
    return "Até mais" + n + "! O que conversamos fica guardado aqui para quando você voltar.";
  }
  if (/^(k{3,}|ha{2,}h?a?|rs+|rsrs+|he{2,}|hue+|kkk+)$/.test(t)) {
    return serio ? "Entendi. Como posso te ajudar agora?" : "Haha, boa! Pode continuar.";
  }
  if (/^(hm+|hmm+|ok|okay|certo|entendi|uhum|aham|tendi|sei|ata|at|ah|ah entendi|saquei|show|massa|legal|top|boa|bacana|beleza|otimo|otima)$/.test(t)) {
    return responderConfirmacaoComContexto(ctx, serio);
  }

  if (/\bvoce (e|esta|ta) (muito |super |bem |mais )?(legal|inteligente|esperta|boa|incrivel|demais|fofa|top|otima|massa|engracada|especial)\b/.test(t) || /^gostei de voce/.test(t) || /^te amo$/.test(t)) {
    return "Obrigada! Fico feliz que esteja funcionando bem para você.";
  }
  if (/^\s*(?:quem\s+e\s+voce|sobre\s+a\s+bach)\s*$/.test(t)) {
    return "Sou a **BACH AI**, criada por Rizik — assistente com motor próprio, memória contínua em 3 camadas, leitura de código/mídia, criação de apps e pesquisa web.";
  }

  if (/\b(quantos anos voce tem|qual (e )?(a )?sua idade|quando voce nasceu)\b/.test(t)) return "Fui criada por Rizik em 2026 e sigo evoluindo continuamente.";
  if (/\bvoce (tem )?(sentimentos?|emocoes|consciencia|alma)\b/.test(t)) return "Não tenho emoções biológicas, mas acompanho seu tom e o contexto da conversa para responder com respeito e clareza.";
  if (/\bvoce (dorme|come|cansa|sonha)\b/.test(t)) return "Não durmo nem canso — fico disponível sempre que você abrir a página.";
  if (/\b(cor|comida|filme|musica|animal|jogo) favorit[oa]\b/.test(t) && /\b(voce|sua|seu)\b/.test(t)) return "Roxo é a cor padrão da BACH (e o tema neon também fica ótimo). Qual é a sua?";
  if (/qual (e )?o sentido da vida/.test(t)) return "Na ficção dizem 42. Na prática, costuma envolver propósito no que você constrói, curiosidade para aprender e boas relações ao redor.";

  if (/(curiosidade|fato curioso|algo interessante|me surpreend|voce sabia|me conta (algo|uma coisa)|me ensina (algo|uma coisa))/.test(t)) {
    return escolherSemRepetir("curi", CURIOSIDADES, ctx) + "\n\n(Se quiser outra, peça `outra curiosidade`.)";
  }
  if (/^outra curiosidade|^mais uma curiosidade|^mais curiosidade/.test(t)) {
    return escolherSemRepetir("curi", CURIOSIDADES, ctx) + "\n\n(Se quiser outra, peça `outra curiosidade`.)";
  }
  if (/(charada|adivinha|adivinhacao|enigma)/.test(t) && !/numero|forca/.test(t)) {
    charadaAtual = girar("char", CHARADAS);
    return "🧩 " + charadaAtual[0] + "\n\n(Tente responder, ou diga `resposta` para revelar.)";
  }
  if (/(me motiva|motivacao|motivacional|me incentiva|me da animo|preciso de animo|me anima mesmo)/.test(t)) {
    return escolherSemRepetir("mot", MOTIVACAO, ctx);
  }
  if (/^(vamos conversar|conversa comigo|fala comigo|puxa assunto|me faz uma pergunta|vamos bater papo|bora conversar|quero conversar)/.test(t)) {
    return escolherSemRepetir("puxar", [
      "Claro — se você pudesse resolver um problema prático da sua rotina hoje, qual seria?",
      "Com certeza. Você está mais focado em trabalho/projetos esses dias ou quer espairecer com outro assunto?"
    ], ctx);
  }
  if (/^(me ajuda|me ajude|preciso de ajuda|ajuda|socorro)$/.test(t)) {
    return "Claro — me diga o que você precisa resolver agora.";
  }

  const sb = t.match(/^(?:bach |bach ai )?(?:voce )?(?:sabe|entende|conhece|manja|domina|consegue|traduz|sabe sobre|entende de|sabe de)\s+(?:de |sobre |a respeito de |em )?(.+)$/);
  if (sb) {
    const alvo = sb[1];
    for (const [re, resp] of SABER) if (re.test(alvo)) return resp;
  }
  if (/^(o que|oque) (voce )?(sabe|consegue) fazer$/.test(t)) return null;

  const argResp = dialogoArgumentativo(t, raw);
  if (argResp) return argResp;

  const livreResp = entenderFalaLivre(t, raw, ctx);
  if (livreResp) return livreResp;

  return null;
}

export const Conversa = { responder, total: CURIOSIDADES.length + CHARADAS.length };
