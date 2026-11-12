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
