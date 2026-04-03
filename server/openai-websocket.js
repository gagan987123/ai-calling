import WebSocket from 'ws';
import { CONFIG, SYSTEM_MESSAGE, LOG_EVENT_TYPES } from './config.js';

export class OpenAIWebSocket {
    constructor(session, onMessage, onClose, onError) {
        this.session = session;
        this.onMessage = onMessage;
        this.onClose = onClose;
        this.onError = onError;
        this.ws = null;
        this.ready = false;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                // Set connection timeout
                const timeout = setTimeout(() => {
                    console.error('❌ OpenAI connection timeout');
                    reject(new Error('Connection timeout'));
                }, 10000);

                this.ws = new WebSocket(CONFIG.OPENAI_REALTIME_URL, {
                    headers: {
                        Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
                        "OpenAI-Beta": CONFIG.OPENAI_BETA_HEADER
                    }
                });

                this.setupEventHandlers(resolve, reject, timeout);
            } catch (error) {
                console.error('❌ Failed to connect to OpenAI:', error);
                reject(error);
            }
        });
    }

    setupEventHandlers(onConnected, onFailed, timeout) {
        this.ws.on('open', () => {
            clearTimeout(timeout);
            console.log('✅ Connected to the OpenAI Realtime API');
            this.ready = true;
            this.sendSessionUpdate();
            if (onConnected) onConnected();
        });

        this.ws.on('message', (data) => {
            this.handleMessage(data);
        });

        this.ws.on('close', (event) => {
            clearTimeout(timeout);
            console.log(`🔌 OpenAI WebSocket connection closed — code: ${event.code}, reason: ${event.reason || 'none'}`);
            this.ready = false;
            if (this.onClose) this.onClose();
        });

        this.ws.on('error', (error) => {
            clearTimeout(timeout);
            console.error('❌ Error in OpenAI WebSocket:', error);
            if (this.onError) this.onError(error);
        });
    }

    sendSessionUpdate() {
        const sessionUpdate = {
            type: 'session.update',
            session: {
                turn_detection: { type: 'server_vad', silence_duration_ms: 500 },
                input_audio_format: 'g711_ulaw',
                output_audio_format: 'g711_ulaw',
                voice: CONFIG.VOICE,
                instructions: SYSTEM_MESSAGE,
                modalities: ["text", "audio"],
                temperature: 0.7,
                input_audio_transcription: {
                    "model": "whisper-1"
                },
                tools: this.session.aiOrchestrator ? this.session.mcpClient.getToolsForOpenAI() : [],
                tool_choice: "auto"
            }
        };

        console.log('📤 Sending session update to OpenAI with G.711 audio format for Exotel');
        this.send(JSON.stringify(sessionUpdate));
    }

    sendFirstMessage(message) {
        if (!this.ready) {
            console.log('⏳ OpenAI not ready, queuing first message');
            return false;
        }

        const messageItem = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{ type: 'input_text', text: message }]
            }
        };

        console.log('📤 Sending first message to OpenAI:', message);
        this.send(JSON.stringify(messageItem));
        this.send(JSON.stringify({ type: 'response.create' }));
        return true;
    }

    sendAudio(audioPayload) {
        if (this.ready && this.ws.readyState === WebSocket.OPEN) {
            const audioAppend = {
                type: 'input_audio_buffer.append',
                audio: audioPayload
            };
            this.send(JSON.stringify(audioAppend));
        }
    }

    handleMessage(data) {
        try {
            const response = JSON.parse(data);

            // Log important events
            if (LOG_EVENT_TYPES.includes(response.type)) {
                console.log(`📋 OpenAI Event: ${response.type}`);
            }

            // Handle transcription
            if (response.type === 'conversation.item.input_audio_transcription.completed' && response.transcript) {
                const userMessage = response.transcript.trim();
                this.session.transcript += `User: ${userMessage}\n`;
                console.log(`👤 User (${this.session.id}): ${userMessage}`);
            }

            // Handle agent response
            if (response.type === 'response.done') {
                const agentMessage = response.response.output[0]?.content?.find(content => content.transcript)?.transcript || 'Agent message not found';
                this.session.transcript += `Agent: ${agentMessage}\n`;
                console.log(`🤖 Agent (${this.session.id}): ${agentMessage}`);
            }

            // Forward to handler
            if (this.onMessage) {
                this.onMessage(response, this.session);
            }

        } catch (error) {
            console.error('❌ Error parsing OpenAI message:', error);
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    sendAudio(audioData) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const audioMessage = {
                type: 'input_audio_buffer.append',
                audio: audioData
            };
            this.send(JSON.stringify(audioMessage));
        }
    }

    sendErrorResponse(message = "I apologize, but I'm having trouble processing your request right now. Please try again or speak with a human representative.") {
        this.send(JSON.stringify({
            type: "response.create",
            response: {
                modalities: ["text", "audio"],
                instructions: message,
            }
        }));
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }

    isConnected() {
        return this.ready && this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

export default OpenAIWebSocket;
