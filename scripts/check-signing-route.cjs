// Run from a city directory. All identities, storage and network are fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require(require.resolve('typescript', {paths: [process.cwd()]}));
const load = require(process.cwd() + '/tests/load.cjs');
let user, closed, duplicate, failWrite, batches;
const env = {ADMIN_EMAIL:'organizer@example.com', RESEND_API_KEY:'fixture', MAIL_FROM:'fixture@example.com', ORGANIZER_CONTACT:'organizer@example.com'};
env.DB = {
  prepare(sql) { return {sql, args:[], bind(...args) {this.args=args; return this;},
    async first() {if(sql.startsWith('SELECT id FROM signatures')) return duplicate ? {id:'existing'} : null; return null;}}; },
  async batch(statements) {if(failWrite) throw Error('fixture failure'); batches.push(statements);}
};
const lib = load('app/lib.ts', env, () => {throw Error('Unexpected network');});
const campaign = load('app/campaign.ts', env).campaign;
const route = {};
const compiled = ts.transpileModule(fs.readFileSync('app/api/petition/route.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
new Function('exports','require',compiled)(route, name => {
  if(name==='../../operations') return {state:async()=>closed};
  if(name==='../../chatgpt-auth') return {getChatGPTUser:async()=>user};
  if(name==='../../lib') return lib;
  throw Error('Unexpected import '+name);
});
const request = (body,origin='https://petition.example') => new Request('https://petition.example/api/petition',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
(async()=>{
  user={userId:'fixture-user',email:'fixture@example.com'};batches=[];
  const b={name:'Fixture Supporter',city:campaign.city,zip:campaign.localZipCodes[0],resident:'yes',contactEmail:'contact@example.com',consent:'yes',version:lib.version,consentVersion:lib.consentVersion,recipients:campaign.officials.map(o=>o.id)};
  assert.equal((await route.POST(request(b,'https://other.example'))).status,403);
  user=null;assert.equal((await route.POST(request(b))).status,401);user={userId:'fixture-user',email:'fixture@example.com'};
  assert.equal((await route.POST(request({...b,version:'stale'}))).status,400);
  env.RESEND_API_KEY='';assert.equal((await route.POST(request(b))).status,503);env.RESEND_API_KEY='fixture';
  closed='fixture';assert.equal((await route.POST(request(b))).status,403);closed=null;
  duplicate=true;assert.equal((await route.POST(request(b))).status,409);duplicate=false;
  assert.equal(batches.length,0);
  const result=await route.POST(request(b));assert.equal(result.status,200);
  assert.match((await result.json()).message,/No emails have been sent/);
  assert.equal(batches[0].length,1+b.recipients.length);
  for(const s of batches[0].slice(1)) {assert.match(s.sql,/'pending_review'/); const payload=JSON.parse(s.args.at(-1));assert(!payload.text.includes(b.contactEmail));}
  assert.equal((await route.POST(request({...b,city:'Outside municipality',resident:undefined}))).status,200);
  assert.equal(batches[1].length,1,'Outside supporters must not create official deliveries');
  failWrite=true;assert.equal((await route.POST(request(b))).status,409);
  console.log('PASS signing route: origin/auth/consent/readiness/closed/duplicates, atomic local queue and outside support, safe storage failure; no live data or email.');
})().catch(e=>{console.error(e);process.exitCode=1;});
