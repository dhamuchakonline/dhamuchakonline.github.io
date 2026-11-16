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
  </div>${ticker()}<a class="schweb" href="https://uhsdhamuchak.space" target="_blank" rel="noopener">School Website : <b>uhsdhamuchak.space</b></a></header>
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
  app.innerHTML = header(showBack) + `<main class="wrap">${html}</main>${showBack ? `<footer class="sitefoot">© कॉपीराइट उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक · सर्वाधिकार सुरक्षित<br>Website Created &amp; Managed by: <b>Ankush Sir</b></footer>` : ""}`;
  const lo = document.getElementById("logout");
  if (lo) lo.onclick = doLogout;
  app.querySelectorAll("[data-logout]").forEach((b) => (b.onclick = doLogout));
  const bb = document.getElementById("backbtn");
  if (bb) bb.onclick = back;
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
  <p class="credit">🏫 प्रस्तुति: <b>उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक</b><br>💻 Website Created &amp; Managed by: <b>Ankush Sir</b></p>
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
  render(`${isHome ? greet(list) : `<div class="crumb">कक्षा ${esc(cls)}${st ? " › " + st.name + " (" + st.en + ")" : ""}</div>`}
  <h2>📚 कौन सा विषय पढ़ना है?</h2>
  ${subjectGroups(cls, stream).map((g) => `<h3 class="gtitle">${esc(g.title)}</h3>
    <div class="grid">${g.items.map(tile).join("")}</div>`).join("")}
  ${isHome ? `${schoolPic(true)}<div class="logout-row"><button class="btn red" data-logout>Logout करें</button></div>` : ""}`, !isHome);
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
        ${p >= 100 ? `<span class="chip ok">✓ पूरा</span>` : p > 0 ? `<span class="chip">जारी है</span>` : `<span class="chip new">नया</span>`}</div></div>
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
  <div class="tools"><button class="btn" id="fs2">⛶ पूरी स्क्रीन में देखें</button>${notes ? `<button class="btn" id="pdfbtn" ${c.video && p0 < 100 ? "hidden" : ""}>📄 पूरी क्लास PDF में डाउनलोड करें</button>` : ""}${p0 >= 100 || c.video ? "" : `<button class="btn okb" id="markdone">✓ पूरा पढ़ लिया</button>`}</div>
  ${notes ? `<section class="card notes"><div class="pdf-head">कक्षा ${esc(cls)} · ${esc(c.title)}</div><h3>📝 चैप्टर को कहानी की तरह समझें</h3><div id="ntxt"></div></section>` : ""}
  <div class="pager">
    ${prev ? `<button class="btn" data-swap="${esc(base + encodeURIComponent(prev.id))}">← पिछला चैप्टर</button>` : "<span></span>"}
    ${next ? `<button class="btn dark" data-swap="${esc(base + encodeURIComponent(next.id))}">अगला चैप्टर →</button>` : "<span></span>"}
  </div></div>`);
  // प्रगति: वीडियो जितना देखा, उतना % (और जहाँ छोड़ा वहीं से फिर शुरू)
  const setP = (pct) => {
    const o = loadProg(); const old = o.p[c.id] || 0; if (pct <= old && pct < 100) return;
    o.p[c.id] = Math.max(old, pct); saveProg(o);
    const p = Math.min(100, Math.round(o.p[c.id]));
    document.getElementById("pring").innerHTML = ring(p, 46, 5);
    document.getElementById("ptxt").firstChild.textContent = p >= 100 ? "यह चैप्टर पूरा हो गया ✓" : `आपने ${p}% पढ़ लिया है`;
    if (p >= 100) document.getElementById("markdone")?.remove();
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
  const md = document.getElementById("markdone");
  if (md) md.onclick = () => setP(100);
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
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && screen.orientation && screen.orientation.unlock) try { screen.orientation.unlock(); } catch {}
});

(async () => {
  try { me = await S.restoreStudent(); } catch (e) { console.error(e); me = null; }
  if (me) setupHistory();
  route();
})();
