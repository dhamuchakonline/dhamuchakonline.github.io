// बच्चों वाली साइट: Login → कक्षा → (11–12 में संकाय) → विषय → चैप्टर → वीडियो
import { SCHOOL_NAME, TAGLINE, CLASSES, STREAMS, hasStreams, subjectGroups, subjectById, subjLabel, DEMO } from "./config.js";
import * as S from "./store.js";
import { ask } from "./dialog.js";

const app = document.getElementById("app");
let me = null;
const cache = {};
let wmTimer = null;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const streamOf = (id) => STREAMS.find((s) => s.id === id);
document.body.classList.add("stu");

// ---------- रंग (हर विषय का अपना) ----------
const PAL = [["#6366f1","#8b5cf6"],["#10b981","#34d399"],["#f97316","#fb923c"],["#ec4899","#f472b6"],["#0ea5e9","#38bdf8"],
  ["#eab308","#f59e0b"],["#ef4444","#f87171"],["#14b8a6","#2dd4bf"],["#a855f7","#c084fc"],["#3b82f6","#60a5fa"]];
const FIX = { maths: 0, science: 1, social: 2, english: 4, hindi: 6, sanskrit: 5, physics: 9, chemistry: 1, biology: 7, history: 2, geography: 7, polsci: 8, economics: 5 };
function colorOf(id) {
  let i = FIX[id];
  if (i === undefined) { i = 0; for (const ch of String(id)) i = (i * 31 + ch.charCodeAt(0)) % PAL.length; }
  return PAL[i];
}
const cvars = (id) => { const [a, b] = colorOf(id); return `--c1:${a};--c2:${b}`; };

// ---------- पढ़ाई की प्रगति (इसी फ़ोन/कंप्यूटर में सहेजी जाती है) ----------
const pkey = () => (me ? `dc-prog:${me.class}:${String(me.name).trim().toLowerCase()}` : "dc-prog");
function loadProg() { try { return JSON.parse(localStorage.getItem(pkey())) || { p: {}, t: {} }; } catch { return { p: {}, t: {} }; } }
function saveProg(o) { try { localStorage.setItem(pkey(), JSON.stringify(o)); } catch {} }
const pctOf = (id) => Math.min(100, Math.max(0, Math.round(loadProg().p[id] || 0)));

// गोल प्रगति: 0–99% पर % लिखा, 100% पर हरा ✓
function ring(pct, size = 46, stroke = 5) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, done = pct >= 100;
  const off = c * (1 - Math.min(pct, 100) / 100);
  return `<span class="ring${done ? " done" : ""}" style="width:${size}px;height:${size}px;font-size:${Math.round(size / 3.6)}px">
    <svg width="${size}" height="${size}"><circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
    <circle class="fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg>
    <span class="rt">${done ? "✓" : pct + "%"}</span></span>`;
}
const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, c) => a + pctOf(c.id), 0) / arr.length) : 0);

const TICK = ["🎓 कक्षा 9–12 · हर विषय की वीडियो क्लास", "📚 Bihar Board · हर चैप्टर की लंबी क्लास", "🏫 UHS Dhamuchak", "🔥 नए वीडियो रोज़ आ रहे हैं — जुड़े रहो"];
const ticker = () => { const t = TICK.map((x) => `<span>${x}</span>`).join(""); return `<div class="ticker" aria-hidden="true"><div class="tk-in">${t}${t}</div></div>`; };


// ---------- डार्क मोड ----------
const isDark = () => { try { return localStorage.getItem("dc-theme") === "dark"; } catch { return false; } };
document.body.classList.toggle("dark", isDark());
function toggleTheme() {
  const d = !document.body.classList.contains("dark");
  document.body.classList.toggle("dark", d);
  try { localStorage.setItem("dc-theme", d ? "dark" : "light"); } catch {}
  const b = document.getElementById("themebtn"); if (b) b.textContent = d ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// ---------- त्योहार थीम (तारीख़ के हिसाब से अपने-आप) ----------
const FESTS = [
  ["01-01", "01-02", "newyear", "🎉", "नया साल मुबारक! इस साल और आगे बढ़ना है"],
  ["01-24", "01-27", "tiranga", "🇮🇳", "गणतंत्र दिवस की शुभकामनाएँ! जय हिंद"],
  ["2027-02-10", "2027-02-12", "saraswati", "🪷", "सरस्वती पूजा की शुभकामनाएँ! माँ सरस्वती का आशीर्वाद बना रहे"],
  ["2027-03-20", "2027-03-23", "holi", "🎨", "होली की रंग-भरी शुभकामनाएँ! रंग खेलो, पढ़ाई भी करो"],
  ["08-13", "08-16", "tiranga", "🇮🇳", "स्वतंत्रता दिवस की शुभकामनाएँ! जय हिंद"],
  ["09-05", "09-05", "teacher", "🍎", "शिक्षक दिवस की शुभकामनाएँ! अपने गुरुजनों को धन्यवाद कहो"],
  ["10-02", "10-02", "gandhi", "🕊️", "गांधी जयंती — सत्य और अहिंसा का दिन"],
  ["2027-10-26", "2027-10-31", "diwali", "🪔", "शुभ दीपावली! ज्ञान का दीया हमेशा जलता रहे"],
  ["2027-11-02", "2027-11-05", "chhath", "🌅", "छठ पूजा की हार्दिक शुभकामनाएँ! जय छठी मइया"],
  ["11-14", "11-14", "children", "🎈", "बाल दिवस की ढेरों शुभकामनाएँ!"],
];
function festToday(d = new Date()) {
  const ymd = d.toISOString ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";
  const md = ymd.slice(5);
  for (const [a, b, cls, ic, txt] of FESTS) {
    const x = a.length === 5 ? md : ymd;
    if (x >= a && x <= b) return { cls, ic, txt };
  }
  return null;
}
const FEST = festToday();
if (FEST) document.body.classList.add("fest-" + FEST.cls);
function festRain() {
  if (!FEST || document.getElementById("fxrain")) return;
  const em = { diwali: ["🪔", "✨", "🎆"], holi: ["🟣", "🟡", "🟢", "🔴", "🔵"], tiranga: ["🟧", "⚪", "🟩"], chhath: ["🌅", "🪔", "🌾"],
    saraswati: ["🪷", "📚", "🌼"], newyear: ["🎉", "✨", "🎊"], children: ["🎈", "⭐", "🎈"], teacher: ["🍎", "📚", "⭐"], gandhi: ["🕊️", "🤍"] }[FEST.cls] || ["✨"];
  const box = document.createElement("div"); box.id = "fxrain"; box.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 22; i++) {
    const sp = document.createElement("span"); sp.textContent = em[i % em.length];
    sp.style.left = Math.random() * 100 + "%"; sp.style.animationDelay = (Math.random() * 2.5).toFixed(2) + "s";
    sp.style.animationDuration = (3 + Math.random() * 2.5).toFixed(2) + "s"; sp.style.fontSize = (14 + Math.random() * 16) + "px";
    box.appendChild(sp);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 8000);
}

