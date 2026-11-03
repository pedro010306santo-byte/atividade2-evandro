const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
test('testes da API ficam junto de cada módulo de domínio e login',()=>{
 for(const module of ['login','pacientes','consultas']){
  assert.ok(fs.existsSync(path.join(root,'backend/apps',module,'tests',module+'.test.js')),'Testes devem existir no módulo: '+module);
 }
});
// Contrato de organização solicitado; comportamento HTTP é coberto na integração.
test('rotas de páginas são módulos rt separados, como nos exemplos da apostila',()=>{
 for(const name of ['rtIndex','rtLogin','rtPacientes','rtConsultas']){
  const file=path.join(root,'frontend/routes',name+'.js');
  assert.ok(fs.existsSync(file),'Módulo de rota deve existir: '+name);
  assert.equal(typeof require(file),'function','Módulo cria um Express Router: '+name);
 }
 const app=fs.readFileSync(path.join(root,'frontend/app.js'),'utf8');
 assert.doesNotMatch(app,/app\.(get|post)\(['"]\/(login|logout|pacientes|consultas)/,'app.js apenas monta as rotas de páginas');
});
