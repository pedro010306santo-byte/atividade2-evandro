// Execução local de demonstração. NÃO equivale à execução obrigatória em Docker.
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process');
const root=__dirname;const runtime=path.join(root,'..','runtime-pg');const pgBin=path.join(runtime,'pgsql','bin');const data=path.join(runtime,'data');
function run(exe,args,env){
 // Não capture pipes de pg_ctl: no Windows o postgres herda os handles e impede o EOF.
 const r=spawnSync(exe,args,{stdio:'inherit',windowsHide:true,env:env||process.env,timeout:120000});
 if(r.status!==0)throw new Error('Falha em '+path.basename(exe)+'. Consulte a mensagem acima e o log do PostgreSQL.');
}
const children=[];let shutting=false;
async function main(){
 if(!fs.existsSync(path.join(pgBin,'pg_ctl.exe')))throw new Error('PostgreSQL portátil não encontrado. Use o README para executar com PostgreSQL/Docker.');
 fs.mkdirSync(runtime,{recursive:true});
 const envFile=path.join(root,'.env.local');
 if(!fs.existsSync(envFile)){
  const config={DB_HOST:'127.0.0.1',DB_PORT:'55433',DB_NAME:'saude_demo',DB_USER:'postgres',DB_PASSWORD:crypto.randomBytes(24).toString('base64url'),JWT_SECRET:crypto.randomBytes(32).toString('hex'),ADMIN_USER:'estudante',ADMIN_PASSWORD:crypto.randomBytes(18).toString('base64url'),PORT:'40000',FRONT_PORT:'40100',API_URL:'http://127.0.0.1:40000',COOKIE_SECURE:'false'};
  fs.writeFileSync(envFile,Object.entries(config).map(([k,v])=>k+'='+v).join('\n')+'\n',{flag:'wx',mode:0o600});
 }
 const env=require('./backend/node_modules/dotenv').parse(fs.readFileSync(envFile));
 Object.assign(process.env,env);process.env.PGPASSWORD=env.DB_PASSWORD;process.env.HOST='127.0.0.1';
 if(process.argv.includes('--stop')){run(path.join(pgBin,'pg_ctl.exe'),['-D',data,'stop','-m','fast']);console.log('PostgreSQL local parado.');return;}
 if(!fs.existsSync(path.join(data,'PG_VERSION'))){
  const pw=path.join(runtime,'init-password.tmp');fs.writeFileSync(pw,env.DB_PASSWORD+'\n',{mode:0o600});
  try{run(path.join(pgBin,'initdb.exe'),['-D',data,'-U',env.DB_USER,'--auth=scram-sha-256','--encoding=UTF8','--locale=C','--pwfile='+pw]);}finally{fs.unlinkSync(pw);}
 }
 const status=spawnSync(path.join(pgBin,'pg_ctl.exe'),['-D',data,'status'],{windowsHide:true,stdio:'ignore'});
 if(status.status!==0)run(path.join(pgBin,'pg_ctl.exe'),['-D',data,'-l',path.join(runtime,'postgres.log'),'-o','-h 127.0.0.1 -p '+env.DB_PORT,'-w','start']);
 const {Client}=require('./backend/node_modules/pg');const client=new Client({host:env.DB_HOST,port:Number(env.DB_PORT),user:env.DB_USER,password:env.DB_PASSWORD,database:'postgres'});
 await client.connect();
 if(!/^[a-z][a-z0-9_]{0,40}$/.test(env.DB_NAME))throw new Error('Nome do banco local inválido.');
 if(!(await client.query('SELECT 1 FROM pg_database WHERE datname=$1',[env.DB_NAME])).rowCount)await client.query('CREATE DATABASE "'+env.DB_NAME+'"');
 await client.end();
 const db=require('./backend/database/databaseconfig');await require('./backend/database/init').init();await db.end();
 fs.writeFileSync(path.join(root,'acesso-local.txt'),'DADOS LOCAIS — NÃO PUBLICAR\nEndereço: http://localhost:40100\nUsuário: '+env.ADMIN_USER+'\nSenha: '+env.ADMIN_PASSWORD+'\n\nEste arquivo é ignorado pelo Git. Use apenas dados fictícios.\n');
 for(const service of ['backend','frontend']){
  const child=spawn(process.execPath,[path.join(root,service,'app.js')],{env:{...process.env},stdio:'inherit',windowsHide:true});children.push(child);
  child.once('exit',code=>{if(!shutting&&code!==0){console.error(service+' encerrou com falha. Verifique se as portas estão ocupadas.');shutdown(1);}});
 }
 for(let i=0;i<40;i++){
  try{const [a,b]=await Promise.all([fetch('http://127.0.0.1:40000/health'),fetch('http://127.0.0.1:40100/health')]);if(a.ok&&b.ok){console.log('Sistema pronto: http://localhost:40100 | Credenciais em acesso-local.txt | Ctrl+C para encerrar.');if(!process.argv.includes('--no-open'))spawn('cmd.exe',['/c','start','','http://localhost:40100'],{windowsHide:true});return;}}catch{}
  await new Promise(r=>setTimeout(r,300));
 }
 throw new Error('Os servidores não ficaram disponíveis. Confira portas e logs.');
}
function shutdown(code=0){if(shutting)return;shutting=true;for(const child of children)child.kill();spawnSync(path.join(pgBin,'pg_ctl.exe'),['-D',data,'stop','-m','fast'],{windowsHide:true,stdio:'ignore'});process.exit(code);}
process.on('SIGINT',()=>shutdown());process.on('SIGTERM',()=>shutdown());
main().catch(e=>{console.error(e.message);shutdown(1);});
