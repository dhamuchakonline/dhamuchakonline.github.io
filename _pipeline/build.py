#!/usr/bin/env python3
"""Lesson video builder: scenes (slide + Hindi narration) -> MP4.
Usage: python3 build.py c10_sci_ch1  [--frames-only]
"""
import importlib, json, os, re, subprocess, sys, html
from pathlib import Path
from gtts import gTTS
from playwright.sync_api import sync_playwright

name = sys.argv[1]
frames_only = "--frames-only" in sys.argv
mod = importlib.import_module(name)
META, SCENES = mod.META, mod.S
OUT = Path(f"/home/claude/videos/out_{name}"); OUT.mkdir(exist_ok=True)
FONTS = "/home/claude/videos/fonts"
W, H, FPS = 1280, 720, 30

def chem(s):
    s = html.escape(s, quote=False).replace("&lt;br&gt;", "<br>")
    return re.sub(r"(?<=[A-Za-z\)])(\d+)", r"<sub>\1</sub>", s)

def txt(s):
    return html.escape(s, quote=False).replace("&lt;br&gt;", "<br>")

CSS = f"""
@font-face{{font-family:B;src:url(file://{FONTS}/baloo-2/files/baloo-2-devanagari-600-normal.woff2);font-weight:600;unicode-range:U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+25CC,U+A830-A839,U+A8E0-A8FF}}
@font-face{{font-family:B;src:url(file://{FONTS}/baloo-2/files/baloo-2-devanagari-800-normal.woff2);font-weight:800;unicode-range:U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+25CC,U+A830-A839,U+A8E0-A8FF}}
@font-face{{font-family:B;src:url(file://{FONTS}/baloo-2/files/baloo-2-latin-600-normal.woff2);font-weight:600}}
@font-face{{font-family:B;src:url(file://{FONTS}/baloo-2/files/baloo-2-latin-800-normal.woff2);font-weight:800}}
*{{box-sizing:border-box;margin:0}}
body{{width:{W}px;height:{H}px;overflow:hidden;font-family:B,sans-serif;font-weight:600;color:#1f2a44;
  background:linear-gradient(135deg,#eef4ff 0%,#f4fbf8 55%,#fff6ea 100%);position:relative}}
.top{{position:absolute;left:0;right:0;top:0;height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 34px;
  background:linear-gradient(90deg,#4f6f9f,#5d8a9c 60%,#6b9a92);color:#fff;font-size:21px}}
.top b{{font-weight:800}}
.blob{{position:absolute;border-radius:50%;filter:blur(8px);opacity:.45}}
.b1{{width:340px;height:340px;background:#dbe7fb;right:-90px;bottom:-110px}}
.b2{{width:220px;height:220px;background:#fde9c9;left:-70px;bottom:40px}}
.wrap{{position:absolute;left:70px;right:70px;top:96px;bottom:50px;display:flex;flex-direction:column;justify-content:center}}
.head{{font-size:50px;font-weight:800;color:#2f4f86;display:flex;align-items:center;gap:18px;margin-bottom:26px;line-height:1.2}}
.ic{{font-size:62px;line-height:1}}
.pts{{list-style:none;padding:0;font-size:38px;line-height:1.5}}
.pts li{{margin:8px 0;padding:10px 22px;background:rgba(255,255,255,.75);border-left:8px solid #6b9a92;border-radius:14px}}
.pts li:nth-child(2n){{border-color:#c9a96a}} .pts li:nth-child(3n){{border-color:#8a7cc4}}
.eqbox{{font-size:56px;font-weight:800;color:#1f3d70;background:#fff;border:3px solid #b9cbe0;border-radius:22px;padding:26px 30px;text-align:center;
  box-shadow:0 10px 30px rgba(47,79,134,.12);letter-spacing:1px;margin:14px 0}}
.eqbox sub{{font-size:.6em}}
.words{{font-size:34px;color:#44536e;text-align:center}}
.note{{font-size:30px;color:#5b6b80;text-align:center;margin-top:14px}}
.note sub,.words sub{{font-size:.65em}}
.big{{font-size:60px;font-weight:800;text-align:center;color:#2f4f86;line-height:1.35}}
.sub2{{font-size:34px;text-align:center;color:#5b6b80;margin-top:22px}}
.cmp{{display:grid;grid-template-columns:1fr 1fr;gap:34px}}
.card{{background:#fff;border-radius:24px;padding:30px;text-align:center;box-shadow:0 10px 26px rgba(47,79,134,.12);border-top:10px solid #6b9a92}}
.card:nth-child(2){{border-color:#c98a6a}}
.card .ic{{font-size:86px}} .card h3{{font-size:44px;font-weight:800;margin:10px 0;color:#2f4f86}} .card p{{font-size:32px;color:#44536e;line-height:1.45}}
.q{{font-size:54px;font-weight:800;text-align:center;color:#2f4f86;line-height:1.35}}
.q sub{{font-size:.6em}}
.ans{{margin:34px auto 0;font-size:46px;font-weight:800;color:#1e7a4f;background:#e6f6ee;border:3px solid #9fd8bb;border-radius:22px;padding:18px 34px;text-align:center;width:fit-content}}
.ans sub{{font-size:.6em}}
.think{{margin:34px auto 0;font-size:34px;color:#8a6a2a;text-align:center}}
.bal{{display:flex;justify-content:center;gap:120px;margin-top:22px}}
.pan{{font-size:40px;font-weight:800;background:#fff;border-radius:18px;padding:16px 34px;box-shadow:0 8px 20px rgba(0,0,0,.08)}}
.pan.bad{{color:#b45a3c;border:3px solid #f1c4b4}} .pan.ok{{color:#1e7a4f;border:3px solid #9fd8bb}}
table{{margin:12px auto 0;border-collapse:collapse;font-size:38px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,.08)}}
td{{padding:8px 30px;border-bottom:2px solid #e3e8ee;text-align:center}} tr:first-child td{{background:#4f6f9f;color:#fff;font-weight:800}}
.title{{text-align:center}}
.title .k{{font-size:34px;color:#5b7db1;font-weight:800;letter-spacing:1px}}
.title h1{{font-size:78px;font-weight:800;color:#2f4f86;line-height:1.2;margin:18px 0 6px}}
.title .en{{font-size:38px;color:#5b6b80}}
.title .sch{{margin-top:40px;font-size:30px;color:#44536e}}
.title .sch b{{color:#8a5a1a}}
.foot{{position:absolute;bottom:14px;right:34px;font-size:18px;color:#8090a8}}
"""

