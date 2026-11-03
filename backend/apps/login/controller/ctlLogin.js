const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const model=require('../model/mdlLogin');
async function Login(req,res){
 const {username,password}=req.body||{};
 if(typeof username!=='string'||typeof password!=='string'||username.length>80||password.length>72)return res.status(400).json({message:'Credenciais inválidas.'});
 const user=await model.GetCredencial(username);
 if(!user||!await bcrypt.compare(password,user.password))return res.status(401).json({auth:false,message:'Usuário ou senha inválidos.'});
 const token=jwt.sign({username:user.username},process.env.JWT_SECRET,{subject:String(user.id),algorithm:'HS256',expiresIn:'30m',issuer:'dw3-saude',audience:'dw3-frontend'});
 res.json({auth:true,token});
}
module.exports={Login};