// ---------- आज का विचार / आज का सवाल (रोज़ बदलेगा) ----------
const DAILY = [
  "रोज़ थोड़ा-थोड़ा पढ़ना, एक दिन बहुत पढ़ने से अच्छा है।",
  { q: "भारत का राष्ट्रीय पशु कौन है?", a: "बाघ 🐅" },
  "गलती करना बुरा नहीं, उससे न सीखना बुरा है।",
  { q: "बिहार की राजधानी कौन सी है?", a: "पटना" },
  "सपने वो नहीं जो सोते में आएँ, सपने वो हैं जो सोने न दें। मेहनत करो!",
  { q: "पृथ्वी सूर्य का एक चक्कर कितने दिन में लगाती है?", a: "लगभग 365 दिन" },
  "जो सवाल समझ न आए, उसे पूछने में शर्म मत करो।",
  { q: "पानी का रासायनिक सूत्र क्या है?", a: "H₂O" },
  "किताब सबसे अच्छी दोस्त है — कभी धोखा नहीं देती।",
  { q: "नालंदा विश्वविद्यालय किस राज्य में है?", a: "बिहार" },
  "आज की मेहनत, कल की कामयाबी।",
  { q: "प्रकाश की गति लगभग कितनी है?", a: "3 लाख किलोमीटर प्रति सेकंड" },
  "मोबाइल को पढ़ाई का साथी बनाओ, समय बर्बाद करने का नहीं।",
  { q: "हमारे शरीर की सबसे बड़ी हड्डी कौन सी है?", a: "फीमर (जांघ की हड्डी)" },
  "छोटे-छोटे कदम भी मंज़िल तक पहुँचाते हैं।",
  { q: "भारत का राष्ट्रीय गान किसने लिखा?", a: "रवीन्द्रनाथ टैगोर" },
  "पढ़ाई में सबसे बड़ा हथियार है — दोहराना (Revision)।",
  { q: "सौरमंडल का सबसे बड़ा ग्रह कौन सा है?", a: "बृहस्पति (Jupiter)" },
  "दूसरों से नहीं, कल वाले खुद से आगे निकलो।",
  { q: "1 किलोमीटर में कितने मीटर होते हैं?", a: "1000 मीटर" },
  "समय की कद्र करो, समय तुम्हारी कद्र करेगा।",
  { q: "पौधे भोजन किस क्रिया से बनाते हैं?", a: "प्रकाश-संश्लेषण (Photosynthesis)" },
  "हार मान लेना ही असली हार है।",
  { q: "भारत के पहले राष्ट्रपति कौन थे?", a: "डॉ. राजेन्द्र प्रसाद (बिहार से!)" },
  "अच्छी नींद और अच्छा खाना भी पढ़ाई का हिस्सा है।",
  { q: "गंगा नदी किस जगह से निकलती है?", a: "गंगोत्री (गोमुख)" },
  "जो आज सीखा, उसे किसी दोस्त को समझाओ — पक्का याद रहेगा।",
  { q: "एक वर्ग (square) की कितनी भुजाएँ होती हैं?", a: "4" },
  "बड़ा सोचो, छोटे से शुरू करो, अभी शुरू करो।",
  { q: "वायुमंडल में सबसे ज़्यादा कौन सी गैस है?", a: "नाइट्रोजन (लगभग 78%)" },
  "हर दिन कुछ नया सीखो — यही असली कमाई है।",
];
function dailyCard() {
  const d = new Date(), day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  const x = DAILY[day % DAILY.length];
  if (typeof x === "string") return `<section class="daily"><div class="dy-h">💡 आज का विचार</div><p>${esc(x)}</p></section>`;
  return `<section class="daily q"><div class="dy-h">🧠 आज का सवाल</div><p>${esc(x.q)}</p>
    <button class="dy-btn" onclick="this.nextElementSibling.hidden=false;this.remove()">जवाब देखें 👀</button><div class="dy-a" hidden>✅ ${esc(x.a)}</div></section>`;
}

// ---------- पिछली बार कहाँ थे ----------
const lkey = () => (me ? `dc-last:${me.class}:${String(me.name).trim().toLowerCase()}` : "dc-last");
function saveLast(o) { try { localStorage.setItem(lkey(), JSON.stringify(o)); } catch {} }
function loadLast() { try { return JSON.parse(localStorage.getItem(lkey())); } catch { return null; } }
function continueCard(list) {
  const L = loadLast(); if (!L || !L.h) return "";
  const c = list.find((x) => x.id === L.id); if (!c) return "";
  const p = pctOf(c.id); if (p >= 100) return "";
  return `<a class="contcard" href="${esc(L.h)}" style="${cvars(c.subject)}"><div class="cc-ic">▶</div>
    <div class="cc-t"><small>पिछली बार यहाँ थे · ${esc(L.s || "")}</small><b>${esc(c.title)}</b><span>${p ? `${p}% हो गया — आगे देखो` : "जहाँ छोड़ा था वहीं से शुरू करो"}</span></div>${ring(p, 46, 5)}</a>`;
}

