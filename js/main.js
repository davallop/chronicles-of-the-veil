/* ============================================================
   Crónicas del Umbral — arranque
   ============================================================ */
(function () {
  "use strict";
  const RPG = (globalThis.RPG = globalThis.RPG || {});

  function fatal(err) {
    console.error(err);
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = '<div class="screen"><div class="panel" style="max-width:640px;margin:8vh auto">' +
      '<h2>Something broke beyond the Veil</h2>' +
      '<p class="muted">The game could not be loaded. Open the browser console (F12) for details.</p>' +
      '<pre style="white-space:pre-wrap;font-size:11px;color:#e08a8a">' +
      String(err && err.stack ? err.stack : err).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])) +
      '</pre><button class="btn btn-primary mt-2" onclick="location.reload()">Reload</button></div></div>';
  }

  function boot() {
    try {
      if (!RPG.data || !RPG.engine || !RPG.ui) throw new Error("Required game modules are missing (data/engine/ui).");
      RPG.ui.init();
      console.log("%cChronicles of the Veil", "color:#d4af37;font-weight:bold", "— ready. Use RPG.game to inspect the current story.");
    } catch (e) {
      fatal(e);
    }
  }

  window.addEventListener("error", (e) => {
    if (e && e.message) console.error("Runtime error:", e.message);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  RPG.boot = boot;
})();
