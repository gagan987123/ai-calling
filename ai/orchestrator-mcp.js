import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export class AIOrchestrator {
  constructor(mcpClient) {
    this.mcpClient = mcpClient;
    this.conversationHistory = [];
  }

  async chat(userMessage, systemPrompt = null) {
    const defaultSystemPrompt = `You are a helpful AI assistant for a hospital call center in India. 
You help patients book appointments, suggest doctors based on symptoms, and manage their healthcare needs.

Key behaviors:
- Be empathetic and professional
- Use Hinglish (Hindi + English) when appropriate: "Aapka appointment book kar diya gaya hai"
- Support multiple Indian languages (Hindi, English, Kannada, Tamil, Telugu)
- When patients describe symptoms, suggest appropriate specialists
- Always confirm appointment details before booking

Remember: You're helping real patients with their healthcare needs. Be accurate and helpful.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt || defaultSystemPrompt,
      },
      ...this.conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('\n🤖 AI Processing:', userMessage);

    try {
      const tools = this.mcpClient.getToolsForOpenAI();

      let response = await openai.chat.completions.create({
        model: 'stepfun/step-3.5-flash:free',
        messages: messages,
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.7,
        extra_body: { reasoning: { enabled: true } },
      });

      let assistantMessage = response.choices[0].message;
      this.conversationHistory.push({ role: 'user', content: userMessage });

      while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log(`\n🔧 AI wants to call ${assistantMessage.tool_calls.length} tool(s):`);

        this.conversationHistory.push({
          role: 'assistant',
          content: assistantMessage.content,
          tool_calls: assistantMessage.tool_calls,
          reasoning_details: assistantMessage.reasoning_details,
        });

        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          console.log(`   - ${functionName}(${JSON.stringify(functionArgs)})`);

          const toolResult = await this.mcpClient.callTool(functionName, functionArgs);

          this.conversationHistory.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }

        response = await openai.chat.completions.create({
          model: 'stepfun/step-3.5-flash:free',
          messages: [
            { role: 'system', content: systemPrompt || defaultSystemPrompt },
            ...this.conversationHistory,
          ],
          tools: tools,
          tool_choice: 'auto',
          temperature: 0.7,
          extra_body: { reasoning: { enabled: true } },
        });

        assistantMessage = response.choices[0].message;
      }

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage.content,
        reasoning_details: assistantMessage.reasoning_details,
      });

      const finalResponse = assistantMessage.content;
      console.log('\n💬 AI Response:', finalResponse);

      return {
        success: true,
        response: finalResponse,
        conversationHistory: this.conversationHistory,
      };
    } catch (error) {
      console.error('❌ AI Orchestrator Error:', error);
      return {
        success: false,
        error: error.message,
        response: 'I apologize, but I encountered an error. Please try again.',
      };
    }
  }

  resetConversation() {
    this.conversationHistory = [];
    console.log('🔄 Conversation history reset');
  }

  getConversationHistory() {
    return this.conversationHistory;
  }
}

export default AIOrchestrator;
