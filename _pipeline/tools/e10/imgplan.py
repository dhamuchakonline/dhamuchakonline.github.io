import sys; sys.path.insert(0,'/home/claude/dco/_pipeline/tools')
import img
P={
# ch4 सूर्य नमस्कार
"y4_overview":["Sun salutations yoga","Surya Namaskar group"],
"y4_sunrise":["sunrise over field India","sunrise village India"],
"y4_chhath":["Chhath Puja Bihar arghya","Chhath Puja sun worship"],
"y4_pranamasana":["Mr-yoga-mountain-pose-hands in prayer","Pranamasana"],
"y4_hastauttan":["Hasta Uttanasana","Urdhva Hastasana raised arms pose"],
"y4_padahasta":["Padahastasana","Uttanasana standing forward bend"],
"y4_ashwa":["Ashwa Sanchalanasana","Low lunge yoga pose"],
"y4_parvata":["Adho Mukha Svanasana","Downward dog yoga pose"],
"y4_ashtanga":["Ashtanga Namaskara","Ashtanga Namaskar yoga"],
"y4_bhujanga":["Bhujangasana, Heinz Grill 1992","Bhujangasana in Yogasopana"],
"y4_group":["Yoga class school children India","International Day of Yoga school students"],
# ch5 शारीरिक शिक्षा
"y5_pe":["school physical education class India","schoolchildren exercise drill India"],
"y5_run":["children running race India","school sports day running India"],
"y5_rope":["skipping rope children","rope jumping girls"],
"y5_situp":["sit-up exercise","crunch exercise"],
"y5_stretch":["stretching exercise sit and reach","hamstring stretch"],
"y5_warmup":["warm up exercise students","warm-up stretching athletes"],
"y5_swim":["children swimming pool","swimming race"],
"y5_cycle":["children cycling school India","girls bicycle India Bihar"],
"y5_gilli":["Gilli danda","Gulli danda game"],
"y5_sports":["school sports day India","school sports India students"],
# ch6 स्वास्थ्य पोषण स्वच्छता
"y6_thali":["Indian thali meal","Bihari thali litti chokha"],
"y6_fruits":["fruits and vegetables market India","vegetable stall India"],
"y6_dal":["Dal tadka","lentils dal India"],
"y6_milk":["milk glass dairy India","curd dahi"],
"y6_handwash":["children washing hands India","handwashing school India"],
"y6_handsteps":["Handwashing steps WHO","How to wash hands"],
"y6_toothbrush":["child brushing teeth","brushing teeth"],
"y6_water":["handpump India water village","hand pump village Bihar"],
"y6_vaccine":["polio vaccination India child","vaccination children India"],
"y6_swachh":["Swachh Bharat Abhiyan cleanliness drive","Swachh Bharat toilet village"],
"y6_mosquito":["Mosquito net India","Anopheles mosquito"],
# ch7 खेल
"y7_kabaddi":["Kabaddi match","A Kabaddi match at 2006 Asian Games"],
"y7_khokho":["Kho Kho game at a Government school in Haryana, India","Kho kho game"],
"y7_cricket":["cricket match village India","cricket match India"],
"y7_football":["Shrewsbury Schoolboys v Stafford football match","football match school boys"],
"y7_volley":["Volleyball players Nepal","People playing volleyball"],
"y7_badminton":["badminton match","Badminton player smash"],
"y7_athletics":["athletics sprint start blocks","100 metres sprint race"],
"y7_javelin":["Neeraj Chopra javelin","javelin throw"],
"y7_dhyan":["Major Dhyan Chand","Dhyan Chand hockey"],
"y7_pvsindhu":["P. V. Sindhu","PV Sindhu badminton"],
"y7_marycom":["Mary Kom boxing","Mary Kom"],
# ch8 प्राथमिक चिकित्सा
"y8_kit":["First aid kit on wall","First Aid Kit.png"],
"y8_bandage":["Improvised first aid - bandage on leg","First aid bandaging"],
"y8_ambulance":["108 ambulance India","Ambulance India"],
"y8_cpr":["CPR demonstration","cardiopulmonary resuscitation training"],
"y8_fire":["fire extinguisher","firefighters India fire brigade"],
"y8_road":["zebra crossing India children","helmet motorcycle India road safety"],
"y8_flood":["Bihar flood village","flood Bihar 2008 Kosi"],
"y8_ors":["Oral rehydration salts packet","ORS oral rehydration India"],
}
only=sys.argv[1:]
for k,q in P.items():
    if only and not any(k.startswith(o) for o in only): continue
    import os
    if os.path.exists(f"/home/claude/videos/img/{k}.jpg"): continue
    img.get(k,*q)
