# उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक — ऑनलाइन फ्री क्लास — चालू करने के आसान Steps (बिल्कुल मुफ़्त)

कुल समय: लगभग 30–40 मिनट, एक बार। आपको बस एक Gmail account चाहिए।
**सलाह:** ये काम मोबाइल पर भी हो सकता है, पर कंप्यूटर/लैपटॉप पर आसान रहेगा। मोबाइल पर Chrome में "Desktop site" चालू कर लें।

---

## भाग 1: Firebase (login और डेटा के लिए) — मुफ़्त

**Step 1 — Project बनाएँ**
1. https://console.firebase.google.com खोलें, अपने Gmail से login करें।
2. **"Create a project"** दबाएँ → नाम डालें: `uhs-dhamuchak` → Google Analytics बंद कर दें → Create।
3. Plan **Spark (Free)** ही रहने दें। कोई card/पैसा नहीं डालना है।

**Step 2 — Login चालू करें**
1. बाएँ मेनू में **Build → Authentication → Get started**।
2. **Sign-in method** में **Email/Password** चुनें → पहला बटन **Enable** करें → Save।

**Step 3 — Database बनाएँ**
1. **Build → Firestore Database → Create database**।
2. Location: **asia-south1 (Mumbai)** चुनें।
3. **Start in production mode** चुनें → Create।

**Step 4 — सुरक्षा नियम डालें (बहुत ज़रूरी)**
1. Firestore Database में ऊपर **Rules** टैब खोलें।
2. वहाँ जो लिखा है सब मिटा दें।
3. `firestore.rules` फ़ाइल का पूरा text copy करके paste करें → **Publish** दबाएँ।

**Step 5 — Config copy करें**
1. ऊपर बाएँ ⚙️ (Project settings) → नीचे **"Your apps"** → **</>** (Web) बटन।
2. नाम डालें `uhs-site` → Register app। (Hosting वाला box टिक न करें।)
3. स्क्रीन पर `firebaseConfig = { apiKey: ..., ... }` दिखेगा।
4. हमारी `config.js` फ़ाइल खोलें और वहाँ `firebaseConfig` के अंदर ये सारी values भर दें (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)।
   - ये values छुपाने वाली नहीं हैं, साइट की सुरक्षा Step 4 के नियमों से होती है।

**Step 6 — पहला टीचर बनाएँ**
1. **Authentication → Users → Add user** → टीचर का ईमेल और एक मज़बूत पासवर्ड डालें → Add user।
2. उस user की लाइन में **User UID** दिखेगा (जैसे `Xy12Ab...`) — उसे copy करें।
3. **Firestore Database → Data → + Start collection** → Collection ID: `teachers` → Next।
4. **Document ID** में वही UID paste करें। एक field जोड़ें: `name` = टीचर का नाम → Save।
5. और टीचर जोड़ने हों तो यही 1–4 दोहराएँ (collection पहले से बना होगा, बस "Add document")।

---

## भाग 2: साइट को Internet पर डालें — GitHub Pages (मुफ़्त)

1. https://github.com पर account बनाएँ (Gmail से)।
2. ऊपर **+ → New repository** → नाम: `uhs` → **Public** → Create।
3. **"uploading an existing file"** link दबाएँ → ये फ़ाइलें upload करें:
   `index.html, teacher.html, style.css, config.js, store.js, student.js, teacher.js, dialog.js`
   → नीचे **Commit changes**।
4. Repository में **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main**, folder **/(root)** → Save।
5. 1–2 मिनट बाद साइट का पता मिलेगा:
   - बच्चों के लिए: `https://आपका-username.github.io/uhs/`
   - टीचर पैनल: `https://आपका-username.github.io/uhs/teacher.html`

> कोड public होने से कोई ख़तरा नहीं — उसमें कोई PIN या पासवर्ड नहीं है। असली ताला Firebase के नियमों में है।

(कंप्यूटर हो तो दूसरा तरीका: Firebase Hosting — `npm i -g firebase-tools`, फिर इस फ़ोल्डर में `firebase login`, `firebase init hosting`, `firebase deploy`। पता होगा `uhs-dhamuchak.web.app`।)

---

## भाग 3: रोज़ का इस्तेमाल

**बच्चे जोड़ना** (टीचर पैनल → 👨‍🎓 बच्चे)
- नाम, कक्षा, रोल नंबर डालें (कक्षा 11–12 में संकाय भी: Science / Arts / Commerce) → PIN अपने-आप बनेगा → **जोड़ें**।
- जो PIN दिखे वो बच्चे को बताएँ। **ये सिर्फ एक बार दिखता है**, नोट कर लें।

**बच्चा login कैसे करेगा**
- साइट खोले → कक्षा, रोल नंबर, PIN डाले → जिस मोबाइल पर पहली बार खोला, खाता उसी से जुड़ जाएगा।
- वही PIN दूसरे मोबाइल (या दूसरे स्कूल के बच्चे) पर नहीं चलेगा।

**बटन क्या करते हैं**
| बटन | कब दबाएँ |
|---|---|
| 📱 Reset मोबाइल | बच्चे का फ़ोन बदला, या उसने "बाहर निकलें" दबा दिया |
| 🔑 नया PIN | बच्चा PIN भूल गया या PIN किसी और को पता चल गया |
| ⛔ Block | बच्चे को रोकना है (स्कूल छोड़ दिया आदि) |
| 🗑 हटाएँ | बच्चे को पूरी तरह लिस्ट से हटाना |

**चैप्टर और वीडियो जोड़ना** (टीचर पैनल → 🎬 चैप्टर / वीडियो)
1. YouTube पर वीडियो upload करें → Visibility: **Unlisted** (Public नहीं)।
2. वीडियो का **Share** link copy करें।
3. टीचर पैनल में कक्षा और विषय चुनें (11–12 में जो विषय कई संकाय में है — जैसे अर्थशास्त्र, गणित, भाषाएँ — उसका चैप्टर एक बार जोड़ें, सब संकाय में दिखेगा) → चैप्टर नंबर, नाम, link और नोट्स/कहानी डालें → **चैप्टर जोड़ें**।

**विषय बदलने हों तो:** `config.js` में विषयों की पूरी लिस्ट है (Bihar Board के सभी विषय डाले गए हैं)। स्कूल में कोई विषय नहीं पढ़ाया जाता तो वहाँ से हटा सकते हैं।

**ध्यान रखें**
- टीचर पैनल को बच्चे वाले मोबाइल पर न खोलें — वहाँ टीचर login करने से बच्चे का login हट जाएगा।
- बच्चे "बाहर निकलें" दबाएँगे तो दोबारा खोलने के लिए Reset मोबाइल करना होगा (ये जानबूझकर रखा है, ताकि PIN दूसरों में न बँटे)।
- Firebase का free plan एक स्कूल के लिए काफ़ी है (रोज़ 50,000 तक पढ़ाई-रिकॉर्ड)।
- Unlisted YouTube वीडियो का link कोई जानबूझकर निकाल कर भेज दे तो वहाँ चल सकता है — इसीलिए वीडियो पर बच्चे का नाम-रोल घूमता रहता है।
