// टीचर पैनल: बच्चे जोड़ना, PIN देना, मोबाइल Reset/Block, चैप्टर और वीडियो जोड़ना
import { SCHOOL_NAME, CLASSES, hasStreams, allSubjects, DEMO } from "./config.js";
import * as S from "./store.js";
import { ask, tell } from "./dialog.js";

const app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ui = { tab: "code", fCls: "", q: "", chCls: "10", chSub: "maths", edit: null, okHtml: "" };
let teacher = null;
let students = [];

function shell(body) {
  app.innerHTML = `<header class="top"><div class="top-in"><div class="brand"><div class="logo">🧑‍🏫</div>
    <div><div class="school">${esc(SCHOOL_NAME)}</div><div class="sub">टीचर पैनल</div></div></div>
    ${teacher ? `<button class="ghost" id="out">🚪<span class="lbl"> बाहर</span></button>` : ""}</div></header>
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
    <button data-t="code" class="${ui.tab === "code" ? "on" : ""}">🔑 कोड / बच्चे</button>
    <button data-t="chapters" class="${ui.tab === "chapters" ? "on" : ""}">🎬 चैप्टर / वीडियो</button></div>`;
}
function bindTabs() {
  app.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => { ui.tab = b.dataset.t; ui.okHtml = ""; main(); }));
}

async function main() {
  if (ui.tab === "code") return codeTab();
  return chaptersTab();
}

const clsOpts = (sel, withAll) =>
  (withAll ? `<option value="">सभी कक्षा</option>` : "") +
  CLASSES.map((c) => `<option value="${c}" ${c === sel ? "selected" : ""}>कक्षा ${c}</option>`).join("");

// ===================== स्कूल कोड + कौन पढ़ रहा है =====================
const fmt = (d) => d ? d.toLocaleString("hi-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—";

async function codeTab() {
  shell(tabs() + `<div class="loading">लोड हो रहा है…</div>`); bindTabs();
  let code, sess;
  try { [code, sess] = await Promise.all([S.getCode(), S.listSessions()]); } catch (e) { return fail(e); }
  const fc = ui.fCls;
  const shown = sess.filter((s) => !fc || s.class === fc);
  const counts = CLASSES.map((c) => `कक्षा ${c}: ${sess.filter((s) => s.class === c).length}`).join(" · ");

  shell(tabs() + `
  <section class="card">
    <h3>🔑 स्कूल का UDISE कोड</h3>
    ${code ? `<p class="muted" style="margin:0">अभी का कोड:</p><div class="big" style="margin:6px 0 12px;letter-spacing:2px">${esc(code)}</div>`
           : `<p class="err" style="margin:0 0 8px">अभी कोई कोड नहीं डाला गया है। नीचे स्कूल का UDISE कोड डालकर सेव करें — तभी बच्चे login कर पाएँगे।</p>`}
    <form id="cf">
      <label>${code ? "कोड बदलें" : "UDISE कोड"}<input name="code" inputmode="numeric" required value="${code ? "" : ""}" placeholder="जैसे 10xxxxxxxxx"></label>
      <div class="err" id="cerr"></div>
      <button class="primary">${code ? "नया कोड सेव करें" : "कोड सेव करें"}</button>
    </form>
    ${code ? `<p class="hint">कोड बदलने पर अभी login सभी बच्चे बाहर हो जाएँगे और उन्हें नया कोड डालना होगा।</p>` : ""}
  </section>

  <section class="section">
    <h3>👨‍🎓 कौन-कौन पढ़ रहा है (${sess.length})</h3>
    <p class="muted" style="font-size:13px;margin:0 0 8px">${counts}</p>
    <div class="filters"><select id="fcls"><option value="">सभी कक्षा</option>${CLASSES.map((c) => `<option value="${c}" ${c === fc ? "selected" : ""}>कक्षा ${c}</option>`).join("")}</select></div>
    <div style="margin-top:10px">
    ${shown.length ? shown.slice(0, 300).map((s) => `<div class="row" style="cursor:default">
        <div class="num">${esc(s.class)}</div>
        <div><div class="t">${esc(s.name)}</div><div class="c">कक्षा ${esc(s.class)} · login: ${esc(fmt(s.at))}</div></div></div>`).join("")
      : `<div class="empty">अभी कोई बच्चा login नहीं है।</div>`}
    </div>
  </section>`);
  bindTabs();

  document.getElementById("fcls").onchange = (e) => { ui.fCls = e.target.value; codeTab(); };
  const f = document.getElementById("cf");
  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = f.code.value.trim();
    if (code && !(await ask(`कोड बदलकर "${v}" करें? अभी login सभी बच्चे बाहर हो जाएँगे।`, "हाँ, बदलें", "नहीं"))) return;
    const btn = f.querySelector(".primary"); btn.disabled = true;
    try { await S.setCode(v); codeTab(); }
    catch (x) { document.getElementById("cerr").textContent = x.message; btn.disabled = false; }
  };
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
