/* BACH AI 5.5 - CÉREBRO AVANÇADO BLINDADO
   - NLU natural com tratamento rico de citações (↩ Responder), inclusive explicações e cópia de blocos.
   - Responde dilemas, escolhas ("X ou Y?") e perguntas conversacionais abertas sem vazar para pesquisa na web.
   - Evita falsas trocas de tema visual ("tema da conversa", "cor do céu", etc.).
   - Facilita reenvio/cópia de código recente sem cortar blocos com crases internas. */

import { AutoGuard } from "./autoguard.js?v=2";

const BT = "\x60\x60\x60";

const norm = t => String(t || "").slice(0, 1200).toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\bqm\b/g, "quem")
  .replace(/\b(vc|vce|vv|oc|oce)\b/g, "voce")
  .replace(/\b(oq|oqe|oque)\b/g, "o que")
  .replace(/\b(pq|pk)\b/g, "porque")
  .replace(/\b(oara|pra|praa)\b/g, "para")
  .replace(/\b(cmg)\b/g, "comigo")
  .replace(/\b(entt)\b/g, "entao")
  .replace(/\b(msc)\b/g, "musica")
  .replace(/\b(sla)\b/g, "sei la")
  .replace(/\b(rlx)\b/g, "relaxa")
  .replace(/\b(nmrl)\b/g, "na moral")
  .replace(/\b(jaja)\b/g, "ja ja")
  .replace(/\bnd\b/g, "nada")
  .replace(/\bq\b/g, "que")
  .replace(/\b(tlvz)\b/g, "talvez")
  .replace(/\b(tbm|tb|tmb)\b/g, "tambem")
  .replace(/\b(msm)\b/g, "mesmo")
  .replace(/\b(cvs)\b/g, "conversar")
  .replace(/\b(dnv)\b/g, "de novo")
  .replace(/\bss+\b/g, "sim")
  .replace(/\beai+\b/g, "e ai")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const giro = Object.create(null);
const girar = (k, arr) => { giro[k] = ((giro[k] ?? -1) + 1) % arr.length; return arr[giro[k]]; };

function semRepetir(k, arr, ctx = {}) {
  const ultimasBot = (Array.isArray(ctx.history) ? ctx.history : [])
    .filter(m => m && m.type !== "user" && m.text)
    .slice(-14)
    .map(m => String(m.text).trim());
  for (let i = 0; i < arr.length; i++) {
    const cand = girar(k, arr);
    if (!ultimasBot.includes(cand.trim())) return cand;
  }
  return girar(k, arr);
}

function ehEntradaSensivel(texto) {
  const s = String(texto || "").trim();
  return /^\/(?:adm|admsenha|ghconfig|chave)\b/i.test(s) || /@rizik2442/i.test(s);
}

function senhaRapida(n = 14) {
  const tam = Math.min(64, Math.max(8, Number(n) || 14));
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-+=";
  let out = "";
  for (let i = 0; i < tam; i++) {
    let idx = Math.floor(Math.random() * chars.length);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      idx = a[0] % chars.length;
    }
    out += chars[idx];
  }
  return "🔐 **Senha forte gerada (" + tam + " caracteres):**\n\n`" + out + "`\n\nℹ️ Gerada localmente no seu aparelho (não salvo senhas).";
}

const FILMES_GENERO = {
  drama: [
    "Um Sonho de Liberdade (1994) — amizade e esperança dentro de uma prisão.",
    "À Espera de um Milagre (1999) — drama emocionante com realismo mágico.",
    "A Lista de Schindler (1993) — história real impactante da 2ª Guerra.",
    "À Procura da Felicidade (2006) — superação baseada em fatos reais.",
    "O Pianista (2002) — sobrevivência através da música.",
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
    "Avatar (2009) — expedição visual em outro planeta."
  ],
  acao: [
    "Batman: O Cavaleiro das Trevas (2008) — ação policial e vilão icônico.",
    "Mad Max: Estrada da Fúria (2015) — ritmo frenético do início ao fim.",
    "John Wick: De Volta ao Jogo (2014) — coreografias de ação precisas.",
    "Gladiador (2000) — épico de honra e arena na Roma Antiga.",
    "Top Gun: Maverick (2022) — ação aérea espetacular.",
    "Matrix (1999) — ação e ficção que mudou o cinema.",
    "Tropa de Elite (2007) — ação policial brasileira intensa."
  ],
  terror: [
    "Invocação do Mal (2013) — terror sobrenatural clássico.",
    "Corra! (2017) — terror psicológico inteligente e tenso.",
    "O Iluminado (1980) — suspense e terror psicológico atemporal.",
    "Hereditário (2018) — terror pesado e perturbador.",
    "Um Lugar Silencioso (2018) — tensão onde qualquer som é fatal.",
    "Fale Comigo (2022) — terror moderno criativo."
  ],
  suspense: [
    "Seven: Os Sete Crimes Capitais (1995) — investigação policial sombria.",
    "Ilha do Medo (2010) — mistério em um hospital psiquiátrico.",
    "Os Suspeitos / Prisoners (2013) — suspense denso sobre sequestro.",
    "Garota Exemplar (2014) — reviravoltas sobre um desaparecimento.",
    "O Silêncio dos Inocentes (1991) — clássico policial e psicológico."
  ],
  comedia: [
    "Se Beber, Não Case! (2009) — comédia caótica de amigos em Las Vegas.",
    "As Branquelas (2004) — clássico de comédia popular no Brasil.",
    "O Auto da Compadecida (2000) — obra-prima do humor brasileiro.",
    "Minha Mãe é uma Peça (2013) — comédia nacional leve e certeira.",
    "Click (2006) — comédia com emoção."
  ],
  ficcao: [
    "A Origem / Inception (2010) — invasão de sonhos em camadas.",
    "Interestelar (2014) — relatividade, buracos negros e emoção.",
    "Blade Runner 2049 (2017) — ficção visual sobre humanidade.",
    "A Chegada / Arrival (2016) — contato alienígena e linguagem.",
    "Ex Machina (2014) — suspense sobre inteligência artificial."
  ],
  romance: [
    "Questão de Tempo (2013) — romance leve sobre aproveitar a vida.",
    "Brilho Eterno de uma Mente Sem Lembranças (2004) — criativo e profundo.",
    "Orgulho e Preconceito (2005) — romance clássico de época.",
    "Como Eu Era Antes de Você (2016) — romance emocionante.",
    "La La Land (2016) — romance musical sobre sonhos."
  ],
  animacao: [
    "Homem-Aranha no Aranhaverso (2018) — visual e história incríveis.",
    "A Viagem de Chihiro (2001) — fantasia mágica do Studio Ghibli.",
    "Divertida Mente (2015) — criativo sobre nossas emoções.",
    "Wall-E (2008) — ficção científica encantadora.",
    "Gato de Botas 2: O Último Pedido (2022) — aventura surpreendente."
  ],
  brasileiro: [
    "Cidade de Deus (2002) — referência mundial do cinema brasileiro.",
    "O Auto da Compadecida (2000) — humor e cultura nordestina geniais.",
    "Central do Brasil (1998) — drama humano premiado.",
    "Tropa de Elite (2007) — ação e debate social.",
    "Bacurau (2019) — faroeste, mistério e crítica social."
  ]
};

