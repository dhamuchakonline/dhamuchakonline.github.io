// टीचर पैनल: बच्चे जोड़ना, PIN देना, मोबाइल Reset/Block, चैप्टर और वीडियो जोड़ना
import { SCHOOL_NAME, CLASSES, STREAMS, hasStreams, allSubjects, DEMO } from "./config.js";
import * as S from "./store.js";
import { ask, tell } from "./dialog.js";

const app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ui = { tab: "students", fCls: "", q: "", chCls: "10", chSub: "maths", edit: null, okHtml: "" };
let teacher = null;
let students = [];

function shell(body) {
  app.innerHTML = `<header class="top"><div class="brand"><div class="logo">🧑‍🏫</div>
    <div><div class="school">${esc(SCHOOL_NAME)}</div><div class="sub">टीचर पैनल</div></div></div>
    ${teacher ? `<button class="ghost" id="out">बाहर निकलें</button>` : ""}</header>
    ${DEMO ? `<div class="demo">डेमो मोड — यहाँ किया गया बदलाव सिर्फ इसी मोबाइल में रहेगा</div>` : ""}
    <main class="wrap">${body}</main>`;
  const o = document.getElementById("out");
  if (o) o.onclick = async () => { await S.logout(); teacher = null; loginView(); };
}

function loginView(msg = "") {
  shell(`<section class="card login"><h1>टीचर Login</h1>
    <p class="muted">यह पन्ना सिर्फ स्कूल के टीचर्स के लिए है।</p>
    <form id="f">
      <label>ईमेल<input name="email" type="email" required autocomplete="username"></label>
      <label>पासवर्ड<input name="pass" type="password" required autocomplete="current-password"></label>
      <div class="err">${esc(msg)}</div>
      <button class="primary">Login करें</button>
    </form>
    ${DEMO ? `<p class="hint">डेमो: ईमेल teacher@demo, पासवर्ड 123456<br><a href="index.html">→ बच्चों वाली साइट का डेमो</a></p>` : ""}</section>`);
  const f = document.getElementById("f");
  f.onsubmit = async (e) => {
    e.preventDefault();
    f.querySelector("button").disabled = true;
    try { teacher = await S.teacherLogin(f.email.value, f.pass.value); main(); }
    catch (err) { loginView(err.message); }
  };
}

function tabs() {
  return `<div class="tabs">
    <button data-t="students" class="${ui.tab === "students" ? "on" : ""}">👨‍🎓 बच्चे</button>
    <button data-t="chapters" class="${ui.tab === "chapters" ? "on" : ""}">🎬 चैप्टर / वीडियो</button></div>`;
}
function bindTabs() {
  app.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => { ui.tab = b.dataset.t; ui.okHtml = ""; main(); }));
}

async function main() {
  if (ui.tab === "students") return studentsTab();
  return chaptersTab();
}

const clsOpts = (sel, withAll) =>
  (withAll ? `<option value="">सभी कक्षा</option>` : "") +
  CLASSES.map((c) => `<option value="${c}" ${c === sel ? "selected" : ""}>कक्षा ${c}</option>`).join("");

