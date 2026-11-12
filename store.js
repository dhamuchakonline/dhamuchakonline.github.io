// डेटा और login का सारा काम यहाँ है (Firebase या डेमो)
// बच्चे: नाम + कक्षा + स्कूल का UDISE कोड → साइट खुलती है
// टीचर: ईमेल + पासवर्ड → UDISE कोड बदलना, कौन पढ़ रहा है देखना, चैप्टर/वीडियो जोड़ना
import { DEMO, firebaseConfig } from "./config.js";

const CDN = "https://www.gstatic.com/firebasejs/10.12.2";
let F = null;

async function fb() {
  if (F) return F;
  const [appM, authM, fsM] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-auth.js`),
    import(`${CDN}/firebase-firestore.js`)
  ]);
  const app = appM.initializeApp(firebaseConfig);
  F = { appM, authM, fsM, app, auth: authM.getAuth(app), db: fsM.getFirestore(app) };
  return F;
}

// ---------- छोटे काम ----------
export const cleanCode = (c) => String(c ?? "").trim().replace(/[^0-9A-Za-z]/g, "");

export function ytId(s) {
  s = String(s || "").trim();
  if (!s) return "";
  const m = s.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  return null;
}

function authErr(e) {
  const c = (e && e.code) || "";
  if (/invalid-credential|wrong-password|user-not-found|invalid-login|invalid-email/.test(c)) return "ईमेल या पासवर्ड गलत है।";
  if (c.includes("too-many-requests")) return "बहुत बार गलत कोशिश हुई। थोड़ी देर बाद फिर कोशिश करें।";
  if (c.includes("network")) return "इंटरनेट चालू करके फिर कोशिश करें।";
  if (c.includes("operation-not-allowed") || c.includes("admin-restricted")) return "Firebase में \"Anonymous\" login चालू नहीं है। टीचर से संपर्क करें।";
  return "कुछ गड़बड़ हुई: " + ((e && e.message) || c);
}

function waitUser(F) {
  return new Promise((res) => {
    const un = F.authM.onAuthStateChanged(F.auth, (u) => { un(); res(u); });
  });
}

// ===================== डेमो मोड (बिना Firebase) =====================
const demo = (() => {
  const K = "uhs_demo_v3";
  const seed = {
    code: "10010203040",
    sessions: [],
    chapters: [
      { id: "c1", class: "10", subject: "science", number: 1, title: "रासायनिक अभिक्रियाएँ एवं समीकरण", youtubeId: "",
        notes: "कहानी से समझें: सुबह माँ दूध गरम करती हैं और कुछ देर बाद दूध फट जाता है। रंग बदला, गंध बदली, और अब वो वापस पहले जैसा दूध नहीं बन सकता। यही है रासायनिक अभिक्रिया — जब पदार्थ बदलकर बिल्कुल नया पदार्थ बन जाए।\n\nपहचान के निशान: रंग बदलना, गैस निकलना, गर्मी पैदा होना, तापमान बदलना या अवक्षेप (ठोस) बनना।\n\n(यह डेमो नोट है। असली साइट में टीचर हर चैप्टर का पूरा वीडियो और नोट्स डालेंगे।)" },
      { id: "c2", class: "10", subject: "science", number: 2, title: "अम्ल, क्षारक एवं लवण", youtubeId: "", notes: "डेमो चैप्टर।" },
      { id: "c3", class: "11", subject: "economics", number: 1, title: "डेमो चैप्टर — अर्थशास्त्र", youtubeId: "", notes: "यह चैप्टर Arts और Commerce दोनों में दिखेगा, क्योंकि किताब एक ही है।" }
    ],
    me: null, teacher: false
  };
  let st;
  try { st = JSON.parse(localStorage.getItem(K)) || seed; } catch { st = seed; }
  const save = () => { try { localStorage.setItem(K, JSON.stringify(st)); } catch {} };
  const wait = (v) => new Promise((r) => setTimeout(() => r(v), 150));
  return {
    async studentLogin(name, cls, code) {
      if (cleanCode(code) !== st.code) throw new Error("UDISE कोड गलत है। अपने स्कूल का सही कोड डालें।");
      st.me = { name: name.trim(), class: cls, code: st.code };
      st.sessions.unshift({ id: "s" + Date.now(), name: name.trim(), class: cls, at: Date.now() });
      save(); return wait({ name: st.me.name, class: cls });
    },
    async restoreStudent() { return st.me && st.me.code === st.code ? { name: st.me.name, class: st.me.class } : null; },
    async logout() { st.me = null; st.teacher = false; save(); },
    async getClassChapters(cls) { return wait(st.chapters.filter((c) => c.class === cls).sort((a, b) => a.number - b.number)); },
    async teacherLogin(email, pass) {
      if (email.trim() !== "teacher@demo" || pass !== "123456") throw new Error("ईमेल या पासवर्ड गलत है।");
      st.teacher = true; save(); return { email };
    },
    async restoreTeacher() { return st.teacher ? { email: "teacher@demo" } : null; },
    async getCode() { return st.code; },
    async setCode(c) { st.code = c; save(); },
    async listSessions() { return wait(st.sessions.slice(0, 200).map((s) => ({ ...s, at: new Date(s.at) }))); },
    async saveChapter(ch) {
      if (ch.id) Object.assign(st.chapters.find((x) => x.id === ch.id), ch);
      else st.chapters.push({ ...ch, id: "c" + Date.now() });
      save();
    },
    async deleteChapter(id) { st.chapters = st.chapters.filter((x) => x.id !== id); save(); }
  };
})();

// ===================== बच्चे (Student) =====================
async function checkSession(F, user) {
  const { doc, getDoc } = F.fsM;
  const s = await getDoc(doc(F.db, "sessions", user.uid));
  if (!s.exists()) return null;
  const d = s.data();
  const ok = await getDoc(doc(F.db, "access", d.code));   // कोड बदल गया हो तो पुराना login बंद
  if (!ok.exists()) return null;
  return { name: d.name, class: d.class };
}

export async function studentLogin(name, cls, code) {
  name = String(name || "").trim();
  code = cleanCode(code);
  if (!name) throw new Error("अपना नाम लिखें।");
  if (!cls) throw new Error("अपनी कक्षा चुनें।");
  if (!code) throw new Error("स्कूल का UDISE कोड डालें।");
  if (DEMO) return demo.studentLogin(name, cls, code);
  const F = await fb();
  const { doc, getDoc, setDoc, serverTimestamp } = F.fsM;
  let ok;
  try { ok = await getDoc(doc(F.db, "access", code)); }
  catch (e) { throw new Error("इंटरनेट चालू करके फिर कोशिश करें।"); }
  if (!ok.exists()) throw new Error("UDISE कोड गलत है। अपने स्कूल का सही कोड डालें।");
  let user = F.auth.currentUser;
  try { if (!user || !user.isAnonymous) user = (await F.authM.signInAnonymously(F.auth)).user; }
  catch (e) { throw new Error(authErr(e)); }
  await setDoc(doc(F.db, "sessions", user.uid), { name: name.slice(0, 50), class: cls, code, at: serverTimestamp() });
  return { name: name.slice(0, 50), class: cls };
}

export async function restoreStudent() {
  if (DEMO) return demo.restoreStudent();
  const F = await fb();
  const u = await waitUser(F);
  if (!u || !u.isAnonymous) return null;
  try { return await checkSession(F, u); } catch { return null; }
}

export async function logout() {
  if (DEMO) return demo.logout();
  const F = await fb();
  const u = F.auth.currentUser;
  if (u && u.isAnonymous) { try { await F.fsM.deleteDoc(F.fsM.doc(F.db, "sessions", u.uid)); } catch {} }
  await F.authM.signOut(F.auth);
}

export async function getClassChapters(cls) {
  if (DEMO) return demo.getClassChapters(cls);
  const F = await fb();
  const { collection, query, where, getDocs } = F.fsM;
  const snap = await getDocs(query(collection(F.db, "chapters"), where("class", "==", cls)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.number || 0) - (b.number || 0));
}

// ===================== टीचर (Teacher) =====================
async function isTeacherUser(F, u) {
  if (!u || u.isAnonymous) return false;
  const { doc, getDoc } = F.fsM;
  try { return (await getDoc(doc(F.db, "teachers", u.uid))).exists(); } catch { return false; }
}

export async function teacherLogin(email, pass) {
  if (DEMO) return demo.teacherLogin(email, pass);
  const F = await fb();
  let cred;
  try { cred = await F.authM.signInWithEmailAndPassword(F.auth, email.trim(), pass); }
  catch (e) { throw new Error(authErr(e)); }
  if (!(await isTeacherUser(F, cred.user))) {
    await F.authM.signOut(F.auth);
    throw new Error("यह खाता टीचर लिस्ट में नहीं है।");
  }
  return { email: cred.user.email };
}

export async function restoreTeacher() {
  if (DEMO) return demo.restoreTeacher();
  const F = await fb();
  const u = await waitUser(F);
  if (!(await isTeacherUser(F, u))) return null;
  return { email: u.email };
}

// अभी का स्कूल कोड
export async function getCode() {
  if (DEMO) return demo.getCode();
  const F = await fb();
  const snap = await F.fsM.getDocs(F.fsM.collection(F.db, "access"));
  return snap.empty ? "" : snap.docs[0].id;
}

// कोड बदलना: पुराना कोड हट जाता है, पुराने सारे बच्चों का login भी बंद हो जाता है
export async function setCode(code) {
  code = cleanCode(code);
  if (code.length < 4) throw new Error("कोड कम से कम 4 अंक/अक्षर का होना चाहिए।");
  if (DEMO) return demo.setCode(code);
  const F = await fb();
  const { collection, getDocs, doc, writeBatch, serverTimestamp } = F.fsM;
  const old = await getDocs(collection(F.db, "access"));
  const b = writeBatch(F.db);
  old.docs.forEach((d) => { if (d.id !== code) b.delete(d.ref); });
  b.set(doc(F.db, "access", code), { at: serverTimestamp() });
  await b.commit();
}

// कौन-कौन बच्चे login हैं (नए पहले)
export async function listSessions() {
  if (DEMO) return demo.listSessions();
  const F = await fb();
  const snap = await F.fsM.getDocs(F.fsM.collection(F.db, "sessions"));
  return snap.docs.map((d) => {
    const s = d.data();
    return { id: d.id, name: s.name, class: s.class, at: s.at && s.at.toDate ? s.at.toDate() : null };
  }).sort((a, b) => (b.at || 0) - (a.at || 0));
}

export async function saveChapter(ch) {
  const data = { class: ch.class, subject: ch.subject, number: Number(ch.number) || 0, title: ch.title.trim(),
    youtubeId: ch.youtubeId || "", notes: ch.notes || "" };
  if (!data.title) throw new Error("चैप्टर का नाम भरें।");
  if (DEMO) return demo.saveChapter({ ...data, id: ch.id });
  const F = await fb();
  const { doc, collection, setDoc, addDoc } = F.fsM;
  if (ch.id) await setDoc(doc(F.db, "chapters", ch.id), data);
  else await addDoc(collection(F.db, "chapters"), data);
}

export async function deleteChapter(id) {
  if (DEMO) return demo.deleteChapter(id);
  const F = await fb();
  await F.fsM.deleteDoc(F.fsM.doc(F.db, "chapters", id));
}
