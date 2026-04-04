import pkg from 'twilio';
const { Twilio } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.twilio' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

async function makeCall() {
    try {
        const call = await client.calls.create({
            url: 'https://31dd3139-eafe-428b-a043-43e642be8a47-00-2dik81votxqir.pike.replit.dev/incoming-call', // Your deployed server endpoint
            to: process.env.YOUR_VERIFIED_PHONE_NUMBER,          // Your verified phone number
            from: process.env.TWILIO_PHONE_NUMBER,                      // Your Twilio number
        });

        console.log('Call initiated:', call.sid);
    } catch (error) {
        console.error('Error making call:', error);
    }
}

makeCall();
