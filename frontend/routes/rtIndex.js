const express=require('express');
module.exports=function createIndexRouter({api,protect}){
 const router=express.Router();
 router.get('/',protect,async(req,res)=>{
  const [p,c]=await Promise.all([api.GetAllPacientes(req.cookies.auth),api.GetAllConsultas(req.cookies.auth)]);
  res.render('home',{title:'Visão geral',pacientes:p.registro.length,consultas:c.registro.length});
 });
 return router;
};
