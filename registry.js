/* BACH AI 4.0 — registro central dos departamentos e roteador de habilidades. */

import { Intelligence } from "./intelligence.js?v=1";
import { Personality } from "./personality.js?v=1";
import { Creativity } from "./creativity.js?v=1";
import { Planning } from "./planning.js?v=1";
import { Security } from "./security.js?v=1";
import { Units } from "./units.js?v=1";
import { Finance } from "./finance.js?v=1";
import { Science } from "./science.js?v=1";
import { Education } from "./education.js?v=1";
import { Automation } from "./automation.js?v=1";

const SETTINGS_KEY = "bach_modules_v1";

const DEPARTMENTS = [
  {
    id: "inteligencia",
    name: "1. Inteligência e raciocínio",
    status: "LOCAL PARCIAL + IA",
    control: true,
    skills: "Raciocínio lógico; resolução de problemas; pensamento crítico; interpretação de perguntas; análise de situações. Cálculos aritméticos locais; problemas complexos dependem do modelo de linguagem."
  },
  {
    id: "personalidade",
    name: "2. Personalidade e humor",
    status: "LOCAL + EXISTENTE",
    control: true,
    skills: "Humor espontâneo; piadas e trocadilhos; sarcasmo leve; personalidade adaptável; reconhecimento de brincadeiras. Conversa principal já existe em conversa.js."
  },
  {
    id: "memoria",
    name: "3. Memória e aprendizado",
    status: "JÁ EXISTE",
    control: false,
    skills: "Memória de longo prazo; contexto de curto prazo pelo histórico da conversa; ensinamentos; correção de respostas; histórico de conversas. Implementados em brain.js, mente.js e historico.js."
  },
  {
    id: "pesquisa",
    name: "4. Conhecimento e pesquisa",
    status: "JÁ EXISTE / ONLINE",
    control: false,
    skills: "Pesquisa na internet; notícias; conhecimentos gerais; comparação de fontes. Saber.js já pesquisa, filtra e abre páginas; resultado depende dos sites acessíveis."
  },
  {
    id: "ciencias",
    name: "5. Ciências e matemática",
    status: "LOCAL PARCIAL + IA",
    control: true,
    skills: "Matemática; fórmulas iniciais de física; química; biologia; estatística e lógica. A calculadora e algumas fórmulas são locais; temas avançados precisam de IA e fontes."
  },
  {
    id: "criatividade",
    name: "6. Criatividade",
    status: "LOCAL BÁSICO + IA",
    control: true,
    skills: "Histórias; personagens; ideias; letras originais; roteiros e projetos. Os comandos offline usam modelos simples; criação elaborada depende de IA conectada."
  },
  {
    id: "tecnologia",
    name: "7. Programação e tecnologia",
    status: "JÁ EXISTE + IA",
    control: false,
    skills: "JavaScript; HTML; CSS; Python; aplicativos; leitura e revisão heurística de código. conhecimento.js, programacao.js e saber.js já cobrem parte disso."
  },
  {
    id: "mundo",
    name: "8. Mundo e cotidiano",
    status: "JÁ EXISTE + LOCAL",
    control: true,
    skills: "Clima online; geografia e história pela base/pesquisa; dicionário e tradução; conversão de unidades."
  },
  {
    id: "comunicacao",
    name: "9. Comunicação",
    status: "JÁ EXISTE + IA",
    control: false,
    skills: "Interpretação emocional textual; reconhecimento de intenções; conversa natural; explicações simples; adaptação ao interlocutor."
  },
  {
    id: "estrategia",
    name: "10. Estratégia e planejamento",
    status: "LOCAL BÁSICO + IA",
    control: true,
    skills: "Organização de tarefas; planejamento de projetos; tomada de decisão; comparação de alternativas; resolução de desafios. O plano local é um roteiro inicial, não uma análise especializada."
  },
  {
    id: "seguranca",
    name: "11. Segurança e confiabilidade",
    status: "LOCAL HEURÍSTICO",
    control: true,
    skills: "Sinais comuns de golpes; proteção de dados; verificação de fontes; alerta sobre informações falsas; privacidade. A triagem de golpes não prova fraude nem segurança."
  },
  {
    id: "evolucao",
    name: "12. Evolução da BACH",
    status: "GERENCIAMENTO BÁSICO",
    control: false,
    skills: "Estatísticas já existentes; catálogo de módulos; identificação de limitações; novos conhecimentos por atualização do código e pesquisa. Não há autoalteração autônoma do código."
  },
  {
    id: "games",
    name: "13. Games",
    status: "JÁ EXISTE PARCIAL",
    control: false,
    skills: "Jogos simples e desafios em mente.js; Roblox e Minecraft exigem informações atualizadas, pesquisa ou IA."
  },
  {
    id: "entretenimento",
    name: "14. Entretenimento",
    status: "IA / PESQUISA",
    control: false,
    skills: "Filmes; séries; animes; desenhos. Para lançamentos e disponibilidade precisa pesquisar fontes atuais."
  },
  {
    id: "musica",
    name: "15. Música",
    status: "IA / CONHECIMENTO",
    control: false,
    skills: "Gêneros; teoria musical; recomendações; composição original. Não inclui reprodução de músicas comerciais."
  },
  {
    id: "redes",
    name: "16. Redes sociais",
    status: "IA / PESQUISA",
    control: false,
    skills: "Redes; tendências; segurança digital; boas práticas. Tendências precisam de pesquisa atualizada."
  },
  {
    id: "saude",
    name: "17. Saúde",
    status: "EDUCACIONAL + IA",
    control: false,
    skills: "Educação em saúde e primeiros socorros com cautela; não diagnostica, não substitui profissionais e deve orientar emergências para serviços locais."
  },
  {
    id: "financas",
    name: "18. Finanças",
    status: "LOCAL PARCIAL + IA",
    control: true,
    skills: "Orçamento; juros simples e compostos; planejamento financeiro. O cálculo não considera automaticamente tarifas, impostos ou regras específicas."
  },
  {
    id: "direito",
    name: "19. Direito",
    status: "PESQUISA + IA",
    control: false,
    skills: "Explicação geral de leis e direitos; legislação e decisões precisam de fonte oficial e data. Não substitui advogado."
  },
  {
    id: "educacao",
    name: "20. Educação",
    status: "LOCAL + IA",
    control: true,
    skills: "Quiz local; professor/tutor com IA; exercícios e explicações. Base offline contém apenas perguntas selecionadas."
  },
  {
    id: "documentos",
    name: "21. Pesquisa documental",
    status: "JÁ EXISTE PARCIAL",
    control: false,
    skills: "Leitura, resumo e análise de documentos e estudos por saber.js e arquivos.js; conclusões dependem da qualidade do documento."
  },
  {
    id: "jogos-mentais",
    name: "22. Jogos mentais",
    status: "JÁ EXISTE PARCIAL",
    control: false,
    skills: "Charadas e jogos simples pela conversa e mente.js; mais desafios podem ser acrescentados."
  },
  {
    id: "debate",
    name: "23. Debate",
    status: "IA",
    control: false,
    skills: "Argumentação, comparação de opiniões e apresentação dos dois lados; depende de IA para respostas elaboradas."
  },
  {
    id: "automacao",
    name: "24. Automação",
    status: "PLANEJAMENTO LOCAL",
    control: true,
    skills: "Criação de planos de automação e listas de verificação. Não executa ações em aplicativos, compras, publicações ou exclusões."
  }
];

