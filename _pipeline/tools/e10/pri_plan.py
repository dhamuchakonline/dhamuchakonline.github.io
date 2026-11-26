import sys; sys.path.insert(0,'/home/claude/dco/_pipeline/tools')
import img,os
P={
"mu_sitar":["Sitar","Sitar instrument"],
"mu_tabla":["Tabla","Tabla and bayan"],
"mu_bansuri":["Bansuri flute","Bansuri"],
"mu_shehnai":["Shehnai","Shehnai player"],
"mu_dholak":["Dholak","Dholak drum"],
"mu_tanpura":["Tanpura","Tanpura instrument"],
"mu_harmonium":["Harmonium Indian","Indian harmonium"],
"mu_veena":["Saraswati veena","Veena instrument"],
"mu_mridangam":["Mridangam"],
"mu_manjira":["Manjira cymbals","Jhal manjira"],
"mu_sarod":["Sarod"],
"mu_santoor":["Santoor"],
"mu_nagara":["Nagara drum","Nagada"],
"mu_ektara":["Ektara","Ektara Baul"],
"fa_ajanta":["Ajanta Caves painting","Ajanta cave paintings Bodhisattva"],
"fa_mughal":["Mughal miniature painting"],
"fa_pahari":["Kangra painting","Pahari miniature painting"],
"fa_patna":["Patna Kalam painting"],
"fa_sanchi":["Sanchi Stupa gateway"],
"fa_dancing_girl":["Dancing Girl Mohenjo-daro bronze"],
"fa_sujani":["Sujini embroidery","Sujani embroidery"],
"fa_sikki":["Sikki grass craft","Sikki craft Madhubani"],
"fa_tikuli":["Tikuli art"],
"fa_konark":["Konark Sun Temple wheel"],
"fa_warli":["Warli painting"],
"da_bharatanatyam":["Bharatanatyam dancer"],
"da_kathak":["Kathak dancer"],
"da_odissi":["Odissi dancer"],
"da_chhau":["Chhau dance"],
"da_manipuri":["Manipuri dance"],
"da_kuchipudi":["Kuchipudi dancer"],
"da_ghungroo":["Ghungroo anklet bells"],
}
for k,q in P.items():
    if os.path.exists(f"/home/claude/videos/img/{k}.jpg"): continue
    img.get(k,*q)
