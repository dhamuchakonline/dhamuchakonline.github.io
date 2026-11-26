import sys,os; sys.path.insert(0,'/home/claude/dco/_pipeline/tools/e10')
import pxh
P={
"y4_overview":[("yoga",["yoga"]),("meditation yoga",["yoga"])],
"y4_sunrise":[("sunrise",["sunrise"])],
"y4_chhath":[("chhath puja",["chhath"]),("sun worship river",["sun"])],
"y4_hastauttan":[("yoga arms raised",["yoga"])],
"y4_bhujanga":[("cobra pose yoga",["cobra"]),("yoga cobra",["yoga"])],
"y4_group":[("yoga class",["yoga"]),("group yoga",["yoga"])],
"y5_pe":[("school children exercise",["children"]),("physical education",["exercise"])],
"y5_run":[("running race",["running"]),("sprint",["sprint"])],
"y5_rope":[("skipping rope",["rope"]),("jump rope",["rope"])],
"y5_situp":[("sit up exercise",["exercise"]),("abdominal crunch",["crunch"])],
"y5_stretch":[("stretching",["stretch"])],
"y5_warmup":[("warm up exercise",["exercise"]),("stretching athletes",["stretch"])],
"y5_swim":[("swimming",["swim"])],
"y5_cycle":[("child bicycle",["bicycle"]),("cycling",["cycl"])],
"y5_gilli":[("gilli danda",["danda"])],
"y5_sports":[("school sports",["sport"]),("sports day",["sport"])],
"y6_thali":[("thali",["thali"]),("indian food meal",["indian"])],
"y6_fruits":[("fruits vegetables",["vegetable"]),("fruit market",["fruit"])],
"y6_dal":[("dal lentils",["lentil"]),("dal",["dal"])],
"y6_milk":[("milk glass",["milk"])],
"y6_handwash":[("washing hands",["hand"]),("hand wash",["wash"])],
"y6_toothbrush":[("brushing teeth",["teeth"]),("toothbrush",["tooth"])],
"y6_water":[("hand pump water",["pump"]),("drinking water tap",["water"])],
"y6_vaccine":[("vaccination child",["vaccin"]),("vaccine",["vaccin"])],
"y6_swachh":[("cleaning garbage",["clean"]),("broom sweeping",["broom"])],
"y6_mosquito":[("mosquito",["mosquito"])],
"y7_kabaddi":[("kabaddi",["kabaddi"])],
"y7_khokho":[("kho kho",["kho"]),("children running playing",["children"])],
"y7_cricket":[("cricket india",["cricket"]),("cricket",["cricket"])],
"y7_football":[("football match",["football"]),("soccer",["soccer"])],
"y7_volley":[("volleyball",["volleyball"])],
"y7_badminton":[("badminton",["badminton"])],
"y7_athletics":[("athletics",["athlet"]),("sprint",["sprint"])],
"y7_javelin":[("javelin",["javelin"])],
"y8_kit":[("first aid kit",["aid"]),("first aid",["aid"])],
"y8_bandage":[("bandage",["bandage"])],
"y8_ambulance":[("ambulance",["ambulance"])],
"y8_cpr":[("cpr",["cpr"]),("resuscitation",["resuscitation"])],
"y8_fire":[("fire extinguisher",["extinguisher"]),("firefighter",["fire"])],
"y8_road":[("zebra crossing",["zebra"]),("helmet",["helmet"])],
"y8_flood":[("flood village",["flood"]),("flood",["flood"])],
"y8_ors":[("oral rehydration",["rehydration"]),("medicine salt water",["water"])],
}
only=sys.argv[1:]
for k,qs in P.items():
    if only and not any(k.startswith(o) for o in only): continue
    if os.path.exists(f"/home/claude/videos/img/{k}.jpg"): continue
    for q,m in qs:
        if pxh.get(k,q,m): break
    else: print("NONE",k)
