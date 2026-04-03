import { CONFIG } from './config.js';

export class ExotelHandler {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }

    handleIncomingCall(request, reply) {
        console.log('📞 Incoming call via Exotel');

        // Get all incoming call details from the request body or query string
        const exotelParams = request.body || request.query;
        console.log('Exotel Inbound Details:', JSON.stringify(exotelParams, null, 2));

        // Extract caller's number and session ID (CallSid)
        const callerNumber = exotelParams.From || 'Unknown';
        const sessionId = exotelParams.CallSid;
        console.log('Caller Number:', callerNumber);
        console.log('Session ID (CallSid):', sessionId);

        // Create a new session for this call
        const session = this.sessionManager.createSession(sessionId, callerNumber, exotelParams);

        // Respond to Exotel with XML to connect the call to the media stream
        const exotelResponse = `<?xml version="1.0" encoding="UTF-8"?>
                              <Response>
                                  <Connect>
                                      <Stream url="wss://${request.headers.host}/media-stream">
                                            <Parameter name="firstMessage" value="${session.firstMessage}" />
                                            <Parameter name="callerNumber" value="${callerNumber}" />
                                      </Stream>
                                  </Connect>
                              </Response>`;

        reply.type('text/xml').send(exotelResponse);
        return session;
    }

    async handleCallStatus(request, reply) {
        try {
            const { CallSid, CallStatus, CallDuration } = request.body;
            
            console.log('📊 Call status update:', { CallSid, CallStatus, CallDuration });

            if (CallStatus === 'completed' || CallStatus === 'failed') {
                this.sessionManager.endSession(CallSid);
                
                setTimeout(() => {
                    this.sessionManager.deleteSession(CallSid);
                }, 5 * 60 * 1000);
            }

            reply.status(200).json({ success: true });
        } catch (error) {
            console.error('Call status error:', error);
            reply.status(500).json({ error: error.message });
        }
    }

    createRoutes(fastify) {
        // Root route for health check
        fastify.get('/', async (request, reply) => {
            reply.send({ 
                message: 'Gagan Hospital AI Assistant Server (Exotel) is running!',
                activeSessions: this.sessionManager.getSessionCount(),
                port: CONFIG.PORT
            });
        });

        // Handle incoming calls from Exotel
        fastify.all('/incoming-call', async (request, reply) => {
            this.handleIncomingCall(request, reply);
        });

        // Handle call status updates from Exotel
        fastify.post('/call-status', async (request, reply) => {
            await this.handleCallStatus(request, reply);
        });

        // Get session info
        fastify.get('/sessions/:callSid?', async (request, reply) => {
            try {
                const { callSid } = request.params;

                if (callSid) {
                    const session = this.sessionManager.getSession(callSid);
                    if (!session) {
                        return reply.status(404).json({ error: 'Session not found' });
                    }
                    return reply.status(200).json(session);
                }

                const activeSessions = this.sessionManager.getAllActiveSessions();
                reply.status(200).json({
                    count: this.sessionManager.getSessionCount(),
                    activeSessions,
                });
            } catch (error) {
                console.error('Get session info error:', error);
                reply.status(500).json({ error: error.message });
            }
        });
    }
}

export default ExotelHandler;
