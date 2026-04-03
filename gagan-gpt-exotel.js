import Fastify from 'fastify';
import fastifyFormBody from '@fastify/formbody';
import fastifyWs from '@fastify/websocket';
import { testConnection } from './database/db.js';
import { CONFIG } from './server/config.js';
import SessionManager from './server/session-manager.js';
import ExotelHandler from './server/exotel-handler.js';
import MediaStreamHandler from './server/media-stream-handler.js';

async function initializeServer() {
    console.log('🏥 Initializing Gagan Hospital AI Assistant Server (Exotel)...');

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
    const exotelHandler = new ExotelHandler(sessionManager);
    const mediaStreamHandler = new MediaStreamHandler(sessionManager);

    // Create routes
    exotelHandler.createRoutes(fastify);
    mediaStreamHandler.createWebSocketRoute(fastify);

    // Start the server
    try {
        await fastify.listen({ port: CONFIG.PORT });
        console.log(`🚀 Server is running successfully!`);
        console.log(`📡 Port: ${CONFIG.PORT}`);
        console.log(`📞 Exotel webhook: http://localhost:${CONFIG.PORT}/incoming-call`);
        console.log(`📊 Call status: http://localhost:${CONFIG.PORT}/call-status`);
        console.log(`🔌 Media stream: ws://localhost:${CONFIG.PORT}/media-stream`);
        console.log(`💚 Health check: http://localhost:${CONFIG.PORT}/`);
        console.log(`📋 Sessions: http://localhost:${CONFIG.PORT}/sessions`);
        console.log('');
        console.log('🏥 Gagan Hospital AI Assistant (Exotel) is ready to receive calls!');
        console.log('🇮🇳 Using Exotel for Indian phone number support');
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
