// पेज के अंदर का अपना "हाँ/नहीं" डिब्बा (ब्राउज़र के confirm/alert की जगह)
export function ask(msg, okText = "हाँ", cancelText = "नहीं") {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "dlg";
    wrap.innerHTML = `<div class="dlg-box" role="dialog" aria-modal="true"><p></p>
      <div class="dlg-acts">${cancelText ? `<button class="btn" data-v="0"></button>` : ""}<button class="btn dark" data-v="1"></button></div></div>`;
    wrap.querySelector("p").textContent = msg;
    wrap.querySelector('[data-v="1"]').textContent = okText;
    if (cancelText) wrap.querySelector('[data-v="0"]').textContent = cancelText;
    wrap.addEventListener("click", (e) => {
      const v = e.target.dataset && e.target.dataset.v;
      if (v === undefined && e.target !== wrap) return;
      wrap.remove();
      resolve(v === "1");
    });
    document.body.appendChild(wrap);
    wrap.querySelector('[data-v="1"]').focus();
  });
}

export const tell = (msg) => ask(msg, "ठीक है", "");

// छोटा फ़ॉर्म डिब्बा: fields = [{name, label, value, options?: [{value,label}]}] → values या null
export function form(title, fields, okText = "सेव करें") {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "dlg";
    const box = document.createElement("form");
    box.className = "dlg-box";
    const h = document.createElement("h3"); h.textContent = title; box.appendChild(h);
    fields.forEach((f) => {
      const l = document.createElement("label"); l.textContent = f.label;
      let el;
      if (f.options) {
        el = document.createElement("select");
        f.options.forEach((o) => { const op = document.createElement("option"); op.value = o.value; op.textContent = o.label; if (o.value === f.value) op.selected = true; el.appendChild(op); });
      } else { el = document.createElement("input"); el.value = f.value ?? ""; }
      el.name = f.name; l.appendChild(el); box.appendChild(l);
    });
    const acts = document.createElement("div"); acts.className = "dlg-acts"; acts.style.marginTop = "16px";
    const c = document.createElement("button"); c.type = "button"; c.className = "btn"; c.textContent = "रद्द करें";
    const o = document.createElement("button"); o.type = "submit"; o.className = "btn dark"; o.textContent = okText;
    acts.append(c, o); box.appendChild(acts); wrap.appendChild(box); document.body.appendChild(wrap);
    c.onclick = () => { wrap.remove(); resolve(null); };
    box.onsubmit = (e) => { e.preventDefault(); const v = {}; fields.forEach((f) => (v[f.name] = box.elements[f.name].value)); wrap.remove(); resolve(v); };
  });
}
