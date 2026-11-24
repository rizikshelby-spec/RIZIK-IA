/* BACH AI 4.8 — Sabedoria Geral Turbinada
 * Conhecimento estruturado imediato em tecnologia avançada, segurança digital, direito,
 * economia, ciências, filosofia e produtividade (zero conflito com conversa normal).
 */

const norm = s => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const ENCICLOPEDIA = [
  {
    k: ["seguranca web", "xss", "sql injection", "csrf", "vulnerabilidade web", "ataques web"],
    r: "🛡️ **Principais Riscos em Sites e Sistemas Web:**\n" +
      "• **XSS (Cross-Site Scripting):** injeção de script malicioso na página (evite usando `textContent` em vez de `innerHTML` para textos de usuários).\n" +
      "• **SQL Injection:** invasão de banco de dados via campos de texto (evite usando consultas parametrizadas / Prepared Statements).\n" +
      "• **CSRF:** envio forçado de ação autenticado (protegido com tokens CSRF e `SameSite` cookies).\n" +
      "• **Senhas:** nunca guarde em texto puro — use hash seguro como `bcrypt` ou `Argon2`."
  },
  {
    k: ["jwt", "autenticacao", "oauth", "login seguro", "token jwt"],
    r: "🔑 **Autenticação Moderna (JWT & OAuth):**\n" +
      "• **JWT (JSON Web Token):** token assinado composto por *Header.Payload.Signature*. Permite verificar quem é o usuário sem consultar sessão no banco a cada clique.\n" +
      "• **OAuth 2.0:** padrão usado no botão 'Entrar com Google/GitHub', dando acesso limitado sem entregar sua senha ao site."
  },
  {
    k: ["docker", "container", "containers", "virtualizacao"],
    r: "🐳 **Docker & Containers:**\n" +
      "Docker empacota seu código + todas as dependências em um **container** leve. Assim, o sistema roda exatamente igual no seu computador, no servidor e na nuvem — acabando com o famoso 'na minha máquina funciona'."
  },
  {
    k: ["websocket", "websockets", "tempo real", "socket io"],
    r: "⚡ **WebSockets (Comunicação em Tempo Real):**\n" +
      "Enquanto o HTTP comum funciona por pedido-resposta, o **WebSocket** mantém um túnel aberto nos dois sentidos entre navegador e servidor — ideal para chats ao vivo, jogos multiplayer e cotações em tempo real."
  },
  {
    k: ["rag", "vetores", "embeddings", "ia avancada"],
    r: "🧠 **RAG (Retrieval-Augmented Generation):**\n" +
      "Técnica que une **busca em documentos** + **IA**: antes de responder, o sistema encontra os trechos relevantes da sua base de conhecimento e entrega como contexto para gerar uma resposta fiel aos seus dados."
  },
  {
    k: ["lgpd", "protecao de dados", "privacidade dados", "lei dados"],
    r: "📜 **LGPD (Lei Geral de Proteção de Dados — Lei 13.709/2018):**\n" +
      "Garante ao cidadão no Brasil o direito de saber **quais dados** uma empresa coleta, **para que usa**, pedir **correção** ou **exclusão** e exigir proteção contra vazamentos."
  },
  {
    k: ["cdi", "tesouro direto", "reserva de emergencia", "investimentos basicos", "renda fixa"],
    r: "💰 **Noções de Renda Fixa no Brasil:**\n" +
      "• **Reserva de emergência:** 3 a 6 meses de gastos essenciais em liquidez diária (ex.: Tesouro Selic ou CDB 100% do CDI).\n" +
      "• **CDI:** taxa muito próxima à Selic usada como referência em CDBs e contas remuneradas.\n" +
      "• **Tesouro IPCA+:** protege seu dinheiro contra a inflação + uma taxa fixa ao ano."
  },
  {
    k: ["estoicismo", "marco aurelio", "seneca", "epicteto", "filosofia estoica"],
    r: "🏛️ **Estoicismo (Marco Aurélio, Sêneca, Epicteto):**\n" +
      "Filosofia prática focada no que está **sob seu controle** (suas atitudes, escolhas e reações) versus o que **não está** (o passado, o clima, a opinião alheia). A ideia central é manter clareza mental mesmo sob pressão."
  },
  {
    k: ["socrates", "platao", "aristoteles", "filosofia grega"],
    r: "🏺 **Tríade da Filosofia Grega:**\n" +
      "• **Sócrates:** método de perguntas (*maiêutica*) e 'Só sei que nada sei'.\n" +
      "• **Platão:** aluno de Sócrates, fundou a Academia e propôs o Mundo das Ideias.\n" +
      "• **Aristóteles:** aluno de Platão, sistematizou a lógica, a ética da moderação e a ciência empírica."
  },
  {
    k: ["falacias", "falacia logica", "argumentacao", "vieses cognitivos"],
    r: "🧩 **Falácias & Vieses Comuns:**\n" +
      "• **Ad Hominem:** atacar a pessoa em vez do argumento dela.\n" +
      "• **Espantalho:** distorcer a fala do outro para parecer fácil de refutar.\n" +
      "• **Viés de Confirmação:** procurar só informações que concordam com o que você já acredita."
  },
  {
    k: ["telescopio james webb", "james webb", "jwst"],
    r: "🔭 **Telescópio Espacial James Webb (JWST):**\n" +
      "Lançado em dezembro de 2021, observa o universo no **infravermelho** a ~1,5 milhão de km da Terra (ponto L2). Consegue enxergar galáxias formadas logo após o Big Bang e analisar atmosferas de exoplanetas."
  },
  {
    k: ["crispr", "edicao genetica", "genetica moderna"],
    r: "🧬 **CRISPR-Cas9:**\n" +
      "Ferramenta revolucionária de edição genética que funciona como uma 'tesoura molecular' programável, permitindo cortar e corrigir trechos específicos de DNA com alta precisão."
  },
  {
    k: ["termodinamica", "leis termodinamica", "entropia"],
    r: "🔥 **Leis da Termodinâmica:**\n" +
      "• **1ª Lei:** a energia não é criada nem destruída, apenas transformada.\n" +
      "• **2ª Lei:** em sistemas isolados, a **entropia** (desordem/dispersão de energia) tende a aumentar — o calor flui naturalmente do corpo mais quente para o mais frio."
  },
  {
    k: ["neuroplasticidade", "como o cerebro aprende", "sono e memoria"],
    r: "🧠 **Neuroplasticidade & Sono:**\n" +
      "O cérebro cria e reforça conexões (sinapses) sempre que você pratica algo novo. É durante o **sono profundo e REM** que o cérebro consolida memórias e limpa resíduos metabólicos do dia."
  }
];

function handle(text) {
  const t = norm(text);
  if (!t || t.split(" ").length > 10) return null;

  const ehPerguntaOuTema = /^(?:o que e|o que sao|me explica|explica|explique|fale sobre|fala sobre|como funciona|resumo de|resuma)?\s*(.+)$/.test(t);
  if (!ehPerguntaOuTema) return null;

  let melhor = null;
  let pontos = 0;

  for (const item of ENCICLOPEDIA) {
    for (const k of item.k) {
      if (t === k || t.includes(" " + k) || t.startsWith(k + " ") || t.endsWith(" " + k)) {
        const sc = k.split(" ").length * 2 + k.length * 0.1;
        if (sc > pontos) {
          pontos = sc;
          melhor = item.r;
        }
      }
    }
  }
  return melhor;
}

export const SaberesPro = { handle, total: ENCICLOPEDIA.length };
