/* BACH AI - CÉREBRO AVANÇADO 1.0
   Motor próprio de NLU (compreensão natural), base de conhecimento rica,
   recomendações por gênero (filmes, séries ao vivo, músicas), comparações,
   escrita estruturada e controle de contexto. 100% BACH AI. */

const norm = t => String(t || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\b(vc|vce)\b/g, "voce")
  .replace(/\b(oq|oqe|oque)\b/g, "o que")
  .replace(/\b(pq|pk)\b/g, "porque")
  .replace(/\b(oara|pra|praa)\b/g, "para")
  .replace(/\b(tbm|tb|tmb)\b/g, "tambem")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const giro = {};
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

/* ---------- Catálogo rico por gênero: Filmes, Músicas e Séries ---------- */
const FILMES_GENERO = {
  drama: [
    "Um Sonho de Liberdade (1994) — amizade e esperança dentro de uma prisão.",
    "À Espera de um Milagre (1999) — drama emocionante com realismo mágico.",
    "A Lista de Schindler (1993) — história real impactante da 2ª Guerra.",
    "À Procura da Felicidade (2006) — superação baseada em fatos reais.",
    "O Pianista (2002) — sobrevivência através da música.",
    "Clube da Luta (1999) — drama psicológico sobre identidade e sociedade.",
    "Central do Brasil (1998) — clássico nacional premiado e tocante.",
    "Parasita (2019) — drama social afiado cheio de reviravoltas."
  ],
  aventura: [
    "Interestelar (2014) — viagem espacial para salvar a humanidade.",
    "O Senhor dos Anéis: A Sociedade do Anel (2001) — épico de fantasia.",
    "Piratas do Caribe: A Maldição do Pérola Negra (2003) — aventura divertida.",
    "Indiana Jones e os Caçadores da Arca Perdida (1981) — clássico absoluto.",
    "Jurassic Park (1993) — parque de dinossauros que sai do controle.",
    "Duna: Parte Dois (2024) — aventura épica de ficção científica.",
    "Avatar (2009) — expedição visual em outro planeta.",
    "A Vida Secreta de Walter Mitty (2013) — jornada inspiradora pelo mundo."
  ],
  acao: [
    "Batman: O Cavaleiro das Trevas (2008) — ação policial e vilão icônico.",
    "Mad Max: Estrada da Fúria (2015) — ritmo frenético do início ao fim.",
    "John Wick: De Volta ao Jogo (2014) — coreografias de ação precisas.",
    "Gladiador (2000) — épico de honra e arena na Roma Antiga.",
    "Top Gun: Maverick (2022) — ação aérea espetacular.",
    "Matrix (1999) — ação e ficção que mudou o cinema.",
    "Tropa de Elite (2007) — ação policial brasileira intensa.",
    "Missão: Impossível - Efeito Fallout (2018) — espionagem e adrenalina."
  ],
  terror: [
    "Invocação do Mal (2013) — terror sobrenatural clássico e bem dirigido.",
    "Corra! (2017) — terror psicológico inteligente e tenso.",
    "O Iluminado (1980) — suspense e terror psicológico atemporal.",
    "Hereditário (2018) — terror pesado e perturbador.",
    "Um Lugar Silencioso (2018) — tensão máxima onde qualquer som é fatal.",
    "O Chamado (2002) — mistério e sustos marcantes.",
    "Fale Comigo (2022) — terror moderno criativo e direto."
  ],
  suspense: [
    "Seven: Os Sete Crimes Capitais (1995) — investigação policial sombria.",
    "Ilha do Medo (2010) — mistério em um hospital psiquiátrico.",
    "Os Suspeitos / Prisoners (2013) — suspense denso sobre sequestro.",
    "Garota Exemplar (2014) — reviravoltas psicológicas sobre um desaparecimento.",
    "O Silêncio dos Inocentes (1991) — clássico policial e psicológico.",
    "Zodíaco (2007) — caçada obsessiva a um serial killer real."
  ],
  comedia: [
    "Se Beber, Não Case! (2009) — comédia caótica de amigos em Las Vegas.",
    "As Branquelas (2004) — clássico de comédia popular no Brasil.",
    "O Auto da Compadecida (2000) — obra-prima do humor brasileiro.",
    "Superbad (2007) — comédia adolescente muito engraçada.",
    "Minha Mãe é uma Peça (2013) — comédia nacional leve e certeira.",
    "Click (2006) — comédia que mistura humor com emoção."
  ],
  ficcao: [
    "A Origem / Inception (2010) — invasão de sonhos em camadas.",
    "Interestelar (2014) — relatividade, buracos negros e emoção.",
    "Blade Runner 2049 (2017) — ficção visual sobre o que nos torna humanos.",
    "A Chegada / Arrival (2016) — contato alienígena focado em linguagem.",
    "Ex Machina (2014) — suspense sobre inteligência artificial.",
    "De Volta para o Futuro (1985) — viagem no tempo clássica."
  ],
  romance: [
    "Questão de Tempo (2013) — romance leve sobre aproveitar a vida.",
    "Brilho Eterno de uma Mente Sem Lembranças (2004) — criativo e profundo.",
    "Antes do Amanhecer (1995) — diálogos naturais em uma noite em Viena.",
    "Orgulho e Preconceito (2005) — romance clássico de época.",
    "Como Eu Era Antes de Você (2016) — romance emocionante.",
    "La La Land (2016) — romance musical sobre sonhos e escolhas."
  ],
  animacao: [
    "Homem-Aranha no Aranhaverso (2018) — visual revolucionário e ótima história.",
    "A Viagem de Chihiro (2001) — fantasia mágica do Studio Ghibli.",
    "Divertida Mente (2015) — criativo e emocionante sobre nossas emoções.",
    "Wall-E (2008) — ficção científica encantadora com poucas falas.",
    "Viva: A Vida é uma Festa (2017) — música, família e memória.",
    "Gato de Botas 2: O Último Pedido (2022) — aventura surpreendentemente madura."
  ],
  brasileiro: [
    "Cidade de Deus (2002) — referência mundial do cinema brasileiro.",
    "O Auto da Compadecida (2000) — humor e cultura nordestina geniais.",
    "Central do Brasil (1998) — drama humano premiado.",
    "Tropa de Elite (2007) — ação e debate social.",
    "Que Horas Ela Volta? (2015) — drama cotidiano sensível e atual.",
    "Bacurau (2019) — mistura de faroeste, mistério e crítica social."
  ]
};

