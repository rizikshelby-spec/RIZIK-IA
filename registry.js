/* BACH AI 4.1 — registro central dos departamentos, roteador de habilidades e instruções de modo. */

import { Intelligence } from "./intelligence.js?v=2";
import { Personality } from "./personality.js?v=1";
import { Creativity } from "./creativity.js?v=1";
import { Planning } from "./planning.js?v=1";
import { Security } from "./security.js?v=1";
import { Units } from "./units.js?v=2";
import { Finance } from "./finance.js?v=1";
import { Science } from "./science.js?v=1";
import { Education } from "./education.js?v=1";
import { Automation } from "./automation.js?v=1";

const SETTINGS_KEY = "bach_modules_v1";

const DEPARTMENTS = [
  { id: "inteligencia", name: "1. Inteligência e raciocínio", status: "LOCAL + IA", control: true, skills: "Raciocínio lógico, resolução de problemas, cálculo seguro e análise de situações." },
  { id: "personalidade", name: "2. Personalidade e humor", status: "LOCAL + IA", control: true, skills: "Humor espontâneo, piadas, conversa natural e estilo próprio da BACH." },
  { id: "memoria", name: "3. Memória e aprendizado", status: "ATIVO", control: false, skills: "Memória de longo prazo, contexto curto, ensinamentos, correções e histórico." },
  { id: "pesquisa", name: "4. Conhecimento e pesquisa", status: "ONLINE", control: false, skills: "Pesquisa na internet, notícias, Wikipédia e comparação de fontes." },
  { id: "ciencias", name: "5. Ciências e matemática", status: "LOCAL + IA", control: true, skills: "Matemática, fórmulas físicas, química, biologia e lógica." },
  { id: "criatividade", name: "6. Criatividade", status: "LOCAL + IA", control: true, skills: "Histórias, personagens, ideias, roteiros e textos originais." },
  { id: "tecnologia", name: "7. Programação e tecnologia", status: "ATIVO + IA", control: false, skills: "JavaScript, HTML, CSS, Python, SQL, criação de apps e revisão de código." },
  { id: "mundo", name: "8. Mundo e cotidiano", status: "ATIVO", control: true, skills: "Clima online, geografia, história, tradução e conversão de unidades." },
  { id: "comunicacao", name: "9. Comunicação", status: "ATIVO + IA", control: false, skills: "Interpretação de intenções, explicações claras e adaptação ao usuário." },
  { id: "estrategia", name: "10. Estratégia e planejamento", status: "LOCAL + IA", control: true, skills: "Organização de tarefas, planejamento por etapas e comparação de alternativas." },
  { id: "seguranca", name: "11. Segurança e confiabilidade", status: "HEURÍSTICO", control: true, skills: "Triagem de sinais de golpes, proteção de dados pessoais e verificação de fontes." },
  { id: "evolucao", name: "12. Evolução da BACH", status: "CATÁLOGO", control: false, skills: "Diagnóstico de módulos, backup /basedados e controle de habilidades." },
  { id: "games", name: "13. Games", status: "ATIVO", control: false, skills: "Jogos no chat (forca, velha, quiz, adivinhação) e scripts de criação." },
  { id: "entretenimento", name: "14. Entretenimento", status: "IA / PESQUISA", control: false, skills: "Filmes, séries, animes e recomendações." },
  { id: "musica", name: "15. Música", status: "IA / CONHECIMENTO", control: false, skills: "Gêneros, teoria musical e letras originais." },
  { id: "redes", name: "16. Redes sociais", status: "IA / PESQUISA", control: false, skills: "Boas práticas, tendências e segurança digital." },
  { id: "saude", name: "17. Saúde", status: "EDUCACIONAL + IA", control: false, skills: "Educação em saúde sem substituir diagnóstico profissional." },
  { id: "financas", name: "18. Finanças", status: "LOCAL + IA", control: true, skills: "Juros simples e compostos, orçamento e noções financeiras." },
  { id: "direito", name: "19. Direito", status: "PESQUISA + IA", control: false, skills: "Explicações gerais de leis com aviso de fonte e data." },
  { id: "educacao", name: "20. Educação", status: "LOCAL + IA", control: true, skills: "Quiz educativo, explicações didáticas e exercícios." },
  { id: "documentos", name: "21. Pesquisa documental", status: "ATIVO + IA", control: false, skills: "Leitura, resumo e revisão de textos, arquivos e links." },
  { id: "jogos-mentais", name: "22. Jogos mentais", status: "ATIVO", control: false, skills: "Charadas, lógica e desafios no chat." },
  { id: "debate", name: "23. Debate", status: "IA", control: false, skills: "Argumentação equilibrada e comparação de pontos de vista." },
  { id: "automacao", name: "24. Automação", status: "ROTEIRO LOCAL", control: true, skills: "Roteiros seguros e checklists sem executar ações externas sem permissão." }
];

function loadSettings() {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function saveSettings(value) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(value)); } catch {}
}

function enabled(id) {
  return loadSettings()[id] !== false;
}

function listModules() {
  return "🧠 BACH AI 4.1 — DEPARTAMENTOS\n\n" +
    DEPARTMENTS.map(d => {
      const flag = d.control ? (enabled(d.id) ? "🟢" : "⚪") : "🔹";
      return flag + " " + d.name + "\n   ID: " + d.id + " • " + d.status + "\n   " + d.skills;
    }).join("\n\n") +
    "\n\nComandos: /statusmodulos • /modulo ID on • /modulo ID off" +
    "\nFerramentas rápidas: /calc (2+3)*4 • /converter 10 km para m • /juros compostos 1000 2 12 • /fisica velocidade 100 2 • /quiz";
}

