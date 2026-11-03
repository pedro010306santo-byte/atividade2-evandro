const express=require('express');
// Os dois módulos já compartilhavam a lógica; a extração evita duplicá-la.
module.exports=function createCrudRouter({api,protect},m){
 const router=express.Router();
 const {plural,singular}=m;
 const extra=async(token)=>plural==='consultas'?(await api.GetAllPacientes(token)).registro:[];
 router.get('/',protect,async(req,res)=>{
  const rows=(await api['GetAll'+(plural==='pacientes'?'Pacientes':'Consultas')](req.cookies.auth)).registro;
  res.render('list',{title:plural==='pacientes'?'Pacientes':'Consultas',m,rows,saved:req.query.ok==='1'});
 });
 router.get('/novo',protect,async(req,res)=>res.render('form',{title:'Novo cadastro: '+singular,m,record:{},action:'/'+plural,pacientes:await extra(req.cookies.auth)}));
 router.get('/:id/editar',protect,async(req,res)=>{
  const record=(await api['Get'+singular+'ByID'](req.params.id,req.cookies.auth)).registro;
  res.render('form',{title:'Editar '+singular,m,record,action:'/'+plural+'/'+record.id,pacientes:await extra(req.cookies.auth)});
 });
 router.get('/:id',protect,async(req,res)=>{
  const record=(await api['Get'+singular+'ByID'](req.params.id,req.cookies.auth)).registro;
  res.render('detail',{title:singular+' #'+record.id,m,record});
 });
 router.post('/',protect,async(req,res)=>{await api['Insert'+singular](req.body,req.cookies.auth);res.redirect(303,'/'+plural+'?ok=1');});
 router.post('/:id',protect,async(req,res)=>{await api['Update'+singular](req.params.id,req.body,req.cookies.auth);res.redirect(303,'/'+plural+'?ok=1');});
 router.post('/:id/remover',protect,async(req,res)=>{await api['Delete'+singular](req.params.id,req.cookies.auth);res.redirect(303,'/'+plural+'?ok=1');});
 return router;
};
