# Gagan Hospital AI Call Center - Complete Medical Receptionist System

This is a **production-ready AI-powered call center** for Gagan Hospital, India. It combines OpenAI's realtime API with Twilio telephony to create an intelligent medical receptionist that can handle patient calls 24/7, book appointments, provide medical guidance, and manage healthcare operations.

## 🎯 **Complete AI Call Center Features**

### 🏥 **Core Medical Functionality**
- **🤖 AI Receptionist**: Natural voice conversations with patients
- **🌍 Multilingual Support**: Hindi, English, Hinglish, Kannada, Tamil, Telugu
- **📅 Appointment Management**: Book, check, and cancel appointments automatically
- **🩺 Medical Triage**: Suggest appropriate doctors based on symptoms
- **📊 Patient Data Extraction**: Automatically capture patient details from conversations
- **🔄 Multi-call Handling**: Manage multiple simultaneous calls

### 🤖 **Advanced AI Capabilities**
- **🎙️ Real-time Voice Processing**: OpenAI GPT-4 Realtime API for natural conversations
- **🔧 MCP Tool Integration**: Advanced function calling for hospital systems
- **🧠 Smart Conversations**: Context-aware, empathetic, and professional interactions
- **📝 Transcription**: Whisper-1 model for accurate speech-to-text
- **🎵 Voice Synthesis**: Natural-sounding AI voice responses

### 📞 **Telephony & Communication**
- **📱 Twilio Integration**: Professional call handling and routing
- **🔊 Audio Processing**: G.711 u-law format for crystal-clear voice quality
- **⚡ Real-time Streaming**: Low-latency audio streaming
- **📡 Call Management**: Session tracking and call history

### 🗄️ **Data & Analytics**
- **📊 PostgreSQL Database**: Store transcripts, appointments, patient data
- **📈 Conversation Analytics**: Extract insights from call patterns
- **🔍 Search & Retrieval**: Find past conversations and appointments
- **📋 Structured Data**: Organized patient information and medical history

## 🏗️ **System Architecture**

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Twilio    │───▶│   Fastify    │───▶│   OpenAI    │
│  (Calls)    │    │   (Server)   │    │   (AI)      │
└─────────────┘    └──────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌──────────────┐    ┌─────────────┐
                   │ PostgreSQL   │    │     MCP     │
                   │ (Database)   │    │ (Tools)     │
                   └──────────────┘    └─────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │   Analytics  │
                   │  & Insights  │
                   └──────────────┘
```

## 🚀 **Quick Start**

### Prerequisites
- **Node.js 18+** - Runtime environment
- **PostgreSQL 16+** - Database for data storage
- **OpenAI API Key** - For AI conversations
- **Twilio Account** - For telephony services
- **Verified Phone Number** - For testing

### Installation

1. **Clone & Setup**:
   ```bash
   git clone <repository-url>
   cd ai-calling
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.sample .env
   # Edit .env with your credentials
   ```

3. **Database Setup**:
   ```bash
   npm run db:init
   npm run db:seed  # Optional: Add sample data
   ```

4. **Start the Call Center**:
   ```bash
   npm run start:twilio
   ```

## 🔧 **Available Commands**

```bash
# Main Operations
npm start              # Start AI call center
npm run start:twilio    # Start with Twilio integration

# Testing & Development
npm run chat           # Interactive AI chat test
npm run test:call      # Make test phone call
npm run db:init        # Initialize database
npm run db:seed        # Add sample data
```

## 🌐 **API Endpoints**

- **`GET /`** - Health check and system status
- **`POST /incoming-call`** - Twilio webhook for incoming calls
- **`WS /media-stream`** - WebSocket for real-time audio streaming

## 📋 **Environment Configuration**

Create `.env` with:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/gagan_hospital
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=gagan_hospital

# Server Configuration
PORT=5051

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACyour-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
YOUR_VERIFIED_PHONE_NUMBER=+12295924640
```

## 🎭 **AI Assistant Capabilities**

### **Medical Receptionist Features**
- **Appointment Booking**: "Book appointment with Dr. Sharma for tomorrow at 10 AM"
- **Symptom Assessment**: "I have chest pain and headache"
- **Doctor Recommendations**: "Find cardiologist who speaks Hindi"
- **Appointment Management**: "Check my appointments for +91-9876543210"
- **Department Information**: "What services does the cardiology department offer?"

### **Conversation Examples**
```
Patient: "मुझे सिर दर्द हो रहा है और एक appointment book करनी है"
AI: "जी हाँ! सिर दर्द के लिए मैं आपको General Physician से appointment book कर देती हूँ। कल शाम 4 बजे ठीक होगा?"
```

### **Supported Languages**
- **Hindi**: पूरी बातचीत हिंदी में
- **English**: Complete conversations in English
- **Hinglish**: Natural mix of Hindi + English
- **Regional**: Kannada, Tamil, Telugu support

## 🗄️ **Database Schema**

### **Core Tables**
- **`customers`** - Patient information and call details
- **`appointments`** - Scheduled appointments and status
- **`call_transcripts`** - Complete conversation logs
- **`medical_records`** - Patient medical history

