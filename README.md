# AI Call Center - Complete SaaS Voice Assistant Platform

This is a **production-ready AI-powered call center SaaS platform** that provides intelligent voice assistants for any business type. It combines OpenAI's realtime API with Twilio telephony to create customizable AI receptionists that can handle customer calls 24/7, manage appointments, provide information, and automate business operations.

## 🎯 **Complete SaaS Call Center Features**

### � **Business Functionality**
- **🤖 AI Receptionist**: Natural voice conversations with customers
- **🌍 Multilingual Support**: English, Spanish, Hindi, and 50+ languages
- **📅 Appointment Management**: Book, check, and cancel appointments automatically
- **📋 Service Triage**: Route customers to appropriate departments or services
- **📊 Customer Data Extraction**: Automatically capture customer details from conversations
- **🔄 Multi-call Handling**: Manage multiple simultaneous calls
- **🎨 Customizable Personas**: Tailor AI personality for any business type

### 🤖 **Advanced AI Capabilities**
- **🎙️ Real-time Voice Processing**: OpenAI GPT-4 Realtime API for natural conversations
- **🔧 MCP Tool Integration**: Advanced function calling for business systems
- **🧠 Smart Conversations**: Context-aware, empathetic, and professional interactions
- **📝 Transcription**: Whisper-1 model for accurate speech-to-text
- **🎵 Voice Synthesis**: Natural-sounding AI voice responses
- **🔧 Custom Workflows**: Industry-specific conversation flows

### 📞 **Telephony & Communication**
- **📱 Twilio Integration**: Professional call handling and routing
- **🔊 Audio Processing**: G.711 u-law format for crystal-clear voice quality
- **⚡ Real-time Streaming**: Low-latency audio streaming
- **📡 Call Management**: Session tracking and call history
- **🌐 Global Coverage**: Support for international phone numbers

### 🗄️ **Data & Analytics**
- **📊 PostgreSQL Database**: Store transcripts, appointments, customer data
- **📈 Conversation Analytics**: Extract insights from call patterns
- **🔍 Search & Retrieval**: Find past conversations and appointments
- **📋 Structured Data**: Organized customer information and interaction history
- **📊 Business Intelligence**: Custom dashboards and reporting

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
   git clone https://github.com/gagan987123/ai-calling.git
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
   npm start
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
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_call_center
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=ai_call_center

# Server Configuration
PORT=5051

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACyour-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
YOUR_VERIFIED_PHONE_NUMBER=+12295924640
```

## 🎭 **AI Assistant Capabilities**

### **Business Receptionist Features**
- **Appointment Booking**: "Book appointment with Dr. Sharma for tomorrow at 10 AM"
- **Service Information**: "What services do you offer?"
- **Customer Support**: "I need help with my order"
- **Lead Generation**: "I'm interested in your premium package"
- **Emergency Handling**: "I have an urgent issue that needs immediate attention"

### **Industry Customization**
The platform supports multiple industries with customizable personas:

#### **🏥 Healthcare**
- Medical appointment scheduling
- Symptom assessment and doctor recommendations
- Prescription refill requests
- Insurance verification

#### **🏦 Professional Services**
- Law firm consultation booking
- Financial advisor appointments
- Real estate property showings
- Consulting session scheduling

#### **🛍️ Retail & E-commerce**
- Order status inquiries
- Product information and recommendations
- Return and exchange processing
- Customer support escalation

#### **🏨 Hospitality**
- Hotel reservation management
- Restaurant booking
- Event registration
- Concierge services

### **Conversation Examples**
```
Customer: "I need to schedule a consultation for next week"
AI: "I'd be happy to help you schedule that! What type of service do you need, and what day works best for you?"

