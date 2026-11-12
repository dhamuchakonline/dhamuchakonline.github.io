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
    <div class="brand"><div class="logo">📚</div>
      <div><div class="school">${esc(SCHOOL_NAME)}</div><div class="sub">${esc(TAGLINE)}</div></div></div>
    ${me ? `<button class="ghost" id="logout" aria-label="Logout">🚪<span class="lbl"> Logout</span></button>` : ""}
  </div></header>
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

function render(html, showBack = true) {
  clearInterval(wmTimer);
  app.innerHTML = header(showBack) + `<main class="wrap">${html}</main>`;
  const lo = document.getElementById("logout");
  if (lo) lo.onclick = doLogout;
  app.querySelectorAll("[data-logout]").forEach((b) => (b.onclick = doLogout));
  const bb = document.getElementById("backbtn");
  if (bb) bb.onclick = back;
  window.scrollTo(0, 0);
}

// ---------- Login ----------
function loginView(msg = "") {
  render(`<div class="login-wrap">
  <section class="hero">
    <div class="hero-badge">🎓 बिल्कुल मुफ़्त</div>
    <h1>ऑनलाइन फ्री क्लास</h1>
    <p>${esc(SCHOOL_NAME)} के बच्चों के लिए — कक्षा 9 से 12 तक (11–12 में Science, Arts, Commerce), हर विषय, हर चैप्टर, वीडियो और कहानी के साथ।</p>
  </section>
  <section class="card login">
    <h2>स्वागत है 🙏</h2>
    <p class="muted">अपना नाम, कक्षा और स्कूल का UDISE कोड डालें।</p>
    <form id="f">
      <label>आपका नाम<input name="sname" required autocomplete="name" maxlength="50"></label>
      <label>कक्षा
        <select name="cls" required><option value="">चुनें</option>
        ${CLASSES.map((c) => `<option value="${c}">कक्षा ${c}</option>`).join("")}</select></label>
      <label>स्कूल का UDISE कोड<input name="code" inputmode="numeric" required autocomplete="off"></label>
      <div class="err">${esc(msg)}</div>
      <button class="primary" type="submit">पढ़ाई शुरू करें</button>
    </form>
    ${DEMO ? `<p class="hint">डेमो के लिए: कोई भी नाम, कोई भी कक्षा, UDISE कोड 10010203040<br><a href="teacher.html">→ टीचर पैनल का डेमो देखें</a></p>` : ""}
  </section></div>`, false);
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

const countLabel = (n) => (n ? `${n} चैप्टर` : "जल्द आ रहा है");

// ---------- पन्ने ----------
// बच्चे को सिर्फ उसकी अपनी कक्षा (और 11–12 में अपना संकाय) दिखता है
const myStream = () => (hasStreams(me.class) ? (streamOf(me.stream) ? me.stream : "") : "all");

function homeView() {
  const stream = myStream();
  if (!stream) return streamsView(me.class); // 11–12 का बच्चा जिसका संकाय टीचर ने नहीं चुना
  return subjectsView(me.class, stream, true);
}

function greet() {
  const st = streamOf(me.stream);
  return `<div class="homehead"><p class="hello">नमस्ते <b>${esc(me.name)}</b> 👋<br>
    <span class="muted">कक्षा ${esc(me.class)}${hasStreams(me.class) && st ? " · " + st.name + " (" + st.en + ")" : ""}</span></p></div>`;
}

function streamsView(cls) {
  render(`${greet()}<h2>अपना संकाय (Stream) चुनें</h2>
  <div class="grid streams">
    ${STREAMS.map((s) => `<a class="tile" href="#c${cls}-${s.id}">
      <div class="ic">${s.icon}</div><div class="t">${s.name}</div><div class="c">${s.en}</div></a>`).join("")}
  </div>
  <div class="logout-row"><button class="btn red" data-logout>🚪 Logout करें</button></div>`, false);
}

async function subjectsView(cls, stream, isHome = false) {
  render(`<div class="loading">विषय लोड हो रहे हैं…</div>`, !isHome);
  let list;
  try { list = await chaptersFor(cls); } catch (e) { return errorView(e); }
  const st = streamOf(stream);
  render(`${isHome ? greet() : `<div class="crumb">कक्षा ${esc(cls)}${st ? " › " + st.name + " (" + st.en + ")" : ""}</div>`}
  <h2>📚 कौन सा विषय पढ़ना है?</h2>
  ${subjectGroups(cls, stream).map((g) => `<h3 class="gtitle">${esc(g.title)}</h3>
    <div class="grid">${g.items.map((s) => `<a class="tile" href="#c${cls}-${stream}-${s.id}"><div class="ic">${s.icon}</div>
      <div class="t">${esc(s.name)}</div><div class="en">(${esc(s.en)})</div><div class="c">${countLabel(list.filter((c) => c.subject === s.id).length)}</div></a>`).join("")}
    </div>`).join("")}
  ${isHome ? `<div class="logout-row"><button class="btn red" data-logout>🚪 Logout करें</button></div>` : ""}`, !isHome);
}

async function chapterListView(cls, stream, sid) {
  const sub = subjectById(cls, sid);
  if (!sub) return go(`#c${cls}`);
  render(`<div class="loading">चैप्टर लोड हो रहे हैं…</div>`);
  let list;
  try { list = (await chaptersFor(cls)).filter((c) => c.subject === sid); } catch (e) { return errorView(e); }
  const st = streamOf(stream);
  render(`<div class="crumb">कक्षा ${esc(cls)}${st ? " › " + st.name : ""} › ${esc(subjLabel(sub))}</div>
  <h2>${sub.icon} ${esc(subjLabel(sub))} — चैप्टर चुनें</h2>
  <div class="chlist">
  ${list.length ? list.map((c) => `<a class="row" href="#c${cls}-${stream}-${sid}-${encodeURIComponent(c.id)}">
      <div class="num">${esc(c.number)}</div>
      <div><div class="t">${esc(c.title)}</div><div class="c">${c.youtubeId ? "▶ वीडियो उपलब्ध" : "📝 सिर्फ नोट्स"}</div></div>
      <div class="go">›</div></a>`).join("")
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
  const notes = String(c.notes || "").split(/\n\s*\n/).filter((p) => p.trim())
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const st = streamOf(stream);
  // अगला/पिछला चैप्टर history में नया पन्ना नहीं जोड़ता, ताकि Back सीधे चैप्टर लिस्ट पर जाए
  render(`<div class="crumb">कक्षा ${esc(cls)}${st ? " › " + st.name : ""} › ${esc(sub ? subjLabel(sub) : sid)}</div>
  <h2>अध्याय ${esc(c.number)}: ${esc(c.title)}</h2>
  <div class="player" id="player">
    ${c.youtubeId
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(c.youtubeId)}?rel=0&modestbranding=1&playsinline=1&fs=0"
          title="${esc(c.title)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>`
      : `<div class="novideo">इस चैप्टर का वीडियो जल्द आएगा।<br>तब तक नीचे के नोट्स पढ़ें।</div>`}
    <div class="wm" id="wm">${esc(me.name)} · कक्षा ${esc(me.class)}</div>
    <button class="fsbtn" id="fs" aria-label="पूरी स्क्रीन">⛶</button>
  </div>
  <div class="tools"><button class="btn" id="fs2">⛶ पूरी स्क्रीन में देखें</button></div>
  ${notes ? `<section class="card notes"><h3>📝 चैप्टर को कहानी की तरह समझें</h3>${notes}</section>` : ""}
  <div class="pager">
    ${prev ? `<button class="btn" data-swap="${esc(base + encodeURIComponent(prev.id))}">← पिछला चैप्टर</button>` : "<span></span>"}
    ${next ? `<button class="btn dark" data-swap="${esc(base + encodeURIComponent(next.id))}">अगला चैप्टर →</button>` : "<span></span>"}
  </div>`);
  app.querySelectorAll("[data-swap]").forEach((b) => (b.onclick = () => { history.replaceState(null, "", b.dataset.swap); route(); }));

  // नाम वाला निशान वीडियो पर घूमता रहेगा (screen record करने वाले की पहचान के लिए)
  const wm = document.getElementById("wm");
  const move = () => { wm.style.top = 6 + Math.random() * 78 + "%"; wm.style.left = 4 + Math.random() * 55 + "%"; };
  move(); wmTimer = setInterval(move, 6000);
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
