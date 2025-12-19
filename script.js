/* =========================

幸福教養｜模組1｜m1v7.2 (JS)

Tabs｜年齡分流｜急救呼吸 4-6｜換一句｜每日點數｜設定字體｜清空資料

========================= */

// ---------- Storage Keys ----------

const KEY = {

  age: "m1_age",

  phrase: "m1_phrase",

  points: "m1_points",

  font: "m1_font"

};

// ---------- DOM ----------

const tabs = Array.from(document.querySelectorAll(".tab"));

const panels = {

  firstaid: document.getElementById("panel-firstaid"),

  kit: document.getElementById("panel-kit"),

  daily: document.getElementById("panel-daily"),

  settings: document.getElementById("panel-settings")

};

const ageSelect = document.getElementById("ageSelect");

// 急救

const statusText = document.getElementById("statusText");

const secValue = document.getElementById("secValue");

const phaseText = document.getElementById("phaseText");

const roundNow = document.getElementById("roundNow");

const roundTotal = document.getElementById("roundTotal");

const roundInput = document.getElementById("roundInput");

const btnStart = document.getElementById("btnStart");

const btnStop = document.getElementById("btnStop");

// 換一句

const phraseText = document.getElementById("phraseText");

const btnNewPhrase = document.getElementById("btnNewPhrase");

const btnCopyPhrase = document.getElementById("btnCopyPhrase");

const copyHint = document.getElementById("copyHint");

// 錦囊

const kitList = document.getElementById("kitList");

// 每日

const dailyList = document.getElementById("dailyList");

const pointsValue = document.getElementById("pointsValue");

const footerPoints = document.getElementById("footerPoints");

const btnFinishDaily = document.getElementById("btnFinishDaily");

const btnUncheckAll = document.getElementById("btnUncheckAll");

const btnResetPoints = document.getElementById("btnResetPoints");

// 設定

const btnClearAll = document.getElementById("btnClearAll");

const btnFontPlus = document.getElementById("btnFontPlus");

const btnFontReset = document.getElementById("btnFontReset");

// ---------- Data ----------

const PHRASES = {

  preschool: [

    "我知道你很生氣，我在。先抱一下，慢慢說。",

    "我看到你很難受，我們先呼吸，等一下再講。",

    "你不用馬上乖，你先安全就好。"

  ],

  child: [

    "我懂你不舒服，我們先停一下，再一起想辦法。",

    "我先聽你說完，不急著判對錯。",

    "你可以不開心，但我們用嘴巴說，不用手。"

  ],

  teen: [

    "我先不追問，我先陪你把情緒降下來。",

    "我聽到了。你不用立刻解釋，我們等你準備好。",

    "我不跟你硬碰硬，我們先把事變小。"

  ],

  adult: [

    "先呼吸，再說話。",

    "我現在不求贏，我只求把局面穩住。",

    "我先把語氣放低，事情才有路走。"

  ]

};

const KITS = {

  preschool: [

    { t: "先抱住安全", s: "先讓孩子回到安全感：靠近、蹲下、放慢聲音。" },

    { t: "少說三句", s: "先不講道理：不問為什麼、不翻舊帳、不威脅。" },

    { t: "一個選擇題", s: "「你要先喝水，還是先抱抱？」給選項，情緒會降。" }

  ],

  child: [

    { t: "先命名情緒", s: "「你很委屈/很生氣」被看見，孩子才會下來。" },

    { t: "界線一句話", s: "「你可以生氣，但不能打人。」短、穩、重複。" },

    { t: "回到下一步", s: "「現在先做哪一件？」把注意力拉回可做的。"}

  ],

  teen: [

    { t: "先降低對抗", s: "先不逼問：你越追，他越躲。先讓空氣變軟。" },

    { t: "把話說短", s: "越長越像說教：一句就好，留空間給他自己消化。" },

    { t: "先站在同一邊", s: "「我跟你同隊，我們一起想怎麼過。」比對錯有效。" }

  ],

  adult: [

    { t: "先穩系統", s: "先穩自己（呼吸/語速/音量），再穩孩子，再談規則。" },

    { t: "先不選邊", s: "不急著裁判：先讓情緒下來，關係不破，才有解法。" },

    { t: "先做小一步", s: "把目標縮小：先停一分鐘、先喝水、先換房間。"}

  ]

};

const DAILY = [

  "吸 4 吐 6 × 2 輪（30 秒）",

  "把嘴角停在「小逗號」5 秒",

  "今天只練一件事：把語速放慢 20%",

  "今天遇到衝突，只講「一句話」",

  "睡前回顧：我今天哪一刻有穩住？"

];

// ---------- State ----------

let timer = null;

let sec = 0;

let breath = {

  totalRounds: 3,

  nowRound: 0,

  phase: "準備",  // 吸氣 / 吐氣

  phaseSecLeft: 0

};

// ---------- Helpers ----------

function save(key, val){

  localStorage.setItem(key, JSON.stringify(val));

}

function load(key, fallback){

  try{

    const raw = localStorage.getItem(key);

    if(raw === null) return fallback;

    return JSON.parse(raw);

  }catch(e){

    return fallback;

  }

}

function setTab(tabName){

  tabs.forEach(b => b.classList.toggle("active", b.dataset.tab === tabName));

  Object.keys(panels).forEach(k => panels[k].classList.toggle("hidden", k !== tabName));

}

function randomFrom(arr){

  return arr[Math.floor(Math.random() * arr.length)];

}

function currentAge(){

  return ageSelect.value || "adult";

}

// ---------- UI: Points ----------

function setPoints(n){

  pointsValue.textContent = String(n);

  footerPoints.textContent = String(n);

  save(KEY.points, n);

}

function getPoints(){

  return load(KEY.points, 0);

}

