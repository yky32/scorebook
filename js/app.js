(function () {
  const data = window.SCOREBOOK;
  const app = document.getElementById("app");

  function $(sel, root = document) { return root.querySelector(sel); }

  function route() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash || hash === "home") return renderHome();
    if (hash === "about") return renderAbout();
    if (hash === "cards" || hash === "poker") return renderCards();
    if (hash === "mj") return renderHub("麻雀", "麻雀計分", "13 張港麻同 16 張台麻計法完全唔同，分開查，唔好撈亂。", (g) => g.category === "麻雀");
    if (hash === "tables") return renderHub("檮面", "檮面賠率", "百家樂、骰寶、魚蝦蟹。只寫通行賠率，實際以枱面告示同家規為準。", (g) => g.category === "檮面");
    if (hash.startsWith("game/")) return renderGame(hash.slice(5));
    renderHome();
  }

  function layout(inner, title) {
    document.title = title ? title + " · 計分館" : "計分館 · 牌局計分百科";
    app.innerHTML = inner;
  }

  function renderHome() {
    layout(`
      <section class="hero wrap">
        <div class="kicker">SCORING ATLAS · HK TABLES</div>
        <h1>計分館</h1>
        <p class="lede">${data.site.blurb}</p>
        <div class="hubs">
          <a class="card" href="#mj"><span class="tag">TILES</span><h3>麻雀</h3><p class="meta">港式 13 張、台灣 16 張番數／台數、國標。開枱對番表。</p></a>
          <a class="card" href="#cards"><span class="tag">CARDS</span><h3>撲克三件套</h3><p class="meta">德州、鋤大D、21點。同一副牌，三種計法。</p></a>
          <a class="card" href="#tables"><span class="tag">TABLE</span><h3>檮面</h3><p class="meta">百家樂、骰寶、魚蝦蟹。只記賠率，唔開局。</p></a>
        </div>
        <div class="search-row">
          <input id="q" type="search" placeholder="搜尋：平胡、牛牛、百家樂、鋤大D…" />
          <select id="cat">
            ${data.categories.map((c) => `<option>${c}</option>`).join("")}
          </select>
        </div>
        <div class="chips" id="chips"></div>
      </section>
      <section class="wrap grid" id="grid"></section>
    `, "");

    const q = $("#q");
    const cat = $("#cat");
    const grid = $("#grid");
    const chips = $("#chips");

    data.categories.slice(1).forEach((c) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = c;
      b.onclick = () => { cat.value = c; paint(); };
      chips.appendChild(b);
    });

    function paint() {
      const query = (q.value || "").trim().toLowerCase();
      const category = cat.value;
      chips.querySelectorAll(".chip").forEach((el) => {
        el.classList.toggle("active", el.textContent === category);
      });
      const list = data.games.filter((g) => {
        const okCat = category === "全部" || g.category === category;
        const blob = [g.name, g.summary, g.unit, ...(g.scoring || []).map((s) => s.name + s.note)].join(" ").toLowerCase();
        return okCat && (!query || blob.includes(query));
      });
      grid.innerHTML = list.map((g) => `
        <a class="card" href="#game/${g.id}">
          <span class="tag">${g.category}</span>
          <h3>${g.name}</h3>
          <div class="meta">${g.players} · ${g.hand}</div>
          <p class="meta">${g.summary}</p>
        </a>
      `).join("") || `<p class="note">沒有符合的項目。</p>`;
    }

    q.addEventListener("input", paint);
    cat.addEventListener("change", paint);
    paint();
  }

  function renderHub(cat, title, lede, pred) {
    const list = data.games.filter(pred);
    layout(`
      <article class="page wrap">
        <div class="crumb"><a href="#home">計分館</a> / ${cat}</div>
        <div class="kicker">${cat}</div>
        <h1>${title}</h1>
        <p class="lede">${lede}</p>
        <div class="grid" style="margin-top:28px">
          ${list.map((g) => `
            <a class="card" href="#game/${g.id}">
              <span class="tag">${g.category}</span>
              <h3>${g.name}</h3>
              <div class="meta">${g.players} · ${g.hand}</div>
              <p class="meta">${g.summary}</p>
            </a>
          `).join("")}
        </div>
      </article>
    `, title);
  }

  function renderCards() {
    const core = ["holdem", "big2", "blackjack"].map((id) => data.games.find((g) => g.id === id)).filter(Boolean);
    const more = data.games.filter((g) => g.category === "撲克" && !["holdem", "big2", "blackjack"].includes(g.id));
    layout(`
      <article class="page wrap">
        <div class="crumb"><a href="#home">計分館</a> / 撲克</div>
        <div class="kicker">PLAYING CARDS</div>
        <h1>撲克三件套</h1>
        <p class="lede">先集中三款香港最常打的紙牌：德州撲克、鋤大D、21點。同一副 52 張，計分方法完全不同，所以分開頁、同一個入口。</p>
        <div class="grid" style="margin-top:28px">
          ${core.map((g, i) => `
            <a class="card" href="#game/${g.id}">
              <span class="tag">0${i + 1} · 撲克</span>
              <h3>${g.id === "holdem" ? "撲克（德州）" : g.name}</h3>
              <div class="meta">${g.players} · ${g.hand}</div>
              <p class="meta">${g.summary}</p>
            </a>
          `).join("")}
        </div>
        <div class="panel section">
          <h2>點解只先收三款</h2>
          <p>紙牌變體極多。先把使用率最高的三款做成標準計分頁，其他放在下面作延伸。</p>
        </div>
        ${more.length ? `
        <div class="section">
          <h2>同屬撲克、之後可開</h2>
          <div class="grid">
            ${more.map((g) => `
              <a class="card" href="#game/${g.id}">
                <span class="tag">${g.category}</span>
                <h3>${g.name}</h3>
                <div class="meta">${g.players} · ${g.hand}</div>
              </a>
            `).join("")}
          </div>
        </div>` : ""}
      </article>
    `, "撲克");
  }

  function renderAbout() {
    layout(`
      <article class="page wrap">
        <div class="crumb"><a href="#home">計分館</a> / 關於</div>
        <h1>關於這本簿</h1>
        <div class="panel">
          <p>計分館係<strong>計分參考</strong>，唔係賭場、唔收注、唔撥合賭局。未滿 18 歲唔適用。香港對非法賭博有法例，玩家自行守法。</p>
          <p>主航道三條：麻雀番表、撲克三件套、檮面賠率。家規永遠大過網頁。</p>
        </div>
      </article>
    `, "關於");
  }

  function renderGame(id) {
    const g = data.games.find((x) => x.id === id);
    if (!g) return renderHome();
    const rows = (g.scoring || []).map((s) => `
      <tr><td>${s.name}</td><td class="fan">${s.fan}</td><td>${s.note || ""}</td></tr>
    `).join("");
    layout(`
      <article class="page wrap">
        <div class="crumb"><a href="#home">計分館</a> / ${g.category}</div>
        <div class="kicker">${g.category}</div>
        <h1>${g.name}</h1>
        <p class="lede">${g.summary}</p>
        <div class="badge-row">
          <span class="badge">${g.players}</span>
          <span class="badge">${g.hand}</span>
          <span class="badge">計分單位：${g.unit}</span>
        </div>
        <div class="two-col section">
          <div class="panel">
            <h2>玩法要點</h2>
            <ol class="steps">${g.rules.map((r) => `<li>${r}</li>`).join("")}</ol>
          </div>
          <div>${renderCalc(g)}</div>
        </div>
        <div class="section">
          <h2>計分表</h2>
          <p class="note">數字為常見值，家規請自行覆蓋。</p>
          <div style="overflow:auto">
            <table class="score">
              <thead><tr><th>名稱</th><th>分數</th><th>解說</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
        ${g.extras && g.extras.length ? `<div class="section panel"><h2>台面備註</h2><ul>${g.extras.map((e) => `<li>${e}</li>`).join("")}</ul></div>` : ""}
      </article>
    `, g.name);
    wireCalc(g);
  }

  function renderCalc(g) {
    if (g.calculator === "tw-tai" || g.calculator === "tw-fan") {
      const title = g.calculator === "tw-fan" ? "番數計算機" : "台數計算機";
      const u1 = g.calculator === "tw-fan" ? "底（$）" : "底";
      const u2 = g.calculator === "tw-fan" ? "一番（$）" : "每台";
      const u3 = g.calculator === "tw-fan" ? "番數" : "台數";
      const v1 = g.calculator === "tw-fan" ? "50" : "100";
      const v2 = g.calculator === "tw-fan" ? "10" : "20";
      const v3 = g.calculator === "tw-fan" ? "8" : "4";
      return `<div class="panel"><h2>${title}</h2><div class="calc"><div><label>${u1}</label><input id="c-base" type="number" value="${v1}" /></div><div><label>${u2}</label><input id="c-unit" type="number" value="${v2}" /></div><div><label>${u3}</label><input id="c-tai" type="number" value="${v3}" /></div><div><label>胡法</label><select id="c-win"><option value="tsumo">自摸（收三家）</option><option value="ron">出銂（收一家）</option></select></div></div><div class="result" id="c-out"></div></div>`;
    }
    return `<div class="panel"><h2>查表提示</h2><p class="note">用左列規則 + 下方計分表即可。開局先講完加倍條件。</p></div>`;
  }

  function wireCalc(g) {
    if (!g.calculator) return;
    const base = $("#c-base");
    const unit = $("#c-unit");
    const tai = $("#c-tai");
    const win = $("#c-win");
    const out = $("#c-out");
    const paint = () => {
      const one = (Number(base.value) || 0) + (Number(unit.value) || 0) * (Number(tai.value) || 0);
      const times = win.value === "tsumo" ? 3 : 1;
      const label = g.calculator === "tw-fan" ? "番" : "台";
      out.innerHTML = `每家應付 <b>$${one}</b><br/>贏家共收 <b>$${one * times}</b>（${win.value === "tsumo" ? "自摸 ×3" : "出銂 ×1"}，${tai.value} ${label}）`;
    };
    [base, unit, tai, win].forEach((el) => el.addEventListener("input", paint));
    win.addEventListener("change", paint);
    paint();
  }

  window.addEventListener("hashchange", route);
  route();
})();
