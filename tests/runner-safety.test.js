const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

// Execute the real runner, but never load pg or read local credentials.
function runIsolated(config, variables) {
  const runner = path.join(__dirname, 'run.js');
  const bootstrap = `
    const Module = require('node:module');
    const fs = require('node:fs');
    const originalLoad = Module._load;
    const originalExists = fs.existsSync;
    const originalRead = fs.readFileSync;
    fs.existsSync = function(file) {
      if (String(file).endsWith('.env.local')) return false;
      if (String(file).endsWith('.env')) return true;
      return originalExists.apply(this, arguments);
    };
    fs.readFileSync = function(file) {
      if (String(file).endsWith('.env')) return Buffer.from('');
      return originalRead.apply(this, arguments);
    };
    Module._load = function(request) {
      if (request === '../backend/node_modules/dotenv') {
        return { parse: () => (${JSON.stringify(config)}) };
      }
      if (request === '../backend/node_modules/pg') {
        process.stdout.write('PG_LOAD_BLOCKED');
        process.exit(90);
      }
      return originalLoad.apply(this, arguments);
    };
    require(${JSON.stringify(runner)});
  `;
  const env = { ...process.env };
  delete env.DB_NAME;
  delete env.TEST_DB_NAME;
  return spawnSync(process.execPath, ['-e', bootstrap], {
    env: { ...env, ...variables }, encoding: 'utf8', timeout: 5000,
  });
}

for (const scenario of [
  { name: 'recusa igualdade com DB_NAME efetivo antes de carregar pg',
    config: { DB_NAME: 'arquivo' }, env: { DB_NAME: 'demonstracao_test', TEST_DB_NAME: 'demonstracao_test' } },
  { name: 'recusa igualdade com DB_NAME do arquivo mesmo com override',
    config: { DB_NAME: 'arquivo_test' }, env: { DB_NAME: 'efetivo', TEST_DB_NAME: 'arquivo_test' } },
  { name: 'deriva o nome padrão do DB_NAME efetivo e protege o banco do arquivo',
    config: { DB_NAME: 'efetivo_test' }, env: { DB_NAME: 'efetivo' } },
]) {
  test(scenario.name, () => {
    const result = runIsolated(scenario.config, scenario.env);
    assert.ifError(result.error);
    assert.equal(result.stdout, '', 'pg não deve ser carregado');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /O banco de testes não pode ser o banco de demonstração/);
  });
}

test('permite banco separado até a barreira pg sem conectar', () => {
  const result = runIsolated({ DB_NAME: 'arquivo' }, { DB_NAME: 'efetivo', TEST_DB_NAME: 'isolado_test' });
  assert.ifError(result.error);
  assert.equal(result.status, 90);
  assert.equal(result.stdout, 'PG_LOAD_BLOCKED');
  assert.equal(result.stderr, '');
});
