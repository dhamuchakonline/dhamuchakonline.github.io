import json,glob,importlib.util,collections,sys
out=collections.defaultdict(dict)
for f in sorted(glob.glob('_pipeline/quiz_src/c*_*.py')):
    sp=importlib.util.spec_from_file_location('m',f);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
    cls=f.split('/')[-1].split('_')[0][1:]
    for k,v in m.Q.items():
        assert len(v)==5,(k,len(v))
        for q in v: assert len(q)==5 and len(set(q[1:]))==4,(k,q)
        out[cls][k]=[q+[0] for q in v]
ch={c['id'] for c in json.load(open('chapters.json'))}
for cls,d in out.items():
    bad=[k for k in d if k not in ch]; assert not bad,bad
    json.dump(d,open(f'quiz/c{cls}.json','w'),ensure_ascii=False,separators=(',',':'))
    print(cls,len(d))
