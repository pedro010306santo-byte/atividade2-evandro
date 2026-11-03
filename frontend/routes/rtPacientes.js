const createCrudRouter=require('./createCrudRouter');
module.exports=dependencies=>createCrudRouter(dependencies,
 {plural:'pacientes',singular:'Paciente',fields:[{name:'nome',label:'Nome',type:'text',max:120},{name:'telefone',label:'Telefone (opcional)',type:'text',max:30,optional:true},{name:'datanascimento',label:'Data de nascimento',type:'date'}]}
);
