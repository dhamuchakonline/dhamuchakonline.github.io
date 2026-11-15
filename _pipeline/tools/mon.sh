#!/bin/bash
# sleep, then check workers + requeue failed
sleep ${1:-540}
V=/home/claude/videos; cd $V
n=$(pgrep -f worker.sh|wc -l)
if [ $n -lt 3 ]; then pkill -f worker.sh; rm -f jobs.stop; for i in 1 2 3; do PYTHONPATH=$V/scripts setsid nohup bash worker.sh >/dev/null 2>&1 </dev/null & done; echo "restarted"; fi
for f in $(grep -l "EXIT [1-9]" log_*.txt 2>/dev/null); do nm=${f#log_}; nm=${nm%.txt}; grep -q "^$nm " jobs.txt && continue; echo "FAIL $nm: $(grep -v EXIT $f|tail -1|cut -c1-80)"; done
echo "workers=$(pgrep -f worker.sh|wc -l) jobs=$(wc -l <jobs.txt) done_last=$(ls -t log_*|head -1)"
