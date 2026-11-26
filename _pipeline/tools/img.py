"""Commons image fetch: python3 img.py name "search query" ["alt query"...]
Saves /home/claude/videos/img/<name>.jpg (+ copy in _pipeline/images/), appends credit to images/CREDITS.tsv"""
import sys, json, re, time, urllib.parse, urllib.request, subprocess, os, shutil
UA = {"User-Agent": "DhamuchakOnlineClass/1.0 (https://dhamuchakonline.github.io; school education, free) python-urllib"}
OK = re.compile(r"^(CC0|Public domain|PD|CC BY(-SA)?( [0-9.]+)?|CC-BY(-SA)?|Attribution)", re.I)
def api(**p):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({**p, "format": "json"})
    for t in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
        except Exception as e:
            time.sleep(4 + 4 * t)
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
def get(name, *queries):
    for q in queries:
        for c in find(q):
            dst = f"/home/claude/videos/img/{name}.jpg"
            try:
                data = urllib.request.urlopen(urllib.request.Request(c["url"], headers=UA), timeout=40).read()
            except Exception: time.sleep(3); continue
            open("/tmp/_im", "wb").write(data)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/_im", "-vf", "scale='min(900,iw)':-2", "-q:v", "3", dst])
            if os.path.exists(dst) and os.path.getsize(dst) > 5000:
                shutil.copy(dst, f"/home/claude/dco/_pipeline/images/{name}.jpg")
                open("/home/claude/dco/_pipeline/images/CREDITS.tsv", "a").write(f"{name}\t{c['title']}\t{c['artist']}\t{c['lic']}\t{c['page']}\n")
                print("OK", name, c["title"], c["lic"], c["artist"]); return True
    print("MISS", name, queries); return False
if __name__ == "__main__":
    get(sys.argv[1], *sys.argv[2:])
