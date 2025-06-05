/// <reference types="react" />

import React, { useState, useEffect } from 'react';
import { PluginMessage } from '../types';
import { MESSAGE_TYPES } from '../utils/constants';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    
    // Handle messages from plugin
    window.onmessage = (event: MessageEvent) => {
      console.log('Message received:', event.data);
      const msg: PluginMessage = event.data.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case MESSAGE_TYPES.INIT:
          console.log('Received INIT message:', msg.data);
          setIsReady(true);
          break;

        case MESSAGE_TYPES.ERROR:
          console.error('Plugin error:', msg.data);
          break;
      }
    };

    return () => {
      window.onmessage = null;
    };
  }, []);

  const handleSearch = () => {
    console.log('Search button clicked');
    parent.postMessage({
      pluginMessage: {
        type: MESSAGE_TYPES.SEARCH,
        data: { scope: 'page' }
      }
    }, '*');
  };

  return (
    <div className="container" style={{ padding: '20px', background: '#ffffff', minHeight: '100vh' }}>
      <h2 style={{ color: '#333', marginBottom: '16px' }}>AUI Compass</h2>
      {isReady ? (
        <>
          <p style={{ marginBottom: '16px' }}>Ready to search for deprecated components.</p>
          <button 
            className="primary" 
            onClick={handleSearch}
            style={{
              padding: '8px 16px',
              background: '#18a0fb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Search Current Page
          </button>
        </>
      ) : (
        <p style={{ color: '#666' }}>Initializing...</p>
      )}
    </div>
  );
};

export default App; 