DW3 — SEGUNDO TRABALHO: SAÚDE ERP
Pedro Henrique do Santo

ESTADO DO PROJETO
Implementação local funcional: pacientes e consultas (1:N), dez APIs de CRUD, funções correspondentes no front-end, login com bcrypt e JWT, PostgreSQL real, exclusão lógica, validações e interface.

Execução Docker validada: frontend e backend em containers separados nas portas 40100 e 40000, PostgreSQL em terceiro container sem porta publicada. Init terminou com código 0; os três serviços ficaram saudáveis. Após a correção da proteção do runner, a suíte completa executada em container aprovou 15 testes, 0 falhas, com banco exclusivo terminado em _test (11 funcionais/estruturais e 4 de segurança do runner). O teste HTTP/SQL dos serviços reais aprovou 29 verificações: login, JWT, CRUDs pela interface, relação 1:N, CSRF e exclusão lógica. Registros: tests/resultado-testes.txt e tests/docker-validation.txt. A primeira chamada da suíte excedeu o tempo de espera da ferramenta; o container continuou e gravou o resultado completo, depois conferido.

Repositório de entrega previsto: https://github.com/pedro010306santo-byte/atividade2-evandro. Este projeto é independente do repositório das aulas, preservado apenas como referência. Nenhum link foi enviado no Moodle; essa entrega depende de autorização separada.

IMPORTANTE SOBRE IA
O enunciado permite IA para resolução de problemas e proíbe vibe coding. Este projeto teve geração assistida por IA a pedido do aluno. Não se afirma autoria independente nem conformidade com essa restrição do professor. O aluno precisa revisar, compreender, testar e tratar o uso de IA com transparência antes de apresentar ou entregar. Não há integrantes de grupo ou contribuições inventadas.

1. EXECUÇÃO LOCAL MAIS SIMPLES NESTE COMPUTADOR
Abra INICIAR-LOCAL.cmd com duplo clique. O script usa Node.js e o PostgreSQL portátil em ../runtime-pg/pgsql. Não instala serviço global nem modifica o PostgreSQL de outras aplicações.

O script:
- Cria .env.local com segredos aleatórios, somente se ele ainda não existir.
- Inicia um cluster PostgreSQL próprio, em 127.0.0.1:55433, com autenticação por senha SCRAM.
- Cria o banco saude_demo e as tabelas, sem apagar os dados existentes.
- Cria o usuário de acesso na primeira inicialização; preserva a senha de usuário já existente.
- Inicia o back-end em 127.0.0.1:40000 e o front-end em 127.0.0.1:40100.
- Gera acesso-local.txt com o endereço e as credenciais locais, ignorado pelo Git.

Endereço: http://localhost:40100
Credenciais: consultar acesso-local.txt dentro desta pasta. Não publicar esse arquivo.
Mantenha a janela do iniciador aberta. Ctrl+C encerra os dois servidores e o PostgreSQL da demonstração, sem apagar o banco.
Se as portas já estiverem ocupadas, feche a execução anterior antes de iniciar outra. Não execute dois iniciadores ao mesmo tempo.

A execução local serve para estudo e testes. Ela NÃO substitui o requisito de execução em Docker para a avaliação.

2. DEPENDÊNCIAS / OUTRO COMPUTADOR
É necessário Node.js 24 ou superior e npm. Depois de obter somente o código:

  npm ci --prefix backend
  npm ci --prefix frontend

O PostgreSQL portátil distribuído em ../runtime-pg é Windows x64 e fica fora do repositório do código. Não deve ser publicado no GitHub. A inicialização local espera esse diretório. Em outro sistema, use um PostgreSQL instalado e a execução manual ou Docker.

Se o comando node não estiver no PATH do Windows, o INICIAR-LOCAL.cmd tenta o Node já instalado nos diretórios de ferramentas do Hermes deste usuário. Esse fallback é específico deste computador; em outro computador instale Node ou ajuste o PATH.

3. EXECUÇÃO MANUAL COM POSTGRESQL
Crie um banco PostgreSQL e um usuário com os privilégios necessários. Execute:

  node gerar-config.js

O comando cria .env com segredos aleatórios se o arquivo não existir; nunca o sobrescreve. Ajuste DB_HOST, DB_PORT, DB_NAME e DB_USER no .env para o seu servidor. O DB_PASSWORD deve corresponder à senha real desse usuário. O script não muda a senha de um servidor externo.

  npm run db:init --prefix backend
  npm start --prefix backend

Em outro terminal, a partir desta mesma pasta:

  npm start --prefix frontend

