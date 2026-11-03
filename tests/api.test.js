const {test}=require('node:test');
const assert=require('node:assert/strict');
const context=require('./helpers/api')();
test('health consulta PostgreSQL de verdade', async () => {
 const r=await fetch(context.base+'/health'); assert.equal(r.status,200);
 assert.equal((await r.json()).database,'ok');
});
test('inicialização recusa segredo JWT curto',()=>{
 const saved=process.env.JWT_SECRET;
 try{process.env.JWT_SECRET='curto';assert.throws(()=>require('../backend/app').createApp(),/32/);}
 finally{process.env.JWT_SECRET=saved;}
});
