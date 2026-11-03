const fs=require('node:fs');const crypto=require('node:crypto');const path=require('node:path');
const file=path.join(__dirname,'.env');
if(fs.existsSync(file)){console.log('.env já existe; nenhuma configuração foi sobrescrita.');process.exit(0);}
let text=fs.readFileSync(path.join(__dirname,'.env.example'),'utf8');
text=text.replace('SUBSTITUA_POR_SENHA_ALEATORIA_DE_12_A_72_BYTES',crypto.randomBytes(18).toString('base64url'));
text=text.replace('SUBSTITUA_POR_SENHA_ALEATORIA',crypto.randomBytes(24).toString('base64url'));
text=text.replace('SUBSTITUA_POR_SEGREDO_ALEATORIO_COM_PELO_MENOS_32_CARACTERES',crypto.randomBytes(32).toString('hex'));
fs.writeFileSync(file,text,{flag:'wx',mode:0o600});console.log('.env criado com segredos locais aleatórios. Consulte ADMIN_USER/ADMIN_PASSWORD para o login.');