// ===================== बच्चे =====================
async function studentsTab() {
  shell(tabs() + `<div class="loading">लोड हो रहा है…</div>`); bindTabs();
  try { students = await S.listStudents(); } catch (e) { return fail(e); }
  students.sort((a, b) => a.class - b.class || (parseInt(a.roll) || 0) - (parseInt(b.roll) || 0) || String(a.roll).localeCompare(b.roll));
  const q = ui.q.trim().toLowerCase();
  const shown = students.filter((s) => (!ui.fCls || s.class === ui.fCls) && (!q || s.name.toLowerCase().includes(q) || String(s.roll).toLowerCase() === q));

  shell(tabs() + `
  <section class="card">
    <h3>➕ नया बच्चा जोड़ें</h3>
    <form id="add">
      <label>बच्चे का नाम<input name="name" required></label>
      <div class="row2">
        <label>कक्षा<select name="cls" required>${clsOpts(ui.fCls || "9")}</select></label>
        <label>रोल नंबर<input name="roll" inputmode="numeric" required></label>
      </div>
      <label id="strwrap">संकाय (Stream)<select name="stream">${STREAMS.map((s) => `<option value="${s.id}">${s.name} (${s.en})</option>`).join("")}</select></label>
      <div class="pinrow"><label>PIN (6 अंक)<input name="pin" inputmode="numeric" maxlength="6" value="${S.randomPin()}" required></label>
        <button type="button" class="btn" id="gen">🎲 नया</button></div>
      <div class="err" id="adderr"></div>
      <button class="primary">जोड़ें</button>
    </form>
    ${ui.okHtml}
  </section>

  <section class="section">
    <h3>स्कूल के बच्चे (${students.length})</h3>
    <div class="filters"><select id="fcls">${clsOpts(ui.fCls, true)}</select>
      <input id="q" placeholder="नाम या रोल से खोजें" value="${esc(ui.q)}"></div>
    <div style="margin-top:10px">
    ${shown.length ? shown.map((s) => `<div class="st" data-uid="${esc(s.uid)}">
        <div class="t">${esc(s.name)}</div>
        <div class="muted" style="font-size:13px">कक्षा ${esc(s.class)}${s.stream ? " · " + esc((STREAMS.find((x) => x.id === s.stream) || {}).name || "") : ""} · रोल ${esc(s.roll)}</div>
        <div class="chips">
          ${s.active ? `<span class="chip ok">चालू</span>` : `<span class="chip bad">बंद (Block)</span>`}
          ${s.bound ? `<span class="chip">📱 मोबाइल जुड़ा है</span>` : `<span class="chip">मोबाइल अभी नहीं जुड़ा</span>`}
        </div>
        <div class="acts">
          <button class="btn" data-a="reset" ${s.bound ? "" : "disabled"}>📱 Reset मोबाइल</button>
          <button class="btn" data-a="pin">🔑 नया PIN</button>
          <button class="btn ${s.active ? "red" : ""}" data-a="toggle">${s.active ? "⛔ Block" : "✅ चालू करें"}</button>
          <button class="btn red" data-a="del">🗑 हटाएँ</button>
        </div></div>`).join("")
      : `<div class="empty">कोई बच्चा नहीं मिला।</div>`}
    </div>
  </section>`);
  bindTabs();

  const f = document.getElementById("add");
  document.getElementById("gen").onclick = () => (f.pin.value = S.randomPin());
  const sw = () => (document.getElementById("strwrap").style.display = hasStreams(f.cls.value) ? "" : "none");
  f.cls.onchange = sw; sw();
  f.onsubmit = async (e) => {
    e.preventDefault();
    const btn = f.querySelector(".primary"); btn.disabled = true; btn.textContent = "जोड़ रहे हैं…";
    const d = { name: f.name.value, cls: f.cls.value, roll: f.roll.value, pin: f.pin.value.trim(), stream: hasStreams(f.cls.value) ? f.stream.value : "" };
    try {
      await S.addStudent(d);
      ui.fCls = d.cls;
      ui.okHtml = pinBox(d.name, d.cls, S.cleanRoll(d.roll), d.pin);
      studentsTab();
    } catch (err) {
      document.getElementById("adderr").textContent = err.message;
      btn.disabled = false; btn.textContent = "जोड़ें";
    }
  };
  document.getElementById("fcls").onchange = (e) => { ui.fCls = e.target.value; ui.okHtml = ""; studentsTab(); };
  const qi = document.getElementById("q");
  qi.onchange = () => { ui.q = qi.value; ui.okHtml = ""; studentsTab(); };

  app.querySelectorAll(".st").forEach((card) => {
    const s = students.find((x) => x.uid === card.dataset.uid);
    card.querySelectorAll("button[data-a]").forEach((b) => (b.onclick = () => act(b.dataset.a, s, b)));
  });
}

function pinBox(name, cls, roll, pin) {
  return `<div class="okbox"><b>${esc(name)}</b> — कक्षा ${esc(cls)}, रोल ${esc(roll)}<br>
    बच्चे को यह PIN बताएँ:<div class="big" style="margin:8px 0">${esc(pin)}</div>
    <span class="muted" style="font-size:13px">यह PIN सिर्फ अभी दिखेगा, इसे नोट कर लें। भूल जाएँ तो "नया PIN" बनाएँ।</span></div>`;
}

async function act(a, s, btn) {
  try {
    if (a === "reset") {
      if (!(await ask(`${s.name} का मोबाइल Reset करें? इसके बाद बच्चा जिस मोबाइल पर पहले login करेगा, वही जुड़ जाएगा।`))) return;
      btn.disabled = true; await S.resetDevice(s.uid); ui.okHtml = "";
    } else if (a === "toggle") {
      if (s.active && !(await ask(`${s.name} को Block करें? वो साइट नहीं खोल पाएगा।`))) return;
      btn.disabled = true; await S.setActive(s.uid, !s.active); ui.okHtml = "";
    } else if (a === "pin") {
      if (!(await ask(`${s.name} का नया PIN बनाएँ? पुराना PIN बंद हो जाएगा और मोबाइल भी Reset हो जाएगा।`))) return;
      btn.disabled = true;
      const pin = S.randomPin();
      await S.newPin(s, pin);
      ui.okHtml = pinBox(s.name, s.class, s.roll, pin);
    } else if (a === "del") {
      if (!(await ask(`${s.name} (कक्षा ${s.class}, रोल ${s.roll}) को पूरी तरह हटाएँ?`))) return;
      btn.disabled = true; await S.removeStudent(s); ui.okHtml = "";
    }
    studentsTab();
  } catch (e) { alertErr(e); btn.disabled = false; }
}