// ---------- खोज ----------
function searchBox() { return `<div class="srch"><span>🔍</span><input id="srch" type="search" placeholder="कोई भी चैप्टर खोजें…" autocomplete="off"><div class="srch-r" id="srchr"></div></div>`; }
function wireSearch(list, cls, stream) {
  const inp = document.getElementById("srch"), out = document.getElementById("srchr"); if (!inp) return;
  const ok = new Set(subjectGroups(cls, stream).flatMap((g) => g.items.map((x) => x.id)));
  const pool = list.filter((c) => ok.has(c.subject));
  const norm = (t) => String(t || "").toLowerCase();
  inp.oninput = () => {
    const q = norm(inp.value).trim();
    if (q.length < 2) { out.innerHTML = ""; return; }
    const hits = pool.filter((c) => { const sb = subjectById(cls, c.subject); return norm(c.title + " " + c.title_en + " " + (sb ? sb.name + " " + sb.en : "")).includes(q); }).slice(0, 12);
    out.innerHTML = hits.length ? hits.map((c) => { const sb = subjectById(cls, c.subject);
      return `<a href="#c${cls}-${stream}-${c.subject}-${encodeURIComponent(c.id)}" style="${cvars(c.subject)}"><i>${sb ? sb.icon : "📘"}</i><span><b>${esc(c.title)}</b><small>${esc(sb ? subjLabel(sb) : "")} · अध्याय ${esc(c.number)}</small></span></a>`; }).join("")
      : `<div class="srch-no">कुछ नहीं मिला 🤔 दूसरा शब्द लिखकर देखो</div>`;
  };
}

