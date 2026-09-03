const BASE_URL = 'http://localhost:8080/api';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  
  if (!res.ok) throw new Error(`API Error [${method} ${path}]: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  return data;
}

async function runE2E() {
  console.log('=== AERO-SENSE E2E TEST ===\n');

  try {
    // 1. Super Admin Login
    console.log('[1] Logging in as Super Admin...');
    const saLogin = await request('POST', '/auth/login', {
      company_name: 'Super Admin',
      email: 'jnvdskushal@gmail.com',
      password: 'Kushal6126@'
    });
    const saToken = saLogin.token;
    console.log(`✓ Super Admin login successful. Token acquired.\n`);

    // 2. Create Company
    console.log('[2] Creating new Company...');
    const companyName = `Test Airlines ${Date.now()}`;
    const company = await request('POST', '/companies', {
      name: companyName,
      status: 'ACTIVE'
    }, saToken);
    console.log(`✓ Company created: ID ${company.id} - ${company.name}\n`);

    // 3. Create Company Admin
    console.log('[3] Creating Company Admin...');
    const adminEmail = `admin${Date.now()}@testairlines.com`;
    const admin = await request('POST', `/companies/${company.id}/admins`, {
      name: 'Test Admin',
      email: adminEmail,
      password: 'TestPassword123!'
    }, saToken);
    console.log(`✓ Company Admin created: ID ${admin.id} - ${admin.email}\n`);

    // 4. Login as Company Admin
    console.log('[4] Logging in as new Company Admin...');
    const caLogin = await request('POST', '/auth/login', {
      company_name: companyName,
      email: adminEmail,
      password: 'TestPassword123!'
    });
    const caToken = caLogin.token;
    console.log(`✓ Company Admin login successful. Token acquired.\n`);

    // 5. Create Aircraft
    console.log('[5] Creating Aircraft...');
    const aircraftReg = `N-${Math.floor(Math.random() * 10000)}`;
    const aircraft = await request('POST', '/aircraft', {
      registration_number: aircraftReg,
      model: 'Boeing 737 MAX',
      manufacturer: 'Boeing',
      status: 'ACTIVE'
    }, caToken);
    console.log(`✓ Aircraft created: ID ${aircraft.id} - ${aircraft.registration_number}\n`);

    // 6. Create Component
    console.log('[6] Creating Component...');
    const component = await request('POST', '/components', {
      serial_number: `SN-${Date.now()}`,
      component_type: 'Landing Gear',
      manufacturer: 'Boeing',
      aircraft_id: aircraft.id,
      status: 'OPERATIONAL'
    }, caToken);
    console.log(`✓ Component created: ID ${component.id} - UUID ${component.component_uuid}\n`);

    // 7. Log Maintenance
    console.log('[7] Logging Maintenance on Component...');
    const maintenance = await request('POST', '/maintenance', {
      component_id: component.id,
      maintenance_type: 'ROUTINE_INSPECTION',
      technician_name: 'Tech Bob',
      description: 'Tested landing gear hydraulics. All green.',
      inspection_result: 'PASSED'
    }, caToken);
    console.log(`✓ Maintenance logged: Record ID ${maintenance.id} - Hash: ${maintenance.record_hash}\n`);

    console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');
    console.log('Data has been persisted to the backend.\n');

  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
  }
}

runE2E();
