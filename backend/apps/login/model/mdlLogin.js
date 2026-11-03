const db=require('../../../database/databaseconfig');
async function GetCredencial(username){return (await db.query('SELECT id,username,password FROM usuarios WHERE username=$1 AND removido=FALSE',[username])).rows[0];}
module.exports={GetCredencial};
