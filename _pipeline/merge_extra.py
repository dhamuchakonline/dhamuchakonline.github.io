# python3 merge_extra.py c10_hin_ch2  → extra/<name>.py की X scenes को scripts/<name>.py में 'सार' से पहले जोड़ता है
import sys, json, importlib.util
from pathlib import Path
P = Path(__file__).parent
def load(p):
    s = importlib.util.spec_from_file_location("m", p); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
for name in sys.argv[1:]:
    m = load(P / "scripts" / f"{name}.py"); x = load(P / "extra" / f"{name}.py")
    S = m.S
    if any(sc.get("_x") for sc in S):
        print(name, "already merged"); continue
    i = next((k for k, sc in enumerate(S) if sc["kind"] == "list" and sc.get("head") == "सार"), len(S) - 3)
    for sc in x.X: sc["_x"] = 1
    S = S[:i] + x.X + S[i:]
    out = "# long v3 (और लंबा)\nMETA = " + json.dumps(m.META, ensure_ascii=False) + "\nS = [\n" + "".join(json.dumps(sc, ensure_ascii=False) + ",\n" for sc in S) + "]\n"
    (P / "scripts" / f"{name}.py").write_text(out)
    print(name, len(S), "scenes", sum(len(sc.get("say", "")) for sc in S), "chars")