const MUSICAS_GENERO = {
  sertanejo: [
    "Chitãozinho & Xororó — Evidências (clássico obrigatório)",
    "Zezé Di Camargo & Luciano — É o Amor",
    "Marília Mendonça — Infiel / Leão",
    "Jorge & Mateus — Sosseguei / Logo Eu",
    "Henrique & Juliano — Cuida Bem Dela / Liberdade Provisória",
    "Ana Castela — Pipoco / Nosso Quadro",
    "Gusttavo Lima — Balada / Termina Comigo Antes"
  ],
  mpb: [
    "Tim Maia — Gostava Tanto de Você",
    "Djavan — Oceano / Flor de Lis",
    "Chico Buarque — Construção",
    "Elis Regina & Tom Jobim — Águas de Março",
    "Marisa Monte — Ainda Bem",
    "Seu Jorge — Burguesinha",
    "Caetano Veloso — Sozinho"
  ],
  rock: [
    "Legião Urbana — Tempo Perdido",
    "Charlie Brown Jr. — Dias de Luta, Dias de Glória",
    "Skank — Vou Deixar",
    "Capital Inicial — Primeiros Erros",
    "Os Paralamas do Sucesso — Lanterna dos Afogados",
    "Cazuza — Exagerado",
    "Linkin Park — Numb / In The End (internacional)"
  ],
  rap: [
    "Racionais MC's — Vida Loka (Parte 1) / Negro Drama",
    "Sabotage — Um Bom Lugar",
    "Emicida — AmarElo",
    "Criolo — Não Existe Amor em SP",
    "Djonga — Olho de Tigre",
    "Matuê — Máquina do Tempo",
    "Racionais MC's — Capítulo 4, Versículo 3"
  ],
  samba: [
    "Cartola — As Rosas Não Falam",
    "Jorge Aragão — Coisa de Pele",
    "Zeca Pagodinho — Deixa a Vida Me Levar",
    "Exaltasamba — Tá Vendo Aquela Lua",
    "Raça Negra — Cheia de Manias",
    "Menos é Mais — Lapada Dela / Melhor Eu Ir",
    "Thiaguinho — Ousadia & Alegria"
  ],
  funk: [
    "MC Kevinho — Olha a Explosão",
    "Ludmilla — Favela Chegou",
    "Anitta — Vai Malandra / Envolver",
    "MC Hariel — Maçã Verde",
    "Pedro Sampaio — Dançarina",
    "MC Poze do Rodo — Vida Louca"
  ],
  pop: [
    "Jão — Idiota / Me Lambe",
    "Luísa Sonza — Chico / Penhasco",
    "Iza — Pesadão / Dona de Mim",
    "Anavitória — Trevo (Tu)",
    "The Weeknd — Blinding Lights (internacional)",
    "Dua Lipa — Levitating (internacional)"
  ],
  eletronica: [
    "Alok — Hear Me Now",
    "Vintage Culture — Hollywood",
    "Avicii — Wake Me Up",
    "Calvin Harris — Summer",
    "Daft Punk — Get Lucky / Instant Crush"
  ]
};