// ---------- UI: Phrase ----------

function setPhrase(text){

  phraseText.textContent = text;

  save(KEY.phrase, text);

}

function getRandomPhrase(){

  const age = currentAge();

  const list = PHRASES[age] || PHRASES.adult;

  return randomFrom(list);

}

// ---------- UI: Kit ----------

function renderKit(){

  const age = currentAge();

  const list = KITS[age] || KITS.adult;

  kitList.innerHTML = "";

  list.forEach(item => {

    const div = document.createElement("div");

    div.className = "kit-item";

    div.innerHTML = `

      <div class="k-title">${item.t}</div>

      <div class="k-text">${item.s}</div>

    `;

    kitList.appendChild(div);

  });

}

// ---------- UI: Daily ----------

function renderDaily(){

  dailyList.innerHTML = "";

  DAILY.forEach((txt, idx) => {

    const id = `daily_${idx}`;

    const row = document.createElement("div");

    row.className = "check-item";

    row.innerHTML = `

      <input type="checkbox" id="${id}" />

      <label for="${id}">${txt}</label>

    `;

    dailyList.appendChild(row);

  });

}

function uncheckAllDaily(){

  dailyList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

}

// ---------- Breathing Timer (吸4吐6) ----------

function updateBreathUI(){

  secValue.textContent = String(sec);

  statusText.textContent = timer ? "進行中" : "待機";

  phaseText.textContent = breath.phase;

  roundNow.textContent = String(breath.nowRound);

  roundTotal.textContent = String(breath.totalRounds);

}

function stopBreath(){

  if(timer){

    clearInterval(timer);

    timer = null;

  }

  breath.phase = "準備";

  breath.phaseSecLeft = 0;

  breath.nowRound = 0;

  sec = 0;

  updateBreathUI();

}

function startBreath(){

  stopBreath();

  breath.totalRounds = Number(roundInput.value || 3);

  breath.nowRound = 0;

  sec = 0;

  // 每回合：吸 4 秒 + 吐 6 秒

  // 我們用 phaseSecLeft 計時

  breath.phase = "吸氣";

  breath.phaseSecLeft = 4;

  breath.nowRound = 1;

  updateBreathUI();

  timer = setInterval(() => {

    sec += 1;

    breath.phaseSecLeft -= 1;

    if(breath.phaseSecLeft <= 0){

      if(breath.phase === "吸氣"){

        breath.phase = "吐氣";

        breath.phaseSecLeft = 6;

      }else{

        // 一回合結束

        if(breath.nowRound >= breath.totalRounds){

          // 完成

          stopBreath();

          statusText.textContent = "完成 ✅";

          phaseText.textContent = "完成";

          secValue.textContent = String(sec);

          return;

        }else{

          breath.nowRound += 1;

          breath.phase = "吸氣";

          breath.phaseSecLeft = 4;

        }

      }

    }

    updateBreathUI();

  }, 1000);

}

// ---------- Font Size ----------

function applyFontSize(px){

  document.documentElement.style.setProperty("--baseFont", `${px}px`);

  save(KEY.font, px);

}

function fontPlus(){

  const cur = load(KEY.font, 22);

  const next = Math.min(cur + 2, 34); // 上限保護

  applyFontSize(next);

}

function fontReset(){

  applyFontSize(22);

}

// ---------- Clear All ----------

function clearAll(){

  localStorage.removeItem(KEY.age);

  localStorage.removeItem(KEY.phrase);

  localStorage.removeItem(KEY.points);

  localStorage.removeItem(KEY.font);

  // reset UI

  ageSelect.value = "teen";

  setPoints(0);

  setPhrase("（請按「換一句」）");

  fontReset();

  stopBreath();

  renderKit();

  uncheckAllDaily();

}

// ---------- Events ----------

tabs.forEach(btn => {

  btn.addEventListener("click", () => {

    setTab(btn.dataset.tab);

  });

});

ageSelect.addEventListener("change", () => {

  save(KEY.age, ageSelect.value);

  renderKit();

});

btnStart.addEventListener("click", startBreath);

btnStop.addEventListener("click", stopBreath);

btnNewPhrase.addEventListener("click", () => {

  setPhrase(getRandomPhrase());

  copyHint.textContent = "";

});

btnCopyPhrase.addEventListener("click", async () => {

  const text = phraseText.textContent.trim();

  if(!text) return;

  try{

    await navigator.clipboard.writeText(text);

    copyHint.textContent = "✅ 已複製，可以直接貼出去。";

  }catch(e){

    copyHint.textContent = "⚠️ 你的瀏覽器不允許自動複製，請長按句子手動複製。";

  }

});

btnFinishDaily.addEventListener("click", () => {

  const n = getPoints() + 1;

  setPoints(n);

});

btnUncheckAll.addEventListener("click", uncheckAllDaily);

btnResetPoints.addEventListener("click", () => setPoints(0));

btnClearAll.addEventListener("click", () => {

  const ok = confirm("確定要清空全部資料嗎？（年齡/句子/點數/字體大小）");

  if(ok) clearAll();

});

btnFontPlus.addEventListener("click", fontPlus);

btnFontReset.addEventListener("click", fontReset);

// ---------- Init ----------

(function init(){

  // age

  const savedAge = load(KEY.age, "teen");

  ageSelect.value = savedAge;

  // font

  const savedFont = load(KEY.font, 22);

  applyFontSize(savedFont);

  // points

  setPoints(getPoints());

  // phrase

  const savedPhrase = load(KEY.phrase, "");

  if(savedPhrase) setPhrase(savedPhrase);

  // UI lists

  renderKit();

  renderDaily();

  // initial tab

  setTab("firstaid");

  updateBreathUI();

})();