Customer: "¿Hablan español? Necesito información sobre sus servicios"
AI: "¡Sí! Hablo español perfectamente. ¿En qué puedo ayudarte hoy?"
```

### **Supported Languages**
- **English**: Complete native conversations
- **Spanish**: Full Spanish language support
- **Hindi**: पूरी बातचीत हिंदी में
- **French**: Conversations françaises complètes
- **German**: Vollständige deutsche Gespräche
- **50+ more languages** via OpenAI's multilingual capabilities

## 🗄️ **Database Schema**

### **Core Tables**
- **`customers`** - Customer information and call details
- **`appointments`** - Scheduled appointments and status
- **`call_transcripts`** - Complete conversation logs
- **`business_data`** - Custom business-specific information
- **`analytics`** - Call metrics and insights

### **Data Flow**
1. **Call Starts** → Session created in database
2. **Conversation** → Real-time transcription and storage
3. **Function Calls** → Appointment booking, customer lookup
4. **Call Ends** → Complete transcript saved with analytics

## 🔧 **MCP Integration**

The system uses **Model Context Protocol** for advanced capabilities:

### **Available Tools**
- **`book_appointment`** - Schedule customer appointments
- **`check_appointments`** - View existing appointments
- **`cancel_appointment`** - Cancel scheduled appointments
- **`find_services`** - Find services by category or type
- **`get_business_info`** - Business hours, location, services
- **`create_lead`** - Generate sales leads from conversations
- **`escalate_issue`** - Route urgent matters to human agents

### **Custom Tool Development**
```javascript
// Example: Custom business tool
await mcpClient.callTool('book_service', {
  customerName: "John Smith",
  serviceType: "consultation",
  dateTime: "2024-04-05T14:00:00Z",
  businessUnit: "premium-services"
});
```

## 🎵 **Audio Configuration**

Optimized for **Twilio telephony**:
- **Input Format**: G.711 u-law (g711_ulaw)
- **Output Format**: G.711 u-law (g711_ulaw)
- **Voice**: Alloy (natural, professional receptionist)
- **Transcription**: Whisper-1 for accurate terminology

## 🚀 **Deployment**

### **Replit Deployment** (Recommended)
```bash
# Automatic deployment on push
git push origin main
# Replit will automatically start with npm start
```

### **Manual Deployment**
```bash
# Build and start
npm install
npm run db:init
npm start
```

### **Cloud Platforms**
- **AWS**: Deploy with Elastic Beanstalk
- **Google Cloud**: Use Cloud Run
- **Azure**: App Service deployment
- **DigitalOcean**: App Platform

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
- **Conversion Rate**: Calls → Booked appointments ratio
- **Language Distribution**: Most used languages
- **Customer Satisfaction**: Feedback and quality scores

### **Business Intelligence**
- **Peak Hours**: Busiest times for calls
- **Service Demand**: Most requested services
- **Customer Patterns**: Repeat caller analysis
- **Revenue Impact**: Calls converted to business value

### **AI Performance**
- **Response Accuracy**: How well AI understands queries
- **Tool Success Rate**: Function call success rate
- **Conversation Quality**: Customer satisfaction metrics

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

## 🎉 **Production Ready SaaS Platform**

Your AI Call Center is now ready to:
- 📞 **Handle customer calls 24/7**
- 📅 **Manage appointments automatically**
- 🏢 **Serve any business type**
- 🌍 **Support multiple languages**
- 📊 **Generate valuable insights**
- 🔄 **Scale with business needs**
- 💰 **Create revenue opportunities**

**Start transforming your customer service today!** 🤖✨

---

## 🚧 **Development Status**

This is an **active SaaS platform in development** with:
- ✅ Core voice AI functionality
- ✅ Twilio integration
- ✅ Multi-language support
- ✅ Custom business personas
- 🚧 Advanced analytics dashboard
- 🚧 CRM integrations
- 🚧 Mobile app companion
- 🚧 White-label options

**Join us in building the future of AI-powered customer service!** 🚀

Once the server is running, it will handle incoming Twilio calls. The AI agent will engage with callers, transcribe their speech, generate appropriate responses, and extract relevant information from the conversation.

## Note

This project is a demonstration and should be adapted for production use, including proper error handling, security measures, and compliance with relevant regulations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
