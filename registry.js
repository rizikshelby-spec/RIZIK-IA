/* BACH AI 5.4 — Orquestrador Central dos Departamentos, 10 Modos Reais & Watchdog AutoGuard
 * 100% BACH AI própria (sem IAs externas).
 */

import { AutoGuard } from "./autoguard.js?v=2";
import { Intelligence } from "./intelligence.js?v=2";
import { Personality } from "./personality.js?v=2";
import { Creativity } from "./creativity.js?v=1";
import { Planning } from "./planning.js?v=1";
import { Security } from "./security.js?v=1";
import { Units } from "./units.js?v=2";
import { Finance } from "./finance.js?v=1";
import { Science } from "./science.js?v=1";
import { Education } from "./education.js?v=1";
import { Automation } from "./automation.js?v=1";

let utilHandle = null;
let convTextoHandle = null;
let saudeHandle = null;
let estudosHandle = null;
let devHandle = null;
let progTermuxHandle = null;
let saberesProHandle = null;

const prontoModulos = Promise.allSettled([
  import("./utilidades.js?v=2").then(m => { if (m?.Utilidades?.handle) utilHandle = m.Utilidades.handle; }),
  import("./conversor_texto.js?v=1").then(m => { if (m?.ConversorTexto?.handle) convTextoHandle = m.ConversorTexto.handle; }),
  import("./saude_bemestar.js?v=1").then(m => { if (m?.SaudeBemEstar?.handle) saudeHandle = m.SaudeBemEstar.handle; }),
  import("./estudos.js?v=1").then(m => { if (m?.Estudos?.handle) estudosHandle = m.Estudos.handle; }),
  import("./dev_ferramentas.js?v=1").then(m => { if (m?.DevFerramentas?.handle) devHandle = m.DevFerramentas.handle; }),
  import("./programacao_termux.js?v=4").then(m => { if (m?.ProgramacaoTermux?.handle) progTermuxHandle = m.ProgramacaoTermux.handle; }),
  import("./saberes_pro.js?v=1").then(m => { if (m?.SaberesPro?.handle) saberesProHandle = m.SaberesPro.handle; })
]);

await prontoModulos;

const SETTINGS_KEY = "bach_modules_v1";
const PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);

