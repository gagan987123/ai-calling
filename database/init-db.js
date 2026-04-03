import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { query, testConnection } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to database. Make sure PostgreSQL is running.');
    console.log('💡 Run: npm run docker:up');
    process.exit(1);
  }

  try {
    const sqlFilePath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📝 Executing SQL initialization script...\n');
    await query(sql);

    console.log('\n✅ Database initialized successfully!\n');

    const stats = await getDatabaseStats();
    console.log('📊 Database Statistics:');
    console.log(`   - Departments: ${stats.departments}`);
    console.log(`   - Doctors: ${stats.doctors}`);
    console.log(`   - Patients: ${stats.patients}`);
    console.log(`   - Appointments: ${stats.appointments}`);
    console.log('\n');

    await showSampleData();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function getDatabaseStats() {
  const departments = await query('SELECT COUNT(*) FROM departments');
  const doctors = await query('SELECT COUNT(*) FROM doctors');
  const patients = await query('SELECT COUNT(*) FROM patients');
  const appointments = await query('SELECT COUNT(*) FROM appointments');

  return {
    departments: departments.rows[0].count,
    doctors: doctors.rows[0].count,
    patients: patients.rows[0].count,
    appointments: appointments.rows[0].count,
  };
}

async function showSampleData() {
  console.log('👨‍⚕️ Sample Doctors:');
  const doctors = await query(`
    SELECT d.name, d.specialization, dept.name as department, d.languages, d.available
    FROM doctors d
    JOIN departments dept ON d.department_id = dept.id
    LIMIT 5
  `);

  doctors.rows.forEach(doc => {
    console.log(`   - ${doc.name} (${doc.specialization}) - ${doc.department}`);
    console.log(`     Languages: ${doc.languages} | Available: ${doc.available ? '✓' : '✗'}`);
  });

  console.log('\n📅 Sample Appointments:');
  const appointments = await query(`
    SELECT 
      a.id,
      p.name as patient_name,
      d.name as doctor_name,
      d.specialization,
      a.appointment_date,
      a.appointment_time,
      a.symptoms,
      a.status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    LIMIT 3
  `);

  appointments.rows.forEach(apt => {
    console.log(`   - ${apt.patient_name} → Dr. ${apt.doctor_name} (${apt.specialization})`);
    console.log(
      `     Date: ${apt.appointment_date.toISOString().split('T')[0]} ${apt.appointment_time}`
    );
    console.log(`     Symptoms: ${apt.symptoms}`);
    console.log(`     Status: ${apt.status}\n`);
  });
}

initializeDatabase();
