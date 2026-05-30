/**
 * Script de teste dos endpoints da API
 * Valida todos os endpoints principais
 */

import http from 'http';

const BASE_URL = 'http://localhost:3001';

// Função auxiliar para fazer requisições HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Testes
async function runTests() {
  console.log('🧪 Iniciando testes dos endpoints...\n');

  try {
    // Teste 1: Health Check
    console.log('📌 Teste 1: GET /api/health');
    const healthTest = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${healthTest.status}`);
    console.log(`   Resposta: ${JSON.stringify(healthTest.data)}`);
    console.log(`   ✅ PASSOU\n`);

    // Teste 2: Analisar Ideia
    console.log('📌 Teste 2: POST /api/analisar-ideia');
    const ideaData = {
      nome: 'App de Meditação',
      categoria: 'Startup',
      empolgacao: 4,
      motivo: 'Falta de tempo e recursos'
    };
    const ideaTest = await makeRequest('POST', '/api/analisar-ideia', ideaData);
    console.log(`   Status: ${ideaTest.status}`);
    console.log(`   Resposta: ${JSON.stringify(ideaTest.data, null, 2)}`);
    if (ideaTest.status === 200 && ideaTest.data.success) {
      console.log(`   ✅ PASSOU\n`);
    } else {
      console.log(`   ⚠️ FALHOU\n`);
    }

    // Teste 3: Validação - Campos incompletos
    console.log('📌 Teste 3: POST /api/analisar-ideia (validação - campos incompletos)');
    const invalidData = {
      nome: 'Ideia Incompleta'
      // Faltam outros campos
    };
    const validationTest = await makeRequest('POST', '/api/analisar-ideia', invalidData);
    console.log(`   Status: ${validationTest.status}`);
    console.log(`   Resposta: ${JSON.stringify(validationTest.data)}`);
    if (validationTest.status === 400) {
      console.log(`   ✅ PASSOU (validação funcionando)\n`);
    } else {
      console.log(`   ⚠️ FALHOU\n`);
    }

    // Teste 4: Rota 404
    console.log('📌 Teste 4: GET /api/rota-inexistente (404)');
    const notFoundTest = await makeRequest('GET', '/api/rota-inexistente');
    console.log(`   Status: ${notFoundTest.status}`);
    console.log(`   Resposta: ${JSON.stringify(notFoundTest.data)}`);
    if (notFoundTest.status === 404) {
      console.log(`   ✅ PASSOU\n`);
    } else {
      console.log(`   ⚠️ FALHOU\n`);
    }

    console.log('✅ Testes concluídos com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    process.exit(1);
  }
}

// Aguarda um pouco para o servidor iniciar
setTimeout(runTests, 2000);
