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

        // Handle Twilio messages
        connection.on('message', (message) => {
            this.handleTwilioMessage(message, session, openAIWs, queuedFirstMessage);
        });

        // Handle connection close
        connection.on('close', async () => {
            await this.handleConnectionClose(session, openAIWs);
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

    handleTwilioMessage(message, session, openAIWs, queuedFirstMessage) {
        try {
            const data = JSON.parse(message);

            if (data.event === 'start') {
                this.handleCallStart(data, session, openAIWs);
            } else if (data.event === 'media') {
                openAIWs.sendAudio(data.media.payload);
            }
        } catch (error) {
            console.error('❌ Error parsing Twilio message:', error);
        }
    }

    handleCallStart(data, session, openAIWs) {
        const streamSid = data.start.streamSid;
        const callSid = data.start.callSid;
        const customParameters = data.start.customParameters;

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
