"""Commons image fetch: python3 img.py name "search query" ["alt query"...]
Saves /home/claude/videos/img/<name>.jpg (+ copy in _pipeline/images/), appends credit to images/CREDITS.tsv"""
import sys, json, re, time, urllib.parse, urllib.request, subprocess, os, shutil
UA = {"User-Agent": "DhamuchakOnlineClass/1.0 (https://dhamuchakonline.github.io; school education, free) python-urllib"}
OK = re.compile(r"^(CC0|Public domain|PD|CC BY(-SA)?( [0-9.]+)?|CC-BY(-SA)?|Attribution)", re.I)
_last=[0]
def api(**p):
    w=1.6-(time.time()-_last[0])
    if w>0: time.sleep(w)
    _last[0]=time.time()
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({**p, "format": "json"})
    for t in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
        except Exception as e:
            time.sleep(6 + 8 * t)
    return {}
def find(q, n=12):
    r = api(action="query", generator="search", gsrsearch=q + " filetype:bitmap", gsrnamespace=6, gsrlimit=n,
            prop="imageinfo", iiprop="url|extmetadata|size|mime", iiurlwidth=900)
    out = []
    for p in sorted(r.get("query", {}).get("pages", {}).values(), key=lambda x: x.get("index", 99)):
        ii = (p.get("imageinfo") or [{}])[0]
        m = ii.get("extmetadata", {})
        lic = m.get("LicenseShortName", {}).get("value", "")
        if ii.get("mime") not in ("image/jpeg", "image/png") or not OK.match(lic): continue
        if ii.get("width", 0) < 500 or ii.get("height", 0) < 400: continue
        art = re.sub(r"<[^>]+>", "", m.get("Artist", {}).get("value", "unknown"))[:80]
        out.append(dict(title=p["title"], url=ii.get("thumburl") or ii["url"], lic=lic, artist=art, page=ii.get("descriptionurl", "")))
    return out

def ov_get(name, *queries):
    for q in queries:
        for t in range(4):
            try:
                u="https://api.openverse.org/v1/images/?"+urllib.parse.urlencode({"q":q,"page_size":10,"license":"cc0,pdm,by,by-sa","mature":"false"})
                r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30)); break
            except Exception: r=None; time.sleep(20)
        if not r: continue
        for c in r.get("results",[]):
            if (c.get("width") or 0)<500: continue
            try: data=urllib.request.urlopen(urllib.request.Request(f"https://api.openverse.org/v1/images/{c['id']}/thumb/",headers=UA),timeout=60).read()
            except Exception: continue
            open("/tmp/_im","wb").write(data)
            dst=f"/home/claude/videos/img/{name}.jpg"
            subprocess.run(["ffmpeg","-y","-loglevel","error","-i","/tmp/_im","-q:v","3",dst])
            if os.path.exists(dst) and os.path.getsize(dst)>5000:
                shutil.copy(dst,f"/home/claude/dco/_pipeline/images/{name}.jpg")
                lic=(c.get("license") or "").upper()+" "+(c.get("license_version") or "")
                open("/home/claude/dco/_pipeline/images/CREDITS.tsv","a").write(f"{name}\t{c.get('title')}\t{c.get('creator')}\t{lic}\t{c.get('foreign_landing_url')}\n")
                print("OK-OV",name,c.get("title"),lic,c.get("creator")); return True
            time.sleep(1)
    return False

def get(name, *queries):
    if ov_get(name,*queries): return True
    for q in queries:
        for c in find(q):
            dst = f"/home/claude/videos/img/{name}.jpg"
            data = None
            u = c["url"]
            if "thumb.wikimedia.org" in u: continue
            for t in range(40):
                try:
                    data = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read(); break
                except urllib.error.HTTPError as e:
                    time.sleep(630 if e.code == 429 else 8)
                except Exception: time.sleep(5)
            if not data: continue
            open("/tmp/_im", "wb").write(data)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/_im", "-vf", "scale='min(900,iw)':-2", "-q:v", "3", dst])
            if os.path.exists(dst) and os.path.getsize(dst) > 5000:
                shutil.copy(dst, f"/home/claude/dco/_pipeline/images/{name}.jpg")
                open("/home/claude/dco/_pipeline/images/CREDITS.tsv", "a").write(f"{name}\t{c['title']}\t{c['artist']}\t{c['lic']}\t{c['page']}\n")
                print("OK", name, c["title"], c["lic"], c["artist"]); return True
    print("MISS", name, queries); return False
if __name__ == "__main__":
    get(sys.argv[1], *sys.argv[2:])
