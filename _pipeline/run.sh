#!/bin/bash
# usage: run.sh <name> <subject> <n>   — build, then publish (one publish at a time)
cd /home/claude/videos
python3 build.py "$1" > "log_$1.txt" 2>&1 && flock /tmp/pub.lock python3 publish.py "$1" "$2" "$3" >> "log_$1.txt" 2>&1
echo "EXIT $?" >> "log_$1.txt"
