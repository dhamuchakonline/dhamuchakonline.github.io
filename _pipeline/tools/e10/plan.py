import sys,os,subprocess
sys.path.insert(0,'/home/claude/dco/_pipeline/tools/e10')
from pxh import get
def run(path):
    for l in open(path):
        l=l.strip()
        if not l or l.startswith('#'):continue
        f=l.split('|')
        sc,head,name,q,must,label=f[:6]
        if os.path.exists(f'/home/claude/videos/img/{name}.jpg'):continue
        get(name,q,must.split() if must else None)
if __name__=="__main__":
    run(sys.argv[1])
