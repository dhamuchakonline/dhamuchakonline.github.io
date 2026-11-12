// डेटा और login का सारा काम यहाँ है (Firebase या डेमो)
import { DEMO, firebaseConfig, EMAIL_DOMAIN } from "./config.js";

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
  F = { appM, authM, fsM, app, auth: authM.getAuth(app), db: fsM.getFirestore(app), sec: null };
  return F;
}

// ---------- छोटे काम ----------
export const cleanRoll = (roll) => String(roll ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
export const keyOf = (cls, roll) => `${cls}_${cleanRoll(roll)}`;
export const randomPin = () => String(Math.floor(100000 + Math.random() * 900000));

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
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c)) return "PIN गलत है।";
  if (c.includes("too-many-requests")) return "बहुत बार गलत कोशिश हुई। थोड़ी देर बाद फिर कोशिश करें।";
  if (c.includes("network")) return "इंटरनेट चालू करके फिर कोशिश करें।";
  if (c.includes("weak-password")) return "PIN 6 अंक का होना चाहिए।";
  if (c.includes("invalid-email")) return "ईमेल सही नहीं है।";
  return "कुछ गड़बड़ हुई: " + ((e && e.message) || c);
}

function waitUser(F) {
  return new Promise((res) => {
    const un = F.authM.onAuthStateChanged(F.auth, (u) => { un(); res(u); });
  });
}