const SERIES_GENERO = {
  geral: [
    "Breaking Bad — professor vira mestre do crime em um drama impecável.",
    "Stranger Things — mistério, nostalgia dos anos 80 e ficção.",
    "Dark — ficção científica alemã genial sobre viagem no tempo.",
    "The Last of Us — drama pós-apocalíptico fiel e emocionante.",
    "Round 6 — suspense intenso de sobrevivência.",
    "La Casa de Papel — assalto planejado em ritmo acelerado.",
    "The Boys — sátira ácida e violenta sobre super-heróis.",
    "Brooklyn Nine-Nine — comédia policial leve e rápida."
  ]
};

/* ---------- Base de Conhecimento Prático & Comparações (Dados Locais) ---------- */
const COMPARACOES = {
  "javascript|python": "⚖️ **JavaScript vs Python:**\n• **JavaScript:** roda nativo no navegador, domina sites/front-end e apps web (React, Node.js). Sintaxe com `{}`.\n• **Python:** leitura mais limpa por indentação, domina ciência de dados, IA, automação e back-end.\n👉 **Resumo:** quer criar sites/apps web? Comece por JS. Quer dados/automação/IA? Comece por Python.",
  "html|css": "⚖️ **HTML vs CSS:**\n• **HTML** é a estrutura (ossos e paredes da página: títulos, botões, textos).\n• **CSS** é a aparência (cores, fontes, tamanhos, alinhamento e animações).\n👉 Eles trabalham juntos em toda página web.",
  "ssd|hd": "⚖️ **SSD vs HD:**\n• **HD:** disco magnético mecânico; mais barato por GB, porém bem mais lento e sensível a quedas.\n• **SSD:** memória flash eletrônica; liga o sistema e abre programas muito mais rápido e sem barulho.\n👉 Hoje, vale sempre usar SSD pelo menos para o sistema operacional.",
  "ram|armazenamento|hd|ssd|rom": "⚖️ **RAM vs Armazenamento (SSD/HD):**\n• **RAM:** memória rápida e temporária para o que está aberto *agora* (apaga ao desligar).\n• **Armazenamento (SSD/HD):** guarda seus arquivos e apps de forma permanente.",
  "alcool|etanol|gasolina": "⚖️ **Etanol (álcool) vs Gasolina:**\n• Regra prática no Brasil: divida o **preço do etanol pelo preço da gasolina**.\n• Se der **até 0,70** (70%), o etanol costuma compensar; acima disso, a gasolina geralmente rende mais por real gasto (varia conforme o consumo do carro).",
  "debito|credito": "⚖️ **Débito vs Crédito:**\n• **Débito:** sai na hora da conta; evita dívidas e ajuda a controlar gastos.\n• **Crédito:** concentra para a fatura futura e permite parcelar ou ganhar pontos/cashback — mas exige pagar o valor total em dia para fugir dos juros altos.",
  "sql|nosql": "⚖️ **SQL vs NoSQL:**\n• **SQL** (PostgreSQL, MySQL, SQLite): tabelas fixas, relações fortes e transações seguras.\n• **NoSQL** (MongoDB, Redis): documentos flexíveis ou chave-valor, ótimo para escala e estruturas variáveis."
};

