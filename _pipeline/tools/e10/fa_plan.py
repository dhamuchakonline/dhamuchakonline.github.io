import sys; sys.path.insert(0,'/home/claude/dco/_pipeline/tools')
import img,os
P={
"fa_madhubani":["Madhubani painting","Mithila painting"],
"fa_madhubani2":["Madhubani painting fish","Madhubani art Bihar"],
"fa_madhubani_wall":["Madhubani wall painting village","Mithila village house painted wall"],
"fa_ajanta":["Ajanta Caves painting","Ajanta cave paintings Bodhisattva"],
"fa_mughal":["Mughal miniature painting","Mughal miniature emperor court"],
"fa_pahari":["Kangra painting","Pahari miniature painting"],
"fa_rajput":["Rajput painting Rajasthani miniature","Kishangarh painting"],
"fa_patna":["Patna Kalam painting","Patna school of painting"],
"fa_warli":["Warli painting"],
"fa_sujani":["Sujini embroidery Bihar","Sujani embroidery"],
"fa_sikki":["Sikki grass craft Bihar","Sikki craft Madhubani"],
"fa_tikuli":["Tikuli art","Tikuli painting Patna"],
"fa_sanchi":["Sanchi Stupa","Sanchi Stupa gateway"],
"fa_dancing_girl":["Dancing Girl Mohenjo-daro bronze"],
"fa_ashoka_pillar":["Lion Capital of Ashoka Sarnath"],
"fa_didarganj":["Didarganj Yakshi"],
"fa_konark":["Konark Sun Temple wheel"],
"fa_terracotta":["Terracotta horse Bengal","terracotta Bankura horse"],
"fa_clay":["potter making clay pot India","Indian potter wheel"],
"fa_bidri":["Bidriware"],
"fa_rangoli":["Rangoli Diwali","Rangoli India"],
"fa_aipan":["Aripana Bihar floor painting","Alpona"],
"fa_colorwheel":["Color wheel","Colour wheel RYB"],
"fa_brushes":["watercolor paint brushes","painting brushes paint palette"],
"fa_primary":["Primary colors RYB","Color mixing primary secondary"],
"fa_lines":["Line art types lines","Hatching cross-hatching"],
"fa_perspective":["Linear perspective drawing","One-point perspective"],
"fa_still":["Still life painting fruit","Still life drawing"],
"fa_gond":["Gond painting"],
"fa_pattachitra":["Pattachitra painting","Patachitra Odisha"],
"fa_kalamkari":["Kalamkari"],
"fa_ravi":["Bengal school painting Abanindranath","Bharat Mata painting Abanindranath Tagore"],
"fa_nandalal":["Nandalal Bose painting"],
}
only=sys.argv[1:]
for k,q in P.items():
    if only and not any(k.startswith(o) for o in only): continue
    if os.path.exists(f"/home/claude/videos/img/{k}.jpg"): continue
    img.get(k,*q)
