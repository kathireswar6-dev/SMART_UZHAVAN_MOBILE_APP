import sqlite3
import json
from pathlib import Path

DB = Path(__file__).parent / 'smart_uzhavan.db'
print('DB path:', DB)
if not DB.exists():
    print('Database file not found')
    exit(1)

conn = sqlite3.connect(str(DB))
conn.row_factory = sqlite3.Row
cur = conn.cursor()

print('\nTables:')
for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"): 
    print(' -', row['name'])

print('\nSchema for predictions:')
for r in cur.execute("PRAGMA table_info(predictions)"):
    print(r)

print('\nLatest 50 predictions:')
try:
    rows = cur.execute('SELECT * FROM predictions ORDER BY id DESC LIMIT 50').fetchall()
    for r in rows:
        d = dict(r)
        # try to pretty-print metadata
        try:
            d['metadata'] = json.loads(d.get('metadata') or '{}')
        except Exception:
            pass
        print(json.dumps(d, ensure_ascii=False))
    if not rows:
        print('(no rows)')
except Exception as e:
    print('Error reading predictions:', e)

print('\nSchema for users:')
for r in cur.execute("PRAGMA table_info(users)"):
    print(r)

print('\nUsers:')
try:
    rows = cur.execute('SELECT * FROM users ORDER BY created_at DESC LIMIT 50').fetchall()
    for r in rows:
        print(dict(r))
    if not rows:
        print('(no users)')
except Exception as e:
    print('Error reading users:', e)

conn.close()
