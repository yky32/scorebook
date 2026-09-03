(function () {
  const d = window.SCOREBOOK;
  if (!d) return;
  const samples = {
    "hk-mj": [
      { name: "平胡 1 番", note: "四組順子 + 一對眼。冇刻、冇槓。", groups: ["M2 M3 M4", "P5 P6 P7", "S3 S4 S5", "M6 M7 M8", "P2 P2"] },
      { name: "門前清 + 自摸", note: "冇食碰明槓，自己摸胡。", groups: ["P1 P2 P3", "P4 P5 P6", "S6 S7 S8", "WE WE WE", "M5 M5"] },
      { name: "混一色 3 番", note: "淨係萬子 + 字牌。", groups: ["M1 M2 M3", "M4 M5 M6", "M7 M8 M9", "DR DR DR", "WN WN"] },
      { name: "對對胡 3 番", note: "四組刻子 + 一對。", groups: ["M3 M3 M3", "P5 P5 P5", "S8 S8 S8", "DG DG DG", "WE WE"] },
      { name: "清一色 7 番", note: "淨係筒，完全冇字。", groups: ["P1 P2 P3", "P3 P4 P5", "P5 P6 P7", "P8 P8 P8", "P9 P9"] },
      { name: "大三元 8 番", note: "中、發、白各一刻。", groups: ["DR DR DR", "DG DG DG", "DW DW DW", "M2 M3 M4", "P5 P5"] },
      { name: "十三幺 滿貫", note: "一九同七隻字各一，再重複其中一隻做眼。", groups: ["M1 M9 P1 P9 S1 S9 WE WS WW WN DR DG DW DW"] }
    ],
    "tw-mj-hk": [
      { name: "雞胡 10 番", note: "胡出時（不計莊前）只得一番。", groups: ["M2 M3 M4", "P5 P6 P7", "S1 S2 S3", "M7 M8 M9", "WE WE WE", "P9 P9"] },
      { name: "平胡 3 番", note: "全部順子，冇刻。", groups: ["M1 M2 M3", "M4 M5 M6", "P2 P3 P4", "S5 S6 S7", "S7 S8 S9", "P8 P8"] },
      { name: "混一色 10 番", note: "一色加字。", groups: ["S1 S2 S3", "S4 S5 S6", "S7 S8 S9", "S2 S2 S2", "DR DR DR", "WN WN"] },
      { name: "清一色 40 番", note: "單一花色冇字。", groups: ["M1 M2 M3", "M2 M3 M4", "M4 M5 M6", "M7 M8 M9", "M5 M5 M5", "M9 M9"] }
    ],
    "big2": [
      { name: "單張", note: "最小單位。3 最小，2 最大。", cards: ["3d"] },
      { name: "對子", note: "兩張同點。", cards: ["8s", "8h"] },
      { name: "三條", note: "三張同點。", cards: ["Qd", "Qc", "Qh"] },
      { name: "順子 5 張", note: "連續五張。", cards: ["5c", "6d", "7s", "8h", "9c"] },
      { name: "同花 5 張", note: "五張同花色。", cards: ["3h", "6h", "8h", "Jh", "Kh"] },
      { name: "葫蘆", note: "三條 + 一對。", cards: ["9c", "9d", "9s", "4h", "4c"] },
      { name: "金剛", note: "四張同點 + 一張帶。", cards: ["As", "Ah", "Ad", "Ac", "3c"] },
      { name: "同花順", note: "同花兼連號。", cards: ["10s", "Js", "Qs", "Ks", "As"] }
    ],
    "holdem": [
      { name: "皇家同花順", note: "同花 A-K-Q-J-10。", cards: ["As", "Ks", "Qs", "Js", "10s"] },
      { name: "四條", note: "四張同點。", cards: ["8c", "8d", "8h", "8s", "2c"] },
      { name: "葫蘆", note: "三條 + 一對。", cards: ["Kd", "Kh", "Kc", "7s", "7d"] },
      { name: "同花", note: "五張同花。", cards: ["Ah", "Jh", "8h", "5h", "2h"] },
      { name: "順子", note: "五張連號。", cards: ["9c", "10d", "Jh", "Qs", "Kc"] },
      { name: "兩對", note: "兩個對子 + 踢腳。", cards: ["Ac", "Ad", "6s", "6h", "9d"] }
    ],
    "blackjack": [
      { name: "Blackjack 3:2", note: "起手 A + 10 點牌。", cards: ["As", "Kd"] },
      { name: "硬 20", note: "未用 A 當 11。", cards: ["10h", "Qc"] },
      { name: "軟 17", note: "有 A 當 11。", cards: ["Ad", "6c"] },
      { name: "爆牌", note: "超過 21。", cards: ["10s", "8h", "5d"] }
    ],
    "niuniu": [
      { name: "牛牛", note: "三張個位 0，其餘兩張個位都 0。", cards: ["10s", "Jd", "5c", "8h", "2d"] },
      { name: "牛九", note: "三張個位 0，剩兩張個位 9。", cards: ["Kc", "Qh", "As", "8d", "9c"] },
      { name: "冇牛", note: "搞唔到三張個位 0。", cards: ["3s", "5h", "7d", "9c", "Kd"] }
    ],
    "zhajinhua": [
      { name: "豹子", note: "三張相同。", cards: ["Ah", "Ad", "Ac"] },
      { name: "同花順", note: "同花兼連號。", cards: ["9s", "10s", "Js"] },
      { name: "同花", note: "同花唔連。", cards: ["Ah", "8h", "3h"] },
      { name: "對子", note: "一對 + 單張。", cards: ["Kd", "Kc", "7s"] },
      { name: "散牌", note: "比最大單張。", cards: ["As", "Jh", "9c"] }
    ],
    "baccarat": [
      { name: "閒家天牌 9", note: "起手已 9。", cards: ["4h", "5c"] },
      { name: "莊家 7 點停", note: "兩張合計 7。", cards: ["Kd", "7s"] },
      { name: "閒家要第三張", note: "兩張得 4 點。", cards: ["9c", "5d", "Ah"] }
    ]
  };
  d.games.forEach((g) => { if (samples[g.id]) g.samples = samples[g.id]; });
})();
