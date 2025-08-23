const { spawn } = require('child_process');
const path = require('path');

// Test the sprite MCP server
async function testSpriteMCP() {
  console.log('🧪 Testing Sprite MCP Server...\n');

  // Start the MCP server
  const serverProcess = spawn('node', ['mcp-sprite-server.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test messages to send to the server
  const testMessages = [
    // Initialize the server
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'sprite-test-client',
          version: '1.0.0'
        }
      }
    },
    // List available tools
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    // Create a sprite
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'create_sprite',
        arguments: {
          name: 'TestSprite',
          x: 100,
          y: 200,
          width: 64,
          height: 64,
          color: '#00ff00'
        }
      }
    },
    // List sprites
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'list_sprites',
        arguments: {}
      }
    },
    // Get sprite info
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'get_sprite_info',
        arguments: {
          spriteId: 'sprite_1'
        }
      }
    },
    // Move sprite
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'move_sprite',
        arguments: {
          spriteId: 'sprite_1',
          x: 150,
          y: 250
        }
      }
    }
  ];

  let responseCount = 0;

  // Handle server responses
  serverProcess.stdout.on('data', (data) => {
    const responses = data.toString().trim().split('\n').filter(line => line.trim());
    
    responses.forEach(response => {
      try {
        const parsed = JSON.parse(response);
        responseCount++;
        
        console.log(`📨 Response ${responseCount}:`);
        console.log(JSON.stringify(parsed, null, 2));
        console.log('---\n');

        // If this was the last expected response, close the server
        if (responseCount >= testMessages.length) {
          console.log('✅ All tests completed!');
          serverProcess.kill();
        }
      } catch (error) {
        console.log('Raw response:', response);
      }
    });
  });

  // Handle server errors
  serverProcess.stderr.on('data', (data) => {
    console.log('Server stderr:', data.toString());
  });

  // Send test messages
  testMessages.forEach((message, index) => {
    setTimeout(() => {
      console.log(`📤 Sending test message ${index + 1}:`);
      console.log(JSON.stringify(message, null, 2));
      console.log('---\n');
      serverProcess.stdin.write(JSON.stringify(message) + '\n');
    }, index * 1000); // Send messages with 1-second intervals
  });

  // Handle server exit
  serverProcess.on('close', (code) => {
    console.log(`\n🎯 Server process exited with code ${code}`);
  });
}

// Run the test
testSpriteMCP().catch(console.error);
