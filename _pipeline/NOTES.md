# रात का काम — कैसे करना है (अपने लिए नोट)
- साइट: https://dhamuchakonline.github.io/ (repo /home/claude/dco = dhamuchakonline/dhamuchakonline.github.io)
- वीडियो रखने के repo: /home/claude/class-9 (dhamuchakonline/class-9, Pages चालू)। class-10/11/12 अभी नहीं बने → उन कक्षाओं के वीडियो मुख्य repo में जाएँगे (publish.py अपने-आप चुनता है)।
- हर चैप्टर: c<कक्षा>_<विषय>_ch<n>.py लिखो (META + S scenes; kinds: title, content, list, eq, big, compare, question, balance, table, end)
  → python3 build.py <name>  (Google हिंदी आवाज़ gTTS, ~10–16 मिनट, *_web.mp4 बनती है)
  → python3 publish.py <name> <subject_id> <n>   (subject_id config.js वाले: science, maths, english, hindi …)
- शुरुआत अपने-आप: "उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक के बच्चों, आपका स्वागत है! आज हम <subject_say> का <chapter_say>, <title>, शुरू करते हैं। तो चलिए, शुरू करते हैं!"
- हर चैप्टर: धामुचक के बच्चे की कहानी से शुरू, प्रयोग, तालिका, सार, 5 अभ्यास प्रश्न ("..." से पहले सवाल, बाद में जवाब)। narration में सूत्र शब्दों में बोलो।
- किताब का text/कविता हूबहू नहीं — अपने शब्दों में।
- कक्षा 9 विज्ञान क्रम: 1 पदार्थ ✅ 2 शुद्ध ✅ 3 परमाणु-अणु ✅ 4 परमाणु संरचना ✅ 5 कोशिका ✅ 6 ऊतक ✅ 7 विविधता ✅ 8 गति ✅ 9 बल व गति के नियम ✅ 10 गुरुत्वाकर्षण ✅ 11 कार्य और ऊर्जा ✅ 12 ध्वनि 13 हम बीमार क्यों होते हैं 14 प्राकृतिक संपदा 15 खाद्य संसाधनों में सुधार
- फिर कक्षा 9 गणित (NCERT क्रम: संख्या पद्धति, बहुपद, निर्देशांक ज्यामिति, दो चरों वाले रैखिक समीकरण, यूक्लिड ज्यामिति, रेखाएँ और कोण, त्रिभुज, चतुर्भुज, वृत्त, हीरोन सूत्र, पृष्ठीय क्षेत्रफल और आयतन, सांख्यिकी), फिर English, हिन्दी (चैप्टर लिस्ट पहले WebSearch से पक्की करो), फिर कक्षा 10, 11, 12।
- रात में SendUserMessage मत भेजो (अंकुश सर ने कहा: परेशान मत करो)। सिर्फ़ 7:45 वाली आख़िरी बारी में सुबह का हिसाब भेजना है। कुछ मत पूछो।

## रात 00:40 अपडेट (स्वचालित)
- स्क्रिप्ट जनरेटर: /tmp/gen/*.py (common10.py = हेल्पर)। queue.sh "name subj n" ... = क्रम से build+publish, EXIT 0 वाले छोड़ देता है।
- कक्षा 9: science 1-15, maths 1-15, english 1-17 (prose1-9, poem 10-17), social 1-26 (इतिहास1-8, भूगोल9-14, राजनीति15-20, अर्थ21-26), hindi 19 (गद्य 1-9,12; पद्य 13,15,17-22,24), sanskrit 1-15
- बाक़ी हिंदी (रिसर्च नहीं मिला): गद्य10 निबंध, गद्य11 सूखी नदी का पुल, पद्य14 मंझन, पद्य16 पलक पाँवड़े, पद्य23 समुद्र
- कक्षा 10 (dco/videos/c10 में): science 1-13, maths 1-14, social 1-20 (इतिहास1-8, राजनीति9-13, अर्थ14-20)
- build.py: audio 48k, META title_say सपोर्ट

## 04:00 IST progress
- नए scripts: c11 (phy 14, chem 9, math 14, bio 19, his 7, pol 18, geo 20, eco 16, bus 10), c12 (phy 14, chem 10, math 13, bio 13, his 12, pol 15, geo 17, eco 11, bus 12, eng 19 — Prose 3 'A Pinch of Snuff', 7 'A Child Born', 9 'The Earth' छोड़े: पक्की जानकारी नहीं), c10 (hin 24, eng 15 — Prose 6 'Once Upon a Time' छोड़ा, san 14).
- jobs.txt + worker.sh (flock) से नई queue; queue.sh lanes पुराने।
- publish.py: c12 कला/वाणिज्य → dco repo (videos/c12/...) ताकि class-9 repo 1GB से कम रहे।
- c11_phy_ch5 log EXIT 1 पर chapters.json में मौजूद है (commit-sign MCP अस्थायी दिक्कत थी)।

## 05:00 IST — सब build पूरे
- chapters.json: 496 चैप्टर (9:107, 10:106, 11:127, 12:156), सब push हो चुके।
- c12 हिंदी (दिगंत 2): गद्य 9 'प्रगीत और समाज', 11 'हँसते हुए मेरा अकेलापन' और पद्य 11–13 नहीं बने।
- 07:40 पर सारांश संदेश के लिए scheduled reminder लगा है।
