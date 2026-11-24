/* BACH AI 4.5 — AUTOGUARD (Monitoramento, Watchdog, Failure Memory, Self-Healing & Rollback) */

const K_FAIL = "bach_failures_v1";
const K_SNAP = "bach_snapshots_v1";
const K_PERF = "bach_perf_v1";

let booted = false;

function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v !== null && v !== undefined ? v : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false;
  }
}

function storageStats() {
  let bytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || "";
      const v = localStorage.getItem(k) || "";
      bytes += (k.length + v.length) * 2;
    }
  } catch {}
  const kb = +(bytes / 1024).toFixed(1);
  const limitKb = 5120;
  const pct = Math.min(100, Math.round((kb / limitKb) * 100));
  return { kb, limitKb, pct };
}

function healStorage() {
  const st = storageStats();
  if (st.pct < 82) return { healed: false, beforePct: st.pct, afterPct: st.pct };

  try {
    const kb = readJSON("bach_conhecimento_v2", []);
    if (Array.isArray(kb) && kb.length > 15) writeJSON("bach_conhecimento_v2", kb.slice(-15));
    const sess = readJSON("bach_sessoes_v1", []);
    if (Array.isArray(sess) && sess.length > 35) writeJSON("bach_sessoes_v1", sess.slice(0, 35));
    const arqs = readJSON("bach_arquivos_v1", []);
    if (Array.isArray(arqs) && arqs.length > 20) writeJSON("bach_arquivos_v1", arqs.slice(-20));
  } catch {}

  const after = storageStats();
  logPerf("healing");
  return { healed: true, beforePct: st.pct, afterPct: after.pct };
}

function createSnapshot() {
  try {
    const brain = localStorage.getItem("rizik_brain_v1");
    const mente = localStorage.getItem("bach_mente_v1");
    if (!brain) return false;
    JSON.parse(brain);
    if (mente) JSON.parse(mente);

    const snaps = readJSON(K_SNAP, []);
    snaps.push({ at: Date.now(), brain, mente: mente || null });
    writeJSON(K_SNAP, snaps.slice(-2));
    return true;
  } catch {
    return false;
  }
}

function rollback() {
  const snaps = readJSON(K_SNAP, []);
  if (!Array.isArray(snaps) || !snaps.length) {
    return { ok: false, msg: "Ainda não há snapshot salvo para restaurar." };
  }
  const last = snaps[snaps.length - 1];
  try {
    if (last.brain) localStorage.setItem("rizik_brain_v1", last.brain);
    if (last.mente) localStorage.setItem("bach_mente_v1", last.mente);
    logPerf("rollback");
    return { ok: true, at: last.at };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

function recordFailure({ module = "geral", type = "error", input = "", detail = "" }) {
  const list = readJSON(K_FAIL, []);
  list.push({
    at: Date.now(),
    module: String(module).slice(0, 30),
    type: String(type).slice(0, 30),
    input: String(input).slice(0, 120),
    detail: String(detail).slice(0, 180)
  });
  writeJSON(K_FAIL, list.slice(-30));
  logPerf("error");
}

function logPerf(kind, ms = 0) {
  const p = readJSON(K_PERF, { totalCalls: 0, totalMs: 0, errors: 0, healings: 0, rollbacks: 0, slowCount: 0 });
  if (kind === "call") {
    p.totalCalls++;
    p.totalMs += ms;
    if (ms > 4000) p.slowCount++;
  } else if (kind === "error") p.errors++;
  else if (kind === "healing") p.healings++;
  else if (kind === "rollback") p.rollbacks++;
  writeJSON(K_PERF, p);
}

function guard(moduleName, fn) {
  const t0 = performance.now();
  try {
    const out = fn();
    logPerf("call", performance.now() - t0);
    return out;
  } catch (err) {
    logPerf("call", performance.now() - t0);
    recordFailure({
      module: moduleName,
      type: "exception",
      detail: err?.message || String(err)
    });
    console.warn("[Watchdog]", moduleName, err);
    return null;
  }
}

function securityScan(code) {
  const issues = [];
  if (/\beval\s*\(/.test(code)) issues.push("Uso de eval() — risco de execução arbitrária.");
  if (/new\s+Function\s*\(/.test(code)) issues.push("Uso de Function() dinâmica — prefira parser seguro.");
  if (/innerHTML\s*=/.test(code)) issues.push("Atribuição direta a innerHTML — prefira textContent para dados do usuário.");
  if (/AIza[0-9A-Za-z\-_]{20,}|sk-[0-9A-Za-z]{20,}/.test(code)) issues.push("Possível chave secreta exposta no código.");
  return issues;
}

function diagnose() {
  const st = storageStats();
  const p = readJSON(K_PERF, { totalCalls: 0, totalMs: 0, errors: 0, healings: 0, rollbacks: 0, slowCount: 0 });
  const fails = readJSON(K_FAIL, []);
  const snaps = readJSON(K_SNAP, []);
  const avg = p.totalCalls ? Math.round(p.totalMs / p.totalCalls) : 0;

  const tarefas = [];
  if (st.pct > 70) tarefas.push("• Otimizar espaço: memória do navegador em " + st.pct + "%.");
  if (p.errors > 0) tarefas.push("• Revisar " + p.errors + " falha(s) registrada(s) na Failure Memory.");
  if (p.slowCount > 2) tarefas.push("• Otimizar consultas lentas (" + p.slowCount + " acima de 4s).");
  if (!tarefas.length) tarefas.push("• Sistema estável: nenhuma anomalia crítica detectada.");

  const ultimas = fails.slice(-4).reverse().map(f =>
    "• [" + f.module + "/" + f.type + "] " + (f.input ? "“" + f.input + "” → " : "") + f.detail
  );

  return "🛡️ **DIAGNÓSTICO & MONITORAMENTO BACH AI**\n\n" +
    "📊 **Saúde do Sistema:**\n" +
    "• Armazenamento usado: " + st.kb + " KB / " + st.limitKb + " KB (" + st.pct + "%)\n" +
    "• Chamadas monitoradas: " + p.totalCalls + " (média " + avg + " ms)\n" +
    "• Watchdog / Falhas capturadas: " + p.errors + "\n" +
    "• Self-Healing executados: " + p.healings + " • Rollbacks: " + p.rollbacks + "\n" +
    "• Snapshots salvos para recuperação: " + snaps.length + "\n\n" +
    "🧠 **Planejador de Melhorias:**\n" + tarefas.join("\n") +
    (ultimas.length ? "\n\n🧾 **Últimos registros (Failure Memory):**\n" + ultimas.join("\n") : "") +
    "\n\n💡 Comandos: `/diagnostico` • `/rollback` (restaura memória limpa)";
}

function boot() {
  if (booted) return;
  booted = true;
  healStorage();
  createSnapshot();

  if (typeof window !== "undefined") {
    window.addEventListener("error", ev => {
      recordFailure({
        module: "runtime",
        type: "js-error",
        detail: (ev.message || "Erro de script") + (ev.filename ? " (" + ev.filename.split("/").pop() + ":" + ev.lineno + ")" : "")
      });
    });

    window.addEventListener("unhandledrejection", ev => {
      recordFailure({
        module: "async",
        type: "promise-rejection",
        detail: ev.reason?.message || String(ev.reason || "Promise rejeitada")
      });
    });
  }
}

boot();

export const AutoGuard = {
  boot,
  guard,
  healStorage,
  createSnapshot,
  rollback,
  recordFailure,
  securityScan,
  diagnose,
  storageStats
};
