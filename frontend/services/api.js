// Cada função corresponde a uma operação da API; nenhum acesso ao SGBD.
class ApiError extends Error { constructor(status,message){super(message);this.status=status;} }
function createClient(baseUrl){
 async function call(route,method='GET',body,token){
  let r;
  try{r=await fetch(baseUrl+route,{method,signal:AbortSignal.timeout(8000),headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});}
  catch{throw new ApiError(503,'O servidor de dados está indisponível. Tente novamente.');}
  const data=await r.json();if(!r.ok)throw new ApiError(r.status,data.message||'Operação não concluída.');return data;
 }
 return {
  Login:(b)=>call('/Login','POST',b),
  GetAllPacientes:(t)=>call('/GetAllPacientes','GET',null,t),
  GetPacienteByID:(id,t)=>call('/GetPacienteByID/'+encodeURIComponent(id),'GET',null,t),
  InsertPaciente:(b,t)=>call('/InsertPaciente','POST',b,t),
  UpdatePaciente:(id,b,t)=>call('/UpdatePaciente/'+encodeURIComponent(id),'PUT',b,t),
  DeletePaciente:(id,t)=>call('/DeletePaciente/'+encodeURIComponent(id),'DELETE',null,t),
  GetAllConsultas:(t)=>call('/GetAllConsultas','GET',null,t),
  GetConsultaByID:(id,t)=>call('/GetConsultaByID/'+encodeURIComponent(id),'GET',null,t),
  InsertConsulta:(b,t)=>call('/InsertConsulta','POST',b,t),
  UpdateConsulta:(id,b,t)=>call('/UpdateConsulta/'+encodeURIComponent(id),'PUT',b,t),
  DeleteConsulta:(id,t)=>call('/DeleteConsulta/'+encodeURIComponent(id),'DELETE',null,t)
 };
}
module.exports={createClient,ApiError};
