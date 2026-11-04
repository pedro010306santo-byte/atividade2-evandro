# Perguntas da apresentação

## GetAll: onde está e o que faz?
`frontend/services/api.js`: GetAllPacientes faz GET /GetAllPacientes com Authorization: Bearer.
`backend/routes/router.js`: recebe a requisição, executa AutenticaJWT e chama o controller.
`backend/apps/pacientes/controller/ctlPacientes.js`: chama o model e devolve JSON em registro.
`backend/apps/pacientes/model/mdlPacientes.js`: SELECT com WHERE removido=FALSE retorna todos os campos dos pacientes ativos. GetByID acrescenta o filtro por ID.

## Segurança do front-end
`frontend/app.js`: protect exige cookie e consulta a API para que ela valide o JWT antes de abrir a página; no-store evita guardar a resposta no cache HTTP. Token ausente ou inválido redireciona ao login. Se a API estiver indisponível, exibe erro e não libera a página.
`frontend/routes/rtLogin.js`: login guarda o JWT em cookie HttpOnly/SameSite; logout apaga esse cookie.
`backend/middleware/auth.js`: valida assinatura, validade, emissor e público do JWT. Todas as dez APIs CRUD exigem esse middleware.
O POST exige CSRF; Nunjucks usa autoescape contra injeção de HTML. O cookie de autenticação não precisa ser lido pelo JavaScript do navegador.
Demonstre numa janela anônima: http://localhost:40100/pacientes/novo deve ir ao login. Entre, mostre o cadastro, saia e tente abrir o endereço novamente.
Abrir http://localhost:40000/GetAllPacientes sem Authorization deve retornar 401.
Não mostre senhas nem copie o JWT para a apresentação.

## De onde vêm os dados e como chegam ao banco?
1. `frontend/views/form.njk`: campos nome, telefone e datanascimento do formulário.
2. `frontend/app.js`: express.urlencoded transforma o formulário em req.body.
3. `frontend/routes/createCrudRouter.js`: POST /pacientes chama api.InsertPaciente(req.body, req.cookies.auth).
4. `frontend/services/api.js`: envia JSON por HTTP para POST /InsertPaciente, com Bearer token.
5. `backend/routes/router.js`: autentica antes de chamar InsertPaciente.
6. `backend/apps/pacientes/controller/ctlPacientes.js`: valida req.body com validation.paciente e chama model.InsertPaciente.
7. `backend/apps/pacientes/model/mdlPacientes.js`: db.query usa INSERT INTO pacientes ... VALUES($1,$2,$3), com parâmetros separados.
8. `backend/database/databaseconfig.js`: pool pg conecta ao PostgreSQL. O front-end não acessa o SGBD.

## Comparação com a aula e enunciado
Referência: https://github.com/eajardini/dw3 — Express Router, apps por módulo, controller/model, pg e Nunjucks. As rotas CRUD agora declaram autenticação explicitamente como no exemplo do professor.
Adaptações: pacientes/consultas 1:N; removido em vez de deleted; cookie HttpOnly em vez de token acessível ao JavaScript; funções de consumo HTTP centralizadas e templates CRUD compartilhados. Não é cópia literal: preserva o domínio saúde e as exigências do PDF.
O banco tem texto, decimal, data, ID e removido. Front/back usam portas distintas e têm Dockerfiles/Compose. É necessário comprovar a execução atual dos containers e postar o link no Moodle; este roteiro não comprova esses passos.
Uso de IA deve ser explicado com transparência, conforme a regra do professor.

## Verificação desta revisão
Sete testes sem banco passaram, incluindo o bloqueio HTTP do formulário com cookie falso (API simulada). A suíte com PostgreSQL não pôde ser concluída nesta sessão: conexão local recusada/tempo esgotado. Os resultados históricos de Docker no README não são uma nova validação desta revisão.
