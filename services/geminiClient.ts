import { Message, ToolResult, UserRole, SapBackendTarget } from "../types";

function sanitizeHistory(history: Message[]): { role: string; content: string }[] {
  if (!history || !Array.isArray(history)) return [];
  // Keep only last 4 messages to avoid payload explosion over network
  const recent = history.slice(-4);
  return recent.map(msg => {
    let content = typeof msg.content === 'string' ? msg.content : '';
    if (content.length > 2000) {
      content = content.slice(0, 1000) + "\n... [Truncated for payload efficiency] ...\n" + content.slice(-1000);
    }
    return {
      role: msg.role === 'user' ? 'user' : 'assistant',
      content
    };
  });
}

export async function processSapQuery(
  query: string,
  userRole: UserRole,
  history: Message[] = [],
  images?: { name: string; type: string; data: string }[],
  onAgentUpdate?: (agent: string, action: string) => void,
  backendTarget: SapBackendTarget = 'BOTH'
): Promise<{ text: string; toolResults: ToolResult[] }> {
  try {
    const cleanHistory = sanitizeHistory(history);

    let response = await fetch('/api/gemini/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, userRole, history: cleanHistory, images, backendTarget })
    });

    if (response.status === 413) {
      console.warn("HTTP 413 Payload Too Large encountered. Retrying query with minimal history payload...");
      response = await fetch('/api/gemini/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, userRole, history: [], images, backendTarget })
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Received HTML response instead of JSON stream. The server might still be starting up or is in an error state.');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let finalText = '[LIVE_SAP_UNAVAILABLE] SAP Connection Gateway Timeout.';
    let finalToolResults: ToolResult[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        if (trimmedLine.startsWith('<')) continue; // Skip HTML tags gracefully without console error noise
        try {
          const data = JSON.parse(trimmedLine);
          if (data.type === 'agent_update') {
            onAgentUpdate?.(data.name, data.action);
          } else if (data.type === 'result') {
            finalText = data.text;
            finalToolResults = data.toolResults || [];
          }
        } catch (err) {
          console.error('Error parsing streaming line:', trimmedLine, err);
        }
      }
    }

    // Parse remaining buffer if any
    if (buffer.trim()) {
      const trimmedBuffer = buffer.trim();
      if (!trimmedBuffer.startsWith('<')) {
        try {
          const data = JSON.parse(trimmedBuffer);
          if (data.type === 'result') {
            finalText = data.text;
            finalToolResults = data.toolResults || [];
          }
        } catch {}
      }
    }

    // Sync client-side idoc state if we have tool results
    if (finalToolResults && finalToolResults.length > 0) {
      try {
        const { idocService } = await import("./idocService");
        for (const result of finalToolResults) {
          if (result.type === 'transaction_result' && result.data && result.data.idoc) {
            const idoc = result.data.idoc;
            await idocService.updateIdocStatus(idoc.id, idoc.currentStatus);
          } else if (result.type === 'idoc_reprocessing' && Array.isArray(result.data)) {
            for (const reprocessResult of result.data) {
              if (reprocessResult.success && reprocessResult.idocId) {
                await idocService.updateIdocStatus(reprocessResult.idocId, reprocessResult.finalStatus);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error syncing client-side IDoc state:", err);
      }
    }

    return { text: finalText, toolResults: finalToolResults };
  } catch (error) {
    console.error("Error calling backend Gemini API:", error);
    return {
      text: "[LIVE_SAP_UNAVAILABLE] I encountered an error connecting to the SAP Core Gateway. Please verify the environment credentials.",
      toolResults: []
    };
  }
}
