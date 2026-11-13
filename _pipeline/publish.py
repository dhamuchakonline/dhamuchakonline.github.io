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
H = Path("/home/claude")
mb = lambda d: sum(f.stat().st_size for f in d.rglob("*.mp4")) / 1e6
src = repo / "chapters.json"
data = json.loads(src.read_text())
cid = f"c{cls}_{subject}_{number:02d}"
old = next((x for x in data if x["id"] == cid), None)
oldvid = old["video"] if old else ""
# repo चुनने का नियम (13 नवंबर 2026):
#   कक्षा 9 → class-9-a (≈850 MB तक), फिर class-9-b · 11 → class-11
#   12 विज्ञान (भौतिकी/रसायन/जीव/गणित) → class-12 · बाक़ी (10, 12 कला/वाणिज्य/भाषा) → मुख्य साइट repo
new_mb = web.stat().st_size / 1e6
if cls == "9":
    same = next((r for r in ("class-9-a", "class-9-b") if oldvid.startswith(f"/{r}/")), None)
    if same:
        vrepo = H / same                                 # वही चैप्टर दोबारा: उसी repo में बदलो
    elif mb(H / "class-9-a") + new_mb < 850:
        vrepo = H / "class-9-a"
    else:
        vrepo = H / "class-9-b"
elif cls == "11":
    vrepo = H / "class-11"
elif cls == "12" and subject in ("physics", "chemistry", "biology", "maths"):
    vrepo = H / "class-12"
else:
    vrepo = None
if vrepo is not None and not vrepo.exists():
    raise SystemExit(f"repo {vrepo} clone नहीं है")
if vrepo is not None:
    vrel = f"{subject}/ch{number:02d}.mp4"
    (vrepo / vrel).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(web, vrepo / vrel)
    rel = f"/{vrepo.name}/{vrel}"
    if mb(vrepo) > 950: print(f"चेतावनी: {vrepo.name} {mb(vrepo):.0f} MB — 1 GB के पास!")
else:
    rel = f"videos/c{cls}/{subject}/ch{number:02d}.mp4"
    (repo / rel).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(web, repo / rel)
# पुराना वीडियो किसी दूसरी जगह था तो वहाँ से हटाओ (जगह बचे)
oldrepo = None
if oldvid and oldvid != rel:
    of = (H / oldvid.lstrip("/")) if oldvid.startswith("/") else (repo / oldvid)
    if of.exists():
        of.unlink()
        if oldvid.startswith("/"):
            oldrepo = H / oldvid.split("/")[1]

entry = {"id": cid, "class": cls, "subject": subject, "number": number, "title": M["title"], "title_en": M["title_en"],
         "video": rel, "minutes": round(dur / 60), "notes": old["notes"] if old and old.get("keep_notes") else notes}
data = [x for x in data if x["id"] != cid] + [entry]
data.sort(key=lambda x: (int(x["class"]), x["subject"], x["number"]))
src.write_text(json.dumps(data, ensure_ascii=False, indent=1))

def git(r, *a):
    x = subprocess.run(["git", "-C", str(r), *a], capture_output=True, text=True)
    if x.returncode: print(x.stdout, x.stderr); raise SystemExit(1)
    return x.stdout
msg = (f"Add {M['cls']} {M['subject']} {M['chapter']} video\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n"
       "Claude-Session: https://claude.ai/code/session_01JquLfAaPncL65Xbbyr2mSH")
for r in [x for x in (vrepo, repo, oldrepo) if x] if oldrepo != repo else [vrepo, repo]:   # नया वीडियो → chapters.json → पुराना हटाना
    if r is None: continue
    git(r, "add", "-A")
    if not git(r, "status", "--porcelain").strip(): continue
    git(r, "-c", "user.name=ankushaman3", "-c", "user.email=ankushaman3@users.noreply.github.com", "commit", "-q", "-m", msg)
    for t in range(3):                                   # push कभी-कभी अस्थायी रूप से फेल
        x = subprocess.run(["git", "-C", str(r), "-c", "push.negotiate=true", "push", "-q", "origin", "main"], capture_output=True, text=True)
        if x.returncode == 0: break
        print(x.stderr); __import__("time").sleep(10)
    else: raise SystemExit(1)
size = sum(mb(d) for d in [repo] + list(H.glob("class-*")))
print(f"published {cid}: {round(dur/60)} min · total videos {size:.0f} MB")
# जगह बचाने के लिए कच्ची फ़ाइलें हटाओ
shutil.rmtree(Path(f"/home/claude/videos/out_{name}"), ignore_errors=True)
Path(f"/home/claude/videos/{name}.mp4").unlink(missing_ok=True)