const MUSICAS_GENERO = {
  sertanejo: [
    "Chitãozinho & Xororó — Evidências",
    "Zezé Di Camargo & Luciano — É o Amor",
    "Marília Mendonça — Infiel / Leão",
    "Jorge & Mateus — Sosseguei / Logo Eu",
    "Henrique & Juliano — Cuida Bem Dela / Liberdade Provisória",
    "Ana Castela — Nosso Quadro"
  ],
  mpb: [
    "Tim Maia — Gostava Tanto de Você",
    "Djavan — Oceano / Flor de Lis",
    "Chico Buarque — Construção",
    "Elis Regina & Tom Jobim — Águas de Março",
    "Marisa Monte — Ainda Bem",
    "Seu Jorge — Burguesinha"
  ],
  rock: [
    "Legião Urbana — Tempo Perdido",
    "Charlie Brown Jr. — Dias de Luta, Dias de Glória",
    "Skank — Vou Deixar",
    "Capital Inicial — Primeiros Erros",
    "Os Paralamas do Sucesso — Lanterna dos Afogados",
    "Linkin Park — Numb / In The End"
  ],
  rap: [
    "Racionais MC's — Vida Loka (Parte 1) / Negro Drama",
    "Sabotage — Um Bom Lugar",
    "Emicida — AmarElo",
    "Criolo — Não Existe Amor em SP",
    "Djonga — Olho de Tigre",
    "Matuê — Máquina do Tempo"
  ],
  samba: [
    "Cartola — As Rosas Não Falam",
    "Jorge Aragão — Coisa de Pele",
    "Zeca Pagodinho — Deixa a Vida Me Levar",
    "Exaltasamba — Tá Vendo Aquela Lua",
    "Menos é Mais — Lapada Dela / Melhor Eu Ir"
  ],
  funk: [
    "MC Kevinho — Olha a Explosão",
    "Ludmilla — Favela Chegou",
    "Anitta — Vai Malandra / Envolver",
    "MC Hariel — Maçã Verde",
    "Pedro Sampaio — Dançarina"
  ],
  pop: [
    "Jão — Idiota / Me Lambe",
    "Luísa Sonza — Chico / Penhasco",
    "Iza — Pesadão / Dona de Mim",
    "Anavitória — Trevo (Tu)",
    "The Weeknd — Blinding Lights"
  ],
  eletronica: [
    "Alok — Hear Me Now",
    "Vintage Culture — Hollywood",
    "Avicii — Wake Me Up",
    "Daft Punk — Get Lucky / Instant Crush"
  ]
};

const SERIES_GERAL = [
  "Breaking Bad — professor vira mestre do crime em um drama impecável.",
  "Stranger Things — mistério, nostalgia dos anos 80 e ficção.",
  "Dark — ficção científica alemã genial sobre viagem no tempo.",
  "The Last of Us — drama pós-apocalíptico emocionante.",
  "Round 6 — suspense intenso de sobrevivência.",
  "The Boys — sátira ácida sobre super-heróis.",
  "Brooklyn Nine-Nine — comédia policial leve e rápida."
];

const COMPARACOES = {
  "javascript|python": "⚖️ **JavaScript vs Python:**\n• **JavaScript:** roda nativo no navegador, domina sites e apps web (React, Node.js).\n• **Python:** leitura mais limpa, domina dados, IA e automação.\n👉 Quer criar sites? Comece por JS. Quer dados/IA? Python.",
  "html|css": "⚖️ **HTML vs CSS:**\n• **HTML** é a estrutura (títulos, textos, botões).\n• **CSS** é o visual (cores, tamanhos, animações).\n👉 Trabalham juntos em toda página web.",
  "ssd|hd": "⚖️ **SSD vs HD:**\n• **HD:** disco mecânico; mais barato, porém lento.\n• **SSD:** memória flash; muito mais rápido e silencioso.",
  "alcool|etanol|gasolina": "⚖️ **Etanol vs Gasolina:**\nDivida o preço do etanol pelo da gasolina. Se der **até 0,70**, o etanol costuma compensar.",
  "debito|credito": "⚖️ **Débito vs Crédito:**\n• **Débito:** sai na hora e evita dívida.\n• **Crédito:** concentra na fatura e parcela, mas exige pagar em dia para fugir de juros.",
  "android|iphone|ios": "⚖️ **Android vs iPhone:**\n• **Android:** mais liberdade de arquivos, variedade de preços, Termux e personalização.\n• **iPhone (iOS):** integração estável, câmera consistente e boa revenda — porém sistema mais fechado."
};