// ===================== चैप्टर / वीडियो =====================
async function chaptersTab() {
  shell(tabs() + `<div class="loading">लोड हो रहा है…</div>`); bindTabs();
  const subs = allSubjects(ui.chCls);
  if (!subs.some((s) => s.id === ui.chSub)) ui.chSub = subs[0].id;
  let list;
  try { list = (await S.getClassChapters(ui.chCls)).filter((c) => c.subject === ui.chSub); } catch (e) { return fail(e); }
  const ed = ui.edit || { number: (list.length ? Math.max(...list.map((c) => c.number || 0)) : 0) + 1, title: "", youtubeId: "", notes: "" };

  shell(tabs() + `
  <div class="filters"><select id="ccls">${clsOpts(ui.chCls)}</select>
    <select id="csub">${subs.map((s) => `<option value="${s.id}" ${s.id === ui.chSub ? "selected" : ""}>${s.icon} ${esc(s.name)}</option>`).join("")}</select></div>

  ${hasStreams(ui.chCls) ? `<p class="hint">जो विषय कई संकाय में है (जैसे अर्थशास्त्र, गणित, भाषाएँ), उसका चैप्टर एक बार जोड़ें — वो सभी संकाय में अपने-आप दिखेगा।</p>` : ""}
  <section class="card section">
    <h3>${ed.id ? "✏️ चैप्टर बदलें" : "➕ नया चैप्टर जोड़ें"}</h3>
    <form id="ch">
      <div class="row2" style="grid-template-columns:90px 1fr">
        <label>नंबर<input name="number" type="number" min="0" value="${esc(ed.number)}"></label>
        <label>चैप्टर का नाम<input name="title" required value="${esc(ed.title)}"></label>
      </div>
      <label>YouTube वीडियो का link <span class="muted">(Unlisted वीडियो)</span>
        <input name="yt" placeholder="https://youtu.be/..." value="${ed.youtubeId ? "https://youtu.be/" + esc(ed.youtubeId) : ""}"></label>
      <label>नोट्स / कहानी <span class="muted">(खाली लाइन से नया पैराग्राफ)</span>
        <textarea name="notes">${esc(ed.notes)}</textarea></label>
      <div class="err" id="cherr"></div>
      <button class="primary">${ed.id ? "बदलाव सेव करें" : "चैप्टर जोड़ें"}</button>
      ${ed.id ? `<button type="button" class="btn" id="cancel" style="width:100%;margin-top:8px">रद्द करें</button>` : ""}
    </form>
  </section>

  <section class="section"><h3>कक्षा ${esc(ui.chCls)} — ${esc((subs.find((s) => s.id === ui.chSub) || {}).name)} (${list.length} चैप्टर)</h3>
    ${list.length ? list.map((c) => `<div class="st" data-id="${esc(c.id)}">
      <div class="t">${esc(c.number)}. ${esc(c.title)}</div>
      <div class="chips">${c.youtubeId ? `<span class="chip ok">▶ वीडियो जुड़ा</span>` : `<span class="chip">वीडियो नहीं</span>`}
        ${c.notes ? `<span class="chip">📝 नोट्स</span>` : ""}</div>
      <div class="acts"><button class="btn" data-a="edit">✏️ बदलें</button><button class="btn red" data-a="del">🗑 हटाएँ</button></div>
    </div>`).join("") : `<div class="empty">अभी कोई चैप्टर नहीं है।</div>`}
  </section>`);
  bindTabs();

  document.getElementById("ccls").onchange = (e) => { ui.chCls = e.target.value; ui.edit = null; chaptersTab(); };
  document.getElementById("csub").onchange = (e) => { ui.chSub = e.target.value; ui.edit = null; chaptersTab(); };
  const c = document.getElementById("cancel");
  if (c) c.onclick = () => { ui.edit = null; chaptersTab(); };

  const f = document.getElementById("ch");
  f.onsubmit = async (e) => {
    e.preventDefault();
    const err = document.getElementById("cherr");
    const yt = S.ytId(f.yt.value);
    if (yt === null) { err.textContent = "YouTube link सही नहीं है।"; return; }
    const btn = f.querySelector(".primary"); btn.disabled = true;
    try {
      await S.saveChapter({ id: ed.id, class: ui.chCls, subject: ui.chSub, number: f.number.value, title: f.title.value, youtubeId: yt, notes: f.notes.value });
      ui.edit = null; chaptersTab();
    } catch (x) { err.textContent = x.message; btn.disabled = false; }
  };

  app.querySelectorAll(".st[data-id]").forEach((card) => {
    const ch = list.find((x) => x.id === card.dataset.id);
    card.querySelector('[data-a="edit"]').onclick = () => { ui.edit = { ...ch }; chaptersTab(); };
    card.querySelector('[data-a="del"]').onclick = async () => {
      if (!(await ask(`"${ch.title}" चैप्टर हटाएँ?`))) return;
      try { await S.deleteChapter(ch.id); chaptersTab(); } catch (e) { alertErr(e); }
    };
  });
}

function alertErr(e) { console.error(e); tell("काम नहीं हो पाया: " + (e.message || e)); }
function fail(e) {
  console.error(e);
  shell(tabs() + `<div class="empty">लोड नहीं हो पाया: ${esc(e.message || e)}<br><br><button class="btn" id="reload">फिर कोशिश करें</button></div>`);
  bindTabs();
  document.getElementById("reload").onclick = () => main();
}

(async () => {
  try { teacher = await S.restoreTeacher(); } catch (e) { console.error(e); }
  teacher ? main() : loginView();
})();
