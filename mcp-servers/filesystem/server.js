const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');

const wss = new WebSocket.Server({ port: 8001 });

const tools = [
  {
    name: "read_file",
    description: "Read contents of a file",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to read" }
      },
      required: ["path"]
    }
  },
  {
    name: "write_file",
    description: "Write content to a file",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to write" },
        content: { type: "string", description: "Content to write" }
      },
      required: ["path", "content"]
    }
  },
  {
    name: "list_directory",
    description: "List contents of a directory",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Directory path to list" }
      },
      required: ["path"]
    }
  }
];

wss.on('connection', (ws) => {
  console.log('MCP Filesystem server connected');

  ws.on('message', async (message) => {
    try {
      const request = JSON.parse(message);
      
      if (request.method === 'initialize') {
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: "filesystem-server",
              version: "1.0.0"
            }
          }
        }));
      } else if (request.method === 'tools/list') {
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: { tools }
        }));
      } else if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        let result;

        switch (name) {
          case 'read_file':
            result = await fs.readFile(args.path, 'utf8');
            break;
          case 'write_file':
            await fs.writeFile(args.path, args.content);
            result = { success: true };
            break;
          case 'list_directory':
            const files = await fs.readdir(args.path);
            result = { files };
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: JSON.stringify(result) }] }
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        jsonrpc: "2.0",
        id: request.id,
        error: { code: -1, message: error.message }
      }));
    }
  });
});

console.log('MCP Filesystem server listening on port 8001');
