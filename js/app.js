(function () {
  const data = window.SCOREBOOK;
  const app = document.getElementById("app");

  function $(sel, root = document) { return root.querySelector(sel); }

  function route() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash || hash === "home") return renderHome();
    if (hash === "about") return renderAbout();
    if (hash.startsWith("game/")) return renderGame(hash.slice(5));
    renderHome();
  }

  function layout(inner, title) {
    document.title = title ? title + " · 計分館" : "計分館 · 牌類計分玩法";
    app.innerHTML = inner;
  }

  function renderHome() {
    layout(`
      <section class="hero wrap">
        <div class="kicker">CARD & TILE SCORING ATLAS</div>
        <h1>計分館</h1>
        <p class="lede">${data.site.blurb}</p>
        <div class="search-row">
          <input id="q" type="search" placeholder="搜尋遊戲、番種、台數、鋤大D、鬥地主…" />
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

  function renderAbout() {
    layout(`
      <article class="page wrap">
        <div class="crumb"><a href="#home">計分館</a> / 關於</div>
        <h1>關於這本簿</h1>
        <div class="panel">
          <p>計分館用來集中存放牌類遊戲的<strong>計分方式</strong>與<strong>常見玩法</strong>。結構向 <a href="https://www.twmahjong.com/twmj/" target="_blank" rel="noreferrer">台灣麻雀番數表</a> 致敬：一張表講清番種、分數、解說。</p>
          <p>各地家規、牌館與線上平台數字都不一樣。這裡寫的是通行整理，不是官方唯一規則。開打前用本站當清單核對即可。</p>
          <p>現階段先收入麻雀、鋤大D、十三張、德州、廿一點、鬥地主、拱豬、跑得快、橋牌。之後可以繼續加「八十張、升級、大排九、天九」等。</p>
        </div>
      </article>
    `, "關於");
  }

  function renderGame(id) {
    const g = data.games.find((x) => x.id === id);
    if (!g) return renderHome();
    const rows = (g.scoring || []).map((s) => `
      <tr>
        <td>${s.name}</td>
        <td class="fan">${s.fan}</td>
        <td>${s.note || ""}</td>
      </tr>
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
          <p class="note">可在表格上用瀏覽器搜尋（Ctrl / ⌘ + F）。數字為常見值，家規請自行覆蓋。</p>
          <div style="overflow:auto">
            <table class="score">
              <thead><tr><th>名稱</th><th>分數</th><th>解說</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>

        ${g.extras && g.extras.length ? `
          <div class="section panel">
            <h2>台面備註</h2>
            <ul>${g.extras.map((e) => `<li>${e}</li>`).join("")}</ul>
          </div>` : ""}
      </article>
    `, g.name);

    wireCalc(g);
  }

  function renderCalc(g) {
    if (g.calculator === "tw-tai") {
      return `
        <div class="panel">
          <h2>台數計算機</h2>
          <div class="calc">
            <div><label>底</label><input id="c-base" type="number" value="100" /></div>
            <div><label>每台</label><input id="c-unit" type="number" value="20" /></div>
            <div><label>台數</label><input id="c-tai" type="number" value="4" /></div>
            <div>
              <label>胡法</label>
              <select id="c-win">
                <option value="tsumo">自摸（收三家）</option>
                <option value="ron">出銂（收一家）</option>
              </select>
            </div>
          </div>
          <div class="result" id="c-out"></div>
        </div>`;
    }
    if (g.calculator === "tw-fan") {
      return `
        <div class="panel">
          <h2>番數計算機</h2>
          <div class="calc">
            <div><label>底（$）</label><input id="c-base" type="number" value="50" /></div>
            <div><label>一番（$）</label><input id="c-unit" type="number" value="10" /></div>
            <div><label>番數</label><input id="c-tai" type="number" value="8" /></div>
            <div>
              <label>胡法</label>
              <select id="c-win">
                <option value="tsumo">自摸（收三家）</option>
                <option value="ron">出銂（收一家）</option>
              </select>
            </div>
          </div>
          <div class="result" id="c-out"></div>
        </div>`;
    }
    return `
      <div class="panel">
        <h2>查表提示</h2>
        <p class="note">此遊戲以牌型或底池結算，用左列規則 + 下方計分表即可。開局先把「加倍條件」講完。</p>
      </div>`;
  }

  function wireCalc(g) {
    if (!g.calculator) return;
    const base = $("#c-base");
    const unit = $("#c-unit");
    const tai = $("#c-tai");
    const win = $("#c-win");
    const out = $("#c-out");
    const paint = () => {
      const b = Number(base.value) || 0;
      const u = Number(unit.value) || 0;
      const t = Number(tai.value) || 0;
      const one = b + u * t;
      const times = win.value === "tsumo" ? 3 : 1;
      const label = g.calculator === "tw-fan" ? "番" : "台";
      out.innerHTML = `每家應付 <b>$${one}</b><br/>贏家共收 <b>$${one * times}</b>（${win.value === "tsumo" ? "自摸 ×3" : "出銂 ×1"}，${t} ${label}）`;
    };
    [base, unit, tai, win].forEach((el) => el.addEventListener("input", paint));
    win.addEventListener("change", paint);
    paint();
  }

  window.addEventListener("hashchange", route);
  route();
})();
