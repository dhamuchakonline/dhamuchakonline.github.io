# उपयोग: python3 mk.py  (spec को स्टडिन में python dict के रूप में) — scripts/<name>.py लिखता है
import json,sys
def build(name,cls,subj,subj_say,num,numsay,title,title_en,intro,story,scenes,think,prac,summ,hw,nxt):
    """scenes: list of (kind,icon,head,points/eq,say) ; kind in content/list/table
       story=(head,points,say); think=(q,a,say); prac=[(q,a,say)]; summ=(points,say); hw=(points,say)"""
    S=[{"kind":"title","say":intro}]
    S.append({"kind":"content","icon":story[3] if len(story)>3 else "📖","head":story[0],"points":story[1],"say":story[2]})
    for sc in scenes:
        k=sc[0]
        if k=="table":
            S.append({"kind":"table","icon":sc[1],"head":sc[2],"eq":sc[3][0],"rows":sc[3][1],"say":sc[4]})
        else:
            S.append({"kind":k,"icon":sc[1],"head":sc[2],"points":sc[3],"say":sc[4]})
    S.append({"kind":"question","icon":"🤔","head":"सोचिए","q":think[0],"a":think[1],"pause":4,"say":think[2]})
    for i,(q,a,say) in enumerate(prac,1):
        S.append({"kind":"question","icon":"❓","head":f"अभ्यास {i}","q":q,"a":a,"pause":3,"say":say})
    S.append({"kind":"list","icon":"📝","head":"सार","points":summ[0],"say":summ[1]})
    S.append({"kind":"list","icon":"🏡","head":"घर का काम","points":hw[0],"say":hw[1]})
    S.append({"kind":"end","say":nxt})
    META={"cls":cls,"subject":subj,"chapter":f"अध्याय {num}","title":title,"title_en":title_en,"subject_say":subj_say,"chapter_say":numsay}
    # स्क्रिप्ट के बीच के स्थान: think/सोचिए सीन scenes के बीच में भी रखा जा सकता है — यहाँ अंत में
    with open(f"scripts/{name}.py","w") as f:
        f.write("META = "+json.dumps(META,ensure_ascii=False)+"\nS = [\n")
        for s in S: f.write(json.dumps(s,ensure_ascii=False)+",\n")
        f.write("]\n")
