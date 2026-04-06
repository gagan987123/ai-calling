import pkg from 'twilio';
const { Twilio } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

async function makeCall() {
    try {
        const call = await client.calls.create({
            url: `https://${process.env.REPLIT_DEV_DOMAIN}/incoming-call`, // Your deployed server endpoint
            to: process.env.YOUR_VERIFIED_PHONE_NUMBER, // Your verified phone number
            from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
        });

        console.log('Call initiated:', call.sid);
    } catch (error) {
        console.error('Error making call:', error);
    }
}

makeCall();
