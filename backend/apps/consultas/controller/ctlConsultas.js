const model=require('../model/mdlConsultas');
const v=require('../../../validation');
function found(row){if(!row)throw new v.HttpError(404,'Consulta não encontrada.');return row;}
async function GetAllConsultas(req,res){res.json({registro:await model.GetAllConsultas()});}
async function GetConsultaByID(req,res){res.json({registro:found(await model.GetConsultaByID(v.id(req.params.id)))});}
async function InsertConsulta(req,res){res.status(201).json({registro:await model.InsertConsulta(v.consulta(req.body))});}
async function UpdateConsulta(req,res){res.json({registro:found(await model.UpdateConsulta(v.id(req.params.id),v.consulta(req.body)))});}
async function DeleteConsulta(req,res){res.json({registro:found(await model.DeleteConsulta(v.id(req.params.id)))});}
module.exports={GetAllConsultas,GetConsultaByID,InsertConsulta,UpdateConsulta,DeleteConsulta};
