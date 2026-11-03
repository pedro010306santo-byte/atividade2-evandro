const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
let backend,front,base;let jar={};
async function request(route,method='GET',body){
 const r=await fetch(base+route,{method,redirect:'manual',headers:{Cookie:Object.entries(jar).map(([k,v])=>k+'='+v).join('; '),...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{})},...(body?{body:new URLSearchParams(body)}:{})});
 for(const cookie of r.headers.getSetCookie()){const [pair]=cookie.split(';');const i=pair.indexOf('=');jar[pair.slice(0,i)]=pair.slice(i+1);}
 return {status:r.status,location:r.headers.get('location'),cookies:r.headers.getSetCookie(),text:await r.text()};
}
function csrf(html){const match=html.match(/name="_csrf" value="([a-f0-9]+)"/);assert.ok(match,'Formulário deve conter CSRF');return match[1];}
let csrfToken,patientID,consultaID;
before(async()=>{
 assert.ok(fs.existsSync(path.join(__dirname,'../frontend/app.js')),'Frontend deve existir');
 const db=require('../backend/database/databaseconfig');
 assert.match(process.env.DB_NAME||'',/_test$/);
 await db.query(fs.readFileSync(path.join(__dirname,'../backend/database/schema.sql'),'utf8'));
 await db.query('TRUNCATE consultas,pacientes,usuarios RESTART IDENTITY CASCADE');
 await db.query('INSERT INTO usuarios(username,password) VALUES($1,$2)',['estudante',await require('../backend/node_modules/bcryptjs').hash('senha-ficticia-123',10)]);
 backend=require('../backend/app').createApp().listen(0,'127.0.0.1');await new Promise(r=>backend.once('listening',r));
 front=require('../frontend/app').createApp({apiUrl:'http://127.0.0.1:'+backend.address().port}).listen(0,'127.0.0.1');await new Promise(r=>front.once('listening',r));
 base='http://127.0.0.1:'+front.address().port;
});
after(async()=>{for(const s of [front,backend])if(s)await new Promise(r=>s.close(r));await require('../backend/database/databaseconfig').end();});
test('login front-end guarda JWT HttpOnly e bloqueia alteração sem CSRF',async()=>{
 assert.equal((await request('/')).location,'/login');
 let r=await request('/login');assert.equal(r.status,200);csrfToken=csrf(r.text);
 assert.equal((await request('/login','POST',{username:'estudante',password:'senha-ficticia-123'})).status,403);
 assert.equal((await request('/login','POST',{_csrf:'é'.repeat(64),username:'estudante',password:'senha-ficticia-123'})).status,403,'CSRF Unicode inválido deve ser rejeitado, não produzir erro 500');
 r=await request('/login','POST',{_csrf:csrfToken,username:'estudante',password:'senha-ficticia-123'});
 assert.equal(r.status,303);assert.equal(r.location,'/');assert.ok(r.cookies.some(c=>c.startsWith('auth=')&&c.includes('HttpOnly')&&c.includes('SameSite=Strict')));
 assert.equal((await request('/')).status,200);
});
test('interface executa as cinco operações de pacientes e escapa HTML',async()=>{
 let r=await request('/pacientes/novo');assert.equal(r.status,200);
 r=await request('/pacientes','POST',{_csrf:csrfToken,nome:'<script>alert(1)</script>',telefone:'170000',datanascimento:'2001-02-03'});
 assert.equal(r.status,303);
 patientID=(await require('../backend/database/databaseconfig').query('SELECT id FROM pacientes WHERE removido=FALSE')).rows[0].id;
 r=await request('/pacientes');assert.equal(r.status,200);assert.ok(r.text.includes('&lt;script&gt;'));assert.ok(!r.text.includes('<script>alert(1)</script>'));
 assert.equal((await request('/pacientes/'+patientID)).status,200);
 assert.equal((await request('/pacientes/'+patientID+'/editar')).status,200);
 r=await request('/pacientes/'+patientID,'POST',{_csrf:csrfToken,nome:'Pessoa fictícia',telefone:'170000',datanascimento:'2001-02-03'});assert.equal(r.status,303);
 assert.ok((await request('/pacientes/'+patientID)).text.includes('Pessoa fictícia'));
});
test('interface executa as cinco operações de consultas e remove sem apagar fisicamente',async()=>{
 assert.equal((await request('/consultas/novo')).status,200);
 let body={_csrf:csrfToken,pacienteid:String(patientID),descricao:'Exame fictício',dataconsulta:'2026-11-03',valor:'150.25'};
 let r=await request('/consultas','POST',body);assert.equal(r.status,303);
 consultaID=(await require('../backend/database/databaseconfig').query('SELECT id FROM consultas WHERE removido=FALSE')).rows[0].id;
 assert.equal((await request('/consultas')).status,200);
 assert.equal((await request('/consultas/'+consultaID)).status,200);
 assert.equal((await request('/consultas/'+consultaID+'/editar')).status,200);
 assert.equal((await request('/consultas/'+consultaID,'POST',{...body,descricao:'Retorno fictício'})).status,303);
 assert.equal((await request('/pacientes/'+patientID+'/remover','POST',{_csrf:csrfToken})).status,409);
 assert.equal((await request('/consultas/'+consultaID+'/remover','POST',{_csrf:csrfToken})).status,303);
 assert.equal((await request('/consultas/'+consultaID)).status,404);
 assert.equal((await request('/pacientes/'+patientID+'/remover','POST',{_csrf:csrfToken})).status,303);
 assert.equal((await request('/pacientes/'+patientID)).status,404);
 const row=(await require('../backend/database/databaseconfig').query('SELECT removido FROM consultas WHERE id=$1',[consultaID])).rows[0];assert.equal(row.removido,true);
 assert.equal((await request('/logout','POST',{_csrf:csrfToken})).status,303);
 assert.equal((await request('/')).location,'/login');
});
