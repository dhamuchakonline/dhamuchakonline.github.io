import sys,json,os,re
P='/home/claude/dco/_pipeline/scripts/'
CRED={}
for l in open('/home/claude/dco/_pipeline/images/CREDITS.tsv'):
    f=l.rstrip('\n').split('\t')
    if len(f)>=4: CRED[f[0]]=f[2]
def cap(k,label):
    a=CRED.get(k,"")
    return f"{label} · फ़ोटो: PxHere (CC0)" if a=="PxHere" else f"{label} · फ़ोटो: {a[:38]}, Wikimedia Commons"
def apply(name,L):
    ns={};exec(open(P+name+'.py').read(),ns);S=ns['S'];n=0
    for sc in S:
        sc.pop('img',None);sc.pop('cap',None)
        if sc['kind']!='content':continue
        for pre,key,label in L:
            if sc.get('head','').startswith(pre) and os.path.exists(f'/home/claude/videos/img/{key}.jpg'):
                sc['img']=key+'.jpg';sc['cap']=cap(key,label);n+=1;break
    open(P+name+'.py','w').write("META = "+json.dumps(ns['META'],ensure_ascii=False)+"\nS = [\n"+",\n".join(json.dumps(s,ensure_ascii=False) for s in S)+"\n]\n")
    print(name,n,'of',len(L))
if __name__=="__main__":
    apply("c10_computer_ch1",[("इंटरनेट क्या है","cc_net","इंटरनेट से जुड़ा कंप्यूटर"),("इंटरनेट से जुड़ने","cc_router","वाई-फ़ाई राउटर"),("ज़रूरी उपकरण","cc_laptop","लैपटॉप और अन्य उपकरण"),
      ("ईमेल","cc_email","ईमेल"),("इंटरनेट के खतरे","cc_lock","सुरक्षा – ताले"),("बुनियादी शब्दावली","cc_code","सर्वर/वेब का कोड"),("इंटरनेट पर अन्य","cc_mobile","मोबाइल से इंटरनेट")])
