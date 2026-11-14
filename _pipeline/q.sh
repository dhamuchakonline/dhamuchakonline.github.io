#!/bin/bash
# bash q.sh c11_phy_ch2 physics 2   → स्क्रिप्ट कॉपी, जाँच, queue में डालो
P=/home/claude/dco/_pipeline; V=/home/claude/videos
cp $P/scripts/$1.py $V/scripts/ && python3 $P/chk.py $1 && rm -f $V/log_$1.txt && flock $V/jobs.lock bash -c "echo '$1 $2 $3' >> $V/jobs.txt"
pgrep -f worker.sh >/dev/null || { cd $V; rm -f jobs.stop; for i in 1 2 3; do PYTHONPATH=$V/scripts nohup bash worker.sh >/dev/null 2>&1 & done; }