function loadSettings() {
  try {
    const value = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    return value && typeof value === "object"
      ? value
      : {};
  } catch {
    return {};
  }
}

function saveSettings(value) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
  } catch {}
}

function enabled(id) {
  return loadSettings()[id] !== false;
}

function listModules() {
  return "🧠 BACH AI 4.0 — DEPARTAMENTOS\n\n" +
    DEPARTMENTS.map(d => {
      const flag = d.control
        ? (enabled(d.id) ? "🟢" : "⚪")
        : "🔹";

      return flag + " " + d.name +
        "\n   ID: " + d.id +
        " • " + d.status +
        "\n   " + d.skills;
    }).join("\n\n") +

    "\n\nComandos: /statusmodulos • /modulo ID on • /modulo ID off" +
    "\nAs opções on/off afetam apenas os complementos locais controláveis." +
    "\nCálculo: /calc (2+3)*4 • Conversão: /converter 10 km para m" +
    "\nJuros: /juros compostos 1000 2 12 • Quiz: /quiz";
}

function moduleCommand(text) {
  const m = String(text || "").trim().match(
    /^\/modulo\s+([a-z0-9-]+)\s+(on|off|ligar|desligar)$/i
  );

  if (!m) return null;

  const id = m[1].toLowerCase();

  const department = DEPARTMENTS.find(d => d.id === id);

  if (!department) {
    return "Não reconheci esse ID. Digite /modulos para ver a lista.";
  }

  if (!department.control) {
    return "O departamento “" + department.name +
      "” usa arquivos já existentes ou serviços externos e não pode ser desligado por este comando.";
  }

  const settings = loadSettings();

  settings[id] = /^(on|ligar)$/i.test(m[2]);

  saveSettings(settings);

  return (settings[id]
    ? "🟢 Ativei o complemento local de "
    : "⚪ Desativei o complemento local de "
  ) + department.name +
    ". Os recursos antigos e a IA conectada não são desligados por este comando.";
}

