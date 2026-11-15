import re,json
P='/home/claude/dco/_pipeline/scripts/'
def C(i,h,p,s): return {"kind":"content","icon":i,"head":h,"points":p,"say":s}
def T(i,h,nr,s): return {"kind":"table","icon":i,"head":h,"eq":nr[0],"rows":nr[1],"say":s}
def Q(q,a,s,h="सोचिए"): return {"kind":"question","icon":"🤔","head":h,"q":q,"a":a,"pause":4,"say":s}
def fx(x):
    if isinstance(x,str): return re.sub(r'([A-Za-z])(\d)',lambda m:m.group(1)+'⁠'+m.group(2),x)
    if isinstance(x,list): return [fx(i) for i in x]
    if isinstance(x,dict): return {k:(fx(v) if k!='kind' else v) for k,v in x.items()}
    return x
NUM={1:'एक',2:'दो',3:'तीन',4:'चार',5:'पाँच',6:'छह',7:'सात',8:'आठ',9:'नौ',10:'दस'}
def mk(name,cls,sub,sub_say,n,title,title_en,tsay,body,esay):
    meta={"cls":f"कक्षा {cls}","subject":sub,"chapter":f"अध्याय {n}","title":title,"title_en":title_en,"subject_say":sub_say,"chapter_say":f"अध्याय {NUM.get(n,n)}"}
    S=[{"kind":"title","say":tsay}]+[fx(b) for b in body]+[{"kind":"end","say":esay}]
    with open(P+name+'.py','w') as f:
        f.write("META = "+json.dumps(meta,ensure_ascii=False)+"\nS = [\n"+",\n".join(json.dumps(s,ensure_ascii=False) for s in S)+"\n]\n")
    w=sum(len(s.get('say','').split()) for s in S); print(name,len(S),'scenes',w,'words')
