import sys,re,os,subprocess,shutil,time,urllib.request,urllib.parse
UA={"User-Agent":"Mozilla/5.0"}
def rd(u):
    for t in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=40).read()
        except Exception: time.sleep(5)
def get(name,q,must=None):
    must=must or q.lower().split()
    h=(rd("https://pxhere.com/en/photos?q="+urllib.parse.quote_plus(q)) or b"").decode("utf8","ignore")
    seen=[]
    for m in re.finditer(r'https://c\.pxhere\.com/photos/(\w\w/\w\w)/([^" ]*?)-(\d+)\.jpg!s2',h):
        if m.group(0) in seen: continue
        seen.append(m.group(0))
        slug=m.group(2).lower()
        if not all(w in slug for w in must): continue
        data=rd(m.group(0))
        if not data: continue
        open("/tmp/_px","wb").write(data); dst=f"/home/claude/videos/img/{name}.jpg"
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i","/tmp/_px","-vf","scale='min(900,iw)':-2","-q:v","3",dst])
        if os.path.exists(dst) and os.path.getsize(dst)>5000:
            shutil.copy(dst,f"/home/claude/dco/_pipeline/images/{name}.jpg")
            open("/home/claude/dco/_pipeline/images/CREDITS.tsv","a").write(f"{name}\tpxhere {m.group(3)}\tPxHere\tCC0\thttps://pxhere.com/en/photo/{m.group(3)}\n")
            print("OK",name,q,m.group(3)); return True
    print("MISS",name,q); return False
if __name__=="__main__": get(sys.argv[1],sys.argv[2],sys.argv[3:] or None)
