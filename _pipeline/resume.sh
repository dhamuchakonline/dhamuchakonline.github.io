#!/bin/bash
# रिज़्यूम: repos, कार्यस्थल, jobs.txt फिर से बनाओ, 3 worker चालू करो
H=/home/claude
[ -d $H/dco/.git ] || git clone -q --depth 1 https://github.com/dhamuchakonline/dhamuchakonline.github.io $H/dco
for r in class-9 class-9-a class-9-b class-10 class-11 class-12; do
  [ -d $H/$r/.git ] || git clone -q --depth 1 https://github.com/dhamuchakonline/$r $H/$r
  git -C $H/$r pull -q --rebase 2>/dev/null
done
git -C $H/dco pull -q --rebase 2>/dev/null
P=$H/dco/_pipeline; V=$H/videos; mkdir -p $V
[ -f $V/build.py ] || { cp -r $P/build.py $P/publish.py $P/run.sh $P/worker.sh $P/chk.py $P/fonts $V/; pip install -q gTTS playwright --break-system-packages; }
cp $P/publish.py $V/; mkdir -p $V/scripts; cp -n $P/scripts/*.py $V/scripts/; cp $P/chk.py $H/chk.py
pkill -f worker.sh; pkill -f build.py; sleep 1
python3 - <<'PY'
import json
d=json.load(open('/home/claude/dco/chapters.json'))
done={x['id'] for x in d if any(r in x['video'] for r in ('/class-9-a/','/class-9-b/','/class-10/'))}
out=[]
for f in ('/home/claude/dco/_pipeline/jobs_pending.txt','/home/claude/dco/_pipeline/jobs_c10.txt'):
    for l in open(f):
        p=l.split()
        if len(p)<3: continue
        cid=f"c{p[0][1:p[0].index('_')]}_{p[1]}_{int(p[2]):02d}"
        if cid not in done and l.strip() not in out: out.append(l.strip())
open('/home/claude/videos/jobs.txt','w').write('\n'.join(out)+'\n')
print(len(out),'jobs')
PY
cd $V; rm -f log_*.txt
for i in 1 2 3; do PYTHONPATH=$V/scripts nohup bash worker.sh >/dev/null 2>&1 & done
sleep 2; echo "workers: $(pgrep -fc worker.sh)"
