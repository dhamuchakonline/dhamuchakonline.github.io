import json
W = {1:"एक",2:"दो",3:"तीन",4:"चार",5:"पाँच",6:"छह",7:"सात",8:"आठ",9:"नौ",10:"दस",11:"ग्यारह",12:"बारह",13:"तेरह"}
P={}
def MH(cls,kind,n,t,en): 
    lab = "गद्य" if kind=="g" else "पद्य"
    return dict(cls=f"कक्षा {cls}", subject="हिंदी (Hindi)", chapter=f"{lab} {n}", title=t, title_en=en, subject_say="हिंदी", chapter_say=f"{lab} खंड का पाठ {W[n]}")
def hk(idx,meta,intro,bio,summ,msg,q1,q2,nxt):
    s=[dict(kind="title",say=intro),
       dict(kind="content",icon="✍️",head=bio[0],points=bio[1],say=bio[2]),
       dict(kind="list",icon=summ[0],head=summ[1],points=summ[2],say=summ[3]),
       dict(kind="content",icon="💡",head="संदेश / मूल भाव",points=msg[0],say=msg[1]),
       dict(kind="question",icon="❓",head="अभ्यास प्रश्न 1",q=q1[0],a=q1[1],pause=4,say="अब अभ्यास प्रश्न। पहला, "+q1[2]+" ... उत्तर, "+q1[3]),
       dict(kind="question",icon="❓",head="अभ्यास प्रश्न 2",q=q2[0],a=q2[1],pause=4,say="दूसरा, "+q2[2]+" ... उत्तर, "+q2[3]),
       dict(kind="end",say=(f"शाबाश बच्चों! पाठ को किताब से एक बार ज़रूर पढ़िए, और प्रश्न-उत्तर लिखिए। अगली क्लास में हम पढ़ेंगे, {nxt}। तब तक के लिए, धन्यवाद!" if nxt else "शाबाश बच्चों! दिगंत भाग दो पूरा हुआ। बोर्ड परीक्षा के लिए हर पाठ के लेखक परिचय और सार याद कीजिए। धन्यवाद!"))]
    P[idx]=(meta,s)
def savep(prefix):
    for n,(m,s) in P.items():
        open(f"/home/claude/videos/{prefix}_ch{n}.py","w").write(f"# auto\nMETA = {json.dumps(m, ensure_ascii=False)}\nS = {json.dumps(s, ensure_ascii=False, indent=0)}\n")
    print("ok", prefix, list(P))
