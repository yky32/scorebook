(function () {
  const data = window.SCOREBOOK;
  if (!data || !data.games) return;
  const idx = data.games.findIndex((g) => g.id === "hk-mj");
  if (idx < 0) return;
  data.games[idx] = {
    id: "hk-mj",
    name: "香港麻雀",
    category: "麻雀",
    players: "4 人",
    hand: "13 張（胡 14 張）",
    unit: "番（常見 3 番起胡）",
    summary: "港式 13 張計番。番可疊加，3 番起胡最常見，滿貫通常 10–13 番封頂。",
    rules: [
      "標準 136 張（多數香港枱無花）；有花則 144。胡牌：四面子 + 一對。",
      "大部分牌局「3 番起胡」。休閒可 1 番起。",
      "番種多數可疊加，例如門前清 1 + 對對胡 3 + 清一色 7 = 11 番。",
      "十三幺、天胡、地胡、十八羅漢等例牌直接滿貫。",
      "舊章／新章、計唔計花、平胡定義每枱不同，開局對番表。"
    ],
    scoring: [
      { name: "平胡", fan: 1, note: "四組全部順子，冇刻／槓" },
      { name: "門前清", fan: 1, note: "冇食、碰、明槓" },
      { name: "自摸", fan: 1, note: "自己摸到最後一隻" },
      { name: "中發白", fan: 1, note: "紅中／發財／白板刻或槓；每組 1 番。香港唔叫箭" },
      { name: "門風", fan: 1, note: "自己座位風的刻或槓" },
      { name: "圈風", fan: 1, note: "當前圈風的刻或槓" },
      { name: "無花", fan: 1, note: "用花牌時，成副冇花" },
      { name: "缺一門", fan: 2, note: "筒索萬之中完全冇其中一門；部分枱先計" },
      { name: "混一色", fan: 3, note: "一種花色加字牌" },
      { name: "對對胡", fan: 3, note: "四組全部刻或槓" },
      { name: "小三元", fan: 5, note: "兩組中發白刻，第三種做眼" },
      { name: "清一色", fan: 7, note: "只得一種花色，完全冇字" },
      { name: "大三元", fan: 8, note: "中發白各一組刻或槓" },
      { name: "小四喜", fan: 8, note: "三組風刻，第四種風做眼" },
      { name: "字一色", fan: 10, note: "全部風同中發白" },
      { name: "大四喜", fan: 10, note: "東南西北四組刻或槓" },
      { name: "十三幺", fan: "滿貫", note: "一九同七隻字各一，再重複其中一隻" },
      { name: "十八羅漢", fan: "滿貫", note: "四槓加一對眼" },
      { name: "天胡", fan: "滿貫", note: "莊家開牌十四隻已經成牌" },
      { name: "地胡", fan: "滿貫", note: "閒家第一次摸牌即自摸" }
    ],
    extras: [
      "香港叫中發白、風牌，唔叫箭。",
      "3 番起胡枱，鴨糊食唔到。家規大過網頁。"
    ]
  };
})();
