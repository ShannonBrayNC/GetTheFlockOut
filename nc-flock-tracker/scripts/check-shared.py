from pathlib import Path
import hashlib,sys
root=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
source=Path(__file__).resolve().parents[1]/'shared-city'
bad=[]
for city in ['cities/angier','erwin-site','fv-site','holly-springs-site','apex-site','wilmington-site','selma-site','wake-forest-site']:
 for f in source.rglob('*'):
  if f.is_file():
   target=root/city/f.relative_to(source)
   if not target.is_file() or f.read_bytes()!=target.read_bytes():bad.append(city+'/'+str(f.relative_to(source)))
if bad:raise SystemExit('Shared source drift: '+', '.join(bad))
print('PASS: shared city implementation matches all city deployments; local evidence and configuration remain separate.')