// ---------- विषय-कार्ड पर 3D झुकाव ----------
function tilt3d(el) {
  if (el.dataset.t3) return; el.dataset.t3 = 1;
  const sh = document.createElement("span"); sh.className = "shine"; el.appendChild(sh);
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(700px) rotateX(${(0.5 - y) * 14}deg) rotateY(${(x - 0.5) * 16}deg) translateY(-4px) scale(1.03)`;
    el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%"); el.classList.add("t3on");
  });
  const off = () => { el.style.transform = ""; el.classList.remove("t3on"); };
  el.addEventListener("pointerleave", off); el.addEventListener("pointercancel", off); el.addEventListener("pointerup", () => setTimeout(off, 150));
}


// ---------- चैप्टर क्विज़ (quiz/c9.json … हर चैप्टर के 5 सवाल) ----------
const quizCache = {};
async function quizFor(cls, id) {
  try {
    if (!quizCache[cls]) quizCache[cls] = fetch(`quiz/c${cls}.json?v=` + Math.floor(Date.now() / 600000)).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
    const all = await quizCache[cls];
    return Array.isArray(all[id]) && all[id].length ? all[id] : null;
  } catch { return null; }
}
const qScore = (id) => { const q = loadProg().q || {}; return q[id]; };
function confetti() {
  const box = document.createElement("div"); box.className = "qconf"; box.setAttribute("aria-hidden", "true");
  const col = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#14b8a6"];
  for (let i = 0; i < 60; i++) { const b = document.createElement("i"); b.style.left = Math.random() * 100 + "%"; b.style.background = col[i % col.length];
    b.style.animationDelay = (Math.random() * .6).toFixed(2) + "s"; b.style.animationDuration = (1.6 + Math.random() * 1.4).toFixed(2) + "s"; box.appendChild(b); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 3500);
}
async function startQuiz({ cls, c, next, onNext }) {
  if (document.getElementById("quizov")) return;
  const ov = document.createElement("div"); ov.id = "quizov";
  ov.innerHTML = `<div class="qz"><div class="qz-load"><div class="qz-spin"></div><b>Quiz लोड हो रहा है…</b><small>${esc(c.title)}</small></div></div>`;
  document.body.appendChild(ov); document.body.classList.add("noscroll");
  const close = () => { ov.remove(); document.body.classList.remove("noscroll"); };
  const [qs] = await Promise.all([quizFor(cls, c.id), new Promise((r) => setTimeout(r, 1400))]);
  const box = ov.querySelector(".qz");
  if (!qs) { box.innerHTML = `<div class="qz-end"><div class="qz-big">📝</div><b>इस चैप्टर का Quiz जल्द आएगा</b><div class="qz-acts">${next ? `<button class="un-btn" id="qzNext">▶ Play Next Chapter</button>` : ""}<button class="qz-ghost" id="qzClose">Close</button></div></div>`;
    box.querySelector("#qzClose").onclick = close; const nb = box.querySelector("#qzNext"); if (nb) nb.onclick = () => { close(); onNext(); }; return; }
  const list = qs.slice(0, 5).map((q) => { const opts = q.slice(1, 5).map((t, i) => ({ t, ok: i === q[5] })); for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; } return { q: q[0], opts }; });
  let i = 0, score = 0;
  const show = () => {
    const Q = list[i];
    box.innerHTML = `<div class="qz-top"><span>📝 Chapter Quiz</span><button class="qz-x" aria-label="बंद करें">✕</button></div>
      <div class="qz-dots">${list.map((_, k) => `<i class="${k < i ? "done" : k === i ? "cur" : ""}"></i>`).join("")}</div>
      <div class="qz-n">Question ${i + 1} of ${list.length}</div><div class="qz-q">${esc(Q.q)}</div>
      <div class="qz-opts">${Q.opts.map((o, k) => `<button class="qz-o" data-k="${k}"><span>${"ABCD"[k]}</span>${esc(o.t)}</button>`).join("")}</div><div class="qz-fb"></div>`;
    box.querySelector(".qz-x").onclick = close;
    box.querySelectorAll(".qz-o").forEach((b) => (b.onclick = () => {
      const k = +b.dataset.k, ok = Q.opts[k].ok;
      box.querySelectorAll(".qz-o").forEach((x, n) => { x.disabled = true; if (Q.opts[n].ok) x.classList.add("right"); });
      if (!ok) b.classList.add("wrong"); else score++;
      const fb = box.querySelector(".qz-fb");
      fb.innerHTML = `<div class="${ok ? "yes" : "no"}">${ok ? ["🎉 Correct! शाबाश!", "✅ बिल्कुल सही!", "🌟 Great job!"][i % 3] : "❌ ग़लत — सही जवाब हरे रंग में है"}</div><button class="un-btn" id="qzGo">${i + 1 < list.length ? "Next Question →" : "See Result 🏆"}</button>`;
      box.querySelector("#qzGo").onclick = () => { i++; i < list.length ? show() : result(); };
    }));
  };
  const result = () => {
    const o = loadProg(); o.q = o.q || {}; o.q[c.id] = Math.max(o.q[c.id] || 0, score); saveProg(o);
    const n = list.length, stars = score >= n ? 3 : score >= Math.ceil(n * .6) ? 2 : score > 0 ? 1 : 0;
    const msg = score >= n ? "Perfect Score! आप तो स्टार हो! 🌟" : score >= Math.ceil(n * .6) ? "बहुत बढ़िया! ऐसे ही आगे बढ़ो 💪" : "कोई बात नहीं, वीडियो दोबारा देखो और फिर कोशिश करो 📖";
    box.innerHTML = `<div class="qz-end"><div class="qz-stars">${[0, 1, 2].map((k) => `<span class="${k < stars ? "on" : ""}" style="animation-delay:${k * .25}s">★</span>`).join("")}</div>
      <div class="qz-score"><b>${score}</b>/${n}</div><div class="qz-msg">${msg}</div>
      <div class="qz-acts">${next ? `<button class="un-btn" id="qzNext">▶ Play Next Chapter</button>` : ""}<button class="qz-ghost" id="qzRe">↻ Retry Quiz</button><button class="qz-ghost" id="qzClose">Close</button></div></div>`;
    if (stars >= 2) confetti();
    box.querySelector("#qzClose").onclick = () => { close(); route(); };
    box.querySelector("#qzRe").onclick = () => { i = 0; score = 0; list.forEach((Q) => Q.opts.sort(() => Math.random() - .5)); show(); };
    const nb = box.querySelector("#qzNext"); if (nb) nb.onclick = () => { close(); onNext(); };
  };
  show();
}

// ---------- वेबसाइट बनाने वाले का कार्ड ----------
const devCard = () => `<div class="devcard"><div class="dv-av">👨‍🏫</div><div class="dv-t">
  <small>Website Created &amp; Managed by:</small><b>Ankush Sir</b><span>English Teacher · UHS Dhamuchak</span>
  <em>✨ Designed with ❤️ for every student of Dhamuchak</em></div></div>`;

function deepLink(e) {
  const a = e.target.closest && e.target.closest("a.contcard, .srch-r a");
  if (!a) return;
  const h = a.getAttribute("href"), m = h.match(/^(#c\d+-[a-z]+-[a-z]+)-.+$/);
  if (!m) return;
  e.preventDefault();
  history.pushState(null, "", m[1]);
  location.hash = h;
}

// ---------- घड़ी: दिन, तारीख़, साल, समय ----------
function clockText() {
  const d = new Date();
  const day = d.toLocaleDateString("hi-IN", { weekday: "long" });
  const dt = d.toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" });
  const tm = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }).toUpperCase();
  return `<span>📅 ${day}, ${dt}</span><span>⏰ ${tm}</span>`;
}
setInterval(() => { const c = document.getElementById("clockbar"); if (c) c.innerHTML = clockText(); }, 1000);

// ---------- Back बटन (फ़ोन का भी) ----------
// History ऐसे बनती है: #root → #home → #c10 → ... ; फ़ोन से Back दबाने पर एक-एक पन्ना पीछे जाएगा।
// होम पेज पर पहुँचकर Back दबाने पर साइट वहीं रहेगी, login पेज पर वापस नहीं जाएगी।
function setupHistory() {
  const target = location.hash && !["#root", "#home", "#login", ""].includes(location.hash) ? location.hash : null;
  history.replaceState(null, "", "#root");
  history.pushState(null, "", "#home");
  if (target) history.pushState(null, "", target);
}
function go(hash) { location.hash = hash; }
function back() { history.back(); }

function header(showBack) {
  return `<header class="top"><div class="top-in">
    ${showBack ? `<button class="back" id="backbtn" aria-label="पीछे">←</button>` : ""}
    <div class="brand"><div class="brand-row"><img class="logo blogo" src="bihar-shiksha.png" alt="शिक्षा विभाग, बिहार सरकार"><div class="school">${esc(SCHOOL_NAME)}</div></div>
      <div class="sub">${esc(TAGLINE)}</div></div>
    ${me ? `<button class="ghost" id="logout" aria-label="Logout">Logout</button>` : ""}
  </div>${ticker()}<div class="clockbar" id="clockbar">${clockText()}</div></header>
  ${DEMO ? `<div class="demo">डेमो मोड — Firebase जोड़ने पर असली साइट चालू होगी</div>` : ""}`;
}

async function doLogout() {
  if (!(await ask("Logout करने के बाद दोबारा खोलने के लिए फिर से नाम, कक्षा और स्कूल का UDISE कोड डालना होगा। Logout करें?", "हाँ, Logout", "नहीं"))) return;
  await S.logout();
  me = null;
  Object.keys(cache).forEach((k) => delete cache[k]);
  history.replaceState(null, "", "#login");
  loginView();
}

// विज़िटर गिनती (सिर्फ़ login पेज पर; मुफ़्त counter सेवा, न चले तो चुपचाप छिप जाती है)
function visitorStats() {
  const B = "https://api.counterapi.dev/v1/uhsdhamuchak";
  const get = (k, up) => fetch(`${B}/${k}${up ? "/up" : ""}`).then((r) => r.json()).then((j) => +j.count || 0);
  const bucket = () => Math.floor(Date.now() / 300000); // 5 मिनट की खिड़की
  const el = (id) => document.getElementById(id);
  let tot = 0;
  try { if (!sessionStorage.getItem("vcounted")) { sessionStorage.setItem("vcounted", "1"); tot = -1; } } catch {}
  const run = async () => {
    if (!el("visfoot")) { clearInterval(tm); return; }
    try {
      const b = bucket();
      if (run.last !== b) { run.last = b; await get(`on${b}`, true); }
      const [cur, prev] = await Promise.all([get(`on${b}`), get(`on${b - 1}`)]);
      if (el("vOn")) el("vOn").textContent = Math.max(cur, prev, 1);
      if (tot === -1) { tot = await get("total", true); } else if (!tot) { tot = await get("total"); }
      if (el("vTot")) el("vTot").textContent = tot.toLocaleString("en-IN");
    } catch { const f = el("visfoot"); if (f && !el("vTot").textContent.match(/\d/)) f.querySelector(".vf-row").style.display = "none"; }
  };
  const tm = setInterval(run, 60000); run();
}

function render(html, showBack = true) {
  clearInterval(wmTimer);
  app.innerHTML = header(showBack) + `<main class="wrap">${html}</main>${showBack ? `<footer class="sitefoot">${devCard()}© कॉपीराइट उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक · सर्वाधिकार सुरक्षित</footer>` : ""}`;
  const lo = document.getElementById("logout");
  if (lo) lo.onclick = doLogout;
  app.querySelectorAll("[data-logout]").forEach((b) => (b.onclick = doLogout));
  const bb = document.getElementById("backbtn");
  if (bb) bb.onclick = back;
  if (!document.getElementById("themebtn")) {
    const tb = document.createElement("button"); tb.id = "themebtn"; tb.setAttribute("aria-label", "डार्क / लाइट मोड");
    tb.textContent = isDark() ? "☀️ Light Mode" : "🌙 Dark Mode"; tb.onclick = toggleTheme; document.body.appendChild(tb);
  }
  app.querySelectorAll(".tile").forEach(tilt3d);
  window.scrollTo(0, 0);
}

// ---------- स्कूल फोटो ----------
const schoolPic = (small) => `<figure class="schoolpic${small ? " sm" : ""}"><img src="school.jpg" alt="उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक" loading="lazy" decoding="async">
  <figcaption><b>उत्क्रमित उच्च माध्यमिक (+2) विद्यालय, धामुचक</b><span>अंचल रजौली · जिला नवादा · बिहार</span></figcaption></figure>`;

// ---------- Login ----------
function loginView(msg = "") {
  render(`<div class="login-wrap">
  ${schoolPic()}
  <section class="hero">
    <div class="hero-in">
      <img class="hero-logo" src="bihar-shiksha.png" alt="">
      <span class="hero-badge">🎓 100% फ्री · कक्षा 9–12</span>
      <h3 class="hero-t">घर बैठे पढ़ाई,<br>अपने स्कूल के साथ</h3>
      <ul class="hero-f"><li>🎬 हर अध्याय की वीडियो क्लास</li><li>📝 अभ्यास प्रश्न और सार</li><li>📱 मोबाइल पर कभी भी</li></ul>
      <div class="hero-go"><span class="go-side">लॉगिन यहाँ करें <b class="hand">👉</b></span><span class="go-down">लॉगिन नीचे करें <b class="hand">👇</b></span></div>
    </div>
  </section>
  ${FEST ? `<div class="festban">${FEST.ic} ${esc(FEST.txt)} ${FEST.ic}</div>` : ""}
  <section class="card login">
    <h2>Hello Student 👋🏻</h2>
    <p class="muted">नाम, कक्षा और UDISE कोड डालें।</p>
    <form id="f">
      <label>Enter Your Name<input name="sname" required autocomplete="name" maxlength="50"></label>
      <label>Choose your Class
        <select name="cls" required><option value="">चुनें</option>
        ${CLASSES.map((c) => `<option value="${c}">कक्षा ${c}</option>`).join("")}</select></label>
      <label>School UDISE Code :<input name="code" inputmode="numeric" required autocomplete="off"></label>
      <div class="err">${esc(msg)}</div>
      <button class="primary" type="submit">पढ़ाई शुरू करें →</button>
    </form>
    <div class="sir"><div class="av">👨‍🏫</div><p><b>पंकज सर</b> (प्रधानाध्यापक):<br>विद्या सबसे बड़ा धन है। हर दिन थोड़ा सीखिए, कल आप खुद पर गर्व करेंगे। 🌟</p></div>
    ${DEMO ? `<p class="hint">डेमो के लिए: कोई भी नाम, कोई भी कक्षा, UDISE कोड 10010203040<br><a href="teacher.html">→ टीचर पैनल का डेमो देखें</a></p>` : ""}
  </section></div>
  <p class="credit">🏫 प्रस्तुति: <b>उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक</b></p>${devCard()}
  <div class="visfoot" id="visfoot"><div class="vf-row"><span class="vf-i"><b id="vOn">–</b><small>Online Now</small></span><span class="vf-i"><b id="vTot">–</b><small>Total Visitors</small></span></div>
  <div class="vf-c">📧 Contact: <a href="mailto:uhsdhamuchak2000@gmail.com">uhsdhamuchak2000@gmail.com</a></div></div>`, false);
  visitorStats();
  const f = document.getElementById("f");
  f.onsubmit = async (e) => {
    e.preventDefault();
    const btn = f.querySelector("button");
    btn.disabled = true; btn.textContent = "जाँच हो रही है…";
    try {
      me = await S.studentLogin(f.sname.value, f.cls.value, f.code.value);
      setupHistory();       // login पेज history से हट जाता है
      route();
    } catch (err) {
      loginView(err.message);
    }
  };
}

async function chaptersFor(cls) {
  if (!cache[cls]) cache[cls] = await S.getClassChapters(cls);
  return cache[cls];
}

const subT = (c) => { const e = String(c.title_en || "").split(" · ")[0].trim(); return e && e !== c.title ? `<small style="display:block;font-weight:500;opacity:.7;font-size:.85em">${esc(e)}</small>` : ""; };
const countLabel = (n) => (n ? `${n} चैप्टर` : "जल्द आ रहा है");

// ---------- पन्ने ----------
// बच्चे को सिर्फ उसकी अपनी कक्षा (और 11–12 में अपना संकाय) दिखता है
const myStream = () => (hasStreams(me.class) ? (streamOf(me.stream) ? me.stream : "") : "all");

function homeView() {
  const stream = myStream();
  if (!stream) return streamsView(me.class); // 11–12 का बच्चा जिसका संकाय टीचर ने नहीं चुना
  return subjectsView(me.class, stream, true);
}

function greet(list = []) {
  const st = streamOf(me.stream);
  const withV = list.filter((c) => c.video || c.youtubeId);
  const done = list.filter((c) => pctOf(c.id) >= 100).length;
  const started = list.filter((c) => { const p = pctOf(c.id); return p > 0 && p < 100; }).length;
  const all = avg(list);
  return `<section class="welcome"><div class="w-in"><div class="w-txt">
      <div class="hi">आज क्या पढ़ेंगे, ${esc(me.name)}? 📖</div>
      <span class="cl">कक्षा ${esc(me.class)}${hasStreams(me.class) && st ? " · " + st.name : ""}</span>
      <div class="msg">${all >= 100 ? "शाबाश! सब पूरा हो गया 🎉" : all > 0 ? "बढ़िया चल रहा है, आगे बढ़ते रहो! 💪" : "आज से पढ़ाई शुरू करो — पहला चैप्टर खोलो! 🚀"}</div>
    </div>${list.length ? ring(all, 78, 8) : ""}</div></section>
  ${list.length ? `<div class="stats"><div class="stat"><b>${withV.length}</b><small>वीडियो क्लास</small></div>
    <div class="stat"><b>${done}</b><small>पूरे चैप्टर ✓</small></div><div class="stat"><b>${started}</b><small>चल रहे</small></div></div>` : ""}`;
}

function streamsView(cls) {
  render(`${greet()}<h2>अपना संकाय (Stream) चुनें</h2>
  <div class="grid streams">
    ${STREAMS.map((s) => `<a class="tile" href="#c${cls}-${s.id}">
      <div class="ic"><span class="ai" data-s="${s.id}">${s.icon}</span></div><div class="t">${s.name}</div><div class="c">${s.en}</div></a>`).join("")}
  </div>
  <div class="logout-row"><button class="btn red" data-logout>Logout करें</button></div>`, false);
}

async function subjectsView(cls, stream, isHome = false) {
  render(`<div class="loading">विषय लोड हो रहे हैं…</div>`, !isHome);
  let list;
  try { list = await chaptersFor(cls); } catch (e) { return errorView(e); }
  const st = streamOf(stream);
  const tile = (s) => {
    const ch = list.filter((c) => c.subject === s.id), n = ch.length, p = avg(ch), d = ch.filter((c) => pctOf(c.id) >= 100).length;
    return `<a class="tile${n ? "" : " soon"}" style="${cvars(s.id)}" href="#c${cls}-${stream}-${s.id}"><div class="ic"><span class="ai" data-s="${s.id}">${s.icon}</span></div>
      <div class="t">${esc(s.name)}</div><div class="en">${esc(s.en)}</div><div class="c">${countLabel(n)}</div>
      ${n ? `<div class="bar"><i style="width:${p}%"></i></div><div class="pc"><span>${d}/${n} पूरे</span><span>${p >= 100 ? "✓ पूरा" : p + "%"}</span></div>` : ""}</a>`;
  };
  render(`${isHome ? (FEST ? `<div class="festban">${FEST.ic} ${esc(FEST.txt)} ${FEST.ic}</div>` : "") + continueCard(list) + greet(list) + dailyCard() + searchBox() : `<div class="crumb">कक्षा ${esc(cls)}${st ? " › " + st.name + " (" + st.en + ")" : ""}</div>`}
  <h2>📚 कौन सा विषय पढ़ना है?</h2>
  ${subjectGroups(cls, stream).map((g) => `<h3 class="gtitle">${esc(g.title)}</h3>
    <div class="grid">${g.items.map(tile).join("")}</div>`).join("")}
  ${isHome ? `${schoolPic(true)}${devCard()}<div class="logout-row"><button class="btn red" data-logout>Logout करें</button></div>` : ""}`, !isHome);
  if (isHome) { wireSearch(list, cls, stream); festRain(); }
}

async function chapterListView(cls, stream, sid) {
  const sub = subjectById(cls, sid);
  if (!sub) return go(`#c${cls}`);
  render(`<div class="loading">चैप्टर लोड हो रहे हैं…</div>`);
  let list;
  try { list = (await chaptersFor(cls)).filter((c) => c.subject === sid); } catch (e) { return errorView(e); }
  const st = streamOf(stream);
  const sp = avg(list), sd = list.filter((c) => pctOf(c.id) >= 100).length;
  const row = (c) => {
    const p = pctOf(c.id), hasV = c.video || c.youtubeId;
    return `<a class="row${p >= 100 ? " done" : ""}" href="#c${cls}-${stream}-${sid}-${encodeURIComponent(c.id)}">
      <div class="num">${esc(c.number)}</div>
      <div style="min-width:0"><div class="t">${esc(c.title)}${subT(c)}</div><div class="meta">
        ${hasV ? `<span class="chip v">▶ वीडियो${c.minutes ? ` · ${esc(c.minutes)} मिनट` : ""}</span>` : `<span class="chip">📝 नोट्स</span>`}
        ${qScore(c.id) != null ? `<span class="chip qz">⭐ Quiz ${qScore(c.id)}/5</span>` : ""}${p >= 100 ? `<span class="chip ok">✓ पूरा</span>` : p > 0 ? `<span class="chip">जारी है</span>` : `<span class="chip new">नया</span>`}</div></div>
      <div class="rcol">${ring(p, 44, 5)}${p >= 100 ? "" : `<small>${p ? p + "% पढ़ा" : "शुरू करें"}</small>`}</div></a>`;
  };
  render(`<div class="crumb">कक्षा ${esc(cls)}${st ? " › " + st.name : ""} › ${esc(subjLabel(sub))}</div>
  <section class="subhead" style="${cvars(sid)}"><div class="ic"><span class="ai" data-s="${sid}">${sub.icon}</span></div>
    <div class="tx"><div class="t">${esc(subjLabel(sub))}</div><div class="s">${list.length} चैप्टर · ${sd} पूरे</div></div>${list.length ? ring(sp, 62, 7) : ""}</section>
  <div class="chlist" style="${cvars(sid)}">
  ${list.length ? list.map(row).join("")
    : `<div class="empty">इस विषय के चैप्टर अभी नहीं जुड़े हैं।<br>टीचर जल्द ही जोड़ेंगे।</div>`}
  </div>`);
}

