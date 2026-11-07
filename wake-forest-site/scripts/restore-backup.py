import argparse,json,sqlite3
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
p=argparse.ArgumentParser();p.add_argument('--backup-dir',required=True);p.add_argument('--key-file',required=True);p.add_argument('--manifest',required=True);p.add_argument('--database',required=True);p.add_argument('--schema-dir',required=True);a=p.parse_args()
dest=Path(a.database)
if dest.exists():raise SystemExit('Refusing to overwrite an existing database')
key=bytes.fromhex(json.loads(Path(a.key_file).read_text())['key']);aes=AESGCM(key)
base=Path(a.backup_dir).resolve()
def read(name):
 f=(base/Path(name).name).resolve()
 if f.parent!=base:raise ValueError('Invalid backup path')
 b=f.read_bytes();return json.loads(aes.decrypt(b[:12],b[12:],None))
m=read(a.manifest)
if m.get('format')!='no-more-flock-encrypted-backup-v1':raise ValueError('Unknown backup format')
c=sqlite3.connect(dest)
try:
 for f in sorted(Path(a.schema_dir).glob('*.sql')):c.executescript(f.read_text())
 allowed={r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'")}
 counts={}
 for part in m['parts']:
  d=read(part['key']);table=d['table']
  if table not in allowed or table!=part['table'] or len(d['rows'])!=part['rows']:raise ValueError('Invalid backup part')
  cols={r[1] for r in c.execute('PRAGMA table_info("'+table+'")')}
  for row in d['rows']:
   if not set(row).issubset(cols):raise ValueError('Unknown backup column')
   names=list(row);sql='INSERT INTO "'+table+'" ('+','.join('"'+x+'"' for x in names)+') VALUES('+','.join('?' for x in names)+')';c.execute(sql,[row[x] for x in names])
  counts[table]=counts.get(table,0)+len(d['rows'])
 if 'deliveries' in allowed:c.execute("UPDATE deliveries SET status='review_required',reason='isolated_restore_reconciliation_required' WHERE status NOT IN ('accepted','sent','cancelled','rejected')")
 if 'ops_state' in allowed:c.execute("DELETE FROM ops_state WHERE key='maintenance_lease'")
 c.commit();print(json.dumps({'restored_rows':counts,'database':str(dest),'sending_enabled':False}))
except:
 c.close();dest.unlink(missing_ok=True);raise
finally:c.close()
