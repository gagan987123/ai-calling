import { query } from '../database/db.js';

export async function suggestDoctor(args) {
  const { symptoms, specialization, language } = args;

  let queryText = `
    SELECT 
      d.id,
      d.name,
      d.specialization,
      dept.name as department,
      d.phone,
      d.email,
      d.experience_years,
      d.languages,
      d.available
    FROM doctors d
    JOIN departments dept ON d.department_id = dept.id
    WHERE d.available = true
  `;

  const conditions = [];
  const params = [];

  if (specialization) {
    conditions.push(`d.specialization ILIKE $${params.length + 1}`);
    params.push(`%${specialization}%`);
  }

  if (language) {
    conditions.push(`d.languages ILIKE $${params.length + 1}`);
    params.push(`%${language}%`);
  }

  if (conditions.length > 0) {
    queryText += ` AND ${conditions.join(' AND ')}`;
  }

  queryText += ' ORDER BY d.experience_years DESC LIMIT 5';

  const result = await query(queryText, params);

  if (result.rows.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message:
              'No doctors found matching your criteria. Please try different search parameters.',
            doctors: [],
          }),
        },
      ],
    };
  }

  const symptomContext = symptoms
    ? `\n\nBased on symptoms "${symptoms}", these doctors are recommended:`
    : '';

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Found ${result.rows.length} available doctor(s)${symptomContext}`,
          doctors: result.rows.map(doc => ({
            id: doc.id,
            name: doc.name,
            specialization: doc.specialization,
            department: doc.department,
            experience: `${doc.experience_years} years`,
            languages: doc.languages,
            phone: doc.phone,
            available: doc.available,
          })),
        }),
      },
    ],
  };
}

export async function checkDoctorAvailability(args) {
  const { doctor_id, doctor_name } = args;

  let queryText = `
    SELECT 
      d.id,
      d.name,
      d.specialization,
      d.available,
      COUNT(a.id) as upcoming_appointments
    FROM doctors d
    LEFT JOIN appointments a ON d.id = a.doctor_id 
      AND a.appointment_date >= CURRENT_DATE 
      AND a.status = 'scheduled'
    WHERE 1=1
  `;

  const params = [];

  if (doctor_id) {
    queryText += ` AND d.id = $${params.length + 1}`;
    params.push(doctor_id);
  } else if (doctor_name) {
    queryText += ` AND d.name ILIKE $${params.length + 1}`;
    params.push(`%${doctor_name}%`);
  }

  queryText += ' GROUP BY d.id, d.name, d.specialization, d.available';

  const result = await query(queryText, params);

  if (result.rows.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: 'Doctor not found',
          }),
        },
      ],
    };
  }

  const doctor = result.rows[0];

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          doctor_id: doctor.id,
          doctor_name: doctor.name,
          specialization: doctor.specialization,
          available: doctor.available,
          upcoming_appointments: parseInt(doctor.upcoming_appointments),
          message: doctor.available
            ? `Dr. ${doctor.name} is available. Currently has ${doctor.upcoming_appointments} upcoming appointments.`
            : `Dr. ${doctor.name} is currently not available.`,
        }),
      },
    ],
  };
}