def slide_html(sc, reveal=True):
    k = sc["kind"]
    top = f'<div class="top"><span><b>{META["cls"]}</b> · {META["subject"]} · {META["chapter"]}</span><span>Upgraded High School, Dhamuchak</span></div>'
    deco = '<div class="blob b1"></div><div class="blob b2"></div>'
    head = lambda: f'<div class="head">{("<span class=ic>"+sc["icon"]+"</span>") if sc.get("icon") else ""}{txt(sc["head"])}</div>'
    if k == "title":
        body = f'''<div class="title"><div class="k">🙏 उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक के बच्चों, आपका स्वागत है!</div>
          <div class="sch" style="margin-top:22px">आज हम शुरू करते हैं · {META["cls"]} · {META["subject"]}</div>
          <h1>📘 {META["chapter"]}: {txt(META["title"])}</h1>
          <div class="en">{txt(META["title_en"])}</div>
          <div class="sch">चलिए, शुरू करते हैं! · Created by <b>Ankush Sir</b></div></div>'''
    elif k == "end":
        body = f'''<div class="title"><div class="k">ONLINE CLASSES · {META["cls"]} · {META["subject"]}</div>
          <h1>🌟 {META["chapter"]}: {txt(META["title"])}</h1>
          <div class="en">{txt(META["title_en"])}</div>
          <div class="sch">{"<b>शाबाश!</b> अगला अध्याय जल्द · " if k=="end" else ""}Upgraded High School, Dhamuchak · उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक<br>Created by <b>Ankush Sir</b></div></div>'''
    elif k in ("content", "list"):
        body = head() + "<ul class=pts>" + "".join(f"<li>{chem(p)}</li>" for p in sc["points"]) + "</ul>"
    elif k == "eq":
        body = head() + f'<div class="words">{chem(sc["words"])}</div><div class="eqbox">{chem(sc["eq"])}</div>' + (f'<div class="note">{chem(sc["note"])}</div>' if sc.get("note") else "")
    elif k == "big":
        body = head() + f'<div class="big">{txt(sc["big"])}</div>' + (f'<div class="sub2">{chem(sc["sub"])}</div>' if sc.get("sub") else "")
    elif k == "compare":
        c = lambda d: f'<div class="card"><div class="ic">{d["icon"]}</div><h3>{txt(d["t"])}</h3><p>{txt(d["d"])}</p></div>'
        body = head() + f'<div class="cmp">{c(sc["left"])}{c(sc["right"])}</div>'
    elif k == "question":
        body = head() + f'<div class="q">{chem(sc["q"])}</div>' + (f'<div class="ans">✅ {chem(sc["a"])}</div>' if reveal else '<div class="think">⏸️ सोचिए… (वीडियो रोककर कॉपी में लिखें)</div>')
    elif k == "balance":
        cls = "bad" if sc["tilt"] else "ok"
        body = head() + f'<div class="eqbox">{chem(sc["eq"])}</div><div class="bal"><div class="pan {cls}">बाएँ: {chem(sc["left"])}</div><div class="pan {cls}">दाएँ: {chem(sc["right"])}</div></div><div class="note">{chem(sc["note"])}</div>'
    elif k == "table":
        rows = "".join("<tr>" + "".join(f"<td>{chem(c)}</td>" for c in r) + "</tr>" for r in sc["rows"])
        body = head() + f'<div class="eqbox">{chem(sc["eq"])}</div><table>{rows}</table>'
    else:
        raise ValueError(k)
    return f'<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head><body>{deco}{top}<div class="wrap"><div class="inner">{body}</div></div><div class="foot">dhamuchakonline.github.io</div></body></html>'

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-1500:]); raise SystemExit(1)
    return r.stdout

