// Session management for ongoing calls
export class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    createSession(sessionId, callerNumber, callDetails) {
        const session = {
            id: sessionId,
            transcript: '',
            streamSid: null,
            callerNumber: callerNumber || 'Unknown',
            callDetails: callDetails,
            mcpClient: null,
            aiOrchestrator: null,
            firstMessage: "Hello! Welcome to our hospital call center. I'm here to help you with booking appointments, suggesting doctors based on your symptoms, and managing your healthcare needs. How can I assist you today?",
            createdAt: new Date()
        };
        
        this.sessions.set(sessionId, session);
        console.log(`✅ Created session ${sessionId} for caller: ${callerNumber}`);
        return session;
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    updateSession(sessionId, updates) {
        const session = this.sessions.get(sessionId);
        if (session) {
            Object.assign(session, updates);
            this.sessions.set(sessionId, session);
        }
        return session;
    }

    addToTranscript(sessionId, role, message) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.transcript += `${role}: ${message}\n`;
            console.log(`${role} (${sessionId}): ${message}`);
        }
    }

    deleteSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            console.log(`🗑️ Deleting session ${sessionId}`);
            console.log('Full Transcript:');
            console.log(session.transcript);
            this.sessions.delete(sessionId);
            return session;
        }
        return null;
    }

    getAllSessions() {
        return Array.from(this.sessions.values());
    }

    getSessionCount() {
        return this.sessions.size;
    }
}

export default SessionManager;
