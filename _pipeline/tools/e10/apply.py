import sys, json, os, re
sys.path.insert(0,'/home/claude/dco/_pipeline/tools')
P='/home/claude/dco/_pipeline/scripts/'
CRED={}
for l in open('/home/claude/dco/_pipeline/images/CREDITS.tsv'):
    f=l.rstrip('\n').split('\t')
    if len(f)>=4: CRED[f[0]]=(f[2],f[3])
def cap(key,label):
    a,lic=CRED.get(key,("",""))
    a=re.sub(r'\s+',' ',a)[:38]
    if a=="PxHere": return f"{label} · फ़ोटो: PxHere (CC0)"
    return f"{label} · फ़ोटो: {a} ({lic}), Wikimedia Commons"
# chapter -> [(head prefix, image key, label)]
M={
"c9_yoga_ch4":[("सूर्य नमस्कार क्या है?","sn_pose","सूर्य नमस्कार – मूर्तिशिल्प"),("सूर्य का महत्त्व","y4_chhath","छठ पर्व – सूर्य को अर्घ्य"),("तैयारी और सही स्थान","y4_group","योग – प्रकृति के बीच"),
 ("चरण 1","y4_pranamasana","प्रणामासन"),("चरण 2","y4_hastauttan","हस्त उत्तानासन"),("चरण 3","y4_padahasta","पादहस्तासन"),("चरण 4","y4_ashwa","अश्व संचालनासन"),("चरण 5","y4_parvata","पर्वतासन"),("चरण 6","y4_ashtanga","अष्टांग नमस्कार"),("चरण 7","y4_bhujanga","भुजंगासन")],
"c9_yoga_ch5":[("शारीरिक शिक्षा क्या है?","y5_pe","शारीरिक शिक्षा"),("घटक 1","y5_run","दौड़ – सहनशक्ति"),("घटक 2","y5_situp","माँसपेशियों की ताकत"),("घटक 3","y5_stretch","लचीलापन"),("वार्म-अप","y5_warmup","वार्म-अप"),("खेलों के प्रकार","y5_sports","खेल"),("विद्यार्थियों के लिए","y5_cycle","साइकिल – रोज़ की गतिविधि"),("फ़िटनेस के साधारण","y5_rope","रस्सी कूदना")],
"c9_yoga_ch6":[("संतुलित आहार","y6_thali","संतुलित थाली"),("प्रोटीन","y6_dal","दाल – प्रोटीन"),("विटामिन और खनिज","y6_fruits","फल और सब्ज़ियाँ"),("पानी और रेशा","y6_water","साफ़ पानी"),("पानी और भोजन","y6_handwash","हाथ धोना"),("व्यक्तिगत स्वच्छता","y6_toothbrush","दाँतों की सफ़ाई"),("हाथ धोने","y6_handsteps","हाथ धोने की विधि"),("सामुदायिक","y6_swachh","स्वच्छता अभियान"),("संक्रामक","y6_mosquito","मच्छर – रोग फैलाते हैं"),("टीकाकरण","y6_vaccine","टीकाकरण")],
"c9_yoga_ch7":[("कबड्डी – परिचय","y7_kabaddi","कबड्डी"),("खो-खो","y7_khokho","खो-खो"),("क्रिकेट","y7_cricket","क्रिकेट"),("फ़ुटबॉल","y7_football","फ़ुटबॉल"),("वॉलीबॉल","y7_volley","वॉलीबॉल"),("बैडमिंटन","y7_badminton","बैडमिंटन"),("एथलेटिक्स","y7_athletics","दौड़ की शुरुआत")],
"c9_yoga_ch8":[("प्राथमिक उपचार पेटी","y8_kit","प्राथमिक उपचार पेटी"),("खून बहने","y8_bandage","पट्टी बाँधना"),("आपातकाल में","y8_ambulance","एम्बुलेंस"),("गले में कुछ","y8_cpr","जीवन रक्षक प्रशिक्षण"),("लू, बेहोशी","y8_ors","ओआरएस घोल"),("सड़क सुरक्षा","y8_road","सड़क सुरक्षा"),("आग से","y8_fire","आग से सुरक्षा"),("आपदा","y8_flood","बाढ़")],
}
for name,L in M.items():
    ns={}; exec(open(P+name+'.py').read(),ns); S=ns['S']; n=0
    for sc in S:
        sc.pop('img',None); sc.pop('cap',None)
        if sc['kind']!='content': continue
        for pre,key,label in L:
            if sc.get('head','').startswith(pre) and os.path.exists(f'/home/claude/videos/img/{key}.jpg'):
                sc['img']=key+'.jpg'; sc['cap']=cap(key,label); n+=1; break
    with open(P+name+'.py','w') as f:
        f.write("META = "+json.dumps(ns['META'],ensure_ascii=False)+"\nS = [\n"+",\n".join(json.dumps(s,ensure_ascii=False) for s in S)+"\n]\n")
    print(name,n,'images of',len(L))