const CONHECIMENTO_PRATICO = [
  [/\b(produtividade|foco|procrastin|estudar melhor|como estudar|concentr)\b/,
   "🎯 **Técnicas práticas para estudar e focar melhor:**\n1. **Pomodoro:** 25 min focado sem celular + 5 min de pausa (a cada 4 blocos, 15 min).\n2. **Estudo ativo:** em vez de só reler, explique o assunto em voz alta ou resolva questões.\n3. **Regra dos 2 minutos:** se a tarefa demora menos de 2 min, faça agora.\n4. **Quebre metas grandes:** transforme “estudar matemática” em “fazer 5 exercícios de fração hoje”."],
  [/\b(50 30 20|organizar dinheiro|economizar|orcamento|educacao financeira|guardar dinheiro)\b/,
   "💰 **Método 50-30-20 para organizar o dinheiro:**\n• **50%** para necessidades (moradia, contas básicas, mercado, transporte).\n• **30%** para desejos (lazer, saídas, streamings, compras pessoais).\n• **20%** para reserva de emergência e investimentos.\n💡 Dica: antes de investir, monte uma reserva de emergência equivalente a 3 a 6 meses dos seus custos fixos."],
  [/\b(redacao|enem|dissertacao|escrever bem)\b/,
   "✍️ **Estrutura de Redação Dissertativa (estilo ENEM):**\n1. **Introdução:** contextualize o tema + apresente sua tese (ponto de vista) com 2 argumentos.\n2. **Desenvolvimento 1:** defenda o 1º argumento com repertório (dado, fato histórico, citação).\n3. **Desenvolvimento 2:** defenda o 2º argumento explicando causas/consequências.\n4. **Conclusão (Proposta de Intervenção):** responda **Quem** faz, **O quê**, **Como** (meio), **Para quê** (finalidade) e **Detalhamento**."],
  [/\b(curriculo|entrevista|emprego|trabalho)\b/,
   "💼 **Dicas rápidas para Currículo e Entrevista:**\n• **Currículo:** máximo 1–2 páginas, objetivo claro, experiências da mais recente para a mais antiga com **resultados práticos** (ex.: “reduzi o tempo de atendimento em 20%”).\n• **Entrevista:** pesquise sobre a empresa antes, prepare exemplos reais usando o método **STAR** (Situação, Tarefa, Ação, Resultado) e tenha 2 perguntas inteligentes para fazer no final."],
  [/\b(direito consumidor|procon|arrependimento|troca|garantia|reembolso)\b/,
   "⚖️ **Direitos básicos do consumidor no Brasil (CDC):**\n• **Compras online/fora da loja:** você tem **7 dias corridos** a partir do recebimento para desistir e pedir reembolso integral (direito de arrependimento, art. 49).\n• **Defeito em produto:** 30 dias de garantia legal para não duráveis e 90 dias para duráveis (além da garantia do fabricante).\n• **Cobrança indevida paga:** direito à devolução em dobro do que foi pago em excesso (salvo engano justificável)."]
];