const DEPARTMENTS = [
  { id: "inteligencia", name: "1. Inteligência e raciocínio", status: "LOCAL", control: true, skills: "Raciocínio lógico, resolução de problemas, cálculo seguro e análise de situações." },
  { id: "personalidade", name: "2. Personalidade e piadas interativas", status: "LOCAL", control: true, skills: "Piadas interativas que esperam sua resposta, humor adaptativo e estilo próprio da BACH." },
  { id: "memoria", name: "3. Memória e aprendizado", status: "ATIVO", control: false, skills: "Memória de longo prazo, contexto do início ao fim, ensinamentos, correções e histórico." },
  { id: "pesquisa", name: "4. Conhecimento e pesquisa", status: "ONLINE", control: false, skills: "Pesquisa na internet, notícias, Wikipédia e comparação de fontes." },
  { id: "ciencias", name: "5. Ciências e matemática", status: "LOCAL", control: true, skills: "Matemática, fórmulas físicas, química, biologia e lógica." },
  { id: "criatividade", name: "6. Criatividade", status: "LOCAL", control: true, skills: "Histórias, personagens, ideias, roteiros e textos originais." },
  { id: "tecnologia", name: "7. Programação e tecnologia", status: "ATIVO", control: false, skills: "JavaScript, HTML, CSS, Python, SQL, criação de apps e revisão de código." },
  { id: "mundo", name: "8. Mundo e cotidiano", status: "ATIVO", control: true, skills: "Clima online, geografia, história, tradução e conversão de unidades." },
  { id: "comunicacao", name: "9. Comunicação", status: "ATIVO", control: false, skills: "Interpretação de intenções, explicações claras e adaptação ao usuário." },
  { id: "estrategia", name: "10. Estratégia e planejamento", status: "LOCAL", control: true, skills: "Organização de tarefas, planejamento por etapas e comparação de alternativas." },
  { id: "seguranca", name: "11. Segurança e confiabilidade", status: "AUTOGUARD", control: true, skills: "Triagem de golpes, Watchdog, Failure Memory, Rollback e proteção de dados." },
  { id: "evolucao", name: "12. Evolução da BACH", status: "CATÁLOGO", control: false, skills: "Diagnóstico, monitoramento de desempenho, backup /basedados e controle de módulos." },
  { id: "games", name: "13. Games", status: "ATIVO", control: false, skills: "Jogos no chat (forca, velha, quiz, adivinhação) e scripts de criação." },
  { id: "entretenimento", name: "14. Entretenimento", status: "ATIVO + ONLINE", control: false, skills: "Filmes por gênero, séries ao vivo (TVmaze) e animes (Jikan)." },
  { id: "musica", name: "15. Música", status: "ATIVO", control: false, skills: "Recomendações por gênero brasileiro e internacional." },
  { id: "redes", name: "16. Redes sociais", status: "ATIVO", control: false, skills: "Boas práticas, legendas, bios e segurança digital." },
  { id: "saude", name: "17. Saúde", status: "EDUCACIONAL", control: false, skills: "Educação em saúde sem substituir diagnóstico profissional." },
  { id: "financas", name: "18. Finanças", status: "LOCAL", control: true, skills: "Juros simples e compostos, método 50-30-20 e noções financeiras." },
  { id: "direito", name: "19. Direito", status: "LOCAL + PESQUISA", control: false, skills: "Direitos básicos do consumidor, LGPD e explicações gerais." },
  { id: "educacao", name: "20. Educação", status: "LOCAL", control: true, skills: "Quiz educativo, planos de estudo e redação." },
  { id: "documentos", name: "21. Pesquisa documental", status: "ATIVO", control: false, skills: "Leitura, resumo e revisão de textos, arquivos, fotos e vídeos." },
  { id: "jogos-mentais", name: "22. Jogos mentais", status: "ATIVO", control: false, skills: "Charadas, lógica e desafios no chat." },
  { id: "debate", name: "23. Debate", status: "ATIVO", control: false, skills: "Comparações estruturadas e prós e contras." },
  { id: "automacao", name: "24. Automação", status: "ROTEIRO LOCAL", control: true, skills: "Roteiros seguros e checklists sem executar ações externas sem permissão." },
  { id: "utilidades", name: "25. Utilidades práticas", status: "LOCAL", control: true, skills: "Gerador de senhas, sorteios, dados, cara ou coroa, datas/dias, contador e CPF." },
  { id: "conversor-texto", name: "26. Conversor de texto e links", status: "LOCAL", control: true, skills: "Link WhatsApp, maiúsculo/minúsculo, sem acento, inverter, slug e Base64." },
  { id: "saude-bemestar", name: "27. Saúde e bem-estar", status: "LOCAL", control: true, skills: "Cálculos educativos de IMC, água diária, calorias, respiração 4-7-8 e pausa ativa." },
  { id: "estudos", name: "28. Estudos avançados", status: "LOCAL", control: true, skills: "Flashcards por matéria, simulado com pontuação e técnicas de memorização." },
  { id: "dev-ferramentas", name: "29. Ferramentas Dev Web", status: "LOCAL", control: true, skills: "Conversor HEX/RGB/HSL, CSS vidro transparente, meta tags SEO e paletas." },
  { id: "programacao-termux", name: "30. Termux, scripts e criador de apps", status: "LOCAL", control: true, skills: "Guias de Termux/Linux/Bash e criador autônomo de apps HTML/CSS/JS completos." },
  { id: "saberes-pro", name: "31. Sabedoria geral avançada", status: "LOCAL", control: true, skills: "Segurança web, Docker, JWT, RAG, LGPD, economia, astronomia, termodinâmica e filosofia." },
  { id: "executor-sandbox", name: "32. Executor seguro (Sandbox)", status: "ATIVO", control: false, skills: "Executa scripts JS e abre preview ao vivo de apps HTML/CSS/JS direto no chat." },
  { id: "voz-tts", name: "33. Voz natural (TTS)", status: "ATIVO", control: false, skills: "Leitura em português dividida em trechos (compatível com iPhone, Android e PC)." },
  { id: "erros-adm", name: "34. Central de erros ADM", status: "ATIVO", control: false, skills: "Captura automática de falhas do público com busca, seleção, exclusão e cópia no ADM." },
  { id: "rede-neural", name: "35. Rede Neural Própria", status: "NEURAL", control: false, skills: "MLP com backpropagation, n-gramas e pesos treinados no próprio projeto." },
  { id: "nlu-nuvem", name: "36. NLU Neural & Nuvem D1", status: "NUVEM + LOCAL", control: false, skills: "Entendimento livre, autoaprendizado por reformulação e coleta na Cloudflare D1." }
];

