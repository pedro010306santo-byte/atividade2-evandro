const model = require('../model/mdlPacientes');
async function GetAllPacientes(req,res) {
  res.json({registro:await model.GetAllPacientes()});
}
const v=require('../../../validation');
function found(row){if(!row)throw new v.HttpError(404,'Paciente não encontrado.');return row;}
async function GetPacienteByID(req,res){res.json({registro:found(await model.GetPacienteByID(v.id(req.params.id)))});}
async function InsertPaciente(req,res){res.status(201).json({registro:await model.InsertPaciente(v.paciente(req.body))});}
async function UpdatePaciente(req,res){res.json({registro:found(await model.UpdatePaciente(v.id(req.params.id),v.paciente(req.body)))});}
async function DeletePaciente(req,res){res.json({registro:found(await model.DeletePaciente(v.id(req.params.id)))});}
module.exports={GetAllPacientes,GetPacienteByID,InsertPaciente,UpdatePaciente,DeletePaciente};
