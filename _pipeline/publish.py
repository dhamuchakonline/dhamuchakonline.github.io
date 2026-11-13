#!/usr/bin/env python3
"""Put a finished chapter video + auto notes on the live site.
Usage: python3 publish.py c9_sci_ch2 science 2 [minutes]
"""
import importlib, json, re, shutil, subprocess, sys
from pathlib import Path

name, subject, number = sys.argv[1], sys.argv[2], int(sys.argv[3])
mod = importlib.import_module(name)
M, S = mod.META, mod.S
cls = re.sub(r"\D", "", M["cls"])
web = Path(f"/home/claude/videos/{name}_web.mp4")
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(web)],
                           capture_output=True, text=True).stdout)
clean = lambda s: re.sub(r"<br>", " · ", s)

# नोट्स: हर स्लाइड का शीर्षक + मुख्य बातें
paras = []
for sc in S:
    k = sc["kind"]
    if k in ("title", "end") or (k == "question" and sc.get("head", "").startswith("अभ्यास")):
        continue
    h = sc.get("head", "")
    if k in ("content", "list"):
        body = "\n".join("• " + clean(p) for p in sc["points"])
    elif k == "eq":
        body = " · ".join(x for x in [clean(sc.get("words", "")), sc["eq"], clean(sc.get("note", ""))] if x)
    elif k == "big":
        body = clean(sc["big"]) + (" — " + clean(sc["sub"]) if sc.get("sub") else "")
    elif k == "compare":
        body = "\n".join(f"• {d['t']}: {clean(d['d'])}" for d in (sc["left"], sc["right"]))
    elif k == "question":
        body = f"{sc['q']} → {sc['a']}"
    elif k == "balance":
        body = f"{sc['eq']} — {sc['note']}"
    elif k == "table":
        body = sc["eq"] + "\n" + "\n".join(" | ".join(r) for r in sc["rows"])
    else:
        continue
    paras.append(f"{h}:\n{body}")
qs = [f"{sc['q']} → {sc['a']}" for sc in S if sc["kind"] == "question" and sc.get("head", "").startswith("अभ्यास")]
if qs:
    paras.append("अभ्यास प्रश्न:\n" + "\n".join(f"{i+1}. {q}" for i, q in enumerate(qs)))
notes = "\n\n".join(paras)

repo = Path("/home/claude/dco")
vrepo = Path(f"/home/claude/class-{cls}")          # हर कक्षा का अलग वीडियो repo (अगर बना हो)
prefix = ""
if not vrepo.exists() and cls in ("11", "12"):      # 11/12 का repo अभी नहीं: अस्थायी रूप से class-9 repo में c11/ फ़ोल्डर
    vrepo, prefix = Path("/home/claude/class-9"), f"c{cls}/"
    if cls == "12" and subject not in ("physics", "chemistry", "biology", "maths"):
        vrepo = Path("/nonexistent")                   # class-9 repo 1GB से न बढ़े: 12 कला/वाणिज्य → साइट repo
if vrepo.exists():
    vrel = f"{prefix}{subject}/ch{number:02d}.mp4"
    (vrepo / vrel).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(web, vrepo / vrel)
    rel = f"/{vrepo.name}/{vrel}"
else:
    vrepo = None
    rel = f"videos/c{cls}/{subject}/ch{number:02d}.mp4"
    (repo / rel).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(web, repo / rel)

src = repo / "chapters.json"   # (पहले /home/claude/uhs-site/chapters.json था)
data = json.loads(src.read_text())
cid = f"c{cls}_{subject}_{number:02d}"
old = next((x for x in data if x["id"] == cid), None)
entry = {"id": cid, "class": cls, "subject": subject, "number": number, "title": M["title"], "title_en": M["title_en"],
         "video": rel, "minutes": round(dur / 60), "notes": old["notes"] if old and old.get("keep_notes") else notes}
data = [x for x in data if x["id"] != cid] + [entry]
data.sort(key=lambda x: (int(x["class"]), x["subject"], x["number"]))
src.write_text(json.dumps(data, ensure_ascii=False, indent=1))

def git(r, *a):
    x = subprocess.run(["git", "-C", str(r), *a], capture_output=True, text=True)
    if x.returncode: print(x.stdout, x.stderr); raise SystemExit(1)
    return x.stdout
msg = (f"Add {M['cls']} {M['subject']} {M['chapter']} video\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>")  # नए सेशन की attribution पंक्तियाँ यहाँ जोड़ें
for r in ([vrepo] if vrepo else []) + [repo]:          # पहले वीडियो, फिर chapters.json
    git(r, "add", "-A")
    git(r, "-c", "user.name=ankushaman3", "-c", "user.email=ankushaman3@users.noreply.github.com", "commit", "-q", "-m", msg)
    git(r, "push", "origin", "main")
size = sum(f.stat().st_size for d in [repo] + list(Path("/home/claude").glob("class-*")) for f in d.rglob("*.mp4")) / 1e6
print(f"published {cid}: {round(dur/60)} min · total videos {size:.0f} MB")
# जगह बचाने के लिए कच्ची फ़ाइलें हटाओ
shutil.rmtree(Path(f"/home/claude/videos/out_{name}"), ignore_errors=True)
Path(f"/home/claude/videos/{name}.mp4").unlink(missing_ok=True)