const AJUDA_FERRAMENTAS = {
  "/calc": "🔢 Use `/calc (2+3)*4` ou pergunte direto: `quanto é 15% de 200?`",
  "/calcular": "🔢 Use `/calcular 25 * 4 + 10`",
  "/converter": "📏 Use `/converter 10 km para m` ou `quanto é 5 quilos em gramas?`",
  "/juros": "💰 Use `/juros simples 1000 2 12` ou `/juros compostos 1000 2 12` (capital, taxa %, períodos)",
  "/fisica": "⚙️ Use:\n• `/fisica velocidade 100 2` (distância e tempo)\n• `/fisica forca 10 2` (massa e aceleração)\n• `/fisica densidade 100 20` (massa e volume)\n• `/fisica energia-cinetica 10 5` (massa e velocidade)",
  "/golpe": "🔒 Cole a mensagem ou link suspeito depois de `/golpe` para análise.",
  "/senha": "🔐 Use `/senha 16` ou peça `gera uma senha forte`.",
  "/dado": "🎲 Use `/dado 20`, `d20` ou `joga um dado`.",
  "/sortear": "🎯 Use `/sortear pizza, lanche, sushi` ou `sorteia de 1 a 100`.",
  "/cpf": "✅ Use `/cpf 000.000.000-00` para validar os dígitos matemáticos ou peça `manda um cpf de teste`.",
  "/contar": "📊 Use `/contar seu texto aqui` para contar palavras, caracteres e tempo de leitura."
};

function loadSettings() {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const out = {};
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const k of Object.keys(value)) {
        if (!PROIBIDAS.has(k) && typeof value[k] === "boolean") out[k] = value[k];
      }
    }
    return out;
  } catch {
    return {};
  }
}

function saveSettings(value) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(value)); } catch {}
}

function enabled(id) {
  if (!id || PROIBIDAS.has(id)) return false;
  const s = loadSettings();
  return Object.hasOwn(s, id) ? s[id] !== false : true;
}

function listModules() {
  return "🧠 BACH AI 5.4 — DEPARTAMENTOS (" + DEPARTMENTS.length + ")\n\n" +
    DEPARTMENTS.map(d => {
      const flag = d.control ? (enabled(d.id) ? "🟢" : "⚪") : "🔹";
      return flag + " " + d.name + "\n   ID: " + d.id + " • " + d.status + "\n   " + d.skills;
    }).join("\n\n") +
    "\n\nComandos ADM: /statusmodulos • /modulo ID on • /modulo ID off • /diagnostico • /rollback • /tudotxt";
}

function moduleCommand(text, context = {}) {
  const raw = String(text || "").trim();
  if (/^\/modulo(?:\s+\S+)?$/i.test(raw) && !/^\/modulo\s+[a-z0-9-]+\s+(on|off|ligar|desligar)$/i.test(raw)) {
    return "⚙️ Use: `/modulo ID on` ou `/modulo ID off` (ex.: `/modulo personalidade off`).\nDigite `/modulos` para ver todos os IDs!";
  }

  const m = raw.match(/^\/modulo\s+([a-z0-9-]+)\s+(on|off|ligar|desligar)$/i);
  if (!m) return null;

  if (context.modoCriador === false) {
    return "🔒 O comando `/modulo` é exclusivo do modo administrador.";
  }

  const id = m[1].toLowerCase();
  if (PROIBIDAS.has(id)) return "ID inválido.";
  const department = DEPARTMENTS.find(d => d.id === id);
  if (!department) return "Não reconheci esse ID (`" + id + "`). Digite `/modulos` para ver a lista.";
  if (!department.control) {
    return "O departamento “" + department.name + "” é estrutural e não pode ser desligado por este comando.";
  }

  const settings = loadSettings();
  settings[id] = /^(on|ligar)$/i.test(m[2]);
  saveSettings(settings);

  return (settings[id] ? "🟢 Ativei " : "⚪ Desativei ") + department.name + ".";
}

