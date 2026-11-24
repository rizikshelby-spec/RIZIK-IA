/* BACH AI 4.5 — registro central dos departamentos, Watchdog AutoGuard e roteador de habilidades. */

import { AutoGuard } from "./autoguard.js?v=1";
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
  { id: "seguranca", name: "11. Segurança e confiabilidade", status: "AUTOGUARD", control: true, skills: "Triagem de golpes, Watchdog, Failure Memory, Rollback e proteção de dados." },
  { id: "evolucao", name: "12. Evolução da BACH", status: "CATÁLOGO", control: false, skills: "Diagnóstico, monitoramento de desempenho, backup /basedados e controle de módulos." },
  { id: "games", name: "13. Games", status: "ATIVO", control: false, skills: "Jogos no chat (forca, velha, quiz, adivinhação) e scripts de criação." },
  { id: "entretenimento", name: "14. Entretenimento", status: "ATIVO + ONLINE", control: false, skills: "Filmes por gênero, séries ao vivo (TVmaze) e animes (Jikan)." },
  { id: "musica", name: "15. Música", status: "ATIVO", control: false, skills: "Recomendações por gênero brasileiro e internacional." },
  { id: "redes", name: "16. Redes sociais", status: "ATIVO", control: false, skills: "Boas práticas, legendas, bios e segurança digital." },
  { id: "saude", name: "17. Saúde", status: "EDUCACIONAL", control: false, skills: "Educação em saúde sem substituir diagnóstico profissional." },
  { id: "financas", name: "18. Finanças", status: "LOCAL + IA", control: true, skills: "Juros simples e compostos, método 50-30-20 e noções financeiras." },
  { id: "direito", name: "19. Direito", status: "LOCAL + PESQUISA", control: false, skills: "Direitos básicos do consumidor e explicações gerais." },
  { id: "educacao", name: "20. Educação", status: "LOCAL + IA", control: true, skills: "Quiz educativo, planos de estudo e redação." },
  { id: "documentos", name: "21. Pesquisa documental", status: "ATIVO", control: false, skills: "Leitura, resumo e revisão de textos, arquivos, fotos e vídeos." },
  { id: "jogos-mentais", name: "22. Jogos mentais", status: "ATIVO", control: false, skills: "Charadas, lógica e desafios no chat." },
  { id: "debate", name: "23. Debate", status: "ATIVO", control: false, skills: "Comparações estruturadas e prós e contras." },
  { id: "automacao", name: "24. Automação", status: "ROTEIRO LOCAL", control: true, skills: "Roteiros seguros e checklists sem executar ações externas sem permissão." }
];

const AJUDA_FERRAMENTAS = {
  "/calc": "🔢 Use `/calc (2+3)*4` ou pergunte direto: `quanto é 15% de 200?`",
  "/calcular": "🔢 Use `/calcular 25 * 4 + 10`",
  "/converter": "📏 Use `/converter 10 km para m` ou `quanto é 5 quilos em gramas?`",
  "/juros": "💰 Use `/juros simples 1000 2 12` ou `/juros compostos 1000 2 12` (capital, taxa %, períodos)",
  "/fisica": "⚙️ Use:\n• `/fisica velocidade 100 2` (distância e tempo)\n• `/fisica forca 10 2` (massa e aceleração)\n• `/fisica densidade 100 20` (massa e volume)\n• `/fisica energia-cinetica 10 5` (massa e velocidade)",
  "/golpe": "🔒 Cole a mensagem ou link suspeito depois de `/golpe` para análise."
};

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
  return "🧠 BACH AI 4.5 — DEPARTAMENTOS\n\n" +
    DEPARTMENTS.map(d => {
      const flag = d.control ? (enabled(d.id) ? "🟢" : "⚪") : "🔹";
      return flag + " " + d.name + "\n   ID: " + d.id + " • " + d.status + "\n   " + d.skills;
    }).join("\n\n") +
    "\n\nComandos ADM: /statusmodulos • /modulo ID on • /modulo ID off • /diagnostico • /rollback";
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

  return (settings[id] ? "🟢 Ativei " : "⚪ Desativei ") + department.name + ".";
}

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
  const low = raw.toLowerCase();

  if (AJUDA_FERRAMENTAS[low]) {
    return { texto: AJUDA_FERRAMENTAS[low], origem: "🛠️ ajuda da ferramenta" };
  }

  if (/^\/(modulos|statusmodulos)$/i.test(raw)) {
    return { texto: listModules(), origem: "🧠 catálogo de módulos" };
  }

  if (/^\/(diagnostico|saude)$/i.test(raw)) {
    return { texto: AutoGuard.diagnose(), origem: "🛡️ autoguard" };
  }

  if (/^\/rollback$/i.test(raw)) {
    const rb = AutoGuard.rollback();
    return {
      texto: rb.ok
        ? "♻️ Rollback concluído! Restaurei a memória limpa de " + new Date(rb.at).toLocaleString("pt-BR") + "."
        : "Não foi possível fazer rollback: " + rb.msg,
      origem: "🛡️ rollback"
    };
  }

  const setting = moduleCommand(raw);
  if (setting) return { texto: setting, origem: "⚙️ gerenciamento de módulos" };

  for (const [id, fn, origin] of HANDLERS) {
    if (!enabled(id)) continue;
    if (context.hasAI && !raw.startsWith("/")) {
      if (id === "personalidade" || id === "criatividade" || id === "estrategia") continue;
    }

    const answer = AutoGuard.guard(id, () => fn(raw, context));
    if (answer) return { texto: answer, origem: origin };
  }

  return null;
}

function modePrompt(mode = "auto") {
  const map = {
    auto: "MODO AUTOMÁTICO: entenda a intenção real do usuário e responda da forma mais útil, clara e natural possível.",
    raciocinio: "MODO RACIOCÍNIO PROFUNDO: analise o problema por partes, revise sua lógica antes de concluir e explique como chegou à resposta.",
    pesquisa: "MODO PESQUISA: priorize precisão factual, compare informações e aponte limites quando não houver dados recentes confirmados.",
    aprendizado: "MODO APRENDIZADO: atue como professor paciente, dê exemplos práticos e proponha um exercício curto ao final.",
    programacao: "MODO PROGRAMAÇÃO: entregue código completo e limpo em blocos com crases e linguagem, aponte bugs e explique como testar.",
    matematica: "MODO MATEMÁTICA: mostre as etapas do cálculo, confira unidades e verifique a conta final antes de responder.",
    visao: "MODO VISÃO: descreva e analise a imagem enviada com atenção a textos, objetos, cores e detalhes.",
    voz: "MODO VOZ: responda de forma direta, natural e agradável para leitura em voz alta.",
    criatividade: "MODO CRIATIVIDADE: explore ideias originais, narrativas envolventes e soluções fora do comum.",
    documentos: "MODO DOCUMENTOS: resuma, estruture em pontos-chave e revise o conteúdo do arquivo/texto enviado."
  };
  return map[mode] || map.auto;
}

function instructions() {
  return `REGRAS E LIMITES DA BACH AI:
- Identidade: você é a BACH AI, criada por Rizik (nunca se apresente como outro serviço).
- Use o histórico e as memórias existentes para manter o contexto, mas não invente lembranças.
- Separe fatos confirmados, inferências e opiniões.
- Em matemática e ciências, confira operações, unidades e hipóteses.`;
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
