import sys,re,importlib; sys.path.insert(0,'/home/claude/videos/scripts')
for n in sys.argv[1:]:
    m=importlib.import_module(n); w=sum(len(s['say'].split()) for s in m.S)
    bad=[]
    for s in m.S:
        for k in ('points','q','a','eq','words','note','big','sub','head'):
            v=s.get(k); v=v if isinstance(v,list) else [v] if v else []
            for t in v:
                if re.search(r'[A-Za-z\)]\d',t): bad.append(t[:50])
    print(n,len(m.S),'scenes',w,'words ~',round(w/112),'min', 'SUBSCRIPT?' if bad else '', bad[:3])
