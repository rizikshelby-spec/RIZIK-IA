/* BACH AI - HISTÓRICO 1.0
   Guarda as conversas e mostra em até 15 páginas (10 por página = 150 conversas).
   A conversa atual também fica na lista; "Nova conversa" não apaga as antigas. */

const KEY = "bach_sessoes_v1", KEY_ATUAL = "bach_conv_atual";
export const PAGINAS = 15, POR_PAGINA = 10, MAXIMO = PAGINAS * POR_PAGINA;

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function carregar() {
  try { const a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a : []; }
  catch { return []; }
}

function gravar(lista) {
  let l = lista.slice(0, MAXIMO);
  // se estourar a cota do navegador, descarta as mais antigas até caber
  while (l.length) {
    try { localStorage.setItem(KEY, JSON.stringify(l)); return true; }
    catch { l = l.slice(0, -1); }
  }
  return false;
}

const ordenar = l => l.slice().sort((a, b) => b.em - a.em);

function idAtual() {
  try {
    let id = localStorage.getItem(KEY_ATUAL);
    if (!id) { id = novoId(); localStorage.setItem(KEY_ATUAL, id); }
    return id;
  } catch { return "sem-armazenamento"; }
}

function titulo(msgs) {
  const u = msgs.find(m => m.type === "user" && String(m.text).trim());
  if (!u) return "Conversa nova";
  const t = String(u.text).replace(/^📎\s*/, "Arquivo: ").replace(/\s+/g, " ").trim();
  return t.length > 48 ? t.slice(0, 47) + "…" : t;
}

/* Chamado a cada mensagem: cria ou atualiza a conversa atual na lista. */
function salvarAtual(msgs) {
  const lista = carregar(), id = idAtual();
  const util = (msgs || []).filter(m => m && String(m.text || "").trim());
  const i = lista.findIndex(s => s.id === id);
  if (!util.some(m => m.type === "user")) { if (i >= 0) { lista.splice(i, 1); gravar(lista); } return; }
  const item = {
    id, titulo: titulo(util), em: Date.now(),
    msgs: util.slice(-80).map(m => ({ type: m.type === "user" ? "user" : "bot", text: String(m.text).slice(0, 3000) }))
  };
  if (i >= 0) lista[i] = { ...lista[i], ...item, criada: lista[i].criada || item.em }; else lista.push({ ...item, criada: item.em });
  gravar(ordenar(lista));
}

function listar(pagina = 1, termo = "") {
  const t = norm(termo).trim();
  let l = ordenar(carregar());
  if (t) l = l.filter(s => norm(s.titulo).includes(t) || s.msgs.some(m => norm(m.text).includes(t)));
  const totalPaginas = Math.max(1, Math.ceil(l.length / POR_PAGINA));
  const p = Math.min(Math.max(1, pagina | 0), PAGINAS);
  return {
    pagina: p, paginas: PAGINAS, totalPaginas: Math.min(totalPaginas, PAGINAS), total: l.length, atual: idAtual(),
    itens: l.slice((p - 1) * POR_PAGINA, p * POR_PAGINA).map(s => ({ id: s.id, titulo: s.titulo, em: s.em, qtd: s.msgs.length }))
  };
}

function abrir(id) {
  const s = carregar().find(x => x.id === id);
  if (!s) return null;
  try { localStorage.setItem(KEY_ATUAL, id); } catch {}
  return s.msgs;
}

function nova() {
  const id = novoId();
  try { localStorage.setItem(KEY_ATUAL, id); } catch {}
  return id;
}

function apagar(id) {
  gravar(carregar().filter(s => s.id !== id));
  if (id === idAtual()) return nova();
  return null;
}

function limparTudo() {
  try { localStorage.removeItem(KEY); } catch {}
  return nova();
}

const tudo = () => ordenar(carregar());

export const Historico = { salvarAtual, listar, abrir, nova, apagar, limparTudo, tudo, idAtual, PAGINAS, POR_PAGINA, MAXIMO };
