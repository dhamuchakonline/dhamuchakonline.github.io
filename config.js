// ===================== स्कूल की सेटिंग =====================
// Firebase का config यहाँ भरें (SETUP-हिंदी.md का Step 5 देखें)।
// जब तक apiKey खाली है, साइट "डेमो मोड" में चलेगी।

export const SCHOOL_NAME = "उत्क्रमित उच्च माध्यमिक विद्यालय, धामुचक";
export const TAGLINE = "धामुचक स्कूल के बच्चों के लिए ऑनलाइन फ्री क्लास";

export const firebaseConfig = {
  apiKey: "AIzaSyA2XdM2Mbf-csvwU9tS0LaSztXK8Vm1qKU",
  authDomain: "uhs-dhamuchak.firebaseapp.com",
  projectId: "uhs-dhamuchak",
  storageBucket: "uhs-dhamuchak.firebasestorage.app",
  messagingSenderId: "445252441004",
  appId: "1:445252441004:web:3d7b3063e1f72eb559a009"
};

export const DEMO = !firebaseConfig.apiKey;

// बच्चों के login के लिए अंदरूनी ईमेल (बच्चों को नहीं दिखता, बदलने की ज़रूरत नहीं)
export const EMAIL_DOMAIN = "uhsdhamuchak.school";

export const CLASSES = ["9", "10", "11", "12"];

// कक्षा 11–12 के संकाय (Stream)
export const STREAMS = [
  { id: "science", name: "विज्ञान", en: "Science", icon: "🔬" },
  { id: "arts", name: "कला", en: "Arts", icon: "🎨" },
  { id: "commerce", name: "वाणिज्य", en: "Commerce", icon: "💼" }
];
export const hasStreams = (cls) => cls === "11" || cls === "12";

// ---------- विषय (Bihar Board) ----------
// एक ही id वाला विषय हर जगह एक ही किताब है (जैसे अर्थशास्त्र Arts और Commerce दोनों में),
// इसलिए उसके चैप्टर एक बार जोड़ने पर दोनों जगह दिखेंगे।
const s = (id, name, icon) => ({ id, name, icon });

// कक्षा 9–10
const G910 = [
  { title: "मुख्य विषय", items: [
    s("maths", "गणित", "➗"), s("science", "विज्ञान", "🔬"), s("social", "सामाजिक विज्ञान", "🌍"), s("english", "English", "🔤")] },
  { title: "मातृभाषा", items: [
    s("hindi", "हिन्दी", "📖"), s("urdu", "उर्दू", "✒️"), s("bangla", "बांग्ला", "📗"), s("maithili", "मैथिली", "📘")] },
  { title: "द्वितीय भारतीय भाषा", items: [
    s("sanskrit", "संस्कृत", "📜"), s("arabic", "अरबी", "📙"), s("persian", "फ़ारसी", "📕"), s("bhojpuri", "भोजपुरी", "📒")] },
  { title: "ऐच्छिक विषय", items: [
    s("highermaths", "उच्च गणित", "📐"), s("economics", "अर्थशास्त्र", "📊"), s("commerce", "वाणिज्य", "🧾"),
    s("homescience", "गृह विज्ञान", "🏠"), s("music", "संगीत", "🎵"), s("dance", "नृत्य", "💃"),
    s("finearts", "चित्रकला / ललित कला", "🖌️"), s("computer", "कंप्यूटर विज्ञान", "💻"), s("yoga", "योग एवं शारीरिक शिक्षा", "🧘")] }
];

// कक्षा 11–12 की भाषाएँ (तीनों संकाय में)
const LANG1112 = { title: "भाषा", items: [
  s("hindi", "हिन्दी", "📖"), s("english", "English", "🔤"), s("urdu", "उर्दू", "✒️"), s("maithili", "मैथिली", "📘"),
  s("sanskrit", "संस्कृत", "📜"), s("prakrit", "प्राकृत", "📃"), s("magahi", "मगही", "📗"), s("bhojpuri", "भोजपुरी", "📒"),
  s("arabic", "अरबी", "📙"), s("persian", "फ़ारसी", "📕"), s("pali", "पालि", "🪷"), s("bangla", "बांग्ला", "📓")] };

const EXTRA1112 = { title: "अतिरिक्त / ऐच्छिक", items: [
  s("computer", "कंप्यूटर विज्ञान", "💻"), s("multimedia", "मल्टीमीडिया एवं वेब टेक्नोलॉजी", "🌐"),
  s("yoga", "योग एवं शारीरिक शिक्षा", "🧘")] };

const G1112 = {
  science: [
    { title: "मुख्य विषय", items: [
      s("physics", "भौतिकी", "⚛️"), s("chemistry", "रसायन विज्ञान", "🧪"), s("biology", "जीव विज्ञान", "🧬"),
      s("maths", "गणित", "➗"), s("agriculture", "कृषि", "🌾")] },
    LANG1112, EXTRA1112],
  arts: [
    { title: "मुख्य विषय", items: [
      s("history", "इतिहास", "🏛️"), s("geography", "भूगोल", "🗺️"), s("polsci", "राजनीति विज्ञान", "⚖️"),
      s("economics", "अर्थशास्त्र", "📊"), s("sociology", "समाजशास्त्र", "👥"), s("psychology", "मनोविज्ञान", "🧠"),
      s("philosophy", "दर्शनशास्त्र", "💭"), s("homescience", "गृह विज्ञान", "🏠"), s("music", "संगीत", "🎵"),
      s("maths", "गणित", "➗")] },
    LANG1112, EXTRA1112],
  commerce: [
    { title: "मुख्य विषय", items: [
      s("accountancy", "लेखाशास्त्र", "📒"), s("business", "व्यवसाय अध्ययन", "💼"),
      s("economics", "अर्थशास्त्र", "📊"), s("entrepreneurship", "उद्यमिता", "🚀")] },
    LANG1112, EXTRA1112]
};

// किसी कक्षा (और संकाय) के विषय, समूह के साथ
export function subjectGroups(cls, stream) {
  if (!hasStreams(cls)) return G910;
  return G1112[stream] || [];
}

// किसी कक्षा के सारे विषय (बिना दोहराए) — टीचर पैनल के लिए
export function allSubjects(cls) {
  const groups = hasStreams(cls) ? STREAMS.flatMap((st) => G1112[st.id]) : G910;
  const seen = new Map();
  groups.forEach((g) => g.items.forEach((it) => { if (!seen.has(it.id)) seen.set(it.id, it); }));
  return [...seen.values()];
}

export const subjectById = (cls, id) => allSubjects(cls).find((x) => x.id === id);
