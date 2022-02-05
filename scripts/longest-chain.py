import sqlite3

with sqlite3.connect("nl-chat.db") as connection:
    cur = connection.cursor()
    cur.execute('select id, title from content;')
    content_ids = cur.fetchall()

    banned = [15, 2320]
    outer_longest = 0
    longest_content_id = 0
    for content_id, title in content_ids:
        if content_id in banned:
            continue
        if "!docket" in title:
            continue

        inner_longest = 0

        for body, contentOffsetSeconds in cur.execute('select body, contentOffsetSeconds from comments where contentID = :contentID order by contentOffsetSeconds;', {'contentID': content_id}):
            if body == 'LUL':
                inner_longest += 1
            else:
                if inner_longest > outer_longest:
                    print(f'Content ID {content_id} beat the record with {inner_longest} in a row')
                    outer_longest = inner_longest
                    longest_content_id = content_id
                inner_longest = 0
