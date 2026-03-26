const http = require('http');

// First: create a project
const createProject = () => {
  const data = JSON.stringify({ name: 'Test Project', location: 'Paris' });
  const req = http.request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // NOTE: Replace with a real Supabase JWT Bearer token
        'Authorization': 'Bearer <YOUR_TOKEN_HERE>',
      },
    },
    (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('CREATE PROJECT - Status:', res.statusCode);
        console.log('CREATE PROJECT - Body:', body);
        if (res.statusCode === 201) {
          const project = JSON.parse(body);
          console.log('Project ID:', project.id);
          // Then create a scenario
          createScenario(project.id);
        }
      });
    },
  );
  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
};

const createScenario = (projectId) => {
  const data = JSON.stringify({
    name: 'Scenario 1',
    annualHouseholdIncome: 54000,
    monthlyCurrentDebtPayments: 200,
    annualRatePercent: 3.5,
    durationMonths: 240,
    maxDebtRatioPercent: 35,
    downPayment: 15000,
    propertyType: 'OLD',
    departmentCode: '75',
  });
  const req = http.request(
    {
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1/projects/${projectId}/scenarios`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <YOUR_TOKEN_HERE>',
      },
    },
    (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('CREATE SCENARIO - Status:', res.statusCode);
        console.log('CREATE SCENARIO - Body:', body);
      });
    },
  );
  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
};

// Replace with real token to test
const token = process.argv[2];
if (!token) {
  console.error('Usage: node test-api.js <SUPABASE_JWT_TOKEN>');
  process.exit(1);
}

// Override the Authorization header
const originalLog = console.log;
const testWithToken = () => {
  const data = JSON.stringify({ name: 'Test Project', location: 'Paris' });
  const req = http.request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
    (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
        if (res.statusCode === 201) {
          const p = JSON.parse(body);
          createScenarioWithToken(p.id, token);
        }
      });
    },
  );
  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
};

const createScenarioWithToken = (projectId, token) => {
  const data = JSON.stringify({
    name: 'Scenario 1',
    annualHouseholdIncome: 54000,
    monthlyCurrentDebtPayments: 200,
    annualRatePercent: 3.5,
    durationMonths: 240,
    maxDebtRatioPercent: 35,
    downPayment: 15000,
    propertyType: 'OLD',
    departmentCode: '75',
  });
  const req = http.request(
    {
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1/projects/${projectId}/scenarios`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
    (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('Scenario Status:', res.statusCode);
        console.log('Scenario Body:', body);
      });
    },
  );
  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
};

testWithToken();
