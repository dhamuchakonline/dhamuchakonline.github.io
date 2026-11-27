import sys,os,json
sys.path.insert(0,'/home/claude/dco/_pipeline/tools/e10')
from apply_cc import cap,P
def apply_plan(path):
    by={}
    order=[]
    for l in open(path):
        l=l.strip()
        if not l or l.startswith('#'):continue
        sc,head,name,q,must,label=l.split('|')[:6]
        if not os.path.exists(f'/home/claude/videos/img/{name}.jpg'):continue
        by.setdefault(sc,[]).append((head,name,label))
    for sc,L in by.items():
        ns={};exec(open(P+sc+'.py').read(),ns);S=ns['S']
        for s in S:s.pop('img',None);s.pop('cap',None)
        idx=[i for i,s in enumerate(S) if s['kind'] in('content','list')]
        used=set();rest=[]
        for head,name,label in L:
            hit=[i for i in idx if head and i not in used and head in S[i].get('head','')]
            if hit:
                i=hit[0];used.add(i);S[i]['img']=name+'.jpg';S[i]['cap']=cap(name,label)
            else:rest.append((name,label))
        free=[i for i in idx if i not in used and i>idx[0]]
        if rest and free:
            step=max(1,len(free)//(len(rest)+1))
            for k,(name,label) in enumerate(rest):
                i=free[min(len(free)-1,(k+1)*step-1+0)]
                if i in used:
                    cand=[j for j in free if j not in used]
                    if not cand:break
                    i=cand[0]
                used.add(i);S[i]['img']=name+'.jpg';S[i]['cap']=cap(name,label)
        open(P+sc+'.py','w').write("META = "+json.dumps(ns['META'],ensure_ascii=False)+"\nS = [\n"+",\n".join(json.dumps(s,ensure_ascii=False) for s in S)+"\n]\n")
        print(sc,len(used),'photos')
    return list(by)
if __name__=="__main__":
    for sc in apply_plan(sys.argv[1]):print(sc)