### **Data Flow**
1. **Call Starts** → Session created in database
2. **Conversation** → Real-time transcription and storage
3. **Function Calls** → Appointment booking, doctor lookup
4. **Call Ends** → Complete transcript saved with analytics

## 🔧 **MCP Integration**

The system uses **Model Context Protocol** for advanced capabilities:

### **Available Tools**
- **`book_appointment`** - Schedule patient appointments
- **`check_appointments`** - View existing appointments
- **`cancel_appointment`** - Cancel scheduled appointments
- **`find_doctors`** - Find doctors by specialty or language
- **`get_department_info`** - Department services and information

### **Tool Execution**
```javascript
// Example: AI calls appointment booking tool
await mcpClient.callTool('book_appointment', {
  patientName: "Rajesh Kumar",
  doctorName: "Dr. Sharma",
  dateTime: "2024-04-05T10:00:00Z",
  phoneNumber: "+91-9876543210"
});
```

## 🎵 **Audio Configuration**

Optimized for **Twilio telephony**:
- **Input Format**: G.711 u-law (g711_ulaw)
- **Output Format**: G.711 u-law (g711_ulaw)
- **Voice**: Alloy (natural, professional medical receptionist)
- **Transcription**: Whisper-1 for medical terminology accuracy

## 🚀 **Deployment**

### **Replit Deployment** (Recommended)
```bash
# Automatic deployment on push
git push origin main
# Replit will automatically start with npm run start:twilio
```

### **Manual Deployment**
```bash
# Build and start
npm install
npm run db:init
npm run start:twilio
```

### **Twilio Setup**
1. **Configure Webhook**: Set your server URL in Twilio console
2. **Phone Number**: Assign Twilio number to your application
3. **Test Call**: Use test script to verify functionality

## 🧪 **Testing**

### **Interactive Chat Test**
```bash
npm run chat
# Test AI conversation without phone calls
```

### **Phone Call Test**
```bash
npm run test:call
# Makes actual test call to your verified number
```

### **Test UI**
Open `test-integrated-ui.html` in browser for visual testing.

## 🔍 **Monitoring & Analytics**

### **Call Metrics**
- **Call Volume**: Number of calls per day/hour
- **Conversation Length**: Average call duration
- **Appointment Conversion**: Calls → Booked appointments ratio
- **Language Distribution**: Most used languages

### **AI Performance**
- **Response Accuracy**: How well AI understands medical queries
- **Tool Success Rate**: Appointment booking success rate
- **Patient Satisfaction**: Feedback and conversation quality

## 🛠️ **Troubleshooting**

### **Common Issues**
1. **No Audio Response**: Check audio format (g711_ulaw) and OpenAI API key
2. **Session Not Found**: Verify CallSid handling in WebSocket connection
3. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
4. **MCP Tools Not Working**: Check database environment variables alignment

### **Debug Mode**
```env
DEBUG=true
LOG_LEVEL=debug
```

### **Health Check**
```bash
curl http://localhost:5051/
# Returns server status and active session count
```

## 📁 **Project Structure**

```
ai-calling/
├── 📄 config.js                 # Main configuration
├── 📄 index.js                  # Server entry point
├── 📁 server/                   # Server components
│   ├── 📄 twilio-handler.js     # Twilio webhook processing
│   ├── 📄 media-stream-handler.js # WebSocket & audio handling
│   ├── 📄 openai-websocket.js   # OpenAI Realtime API client
│   └── 📄 session-manager.js    # Call session management
├── 📁 mcp/                      # Model Context Protocol
│   └── 📄 client.js             # MCP tool integration
├── 📁 database/                 # Database setup
│   ├── 📄 db.js                 # Database connection
│   └── 📄 init.js               # Database initialization
├── 📁 ai/                       # AI components
│   ├── 📄 test-chat.js          # Interactive testing
│   └── 📄 orchestrator-mcp.js   # AI orchestration
├── 📁 test/                     # Testing tools
│   └── 📄 make-call.js          # Test phone calls
└── 📄 .env.sample              # Environment template
```

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create Feature Branch**: `git checkout -b feature/new-capability`
3. **Test Thoroughly**: Ensure all tests pass
4. **Submit Pull Request**: With detailed description

## 📜 **License**

This project is licensed under the ISC License.

## 🆘 **Support**

For issues and questions:
- 📋 Check troubleshooting section
- 🔍 Review system logs for detailed errors
- ⚙️ Verify all environment variables
- 📞 Test with provided test scripts

---

## 🎉 **Production Ready**

Your Gagan Hospital AI Call Center is now ready to:
- 📞 **Handle patient calls 24/7**
- 📅 **Manage appointments automatically**
- 🩺 **Provide medical guidance**
- 🌍 **Support multiple languages**
- 📊 **Generate valuable insights**
- 🔄 **Scale with your hospital needs**

**Start helping patients smarter and faster!** 🏥🤖✨

Once the server is running, it will handle incoming Twilio calls. The AI agent will engage with callers, transcribe their speech, generate appropriate responses, and extract relevant information from the conversation.

## Note

This project is a demonstration and should be adapted for production use, including proper error handling, security measures, and compliance with relevant regulations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
