import dotenv from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { suggestDoctor, checkDoctorAvailability } from '../controllers/doctorController.js';
import {
  bookAppointment,
  getAppointments,
  cancelAppointment,
} from '../controllers/appointmentController.js';

dotenv.config();

const server = new McpServer({
  name: 'hospital-mcp-server',
  version: '1.0.0',
});

// Register suggest_doctor tool
server.registerTool(
  'suggest_doctor',
  {
    title: 'Suggest Doctor',
    description:
      'Suggest doctors based on symptoms, specialization, or language preference. Returns available doctors with their details.',
    inputSchema: {
      symptoms: z
        .string()
        .optional()
        .describe('Patient symptoms (e.g., "chest pain", "headache", "fever")'),
      specialization: z
        .string()
        .optional()
        .describe('Doctor specialization (e.g., "Cardiologist", "Neurologist", "Pediatrician")'),
      language: z
        .string()
        .optional()
        .describe('Preferred language (e.g., "Hindi", "Kannada", "Tamil")'),
    },
  },
  async ({ symptoms, specialization, language }) => {
    return await suggestDoctor({ symptoms, specialization, language });
  }
);

// Register check_doctor_availability tool
server.registerTool(
  'check_doctor_availability',
  {
    title: 'Check Doctor Availability',
    description: 'Check if a specific doctor is available and get their schedule information.',
    inputSchema: {
      doctor_id: z.number().optional().describe('The ID of the doctor to check availability for'),
      doctor_name: z
        .string()
        .optional()
        .describe('The name of the doctor (alternative to doctor_id)'),
    },
  },
  async ({ doctor_id, doctor_name }) => {
    return await checkDoctorAvailability({ doctor_id, doctor_name });
  }
);

// Register book_appointment tool
server.registerTool(
  'book_appointment',
  {
    title: 'Book Appointment',
    description:
      'Book an appointment for a patient with a doctor. Creates a new appointment record.',
    inputSchema: {
      patient_name: z.string().describe('Patient full name'),
      patient_phone: z.string().describe('Patient phone number (format: +91-XXXXXXXXXX)'),
      doctor_id: z.number().describe('The ID of the doctor'),
      appointment_date: z.string().describe('Appointment date (format: YYYY-MM-DD)'),
      appointment_time: z.string().describe('Appointment time (format: HH:MM)'),
      symptoms: z.string().describe('Patient symptoms or reason for visit'),
    },
  },
  async ({
    patient_name,
    patient_phone,
    doctor_id,
    appointment_date,
    appointment_time,
    symptoms,
  }) => {
    return await bookAppointment({
      patient_name,
      patient_phone,
      doctor_id,
      appointment_date,
      appointment_time,
      symptoms,
    });
  }
);

// Register get_appointments tool
server.registerTool(
  'get_appointments',
  {
    title: 'Get Appointments',
    description: 'Get appointments for a patient by phone number or get all upcoming appointments.',
    inputSchema: {
      patient_phone: z.string().optional().describe('Patient phone number to filter appointments'),
      status: z
        .string()
        .optional()
        .describe('Filter by appointment status (scheduled, completed, cancelled)'),
    },
  },
  async ({ patient_phone, status }) => {
    return await getAppointments({ patient_phone, status });
  }
);

// Register cancel_appointment tool
server.registerTool(
  'cancel_appointment',
  {
    title: 'Cancel Appointment',
    description: 'Cancel an existing appointment by appointment ID.',
    inputSchema: {
      appointment_id: z.number().describe('The ID of the appointment to cancel'),
    },
  },
  async ({ appointment_id }) => {
    return await cancelAppointment({ appointment_id });
  }
);

(async () => {
  await server.connect(new StdioServerTransport());
  console.error('Hospital MCP Server running on stdio');
})();
