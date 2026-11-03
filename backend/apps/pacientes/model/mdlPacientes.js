const db = require('../../../database/databaseconfig');
async function GetAllPacientes() {
  return (await db.query('SELECT id,nome,telefone,datanascimento,removido FROM pacientes WHERE removido=FALSE ORDER BY id')).rows;
}
async function GetPacienteByID(id){return(await db.query('SELECT id,nome,telefone,datanascimento,removido FROM pacientes WHERE id=$1 AND removido=FALSE',[id])).rows[0];}
async function InsertPaciente(b){return(await db.query('INSERT INTO pacientes(nome,telefone,datanascimento) VALUES($1,$2,$3) RETURNING *',[b.nome,b.telefone,b.datanascimento])).rows[0];}
async function UpdatePaciente(id,b){return(await db.query('UPDATE pacientes SET nome=$2,telefone=$3,datanascimento=$4 WHERE id=$1 AND removido=FALSE RETURNING *',[id,b.nome,b.telefone,b.datanascimento])).rows[0];}
async function DeletePaciente(id){
 const client=await db.connect();
 try{
  await client.query('BEGIN');
  const p=(await client.query('SELECT id FROM pacientes WHERE id=$1 AND removido=FALSE FOR UPDATE',[id])).rows[0];
  if(!p){await client.query('ROLLBACK');return undefined;}
  const active=(await client.query('SELECT id FROM consultas WHERE pacienteid=$1 AND removido=FALSE LIMIT 1',[id])).rowCount;
  if(active)throw new (require('../../../validation').HttpError)(409,'Remova primeiro as consultas ativas deste paciente.');
  const row=(await client.query('UPDATE pacientes SET removido=TRUE WHERE id=$1 RETURNING *',[id])).rows[0];
  await client.query('COMMIT');return row;
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
module.exports={GetAllPacientes,GetPacienteByID,InsertPaciente,UpdatePaciente,DeletePaciente};
