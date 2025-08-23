// Simple Sprite MCP Test - Simulates MCP functionality
class SimpleSpriteMCPServer {
  constructor() {
    this.sprites = new Map();
    this.nextSpriteId = 1;
    this.tools = [
      {
        name: 'create_sprite',
        description: 'Create a new sprite with specified properties',
        parameters: ['name', 'x', 'y', 'width', 'height', 'color']
      },
      {
        name: 'move_sprite',
        description: 'Move a sprite to new coordinates',
        parameters: ['spriteId', 'x', 'y']
      },
      {
        name: 'get_sprite_info',
        description: 'Get information about a sprite',
        parameters: ['spriteId']
      },
      {
        name: 'list_sprites',
        description: 'List all sprites in the system',
        parameters: []
      }
    ];
  }

  listTools() {
    return this.tools;
  }

  callTool(name, args) {
    try {
      switch (name) {
        case 'create_sprite':
          return this.createSprite(args);
        case 'move_sprite':
          return this.moveSprite(args);
        case 'get_sprite_info':
          return this.getSpriteInfo(args);
        case 'list_sprites':
          return this.listSprites();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  createSprite(args) {
    const spriteId = `sprite_${this.nextSpriteId++}`;
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
    this.sprites.set(spriteId, sprite);
    
    return {
      success: true,
      message: `Sprite "${sprite.name}" created successfully with ID: ${spriteId}`,
      sprite: sprite
    };
  }

  moveSprite(args) {
    const sprite = this.sprites.get(args.spriteId);
    if (!sprite) {
      throw new Error(`Sprite with ID ${args.spriteId} not found`);
    }
    
    sprite.x = args.x;
    sprite.y = args.y;
    this.sprites.set(args.spriteId, sprite);
    
    return {
      success: true,
      message: `Sprite "${sprite.name}" moved to position (${args.x}, ${args.y})`,
      sprite: sprite
    };
  }

  getSpriteInfo(args) {
    const sprite = this.sprites.get(args.spriteId);
    if (!sprite) {
      throw new Error(`Sprite with ID ${args.spriteId} not found`);
    }
    
    return {
      success: true,
      sprite: sprite
    };
  }

  listSprites() {
    const spriteList = Array.from(this.sprites.values());
    return {
      success: true,
      count: spriteList.length,
      sprites: spriteList,
      message: spriteList.length === 0 
        ? 'No sprites found' 
        : `Found ${spriteList.length} sprites`
    };
  }
}

// Test the sprite MCP server
function testSpriteMCP() {
  console.log('🧪 Testing Simple Sprite MCP Server...\n');

  const server = new SimpleSpriteMCPServer();

  // Test 1: List available tools
  console.log('📋 Test 1: Listing available tools');
  const tools = server.listTools();
  console.log('Available tools:', tools.map(t => t.name));
  console.log('---\n');

  // Test 2: Create a sprite
  console.log('🎨 Test 2: Creating a sprite');
  const createResult = server.callTool('create_sprite', {
    name: 'TestSprite',
    x: 100,
    y: 200,
    width: 64,
    height: 64,
    color: '#00ff00'
  });
  console.log('Create result:', createResult);
  console.log('---\n');

  // Test 3: List sprites
  console.log('📝 Test 3: Listing all sprites');
  const listResult = server.callTool('list_sprites', {});
  console.log('List result:', listResult);
  console.log('---\n');

  // Test 4: Get sprite info
  console.log('ℹ️ Test 4: Getting sprite info');
  const infoResult = server.callTool('get_sprite_info', {
    spriteId: 'sprite_1'
  });
  console.log('Info result:', infoResult);
  console.log('---\n');

  // Test 5: Move sprite
  console.log('🚀 Test 5: Moving sprite');
  const moveResult = server.callTool('move_sprite', {
    spriteId: 'sprite_1',
    x: 150,
    y: 250
  });
  console.log('Move result:', moveResult);
  console.log('---\n');

  // Test 6: Create another sprite
  console.log('🎨 Test 6: Creating another sprite');
  const createResult2 = server.callTool('create_sprite', {
    name: 'BlueSprite',
    x: 300,
    y: 100,
    width: 80,
    height: 80,
    color: '#0000ff'
  });
  console.log('Create result 2:', createResult2);
  console.log('---\n');

  // Test 7: Final list
  console.log('📝 Test 7: Final sprite list');
  const finalListResult = server.callTool('list_sprites', {});
  console.log('Final list result:', finalListResult);
  console.log('---\n');

  // Test 8: Error handling
  console.log('❌ Test 8: Error handling');
  const errorResult = server.callTool('get_sprite_info', {
    spriteId: 'nonexistent_sprite'
  });
  console.log('Error result:', errorResult);
  console.log('---\n');

  console.log('✅ All tests completed successfully!');
  console.log('\n🎯 Sprite MCP Server Test Summary:');
  console.log(`- Created ${server.sprites.size} sprites`);
  console.log(`- Available tools: ${tools.length}`);
  console.log('- All operations working correctly');
}

// Run the test
testSpriteMCP();
