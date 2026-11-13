# UHS धामुचक ऑनलाइन क्लास — पूरा हैंडऑफ़ (नए Claude सेशन के लिए)

यह फ़ाइल पढ़कर नया सेशन बिना कुछ पूछे काम आगे बढ़ा सके। सब बातचीत **हिंदी** में (सरल, अंकुश सर के लिए)।

## 1. प्रोजेक्ट क्या है
- **उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक** (Upgraded High School, Dhamuchak, बिहार) के कक्षा 9–12 के बच्चों के लिए **मुफ़्त** ऑनलाइन क्लास वेबसाइट। बनाने वाले: **अंकुश सर** (GitHub: ankushaman3)।
- बच्चा: कक्षा → (11/12 में संकाय: विज्ञान/कला/वाणिज्य) → विषय → चैप्टर → **वीडियो + नोट्स**।
- सब कुछ **मुफ़्त** होना चाहिए (कोई पैसा नहीं)। **YouTube नहीं** — वीडियो GitHub Pages पर ख़ुद होस्ट।
- पाठ्यक्रम: बिहार बोर्ड (9–10 की अपनी किताबें: गोधूलि, पैनोरमा, पीयूषम्; विज्ञान/गणित/SST NCERT जैसा; 11–12 NCERT rationalized + बिहार की हिंदी 'दिगंत', English 'Rainbow')।

## 2. साइट और repos (GitHub organisation: `dhamuchakonline`)
| repo | काम | Pages URL |
|---|---|---|
| `dhamuchakonline/dhamuchakonline.github.io` | मुख्य साइट (index.html, student.js, teacher.html, config.js, store.js, style.css, **chapters.json**), कक्षा 10 व 12-कला/वाणिज्य/भाषा के वीडियो `videos/c10/...`, `videos/c12/...`, यह `_pipeline/` | https://dhamuchakonline.github.io/ |
| `dhamuchakonline/class-9` | कक्षा 9 के वीडियो (`/class-9/<subject>/chNN.mp4`) + **अस्थायी** `c11/`, `c12/` (विज्ञान विषय) | /class-9/ |
| `class-9-a`, `class-9-b` | कक्षा 9 के नए **लंबे** वीडियो (पहले 9-a ≈850 MB तक, फिर 9-b) | /class-9-a/ आदि |
| `class-11`, `class-12` | कक्षा 11 के सब वीडियो; कक्षा 12 विज्ञान (13 नवंबर को class-9 से यहाँ लाए) | /class-11/, /class-12/ |

- GitHub Pages: एक साइट ≈ 1 GB सीमा। class-9 ≈ 620 MB (+ .git ≈ 520 MB), मुख्य साइट ≈ 415 MB।
- **Firebase** प्रोजेक्ट `uhs-dhamuchak` (config `config.js` में पहले से): बच्चे anonymous login; शिक्षक email login (teacher.html)।
- बच्चे का login: नाम + कक्षा + स्कूल का **UDISE कोड 10361104502** (सबके लिए एक; ये सार्वजनिक है, सर ने मंज़ूर किया)। एक बार login के बाद सीधे उसी कक्षा की किताबें; फ़ोन का back बटन पेज-दर-पेज; logout किताबों वाले पेज पर।
- `chapters.json` की हर entry: `{id:"c9_science_01", class, subject, number, title, title_en, video, minutes, notes}`। `video` = `/class-9/science/ch01.mp4` (दूसरे repo) या `videos/c10/...` (मुख्य repo)। subject id `config.js` से: maths, science, social, english, hindi, sanskrit, physics, chemistry, biology, history, geography, polsci, economics, business, accountancy …
- **कभी मत करो:** शिक्षक का password, GitHub/Gmail OTP चैट में न माँगो, न लिखो।

## 3. वीडियो पाइपलाइन (`_pipeline/` में सब कोड)
- `scripts/c<कक्षा>_<विषय>_ch<n>.py` — हर चैप्टर का स्क्रिप्ट: `META = {cls, subject, chapter, title, title_en, subject_say, chapter_say, [title_say]}` और `S = [scenes]`।
- scene kinds: `title`, `content` (icon, head, points, say), `list`, `eq` (icon, head, words, eq, note, say), `table` (head, eq, rows, say), `compare` (head, left/right = {icon,t,d}, say), `question` (q, a, pause, say — `...` से पहले सवाल, बाद में जवाब), `big`, `balance`, `end`।
- वीडियो की शुरुआत **हमेशा अपने-आप** यह बोलती है: "उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक के बच्चों, आपका स्वागत है! आज हम <विषय> का <अध्याय>, <नाम>, शुरू करते हैं। तो चलिए, शुरू करते हैं!"
- `build.py <name>`: Playwright + Chrome (`/usr/bin/google-chrome`) से 1280×720 स्लाइड → gTTS हिंदी आवाज़ → ffmpeg → `<name>_web.mp4` (crf 28, 11/12 के लिए 30)। फ़ॉन्ट `fonts/` (Baloo 2)। पहले `pip install gTTS playwright --break-system-packages`; Chrome न हो तो `playwright install chromium` और build.py में path बदलें।
- `publish.py <name> <subject_id> <n>`: वीडियो सही repo में कॉपी, `chapters.json` में entry + notes, commit, push। **repo चुनने का नियम कोड में (पंक्ति ~47) बदलना है** — नीचे काम देखें। एक बार में एक publish (`flock /tmp/pub.lock`)।
- `run.sh <name> <subj> <n>` = build + publish, `log_<name>.txt` के अंत में `EXIT 0`। `worker.sh` = `jobs.txt` से काम उठाने वाले कई worker (flock)। मशीन में 2 CPU; ~10 worker ठीक।
- `gen/*.py` — रात में स्क्रिप्ट बनाने वाले जनरेटर (common10/11/12.py, chhelp.py, hinhelp.py वग़ैरह) — उदाहरण के लिए।
- सबक़: बैकग्राउंड प्रोसेस टर्न ख़त्म होने के कुछ मिनट बाद मर जाते हैं — लंबे काम के समय टर्न को `sleep` + जाँच से ज़िंदा रखो। commit signing कभी अस्थायी रूप से फेल हो सकता है → दोबारा चलाओ।

