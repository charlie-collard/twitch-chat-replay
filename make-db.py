import sqlite3
import json
import gzip
import glob
import sys
import re

ENABLE_FOREIGN_KEYS = "pragma foreign_keys=1;"

CREATE_COMMENTERS_TABLE = """
create table if not exists commenters (
    id integer primary key autoincrement,
    twitchID text not null unique,
    displayName text not null,
    name text not null,
    bio text,
    logo text,
    type text,
    createdAt datetime not null,
    updatedAt datetime not null
);
"""

CREATE_CONTENT_TABLE = """
create table if not exists content (
    id integer primary key autoincrement,
    twitchID text not null unique,
    userID text not null,
    username text not null,
    title text not null,
    description text not null,
    vodUrl string not null,
    thumbnailUrl string not null,
    viewable text not null,
    viewCount integer not null,
    language text not null,
    type text not null,
    durationSeconds integer not null,
    createdAt datetime not null,
    publishedAt datetime not null
);
"""

CREATE_COMMENTS_TABLE = """
create table if not exists comments (
    id integer primary key autoincrement,
    twitchID text not null,
    commenterID integer not null,
    channelID text not null,
    contentID text not null,
    twitchContentID text not null,
    contentOffsetSeconds integer not null,
    body text not null,
    fragments text not null,
    badges text not null,
    isAction boolean not null,
    color text,
    source text,
    state text,
    createdAt datetime not null,
    updatedAt datetime not null,
    constraint fk_comments_content foreign key (contentID) references content (id),
    constraint fk_comments_commenters foreign key (commenterID) references commenters (id)
);
"""

CREATE_COMMENTS_COMMENTER_ID_INDEX = """
create index if not exists idx_comments_commenter_id on comments (commenterID);
"""

CREATE_COMMENTS_CONTENT_ID_INDEX = """
create index if not exists idx_comments_content_id on comments (contentID);
"""

UPSERT_COMMENTER = """
insert into commenters (
    twitchID,
    displayName,
    name,
    bio,
    logo,
    type,
    createdAt,
    updatedAt
) values (
    :twitchID,
    :displayName,
    :name,
    :bio,
    :logo,
    :type,
    datetime(:createdAt),
    datetime(:updatedAt)
)
on conflict (twitchID) do update set
    displayName=:displayName,
    name=:name,
    bio=:bio,
    logo=:logo,
    type=:type,
    updatedAt=:updatedAt
where :updatedAt > updatedAt;
"""


INSERT_CONTENT = """
insert into content (
    twitchID,
    userID,
    username,
    title,
    description,
    vodUrl,
    thumbnailUrl,
    viewable,
    viewCount,
    language,
    type,
    durationSeconds,
    createdAt,
    publishedAt
) values (
    :twitchID,
    :userID,
    :username,
    :title,
    :description,
    :vodUrl,
    :thumbnailUrl,
    :viewable,
    :viewCount,
    :language,
    :type,
    :durationSeconds,
    datetime(:createdAt),
    datetime(:publishedAt)
);
"""

INSERT_COMMENT = """
insert into comments (
    twitchID,
    commenterID,
    channelID,
    contentID,
    twitchContentID,
    contentOffsetSeconds,
    body,
    fragments,
    badges,
    isAction,
    color,
    source,
    state,
    createdAt,
    updatedAt
) values (
    :twitchID,
    :commenterID,
    :channelID,
    :contentID,
    :twitchContentID,
    :contentOffsetSeconds,
    :body,
    :fragments,
    :badges,
    :isAction,
    :color,
    :source,
    :state,
    datetime(:createdAt),
    datetime(:updatedAt)
);
"""

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
    cur = con.cursor()
    cur.execute("select twitchID from content;")
    content_in_db = set(map(lambda x: x[0], cur.fetchall()))
    content_on_filesystem = set(map(lambda x: re.match(r"sky-videos/(\d+)\.json\.gz", x).groups()[0], glob.glob("sky-videos/*.gz")))
    to_download = sorted(list(content_on_filesystem - content_in_db), key=lambda x: -int(x))
    print(f"Downloading {len(to_download)} files...")
    for i, filename in enumerate(to_download):
        filename = f"sky-videos/{filename}.json.gz"
        print(f"{i*100/len(to_download):.2f}%", filename)
        with gzip.open(filename) as f:
            data = json.load(f)
        cur.execute(INSERT_CONTENT, convert_content(data["video"]))
        content_id = cur.lastrowid
        for comment in data["comments"]:
            if commenter := convert_commenter(comment["commenter"]):
                cur.execute(UPSERT_COMMENTER, commenter)
                cur.execute("select id from commenters where twitchID = :twitchID;", commenter)
                (commenter_id,) = cur.fetchone()
                cur.execute(INSERT_COMMENT, convert_comment(comment, commenter_id, content_id))
        con.commit()

    con.execute(CREATE_COMMENTS_COMMENTER_ID_INDEX)
    con.execute(CREATE_COMMENTS_CONTENT_ID_INDEX)
