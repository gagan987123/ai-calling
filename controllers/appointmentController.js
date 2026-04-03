import { query } from '../database/db.js';

export async function bookAppointment(args) {
  const { patient_name, patient_phone, doctor_id, appointment_date, appointment_time, symptoms } =
    args;

  const patientResult = await query('SELECT id FROM patients WHERE phone = $1', [patient_phone]);

  let patient_id;

  if (patientResult.rows.length === 0) {
    const insertPatient = await query(
      'INSERT INTO patients (name, phone) VALUES ($1, $2) RETURNING id',
      [patient_name, patient_phone]
    );
    patient_id = insertPatient.rows[0].id;
  } else {
    patient_id = patientResult.rows[0].id;
  }

  const doctorCheck = await query(
    'SELECT id, name, specialization, available FROM doctors WHERE id = $1',
    [doctor_id]
  );

  if (doctorCheck.rows.length === 0) {
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

  if (!doctorCheck.rows[0].available) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: `Dr. ${doctorCheck.rows[0].name} is currently not available`,
          }),
        },
      ],
    };
  }

  const conflictCheck = await query(
    `SELECT id FROM appointments 
     WHERE doctor_id = $1 
     AND appointment_date = $2 
     AND appointment_time = $3 
     AND status = 'scheduled'`,
    [doctor_id, appointment_date, appointment_time]
  );

  if (conflictCheck.rows.length > 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: 'This time slot is already booked. Please choose a different time.',
          }),
        },
      ],
    };
  }

  const appointmentResult = await query(
    `INSERT INTO appointments 
     (patient_id, doctor_id, appointment_date, appointment_time, symptoms, status)
     VALUES ($1, $2, $3, $4, $5, 'scheduled')
     RETURNING id`,
    [patient_id, doctor_id, appointment_date, appointment_time, symptoms]
  );

  const appointment_id = appointmentResult.rows[0].id;

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Appointment booked successfully with Dr. ${doctorCheck.rows[0].name}`,
          appointment_id: appointment_id,
          patient_name: patient_name,
          doctor_name: doctorCheck.rows[0].name,
          specialization: doctorCheck.rows[0].specialization,
          appointment_date: appointment_date,
          appointment_time: appointment_time,
          symptoms: symptoms,
        }),
      },
    ],
  };
}

export async function getAppointments(args) {
  const { patient_phone, status } = args;

  let queryText = `
    SELECT 
      a.id,
      a.appointment_date,
      a.appointment_time,
      a.symptoms,
      a.status,
      p.name as patient_name,
      p.phone as patient_phone,
      d.name as doctor_name,
      d.specialization,
      dept.name as department
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN departments dept ON d.department_id = dept.id
    WHERE 1=1
  `;

  const params = [];

  if (patient_phone) {
    queryText += ` AND p.phone = $${params.length + 1}`;
    params.push(patient_phone);
  }

  if (status) {
    queryText += ` AND a.status = $${params.length + 1}`;
    params.push(status);
  }

  queryText += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT 10';

  const result = await query(queryText, params);

  if (result.rows.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'No appointments found',
            appointments: [],
          }),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Found ${result.rows.length} appointment(s)`,
          appointments: result.rows.map(apt => ({
            id: apt.id,
            patient_name: apt.patient_name,
            patient_phone: apt.patient_phone,
            doctor_name: apt.doctor_name,
            specialization: apt.specialization,
            department: apt.department,
            date: apt.appointment_date,
            time: apt.appointment_time,
            symptoms: apt.symptoms,
            status: apt.status,
          })),
        }),
      },
    ],
  };
}

export async function cancelAppointment(args) {
  const { appointment_id } = args;

  const checkResult = await query(
    `SELECT 
      a.id,
      a.status,
      p.name as patient_name,
      d.name as doctor_name,
      a.appointment_date,
      a.appointment_time
     FROM appointments a
     JOIN patients p ON a.patient_id = p.id
     JOIN doctors d ON a.doctor_id = d.id
     WHERE a.id = $1`,
    [appointment_id]
  );

  if (checkResult.rows.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: 'Appointment not found',
          }),
        },
      ],
    };
  }

  const appointment = checkResult.rows[0];

  if (appointment.status === 'cancelled') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: 'Appointment is already cancelled',
          }),
        },
      ],
    };
  }

  if (appointment.status === 'completed') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: 'Cannot cancel a completed appointment',
          }),
        },
      ],
    };
  }

  await query('UPDATE appointments SET status = $1 WHERE id = $2', ['cancelled', appointment_id]);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: 'Appointment cancelled successfully',
          appointment_id: appointment_id,
          patient_name: appointment.patient_name,
          doctor_name: appointment.doctor_name,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
        }),
      },
    ],
  };
}