O .env é carregado pelos dois servidores na execução manual. O iniciador local usa .env.local e injeta suas variáveis nos processos, sem substituir a configuração destinada ao Docker.

4. DOCKER — EXECUÇÃO VALIDADA
Requer Docker Engine/Compose ou Docker Desktop funcionando com containers Linux.

  node gerar-config.js
  docker compose config --quiet
  docker compose up --build -d
  docker compose ps
  docker compose logs --tail=100 backend frontend init

Abrir http://localhost:40100 e usar ADMIN_USER/ADMIN_PASSWORD do .env.

O Compose cria:
- database: PostgreSQL 17, volume saude_data, sem porta de banco publicada no host.
- init: inicialização de tabelas e usuário; executa antes do back-end e termina.
- backend: serviço Node na porta 40000, acessível apenas no loopback do host publicado.
- frontend: serviço Node na porta 40100, acessível apenas no loopback do host publicado.

A API usa DB_HOST=database dentro da rede Docker. O front-end usa API_URL=http://backend:40000. Localhost dentro de um container não representa outro serviço.
Os Dockerfiles seguem o formato da apostila: node:24-bookworm-slim, instalação npm ci pelo lockfile, usuário node, porta e comando explícitos. O compose.yaml foi adicionado para coordenar a rede, a inicialização, os healthchecks e o volume; a apostila também ensina a construção e execução separadas por docker build/docker run.

  docker compose down

Esse comando encerra os containers, preservando o volume. Não use down -v se quiser preservar os dados. Não regenere as senhas do .env sem considerar que o volume pode conter um banco inicializado com as credenciais anteriores.

5. TESTES AUTOMATIZADOS
Com o PostgreSQL local iniciado:

  npm test

O runner tests/run.js lê .env.local (ou .env se não existir), prepara um banco separado terminado em _test e executa a suíte com concorrência entre arquivos desativada. O banco da demonstração NÃO é truncado. Os testes truncam somente as tabelas no banco de teste.

O usuário do PostgreSQL precisa poder criar o banco de testes; se não puder, peça sua criação ao administrador e ajuste TEST_DB_NAME para um nome terminado em _test. O runner precisa conectar-se ao banco de manutenção postgres.

Saída capturada: tests/resultado-testes.txt. A última execução completa incluiu explicitamente tests/runner-safety.test.js, além de todos os arquivos padrão. Para executar os quatro testes de proteção sem conexão ao banco: node --test tests/runner-safety.test.js.
Histórico dos ciclos de desenvolvimento: tests/TDD.log, arquivo local ignorado pelo Git.
Resultado desta refatoração: baseline de 9 testes aprovados; após a extração das rotas e a distribuição dos testes, 11 testes aprovados, 0 falhas (os 9 anteriores e 2 contratos de organização). Registro: tests/organizacao-refatoracao.txt.

Cobertura dos testes:
- Healthcheck com consulta real ao PostgreSQL.
- Login com bcrypt, senha incorreta e emissão de JWT com expiração.
- Rejeição de token ausente, adulterado ou expirado.
- Rejeição de configuração JWT curta na inicialização.
- Ciclo de pacientes: inserir, listar/buscar, atualizar e remover logicamente.
- Ciclo de consultas: inserir, listar/buscar, atualizar e remover logicamente.
- Validações de data, valor, identificador e paciente ativo.
- Bloqueio de remoção de paciente com consulta ativa.
- Linha preservada no banco após soft delete.
- Fluxo HTTP real front-end -> back-end -> PostgreSQL.
- Cookie HttpOnly/SameSite e rejeição de ação sem CSRF.
- Escape de HTML recebido em cadastro.

Os testes HTTP não substituem a inspeção visual nem a prova de execução em Docker. Evidências de telas reais estão em ../evidencias. O smoke de páginas e os IDs dos dados fictícios estão em tests/smoke-local.json.

6. API — ROTAS E CORPOS
Todas as operações abaixo exigem Authorization: Bearer <token>, exceto POST /Login e GET /health.

POST /Login
  {"username":"usuario_configurado","password":"senha_configurada"}
  Retorna auth=true e token. Não retorna o hash da senha.

Pacientes:
  GET    /GetAllPacientes
  GET    /GetPacienteByID/:id
  POST   /InsertPaciente
  PUT    /UpdatePaciente/:id
  DELETE /DeletePaciente/:id

Corpo de inclusão/edição:
  {"nome":"Paciente Fictício","telefone":"","datanascimento":"1998-06-15"}

