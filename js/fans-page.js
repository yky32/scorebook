(function () {
  const data = window.SCOREBOOK;
  const app = document.getElementById("app");
  if (!data || !app) return;

  const PAY = [
    { fan: 1, w51: 1, w12: 2, cap: "—" },
    { fan: 2, w51: 2, w12: 4, cap: "—" },
    { fan: 3, w51: 4, w12: 8, cap: "—" },
    { fan: 4, w51: 8, w12: 16, cap: "—" },
    { fan: 5, w51: 16, w12: 32, cap: "—" },
    { fan: 6, w51: 32, w12: 64, cap: "—" },
    { fan: 7, w51: 64, w12: 128, cap: "—" },
    { fan: 8, w51: 128, w12: 256, cap: 128 },
    { fan: 9, w51: 256, w12: 512, cap: "—" },
    { fan: 10, w51: 512, w12: 1024, cap: 256 }
  ];

  function payBlock() {
    return `
      <div class="section" id="pay">
        <h2>番數換銀碼</h2>
        <p class="note">番係牌型分數；128／256 係出銂一家估嘅支數。自摸視枱規：三家各估或總數 1.5 倍。</p>
        <div style="overflow:auto;margin-top:12px">
          <table class="score">
            <thead><tr><th>番</th><th>五一</th><th>一二蚊</th><th>近枱檔 8=128、10=256</th></tr></thead>
            <tbody>${PAY.map((r) => `<tr><td>${r.fan}</td><td class="fan">$${r.w51}</td><td>$${r.w12}</td><td class="fan">${r.cap === "—" ? "—" : "$" + r.cap}</td></tr>`).join("")}</tbody>
          </table>
        </div>
        <ul class="note" style="margin-top:12px">
          <li><b>8 番 = $128</b>：大三元呢檔。五一表同樣係 128。</li>
          <li><b>10 番 = $256</b>：滿貫檔，8 番再加倍。五一正常 10 番係 $512，呢枱改封 $256。</li>
          <li>一二蚊係五一再加倍：8 番 $256，10 番 $1024。</li>
        </ul>
      </div>`;
  }

  function isFans(hash) {
    return hash === "fans" || hash === "fan" || hash === "pay" || hash.startsWith("fans/");
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
    app.innerHTML = `
      <article class="page wrap">
        <div class="crumb"><a href="#home">計分館</a> / 番數表</div>
        <div class="kicker">FAN + PAYOUT</div>
        <h1>番數表</h1>
        <p class="lede">左邊計番，右邊換錢。港麻頁有 8番=$128、10番=$256。</p>
        <div class="chips" id="fan-tabs">
          ${tabs.map((t) => `<button class="chip${t.id === g.id ? " active" : ""}" data-id="${t.id}">${t.name}</button>`).join("")}
        </div>
        <div class="search-row">
          <input id="fan-q" type="search" value="${query || ""}" placeholder="搜尋：平胡、清一色、中發白…" />
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
        ${g.id === "hk-mj" ? payBlock() : ""}
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
    paint(id === "pay" ? "hk-mj" : id, "");
  }

  window.addEventListener("hashchange", route);
  route();
})();
