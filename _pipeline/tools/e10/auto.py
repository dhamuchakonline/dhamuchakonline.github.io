import sys,re,os,glob,json,time
sys.path.insert(0,'/home/claude/dco/_pipeline/tools/e10')
import urllib.parse
from pxh import rd
import subprocess,shutil
SC='/home/claude/dco/_pipeline/scripts/'
STOP=set("and the of in on for to a an with by from at as its their our how why what is are into about introduction chapter class".split())
def meta(n):
    ns={};exec(open(SC+n+'.py').read(),ns);return ns['META']
def toks(t):
    return [w for w in re.findall(r"[a-z]{3,}",t.lower()) if w not in STOP]
def fetch(script,maxn=4):
    m=meta(script);t=m['title_en']
    ws=toks(t)
    qs=[" ".join(ws[:3])]+ws[:3]
    got=[];ids=set()
    for q in qs:
        if len(got)>=maxn or not q:continue
        h=(rd("https://pxhere.com/en/photos?q="+urllib.parse.quote_plus(q)) or b"").decode("utf8","ignore")
        must=q.split()
        for mm in re.finditer(r'https://c\.pxhere\.com/photos/(\w\w/\w\w)/([^" ]*?)-(\d+)\.jpg!s2',h):
            pid=mm.group(3);slug=mm.group(2).lower()
            if pid in ids:continue
            if not any(w in slug for w in must):continue
            data=rd(mm.group(0))
            if not data:continue
            k=len(got)+1;name=f"ap_{script}_{k}"
            open("/tmp/_pa","wb").write(data);dst=f"/home/claude/videos/img/{name}.jpg"
            subprocess.run(["ffmpeg","-y","-loglevel","error","-i","/tmp/_pa","-vf","scale='min(900,iw)':-2","-q:v","3",dst])
            if os.path.exists(dst) and os.path.getsize(dst)>5000:
                shutil.copy(dst,f"/home/claude/dco/_pipeline/images/{name}.jpg")
                open("/home/claude/dco/_pipeline/images/CREDITS.tsv","a").write(f"{name}\tpxhere {pid}\tPxHere\tCC0\thttps://pxhere.com/en/photo/{pid}\n")
                got.append((name,slug));ids.add(pid)
                if len(got)>=maxn:break
    return got
if __name__=="__main__":
    out={}
    for s in sys.argv[1:]:
        g=fetch(s);out[s]=g;print(s,meta(s)['title_en'],len(g),flush=True)
    json.dump(out,open('/tmp/auto_'+str(int(time.time()))+'.json','w'),ensure_ascii=False)
