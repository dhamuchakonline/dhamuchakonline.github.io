import json
def H(label, t, en, sayn, tsay=None):
    d = dict(cls="कक्षा 9", subject="हिंदी (Hindi)", chapter=label, title=t, title_en=en, subject_say="हिंदी", chapter_say=sayn)
    if tsay: d["title_say"] = tsay
    return d
def C(icon, head, points, say): return dict(kind="content", icon=icon, head=head, points=points, say=say)
def L(icon, head, points, say): return dict(kind="list", icon=icon, head=head, points=points, say=say)
def T(head, eq, rows, say): return dict(kind="table", head=head, eq=eq, rows=rows, say=say)
def E(icon, head, words, eq, note, say): return dict(kind="eq", icon=icon, head=head, words=words, eq=eq, note=note, say=say)
def Q(n, q, a, say, pause=4): return dict(kind="question", icon="❓", head=f"अभ्यास प्रश्न {n}", q=q, a=a, pause=pause, say=say)
def TITLE(say): return dict(kind="title", say=say)
def END(say): return dict(kind="end", say=say)
NUMS = {1:"एक",2:"दो",3:"तीन",4:"चार",5:"पाँच",6:"छह",7:"सात",8:"आठ",9:"नौ",10:"दस",11:"ग्यारह",12:"बारह",13:"तेरह",14:"चौदह",15:"पंद्रह",16:"सोलह",17:"सत्रह",18:"अठारह",19:"उन्नीस",20:"बीस",21:"इक्कीस",22:"बाईस",23:"तेईस",24:"चौबीस",25:"पच्चीस",26:"छब्बीस"}
def HX(n, t, en, subj="विज्ञान (Science)", say="विज्ञान"):
    return dict(cls="कक्षा 12", subject=subj, chapter=f"अध्याय {n}", title=t, title_en=en, subject_say=say, chapter_say=f"अध्याय {NUMS[n]}")
