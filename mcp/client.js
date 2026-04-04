import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MCPClient {
  constructor() {
    this.client = null;
    this.transport = null;
    this.tools = [];
  }

  async connect() {
    console.log('🔌 Connecting to MCP Server...');

    const serverPath = path.join(__dirname, 'server.js');

    this.transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
        PGHOST: process.env.PGHOST,
        PGPORT: process.env.PGPORT,
        PGUSER: process.env.PGUSER,
        PGPASSWORD: process.env.PGPASSWORD,
        PGDATABASE: process.env.PGDATABASE,
      },
    });

    this.client = new Client(
      {
        name: 'hospital-ai-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);
    console.log('✅ Connected to MCP Server');

    await this.loadTools();
  }

  async loadTools() {
    console.log('📦 Loading tools from MCP Server...');
    const response = await this.client.listTools();
    this.tools = response.tools;
    console.log(`✅ Loaded ${this.tools.length} tools:`);
    this.tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
  }

  getToolsForOpenAI() {
    return this.tools.map(tool => ({
      type: 'function',
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));
  }

  async callTool(name, args) {
    console.log(`🔧 Calling MCP tool: ${name}`, args);

    const response = await this.client.callTool({
      name,
      arguments: args,
    });

    if (response.isError) {
      console.error(`❌ Tool call failed: ${name}`);
      return {
        success: false,
        error: response.content[0]?.text || 'Unknown error',
      };
    }

    const result = JSON.parse(response.content[0].text);
    console.log('✅ Tool result:', result);
    return result;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MCP Server');
    }
  }

  getTools() {
    return this.tools;
  }
}

export default MCPClient;
