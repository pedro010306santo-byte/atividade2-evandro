const express = require('express');
const router = express.Router();
const appLogin = require('../apps/login/controller/ctlLogin');
const appPacientes = require('../apps/pacientes/controller/ctlPacientes');
const appConsultas = require('../apps/consultas/controller/ctlConsultas');
const AutenticaJWT = require('../middleware/auth');

router.post('/Login', appLogin.Login);
// Como no exemplo de aula: rota -> autenticação -> controller -> model.
router.get('/GetAllPacientes', AutenticaJWT, appPacientes.GetAllPacientes);
router.get('/GetPacienteByID/:id', AutenticaJWT, appPacientes.GetPacienteByID);
router.post('/InsertPaciente', AutenticaJWT, appPacientes.InsertPaciente);
router.put('/UpdatePaciente/:id', AutenticaJWT, appPacientes.UpdatePaciente);
router.delete('/DeletePaciente/:id', AutenticaJWT, appPacientes.DeletePaciente);
router.get('/GetAllConsultas', AutenticaJWT, appConsultas.GetAllConsultas);
router.get('/GetConsultaByID/:id', AutenticaJWT, appConsultas.GetConsultaByID);
router.post('/InsertConsulta', AutenticaJWT, appConsultas.InsertConsulta);
router.put('/UpdateConsulta/:id', AutenticaJWT, appConsultas.UpdateConsulta);
router.delete('/DeleteConsulta/:id', AutenticaJWT, appConsultas.DeleteConsulta);
module.exports = router;
