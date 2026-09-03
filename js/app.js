(function () {
  const data = window.SCOREBOOK;
  const app = document.getElementById("app");
  function $(sel, root) { return (root || document).querySelector(sel); }

  function route() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash || hash === "home") return renderHome();
    if (hash === "about") return renderAbout();
    if (hash === "cards" || hash === "poker") return renderCards();
    if (hash === "mj") return renderHub("麻雀", "麻雀計分", "13 張港麻同 16 張台麻計法不同，分開查。", (g) => g.category === "麻雀");
    if (hash === "tables") return renderHub("檮面", "檮面賠率", "百家樂、骰寶、魚蝦蟹。以枱面告示為準。", (g) => g.category === "檮面");
    if (hash === "gallery" || hash === "samples") return renderGallery();
    if (hash.startsWith("game/")) return renderGame(hash.slice(5));
    renderHome();
  }

  function layout(inner, title) {
    document.title = title ? title + " · 計分館" : "計分館 · 牌型圖解";
    app.innerHTML = inner;
  }

  function tileMeta(code) {
    const c = String(code || "").trim();
    if (!c) return null;
    if (/^[MPSmps][1-9]$/.test(c)) {
      const kind = { M: "萬", P: "筒", S: "索", m: "萬", p: "筒", s: "索" }[c[0]];
      const cls = { M: "man", P: "pin", S: "sou", m: "man", p: "pin", s: "sou" }[c[0]];
      return { type: "tile", cls, top: c.slice(1), bot: kind };
    }
    const winds = { WE: ["東", "風"], WS: ["南", "風"], WW: ["西", "風"], WN: ["北", "風"] };
    if (winds[c]) return { type: "tile", cls: "wind", top: winds[c][0], bot: winds[c][1] };
    const dragons = { DR: ["中", "箭"], DG: ["發", "箭"], DW: ["白", "箭"] };
    if (dragons[c]) return { type: "tile", cls: c === "DR" ? "zhong" : c === "DG" ? "fa" : "bai", top: dragons[c][0], bot: dragons[c][1] };
    const m = c.match(/^([2-9]|10|[AJQKajqk])([shdcSHDC])$/);
    if (m) {
      const rank = m[1].toUpperCase();
      const suitMap = { s: ["♠", "s"], h: ["♥", "h"], d: ["♦", "d"], c: ["♣", "c"] };
      const pair = suitMap[m[2].toLowerCase()];
      return { type: "card", cls: (pair[1] === "h" || pair[1] === "d") ? "red" : "black", rank, suit: pair[0] };
    }
    return { type: "tile", cls: "man", top: c, bot: "" };
  }

  function renderPiece(code) {
    const t = tileMeta(code);
    if (!t) return "";
    if (t.type === "card") return `<span class="pcard ${t.cls}"><b>${t.rank}</b><i>${t.suit}</i></span>`;
    return `<span class="tile ${t.cls}"><b>${t.top}</b><small>${t.bot}</small></span>`;
  }

  function renderSample(s) {
    const groups = s.groups ? s.groups.map((g) => `<div class="meld">${g.split(/\s+/).map(renderPiece).join("")}</div>`).join("") : "";
    const cards = s.cards ? `<div class="meld">${s.cards.map(renderPiece).join("")}</div>` : "";
    return `<div class="sample"><div class="sample-h"><strong>${s.name}</strong><span>${s.note || ""}</span></div><div class="hand">${groups}${cards}</div></div>`;
  }

  function renderGallery() {
    const picks = ["hk-mj", "big2", "holdem", "blackjack", "niuniu", "zhajinhua"].map((id) => data.games.find((g) => g.id === id)).filter((g) => g && g.samples && g.samples.length);
    layout(`<article class="page wrap"><div class="crumb"><a href="#home">計分館</a> / 牌型</div><div class="kicker">HAND SAMPLES</div><h1>牌型圖解</h1><p class="lede">用畫面睇組合。麻雀係面子 + 眼；撲克／鋤大D／21點用同一副牌但規則不同。</p>${picks.map((g) => `<div class="section"><h2><a href="#game/${g.id}">${g.name}</a></h2><div class="sample-list">${g.samples.map(renderSample).join("")}</div></div>`).join("")}</article>`, "牌型圖解");
  }

  function renderHome() {
    layout(`<section class="hero wrap"><div class="kicker">SCORING ATLAS</div><h1>計分館</h1><p class="lede">${data.site.blurb}</p><div class="hubs"><a class="card" href="#mj"><span class="tag">TILES</span><h3>麻雀</h3><p class="meta">港式 13 張、台灣 16 張番數／台數。</p></a><a class="card" href="#cards"><span class="tag">CARDS</span><h3>撲克三件套</h3><p class="meta">德州、鋤大D、21點。</p></a><a class="card" href="#tables"><span class="tag">TABLE</span><h3>檮面</h3><p class="meta">百家樂、骰寶、魚蝦蟹。</p></a><a class="card" href="#gallery"><span class="tag">HANDS</span><h3>牌型圖解</h3><p class="meta">平胡、清一色、葫蘆、Blackjack 用畫面睇。</p></a></div><div class="search-row"><input id="q" type="search" placeholder="搜尋：平胡、牛牛、葫蘆…" /><select id="cat">${data.categories.map((c) => `<option>${c}</option>`).join("")}</select></div><div class="chips" id="chips"></div></section><section class="wrap grid" id="grid"></section>`, "");
    const q = $("#q"), cat = $("#cat"), grid = $("#grid"), chips = $("#chips");
    data.categories.slice(1).forEach((c) => {
      const b = document.createElement("button");
      b.className = "chip"; b.textContent = c;
      b.onclick = () => { cat.value = c; paint(); };
      chips.appendChild(b);
    });
    function paint() {
      const query = (q.value || "").trim().toLowerCase();
      const category = cat.value;
      chips.querySelectorAll(".chip").forEach((el) => el.classList.toggle("active", el.textContent === category));
      const list = data.games.filter((g) => {
        const okCat = category === "全部" || g.category === category;
        const blob = [g.name, g.summary, g.unit, ...(g.scoring || []).map((s) => s.name + s.note)].join(" ").toLowerCase();
        return okCat && (!query || blob.includes(query));
      });
      grid.innerHTML = list.map((g) => `<a class="card" href="#game/${g.id}"><span class="tag">${g.category}</span><h3>${g.name}</h3><div class="meta">${g.players} · ${g.hand}</div><p class="meta">${g.summary}</p></a>`).join("") || `<p class="note">沒有符合的項目。</p>`;
    }
    q.addEventListener("input", paint);
    cat.addEventListener("change", paint);
    paint();
  }

  function renderHub(cat, title, lede, pred) {
    const list = data.games.filter(pred);
    layout(`<article class="page wrap"><div class="crumb"><a href="#home">計分館</a> / ${cat}</div><div class="kicker">${cat}</div><h1>${title}</h1><p class="lede">${lede}</p><div class="grid" style="margin-top:28px">${list.map((g) => `<a class="card" href="#game/${g.id}"><span class="tag">${g.category}</span><h3>${g.name}</h3><div class="meta">${g.players} · ${g.hand}</div><p class="meta">${g.summary}</p></a>`).join("")}</div></article>`, title);
  }

  function renderCards() {
    const core = ["holdem", "big2", "blackjack"].map((id) => data.games.find((g) => g.id === id)).filter(Boolean);
    const more = data.games.filter((g) => g.category === "撲克" && !["holdem", "big2", "blackjack"].includes(g.id));
    layout(`<article class="page wrap"><div class="crumb"><a href="#home">計分館</a> / 撲克</div><div class="kicker">PLAYING CARDS</div><h1>撲克三件套</h1><p class="lede">德州、鋤大D、21點。同一副牌，三種計法。</p><div class="grid" style="margin-top:28px">${core.map((g, i) => `<a class="card" href="#game/${g.id}"><span class="tag">0${i + 1} · 撲克</span><h3>${g.id === "holdem" ? "撲克（德州）" : g.name}</h3><div class="meta">${g.players} · ${g.hand}</div><p class="meta">${g.summary}</p></a>`).join("")}</div>${more.length ? `<div class="section"><h2>延伸</h2><div class="grid">${more.map((g) => `<a class="card" href="#game/${g.id}"><span class="tag">${g.category}</span><h3>${g.name}</h3><div class="meta">${g.players} · ${g.hand}</div></a>`).join("")}</div></div>` : ""}</article>`, "撲克");
  }

  function renderAbout() {
    layout(`<article class="page wrap"><div class="crumb"><a href="#home">計分館</a> / 關於</div><h1>關於這本簿</h1><div class="panel"><p>計分館係計分參考，唔係賭場。未滿 18 歲唔適用。家規大過網頁。</p></div></article>`, "關於");
  }

  function renderGame(id) {
    const g = data.games.find((x) => x.id === id);
    if (!g) return renderHome();
    const rows = (g.scoring || []).map((s) => `<tr><td>${s.name}</td><td class="fan">${s.fan}</td><td>${s.note || ""}</td></tr>`).join("");
    const samples = g.samples && g.samples.length ? `<div class="section"><h2>牌型例子</h2><p class="note">常見組合畫面，花色可以換。</p><div class="sample-list">${g.samples.map(renderSample).join("")}</div></div>` : "";
    layout(`<article class="page wrap"><div class="crumb"><a href="#home">計分館</a> / ${g.category}</div><div class="kicker">${g.category}</div><h1>${g.name}</h1><p class="lede">${g.summary}</p><div class="badge-row"><span class="badge">${g.players}</span><span class="badge">${g.hand}</span><span class="badge">${g.unit}</span></div><div class="two-col section"><div class="panel"><h2>玩法要點</h2><ol class="steps">${g.rules.map((r) => `<li>${r}</li>`).join("")}</ol></div><div>${renderCalc(g)}</div></div>${samples}<div class="section"><h2>計分表</h2><div style="overflow:auto"><table class="score"><thead><tr><th>名稱</th><th>分數</th><th>解說</th></tr></thead><tbody>${rows}</tbody></table></div></div>${g.extras && g.extras.length ? `<div class="section panel"><h2>台面備註</h2><ul>${g.extras.map((e) => `<li>${e}</li>`).join("")}</ul></div>` : ""}</article>`, g.name);
    wireCalc(g);
  }

  function renderCalc(g) {
    if (g.calculator === "tw-tai" || g.calculator === "tw-fan") {
      const fan = g.calculator === "tw-fan";
      return `<div class="panel"><h2>${fan ? "番數計算機" : "台數計算機"}</h2><div class="calc"><div><label>${fan ? "底($)" : "底"}</label><input id="c-base" type="number" value="${fan ? 50 : 100}" /></div><div><label>${fan ? "一番($)" : "每台"}</label><input id="c-unit" type="number" value="${fan ? 10 : 20}" /></div><div><label>${fan ? "番數" : "台數"}</label><input id="c-tai" type="number" value="${fan ? 8 : 4}" /></div><div><label>胡法</label><select id="c-win"><option value="tsumo">自摸</option><option value="ron">出銂</option></select></div></div><div class="result" id="c-out"></div></div>`;
    }
    return `<div class="panel"><h2>查表提示</h2><p class="note">對下面計分表同上面牌型例子。</p></div>`;
  }

  function wireCalc(g) {
    if (!g.calculator) return;
    const base = $("#c-base"), unit = $("#c-unit"), tai = $("#c-tai"), win = $("#c-win"), out = $("#c-out");
    const paint = () => {
      const one = (Number(base.value) || 0) + (Number(unit.value) || 0) * (Number(tai.value) || 0);
      const times = win.value === "tsumo" ? 3 : 1;
      out.innerHTML = `每家 <b>$${one}</b><br/>共收 <b>$${one * times}</b>`;
    };
    [base, unit, tai, win].forEach((el) => el.addEventListener("input", paint));
    win.addEventListener("change", paint);
    paint();
  }

  window.addEventListener("hashchange", route);
  route();
})();
