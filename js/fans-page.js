(function () {
  const data = window.SCOREBOOK;
  const app = document.getElementById("app");
  if (!data || !app) return;

  function isFans(hash) {
    return hash === "fans" || hash === "fan" || hash.startsWith("fans/");
  }

  function paint(activeId, query) {
    const ids = ["hk-mj", "tw-mj-hk", "tw-mj-tai"];
    const tabs = ids.map((id) => data.games.find((g) => g.id === id)).filter(Boolean);
    const g = tabs.find((x) => x.id === activeId) || tabs[0];
    if (!g) return;
    const q = (query || "").trim().toLowerCase();
    const rows = (g.scoring || []).filter((s) => {
      if (!q) return true;
      return (s.name + " " + s.fan + " " + (s.note || "")).toLowerCase().includes(q);
    });
    const samples = (g.samples || []).filter((s) => !q || (s.name + s.note).toLowerCase().includes(q));
    app.innerHTML = `
      <article class="page wrap">
        <div class="crumb"><a href="#home">計分館</a> / 番數表</div>
        <div class="kicker">FAN TABLE</div>
        <h1>番數表</h1>
        <p class="lede">港麻 13 張、港式台麻 16 張番數、台數三張表。可搜尋番種。家規大過網頁。</p>
        <div class="chips" id="fan-tabs">
          ${tabs.map((t) => `<button class="chip${t.id === g.id ? " active" : ""}" data-id="${t.id}">${t.name}</button>`).join("")}
        </div>
        <div class="search-row">
          <input id="fan-q" type="search" value="${query || ""}" placeholder="搜尋：平胡、清一色、中發白、滿貫…" />
        </div>
        <div class="section">
          <h2>${g.name} · ${g.unit}</h2>
          <p class="note">${g.summary}</p>
          <div style="overflow:auto;margin-top:12px">
            <table class="score">
              <thead><tr><th>名稱</th><th>番／台</th><th>解說</th></tr></thead>
              <tbody>${rows.map((s) => `<tr><td>${s.name}</td><td class="fan">${s.fan}</td><td>${s.note || ""}</td></tr>`).join("") || "<tr><td colspan=3>沒有符合的番種</td></tr>"}</tbody>
            </table>
          </div>
        </div>
        ${samples.length ? `<div class="section"><h2>相關牌型</h2><div class="sample-list">${samples.map((s) => window.SCOREBOOK_RENDER_SAMPLE ? window.SCOREBOOK_RENDER_SAMPLE(s) : `<div class="sample"><strong>${s.name}</strong> ${s.note || ""}</div>`).join("")}</div></div>` : ""}
        <p class="note section"><a href="#game/${g.id}">開 ${g.name} 完整頁</a> · <a href="#gallery">牌型圖解</a></p>
      </article>`;
    document.title = "番數表 · 計分館";
    document.querySelectorAll("#fan-tabs .chip").forEach((b) => {
      b.onclick = () => paint(b.getAttribute("data-id"), (document.getElementById("fan-q") || {}).value);
    });
    const input = document.getElementById("fan-q");
    if (input) input.addEventListener("input", () => paint(g.id, input.value));
  }

  function route() {
    const hash = location.hash.replace(/^#/, "");
    if (!isFans(hash)) return;
    const id = hash.startsWith("fans/") ? hash.slice(5) : "hk-mj";
    paint(id, "");
  }

  window.addEventListener("hashchange", route);
  route();
})();
