ENABLE_FOREIGN_KEYS = "pragma foreign_keys=1;"

TABLES = [
    """
    create table if not exists commenters (
        id integer primary key autoincrement,
        twitchUserID text not null unique,
        displayName text not null,
        name text not null,
        bio text,
        logo text,
        type text,
        createdAt datetime not null,
        updatedAt datetime not null
    );
    """,
    """
    create table if not exists content (
        id integer primary key autoincrement,
        twitchContentID text not null unique,
        twitchUserID text not null,
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
    """,
    """
    create table if not exists comments (
        id integer primary key autoincrement,
        commenterID integer not null,
        contentID integer not null,
        twitchCommentID text not null,
        twitchChannelID text not null,
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
    """,
]

INDEXES = [
    "create index if not exists idx_comments_content_id on comments (contentID);",
    "create index if not exists idx_comments_commenter_id_body on comments (commenterID, body);",
    "create index if not exists idx_comments_commenter_id_created_at on comments (commenterID, createdAt);",
    "create index if not exists idx_commenters_twitch_user_id on commenters (twitchUserID);",
    "create index if not exists idx_commenters_name on commenters (name);",
    "create index if not exists idx_content_twitch_content_id on content (twitchContentID);",
]

VIEWS = [
    "drop view if exists withNames;",
    """
    create view withNames (name, body, createdAt, contentOffsetSeconds) as
    select commenters.displayName, comments.body, comments.createdAt, comments.contentOffsetSeconds
    from comments join commenters on commenterID = commenters.id;
    """
]


UPSERT_COMMENTER = """
insert into commenters (
    twitchUserID,
    displayName,
    name,
    bio,
    logo,
    type,
    createdAt,
    updatedAt
) values (
    :twitchUserID,
    :displayName,
    :name,
    :bio,
    :logo,
    :type,
    datetime(:createdAt),
    datetime(:updatedAt)
)
on conflict (twitchUserID) do update set
    displayName=:displayName,
    name=:name,
    bio=:bio,
    logo=:logo,
    type=:type,
    updatedAt=datetime(:updatedAt)
where datetime(:updatedAt) > updatedAt;
"""


INSERT_CONTENT = """
insert into content (
    twitchContentID,
    twitchUserID,
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
    :twitchContentID,
    :twitchUserID,
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
    coalesce(datetime(:publishedAt), datetime(:createdAt))
);
"""

INSERT_COMMENT = """
insert into comments (
    commenterID,
    contentID,
    twitchCommentID,
    twitchChannelID,
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
    :commenterID,
    :contentID,
    :twitchCommentID,
    :twitchChannelID,
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
