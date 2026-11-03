const fs=require('node:fs');
const path=require('node:path');
const bcrypt=require('bcryptjs');
const db=require('./databaseconfig');
async function init(){
 const username=process.env.ADMIN_USER;
 const password=process.env.ADMIN_PASSWORD;
 if(!username||!password||Buffer.byteLength(password,'utf8')>72||password.length<12)throw new Error('Defina ADMIN_USER e ADMIN_PASSWORD (12 a 72 bytes) no ambiente.');
 await db.query(fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8'));
 const hash=await bcrypt.hash(password,12);
 await db.query('INSERT INTO usuarios(username,password) VALUES($1,$2) ON CONFLICT(username) DO NOTHING',[username,hash]);
 console.log('Banco inicializado; usuário existente preservado.');
}
if(require.main===module)init().then(()=>db.end()).catch(async()=>{console.error('Falha na inicialização. Confira a conexão e as variáveis ADMIN_USER/ADMIN_PASSWORD.');await db.end();process.exitCode=1;});
module.exports={init};
