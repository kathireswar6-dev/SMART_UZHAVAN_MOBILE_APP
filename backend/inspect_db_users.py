import sqlite3
from pathlib import Path
DB = Path(__file__).parent / 'smart_uzhavan.db'
print('DB path:', DB)
conn = sqlite3.connect(str(DB))
conn.row_factory = sqlite3.Row
cur = conn.cursor()

print('\nUsers schema:')
for r in cur.execute("PRAGMA table_info(users)"):
    print(dict(r))

print('\nUsers rows:')
try:
    rows = cur.execute('SELECT * FROM users').fetchall()
    for r in rows:
        print(dict(r))
    if not rows:
        print('(no users)')
except Exception as e:
    print('Error selecting users:', e)

conn.close()