Consultas:
  GET    /GetAllConsultas
  GET    /GetConsultaByID/:id
  POST   /InsertConsulta
  PUT    /UpdateConsulta/:id
  DELETE /DeleteConsulta/:id

Corpo de inclusão/edição:
  {"pacienteid":1,"descricao":"Atendimento fictício","dataconsulta":"2026-11-04","valor":"150.00"}

Use o ID realmente retornado ao cadastrar o paciente, não suponha que será 1.
A propriedade registro contém um objeto nas operações individuais ou uma lista na listagem.
Valores NUMERIC são retornados como string decimal pelo driver pg. O front-end os formata para apresentação.

Status: 200 sucesso; 201 inclusão; 400 entrada inválida; 401 autenticação ausente/inválida; 403 CSRF na interface; 404 registro/rota inexistente; 409 conflito de regra; 429 excesso de login; 500 falha inesperada; 503 indisponibilidade detectada.
As duas tabelas de domínio incluem id e removido. GetAll/GetByID ocultam removidos. A tabela usuarios é infraestrutura de autenticação adicional, não uma terceira tabela do domínio de saúde.

7. REGRAS DE CONSISTÊNCIA E SEGURANÇA
- Paciente obrigatório nas consultas, com chave estrangeira no PostgreSQL.
- Consulta exige paciente ativo, e não apenas uma linha existente.
- Remoção de paciente com consultas ativas é bloqueada por 409; remova primeiro as consultas.
- A criação/edição de consulta bloqueia a linha do paciente na transação para coordenar com sua remoção.
- Exclusão lógica preserva a linha e não permite editar o registro removido.
- Nome, descrição, tamanhos, identificadores, datas e valor são validados na API.
- SQL parametrizado para todos os valores externos.
- JWT HS256, emissor, público e expiração verificados; segredo mínimo de 32 caracteres.
- Senhas com bcrypt, nunca devolvidas ao front-end.
- Cookie de token HttpOnly/SameSite=Strict e token anti-CSRF nos formulários.
- Nunjucks com autoescape, Helmet e limitação de tentativas de login.

Projeto didático, não sistema pronto para operar um hospital real. Não inclui perfis de autorização granulares, trilha de auditoria de saúde, prontuário, recuperação de senha, revogação individual de tokens nem conformidade regulatória completa. Logout apaga o cookie; um JWT previamente copiado continua válido até expirar. Para produção seria necessário HTTPS, COOKIE_SECURE=true, política de segredos, restrição de privilégios do banco e revisão específica de segurança/privacidade.

8. MAPA DO CÓDIGO / COMO ESTUDAR
backend/app.js: Express, cabeçalhos, limitação de login, healthcheck, rotas e tratamento de erros.
backend/routes/router.js: as dez rotas de CRUD e a rota de login.
backend/middleware/auth.js: valida o JWT antes dos módulos de negócio.
backend/validation.js: validação dos dados recebidos.
backend/apps/login/controller/ctlLogin.js: compara bcrypt e assina token.
backend/apps/login/model/mdlLogin.js: consulta de credenciais.
backend/apps/pacientes/controller/ctlPacientes.js: coordena as operações de pacientes.
backend/apps/pacientes/model/mdlPacientes.js: consultas SQL de pacientes.
backend/apps/consultas/controller/ctlConsultas.js: coordena as operações de consultas.
backend/apps/consultas/model/mdlConsultas.js: consultas SQL e transação com paciente ativo.
backend/database/schema.sql: modelo relacional, campos, restrições e índice.
backend/database/init.js: cria tabelas e usuário inicial, sem resetar usuário existente.
frontend/app.js: configuração Express/Nunjucks, cookies, CSRF, montagem dos routers, healthcheck e tratamento de erros.
frontend/routes/rtIndex.js: painel inicial na URL /, preservando o endereço já existente.
frontend/routes/rtLogin.js: páginas/ações de login e logout.
frontend/routes/rtPacientes.js e rtConsultas.js: configuração de cada módulo e criação dos routers CRUD.
frontend/routes/createCrudRouter.js: lógica de rotas CRUD compartilhada, extraída sem duplicar os handlers existentes.
frontend/services/api.js: Login e as dez funções cliente correspondentes ao CRUD.
frontend/views: páginas Nunjucks com escape de conteúdo.
frontend/public: CSS e confirmação de remoção.
backend/apps/login/tests/login.test.js: integração da autenticação.
backend/apps/pacientes/tests/pacientes.test.js: proteção JWT e CRUD de pacientes.
backend/apps/consultas/tests/consultas.test.js: CRUD de consultas e relacionamento.
tests/helpers/api.js: fixture HTTP/PostgreSQL compartilhada; cada arquivo de API prepara seu próprio cenário.
tests/api.test.js: healthcheck e configuração global de JWT, sem módulo de domínio específico.
tests/frontend.test.js: integração transversal da interface, login e relação entre os dois módulos.
tests/organization.test.js: contratos explícitos da organização solicitada.
tests/run.js: ponto único de execução, incluindo os testes distribuídos com concorrência entre arquivos desativada.
compose.yaml + backend/Dockerfile + frontend/Dockerfile: execução em containers.

