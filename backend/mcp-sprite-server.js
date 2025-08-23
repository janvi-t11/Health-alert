const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

// Initialize the server
const server = new Server(
  {
    name: 'sprite-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define sprite-related tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'create_sprite',
        description: 'Create a new sprite with specified properties',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the sprite' },
            x: { type: 'number', description: 'X coordinate' },
            y: { type: 'number', description: 'Y coordinate' },
            width: { type: 'number', description: 'Width of the sprite' },
            height: { type: 'number', description: 'Height of the sprite' },
            color: { type: 'string', description: 'Color of the sprite' }
          },
          required: ['name', 'x', 'y']
        }
      },
      {
        name: 'move_sprite',
        description: 'Move a sprite to new coordinates',
        inputSchema: {
          type: 'object',
          properties: {
            spriteId: { type: 'string', description: 'ID of the sprite to move' },
            x: { type: 'number', description: 'New X coordinate' },
            y: { type: 'number', description: 'New Y coordinate' }
          },
          required: ['spriteId', 'x', 'y']
        }
      },
      {
        name: 'get_sprite_info',
        description: 'Get information about a sprite',
        inputSchema: {
          type: 'object',
          properties: {
            spriteId: { type: 'string', description: 'ID of the sprite' }
          },
          required: ['spriteId']
        }
      },
      {
        name: 'list_sprites',
        description: 'List all sprites in the system',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// In-memory storage for sprites
const sprites = new Map();
let nextSpriteId = 1;

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_sprite':
        const spriteId = `sprite_${nextSpriteId++}`;
        const sprite = {
          id: spriteId,
          name: args.name,
          x: args.x || 0,
          y: args.y || 0,
          width: args.width || 50,
          height: args.height || 50,
          color: args.color || '#ff0000',
          createdAt: new Date().toISOString()
        };
        sprites.set(spriteId, sprite);
        
        return {
          content: [
            {
              type: 'text',
              text: `Sprite "${sprite.name}" created successfully with ID: ${spriteId}`
            }
          ]
        };

      case 'move_sprite':
        const spriteToMove = sprites.get(args.spriteId);
        if (!spriteToMove) {
          throw new Error(`Sprite with ID ${args.spriteId} not found`);
        }
        
        spriteToMove.x = args.x;
        spriteToMove.y = args.y;
        sprites.set(args.spriteId, spriteToMove);
        
        return {
          content: [
            {
              type: 'text',
              text: `Sprite "${spriteToMove.name}" moved to position (${args.x}, ${args.y})`
            }
          ]
        };

      case 'get_sprite_info':
        const spriteInfo = sprites.get(args.spriteId);
        if (!spriteInfo) {
          throw new Error(`Sprite with ID ${args.spriteId} not found`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(spriteInfo, null, 2)
            }
          ]
        };

      case 'list_sprites':
        const spriteList = Array.from(sprites.values());
        return {
          content: [
            {
              type: 'text',
              text: spriteList.length === 0 
                ? 'No sprites found' 
                : `Found ${spriteList.length} sprites:\n${spriteList.map(s => `- ${s.name} (ID: ${s.id}) at (${s.x}, ${s.y})`).join('\n')}`
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Sprite MCP Server started');
}

main().catch(console.error);
