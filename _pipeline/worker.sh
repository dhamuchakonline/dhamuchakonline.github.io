#!/bin/bash
# pulls jobs from jobs.txt (one "name subj n" per line) until empty file + no more lines
cd /home/claude/videos
while true; do
  job=$(flock jobs.lock bash -c 'l=$(head -1 jobs.txt); [ -n "$l" ] && sed -i 1d jobs.txt; echo "$l"')
  if [ -z "$job" ]; then sleep 30; [ -s jobs.txt ] || { [ -f jobs.stop ] && exit 0; }; continue; fi
  set -- $job
  [ -f "log_$1.txt" ] && grep -q "EXIT 0" "log_$1.txt" && continue
  ./run.sh $1 $2 $3
done