/* ---------- Busca ao vivo de séries (TVmaze API - CORS livre) ---------- */
async function buscarSeriesTVMaze(termo) {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), 8000);
  try {
    const r = await fetch("https://api.tvmaze.com/search/shows?q=" + encodeURIComponent(termo), { signal: c.signal });
    if (!r.ok) return null;
    const arr = await r.json();
    if (!Array.isArray(arr) || !arr.length) return null;
    const linhas = arr.slice(0, 6).map((item, i) => {
      const s = item.show;
      const ano = s.premiered ? " (" + s.premiered.slice(0, 4) + ")" : "";
      const nota = s.rating?.average ? " • Nota " + s.rating.average : "";
      const gens = (s.genres || []).slice(0, 3).join(", ");
      return (i + 1) + ". " + s.name + ano + nota + (gens ? " — " + gens : "");
    });
    return {
      texto: "📺 **Séries encontradas para “" + termo + "”:**\n\n" + linhas.join("\n") + "\n\n💡 Quer saber a sinopse de alguma? Diga: “pesquise sobre [nome da série]”.",
      origem: "📺 catálogo de séries"
    };
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

/* ---------- Gerador de Conteúdo & Resposta Contextual ---------- */
function gerarEscrita(t, raw) {
  const mEmail = raw.match(/(?:escrev[ae]|faz|faca|crie|cria|monte|monta|redija)\s+(?:um\s+|uma\s+)?(e-?mail|mensagem|carta|aviso|convite|texto|redacao|historia|conto|legenda|bio|poema|roteiro)\s*(?:sobre|de|para|com o tema)?\s*(.+)?/i);
  if (!mEmail) return null;

  const tipo = norm(mEmail[1]);
  const assunto = (mEmail[2] || "o assunto pedido").replace(/[?!.]+$/, "").trim();

  if (/email|carta/.test(tipo)) {
    return "✉️ **Rascunho de E-mail sobre “" + assunto + "”:**\n\n" +
      "**Assunto:** " + assunto.charAt(0).toUpperCase() + assunto.slice(1) + "\n\n" +
      "Olá, [Nome],\n\n" +
      "Espero que esteja tudo bem com você.\n\n" +
      "Escrevo para tratar sobre **" + assunto + "**. Gostaria de alinhar os próximos passos e confirmar sua disponibilidade para avaliarmos os detalhes.\n\n" +
      "Fico à disposição caso precise de mais alguma informação.\n\n" +
      "Atenciosamente,\n[Seu Nome]";
  }
  if (/mensagem|aviso|convite/.test(tipo)) {
    return "💬 **Modelo de Mensagem sobre “" + assunto + "”:**\n\n" +
      "Oi, [Nome]! Tudo bem? 😊\n" +
      "Estou passando para falar sobre **" + assunto + "**. Quando puder, me dá um retorno para combinarmos certinho. Valeu!";
  }
  if (/legenda|bio/.test(tipo)) {
    return "✨ **Opções de Legenda/Bio sobre “" + assunto + "”:**\n\n" +
      "1. \"Construindo um passo de cada vez em direção ao que importa. 🚀 (" + assunto + ")\"\n" +
      "2. \"Foco no processo, constância no resultado. ✨ #" + assunto.replace(/\s+/g, "") + "\"\n" +
      "3. \"Sobre hoje: " + assunto + " — simples, direto e real.\"";
  }
  if (/redacao/.test(tipo)) {
    return "📝 **Esqueleto de Redação sobre “" + assunto + "”:**\n\n" +
      "• **Introdução:** Apresente a importância atual de **" + assunto + "** no Brasil/mundo e defenda a tese de que é necessário agir com informação e planejamento.\n" +
      "• **Desenvolvimento 1 (Causas):** Explique o que provoca os desafios ligados a " + assunto + " (falta de acesso, desinformação ou infraestrutura).\n" +
      "• **Desenvolvimento 2 (Impactos):** Mostre como isso afeta o cotidiano das pessoas e a sociedade.\n" +
      "• **Conclusão:** Proponha uma ação concreta indicando quem deve agir (Estado/escolas/sociedade), como fazer e o efeito positivo esperado.";
  }
  if (/historia|conto|roteiro/.test(tipo)) {
    return "📖 **História curta — “" + assunto + "”:**\n\n" +
      "Tudo começou em uma tarde comum, quando um pequeno detalhe sobre **" + assunto + "** chamou a atenção de quem menos esperava. " +
      "No início parecia só mais uma rotina repetida, mas cada pista levava a uma escolha difícil: continuar no caminho seguro ou arriscar descobrir a verdade.\n\n" +
      "Depois de testar hipóteses e enfrentar um contratempo inesperado, a solução não veio de algo grandioso, mas de observar com calma o que sempre esteve ali. " +
      "No fim, **" + assunto + "** mudou para sempre a forma como aquela jornada era vista.\n\n💡 Quer que eu mude o clima (suspense, comédia ou ação) ou continue a história?";
  }
  return null;
}

function detectarGeneroFilme(t) {
  if (/drama|triste|emocion/.test(t)) return ["drama", "Drama"];
  if (/aventura|epico|viagem/.test(t)) return ["aventura", "Aventura"];
  if (/acao|luta|tiro|adrenalina/.test(t)) return ["acao", "Ação"];
  if (/terror|medo|susto|horror/.test(t)) return ["terror", "Terror"];
  if (/suspense|misterio|policial|investigacao/.test(t)) return ["suspense", "Suspense"];
  if (/comedia|engracado|humor|rir/.test(t)) return ["comedia", "Comédia"];
  if (/ficcao|espaco|futuro|sci fi/.test(t)) return ["ficcao", "Ficção Científica"];
  if (/romance|amor|casal/.test(t)) return ["romance", "Romance"];
  if (/animacao|desenho|infantil/.test(t)) return ["animacao", "Animação"];
  if (/brasileir|nacional/.test(t)) return ["brasileiro", "Cinema Brasileiro"];
  return null;
}

function detectarGeneroMusica(t) {
  if (/sertanejo|modao|sofr/.test(t)) return ["sertanejo", "Sertanejo"];
  if (/mpb|classico brasileiro|bossa/.test(t)) return ["mpb", "MPB"];
  if (/rock/.test(t)) return ["rock", "Rock"];
  if (/rap|hip hop|trap/.test(t)) return ["rap", "Rap / Hip-Hop"];
  if (/samba|pagode/.test(t)) return ["samba", "Samba / Pagode"];
  if (/funk/.test(t)) return ["funk", "Funk"];
  if (/pop/.test(t)) return ["pop", "Pop"];
  if (/eletronica|dj|edm/.test(t)) return ["eletronica", "Eletrônica"];
  return null;
}

async function responder(raw, ctx = {}) {
  const t = norm(raw);
  if (!t) return null;

  // 1) Perguntas sobre a própria BACH (cobrindo variações como "vc serve para que?")
  if (/\b(voce|bach)\b/.test(t) && /\b(serve|servir|presta|funciona|faz|utilidade|objetivo|capacidade)\b/.test(t)) {
    return {
      texto: "Eu sou a **BACH AI** 🧠! Sirvo para ser sua assistente completa no dia a dia:\n\n" +
        "• **Conversar e lembrar:** guardo seu nome, gostos, notas (`lembre:`) e o que você me ensina (`ensine: pergunta => resposta`).\n" +
        "• **Ler fotos, prints e vídeos:** analiso cores, dimensões e leio textos de imagens (mesmo em modo escuro).\n" +
        "• **Programar e revisar:** explico linguagens, reviso códigos colados e gero modelos prontos para copiar.\n" +
        "• **Pesquisar e traduzir:** busco na internet, traduzo em vários idiomas e consulto o clima.\n" +
        "• **Escrever, calcular e jogar:** monto textos/e-mails, resolvo contas, converto unidades e jogo com você!",
      origem: "🧠 sobre a BACH"
    };
  }

  // 2) Feedback de erro / correção natural ("nao foi oque eu perguntei", "vc falou errado", "ta errando vc hein", "te corrigir")
  if (/\b(nao foi|nao era|falou errado|disse errado|respondeu errado|entendeu errado|errando|ta errado|esta errado|nao e isso|nada a ver)\b/.test(t) ||
      /^(te |quero |vou )?(corrigir|arrumar|ensinar)$/.test(t)) {
    return {
      texto: girar("fb-err", [
        "Desculpa por errar nessa! 😅 Para me corrigir na hora, use:\n**corrija: sua pergunta => resposta certa**\n\nOu me diga com outras palavras o que você queria que eu tento de novo!",
        "Entendi, errei o alvo aí! 🔍 Pode me dizer o que você queria saber de forma direta, ou me ensinar usando:\n**ensine: pergunta => resposta**"
      ]),
      origem: "🔄 autocorreção"
    };
  }

  // 3) Pergunta curta dependente de contexto ("para que serve?", "ele faz oq?", "como funciona?")
  if (/^(para que serve|pra que serve|serve para que|serve pra que|ele faz o que|ela faz o que|isso faz o que|como isso funciona|como funciona|me da um exemplo|da um exemplo)$/.test(t)) {
    if (ctx.ultimoArquivo?.texto) {
      return { usarMenteTexto: true };
    }
    if (ctx.ultimoTema) {
      return { pesquisarTema: ctx.ultimoTema + " para que serve como funciona" };
    }
    return {
      texto: "Para que serve o quê exatamente? 😊 Cole um código/texto aqui ou me diga o nome do assunto que eu explico!",
      origem: "🧠 contexto"
    };
  }

  // 4) Recomendações inteligentes por gênero (filmes, músicas sem precisar dizer "música", séries ao vivo)
  const pedeRec = /\b(recomenda\w*|indica\w*|suger\w*|lista\w*|melhores|bons|boas|quero assistir|quero ouvir|procura)\b/.test(t);
  const genMusica = detectarGeneroMusica(t);
  if (genMusica && (pedeRec || t.split(" ").length <= 4)) {
    const [key, nome] = genMusica;
    return {
      texto: "🎶 **Recomendações de " + nome + ":**\n\n" +
        MUSICAS_GENERO[key].map((m, i) => (i + 1) + ". " + m).join("\n") +
        "\n\n💡 Quer outro estilo (sertanejo, MPB, rock, rap, samba/pagode, funk, pop, eletrônica)?",
      origem: "🎵 recomendações"
    };
  }

  const genFilme = detectarGeneroFilme(t);
  if (/\b(filme|filmes)\b/.test(t) && (pedeRec || genFilme)) {
    if (genFilme) {
      const [key, nome] = genFilme;
      return {
        texto: "🎬 **Filmes recomendados de " + nome + ":**\n\n" +
          FILMES_GENERO[key].map((f, i) => (i + 1) + ". " + f).join("\n") +
          "\n\n💡 Quer saber a sinopse de algum ou recomendações de outro gênero?",
        origem: "🎬 recomendações"
      };
    }
  }

  if (/\b(serie|series)\b/.test(t) && pedeRec) {
    const termoLimpo = t.replace(/\b(me|recomenda\w*|indica\w*|suger\w*|uma|umas|serie|series|boas|bons|de|para|assistir)\b/g, "").trim();
    if (termoLimpo.length >= 3) {
      const tv = await buscarSeriesTVMaze(termoLimpo);
      if (tv) return tv;
    }
    return {
      texto: "📺 **Séries muito recomendadas:**\n\n" +
        SERIES_GENERO.geral.map((s, i) => (i + 1) + ". " + s).join("\n") +
        "\n\n💡 Diga o nome de uma série ou gênero (ex.: “séries de crime”) que eu busco mais!",
      origem: "📺 recomendações"
    };
  }

  // 5) Comparações ("diferença entre X e Y", "X vs Y", "qual é melhor X ou Y")
  const mComp = t.match(/(?:diferenca entre|compar\w* entre|pros e contras de|vantagens e desvantagens de)\s+(.+?)\s+e\s+(.+)/) ||
                t.match(/^(.+?)\s+(?:vs|versus)\s+(.+)$/);
  if (mComp) {
    const a = mComp[1].trim(), b = mComp[2].trim();
    for (const [chaves, resp] of Object.entries(COMPARACOES)) {
      const partes = chaves.split("|");
      if (partes.some(p => a.includes(p)) && partes.some(p => b.includes(p))) {
        return { texto: resp, origem: "⚖️ comparação" };
      }
    }
  }

  // 6) Base de conhecimento prático (estudos, finanças, redação, currículo, consumidor)
  for (const [re, resp] of CONHECIMENTO_PRATICO) {
    if (re.test(t)) return { texto: resp, origem: "📚 conhecimento prático" };
  }

  // 7) Planos de estudo / rotina / aprendizado passo a passo
  const mPlano = t.match(/^(?:cria|crie|faz|faca|monta|monte|me ajuda a)?\s*(?:um\s+)?(?:plano de estudos|roteiro de estudos|como aprender|passo a passo para aprender)\s+(?:de\s+|para\s+)?(.+)$/);
  if (mPlano) {
    const temaEstudo = mPlano[1].trim();
    return {
      texto: "🗺️ **Plano prático para aprender " + temaEstudo + ":**\n\n" +
        "1. **Base (Semana 1):** entenda os conceitos fundamentais e o vocabulário principal de " + temaEstudo + ".\n" +
        "2. **Prática guiada (Semana 2):** faça exercícios curtos todo dia (25–40 min) sem tentar decorar tudo de uma vez.\n" +
        "3. **Projeto real (Semana 3):** crie algo pequeno aplicando " + temaEstudo + " na prática.\n" +
        "4. **Revisão e erros (Semana 4):** revise onde travou e explique o conteúdo com suas próprias palavras.\n\n" +
        "💡 Quer que eu pesquise os conceitos principais de “" + temaEstudo + "” agora?",
      origem: "🗺️ planejamento"
    };
  }

  // 8) Geração de textos, e-mails, mensagens, redações e histórias
  const escrita = gerarEscrita(t, raw);
  if (escrita) return { texto: escrita, origem: "✍️ escrita criativa" };

  return null;
}

export const CerebroAvancado = { responder };
