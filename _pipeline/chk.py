import sys,re,importlib; sys.path.insert(0,'/home/claude/videos/scripts')
def flat(v):
    if isinstance(v,str): return [v]
    if isinstance(v,dict): return [x for y in v.values() for x in flat(y)]
    if isinstance(v,(list,tuple)): return [x for y in v for x in flat(y)]
    return []
for n in sys.argv[1:]:
    m=importlib.import_module(n); w=sum(len(s['say'].split()) for s in m.S)
    bad=[]
    for s in m.S:
        for k in ('points','q','a','eq','words','note','sub','head','rows','left','right'):
            for t in flat(s.get(k)):
                if re.search(r'[A-Za-z\)]\d',t): bad.append(t[:50])
    print(n,len(m.S),'scenes',w,'words ~',round(w/112),'min', 'SUBSCRIPT?' if bad else '', bad[:3])
