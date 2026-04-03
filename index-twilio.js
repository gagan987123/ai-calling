import Fastify from 'fastify';
import fastifyFormBody from '@fastify/formbody';
import fastifyWs from '@fastify/websocket';
import { testConnection } from './database/db.js';
import { CONFIG } from './config-new.js';
import SessionManager from './server/session-manager.js';
import TwilioHandler from './server/twilio-handler.js';
import MediaStreamHandler from './server/media-stream-handler.js';

async function initializeServer() {
    console.log('🏥 Initializing Gagan Hospital AI Assistant Server...');

    // Test database connection
    console.log('📋 Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.error('❌ Database connection failed. Please check your database configuration.');
        process.exit(1);
    }
    console.log('✅ Database connected successfully');

    // Initialize Fastify server
    const fastify = Fastify();
    fastify.register(fastifyFormBody);
    fastify.register(fastifyWs);

    // Initialize components
    const sessionManager = new SessionManager();
    const twilioHandler = new TwilioHandler(sessionManager);
    const mediaStreamHandler = new MediaStreamHandler(sessionManager);

    // Create routes
    twilioHandler.createRoutes(fastify);
    mediaStreamHandler.createWebSocketRoute(fastify);

    // Start the server
    try {
        await fastify.listen({ port: CONFIG.PORT });
        console.log(`🚀 Server is running successfully!`);
        console.log(`📡 Port: ${CONFIG.PORT}`);
        console.log(`📞 Twilio webhook: http://localhost:${CONFIG.PORT}/incoming-call`);
        console.log(`🔌 Media stream: ws://localhost:${CONFIG.PORT}/media-stream`);
        console.log(`💚 Health check: http://localhost:${CONFIG.PORT}/`);
        console.log('');
        console.log('🏥 Gagan Hospital AI Assistant is ready to receive calls!');
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});

// Start the server
initializeServer().catch(error => {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
});
