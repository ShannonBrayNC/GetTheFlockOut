import sqlite3
from pathlib import Path
c=sqlite3.connect(':memory:')
for f in sorted(Path('drizzle').glob('*.sql')): c.executescript(f.read_text().replace('--> statement-breakpoint',''))
values=('id1','account1','test@example.com','Test','Angier','27501',1,'now','v1')
c.execute('INSERT INTO signatures(id,user_id,email,name,city,zip,resident,created,version) VALUES(?,?,?,?,?,?,?,?,?)',values);c.commit()
for user,email in [('account1','other@example.com'),('account2','test@example.com')]:
 try:
  c.execute('INSERT INTO signatures(id,user_id,email,name,city,zip,resident,created,version) VALUES(?,?,?,?,?,?,?,?,?)',('id2',user,email,*values[3:]));assert False
 except sqlite3.IntegrityError:c.rollback()
try:
 with c:
  c.execute('INSERT INTO signatures(id,user_id,email,name,city,zip,resident,created,version) VALUES(?,?,?,?,?,?,?,?,?)',('atomic','atomic','atomic@example.com',*values[3:]))
  c.execute('INSERT INTO deliveries(id,signature,recipient,status,attempts,updated) VALUES(NULL,?,?,?,?,?)',('atomic','mayor','queued',0,'now'))
  # SQLite text primary keys can allow NULL; explicit failure verifies transaction rollback.
  c.execute('INSERT INTO signatures(id,user_id,email,name,city,zip,resident,created,version) VALUES(?,?,?,?,?,?,?,?,?)',values)
except sqlite3.IntegrityError:pass
assert c.execute("SELECT count(*) FROM signatures WHERE id='atomic'").fetchone()[0]==0
assert c.execute("SELECT count(*) FROM deliveries WHERE signature='atomic'").fetchone()[0]==0
print('PASS database: all migrations, unique account/email constraints and transaction rollback.')
