# Sprite MCP Server Test

This directory contains a simple Model Context Protocol (MCP) server for testing sprite operations.

## Files

- `mcp-sprite-server.js` - The main MCP server implementation
- `mcp-sprite-package.json` - Package configuration for MCP dependencies
- `test-sprite-mcp.js` - Test client to verify MCP server functionality
- `MCP_SPRITE_README.md` - This documentation file

## Setup Instructions

### 1. Install MCP Dependencies

```bash
cd backend
npm install @modelcontextprotocol/sdk
```

### 2. Test the MCP Server

Run the test client to verify the MCP server works:

```bash
node test-sprite-mcp.js
```

This will:
- Start the MCP server
- Send test messages to create, list, and manipulate sprites
- Display responses from the server
- Automatically close the server when testing is complete

### 3. Available MCP Tools

The sprite MCP server provides the following tools:

#### `create_sprite`
Creates a new sprite with specified properties.

**Parameters:**
- `name` (string, required) - Name of the sprite
- `x` (number, required) - X coordinate
- `y` (number, required) - Y coordinate
- `width` (number, optional) - Width of the sprite (default: 50)
- `height` (number, optional) - Height of the sprite (default: 50)
- `color` (string, optional) - Color of the sprite (default: '#ff0000')

#### `move_sprite`
Moves a sprite to new coordinates.

**Parameters:**
- `spriteId` (string, required) - ID of the sprite to move
- `x` (number, required) - New X coordinate
- `y` (number, required) - New Y coordinate

#### `get_sprite_info`
Gets detailed information about a sprite.

**Parameters:**
- `spriteId` (string, required) - ID of the sprite

#### `list_sprites`
Lists all sprites in the system.

**Parameters:** None

## Frontend Integration

The frontend includes a test component at `frontend/src/components/SpriteMCPTest.jsx` that provides a visual interface for testing MCP operations.

To use it:

1. Add the component to your main app
2. Navigate to the sprite MCP test page
3. Use the controls to test MCP operations
4. View logs in real-time

## MCP Protocol

The server implements the Model Context Protocol specification:

- **Transport**: stdio (standard input/output)
- **Protocol Version**: 2024-11-05
- **Capabilities**: Tools only
- **Message Format**: JSON-RPC 2.0

## Example Usage

### Starting the Server
```bash
node mcp-sprite-server.js
```

### Sample MCP Messages

**Initialize:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}
```

**Create Sprite:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "create_sprite",
    "arguments": {
      "name": "TestSprite",
      "x": 100,
      "y": 200,
      "width": 64,
      "height": 64,
      "color": "#00ff00"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Make sure to install the MCP SDK
2. **Server not responding**: Check that the server process is running
3. **Invalid JSON**: Ensure all messages follow JSON-RPC 2.0 format

### Debug Mode

To enable debug logging, modify the server code to include:

```javascript
console.error('Debug:', message);
```

## Next Steps

- Integrate with a real MCP client
- Add more sprite operations (rotation, scaling, etc.)
- Implement persistent storage
- Add authentication and security features
