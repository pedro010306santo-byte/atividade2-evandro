const db=require('../../../database/databaseconfig');
const {HttpError}=require('../../../validation');
const selection='SELECT c.id,c.pacienteid,c.descricao,c.dataconsulta,c.valor,c.removido,p.nome AS pacientenome FROM consultas c JOIN pacientes p ON p.id=c.pacienteid';
async function GetAllConsultas(){return(await db.query(selection+' WHERE c.removido=FALSE ORDER BY c.dataconsulta,c.id')).rows;}
async function GetConsultaByID(id){return(await db.query(selection+' WHERE c.id=$1 AND c.removido=FALSE',[id])).rows[0];}
async function write(id,b){
 const client=await db.connect();
 try{
  await client.query('BEGIN');
  // O bloqueio do paciente serializa inclusão/edição com sua exclusão lógica.
  const active=(await client.query('SELECT id FROM pacientes WHERE id=$1 AND removido=FALSE FOR UPDATE',[b.pacienteid])).rowCount;
  if(!active)throw new HttpError(404,'Paciente ativo não encontrado.');
  const result=id===null
   ? await client.query('INSERT INTO consultas(pacienteid,descricao,dataconsulta,valor) VALUES($1,$2,$3,$4) RETURNING *',[b.pacienteid,b.descricao,b.dataconsulta,b.valor])
   : await client.query('UPDATE consultas SET pacienteid=$2,descricao=$3,dataconsulta=$4,valor=$5 WHERE id=$1 AND removido=FALSE RETURNING *',[id,b.pacienteid,b.descricao,b.dataconsulta,b.valor]);
  await client.query('COMMIT');return result.rows[0];
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
async function InsertConsulta(b){return write(null,b);}
async function UpdateConsulta(id,b){return write(id,b);}
async function DeleteConsulta(id){return(await db.query('UPDATE consultas SET removido=TRUE WHERE id=$1 AND removido=FALSE RETURNING *',[id])).rows[0];}
module.exports={GetAllConsultas,GetConsultaByID,InsertConsulta,UpdateConsulta,DeleteConsulta};
