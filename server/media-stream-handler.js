import MCPClient from '../mcp/client.js';
import AIOrchestrator from '../ai/orchestrator-mcp.js';
import OpenAIWebSocket from './openai-websocket.js';

export class MediaStreamHandler {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }

    async handleConnection(connection, req) {
        console.log('🔌 Client connected to media-stream');

        let streamSid = '';
        let openAIWs = null;
        let queuedFirstMessage = null;

        // Get or create session
        const sessionId = req.headers['x-twilio-call-sid'] || `session_${Date.now()}`;
        let session = this.sessionManager.getSession(sessionId);
        
        if (!session) {
            session = this.sessionManager.createSession(sessionId, 'Unknown', {});
        }

        console.log(`📋 Session ${sessionId} - Caller: ${session.callerNumber}`);

        // Initialize MCP and AI components
        await this.initializeMCPComponents(session);

        // Initialize OpenAI WebSocket
        openAIWs = new OpenAIWebSocket(
            session,
            (response, session) => this.handleOpenAIMessage(connection, session, response, openAIWs),
            () => this.handleWebSocketClose(session),
            (error) => console.error('OpenAI WebSocket error:', error)
        );

        await openAIWs.connect();

        // Wait for session to be ready before sending first message
        setTimeout(() => {
            if (openAIWs && openAIWs.isConnected()) {
                console.log('🎤 Sending initial greeting to OpenAI');
                openAIWs.sendFirstMessage("Namaste! Aapka swagat hai Gagan Hospital mein. Main aapki kya madad kar sakta hoon?");
            } else {
                console.log('⚠️ OpenAI not ready, will send greeting when ready');
            }
        }, 2000);

        // Handle messages
        connection.on('message', (message) => {
            this.handleMessage(message, session, openAIWs, queuedFirstMessage);
        });

        // Handle connection close
        connection.on('close', async () => {
            await this.handleConnectionClose(session, openAIWs);
        });

        // Add ping/pong keep-alive
        connection.on('pong', () => {
            console.log('🏓 Received pong from client');
        });

        return { session, openAIWs };
    }

    async initializeMCPComponents(session) {
        try {
            console.log('🔧 Initializing MCP Client for session:', session.id);
            session.mcpClient = new MCPClient();
            await session.mcpClient.connect();
            
            session.aiOrchestrator = new AIOrchestrator(session.mcpClient);
            console.log('✅ MCP and AI components initialized for session:', session.id);
        } catch (error) {
            console.error('❌ Failed to initialize MCP/AI components:', error);
            // Continue without MCP - will use basic AI responses
        }
    }

    handleMessage(message, session, openAIWs, queuedFirstMessage) {
        try {
            const data = JSON.parse(message);

            if (data.event === 'start') {
                this.handleCallStart(data, session, openAIWs);
            } else if (data.event === 'media') {
                // Send audio to OpenAI with proper format conversion
                if (data.media && data.media.payload) {
                    try {
                        console.log('🎤 Sending audio to OpenAI, payload length:', data.media.payload.length);
                        
                        // For now, send the audio directly as base64 (OpenAI will handle conversion)
                        // The Realtime API can handle various audio formats
                        openAIWs.sendAudio(data.media.payload);
                        
                        console.log('✅ Audio sent to OpenAI');
                        
                        // Also send a text message as fallback to test if OpenAI responds
                        setTimeout(() => {
                            this.sendTextToOpenAI("Patient is speaking, please respond", openAIWs);
                        }, 1000);
                        
                    } catch (error) {
                        console.error('❌ Error processing audio:', error);
                    }
                }
            } else if (data.event === 'text') {
                // Handle text messages as fallback
                if (data.text) {
                    console.log('💬 Text message received:', data.text);
                    this.sendTextToOpenAI(data.text, openAIWs);
                }
            } else if (data.event === 'connected') {
                console.log('✅ Media stream connected');
            } else if (data.event === 'stop') {
                console.log('🛑 Media stream stopped');
            } else {
                console.log('🔍 Unknown event:', data.event);
            }
        } catch (error) {
            console.error('❌ Error parsing message:', error);
        }
    }

    sendTextToOpenAI(text, openAIWs) {
        if (openAIWs && openAIWs.isConnected()) {
            // Create a conversation item for user text (following the reference pattern)
            const userMessage = {
                type: 'conversation.item.create',
                item: {
                    type: 'message',
                    role: 'user',
                    content: [{
                        type: 'input_text',
                        text: text
                    }]
                }
            };
            
            openAIWs.send(JSON.stringify(userMessage));
            
            // Trigger response generation (following the reference pattern)
            const responseCreate = {
                type: 'response.create',
                response: {
                    modalities: ['text', 'audio'],
                    instructions: 'Respond in Hinglish to help the patient with their healthcare needs.'
                }
            };
            
            openAIWs.send(JSON.stringify(responseCreate));
            console.log('💬 Text message sent to OpenAI with response trigger');
        }
    }

    handleCallStart(data, session, openAIWs) {
        const streamSid = data.start?.streamSid;
        const callSid = data.start?.callSid;
        const customParameters = data.start?.customParameters;

        console.log('📞 Call started:', { callSid, streamSid });
        console.log('📋 Custom Parameters:', customParameters);

        // Update session with call details
        const callerNumber = customParameters?.callerNumber || 'Unknown';
        const firstMessage = customParameters?.firstMessage || session.firstMessage;

        this.sessionManager.updateSession(session.id, {
            streamSid: streamSid,
            callerNumber: callerNumber
        });

        console.log('👤 Caller Number:', callerNumber);
        console.log('💬 First Message:', firstMessage);

        // Send first message when OpenAI is ready, with robust retry
        const sendWithRetry = (msg, retries = 5, delay = 500) => {
            if (openAIWs.sendFirstMessage(msg)) return;
            if (retries > 0) {
                setTimeout(() => sendWithRetry(msg, retries - 1, delay), delay);
            } else {
                console.error('❌ Failed to send first message after retries');
            }
        };
        sendWithRetry(firstMessage);
    }

    async handleOpenAIMessage(connection, session, response, openAIWs) {
        // Handle audio responses
        if (response.type === 'response.audio.delta' && response.delta) {
            connection.send(JSON.stringify({
                event: 'media',
                streamSid: session.streamSid,
                media: { payload: response.delta }
            }));
        }

        // Handle function calls (MCP tools)
        if (response.type === 'response.function_call_arguments.done') {
            await this.handleFunctionCall(response, session, openAIWs);
        }
    }

    async handleFunctionCall(response, session, openAIWs) {
        console.log("🔧 Function called:", response);
        const functionName = response.name;
        const args = JSON.parse(response.arguments);
        const callId = response.call_id;

        if (session.aiOrchestrator && session.mcpClient) {
            try {
                console.log(`🔧 Calling MCP tool: ${functionName}`, args);
                const toolResult = await session.mcpClient.callTool(functionName, args);
                console.log('✅ Tool result:', toolResult);

                // Send result back to OpenAI with call_id to match the function call
                const functionOutputEvent = {
                    type: "conversation.item.create",
                    item: {
                        type: "function_call_output",
                        call_id: callId,
                        output: JSON.stringify(toolResult),
                    }
                };

                openAIWs.send(JSON.stringify(functionOutputEvent));
                
                // Trigger AI to generate response based on tool result
                openAIWs.send(JSON.stringify({
                    type: "response.create",
                    response: {
                        modalities: ["text", "audio"],
                        instructions: `Respond to the user based on the tool result: ${JSON.stringify(toolResult)}. Be helpful and compassionate.`,
                    }
                }));

                console.log('📤 Tool result sent to OpenAI');

            } catch (error) {
                console.error('❌ Error calling MCP tool:', error);
                openAIWs.sendErrorResponse();
            }
        } else {
            // MCP not available - send fallback output so OpenAI doesn't hang
            console.error('⚠️ MCP not available, sending fallback for function call:', functionName);
            const fallbackOutput = {
                type: "conversation.item.create",
                item: {
                    type: "function_call_output",
                    call_id: callId,
                    output: JSON.stringify({ success: false, error: 'Hospital system temporarily unavailable. Please try again.' }),
                }
            };
            openAIWs.send(JSON.stringify(fallbackOutput));
            openAIWs.send(JSON.stringify({
                type: "response.create",
                response: {
                    modalities: ["text", "audio"],
                    instructions: "Apologize to the patient that the hospital system is temporarily unavailable and ask them to try again in a moment.",
                }
            }));
        }
    }

    async handleWebSocketClose(session) {
        console.log(`🔌 WebSocket closed for session ${session.id}`);
    }

    async handleConnectionClose(session, openAIWs) {
        console.log(`🔌 Client disconnected (${session.id})`);

        // Clean up OpenAI connection
        if (openAIWs) {
            openAIWs.close();
        }

        // Clean up MCP connections
        if (session.mcpClient) {
            try {
                await session.mcpClient.disconnect();
                console.log('✅ MCP client disconnected');
            } catch (error) {
                console.error('❌ Error disconnecting MCP client:', error);
            }
        }

        // Clean up session
        this.sessionManager.deleteSession(session.id);
    }

    createWebSocketRoute(fastify) {
        fastify.register(async (fastify) => {
            fastify.get('/media-stream', { websocket: true }, (connection, req) => {
                this.handleConnection(connection, req);
            });
        });
    }
}

export default MediaStreamHandler;