## 4. अब तक क्या बना (13 नवंबर 2026, सुबह)
कुल **496 चैप्टर** साइट पर: कक्षा 9: 107 · 10: 106 · 11: 127 · 12: 156।
- **9:** विज्ञान 1–15 (ये **लंबे, 9–16 मिनट**, कहानी वाले — यही मनचाहा अंदाज़), गणित 15, English 17 (Panorama-I: prose 1–9, poem 10–17), SST 26, हिंदी 19 (गोधूलि), संस्कृत 15।
- **10:** विज्ञान 13, गणित 14, SST 26, हिंदी 24 (गोधूलि-2), English 15 (Panorama-II), संस्कृत 14 (पीयूषम्-2)।
- **11:** भौतिकी 14, रसायन 9, गणित 14, जीव 19, इतिहास 7, राजनीति 18, भूगोल 20, अर्थशास्त्र 16, व्यवसाय 10।
- **12:** भौतिकी 14, रसायन 10, गणित 13, जीव 13, इतिहास 12, राजनीति 15, भूगोल 17, अर्थशास्त्र 11, व्यवसाय 12, English 18 (Rainbow-2), हिंदी 21 (दिगंत-2)।
- **समस्या:** रात में बने वीडियो (9 विज्ञान को छोड़कर) सिर्फ़ **2–3 मिनट** के सार हैं। सर को **20–25 मिनट** की कहानी जैसी क्लास चाहिए।
- **नहीं बने:** 9 हिंदी — गद्य 10 'निबंध', 11 'सूखी नदी का पुल', पद्य 'मंझन के पद', 'पलक पाँवड़े', 'समुद्र' (किताब का भरोसेमंद text नहीं मिला); 10 English 'Once Upon a Time'; 12 English 'A Pinch of Snuff', 'A Child Born', 'The Earth'; 12 हिंदी गद्य 9, 11, पद्य 11–13; 11 English/हिंदी; लेखाशास्त्र। English supplementary reader भी नहीं।
- सामग्री Claude के ज्ञान से लिखी है — शिक्षक से जाँच करवाने की सलाह दी गई है। किताब की कविता/पाठ हूबहू नहीं, अपने शब्दों में।

## 5. अगला काम (इसी क्रम में, बिना पूछे)
1. **repos जोड़ो:** `dhamuchakonline/dhamuchakonline.github.io`, `class-9`, `class-9-a`, `class-9-b`, `class-11`, `class-12` — push access के साथ, `/home/claude/<repo>` में clone (मुख्य साइट को `/home/claude/dco` में)। पाइपलाइन `/home/claude/dco/_pipeline` से `/home/claude/videos` में कॉपी करो (या paths बदलो)।
2. **जगह ठीक करो:** class-9 repo के `c11/` और `c12/` वीडियो `class-11` और `class-12` repos में ले जाओ (`/class-11/<subject>/chNN.mp4`), `chapters.json` के `video` paths अपडेट करो, push करो, फिर class-9 से हटाओ। (class-9 का .git इतिहास बड़ा रहेगा — ठीक है।)
3. **publish.py का repo-नियम बदलो:** कक्षा 9 के नए लंबे वीडियो → `class-9-a` (≈850 MB तक), फिर `class-9-b`; 11 → `class-11`; 12 विज्ञान → `class-12`; बाक़ी पहले जैसा।
4. **एक नमूना 20–25 मिनट का वीडियो** बनाओ: कक्षा 9 विज्ञान का कोई चैप्टर नहीं (वो पहले से लंबे हैं) — **कक्षा 9 गणित अध्याय 1 'संख्या पद्धति'**। शैली 9 विज्ञान वाली: धामुचक के बच्चों (जैसे गाँव, खेत, बाज़ार) की कहानी से शुरुआत, हर बात धीरे-धीरे, उदाहरण, हल किए प्रश्न, सार, 5+ अभ्यास प्रश्न; narration में सूत्र शब्दों में बोलो। लगभग 60–90 scenes। `class-9-a` में publish करो (पुराना छोटा वीडियो उसी id पर बदल जाएगा)।
5. सर को लिंक भेजकर पूछो — "ऐसा ही चाहिए?" — उनकी हाँ/सुधार के बाद ही कक्षा 9 के सब चैप्टर लंबे बनाओ (गणित → विज्ञान 12–15 देखें → SST → English → हिंदी → संस्कृत), फिर 10, 11, 12। (कुल अनुमान: कक्षा 9 ≈ 1.7 GB, ≈ 1 दिन मशीन समय।)

## 6. 13 नवंबर 2026 (दिन) — हो गया
- ✅ काम 2: c11/c12 वीडियो class-11/class-12 में, chapters.json के 177 paths बदले, class-9 से हटाए।
- ✅ काम 3: publish.py का नया repo-नियम (पुराना वीडियो दूसरी जगह हो तो वहाँ से अपने-आप हटता है; push 3 बार कोशिश)।
