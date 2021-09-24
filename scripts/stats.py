import sqlite3
import sys

username = sys.argv[1]

with sqlite3.connect("nl-chat.db") as con:
    cur = con.cursor()
    cur.execute("select count(id) from comments where commenterID = (select id from commenters where name = :username);", {"username": username.lower()})
    (count,) = cur.fetchone()
    cur.execute("select min(createdAt) from comments where commenterID = (select id from commenters where name = :username);", {"username": username.lower()})
    (first,) = cur.fetchone()
    cur.execute("select max(createdAt) from comments where commenterID = (select id from commenters where name = :username);", {"username": username.lower()})
    (last,) = cur.fetchone()
    cur.execute("select count(body), body from comments where commenterID = (select id from commenters where name = :username) group by body order by count(body) desc limit 20;", {"username": username.lower()})
    frequent_comments = cur.fetchall()
    cur.execute("select createdAt, body from comments where commenterID = (select id from commenters where name = :username) order by createdAt desc limit 20;", {"username": username.lower()})
    recent_comments = cur.fetchall()
    cur.execute("select createdAt, body from comments where commenterID = (select id from commenters where name = :username) order by createdAt limit 20;", {"username": username.lower()})
    oldest_comments = cur.fetchall()

print(f"User {username} has {count} comments")
print(f"Their first comment was on {first}")
print(f"Their most recent comment was on {last}")

print(f"\nHere are the most frequent comments from {username}:")
for times, comment in frequent_comments:
    print(f"{times:5} times: {comment}")

print(f"\nHere are the most recent comments from {username}:")
for date, comment in recent_comments:
    print(f"{date}: {comment}")

print(f"\nHere are the oldest comments from {username}:")
for date, comment in oldest_comments:
    print(f"{date}: {comment}")
