const express=require('express');
const db=require('./database/databaseconfig');
function createApp(){
 if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET precisa de pelo menos 32 caracteres aleatórios.');
 const app=express(); app.disable('x-powered-by');app.use(require('helmet')());app.use(express.json({limit:'32kb'}));
 app.use('/Login',require('express-rate-limit').rateLimit({windowMs:15*60*1000,limit:40,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Muitas tentativas. Aguarde antes de tentar novamente.'}}));
 app.get('/health',async(req,res)=>{try{await db.query('SELECT 1');res.json({database:'ok'});}catch{res.status(503).json({database:'unavailable'});}});
 app.use(require('./routes/router'));
 app.use((req,res)=>res.status(404).json({message:'Rota não encontrada.'}));
 app.use((err,req,res,next)=>{
  if(err.status)return res.status(err.status).json({message:err.message});
  if(err.type==='entity.parse.failed')return res.status(400).json({message:'JSON inválido.'});
  res.status(500).json({message:'Não foi possível concluir a operação.'});
 });
 return app;
}
if(require.main===module)createApp().listen(Number(process.env.PORT||40000),process.env.HOST||'0.0.0.0',()=>console.log('Backend: porta '+(process.env.PORT||40000)));
module.exports={createApp};
