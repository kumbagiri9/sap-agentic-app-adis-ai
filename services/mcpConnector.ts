
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface McpConfig {
  serverUrl: string;
  auth: 'none' | 'api_key' | 'oauth2';
  apiKey?: string;
  safeMode: boolean;
  tenant: string;
}

class SapODataMcpConnector {
  private config: McpConfig;
  private toolCache: McpTool[] = [];
  private cacheExpiry: number = 0;

  constructor() {
    this.config = {
      serverUrl: process.env.MCP_SERVER_URL || '',
      auth: (process.env.MCP_AUTH as any) || 'none',
      apiKey: process.env.MCP_API_KEY,
      safeMode: process.env.SAFE_MODE !== 'false',
      tenant: process.env.SAP_TENANT || 'default'
    };
  }

  async discoverTools(): Promise<McpTool[]> {
    if (!this.config.serverUrl) return [];
    
    const now = Date.now();
    if (this.toolCache.length > 0 && now < this.cacheExpiry) {
      return this.toolCache;
    }

    try {
      const response = await fetch(`${this.config.serverUrl}/tools`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) throw new Error("MCP Server unreachable");
      
      const data = await response.json();
      this.toolCache = data.tools || [];
      this.cacheExpiry = now + 10 * 60 * 1000;
      return this.toolCache;
    } catch (error) {
      console.warn("[MCP] Discovery failed, using fallback tools.");
      return [];
    }
  }

  async callTool(name: string, args: any): Promise<any> {
    if (!this.config.serverUrl) return { error: "MCP not configured" };

    try {
      const response = await fetch(`${this.config.serverUrl}/tools/${name}/call`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ arguments: args, context: { tenant: this.config.tenant } })
      });
      return await response.json();
    } catch (error) {
      return { error: `Failed to execute MCP tool: ${name}` };
    }
  }

  private getHeaders() {
    const headers: any = { 'Content-Type': 'application/json' };
    if (this.config.auth === 'api_key' && this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    return headers;
  }
}

export const mcpConnector = new SapODataMcpConnector();
