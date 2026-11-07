const assert=require('assert/strict'),load=require('./load.cjs');
async function main(){
 let settings={recipients:JSON.stringify(['mayor','ward1'])};
 const env={DB:{prepare(sql){return {async first(){const key=sql.includes('recipients_v3')?'recipients_v3':'recipients';return settings[key]?{value:settings[key]}:null}}}}};
 const lib=load('app/lib.ts',env,()=>{throw Error('No network');});
 assert.deepEqual(await lib.selected(),['chief','mayor']);
 settings.recipients_v3=JSON.stringify(['scarboro']);
 assert.deepEqual(await lib.selected(),['scarboro']); // later explicit organizer selections are preserved
 assert.equal(lib.officials.find(o=>o.id==='chief').email,'jvause@selma-nc.com');
 let payload;
 const sig={id:'private-test',name:'Example Supporter',city:'Selma',zip:'27576',resident:1,verification:'approved',created:'2026-11-06',version:lib.version,contact_email:'private-contact@example.com',telephone:'9195550123',get_involved:1};
 const row={id:'private-chief',signature:sig.id,recipient:'chief',status:'queued',attempts:0};
 const mailEnv={RESEND_API_KEY:'mock',MAIL_FROM:'mock@example.com',DB:{prepare(sql){return {bind(){return this},async first(){return sql.includes('FROM deliveries')?row:sig},async run(){return {meta:{changes:1}}}}}}};
 const mail=load('app/lib.ts',mailEnv,async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({id:'mock'})}});
 assert.equal(await mail.sendOne({id:row.id}),true);
 assert.deepEqual(payload.to,['jvause@selma-nc.com']);
 assert.deepEqual(payload.bcc,['shannonbraync@gmail.com']);
 assert(!JSON.stringify(payload).includes(sig.contact_email));
 assert(!JSON.stringify(payload).includes(sig.telephone));
 console.log('PASS contacts: chief added for future selections; explicit selections respected; contact email/telephone excluded from official notification. No live email sent.');
}main().catch(e=>{console.error(e);process.exit(1)});