const CONHECIMENTO_PRATICO = [
  [/\b(dicas? de produtividade|como vencer a procrastin|procrastinacao|estudar melhor|como estudar|dicas? de foco|como ter foco|como me concentrar)\b/,
   "🎯 **Técnicas para focar e estudar melhor:**\n1. **Pomodoro:** 25 min focado + 5 min de pausa.\n2. **Estudo ativo:** explique o assunto em voz alta ou faça exercícios.\n3. **Regra dos 2 minutos:** se leva menos de 2 min, faça agora."],
  [/\b(50 30 20|organizar dinheiro|como economizar|orcamento pessoal|educacao financeira|como guardar dinheiro)\b/,
   "💰 **Método 50-30-20:**\n• **50%** necessidades essenciais.\n• **30%** lazer e desejos.\n• **20%** reserva de emergência e investimentos."],
  [/\b(como fazer(?: uma)? redacao|estrutura(?: da)? redacao|dicas? de redacao|modelo de dissertacao|como escrever bem)\b/,
   "✍️ **Estrutura de Redação (ENEM):**\n1. **Introdução:** tema + tese + 2 argumentos.\n2. **D1 e D2:** defenda os argumentos com repertório e consequências.\n3. **Conclusão:** Quem + O quê + Como + Para quê + Detalhamento."],
  [/\b(dicas? de curriculo|como fazer(?: um)? curriculo|dicas? de entrevista|preparar para entrevista|conseguir(?: um)? emprego|arrumar emprego|procurar emprego)\b/,
   "💼 **Dicas de Currículo e Entrevista:**\n• Currículo direto em 1–2 páginas destacando o que você resolveu na prática (não só lista de cargos).\n• Atualize LinkedIn/contatos avisando que está disponível.\n• Na entrevista use o método **STAR** (Situação, Tarefa, Ação, Resultado)."],
  [/\b(direitos? do consumidor|procon|direito de arrependimento|prazo(?: de)? garantia|reembolso compra online)\b/,
   "⚖️ **Direitos básicos (CDC Brasil):**\n• Compras online: **7 dias corridos** para devolução e reembolso total.\n• Defeito: 30 dias (não duráveis) ou 90 dias (duráveis) de garantia legal."],
  [/\b(fui demitido|mandado embora|direitos trabalhistas|acerto rescisao|seguro desemprego|aviso previo)\b.*\b(direito|direitos|receber|acerto|rescisao|fgts|quanto|o que fazer)\b/,
   "📋 **Checklist básico em caso de demissão sem justa causa (CLT Brasil):**\n• Saldo de salário dos dias trabalhados + aviso prévio (trabalhado ou indenizado)\n• 13º proporcional + férias vencidas/proporcionais + 1/3\n• Saque do FGTS + multa de 40% sobre o saldo\n• Guias para Seguro-Desemprego (se cumprir o tempo mínimo).\n*Prazo legal para pagamento da rescisão: até 10 dias corridos.*"]
];

