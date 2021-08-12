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
    name text not null,
    bio text,
    logo text,
    type text,
    createdAt datetime not null,
    updatedAt datetime not null
);
"""

CREATE_COMMENTS_TABLE = """
create table if not exists comments (
    id integer primary key autoincrement,
    twitchID text not null unique,
    commenterID integer not null,
    channelID text not null,
    contentID text not null,
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
    constraint fk_comments_commenters foreign key (commenterID) references commenters (id)
);
"""

CREATE_COMMENTS_COMMENTER_ID_INDEX = """
create index if not exists idx_comments_commenter_id on comments (commenterID);
"""

INSERT_COMMENTER = """
insert into commenters (
    twitchID,
    displayName,
    name,
    bio,
    logo,
    type,
    createdAt,
    updatedAt
) VALUES (
    :twitchID,
    :displayName,
    :name,
    :bio,
    :logo,
    :type,
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
    body,
    fragments,
    badges,
    isAction,
    color,
    source,
    state,
    createdAt,
    updatedAt
) VALUES (
    :twitchID,
    :commenterID,
    :channelID,
    :contentID,
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

def convert_comment(comment, commenterID):
    return {
        "twitchID": comment["_id"],
        "commenterID": commenterID,
        "channelID": comment["channel_id"],
        "contentID": comment["content_id"],
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
    con.execute(CREATE_COMMENTS_TABLE)
    cur = con.cursor()
    for filename in sorted(list(glob.glob("sky-videos/*.json.gz")), key=lambda x: -int(x[x.find("/")+1:x.find(".")])):
        print(filename)
        with gzip.open(filename) as f:
            data = json.load(f)
        for comment in data["comments"]:
            if commenter := convert_commenter(comment["commenter"]):
                try:
                    cur.execute(INSERT_COMMENTER, commenter)
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

con.execute(CREATE_COMMENTS_COMMENTER_ID_INDEX)