function moduleCommand(text) {
  const m = String(text || "").trim().match(/^\/modulo\s+([a-z0-9-]+)\s+(on|off|ligar|desligar)$/i);
  if (!m) return null;

  const id = m[1].toLowerCase();
  const department = DEPARTMENTS.find(d => d.id === id);
  if (!department) return "Não reconheci esse ID. Digite /modulos para ver a lista.";
  if (!department.control) {
    return "O departamento “" + department.name + "” é estrutural e não pode ser desligado por este comando.";
  }

  const settings = loadSettings();
  settings[id] = /^(on|ligar)$/i.test(m[2]);
  saveSettings(settings);

  return (settings[id] ? "🟢 Ativei o complemento local de " : "⚪ Desativei o complemento local de ") + department.name + ".";
}

/* Ordem corrigida: Units antes de Intelligence! */
const HANDLERS = [
  ["mundo", Units.handle, "📏 conversão de unidades"],
  ["inteligencia", Intelligence.handle, "🔢 cálculo local"],
  ["financas", Finance.handle, "💰 finanças"],
  ["ciencias", Science.handle, "🔬 fórmulas de física"],
  ["seguranca", Security.handle, "🔒 triagem de segurança"],
  ["educacao", Education.handle, "🧑‍🏫 quiz educativo"],
  ["personalidade", Personality.handle, "😄 personalidade"],
  ["criatividade", Creativity.handle, "🎨 criatividade offline"],
  ["estrategia", Planning.handle, "🗺️ planejamento"],
  ["automacao", Automation.handle, "🤖 planejamento de automação"]
];

function handle(text, context = {}) {
  const raw = String(text || "").trim();

  if (/^\/(modulos|statusmodulos)$/i.test(raw)) {
    return { texto: listModules(), origem: "🧠 catálogo de módulos" };
  }

  const setting = moduleCommand(raw);
  if (setting) return { texto: setting, origem: "⚙️ gerenciamento de módulos" };

  for (const [id, fn, origin] of HANDLERS) {
    if (!enabled(id)) continue;

    // Quando há um modelo de IA conectado e o comando não começa com "/",
    // deixa pedidos naturais de humor, criatividade ou planejamento fluírem para o cérebro.
    if (context.hasAI && !raw.startsWith("/")) {
      if (id === "personalidade" || id === "criatividade" || id === "estrategia") continue;
    }

    try {
      const answer = fn(raw, context);
      if (answer) return { texto: answer, origem: origin };
    } catch (error) {
      console.error("BACH module error:", id, error);
      return { texto: "O módulo " + id + " encontrou um erro ao processar essa solicitação.", origem: "⚠️ diagnóstico" };
    }
  }

  return null;
}

function modePrompt(mode = "auto") {
  const map = {
    auto: "MODO AUTOMÁTICO: entenda a intenção real do usuário e responda da forma mais útil, clara e natural possível.",
    raciocinio: "MODO RACIOCÍNIO PROFUNDO: analise o problema por partes, verifique contradições, revise sua própria lógica antes de concluir e explique como chegou à resposta.",
    pesquisa: "MODO PESQUISA: priorize precisão factual, compare informações, aponte limites quando não houver dados recentes confirmados e organize por tópicos.",
    aprendizado: "MODO APRENDIZADO: atue como professor paciente, explique com exemplos práticos do simples ao avançado e proponha um exercício curto ao final.",
    programacao: "MODO PROGRAMAÇÃO: entregue código completo e limpo em blocos com ```linguagem, aponte possíveis bugs e explique como o usuário pode testar.",
    matematica: "MODO MATEMÁTICA: mostre as etapas do cálculo, confira unidades e verifique a conta final antes de responder.",
    visao: "MODO VISÃO: descreva e analise a imagem enviada com atenção a textos, objetos, cores e detalhes, sem inventar o que não está visível.",
    voz: "MODO VOZ: responda de forma direta, natural e agradável para leitura em voz alta (frases curtas e sem blocos enormes sem necessidade).",
    criatividade: "MODO CRIATIVIDADE: explore ideias originais, narrativas envolventes, personagens e soluções fora do comum.",
    documentos: "MODO DOCUMENTOS: resuma, estruture em pontos-chave, extraia dados importantes e revise o conteúdo do arquivo/texto enviado."
  };
  return map[mode] || map.auto;
}

function instructions() {
  return `REGRAS E LIMITES DA BACH AI:
- Identidade: você é a BACH AI, uma assistente própria do usuário (nunca se apresente como Gemini, ChatGPT ou outro serviço).
- Use o histórico e as memórias existentes para manter o contexto, mas não invente lembranças.
- Separe fatos confirmados, inferências e opiniões.
- Em matemática e ciências, confira operações, unidades e hipóteses.
- Em saúde, dê informação educativa e oriente atendimento urgente em emergências; não diagnostique.
- Em direito e finanças, explique conceitos gerais sem prometer resultados.
- Em segurança digital, trate sinais de golpe como indícios, nunca prova automática.
- Em programação, não diga que executou código se só analisou estaticamente; explique como testar.
- Em automação, não afirme ter feito ações externas sem autorização e execução real.`;
}

export const SkillRouter = {
  handle,
  instructions,
  modePrompt,
  list: listModules,
  departments: DEPARTMENTS,
  getStats: () => ({
    total: DEPARTMENTS.length,
    localHandlers: HANDLERS.length,
    enabled: HANDLERS.filter(([id]) => enabled(id)).length
  })
};
