(function () {
  const data = window.SCOREBOOK;
  const app = document.getElementById("app");
  if (!data || !app) return;

  const FANS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const BASE = { chicken: 0.25, w51: 0.5, w12: 1 };

  function unit(fan, spicy) {
    if (fan <= 4) return Math.pow(2, fan);
    if (spicy === "full") return Math.pow(2, fan);
    const even = fan % 2 === 0;
    return even ? Math.pow(2, fan / 2 + 2) : Math.pow(2, (fan - 1) / 2 + 2) * 1.5;
  }

  function cell(fan, key, mode, spicy) {
    const n = BASE[key] * unit(fan, spicy) * (mode === "fullron" ? 4 : 1);
    return Number.isInteger(n) ? n : Number(n.toFixed(2));
  }

  function payTable(mode, spicy) {
    return `
      <div style="overflow:auto;margin-top:12px">
        <table class="score">
          <thead><tr><th>番</th><th>二五雞</th><th>五一</th><th>一二蚊</th></tr></thead>
          <tbody>${FANS.map((f) => {
            const a = cell(f, "chicken", mode, spicy);
            const b = cell(f, "w51", mode, spicy);
            const c = cell(f, "w12", mode, spicy);
            const mark = (mode === "fullron" && spicy === "half" && (f === 8 || f === 10)) ? " class=\"fan\"" : "";
            return `<tr><td>${f === 0 ? "雞胡" : f}</td><td>$${a}</td><td${mark}>$${b}</td><td>$${c}</td></tr>`;
          }).join("")}</tbody>
        </table>
      </div>`;
  }

  function payBlock(mode, spicy) {
    const modeLabel = mode === "fullron" ? "全銂制" : "半銂制";
    const spicyLabel = spicy === "full" ? "辣辣上" : "半辣上";
    const hint = mode === "fullron"
      ? "表內數字 = 出銂者實付。自摸三家各付表內 1/4（同半銂一份）。"
      : "出銂者付雙份，其他兩家付單份；自摸三家各付雙份。表內係單份金額。";
    return `
      <div class="section" id="pay">
        <h2>廣東麻雀籌碼計法</h2>
        <p class="note">來源：<a href="https://zh.wikipedia.org/zh-hk/%E5%BB%A3%E6%9D%B1%E9%BA%BB%E9%9B%80%E7%B1%8C%E7%A2%BC%E8%A8%88%E6%B3%95" target="_blank" rel="noreferrer">維基 · 廣東麻雀籌碼計法</a>。你個 8番=$128、10番=$256 係 <b>全銂 + 半辣上 + 五一</b>。</p>
        <div class="chips" id="pay-mode">
          <button class="chip${mode === "halfron" ? " active" : ""}" data-mode="halfron">半銂制</button>
          <button class="chip${mode === "fullron" ? " active" : ""}" data-mode="fullron">全銂制</button>
        </div>
        <div class="chips" id="pay-spicy" style="margin-top:8px">
          <button class="chip${spicy === "half" ? " active" : ""}" data-spicy="half">半辣上</button>
          <button class="chip${spicy === "full" ? " active" : ""}" data-spicy="full">辣辣上</button>
        </div>
        <p class="note" style="margin-top:10px"><b>${modeLabel} · ${spicyLabel}</b> — ${hint}</p>
        ${payTable(mode, spicy)}
        <ul class="note" style="margin-top:12px">
          <li>二五雞 / 五一 / 一二蚊：雞胡單份 $0.25 / $0.5 / $1，每加 1 番加倍，四番起再分辣辣或半辣。</li>
          <li>辣辣上：5=4×2，6=5×2。半辣上：5=4×1.5，6=4×2，7=6×1.5，8=6×2。</li>
          <li>全銂制表內 = 出銂一家付齊（相當於半銂單份 × 4），所以五一半辣：<b>8 番 $128、10 番 $256</b>。</li>
        </ul>
      </div>`;
  }

  function isFans(hash) {
    return hash === "fans" || hash === "fan" || hash === "pay" || hash.startsWith("fans/");
  }

  function paint(activeId, query, mode, spicy) {
    mode = mode || "fullron";
    spicy = spicy || "half";
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
        <div class="kicker">FAN + CHIPS</div>
        <h1>番數表</h1>
        <p class="lede">港麻番種 + 廣東籌碼計法（半銂／全銂、半辣／辣辣、二五雞／五一／一二蚊）。</p>
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
        ${g.id === "hk-mj" ? payBlock(mode, spicy) : ""}
        <p class="note section"><a href="#game/${g.id}">開 ${g.name} 完整頁</a> · <a href="#gallery">牌型圖解</a></p>
      </article>`;
    document.title = "番數表 · 計分館";
    document.querySelectorAll("#fan-tabs .chip").forEach((b) => {
      b.onclick = () => paint(b.getAttribute("data-id"), (document.getElementById("fan-q") || {}).value, mode, spicy);
    });
    document.querySelectorAll("#pay-mode .chip").forEach((b) => {
      b.onclick = () => paint(g.id, (document.getElementById("fan-q") || {}).value, b.getAttribute("data-mode"), spicy);
    });
    document.querySelectorAll("#pay-spicy .chip").forEach((b) => {
      b.onclick = () => paint(g.id, (document.getElementById("fan-q") || {}).value, mode, b.getAttribute("data-spicy"));
    });
    const input = document.getElementById("fan-q");
    if (input) input.addEventListener("input", () => paint(g.id, input.value, mode, spicy));
  }

  function route() {
    const hash = location.hash.replace(/^#/, "");
    if (!isFans(hash)) return;
    const id = hash.startsWith("fans/") ? hash.slice(5) : "hk-mj";
    paint(id === "pay" ? "hk-mj" : id, "", "fullron", "half");
  }

  window.addEventListener("hashchange", route);
  route();
})();
