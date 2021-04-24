import sys
import json
import time
import random
from datetime import datetime, timedelta
from dateutil import parser

COLORS = [
    "\033[31m",
    "\033[32m",
    "\033[33m",
    "\033[34m",
    "\033[35m",
    "\033[36m",
]
CLEAR_FORMAT = "\033[0m"

def has_badge(comment, badge):
    return "user_badges" in comment["message"].keys() and \
            len(list(filter(lambda x: x["_id"] == badge, comment["message"]["user_badges"]))) > 0

def convert_comment(comment):
    return {
        "timestamp": parser.parse(comment["created_at"]),
        "commenter": comment["commenter"]["display_name"],
        "body": comment["message"]["body"],
        "moderator": has_badge(comment, "moderator"),
        "subscriber": has_badge(comment, "subscriber")
    }

with open(sys.argv[1]) as f:
    comments = json.load(f)['comments']
try:
    hours, minutes, seconds = int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
    start_offset = hours*60*60 + minutes*60 + seconds
except IndexError:
    start_offset = 0


comments = sorted([convert_comment(comment) for comment in comments], key=lambda x: x["timestamp"])
start_time = datetime.now() - timedelta(seconds=start_offset)
first_comment_time = comments[0]["timestamp"]
for comment in comments:
    while (datetime.now() - start_time) < (comment["timestamp"] - first_comment_time):
        time.sleep(1)
    color = COLORS[hash(comment["commenter"]) % len(COLORS)]
    moderator = "⚔️ "  if comment["moderator"] else "  "
    subscriber = "🥚" if comment["subscriber"] else "  "
    print(f"{moderator}{subscriber} {color}{comment['commenter']}{CLEAR_FORMAT}: {comment['body']}")
    sys.stdout.flush()

