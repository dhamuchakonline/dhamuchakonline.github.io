import json,sys
sys.path.insert(0,'/home/claude/dco/_pipeline/scripts')
P='/home/claude/dco/_pipeline/scripts/'
def C(i,h,p,s): return {"kind":"content","icon":i,"head":h,"points":p,"say":s,"ext":1}
def T(i,h,nr,s): return {"kind":"table","icon":i,"head":h,"eq":nr[0],"rows":nr[1],"say":s,"ext":1}
def Q(q,a,s,h="सोचिए"): return {"kind":"question","icon":"🤔","head":h,"q":q,"a":a,"pause":4,"say":s,"ext":1}
def ext(name,new,lv=1):
    ns={};exec(open(P+name+'.py').read(),ns)
    S=[s for s in ns['S'] if s.get('ext')!=lv]
    import re
    def fx(x):
        if isinstance(x,str): return re.sub(r'([A-Za-z])(\d)',lambda m:m.group(1)+'\u2060'+m.group(2),x)
        if isinstance(x,list): return [fx(i) for i in x]
        return x
    for s in new:
        s["ext"]=lv
        for k in ("head","points","q","a","rows","eq"):
            if k in s: s[k]=fx(s[k])
    idx=next(i for i,s in enumerate(S) if s['kind']=='question' and str(s.get('head','')).startswith('अभ्यास'))
    S=S[:idx]+new+S[idx:]
    with open(P+name+'.py','w') as f:
        f.write("META = "+json.dumps(ns['META'],ensure_ascii=False)+"\nS = [\n")
        for s in S: f.write(json.dumps(s,ensure_ascii=False)+",\n")
        f.write("]\n")
    w=sum(len(s.get('say','').split()) for s in S); print(name,len(S),'scenes',w,'words')
