// Run after installing each application's locked dependencies. No live writes.
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const cities=['cities/angier','erwin-site','fv-site','holly-springs-site','apex-site','wilmington-site','selma-site','wake-forest-site'];
let failed=false, checks=0;
function run(cwd,args){const p=spawnSync(args[0],args.slice(1),{cwd,encoding:'utf8'});checks++;if(p.status!==0){failed=true;console.error(cwd,args.join(' '),p.error||p.stdout+p.stderr);}else console.log(path.relative(root,cwd)||'.',args.join(' '),'PASS');}
for(const city of [...cities,'other-city-site']){
 const cwd=path.join(root,city);
 run(cwd,['node','scripts/check-campaign.cjs']);
 for(const file of fs.readdirSync(path.join(cwd,'tests')).filter(f=>f.endsWith('.cjs')&&f!=='load.cjs'))run(cwd,['node','tests/'+file]);
 if(cities.includes(city)){run(cwd,['python3','tests/database.py']);run(cwd,['node',path.join(__dirname,'check-signing-route.cjs')]);}
 run(cwd,['node','node_modules/typescript/bin/tsc','--noEmit']);
}
run(root,['python3','nc-flock-tracker/scripts/check-shared.py']);
console.log(`${checks} checks; ${failed?'FAIL':'PASS'}`);process.exitCode=failed?1:0;
