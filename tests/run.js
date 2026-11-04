// Cria exclusivamente um banco de testes separado; nunca usa o banco da demonstração.
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const dotenv=require('../backend/node_modules/dotenv');
const file=fs.existsSync(path.join(root,'.env.local'))?'.env.local':'.env';
const config=fs.existsSync(path.join(root,file))?dotenv.parse(fs.readFileSync(path.join(root,file))):{};
const env={...config,...process.env};
const name=env.TEST_DB_NAME||((env.DB_NAME||'saude')+'_test');
if(!/^[a-z][a-z0-9_]{0,50}_test$/.test(name))throw new Error('O banco de testes precisa terminar em _test e ter nome seguro.');
if(name===env.DB_NAME||name===config.DB_NAME)throw new Error('O banco de testes não pode ser o banco de demonstração.');
async function main(){
 const {Client}=require('../backend/node_modules/pg');
 const client=new Client({host:env.DB_HOST||'127.0.0.1',port:Number(env.DB_PORT||5432),user:env.DB_USER,password:env.DB_PASSWORD,database:'postgres',connectionTimeoutMillis:5000});
 await client.connect();
 try{if(!(await client.query('SELECT 1 FROM pg_database WHERE datname=$1',[name])).rowCount)await client.query('CREATE DATABASE "'+name+'"');}finally{await client.end();}
 env.DB_NAME=name;
 const files=process.argv.slice(2);if(!files.length)files.push(
  'tests/organization.test.js','tests/frontend-security.test.js','tests/api.test.js',
  'backend/apps/login/tests/login.test.js',
  'backend/apps/pacientes/tests/pacientes.test.js',
  'backend/apps/consultas/tests/consultas.test.js',
  'tests/frontend.test.js'
 );
 const run=spawnSync(process.execPath,['--test','--test-concurrency=1',...files],{cwd:root,env,encoding:'utf8'});
 const text=(run.stdout||'')+(run.stderr||'');process.stdout.write(text);fs.writeFileSync(path.join(__dirname,'resultado-testes.txt'),text);
 process.exitCode=run.status??1;
}
main().catch(()=>{console.error('Não foi possível preparar o banco de testes. Inicie o PostgreSQL e confira as variáveis e a permissão de criar banco.');process.exitCode=1;});
