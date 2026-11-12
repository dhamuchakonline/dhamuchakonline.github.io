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

**ज़रूरी (एक बार):** Firebase → Authentication → Sign-in method → **Add new provider → Anonymous → Enable → Save**।

**स्कूल कोड डालना** (टीचर पैनल → 🔑 कोड / बच्चे)
- स्कूल का UDISE कोड डालकर **सेव करें**। जब तक कोड नहीं डाला, बच्चे login नहीं कर पाएँगे।
- कोड बदलने पर पहले से login सभी बच्चे बाहर हो जाते हैं।
- नीचे दिखता है कि कौन-कौन बच्चा (नाम, कक्षा, समय) login है।

**बच्चा login कैसे करेगा**
- साइट खोले → अपना नाम, कक्षा और स्कूल का UDISE कोड डाले → उसकी कक्षा के विषय खुल जाएँगे।
- कक्षा 11–12 के बच्चे पहले अपना संकाय (Science / Arts / Commerce) चुनेंगे।

**चैप्टर और वीडियो जोड़ना** (टीचर पैनल → 🎬 चैप्टर / वीडियो)
1. YouTube पर वीडियो upload करें → Visibility: **Unlisted**।
2. वीडियो का **Share** link copy करें।
3. टीचर पैनल में कक्षा और विषय चुनें → चैप्टर नंबर, नाम, link और नोट्स डालें → **चैप्टर जोड़ें**।

**ध्यान रखें**
- UDISE कोड सरकारी वेबसाइटों पर खुला मिलता है। जो भी ये कोड जानता है, वो साइट खोल सकता है। ज़्यादा सुरक्षा चाहिए तो UDISE की जगह अपना कोई गुप्त कोड रखें और सिर्फ अपने बच्चों को बताएँ।
- `config.js` में विषयों की पूरी लिस्ट है, ज़रूरत हो तो वहीं बदलें।
