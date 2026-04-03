import { CONFIG } from './config.js';

export class TwilioHandler {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }

    handleIncomingCall(request, reply) {
        console.log('📞 Incoming call');

        // Get all incoming call details from the request body or query string
        const twilioParams = request.body || request.query;
        console.log('Twilio Inbound Details:', JSON.stringify(twilioParams, null, 2));

        // Extract caller's number and session ID (CallSid)
        const callerNumber = twilioParams.From || 'Unknown';
        const sessionId = twilioParams.CallSid;
        console.log('Caller Number:', callerNumber);
        console.log('Session ID (CallSid):', sessionId);

        // Create a new session for this call
        const session = this.sessionManager.createSession(sessionId, callerNumber, twilioParams);

        // Respond to Twilio with TwiML to connect the call to the media stream
        const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                              <Response>
                                  <Connect>
                                      <Stream url="wss://${request.headers.host}/media-stream">
                                            <Parameter name="firstMessage" value="${session.firstMessage}" />
                                            <Parameter name="callerNumber" value="${callerNumber}" />
                                      </Stream>
                                  </Connect>
                              </Response>`;

        reply.type('text/xml').send(twimlResponse);
        return session;
    }

    createRoutes(fastify) {
        // Root route for health check
        fastify.get('/', async (request, reply) => {
            reply.send({ 
                message: 'Gagan Hospital AI Assistant Server is running!',
                activeSessions: this.sessionManager.getSessionCount(),
                port: CONFIG.PORT
            });
        });

        // Handle incoming calls from Twilio
        fastify.all('/incoming-call', async (request, reply) => {
            this.handleIncomingCall(request, reply);
        });
    }
}

export default TwilioHandler;