const HANDLERS = [
  ["inteligencia", Intelligence.handle, "🧠 cálculo local"],
  ["personalidade", Personality.handle, "😄 personalidade"],
  ["criatividade", Creativity.handle, "🎨 criatividade offline"],
  ["estrategia", Planning.handle, "🗺️ planejamento"],
  ["seguranca", Security.handle, "🔒 triagem de segurança"],
  ["mundo", Units.handle, "📏 conversão de unidades"],
  ["financas", Finance.handle, "💰 finanças"],
  ["ciencias", Science.handle, "🔬 fórmulas de física"],
  ["educacao", Education.handle, "🧑‍🏫 quiz educativo"],
  ["automacao", Automation.handle, "🤖 planejamento de automação"]
];

function handle(text, context = {}) {
  const raw = String(text || "").trim();

  if (/^\/(modulos|statusmodulos)$/i.test(raw)) {
    return {
      texto: listModules(),
      origem: "🧠 catálogo de módulos"
    };
  }

  const setting = moduleCommand(raw);

  if (setting) {
    return {
      texto: setting,
      origem: "⚙️ gerenciamento de módulos"
    };
  }

  for (const [id, fn, origin] of HANDLERS) {
    if (!enabled(id)) continue;

    try {
      const answer = fn(raw, context);

      if (answer) {
        return {
          texto: answer,
          origem: origin
        };
      }
    } catch (error) {
      console.error("BACH module error:", id, error);

      return {
        texto: "O módulo " + id +
          " encontrou um erro ao processar essa solicitação.",
        origem: "⚠️ diagnóstico de módulo"
      };
    }
  }

  return null;
}

function instructions() {
  return `CAPACIDADES E LIMITES DOS MÓDULOS DA BACH AI 4.0:
- Use o histórico e as memórias existentes para manter o contexto, mas não invente lembranças.
- Separe fatos confirmados, inferências e opiniões. Quando pesquisar, cite ou mostre as fontes disponíveis e compare datas.
- Em matemática, mostre as operações e confira o resultado. Em ciências, indique unidades e hipóteses.
- Em saúde, dê informação educativa, não faça diagnóstico e indique atendimento urgente quando houver risco imediato.
- Em direito e finanças, explique conceitos gerais, avise quando depender de jurisdição, data ou situação individual e não prometa resultados.
- Em segurança digital, trate sinais de golpe como indícios, nunca como prova automática.
- Em programação, não diga que executou ou testou código se só fez leitura estática. Explique como o usuário pode testar.
- Em automação, não afirme que enviou, apagou, publicou, comprou ou alterou algo sem uma ferramenta autorizada e confirmação do resultado.
- Sem um modelo de linguagem conectado, reconheça que as funções offline são regras, bases de conhecimento, cálculos e modelos simples; não as apresente como raciocínio humano ou consciência.
- Para informações recentes, use pesquisa na internet e diferencie a data de publicação da data do acontecimento.`;
}

export const SkillRouter = {
  handle,
  instructions,
  list: listModules,
  departments: DEPARTMENTS,

  getStats: () => ({
    total: DEPARTMENTS.length,
    localHandlers: HANDLERS.length,
    enabled: HANDLERS.filter(([id]) => enabled(id)).length
  })
};
