const express=require('express');
module.exports=function createLoginRouter({api,cookieOptions}){
 const router=express.Router();
 router.get('/login',(req,res)=>res.render('login',{title:'Acesso ao sistema'}));
 router.post('/login',async(req,res)=>{
  const data=await api.Login({username:req.body.username,password:req.body.password});
  res.cookie('auth',data.token,cookieOptions);res.redirect(303,'/');
 });
 router.post('/logout',(req,res)=>{res.clearCookie('auth',{...cookieOptions,maxAge:undefined});res.redirect(303,'/login');});
 return router;
};
