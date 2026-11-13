# usage: exec(open('/tmp/gen/common1X.py').read()); exec(open('/tmp/gen/chhelp.py').read()); set SUBJ, SAY, PREFIX, ENDTIP
P = {}
def ch(n,t,en,intro,cs,q1,q2,nxt,final=None):
    s=[TITLE(intro)]
    for c in cs:
        k=c[0]
        if k=="T": s.append(T(c[1],c[2],c[3],c[4]))
        elif k=="E": s.append(E(c[1],c[2],c[3],c[4],c[5],c[6]))
        elif k=="C": s.append(C(c[1],c[2],c[3],c[4]))
        elif k=="X": s.append(dict(kind='compare',head=c[1],left=c[2],right=c[3],say=c[4]))
        else: s.append(L(c[1],c[2],c[3],c[4]))
    s.append(Q(1,q1[0],q1[1],"अब अभ्यास प्रश्न। पहला, "+q1[2]+" ... उत्तर, "+q1[3]))
    s.append(Q(2,q2[0],q2[1],"दूसरा, "+q2[2]+" ... उत्तर, "+q2[3]))
    s.append(END(final if final else f"शाबाश बच्चों! {ENDTIP} अगली क्लास में हम पढ़ेंगे, {nxt}। तब तक के लिए, धन्यवाद!"))
    P[n]=(HX(n,t,en,SUBJ,SAY),s)
def save():
    import json
    for n,(m,s) in P.items():
        open(f"/home/claude/videos/{PREFIX}_ch{n}.py","w").write(f"# auto\nMETA = {json.dumps(m, ensure_ascii=False)}\nS = {json.dumps(s, ensure_ascii=False, indent=0)}\n")
    print("ok", PREFIX, list(P))