const HANDLERS = [
  ["personalidade", Personality.handle, "😄 piada interativa"],
  ["mundo", Units.handle, "📏 conversão de unidades"],
  ["utilidades", (raw, ctx) => (utilHandle ? utilHandle(raw, ctx) : null), "🧰 utilidades"],
  ["conversor-texto", (raw, ctx) => (convTextoHandle ? convTextoHandle(raw, ctx) : null), "🔤 conversor de texto"],
  ["saude-bemestar", (raw, ctx) => (saudeHandle ? saudeHandle(raw, ctx) : null), "🩺 saúde e bem-estar"],
  ["estudos", (raw, ctx) => (estudosHandle ? estudosHandle(raw, ctx) : null), "🎓 modo estudante"],
  ["dev-ferramentas", (raw, ctx) => (devHandle ? devHandle(raw, ctx) : null), "🛠️ ferramentas dev"],
  ["programacao-termux", (raw, ctx) => (progTermuxHandle ? progTermuxHandle(raw, ctx) : null), "💻 termux & criador de apps"],
  ["saberes-pro", (raw, ctx) => (saberesProHandle ? saberesProHandle(raw, ctx) : null), "📚 sabedoria avançada"],
  ["inteligencia", Intelligence.handle, "🔢 cálculo local"],
  ["financas", Finance.handle, "💰 finanças"],
  ["ciencias", Science.handle, "🔬 fórmulas de física"],
  ["seguranca", Security.handle, "🔒 triagem de segurança"],
  ["educacao", Education.handle, "🧑‍🏫 quiz educativo"],
  ["criatividade", Creativity.handle, "🎨 criatividade"],
  ["estrategia", Planning.handle, "🗺️ planejamento"],
  ["automacao", Automation.handle, "🤖 planejamento de automação"]
];

const PRIORIDADE_MODO = {
  matematica: ["inteligencia", "mundo", "financas", "ciencias"],
  programacao: ["programacao-termux", "dev-ferramentas", "saberes-pro", "estrategia"],
  aprendizado: ["estudos", "educacao", "saberes-pro"],
  criatividade: ["criatividade", "personalidade"],
  raciocinio: ["inteligencia", "ciencias", "financas", "estrategia", "saberes-pro"]
};

function ordenarHandlers(mode = "auto") {
  const pref = PRIORIDADE_MODO[mode];
  if (!pref) return HANDLERS;
  const mapa = new Map(HANDLERS.map(h => [h[0], h]));
  const primeiro = pref.map(id => mapa.get(id)).filter(Boolean);
  const resto = HANDLERS.filter(h => !pref.includes(h[0]));
  return [...primeiro, ...resto];
}

function adaptarEntradaPorModo(raw, mode = "auto") {
  const s = String(raw || "").trim();
  if (!s || s.startsWith("/")) return s;
  const low = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (mode === "criatividade") {
    let m = s.match(/^(?:cria|crie|inventa|invente|faz|faca|escreva|escreve|gera|gere)?\s*(?:uma?\s+)?(?:hist[oó]ria|conto)\s*(?:sobre|de)?\s*(.+)$/i);
    if (m) return "/historia " + m[1].trim();
    m = s.match(/^(?:cria|crie|inventa|invente|faz|faca)?\s*(?:um\s+)?personagem\s*(?:sobre|de|para)?\s*(.+)$/i);
    if (m) return "/personagem " + m[1].trim();
    m = s.match(/^(?:me\s+d[eê]|d[eê]|cria|crie|manda|sugere)?\s*(?:umas?\s+)?ideias?\s*(?:de|para|sobre)?\s*(.+)$/i);
    if (m) return "/ideia " + m[1].trim();
  }

  if (mode === "aprendizado") {
    if (/^(?:me\s+)?(?:faz|faca|cria|manda|quero)\s+(?:um\s+)?(?:simulado|teste|prova)(?:\s+(?:de|sobre)\s+([a-z]+))?$/i.test(low)) {
      const mat = (low.match(/(?:de|sobre)\s+([a-z]+)$/) || [])[1] || "";
      return mat ? "/simulado " + mat : "/simulado";
    }
    if (/^(?:me\s+)?(?:manda|faz|cria|quero)\s+(?:um\s+)?flashcard(?:\s+(?:de|sobre)\s+([a-z]+))?$/i.test(low)) {
      const mat = (low.match(/(?:de|sobre)\s+([a-z]+)$/) || [])[1] || "";
      return mat ? "/flashcard " + mat : "/flashcard";
    }
    if (/^(?:a|b|c|d)$/i.test(low) && sessionStorage.getItem("bach_simulado_v1")) {
      return "/alt " + low.toUpperCase();
    }
    if (/^(?:a|b|c|d)$/i.test(low) && sessionStorage.getItem("bach_quiz_active_v1")) {
      return "/resposta " + low.toUpperCase();
    }
  }

  if (mode === "matematica") {
    const semPrefixo = s.replace(/^(?:resolva|calcule|quanto\s+[eé])\s+/i, "").trim();
    if (/^[\d\s()+\-*/^×÷%,.]+$/.test(semPrefixo) && /\d/.test(semPrefixo) && /[+\-*/^×÷%]/.test(semPrefixo)) {
      return "/calc " + semPrefixo;
    }
  }

  return s;
}

