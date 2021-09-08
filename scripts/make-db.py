from queries import *

import sqlite3
import json
import gzip
import glob
import sys
import re


def duration_seconds(durationText):
    groups = re.match(r"((\d+)h)?((\d+)m)?(\d+)s", durationText).groups()
    return 60 * 60 * (int(groups[1] or 0)) + 60 * (int(groups[3] or 0)) + int(groups[4])

def convert_commenter(commenter):
    if commenter is None:
        return None
    return {
        "twitchID": commenter["_id"],
        "displayName": commenter["display_name"],
        "name": commenter["name"],
        "bio": commenter["bio"],
        "logo": commenter.get("logo"),
        "type": commenter.get("type"),
        "createdAt": commenter["created_at"],
        "updatedAt": commenter["updated_at"],
    }

def convert_content(content):
    return {
        "twitchID": content["id"],
        "userID": content["user_id"],
        "username": content["user_name"],
        "title": content["title"],
        "description": content["description"],
        "createdAt": content["created_at"],
        "publishedAt": content["published_at"],
        "vodUrl": content["url"],
        "thumbnailUrl": content["thumbnail_url"],
        "viewable": content["viewable"],
        "viewCount": content["view_count"],
        "language": content["language"],
        "type": content["type"],
        "durationSeconds": duration_seconds(content["duration"]),
    }

def convert_comment(comment, commenterID, contentID):
    return {
        "twitchID": comment["_id"],
        "commenterID": commenterID,
        "channelID": comment["channel_id"],
        "contentID": contentID,
        "twitchContentID": comment["content_id"],
        "contentOffsetSeconds": comment["content_offset_seconds"],
        "body": comment["message"]["body"],
        "fragments": json.dumps(comment["message"].get("fragments") or []),
        "badges": json.dumps(comment["message"].get("user_badges") or []),
        "isAction": comment["message"].get("is_action") or False,
        "color": comment["message"].get("user_color"),
        "source": comment.get("source"),
        "state": comment.get("state"),
        "createdAt": comment["created_at"],
        "updatedAt": comment["updated_at"],
    }

with sqlite3.connect("nl-chat.db") as con:
    con.execute(ENABLE_FOREIGN_KEYS)
    con.execute(CREATE_COMMENTERS_TABLE)
    con.execute(CREATE_CONTENT_TABLE)
    con.execute(CREATE_COMMENTS_TABLE)
    con.execute(CREATE_COMMENTS_COMMENTER_ID_INDEX)
    con.execute(CREATE_COMMENTS_CONTENT_ID_INDEX)
    con.execute(CREATE_COMMENTERS_TWITCH_ID_INDEX)
    cur = con.cursor()
    cur.execute("select twitchID from content;")
    content_in_db = set(map(lambda x: x[0], cur.fetchall()))
    content_on_filesystem = set(map(lambda x: re.match(r"sky-videos/(\d+)\.json\.gz", x).groups()[0], glob.glob("sky-videos/*.gz")))
    files = sorted(list(content_on_filesystem - content_in_db), key=lambda x: -int(x))
    print(f"Inserting {len(files)} chat files...")
    for i, filename in enumerate(files):
        filename = f"sky-videos/{filename}.json.gz"
        print(f"{i*100/len(files):.2f}%", filename)
        with gzip.open(filename) as f:
            data = json.load(f)
        cur.execute(INSERT_CONTENT, convert_content(data["video"]))
        content_id = cur.lastrowid
        for j, comment in enumerate(data["comments"]):
            if commenter := convert_commenter(comment["commenter"]):
                cur.execute(UPSERT_COMMENTER, commenter)
                cur.execute("select id from commenters where twitchID = :twitchID;", commenter)
                (commenter_id,) = cur.fetchone()
                cur.execute(INSERT_COMMENT, convert_comment(comment, commenter_id, content_id))
        con.commit()
