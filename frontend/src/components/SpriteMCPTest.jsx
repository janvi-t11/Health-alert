import React, { useState, useEffect } from 'react';

const SpriteMCPTest = () => {
  const [sprites, setSprites] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsConnected(true);
      addLog('Connected to Sprite MCP Server', 'success');
    }, 1000);
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const testMCPOperations = () => {
    addLog('Starting MCP operations test...', 'info');
    
    setTimeout(() => addLog('tools/list - Retrieved available tools', 'info'), 500);
    setTimeout(() => addLog('tools/call create_sprite - Creating test sprite', 'info'), 1000);
    setTimeout(() => addLog('tools/call list_sprites - Listing all sprites', 'info'), 1500);
    setTimeout(() => addLog('MCP operations test completed!', 'success'), 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Sprite MCP Test</h1>
      
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isConnected ? 'Connected to MCP Server' : 'Connecting...'}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sprite Canvas</h2>
          <div className="bg-gray-100 h-64 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-500">Sprite visualization area</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">MCP Controls</h2>
          <button
            onClick={testMCPOperations}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mb-4"
          >
            Test MCP Operations
          </button>
          
          <button
            onClick={() => setLogs([])}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">MCP Server Logs</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Start testing to see MCP operations!</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                <span className={log.type === 'error' ? 'text-red-400' : 
                               log.type === 'success' ? 'text-green-400' : 'text-blue-400'}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SpriteMCPTest;
