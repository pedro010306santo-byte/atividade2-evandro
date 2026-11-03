const {before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
// Fixture compartilhada: cada arquivo prepara seu próprio servidor e banco de teste.
module.exports=function setupApi({authenticate=false}={}){
 let server,base,token;
 async function api(route,method='GET',body,auth=token){
  const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const text=await r.text();let data;try{data=JSON.parse(text);}catch{data={message:text};}
  return {status:r.status,body:data};
 }
 before(async()=>{
  const db=require('../../backend/database/databaseconfig');
  assert.match(process.env.DB_NAME||'',/_test$/,'Use um banco exclusivo terminado em _test');
  await db.query(fs.readFileSync(path.join(__dirname,'../../backend/database/schema.sql'),'utf8'));
  await db.query('TRUNCATE consultas,pacientes,usuarios RESTART IDENTITY CASCADE');
  await db.query('INSERT INTO usuarios(username,password) VALUES($1,$2)',['estudante',await require('../../backend/node_modules/bcryptjs').hash('senha-ficticia-123',10)]);
  server=require('../../backend/app').createApp().listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  base='http://127.0.0.1:'+server.address().port;
  if(authenticate){const r=await api('/Login','POST',{username:'estudante',password:'senha-ficticia-123'});assert.equal(r.status,200);token=r.body.token;}
 });
 after(async()=>{if(server)await new Promise(r=>server.close(r));await require('../../backend/database/databaseconfig').end();});
 return {api,get base(){return base;}};
};