def dur(f):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]).strip())

# 1) parts: each scene -> 1 or 2 parts (question: before/after "...")
parts = []
OPEN = (f"उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक के बच्चों, आपका स्वागत है! "
        f"आज हम {META['subject_say']} का {META['chapter_say']}, {META.get('title_say', META['title'])}, शुरू करते हैं। तो चलिए, शुरू करते हैं!")
for i, sc in enumerate(SCENES):
    say = sc["say"]
    if sc["kind"] == "title":
        say = OPEN + (" " + say if say else "")
    if sc["kind"] == "question" and "..." in say:
        a, b = say.split("...", 1)
        parts.append(dict(i=i, reveal=False, say=a.strip(), pause=sc.get("pause", 2.5)))
        parts.append(dict(i=i, reveal=True, say=b.strip(), pause=1.0))
    else:
        parts.append(dict(i=i, reveal=True, say=say.replace("...", ","), pause=1.0 if sc["kind"] != "title" else 1.5))

# 2) slides
with sync_playwright() as p:
    br = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg = br.new_page(viewport={"width": W, "height": H})
    for n, pt in enumerate(parts):
        png = OUT / f"s{n:03d}.png"
        pg.set_content(slide_html(SCENES[pt["i"]], pt["reveal"]), wait_until="load")
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(120)
        pg.evaluate("""() => { const w = document.querySelector('.wrap'), i = document.querySelector('.inner');
          let z = 1; while (i.scrollHeight * z > w.clientHeight && z > 0.5) { z -= 0.04; i.style.zoom = z; } }""")
        pg.screenshot(path=str(png))
    br.close()
print("slides:", len(parts))
if frames_only:
    raise SystemExit(0)

# 3) audio + scene files
lst = []
total = 0
for n, pt in enumerate(parts):
    mp3, scene = OUT / f"a{n:03d}.mp3", OUT / f"v{n:03d}.mp4"
    wav = OUT / f"a{n:03d}.wav"
    if not wav.exists():
        for t in range(6):
            try:
                gTTS(pt["say"], lang="hi").save(str(mp3))
                run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-ar", "44100", "-ac", "1", str(wav)]); break
            except (Exception, SystemExit) as e:
                print("tts retry", n, e)
                if mp3.exists(): mp3.unlink()
                import time; time.sleep(20 * (t + 1))
        else:
            raise SystemExit("tts failed")
    mp3 = wav
    d = dur(mp3) + pt["pause"] + 0.4
    total += d
    if not scene.exists():
        tmp = OUT / f"tmp_{n:03d}.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", str(OUT / f"s{n:03d}.png"), "-i", str(mp3),
             "-filter_complex", f"[0:v]format=yuv420p,loop=-1:1,trim=duration={d:.3f},fade=in:0:6[v];[1:a]adelay=300|300,apad,atrim=duration={d:.3f},aresample=44100[a]",
             "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-pix_fmt", "yuv420p",
             "-r", str(FPS), "-c:a", "aac", "-b:a", "128k", "-ac", "1", str(tmp)])
        tmp.rename(scene)
    lst.append(f"file '{scene.name}'")
(OUT / "list.txt").write_text("\n".join(lst) + "\n")
final = Path(f"/home/claude/videos/{name}.mp4")
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(OUT / "list.txt"), "-c", "copy", "-movflags", "+faststart", str(final)])
print(f"done {final} {total/60:.1f} min, {final.stat().st_size/1e6:.1f} MB")
small = Path(f"/home/claude/videos/{name}_web.mp4")
run(["ffmpeg", "-y", "-v", "error", "-i", str(final), "-c:v", "libx264", "-crf", ("30" if name.startswith(("c9", "c11", "c12")) else "28"), "-preset", "veryfast", "-tune", "stillimage",
     "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", ("40k" if name.startswith(("c9", "c11", "c12")) else "48k"), "-ac", "1", "-movflags", "+faststart", str(small)])
print(f"web {small} {small.stat().st_size/1e6:.1f} MB")