// ===================== डेमो मोड (बिना Firebase) =====================
const demo = (() => {
  const K = "uhs_demo_v2";
  const seed = {
    students: [{ uid: "d1", name: "राहुल कुमार", class: "10", roll: "1", key: "10_1", pin: "123456", active: true, bound: false },
      { uid: "d2", name: "प्रिया कुमारी", class: "11", stream: "arts", roll: "1", key: "11_1", pin: "123456", active: true, bound: false }],
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
  const pub = (s) => ({ uid: s.uid, name: s.name, class: s.class, roll: s.roll, stream: s.stream || "", key: s.key, active: s.active, bound: s.bound });
  const wait = (v) => new Promise((r) => setTimeout(() => r(v), 150));
  return {
    async studentLogin(cls, roll, pin) {
      const s = st.students.find((x) => x.key === keyOf(cls, roll));
      if (!s) throw new Error("यह रोल नंबर इस क्लास में पंजीकृत नहीं है।");
      if (s.pin !== String(pin).trim()) throw new Error("PIN गलत है।");
      if (!s.active) throw new Error("आपका खाता बंद है। टीचर से संपर्क करें।");
      s.bound = true; st.me = s.uid; save();
      return wait(pub(s));
    },
    async restoreStudent() { const s = st.students.find((x) => x.uid === st.me); return s && s.active ? pub(s) : null; },
    async logout() { st.me = null; st.teacher = false; save(); },
    async getClassChapters(cls) { return wait(st.chapters.filter((c) => c.class === cls).sort((a, b) => a.number - b.number)); },
    async teacherLogin(email, pass) {
      if (email.trim() !== "teacher@demo" || pass !== "123456") throw new Error("ईमेल या पासवर्ड गलत है।");
      st.teacher = true; save(); return { email };
    },
    async restoreTeacher() { return st.teacher ? { email: "teacher@demo" } : null; },
    async listStudents() { return wait(st.students.map(pub)); },
    async addStudent({ name, cls, roll, pin, stream }) {
      const key = keyOf(cls, roll);
      if (st.students.some((x) => x.key === key)) throw new Error("इस क्लास में यह रोल नंबर पहले से है।");
      st.students.push({ uid: "d" + Date.now(), name, class: cls, stream: stream || "", roll: cleanRoll(roll), key, pin, active: true, bound: false }); save();
    },
    async resetDevice(uid) { const s = st.students.find((x) => x.uid === uid); s.bound = false; save(); },
    async setActive(uid, a) { const s = st.students.find((x) => x.uid === uid); s.active = a; save(); },
    async newPin(stu, pin) { const s = st.students.find((x) => x.uid === stu.uid); s.pin = pin; s.bound = false; save(); },
    async removeStudent(stu) { st.students = st.students.filter((x) => x.uid !== stu.uid); save(); },
    async saveChapter(ch) {
      if (ch.id) Object.assign(st.chapters.find((x) => x.id === ch.id), ch);
      else st.chapters.push({ ...ch, id: "c" + Date.now() });
      save();
    },
    async deleteChapter(id) { st.chapters = st.chapters.filter((x) => x.id !== id); save(); }
  };
})();

// ===================== बच्चे (Student) =====================
async function checkBound(F, user) {
  const { doc, getDoc, updateDoc, serverTimestamp } = F.fsM;
  const ref = doc(F.db, "students", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("यह खाता स्कूल की लिस्ट में नहीं है।");
  const s = snap.data();
  if (!s.active) throw new Error("आपका खाता बंद है। टीचर से संपर्क करें।");
  const tok = await user.getIdTokenResult();
  const at = Number(tok.claims.auth_time);
  if (s.boundAuthTime == null) {
    await updateDoc(ref, { boundAuthTime: at, boundAt: serverTimestamp() });
  } else if (Number(s.boundAuthTime) !== at) {
    throw new Error("यह खाता किसी दूसरे मोबाइल पर चालू है। टीचर से \"Reset मोबाइल\" करवाएँ।");
  }
  return { uid: user.uid, name: s.name, class: s.class, roll: s.roll, stream: s.stream || "" };
}

export async function studentLogin(cls, roll, pin) {
  if (DEMO) return demo.studentLogin(cls, roll, pin);
  const F = await fb();
  const { doc, getDoc } = F.fsM;
  if (!cleanRoll(roll)) throw new Error("रोल नंबर डालें।");
  const m = await getDoc(doc(F.db, "logins", keyOf(cls, roll)));
  if (!m.exists()) throw new Error("यह रोल नंबर इस क्लास में पंजीकृत नहीं है।");
  let cred;
  try { cred = await F.authM.signInWithEmailAndPassword(F.auth, m.data().email, String(pin).trim()); }
  catch (e) { throw new Error(authErr(e)); }
  try { return await checkBound(F, cred.user); }
  catch (e) { await F.authM.signOut(F.auth); throw e; }
}

export async function restoreStudent() {
  if (DEMO) return demo.restoreStudent();
  const F = await fb();
  const u = await waitUser(F);
  if (!u) return null;
  try { return await checkBound(F, u); } catch { return null; }
}

export async function logout() {
  if (DEMO) return demo.logout();
  const F = await fb();
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
  const { doc, getDoc } = F.fsM;
  try { return (await getDoc(doc(F.db, "teachers", u.uid))).exists(); } catch { return false; }
}

export async function teacherLogin(email, pass) {
  if (DEMO) return demo.teacherLogin(email, pass);
  const F = await fb();
  let cred;
  try { cred = await F.authM.signInWithEmailAndPassword(F.auth, email.trim(), pass); }
  catch (e) { throw new Error(/PIN गलत/.test(authErr(e)) ? "ईमेल या पासवर्ड गलत है।" : authErr(e)); }
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
  if (!u || !(await isTeacherUser(F, u))) return null;
  return { email: u.email };
}

async function secAuth(F) {
  if (!F.sec) {
    const a2 = F.appM.initializeApp(firebaseConfig, "secondary");
    F.sec = F.authM.getAuth(a2);
    await F.authM.setPersistence(F.sec, F.authM.inMemoryPersistence);
  }
  return F.sec;
}

async function createAccount(F, cls, roll, pin) {
  const sec = await secAuth(F);
  const rnd = Math.random().toString(36).slice(2, 8);
  const email = `c${cls}r${cleanRoll(roll).toLowerCase()}.${rnd}@${EMAIL_DOMAIN}`;
  try {
    const c = await F.authM.createUserWithEmailAndPassword(sec, email, pin);
    const uid = c.user.uid;
    await F.authM.signOut(sec);
    return { uid, email };
  } catch (e) { throw new Error(authErr(e)); }
}

export async function listStudents() {
  if (DEMO) return demo.listStudents();
  const F = await fb();
  const { collection, getDocs } = F.fsM;
  const snap = await getDocs(collection(F.db, "students"));
  return snap.docs.map((d) => {
    const s = d.data();
    return { uid: d.id, name: s.name, class: s.class, roll: s.roll, stream: s.stream || "", key: s.key, active: !!s.active,
      bound: s.boundAuthTime != null, createdAt: s.createdAt || null };
  });
}

export async function addStudent({ name, cls, roll, pin, stream = "" }) {
  if (!name.trim() || !cls || !cleanRoll(roll)) throw new Error("नाम, क्लास और रोल नंबर भरें।");
  if (!/^\d{6}$/.test(pin)) throw new Error("PIN 6 अंक का होना चाहिए।");
  if (DEMO) return demo.addStudent({ name: name.trim(), cls, roll, pin, stream });
  const F = await fb();
  const { doc, getDoc, writeBatch, serverTimestamp } = F.fsM;
  const key = keyOf(cls, roll);
  if ((await getDoc(doc(F.db, "logins", key))).exists()) throw new Error("इस क्लास में यह रोल नंबर पहले से है।");
  const { uid, email } = await createAccount(F, cls, roll, pin);
  const b = writeBatch(F.db);
  b.set(doc(F.db, "students", uid), { name: name.trim(), class: cls, stream, roll: cleanRoll(roll), key, active: true,
    boundAuthTime: null, boundAt: null, createdAt: serverTimestamp() });
  b.set(doc(F.db, "logins", key), { email, uid });
  await b.commit();
}

export async function resetDevice(uid) {
  if (DEMO) return demo.resetDevice(uid);
  const F = await fb();
  await F.fsM.updateDoc(F.fsM.doc(F.db, "students", uid), { boundAuthTime: null, boundAt: null });
}

export async function setActive(uid, active) {
  if (DEMO) return demo.setActive(uid, active);
  const F = await fb();
  await F.fsM.updateDoc(F.fsM.doc(F.db, "students", uid), { active });
}

// नया PIN = नया खाता बनता है, पुराना अपने-आप बेकार हो जाता है
export async function newPin(stu, pin) {
  if (DEMO) return demo.newPin(stu, pin);
  const F = await fb();
  const { doc, writeBatch, serverTimestamp } = F.fsM;
  const { uid, email } = await createAccount(F, stu.class, stu.roll, pin);
  const b = writeBatch(F.db);
  b.set(doc(F.db, "students", uid), { name: stu.name, class: stu.class, stream: stu.stream || "", roll: stu.roll, key: stu.key, active: stu.active,
    boundAuthTime: null, boundAt: null, createdAt: serverTimestamp() });
  b.set(doc(F.db, "logins", stu.key), { email, uid });
  b.delete(doc(F.db, "students", stu.uid));
  await b.commit();
}

export async function removeStudent(stu) {
  if (DEMO) return demo.removeStudent(stu);
  const F = await fb();
  const { doc, writeBatch } = F.fsM;
  const b = writeBatch(F.db);
  b.delete(doc(F.db, "students", stu.uid));
  b.delete(doc(F.db, "logins", stu.key));
  await b.commit();
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