Para seguir uma operação: form.njk -> POST /consultas no front -> api.InsertConsulta -> POST /InsertConsulta -> ctlConsultas.InsertConsulta -> validation.consulta -> mdlConsultas.InsertConsulta -> PostgreSQL -> JSON -> redirecionamento à listagem.

9. RELAÇÃO COM O MATERIAL DO PROFESSOR
Referências locais em ../../materiais-professor:
- dw3-atividade-02.pdf: instruções e rubrica do segundo trabalho.
- dw3-apostila.pdf: capítulos 1 (arquitetura/JSON/REST), 2 (Express, pg, modelos/controllers/rotas, login), 3 (Express/Nunjucks, páginas e consumo de API), 4 (Docker).
- repositorio-dw3: clone do repositório eajardini/dw3, preservado sem edição para comparação.

ORGANIZAÇÃO E METODOLOGIA DESTA ETAPA
A apostila, p. 61 e seções 2.3.8.1/2.3.9.4, coloca model, controller e tests em apps/<modulo>. As seções 3.3 e 3.8.2/3.8.3 mostram routes/rt*.js montados pelo app.js. Essa organização foi aplicada aos módulos de API e às rotas da interface sem alterar os endereços existentes. Não foi criada uma nova URL /home nem reorganizados os templates sem necessidade.
A apostila exemplifica testes manuais .rest; os testes deste projeto continuam automatizados em JavaScript/node:test com PostgreSQL real. Não se afirma reprodução literal dos testes .rest nem que o enunciado exija uma ferramenta de testes específica.
Antes da refatoração foi executado npm test: 9/9. Um teste novo de contrato de rotas foi escrito e executado em vermelho (rtIndex ausente); depois da extração ele passou e os 9 testes comportamentais continuaram verdes. Em seguida, um contrato de testes por módulo foi escrito e falhou (tests/login ausente); após a distribuição e o ajuste do runner, npm test aprovou 11/11.
Os dois novos testes verificam a organização pedida, não substituem testes de comportamento. As verificações HTTP/SQL anteriores foram preservadas e redistribuídas; não se inventa uma fase vermelha histórica para código que já existia. Isso registra testes antes desta refatoração, não prova que todo o projeto tenha sido originalmente criado com TDD.
Os testes de API podem ser executados isoladamente pelo mesmo runner, por exemplo:
  node tests/run.js backend/apps/pacientes/tests/pacientes.test.js
Essa refatoração e a documentação tiveram assistência de IA. Não se atribuem ao aluno ações de revisão ou compreensão que não foram verificadas, nem se declara conformidade pedagógica integral. Cabe ao aluno estudar e explicar as decisões e esclarecer o uso de IA com o professor; a organização dos arquivos não resolve por si só a restrição a vibe coding.

Adaptações: pacientes/consultas substituem o domínio acadêmico de alunos/cursos; removido atende ao enunciado em vez de deleted; há validações e transações adicionais, CSRF e um Compose para coordenação. As dependências instaladas estão fixadas nos lockfiles. Não é uma cópia literal de todas as linhas do professor.

10. GITHUB E ENTREGA
Alvo autorizado: pedro010306santo-byte/atividade2-evandro, público. A publicação só é considerada concluída depois de conferir o repositório remoto e comparar o commit publicado com o local.
Antes de publicar, revise os arquivos e use uma conta de GitHub autorizada. Não publique ../runtime-pg nem segredos locais.

  git status
  git check-ignore .env.local acesso-local.txt backend/node_modules
  git remote -v

O clone da aula não é o repositório de entrega. O link do repositório próprio deve ser conferido antes da apresentação. Nenhum envio ao Moodle foi autorizado ou executado nesta etapa.

MATERIAL DE APOIO
../guia-de-estudo.pdf e .docx
../roteiro-apresentacao.pdf e .docx
../../engenharia-de-software: respostas e guia de revisão das duas atividades de Engenharia de Software.
