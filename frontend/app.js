require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const express=require('express');
const nunjucks=require('nunjucks');
const crypto=require('node:crypto');
const path=require('node:path');
const {createClient}=require('./services/api');
function parseCookies(value=''){
 const result={};for(const item of value.split(';')){const i=item.indexOf('=');if(i>0)try{result[item.slice(0,i).trim()]=decodeURIComponent(item.slice(i+1).trim());}catch{}}
 return result;
}
function createApp({apiUrl=process.env.API_URL||'http://127.0.0.1:40000'}={}){
 const app=express();const api=createClient(apiUrl);
 app.disable('x-powered-by');app.use(require('helmet')());
 const templates=nunjucks.configure(path.join(__dirname,'views'),{autoescape:true,express:app,noCache:process.env.NODE_ENV!=='production'});
 templates.addFilter('datebr',v=>v?String(v).slice(0,10).split('-').reverse().join('/'):'');
 templates.addFilter('money',v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)));
 app.set('view engine','njk');app.use(express.urlencoded({extended:false,limit:'32kb'}));
 app.use('/static',express.static(path.join(__dirname,'public')));
 const cookieOptions={httpOnly:true,sameSite:'strict',secure:process.env.COOKIE_SECURE==='true',path:'/',maxAge:30*60*1000};
 app.use((req,res,next)=>{
  req.cookies=parseCookies(req.get('cookie'));res.locals.auth=Boolean(req.cookies.auth);
  let csrf=req.cookies.csrf;if(!/^[a-f0-9]{64}$/.test(csrf||'')){csrf=crypto.randomBytes(32).toString('hex');res.cookie('csrf',csrf,cookieOptions);}
  res.locals.csrf=csrf;
  if(req.method==='POST'){
   const sent=req.body?._csrf;
   if(typeof sent!=='string'||!/^[a-f0-9]{64}$/.test(sent)||!crypto.timingSafeEqual(Buffer.from(sent),Buffer.from(csrf)))return res.status(403).render('error',{title:'Solicitação inválida',message:'Reabra o formulário e tente novamente. A proteção CSRF recusou a ação.'});
  }
  next();
 });
 const protect=(req,res,next)=>req.cookies.auth?next():res.redirect(303,'/login');
 app.get('/health',(req,res)=>res.json({status:'ok'}));
 const dependencies={api,protect,cookieOptions};
 app.use('/',require('./routes/rtLogin')(dependencies));
 app.use('/',require('./routes/rtIndex')(dependencies));
 app.use('/pacientes',require('./routes/rtPacientes')(dependencies));
 app.use('/consultas',require('./routes/rtConsultas')(dependencies));
 app.use((req,res)=>res.status(404).render('error',{title:'Página não encontrada',message:'Confira o endereço solicitado.'}));
 app.use((error,req,res,next)=>{
  if(error.status===401&&req.path!=='/login'){res.clearCookie('auth',{...cookieOptions,maxAge:undefined});return res.redirect(303,'/login');}
  const status=Number.isInteger(error.status)?error.status:500;
  res.status(status).render('error',{title:'Operação não concluída',message:status===500?'Ocorreu uma falha inesperada. Tente novamente.':error.message});
 });
 return app;
}
if(require.main===module)createApp().listen(Number(process.env.FRONT_PORT||40100),process.env.HOST||'0.0.0.0',()=>console.log('Frontend: porta '+(process.env.FRONT_PORT||40100)));
module.exports={createApp};