function executarPassosEmCadeia(raw, context = {}) {
  const mode = context.mode || "auto";
  if (mode !== "raciocinio" && !/^\/cadeia\s+/i.test(raw)) return null;

  const corpo = raw.replace(/^\/cadeia\s+/i, "").trim();
  const partes = corpo.split(/\s*;\s*|\s+e\s+depois\s+/i).map(x => x.trim()).filter(Boolean);
  if (partes.length < 2 || partes.length > 4) return null;

  const saidas = [];
  const lista = ordenarHandlers(mode);
  for (let i = 0; i < partes.length; i++) {
    const entrada = adaptarEntradaPorModo(partes[i], mode);
    let achou = null;
    for (const [id, fn, origin] of lista) {
      if (!enabled(id)) continue;
      const ans = AutoGuard.guard(id, () => fn(entrada, context));
      if (ans) {
        const txt = typeof ans === "object" && ans.texto ? ans.texto : String(ans);
        achou = "**Passo " + (i + 1) + " (" + origin + "):**\n" + txt;
        break;
      }
    }
    if (!achou) return null;
    saidas.push(achou);
  }

  return {
    texto: "🧠 **Execução em cadeia (Raciocínio BACH):**\n\n" + saidas.join("\n\n---\n\n"),
    origem: "🧠 raciocínio em cadeia"
  };
}

function handle(text, context = {}) {
  const rawOriginal = String(text || "").trim();
  const low = rawOriginal.toLowerCase();
  const mode = context.mode || "auto";

  if (Object.hasOwn(AJUDA_FERRAMENTAS, low)) {
    return { texto: AJUDA_FERRAMENTAS[low], origem: "🛠️ ajuda da ferramenta" };
  }

  if (/^\/(modulos|statusmodulos)$/i.test(rawOriginal)) {
    return { texto: listModules(), origem: "🧠 catálogo de módulos" };
  }

  if (/^\/(diagnostico|saude)$/i.test(rawOriginal)) {
    return { texto: AutoGuard.diagnose(), origem: "🛡️ autoguard" };
  }

  if (/^\/rollback$/i.test(rawOriginal)) {
    if (context.modoCriador === false) {
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

  const setting = moduleCommand(rawOriginal, context);
  if (setting) return { texto: setting, origem: "⚙️ gerenciamento de módulos" };

  const cadeia = executarPassosEmCadeia(rawOriginal, context);
  if (cadeia) return cadeia;

  const raw = adaptarEntradaPorModo(rawOriginal, mode);
  const listaOrdenada = ordenarHandlers(mode);

  for (const [id, fn, origin] of listaOrdenada) {
    if (!enabled(id)) continue;

    const answer = AutoGuard.guard(id, () => fn(raw, context));
    if (answer) {
      if (typeof answer === "object" && answer.texto) {
        return { origem: origin, ...answer };
      }
      return { texto: answer, origem: origin };
    }
  }

  return null;
}

function modePrompt(mode = "auto") {
  const map = {
    auto: "MODO AUTOMÁTICO: detecta a intenção e escolhe o melhor departamento próprio da BACH.",
    raciocinio: "MODO RACIOCÍNIO: aceita tarefas encadeadas (separadas por `;`) e aprofunda pesquisas.",
    pesquisa: "MODO PESQUISA: prioriza busca em fontes da web e Wikipédia com citação.",
    aprendizado: "MODO APRENDIZADO: prioriza flashcards, simulados, quiz e explicações didáticas.",
    programacao: "MODO PROGRAMAÇÃO: prioriza Termux, criação de apps, ferramentas dev e revisão de código.",
    matematica: "MODO MATEMÁTICA: prioriza cálculos, conversões, juros e fórmulas físicas.",
    visao: "MODO VISÃO: analisa dimensões, cores e textos extraídos por OCR de imagens/vídeos.",
    voz: "MODO VOZ: lê respostas em voz alta automaticamente em português.",
    criatividade: "MODO CRIATIVIDADE: cria histórias, personagens e ideias mesmo sem usar comandos `/`.",
    documentos: "MODO DOCUMENTOS: analisa, resume e inspeciona arquivos/textos enviados."
  };
  return Object.hasOwn(map, mode) ? map[mode] : map.auto;
}

function instructions() {
  return `REGRAS DA BACH AI (MOTOR PRÓPRIO):
- 100% independente de IAs externas.
- Usa memória contínua, rede neural própria e pesquisa web verificada.`;
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
