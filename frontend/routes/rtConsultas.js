const createCrudRouter=require('./createCrudRouter');
module.exports=dependencies=>createCrudRouter(dependencies,
 {plural:'consultas',singular:'Consulta',fields:[{name:'pacienteid',label:'Paciente',type:'select'},{name:'descricao',label:'Descrição',type:'text',max:240},{name:'dataconsulta',label:'Data da consulta',type:'date'},{name:'valor',label:'Valor (R$)',type:'number'}]}
);