async function chapterView(cls, stream, sid, id) {
  const sub = subjectById(cls, sid);
  render(`<div class="loading">लोड हो रहा है…</div>`);
  let list;
  try { list = (await chaptersFor(cls)).filter((c) => c.subject === sid); } catch (e) { return errorView(e); }
  const i = list.findIndex((c) => c.id === id);
  if (i < 0) return go(`#c${cls}-${stream}-${sid}`);
  const c = list[i], prev = list[i - 1], next = list[i + 1];
  const base = `#c${cls}-${stream}-${sid}-`;
  const paras = String(c.notes || "").split(/\n\s*\n/).filter((p) => p.trim());
  const notes = paras.length ? "x" : "";
  const st = streamOf(stream);
  // अगला/पिछला चैप्टर history में नया पन्ना नहीं जोड़ता, ताकि Back सीधे चैप्टर लिस्ट पर जाए
  const p0 = pctOf(c.id);
  render(`<div style="${cvars(sid)}"><div class="crumb">कक्षा ${esc(cls)}${st ? " › " + st.name : ""} › ${esc(sub ? subjLabel(sub) : sid)}</div>
  <div class="chhead"><div class="num">${esc(c.number)}</div><div><h2>${esc(c.title)}${subT(c)}</h2><div class="s">अध्याय ${esc(c.number)}${c.minutes ? ` · ${esc(c.minutes)} मिनट` : ""}</div></div></div>
  <div class="player" id="player">
    ${c.video
      ? `<video src="${esc(c.video)}" controls controlsList="nodownload nofullscreen" disablepictureinpicture playsinline preload="metadata" oncontextmenu="return false"></video>`
      : c.youtubeId
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(c.youtubeId)}?rel=0&modestbranding=1&playsinline=1&fs=0"
          title="${esc(c.title)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>`
      : `<div class="novideo">इस चैप्टर का वीडियो जल्द आएगा।<br>तब तक नीचे के नोट्स पढ़ें।</div>`}
    <div class="wm" id="wm">${esc(me.name)} · कक्षा ${esc(me.class)}</div>
    <button class="fsbtn" id="fs" aria-label="पूरी स्क्रीन">⛶</button>
  </div>
  ${c.video ? `<div class="speeds" id="speeds"><span>⚡ Speed</span>${[0.5,0.75,1,1.25,1.5,2,3].map((x) => `<button class="sp${x === 1 ? " on" : ""}" data-r="${x}">${x}×</button>`).join("")}</div>` : ""}
  <div class="progline"><span id="pring">${ring(p0, 46, 5)}</span><div class="pl-t" id="ptxt">${p0 >= 100 ? "यह चैप्टर पूरा हो गया ✓" : p0 ? `आपने ${p0}% पढ़ लिया है` : "पढ़ना शुरू करें"}<small>${c.video ? "वीडियो देखने के साथ आपकी प्रगति अपने-आप दर्ज होगी" : "पढ़ लेने पर नीचे का बटन दबाएँ"}</small></div></div>
  <div class="tools"><button class="btn" id="fs2">⛶ पूरी स्क्रीन में देखें</button>${notes ? `<button class="btn" id="pdfbtn" ${c.video && p0 < 100 ? "hidden" : ""}>📄 पूरी क्लास PDF में डाउनलोड करें</button>` : ""}${p0 >= 100 || c.video ? "" : `<button class="btn okb" id="markdone">✓ पूरा पढ़ लिया</button>`}<button class="btn quizb" id="quizbtn" ${p0 >= 100 ? "" : "hidden"}>📝 Take Quiz${qScore(c.id) != null ? ` · ⭐ ${qScore(c.id)}/5` : ""}</button></div>
  ${notes ? `<section class="card notes"><div class="pdf-head">कक्षा ${esc(cls)} · ${esc(c.title)}</div><h3>📝 चैप्टर को कहानी की तरह समझें</h3><div id="ntxt"></div></section>` : ""}
  ${next ? `<div class="upnext" style="${cvars(sid)}"><div class="un-l"><small>UP NEXT · Chapter ${esc(next.number)}</small><b>${esc(next.title)}</b>${subT(next)}</div>
    <button class="un-btn" data-swap="${esc(base + encodeURIComponent(next.id))}">▶ Play Next Chapter</button></div>`
    : `<div class="upnext last" style="${cvars(sid)}"><div class="un-l"><small>🎉 WELL DONE!</small><b>This was the last chapter of ${esc(sub ? sub.en || subjLabel(sub) : "this subject")}</b></div>
    <a class="un-btn" href="#home">🏠 Back to Subjects</a></div>`}
  <div class="pager">
    ${prev ? `<button class="btn" data-swap="${esc(base + encodeURIComponent(prev.id))}">← पिछला चैप्टर</button>` : "<span></span>"}
    <span></span>
  </div></div>`);
  saveLast({ h: base + encodeURIComponent(c.id), id: c.id, s: sub ? subjLabel(sub) : "" });
  // प्रगति: वीडियो जितना देखा, उतना % (और जहाँ छोड़ा वहीं से फिर शुरू)
  const setP = (pct) => {
    const o = loadProg(); const old = o.p[c.id] || 0; if (pct <= old && pct < 100) return;
    o.p[c.id] = Math.max(old, pct); saveProg(o);
    const p = Math.min(100, Math.round(o.p[c.id]));
    document.getElementById("pring").innerHTML = ring(p, 46, 5);
    document.getElementById("ptxt").firstChild.textContent = p >= 100 ? "यह चैप्टर पूरा हो गया ✓" : `आपने ${p}% पढ़ लिया है`;
    if (p >= 100) { document.getElementById("markdone")?.remove(); const qb = document.getElementById("quizbtn"); if (qb) qb.hidden = false; }
  };
  const pb = document.getElementById("pdfbtn");
  if (pb) pb.onclick = () => {
    const old = document.title;
    document.title = `कक्षा ${cls} - ${sub ? subjLabel(sub) : sid} - ${c.title}`.replace(/[\\/:*?"<>|]/g, " ");
    document.body.classList.add("printnotes");
    const done = () => { document.body.classList.remove("printnotes"); document.title = old; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done); window.print();
  };
  // नोट्स वीडियो के साथ-साथ टाइप होंगे (जितना देखा उतना ही)
  const ntxt = document.getElementById("ntxt");
  if (ntxt) {
    const total = paras.reduce((a, p) => a + p.length, 0);
    const sec = ntxt.parentElement;
    let shown = -1, want = 0, tm = null;
    const draw = (n) => {
      let left = n, h = "";
      for (const p of paras) {
        if (left <= 0) break;
        const part = p.slice(0, left); left -= p.length;
        h += `<p>${esc(part).replace(/\n/g, "<br>")}</p>`;
      }
      if (n < total) h = h.replace(/<\/p>$/, '<span class="cur">▍</span></p>');
      ntxt.innerHTML = h; shown = n;
      sec.style.display = n > 0 ? "" : "none";
      const pdf = document.getElementById("pdfbtn");
      if (pdf && n >= total) pdf.hidden = false;
    };
    const step = () => {
      if (shown >= want) { clearInterval(tm); tm = null; return; }
      draw(Math.min(want, shown + Math.max(2, Math.ceil((want - shown) / 25))));
    };
    const setWant = (n) => { want = Math.max(want, Math.min(total, n)); if (!tm && shown < want) tm = setInterval(step, 50); };
    if (!c.video || p0 >= 100) draw(total);
    else {
      draw(0);
      const o0 = loadProg(); o0.m = o0.m || {};
      let maxT = o0.m[c.id] || 0, dur = 0, lastSave = 0;
      const upd = () => { if (dur) setWant(Math.floor(total * Math.min(1, maxT / dur))); };
      const v = app.querySelector(".player video");
      v.addEventListener("loadedmetadata", () => { dur = v.duration; if (maxT > 0) { draw(Math.floor(total * Math.min(1, maxT / dur))); want = shown; } });
      v.addEventListener("timeupdate", () => {
        dur = v.duration || dur;
        // आगे कूदने (seek) से नोट्स आगे नहीं बढ़ेंगे; सिर्फ़ असली देखने से
        if (v.currentTime > maxT && v.currentTime - maxT < 3) maxT = v.currentTime;
        upd();
        if (Date.now() - lastSave > 4000) { lastSave = Date.now(); const o = loadProg(); o.m = o.m || {}; o.m[c.id] = maxT; saveProg(o); }
      });
      v.addEventListener("ended", () => { maxT = dur; upd(); const o = loadProg(); o.m = o.m || {}; o.m[c.id] = maxT; saveProg(o); });
    }
  }
  const goNext = () => { if (next) { history.replaceState(null, "", base + encodeURIComponent(next.id)); route(); } };
  const openQuiz = () => startQuiz({ cls, c, next, onNext: goNext });
  const qbtn = document.getElementById("quizbtn"); if (qbtn) qbtn.onclick = openQuiz;
  const md = document.getElementById("markdone");
  if (md) md.onclick = () => { setP(100); openQuiz(); };
  const vid = app.querySelector(".player video");
  if (vid) {
    let last = 0;
    vid.addEventListener("loadedmetadata", () => {
      const t = loadProg().t[c.id] || 0;
      if (t > 15 && t < vid.duration - 20) vid.currentTime = t;
    });
    vid.addEventListener("timeupdate", () => {
      if (!vid.duration || Date.now() - last < 4000) return;
      last = Date.now();
      const o = loadProg(); o.t[c.id] = vid.currentTime; saveProg(o);
      const pct = vid.currentTime / vid.duration * 100;
      setP(pct >= 95 ? 100 : Math.floor(pct));
    });
    vid.addEventListener("ended", () => setP(100));
    vid.addEventListener("ended", () => {
      if (document.fullscreenElement) try { document.exitFullscreen(); } catch {}
      document.body.classList.remove("vplay");
      openQuiz();
    });
    // स्पीड बटन (0.5× से 3×)
    const sb = document.getElementById("speeds");
    const setR = (r) => { vid.playbackRate = r; sb.querySelectorAll("button").forEach((b) => b.classList.toggle("on", +b.dataset.r === r)); };
    sb.querySelectorAll("button").forEach((b) => (b.onclick = () => setR(+b.dataset.r)));
    vid.addEventListener("ratechange", () => sb.querySelectorAll("button").forEach((b) => b.classList.toggle("on", +b.dataset.r === vid.playbackRate)));
    // वीडियो चलते ही ऊपर की चलती पट्टी हट जाए, रुकने पर लौट आए
    vid.addEventListener("play", () => document.body.classList.add("vplay"));
    vid.addEventListener("pause", () => document.body.classList.remove("vplay"));
    vid.addEventListener("ended", () => document.body.classList.remove("vplay"));
  }
  if (!vid) document.body.classList.remove("vplay");
  app.querySelectorAll("[data-swap]").forEach((b) => (b.onclick = () => { history.replaceState(null, "", b.dataset.swap); route(); }));

  // नाम वाला निशान वीडियो पर घूमता रहेगा (screen record करने वाले की पहचान के लिए)
  const wm = document.getElementById("wm");
  wm.style.top = "8px"; wm.style.left = "10px"; // एक कोने में टिका रहेगा, चलेगा नहीं
  // पूरी स्क्रीन हमारे बॉक्स की होगी (कंप्यूटर और फ़ोन दोनों), ताकि नाम वाला निशान दिखता रहे
  const fs = async () => {
    const p = document.getElementById("player");
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
      }
      if (p.requestFullscreen) await p.requestFullscreen();
      else if (p.webkitRequestFullscreen) p.webkitRequestFullscreen();
      else p.classList.add("pseudo-fs");
      if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {});
    } catch { p.classList.toggle("pseudo-fs"); }
  };
  document.getElementById("fs").onclick = fs;
  document.getElementById("fs2").onclick = fs;
}

function errorView(e) {
  console.error(e);
  const denied = String(e && (e.code || e.message)).includes("permission");
  if (denied) { me = null; return loginView("आपका login रुक गया है। फिर से login करें या टीचर से संपर्क करें।"); }
  render(`<div class="empty">लोड नहीं हो पाया। इंटरनेट देखकर फिर कोशिश करें।<br><br>
    <button class="btn" id="reload">फिर कोशिश करें</button></div>`);
  document.getElementById("reload").onclick = () => { Object.keys(cache).forEach((k) => delete cache[k]); route(); };
}

function route() {
  if (!me) return loginView();
  const h = location.hash;
  // होम से पीछे जाने की कोशिश: वहीं रोक दो (login पर वापस नहीं)
  if (h === "#root" || h === "#login" || h === "") { history.pushState(null, "", "#home"); return homeView(); }
  // #c10-all-science | #c11-arts | #c11-arts-history | #c11-arts-history-ID  (सिर्फ अपनी कक्षा)
  const m = h.match(/^#c(\d+)-(all|science|arts|commerce)(?:-([a-z]+)(?:-([A-Za-z0-9_]+))?)?$/);
  if (m && m[1] === me.class) {
    const [, cls, stream, sid, id] = m;
    const mine = myStream();
    const ok = mine ? stream === mine : hasStreams(cls) && stream !== "all";
    if (ok) {
      if (sid && id) return chapterView(cls, stream, sid, id);
      if (sid) return chapterListView(cls, stream, sid);
      if (!mine) return subjectsView(cls, stream);
    }
  }
  if (h !== "#home") history.replaceState(null, "", "#home");
  homeView();
}

window.addEventListener("hashchange", route);
// सीधे चैप्टर खोलने पर (resume/खोज) पहले विषय वाला पन्ना history में, ताकि Back वहीं जाए
app.addEventListener("click", deepLink);
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && screen.orientation && screen.orientation.unlock) try { screen.orientation.unlock(); } catch {}
});

(async () => {
  try { me = await S.restoreStudent(); } catch (e) { console.error(e); me = null; }
  if (me) setupHistory();
  route();
})();