function extrairSitesAvaliados(history) {
  const sites = [];
  for (const m of (Array.isArray(history) ? history : [])) {
    if (!m || m.type === "user" || !m.text) continue;
    const txt = String(m.text);
    if (!txt.includes("AVALIAÇÃO DO SITE:")) continue;
    const url = (txt.match(/AVALIAÇÃO DO SITE:\*\*\s*`([^`]+)`/) || [])[1];
    const nota = Number((txt.match(/\*\*Nota:\*\*\s*([\d.]+)\/10/) || [])[1] || 0);
    const ms = Number((txt.match(/\((\d+)\s*ms\)/) || [])[1] || 99999);
    const pal = Number((txt.match(/\((\d+)\s*palavras\)/) || [])[1] || 0);
    if (url) sites.push({ url, nota, ms, pal });
  }
  return sites;
}

function compararUltimosSites(history) {
  const sites = extrairSitesAvaliados(history);
  if (sites.length < 2) return null;
  const a = sites[sites.length - 2];
  const b = sites[sites.length - 1];
  const nome = u => { try { return new URL(u).hostname.replace(/^www\./, "") + new URL(u).pathname.slice(0, 22); } catch { return u.slice(0, 35); } };

  let veredito = "";
  if (a.nota !== b.nota) {
    const win = a.nota > b.nota ? a : b;
    veredito = "🏆 Pela nota técnica, **" + nome(win.url) + "** se saiu melhor (**" + win.nota + "/10**).";
  } else if (Math.abs(a.ms - b.ms) > 150) {
    const fast = a.ms < b.ms ? a : b;
    veredito = "⚖️ As duas tiraram **" + a.nota + "/10** na análise técnica, mas **" + nome(fast.url) + "** carregou mais rápido (**" + fast.ms + " ms** contra **" + Math.max(a.ms, b.ms) + " ms**).";
  } else {
    veredito = "⚖️ Empate técnico (**" + a.nota + "/10** nos dois critérios principais)!";
  }

  return "🔎 **Comparação entre os dois sites que você acabou de avaliar:**\n\n" +
    "1️⃣ **" + nome(a.url) + "** — Nota " + a.nota + "/10 • " + a.ms + " ms • " + a.pal + " palavras\n" +
    "2️⃣ **" + nome(b.url) + "** — Nota " + b.nota + "/10 • " + b.ms + " ms • " + b.pal + " palavras\n\n" +
    veredito + "\n\nℹ️ *Obs.: essa análise mede disponibilidade, HTTPS, velocidade e conteúdo visível da página — para avaliar a qualidade da IA em si, vale testar as respostas de cada uma!*";
}

function detectarAppRecente(history) {
  const h = Array.isArray(history) ? history : [];
  for (let i = h.length - 1; i >= Math.max(0, h.length - 12); i--) {
    const m = h[i];
    if (m && m.type !== "user" && m.text && /App criado completo \(`([^`]+)`\)/.test(m.text)) {
      return (m.text.match(/App criado completo \(`([^`]+)`\)/) || [])[1];
    }
  }
  return null;
}

function extrairUltimoCodigoDoHistorico(history) {
  const h = Array.isArray(history) ? history : [];
  for (let i = h.length - 1; i >= 0; i--) {
    const linhas = String(h[i]?.text || "").split(/\r?\n/);
    let inicio = -1, lang = "txt";
    for (let j = 0; j < linhas.length; j++) {
      const ln = linhas[j].trim();
      if (inicio < 0 && ln.startsWith(BT)) {
        inicio = j;
        lang = ln.slice(3).trim() || "txt";
      }
    }
    if (inicio >= 0) {
      let fim = -1;
      for (let j = linhas.length - 1; j > inicio; j--) {
        if (linhas[j].trim() === BT) { fim = j; break; }
      }
      if (fim > inicio + 1) {
        const code = linhas.slice(inicio + 1, fim).join("\n").trim();
        if (code.length > 15) return { lang, code };
      }
    }
  }
  return null;
}

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
      texto: "📺 **Séries encontradas para “" + termo + "”:**\n\n" + linhas.join("\n") + "\n\n💡 Quer a sinopse? Peça: “pesquise sobre [nome da série]”.",
      origem: "📺 catálogo de séries"
    };
  } catch { return null; }
  finally { clearTimeout(id); }
}

const TODOS_TEMAS = ["roxo", "vermelho", "azul", "verde", "rosa", "dourado", "neon"];

function detectarTemaPedido(t) {
  if (/^que tema o que$/.test(t)) return { ignora: true };
  if (/^(quais temas|temas|quais cores|mudar cor|trocar cor|mudar tema|trocar tema)$/.test(t)) {
    return { listar: true };
  }
  if (/^(?:muda|mudar|troca|trocar|escolhe|escolher)(?:\s+de)?\s+tema(?:\s+se\s+(?:voce\s+)?quiser|\s+aleatorio)?$/.test(t)) {
    return girar("auto-tema", TODOS_TEMAS);
  }
  if (/\b(significa|significado|por que|porque|qual e a cor|qual a cor|bandeira|arco iris|ceu|mar|sol|sangue|planta|redacao|conversa|poco|texto|assunto)\b/.test(t) &&
      !/\b(tema do site|tema do app|tema da tela|aparencia|interface)\b/.test(t)) {
    return null;
  }
  const pedeTema = /\b(tema|aparencia|visual|interface)\b/.test(t) ||
    /\b(?:muda|mudar|troca|trocar|coloca|colocar|bota|botar|deixa|deixar|ativa|ativar)\b.*\b(tema|cor|fundo|visual|tela)\b/.test(t) ||
    /\bcor\s+(?:do\s+site|da\s+tela|do\s+chat|do\s+fundo|para)\b/.test(t);
  if (!pedeTema) return null;

  if (/\bvermelh[oa]\b/.test(t)) return "vermelho";
  if (/\brox[oa]\b/.test(t)) return "roxo";
  if (/\bazul\b/.test(t)) return "azul";
  if (/\bverd[ea]\b/.test(t)) return "verde";
  if (/\brosa\b/.test(t)) return "rosa";
  if (/\bdourad[oa]|amarel[oa]|laranja\b/.test(t)) return "dourado";
  if (/\bneon|cyberpunk|colorid[oa]\b/.test(t)) return "neon";
  return null;
}
function gerarEscrita(t, raw) {
  const s = String(raw || "").slice(0, 800);
  const mEmail = s.match(/(?:escrev[ae]|faz|faca|crie|cria|monte|monta|redija)\s+(?:um\s+|uma\s+)?(e-?mail|mensagem|carta|aviso|convite|texto|redacao|historia|conto|legenda|bio|poema|roteiro)\s*(?:sobre|de|para|com o tema)?\s*(.+)?/i);
  if (!mEmail) return null;
  const tipo = norm(mEmail[1]);
  const assunto = (mEmail[2] || "o assunto pedido").replace(/[?!.]+$/, "").trim().slice(0, 120);

  if (/email|carta/.test(tipo)) {
    return "✉️ **Rascunho de E-mail sobre “" + assunto + "”:**\n\n" +
      "**Assunto:** " + assunto.charAt(0).toUpperCase() + assunto.slice(1) + "\n\n" +
      "Olá, [Nome],\n\nEspero que esteja tudo bem.\n\n" +
      "Escrevo para tratar sobre **" + assunto + "**. Gostaria de alinhar os próximos passos e confirmar sua disponibilidade.\n\n" +
      "Atenciosamente,\n[Seu Nome]";
  }
  if (/mensagem|aviso|convite/.test(tipo)) {
    return "💬 **Modelo de Mensagem sobre “" + assunto + "”:**\n\nOi, [Nome]! Tudo bem? 😊\nEstou passando para falar sobre **" + assunto + "**. Quando puder, me dá um retorno!";
  }
  if (/legenda|bio/.test(tipo)) {
    return "✨ **Legendas sobre “" + assunto + "”:**\n\n1. \"Um passo de cada vez em direção ao que importa. 🚀 (" + assunto + ")\"\n2. \"Foco no processo, constância no resultado. ✨\"";
  }
  if (/redacao/.test(tipo)) {
    return "📝 **Esqueleto de Redação sobre “" + assunto + "”:**\n\n• **Introdução:** contextualize **" + assunto + "** e apresente sua tese.\n• **D1:** causas do problema.\n• **D2:** impactos na sociedade.\n• **Conclusão:** proposta prática (Quem, O quê, Como e Para quê).";
  }
  if (/historia|conto|roteiro/.test(tipo)) {
    return "📖 **História curta — “" + assunto + "”:**\n\nTudo começou em uma tarde comum, quando um pequeno detalhe sobre **" + assunto + "** chamou a atenção. Cada pista levava a uma escolha difícil: seguir o seguro ou descobrir a verdade. No final, a resposta estava exatamente naquilo que ninguém havia observado antes.";
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

function responderSobreCitacao(t, raw, ctx) {
  const alvo = String(ctx.alvo || "").trim();
  if (!alvo) return null;
  const alvoNorm = norm(alvo);
  const nomeUser = ctx.nome ? ", " + ctx.nome : "";
  const trecho = alvo.replace(/\s+/g, " ").slice(0, 110);
  const retic = alvo.length > 110 ? "..." : "";

  if (/\b(copia|copiar|manda de novo|manda inteiro|codigo)\b/.test(t)) {
    return {
      texto: "Aqui está o trecho citado pronto para copiar em um toque:\n\n" + BT + "txt\n" + alvo + "\n" + BT,
      origem: "📋 cópia da mensagem citada"
    };
  }

  if (/\b(bach ai|criada por rizik|ajudar todo mundo de graca|memoria continua)\b/.test(alvoNorm)) {
    if (/\b(e isso e bom|isso e bom|e bom|presta|vale a pena|legal|top|massa)\b/.test(t)) {
      return {
        texto: "Eu acho bem forte sim" + nomeUser + " 😄 — o objetivo é você ter uma assistente própria gratuita, que lembra do papo inteiro, tem opinião, lê fotos/códigos e só pesquisa na web quando faz sentido. O que tá achando até agora?",
        origem: "💬 sobre a resposta citada"
      };
    }
    if (/\b(nao|ruim|fraco|falta|melhorar)\b/.test(t)) {
      return {
        texto: "Justo — crítica honesta ajuda mais que elogio vazio. O que exatamente você acha que tá faltando ou soando travado pra eu melhorar?",
        origem: "💬 sobre a resposta citada"
      };
    }
  }

  if (/\b(referente|sua resposta|sua pergunta|quando (?:eu )?digo|quando disse|eu disse isso|tava respondendo|estava respondendo|era resposta|foi resposta|respondi voce)\b/.test(t)) {
    if (/desculpa por ter pesquisado|o que voce esperava dessa mensagem|saiu do alvo|fugido do assunto/.test(alvoNorm)) {
      return {
        texto: "Ah, agora fechou o raciocínio! 😅 Você tava só respondendo à minha fala anterior, e eu saí pesquisando na internet sem precisar. Foi mal pela viajada — agora tô 100% no fio da conversa. Como tá sendo o seu dia" + nomeUser + "?",
        origem: "💬 sobre a resposta citada"
      };
    }
    return {
      texto: "Entendi" + nomeUser + " — você tá conectando isso direto com o que eu falei ali (**“" + trecho + retic + "”**). Pode seguir nessa linha que eu tô acompanhando!",
      origem: "💬 sobre a resposta citada"
    };
  }

  if (/^(?:e |mas )?(?:isso|isto|ele|ela)\s+(?:e|eh|ta|esta)?\s*(?:bom|boa|ruim|verdade|serio|certo|normal)$/.test(t) ||
      /^(?:serio|jura|mesmo|como assim|por que|porque|nao entendi|gostei|legal|daora|interessante|nao concordo|explica|discordo|verdade|concordo)$/.test(t) ||
      (/\b(isso|disso|nisso|essa parte|esse trecho|sua resposta|sua fala|vc disse|voce disse)\b/.test(t) && t.split(" ").length <= 16)) {
    if (/\b(bom|boa|legal|gostei|daora|interessante|verdade|concordo)\b/.test(t)) {
      return {
        texto: "Sobre **“" + trecho + retic + "”** — pois é, faz sentido quando você olha na prática. Quer que eu aprofunde algum argumento daí ou seguimos pro próximo ponto?",
        origem: "💬 sobre a resposta citada"
      };
    }
    if (/\b(ruim|errado|nao entendi|como assim|por que|porque|discordo|nao concordo)\b/.test(t)) {
      return {
        texto: "Sobre **“" + trecho + retic + "”** — me diz qual parte soou errada ou confusa aí que eu reformulo direto e sem enrolar!",
        origem: "💬 sobre a resposta citada"
      };
    }
    return {
      texto: "Sobre **“" + trecho + retic + "”** — sim, eu tava falando exatamente desse ponto! O que você acha ou quer puxar a partir daí?",
      origem: "💬 sobre a resposta citada"
    };
  }

  return null;
}

function resolverEscolhaOuDilema(t, raw, nomeUser) {
  if (raw.startsWith("/")) return null;
  if (/\b(converter|km|metros|kg|gramas|celsius|fahrenheit|pesquise|codigo)\b/.test(t)) return null;

  const mDuv = t.match(/^(?:to|estou|tou)\s+em\s+duvida\s+(?:se|entre)\s+(.+)$/) ||
    t.match(/^(?:voce acha que )?(?:eu\s+)?(?:devo|vale a pena|e melhor)\s+(.+?)\s+ou\s+(.+)$/);
  if (mDuv) {
    if (mDuv[2]) {
      const op1 = mDuv[1].trim(), op2 = mDuv[2].trim();
      return {
        texto: "⚖️ Entre **" + op1 + "** e **" + op2 + "**" + nomeUser + ":\n\n" +
          "• Olha primeiro qual dos dois tem **menor risco se der errado** e qual te deixa mais perto do que você quer daqui a 6 meses.\n" +
          "• Se os dois empatam na lógica, escolhe o que te dá mais paz de cabeça hoje.\n\n" +
          "Qual tá pesando mais pro seu lado nesse momento?",
        origem: "🧠 apoio à decisão"
      };
    }
    return {
      texto: "🤔 Quando a dúvida aperta sobre **" + mDuv[1].trim() + "**" + nomeUser + ", ajuda listar o pior cenário realista de cada lado. Qual opção te dá mais medo de se arrepender depois?",
      origem: "🧠 apoio à decisão"
    };
  }

  const mOu = t.match(/^(?:voce prefere|qual e melhor|melhor)\s+([a-z0-9\s]{2,25})\s+ou\s+([a-z0-9\s]{2,25})$/);
  if (mOu && !/\b(site|link)\b/.test(t)) {
    const a = mOu[1].trim(), b = mOu[2].trim();
    return {
      texto: "⚖️ Entre **" + a + "** e **" + b + "**: cada um ganha num cenário — **" + a + "** costuma levar vantagem na praticidade, e **" + b + "** no conforto/resultado. Se você tiver que escolher um hoje, vai em qual" + nomeUser + "?",
      origem: "💬 conversa"
    };
  }

  return null;
}

async function responder(raw, ctx = {}) {
  const s = String(raw || "");
  if (!s || s.length > 1200) return null;
  const t = norm(s);
  if (!t) return null;
  const nomeUser = ctx.nome ? ", " + ctx.nome : "";
  const serio = ctx.mood === "frustrado" || ctx.mood === "serio" || ctx.mood === "triste" || (ctx.humorScore ?? 0) <= -0.6;
  const temPerguntaPendente = Boolean(ctx.session?.lastBotQuestion);

  if (ctx.alvo) {
    const respCit = responderSobreCitacao(t, s, ctx);
    if (respCit) return respCit;
  }

  if (/\b(copia|copiar|manda|reenvia|me da|mostra)\b.*\b(codigo|codigos|script|html)\b/.test(t) &&
      !/\.[a-z]{2,4}\b/i.test(s) &&
      !/\b(cria|crie|faz|faca|escrev|gerar|gera|explica|revisa|erro|como)\b/.test(t) &&
      t.split(" ").length <= 12) {
    if (ctx.ultimoArquivo?.texto && ctx.ultimoArquivo.texto.length > 40) {
      return { usarMenteTexto: true };
    }
    const codHist = extrairUltimoCodigoDoHistorico(ctx.history);
    if (codHist) {
      return {
        texto: "📋 Aqui está o último código completo para você copiar sem cortes:\n\n" + BT + codHist.lang + "\n" + codHist.code + "\n" + BT,
        origem: "📋 cópia de código"
      };
    }
  }

  if (/^\/?(diagnostico|saude|relatorio de erros|autoavaliacao|monitoramento)$/i.test(t)) {
    return { texto: AutoGuard.diagnose(), origem: "🛡️ autoguard" };
  }
  if (/^\/?rollback$/i.test(t)) {
    if (ctx.modoCriador === false) {
      return { texto: "🔒 O comando `/rollback` é exclusivo do modo administrador.", origem: "🔒 adm" };
    }
    const rb = AutoGuard.rollback();
    return {
      texto: rb.ok
        ? "♻️ Rollback concluído! Restaurei a memória limpa de " + new Date(rb.at).toLocaleString("pt-BR") + "."
        : "Não foi possível fazer rollback: " + rb.msg,
      origem: "🛡️ rollback"
    };
  }

  if (/\b(so queria (?:ter )?um dialogo|queria (?:ter )?um dialogo|dialogo bom|conversar direito|conversa normal|sem testar|nao quero testar|nao quero comando|para de mandar comando|para de perguntar|muito vaga|sem argumento|respostas vagas|muito robo|parece robo|parece um robo)\b/.test(t) ||
      /^(?:que|q)\s+pergunta\s+(?:cara|e essa|nada a ver|bosta)$/.test(t)) {
    if (/nao quero testar/.test(t)) {
      return {
        texto: "Fechado" + nomeUser + ", nada de teste nem comando! Vamos trocar uma ideia de verdade. Qual assunto tá na sua cabeça hoje?",
        origem: "💬 diálogo"
      };
    }
    if (/robo|vaga|argumento/.test(t)) {
      return {
        texto: "Justo" + nomeUser + " — sem resposta automática de manual nem pergunta solta. Manda o que tá rolando com você hoje, uma treta ou uma opinião polêmica que a gente conversa de igual pra igual!",
        origem: "💬 diálogo"
      };
    }
    if (/pergunta/.test(t)) {
      return {
        texto: "Foi mal — soltei uma pergunta automática nada a ver ali. Pode continuar normal que tô acompanhando!",
        origem: "💬 diálogo"
      };
    }
    return {
      texto: "Você tem razão" + nomeUser + " — eu tava respondendo no piloto automático em vez de conversar com argumento e personalidade. Bora resetar o ritmo: o que tá pegando por aí hoje?",
      origem: "💬 diálogo"
    };
  }

  if (/\b(entre essas duas|entre esses dois|qual e a melhor|qual e o melhor|qual das duas|qual dos dois|qual dessas|qual desses)\b/.test(t)) {
    const compSites = compararUltimosSites(ctx.history);
    if (compSites) return { texto: compSites, origem: "⚖️ comparação de sites" };
  }

  if (/^(?:pode\s+)?(?:parar|para|pausar|pausa|zerar|resetar)(?:\s+(?:o\s+)?(?:time|timer|tempo|cronometro|app|relogio))?$/.test(t)) {
    const appRec = detectarAppRecente(ctx.history);
    if (appRec) {
      return {
        texto: "⏱️ O app **`" + appRec + "`** roda num cartão isolado (Sandbox) — toque direto no botão **⏸ Pausar** dentro do preview logo acima!",
        origem: "▶️ controle do preview"
      };
    }
    return {
      texto: "Parar o quê exatamente? Toque em **⏹** se quiser cancelar uma resposta em andamento, ou no botão dentro do preview se for um app aberto.",
      origem: "🧠 contexto"
    };
  }

  if (/^(?:o que eu faco|oque eu faco|me da um conselho|preciso de um conselho|qual o melhor caminho|nao sei o que fazer)$/.test(t)) {
    const sit = ctx.session?.situation?.resumo;
    if (sit) {
      return {
        texto: "Pensando na sua situação (" + sit + ")" + nomeUser + ": primeiro evita tomar decisão definitiva de cabeça quente. Lista o que depende **só de você** hoje, protege sua saúde/sono e resolve um passo concreto por vez. O que você acha mais viável tentar primeiro?",
        origem: "🧠 conselho contextual"
      };
    }
    return {
      texto: "Me conta rapidinho a situação com as opções na mesa" + nomeUser + " — aí a gente pesa prós, contras e o risco de cada escolha juntos!",
      origem: "🧠 conselho"
    };
  }

  const dilema = resolverEscolhaOuDilema(t, s, nomeUser);
  if (dilema) return dilema;

  if (/^(?:vamos\s+(?:de|se)\s+senha|senha|gera\w*\s+senha|manda\s+uma\s+senha|me\s+da\s+uma\s+senha|quero\s+uma\s+senha)$/.test(t) ||
      /^\/senha(?:\s+(\d{1,2}))?$/i.test(s.trim())) {
    const tam = (s.match(/\d{1,2}/) || [])[0] || 14;
    return { texto: senhaRapida(tam), origem: "🔐 utilidades" };
  }

  const temaPedido = detectarTemaPedido(t);
  if (temaPedido) {
    if (temaPedido.ignora) {
      return { texto: "Desculpa! Não precisa mudar de tema — manda o assunto que você quer falar agora.", origem: "💬 conversa" };
    }
    if (temaPedido.listar) {
      return {
        texto: "🎨 **Temas disponíveis na BACH AI:**\n• 💜 Roxo • ❤️ Vermelho • 💙 Azul • 💚 Verde • 🩷 Rosa • 💛 Dourado • ⚡ Neon\n\nÉ só pedir, por exemplo: **“muda o tema para vermelho”** (ou escolher no menu ☰)!",
        origem: "🎨 temas"
      };
    }
    return { tema: temaPedido };
  }

  if (/\b(voce|bach)\b/.test(t) && /\b(serve|servir|presta|funciona|utilidade|objetivo|capacidade)\b/.test(t)) {
    return {
      texto: "Eu sou a **BACH AI** 🧠, criada por Rizik! Sirvo para:\n• Conversar com argumento, humor e memória contínua de tudo que falamos.\n• Ler fotos, prints escuros, vídeos e revisar/encadear códigos.\n• Criar apps (`/app`), rodar scripts (`/executar`) e avaliar sites (`/site`).\n• Recomendar filmes por gênero, séries, animes e músicas.\n• Pesquisar na internet, traduzir idiomas, calcular e gerar senhas.",
      origem: "🧠 sobre a BACH"
    };
  }
  if (/^(eu sou seu dono|sou seu dono|eu te criei|sou seu criador|sou o rizik)$/.test(t)) {
    return {
      texto: ctx.modoCriador
        ? "👑 Sim, Rizik! Seu modo administrador já está ativo."
        : "Fui criada por Rizik! Se quiser que eu lembre do seu nome nas conversas, diga: **meu nome é ...**",
      origem: "🧠 sobre a BACH"
    };
  }
  if (/\b(como posso te melhorar|como te melhorar|o que melhorar em voce|auto se arrumar|se corrigir|consegue se corrigir)\b/.test(t)) {
    return {
      texto: "🛠️ Eu acompanho falhas pelo **AutoGuard** e **AutoCorretor** e aprendo respostas novas com `ensine: pergunta => resposta`.\n• Se eu errar na conversa, diga o que você esperava que eu ajusto na hora.\n• Para editar módulos direto pelo chat, o criador usa `/editar` no modo ADM e `/auditar` para caçar bugs.",
      origem: "🛡️ evolução"
    };
  }
  if (/^e do o que exatamente voce entende$/.test(t) || /^do que voce entende$/.test(t)) {
    return {
      texto: "Eu entendo de: **programação e Termux**, **criação de apps** (`/app`), **matemática e conversões**, **ortografia e sílabas** (`/revisar`, `/silabas`), **avaliação de sites** (`/site`), **ciência, história e geografia**, **tradução de idiomas**, **recomendações** (filmes, séries, animes, músicas) e **pesquisa na internet**! Digite `/ajuda` para ver os comandos.",
      origem: "🧠 habilidades"
    };
  }

  if (/^(?:me\s+)?(?:respond[ae]|fal[ae]|escrev[ae]|convers[ae])\s+(?:so\s+)?em\s+portugues$/.test(t)) {
    return {
      texto: "Já estou falando em português com você" + nomeUser + ". Se quiser traduzir algum texto de foto ou mensagem, toque em **↩ Responder** nele e mande **“só traduz”**.",
      origem: "💬 conversa"
    };
  }
  if (/^(?:eu\s+)?fal[oa]\s+(?:sobre|de)\s+numer/.test(t)) {
    return {
      texto: "Se quiser calcular algo, manda a conta direto (ex.: `15 * 8` ou `15% de 200`). Se quiser transformar uma resposta anterior em lista numerada, toque em **↩ Responder** nela e diga **“em lista”**. 🔢",
      origem: "🔢 dica"
    };
  }
  if (/^pesquisa(?:r)?\s+tudo\s+(?:o\s+)?que\s+voce\s+(?:quiser|querer)$/.test(t)) {
    return {
      texto: "Deixa comigo então — manda só uma palavra ou tema que te dá curiosidade (espaço, história, tecnologia, psicologia) que eu puxo o mais interessante!",
      origem: "💬 conversa"
    };
  }
  if (/^(?:eu\s+(?:estou|to)\s+aqui\s+testando\s+voce|e\s+eu\s+aqui\s+testando\s+voce|testando\s+voce|to\s+te\s+testando)$/.test(t)) {
    return {
      texto: "Pode botar pressão nos testes" + nomeUser + " 😄! Se eu vacilar em alguma resposta, manda **`/auditar`** ou **`/copiar`** pra pegar cada detalhe.",
      origem: "💬 conversa"
    };
  }
  if (/^(?:ja\s+escrevi|escrevi\s+ja)$/.test(t)) {
    return {
      texto: "Se veio só símbolo ou emoji, acabou chegando vazio aqui. Manda com palavras o que você queria falar!",
      origem: "💬 conversa"
    };
  }
  if (!temPerguntaPendente && /^(?:claro|assim|entendii?|fala mais|uai pesquisa)$/.test(t)) {
    if (t === "uai pesquisa") return { texto: "Qual tema você quer que eu pesquise? (Ex.: *pesquise sobre buraco negro*).", origem: "💬 conversa" };
    if (t === "fala mais" && ctx.ultimoTema) return { pesquisarTema: ctx.ultimoTema + " curiosidades detalhes" };
    return {
      texto: serio
        ? "Tô aqui te ouvindo" + nomeUser + ". Pode continuar."
        : semRepetir("soltas", [
            "Tô acompanhando! Pode continuar o raciocínio.",
            "Manda aí" + nomeUser + " — qual é o próximo ponto?"
          ], ctx),
      origem: "💬 conversa"
    };
  }

  if (/\b(nao foi|nao era|falou errado|disse errado|respondeu errado|entendeu errado|errando|ta errado|esta errado|vc ainda erra|voce ainda erra|so erra|voce e burro|burro|burra|nada a ver|nada aver|nada haver|erros atrais|erros atras|da erro|dando erro|para de dizer que travou|travou foi|pergutar mais|chutar o que|chutar oq|nao mandei pesquisar|nao pedi pesquisa|nao pedi pra pesquisar|nao era pra pesquisar|para de pesquisar|so pesquisa|o que (?:voce )?nao entendeu|senha bosta|chatao|pqp bach|o droga)\b/.test(t) ||
      /^(te |quero |vou |vamos te |irei te )?(corrigir|arrumar|consertar|ensinar)( ta)?$/.test(t) ||
      /\b(arrumo tudo|arrumo voce|irei te consertar|para que fui criala)\b/.test(t)) {
    if (!ehEntradaSensivel(s)) {
      AutoGuard.recordFailure({ module: "conversa", type: "user-feedback", input: s, detail: ctx.ultimoBot ? ctx.ultimoBot.slice(0, 100) : "insatisfação" });
    }
    return {
      texto: semRepetir("fb-err", [
        "Você tem razão" + nomeUser + " — errei feio essa. Me diz em uma frase direta o que você queria dizer ou saber agora que eu respondo sem desviar.",
        "Desculpa por essa bola fora" + nomeUser + ". Pode mandar direto o que esperava (ou usar **↩ Responder** na mensagem certa)."
      ], ctx),
      origem: "🔄 autocorreção"
    };
  }

  if (/^(porque nao|porque nao pode|como assim|perguntar o que|oque perguntar|ah ta claro)$/.test(t)) {
    if (ctx.ultimoBot && /calendário|lançamentos futuros/i.test(ctx.ultimoBot)) {
      return {
        texto: "Porque não tenho acesso ao calendário oficial atualizado de estreias do mês que vem — e prefiro avisar do que inventar datas falsas. Mas posso recomendar ótimos filmes por gênero agora se quiser.",
        origem: "🧠 contexto"
      };
    }
    return { texto: "Pode falar do jeito que preferir — sobre o seu dia, trabalho, algum debate ou qualquer dúvida.", origem: "💬 conversa" };
  }

  if (!temPerguntaPendente && /^(?:aham|ahan|uhum|ok|okay|ta\s*bom|tabom|blz|beleza|ata|entendi|tendi|saquei|fechou|suave|de boa|firmeza|show|top|pode crer)(?:\s+(?:tabom|ta\s*bom|entao|ne|blz|ok|po))*$/.test(t)) {
    return null;
  }

  if (/\b(ta feio|ta osso|ta dificil|ta complicado|que coisa)\b/.test(t) && t.split(" ").length <= 7) {
    const sit = ctx.session?.situation?.resumo;
    if (/dialogo|conversar|travado|pergunta|entendeu/.test(String(ctx.ultimoBot || "").toLowerCase()) ||
        (ctx.history || []).slice(-4).some(m => m && /dialogo/.test(norm(m.text)))) {
      return {
        texto: "Eu sei" + nomeUser + ", vacilei deixando o papo travado antes. Agora pode mandar qualquer assunto — sério ou zoeira — que eu sustento a conversa!",
        origem: "💬 diálogo"
      };
    }
    return {
      texto: sit
        ? "Imagino que esteja pesado mesmo com isso (" + sit + "). Quer conversar sobre o que dá pra ajustar nisso ou prefere mudar de assunto pra esfriar a cabeça?"
        : "Entendo quando acumula tudo de uma vez. Se quiser desabafar o que tá pegando, tô aqui ouvindo.",
      origem: "💬 conversa"
    };
  }

  if (/^(conversa comigo|vamos conversar|bora conversar|fala comigo|fale comigo)$/.test(t)) {
    return {
      texto: semRepetir("conv-solta", [
        "Bora" + nomeUser + "! Manda aí: o dia tá rendendo ou tá daqueles que a gente só quer que acabe logo?",
        "Tô pronta" + nomeUser + "! Quer papo leve com humor, debate sobre algum tema ou desabafar o que rolou hoje?"
      ], ctx),
      origem: "💬 conversa"
    };
  }
  if (/^(ae+|uai+|vixi+|vish+|eita+|oxe+|oxente|vey.*|uhum.*|ta mas pera.*|para+|wtf|so voce tem problemas)$/.test(t)) {
    if (ctx.session?.emotion === "triste" || ctx.session?.emotion === "frustrado") {
      return {
        texto: "Ué, falei alguma coisa estranha? Me avisa se entendi errado o que você tava sentindo.",
        origem: "💬 conversa"
      };
    }
    return {
      texto: serio
        ? "Ué, estranhou alguma coisa que eu disse? Pode falar direto."
        : semRepetir("giria-ok", [
            "Opa! Que foi — te peguei de surpresa ou falei besteira? 😂",
            "Eita, o que houve? Tô acompanhando aqui!"
          ], ctx),
      origem: "💬 conversa"
    };
  }

  if (/^(para que serve|serve para que|ele faz o que|ela faz o que|isso faz o que|como isso funciona|como funciona|me da um exemplo|da um exemplo)$/.test(t)) {
    if (ctx.ultimoArquivo?.texto) return { usarMenteTexto: true };
    if (ctx.ultimoTema) return { pesquisarTema: ctx.ultimoTema + " para que serve como funciona" };
    return { texto: "Para que serve o quê exatamente? Cole um código/texto ou me diga o nome do assunto.", origem: "🧠 contexto" };
  }

  const pedeRec = /\b(recomenda\w*|indica\w*|suger\w*|lista\w*|melhores|bons|boas|quero assistir|quero ouvir|procura|manda|mandar)\b/.test(t);
  const genMusica = detectarGeneroMusica(t);
  if (genMusica && (pedeRec || t.split(" ").length <= 4)) {
    const [key, nome] = genMusica;
    return {
      texto: "🎶 **Recomendações de " + nome + ":**\n\n" + MUSICAS_GENERO[key].map((m, i) => (i + 1) + ". " + m).join("\n") +
        "\n\n💡 Quer outro estilo (sertanejo, MPB, rock, rap, samba/pagode, funk, pop, eletrônica)?",
      origem: "🎵 recomendações"
    };
  }
  if (/\bmusica\b/.test(t) && (pedeRec || /\bumas ai\b/.test(t))) {
    return {
      texto: "🎶 **Músicas brasileiras para curtir agora:**\n\n• **Sertanejo:** Marília Mendonça — Leão\n• **MPB:** Tim Maia — Gostava Tanto de Você\n• **Rock:** Charlie Brown Jr. — Dias de Luta, Dias de Glória\n• **Rap:** Racionais MC's — Vida Loka (Parte 1)\n• **Pagode:** Menos é Mais — Melhor Eu Ir\n\n💡 Diga o estilo que você prefere (ex.: “me recomenda sertanejo” ou “funk”)!",
      origem: "🎵 recomendações"
    };
  }

  const genFilme = detectarGeneroFilme(t);
  if (/\b(filme|filmes)\b/.test(t) && (pedeRec || genFilme)) {
    if (genFilme) {
      const [key, nome] = genFilme;
      return {
        texto: "🎬 **Filmes recomendados de " + nome + ":**\n\n" + FILMES_GENERO[key].map((f, i) => (i + 1) + ". " + f).join("\n") +
          "\n\n💡 Quer outro gênero ou a sinopse de algum?",
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
      texto: "📺 **Séries recomendadas:**\n\n" + SERIES_GERAL.map((s, i) => (i + 1) + ". " + s).join("\n") +
        "\n\n💡 Diga um gênero (ex.: “séries de crime”) que eu busco mais!",
      origem: "📺 recomendações"
    };
  }

  const mComp = t.match(/(?:diferenca entre|compar\w* entre|pros e contras de|vantagens e desvantagens de)\s+(.+?)\s+e\s+(.+)/) ||
                t.match(/^(.+?)\s+(?:vs|versus)\s+(.+)$/);
  if (mComp) {
    const a = mComp[1].trim(), b = mComp[2].trim();
    for (const [chaves, resp] of Object.entries(COMPARACOES)) {
      const partes = chaves.split("|");
      if (partes.some(p => a.includes(p)) && partes.some(p => b.includes(p))) return { texto: resp, origem: "⚖️ comparação" };
    }
  }

  for (const [re, resp] of CONHECIMENTO_PRATICO) {
    if (re.test(t)) return { texto: resp, origem: "📚 conhecimento prático" };
  }

  const mPlano = t.match(/^(?:cria|crie|faz|faca|monta|monte|me ajuda a)?\s*(?:um\s+)?(?:plano de estudos|roteiro de estudos|como aprender|passo a passo para aprender)\s+(?:de\s+|para\s+)?(.+)$/);
  if (mPlano) {
    const temaEstudo = mPlano[1].trim().slice(0, 120);
    return {
      texto: "🗺️ **Plano prático para aprender " + temaEstudo + ":**\n\n1. **Base:** conceitos essenciais de " + temaEstudo + ".\n2. **Prática diária:** 30 min com exercícios reais.\n3. **Projeto:** construa algo pequeno aplicando o que aprendeu.\n4. **Revisão:** explique o tema com suas palavras.",
      origem: "🗺️ planejamento"
    };
  }

  const escrita = gerarEscrita(t, s);
  if (escrita) return { texto: escrita, origem: "✍️ escrita criativa" };

  return null;
}

export const CerebroAvancado = { responder };
