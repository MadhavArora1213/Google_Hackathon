import os
import httpx
from typing import Dict, Any, Optional

class MCPClient:
    """Universal MCP Client with User Context / Token Injection support."""
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("MCP_SERVICE_URL", "http://localhost:8050")

    async def call_tool(self, tool_path: str, params: Dict[str, Any], auth: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Generic tool execution call.
        :param tool_path: e.g. 'calendar/event'
        :param params: tool-specific parameters
        :param auth: dictionary of tokens (google_token, notion_token, etc.)
        """
        async with httpx.AsyncClient() as client:
            try:
                # Bundle params + auth into the ToolRequest envelope
                payload = { "params": params, "auth": auth }
                
                response = await client.post(
                    f"{self.base_url}/mcp/{tool_path}", 
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                return data.get("result", {})
            except Exception as e:
                print(f"[MCP CLIENT ERROR] Tool {tool_path} failed: {e}")
                return {"error": str(e), "status": "failed"}

# Singleton instance
mcp = MCPClient()
