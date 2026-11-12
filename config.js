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
const s = (id, name, en, icon) => ({ id, name, en, icon });
// "हिन्दी (Hindi)" जैसा पूरा नाम
export const subjLabel = (x) => (x ? `${x.name} (${x.en})` : "");

// कक्षा 9–10
const G910 = [
  { title: "मुख्य विषय (Main Subjects)", items: [
    s("maths", "गणित", "Mathematics", "➗"), s("science", "विज्ञान", "Science", "🔬"), s("social", "सामाजिक विज्ञान", "Social Science", "🌍"), s("english", "English", "अंग्रेज़ी", "🔤")] },
  { title: "मातृभाषा (Mother Tongue)", items: [
    s("hindi", "हिन्दी", "Hindi", "📖"), s("urdu", "उर्दू", "Urdu", "✒️"), s("bangla", "बांग्ला", "Bangla", "📗"), s("maithili", "मैथिली", "Maithili", "📘")] },
  { title: "द्वितीय भारतीय भाषा (Second Indian Language)", items: [
    s("sanskrit", "संस्कृत", "Sanskrit", "📜"), s("arabic", "अरबी", "Arabic", "📙"), s("persian", "फ़ारसी", "Persian", "📕"), s("bhojpuri", "भोजपुरी", "Bhojpuri", "📒")] },
  { title: "ऐच्छिक विषय (Optional Subjects)", items: [
    s("highermaths", "उच्च गणित", "Higher Mathematics", "📐"), s("economics", "अर्थशास्त्र", "Economics", "📊"), s("commerce", "वाणिज्य", "Commerce", "🧾"),
    s("homescience", "गृह विज्ञान", "Home Science", "🏠"), s("music", "संगीत", "Music", "🎵"), s("dance", "नृत्य", "Dance", "💃"),
    s("finearts", "चित्रकला / ललित कला", "Painting / Fine Arts", "🖌️"), s("computer", "कंप्यूटर विज्ञान", "Computer Science", "💻"), s("yoga", "योग एवं शारीरिक शिक्षा", "Yoga & Physical Education", "🧘")] }
];

// कक्षा 11–12 की भाषाएँ (तीनों संकाय में)
const LANG1112 = { title: "भाषा (Languages)", items: [
  s("hindi", "हिन्दी", "Hindi", "📖"), s("english", "English", "अंग्रेज़ी", "🔤"), s("urdu", "उर्दू", "Urdu", "✒️"), s("maithili", "मैथिली", "Maithili", "📘"),
  s("sanskrit", "संस्कृत", "Sanskrit", "📜"), s("prakrit", "प्राकृत", "Prakrit", "📃"), s("magahi", "मगही", "Magahi", "📗"), s("bhojpuri", "भोजपुरी", "Bhojpuri", "📒"),
  s("arabic", "अरबी", "Arabic", "📙"), s("persian", "फ़ारसी", "Persian", "📕"), s("pali", "पालि", "Pali", "🪷"), s("bangla", "बांग्ला", "Bangla", "📓")] };

const EXTRA1112 = { title: "अतिरिक्त / ऐच्छिक (Additional / Optional)", items: [
  s("computer", "कंप्यूटर विज्ञान", "Computer Science", "💻"), s("multimedia", "मल्टीमीडिया एवं वेब टेक्नोलॉजी", "Multimedia & Web Technology", "🌐"),
  s("yoga", "योग एवं शारीरिक शिक्षा", "Yoga & Physical Education", "🧘")] };

const G1112 = {
  science: [
    { title: "मुख्य विषय (Main Subjects)", items: [
      s("physics", "भौतिकी", "Physics", "⚛️"), s("chemistry", "रसायन विज्ञान", "Chemistry", "🧪"), s("biology", "जीव विज्ञान", "Biology", "🧬"),
      s("maths", "गणित", "Mathematics", "➗"), s("agriculture", "कृषि", "Agriculture", "🌾")] },
    LANG1112, EXTRA1112],
  arts: [
    { title: "मुख्य विषय (Main Subjects)", items: [
      s("history", "इतिहास", "History", "🏛️"), s("geography", "भूगोल", "Geography", "🗺️"), s("polsci", "राजनीति विज्ञान", "Political Science", "⚖️"),
      s("economics", "अर्थशास्त्र", "Economics", "📊"), s("sociology", "समाजशास्त्र", "Sociology", "👥"), s("psychology", "मनोविज्ञान", "Psychology", "🧠"),
      s("philosophy", "दर्शनशास्त्र", "Philosophy", "💭"), s("homescience", "गृह विज्ञान", "Home Science", "🏠"), s("music", "संगीत", "Music", "🎵"),
      s("maths", "गणित", "Mathematics", "➗")] },
    LANG1112, EXTRA1112],
  commerce: [
    { title: "मुख्य विषय (Main Subjects)", items: [
      s("accountancy", "लेखाशास्त्र", "Accountancy", "📒"), s("business", "व्यवसाय अध्ययन", "Business Studies", "💼"),
      s("economics", "अर्थशास्त्र", "Economics", "📊"), s("entrepreneurship", "उद्यमिता", "Entrepreneurship", "🚀")] },
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
