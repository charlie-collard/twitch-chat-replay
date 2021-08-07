import sqlite3
import json
import gzip
import glob

ENABLE_FOREIGN_KEYS = "pragma foreign_keys=1;"

CREATE_COMMENTERS_TABLE = """
create table if not exists commenters (
    id integer primary key autoincrement,
    twitchID text not null unique,
    displayName text not null,
    bio text,
    createdAt datetime not null,
    updatedAt datetime not null
);
"""

CREATE_COMMENTERS_INDEX = """
create index if not exists commenters_twitch_id on commenters (twitchID);
"""

CREATE_COMMENTS_TABLE = """
create table if not exists comments (
    id integer primary key autoincrement,
    twitchID text not null unique,
    commenterID text not null,
    channelID text not null,
    contentID text not null,
    contentOffsetSeconds numeric not null,
    createdAt datetime not null,
    updatedAt datetime not null,
    body text not null,
    badges text,
    color text,
    constraint fk_comments_commenters foreign key (commenterID) references commenters (id)
);
"""

INSERT_COMMENTER = """
insert into commenters (
    twitchID,
    displayName,
    bio,
    createdAt,
    updatedAt
) VALUES (
    :twitchID,
    :displayName,
    :bio,
    datetime(:createdAt),
    datetime(:updatedAt)
);
"""

INSERT_COMMENT = """
insert into comments (
    twitchID,
    commenterID,
    channelID,
    contentID,
    contentOffsetSeconds,
    createdAt,
    updatedAt,
    body,
    badges,
    color
) VALUES (
    :twitchID,
    :commenterID,
    :channelID,
    :contentID,
    :contentOffsetSeconds,
    datetime(:createdAt),
    datetime(:updatedAt),
    :body,
    :badges,
    :color
);
"""

con = sqlite3.connect("nl-chat.db")

con.execute(ENABLE_FOREIGN_KEYS)
con.execute(CREATE_COMMENTERS_TABLE)
con.execute(CREATE_COMMENTERS_INDEX)
con.execute(CREATE_COMMENTS_TABLE)

def convert_commenter(commenter):
    if commenter is None:
        return None
    return {
        "twitchID": commenter["_id"],
        "displayName": commenter["display_name"],
        "bio": commenter["bio"],
        "createdAt": commenter["created_at"],
        "updatedAt": commenter["updated_at"],
    }

def convert_comment(comment, commenterID):
    return {
        "twitchID": comment["_id"],
        "commenterID": commenterID,
        "channelID": comment["channel_id"],
        "contentID": comment["content_id"],
        "contentOffsetSeconds": comment["content_offset_seconds"],
        "createdAt": comment["created_at"],
        "updatedAt": comment["updated_at"],
        "body": comment["message"]["body"],
        "badges": json.dumps(comment["message"].get("user_badges")),
        "color": comment["message"].get("user_color")
    }

with con:
    cur = con.cursor()
    for filename in glob.glob("sky-videos/*.json.gz"):
        print(filename)
        with gzip.open(filename) as f:
            data = json.load(f)
        for comment in data["comments"]:
            if commenter := convert_commenter(comment["commenter"]):
                try:
                    cur.execute(INSERT_COMMENTER, commenter)
                    con.commit()
                    rowID = cur.lastrowid
                except sqlite3.IntegrityError as e:
                    if str(e) == "UNIQUE constraint failed: commenters.twitchID":
                        cur.execute("select id from commenters where twitchID = :twitchID", commenter)
                        (rowID,) = cur.fetchone()
                    else:
                        raise e
                try:
                    cur.execute(INSERT_COMMENT, convert_comment(comment, rowID))
                except sqlite3.IntegrityError as e:
                    if str(e) != "UNIQUE constraint failed: comments.twitchID":
                        raise e
        con.commit()
