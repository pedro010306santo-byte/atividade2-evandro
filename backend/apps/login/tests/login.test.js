const {test}=require('node:test');
const assert=require('node:assert/strict');
const {api}=require('../../../../tests/helpers/api')();
let token;
test('login valida bcrypt e retorna JWT; senha inválida não autentica',async()=>{
 const r=await api('/Login','POST',{username:'estudante',password:'senha-ficticia-123'});
 assert.equal(r.status,200);assert.equal(r.body.auth,true);token=r.body.token;
 const decoded=require('../../../node_modules/jsonwebtoken').verify(token,process.env.JWT_SECRET);
 assert.equal(decoded.username,'estudante');assert.ok(decoded.exp);
 assert.equal((await api('/Login','POST',{username:'estudante',password:'errada'})).status,401);
});
