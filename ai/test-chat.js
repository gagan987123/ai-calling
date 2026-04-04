import dotenv from 'dotenv';
import { testConnection } from '../database/db.js';
import MCPClient from '../mcp/client.js';
import AIOrchestrator from './orchestrator-mcp.js';
import readline from 'readline';

dotenv.config();

async function interactiveChat() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🤖 AI Hospital Assistant - Interactive Chat Mode');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📋 Step 1: Testing Database Connection...');
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('\n❌ Database not connected. Please run:');
    console.error('   npm run docker:up');
    console.error('   npm run db:init');
    process.exit(1);
  }
  console.log('✅ Database connected\n');

  console.log('📋 Step 2: Checking OpenAI API Key...');
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.error('\n❌ OpenAI API key not configured.');
    console.error('   Please set OPENAI_API_KEY in .env file');
    process.exit(1);
  }
  console.log('✅ OpenAI API key configured\n');

  console.log('📋 Step 3: Starting MCP Client...');
  const mcpClient = new MCPClient();
  await mcpClient.connect();
  console.log('✅ MCP Client connected\n');

  console.log('📋 Step 4: Initializing AI Orchestrator with MCP...');
  const ai = new AIOrchestrator(mcpClient);
  console.log('✅ AI Orchestrator ready\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('💬 Interactive Chat Started - Type your messages below');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 Available commands:');
  console.log('   • Type your message to chat with the AI assistant');
  console.log('   • Type "exit" or "quit" to end the chat');
  console.log('   • Type "help" to see available features');
  console.log('   • Type "clear" to clear conversation history');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Create readline interface for interactive input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '👤 You: ',
  });

  let conversationCount = 0;

  const askQuestion = () => {
    rl.prompt();
  };

  const processMessage = async input => {
    const message = input.trim();

    if (!message) {
      askQuestion();
      return;
    }

    // Handle special commands
    if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
      console.log('\n👋 Ending chat session...');
      console.log(`💬 Total messages exchanged: ${conversationCount}`);
      await mcpClient.disconnect();
      rl.close();
      process.exit(0);
      return;
    }

    if (message.toLowerCase() === 'help') {
      console.log('\n🆘 AI Hospital Assistant can help you with:');
      console.log('   🩺 Find doctors based on symptoms or specialization');
      console.log('   � Book, check, or cancel appointments');
      console.log('   🌍 Find doctors who speak specific languages');
      console.log('   � Get information about departments and services');
      console.log('   💊 General medical inquiries and guidance');
      console.log('\n💡 Example messages:');
      console.log('   "I have chest pain and need a doctor"');
      console.log('   "Book an appointment with Dr. Rajesh Kumar for tomorrow"');
      console.log('   "Check my appointments for phone +91-9988776655"');
      console.log('   "I need a doctor who speaks Kannada"');
      console.log('');
      askQuestion();
      return;
    }

    if (message.toLowerCase() === 'clear') {
      console.log('\n🧹 Conversation history cleared\n');
      // Note: You would need to implement clearHistory in AIOrchestrator
      askQuestion();
      return;
    }

    conversationCount++;
    console.log(`\n🤖 Processing message ${conversationCount}...`);

    try {
      const result = await ai.chat(message);

      if (result.success) {
        console.log(`\n🤖 AI Assistant: ${result.response}`);
      } else {
        console.log(`\n❌ Error: ${result.error}`);
        console.log('💡 Please try rephrasing your message or type "help" for guidance.');
      }
    } catch (error) {
      console.log(`\n❌ System Error: ${error.message}`);
      console.log('💡 Please try again or contact support if the issue persists.');
    }

    console.log(''); // Add spacing for readability
    askQuestion();
  };

  // Start the interactive chat
  askQuestion();

  rl.on('line', input => {
    processMessage(input);
  });

  rl.on('close', () => {
    console.log('\n✨ Thank you for using AI Hospital Assistant!');
    process.exit(0);
  });
}

interactiveChat().catch(async error => {
  console.error('\n❌ Chat failed with error:', error);
  process.exit(1);
});
// Test workflow validation - Wed Apr  1 17:03:48 UTC 2026
// Workflow validation test - Wed Apr  1 17:22:54 UTC 2026
