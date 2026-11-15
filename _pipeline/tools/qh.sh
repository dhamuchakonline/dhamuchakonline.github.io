#!/bin/bash
# prepend job: qh.sh name subject n
P=/home/claude/dco/_pipeline; V=/home/claude/videos
cp $P/scripts/$1.py $V/scripts/ && python3 $P/chk.py $1 && rm -f $V/log_$1.txt && flock $V/jobs.lock bash -c "grep -v '^$1 ' $V/jobs.txt > $V/j.tmp; { echo '$1 $2 $3'; cat $V/j.tmp; } > $V/jobs.txt"
