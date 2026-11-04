const {test}=require('node:test');
const assert=require('node:assert/strict');
const service=require('../frontend/services/api');
// Simula apenas a resposta de autenticação da API; não substitui testes SQL.
service.createClient=()=>({GetAllPacientes:async(token)=>{
 if(token!=='sessao-valida')throw new service.ApiError(401,'Token inválido');
 return {registro:[]};
}});
const {createApp}=require('../frontend/app');
test('front-end bloqueia formulário com cookie falso e impede cache da página protegida',async()=>{
 const server=createApp().listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const token of ['', 'token-falso', 'sessao-valida']){
   const r=await fetch(base+'/pacientes/novo',{redirect:'manual',headers:{Cookie:token?'auth='+token:''}});
   assert.equal(r.headers.get('cache-control'),'no-store');
   if(token==='sessao-valida')assert.equal(r.status,200);
   else {assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/login');}
  }
 }finally{await new Promise(r=>server.close(r));}
});
