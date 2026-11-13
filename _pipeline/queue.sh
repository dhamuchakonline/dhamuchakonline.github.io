#!/bin/bash
# usage: queue.sh "name subj n" "name subj n" ...
cd /home/claude/videos
for job in "$@"; do set -- $job; [ -f "log_$1.txt" ] && grep -q "EXIT 0" "log_$1.txt" && continue; ./run.sh $1 $2 $3; done
