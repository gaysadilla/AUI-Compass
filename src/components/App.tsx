/// <reference types="react" />

import React, { useState, useEffect } from 'react';
import { DeprecatedComponent } from '../types';

// Screen states
enum Screen {
  Landing,
  DeprecationSearchMode,
  Searching,
  Results
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.Landing);
  const [results, setResults] = useState<DeprecatedComponent[]>([]);

  // Navigation handlers
  const goToDeprecationAssistant = () => setScreen(Screen.DeprecationSearchMode);
  const goToSearch = () => {
    setScreen(Screen.Searching);
    // Send search message to plugin backend
    parent.postMessage({ pluginMessage: { type: 'search', data: { scope: 'page' } } }, '*');
  };
  const goToResults = () => setScreen(Screen.Results);
  const goToLanding = () => setScreen(Screen.Landing);

  // Listen for SEARCH_COMPLETE from plugin backend
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data.pluginMessage;
      if (msg && msg.type === 'search-complete') {
        console.log('AUI Compass: UI RECEIVED SEARCH_COMPLETE', msg.data);
        setResults(msg.data.components || []);
        setScreen(Screen.Results);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // UI3-like card style
  const cardStyle: React.CSSProperties = {
    border: '1px solid #e5e5e5',
    borderRadius: 12,
    padding: 24,
    background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    minWidth: 220,
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 16
  };

  // Main render
  console.log('AUI Compass: UI RENDER');
  return (
    <div style={{ padding: 32, background: '#f7f7f8', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Landing Page */}
      {screen === Screen.Landing && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            <img src="/icon.svg" alt="AUI Compass" style={{ width: 48, height: 48, marginRight: 16 }} />
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>AUI Compass</h1>
              <div style={{ color: '#666', fontSize: 16 }}>AUI's Plugin Suite to take your designs to the next level</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>AUI Health Check <span style={{ color: '#bfa700', fontSize: 12, marginLeft: 8 }}>(Coming soon)</span></div>
              <div style={{ color: '#888', fontSize: 14 }}>Get a quick status check of your AUI usage across your file</div>
            </div>
            <div style={{ ...cardStyle, border: '2px solid #18a0fb', cursor: 'pointer', position: 'relative' }} onClick={goToDeprecationAssistant}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Deprecation Assistant <span style={{ color: '#a06bfa', fontSize: 12, marginLeft: 8 }}>(In Beta)</span></div>
              <div style={{ color: '#888', fontSize: 14 }}>Swap to the newest version of component with no data loss</div>
              <span style={{ position: 'absolute', top: 12, right: 12, background: '#18a0fb', color: '#fff', borderRadius: 8, fontSize: 12, padding: '2px 8px' }}>Start</span>
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Component Modules <span style={{ color: '#bfa700', fontSize: 12, marginLeft: 8 }}>(Coming soon)</span></div>
              <div style={{ color: '#888', fontSize: 14 }}>Discover related component and modules for all of AUI's offerings</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Icon Gallery <span style={{ color: '#bfa700', fontSize: 12, marginLeft: 8 }}>(Coming soon)</span></div>
              <div style={{ color: '#888', fontSize: 14 }}>View all available icons from AUI in one easy to view place</div>
            </div>
          </div>
        </>
      )}

      {/* Deprecation Assistant - Search Mode Selection */}
      {screen === Screen.DeprecationSearchMode && (
        <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <button onClick={goToLanding} style={{ background: 'none', border: 'none', color: '#18a0fb', fontSize: 14, marginBottom: 16, cursor: 'pointer' }}>{'<'} Back</button>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Deprecation Assistant</h2>
          <div style={{ color: '#666', marginBottom: 24 }}>Our Deprecation Assistant automatically updates deprecated design system components across your Figma files, saving hours of manual work while ensuring your designs stay consistent with the latest standards.</div>
          <div style={{ marginBottom: 16, color: '#18a0fb', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>How does this work?</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <button onClick={goToSearch} style={{ flex: 1, padding: 20, borderRadius: 10, border: '1px solid #e5e5e5', background: '#f7f7f8', fontSize: 16, cursor: 'pointer' }}>Current selection</button>
            <button onClick={goToSearch} style={{ flex: 1, padding: 20, borderRadius: 10, border: '1px solid #e5e5e5', background: '#f7f7f8', fontSize: 16, cursor: 'pointer' }}>Current page</button>
            <button onClick={goToSearch} style={{ flex: 1, padding: 20, borderRadius: 10, border: '1px solid #e5e5e5', background: '#f7f7f8', fontSize: 16, cursor: 'pointer' }}>Entire file</button>
          </div>
        </div>
      )}

      {/* Searching State */}
      {screen === Screen.Searching && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div className="spinner" style={{ width: 48, height: 48, border: '4px solid #e5e5e5', borderTop: '4px solid #18a0fb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
          <div style={{ fontSize: 18, color: '#666' }}>Searching current page...</div>
        </div>
      )}

      {/* Results Page */}
      {screen === Screen.Results && (
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{results.length} deprecated components found</h2>
          <div style={{ color: '#666', marginBottom: 24 }}>Select the component you want to update</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {results.map((item, idx) => (
              <div key={item.key} style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f7f8', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 17 }}>{item.name}</div>
                  <div style={{ color: '#bfa700', fontSize: 13, fontWeight: 500 }}>{item.instanceCount} instances</div>
                  <div style={{ color: '#888', fontSize: 13 }}>Deprecated: {new Date(item.deprecatedDate).toLocaleString('default', { month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ color: '#18a0fb', fontWeight: 700, fontSize: 22 }}>{'>'}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e5e5', background: '#f7f7f8', color: '#aaa', fontWeight: 500, fontSize: 15, cursor: 'not-allowed' }}>Undo last change</button>
            <button style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e5e5', background: '#f7f7f8', color: '#aaa', fontWeight: 500, fontSize: 15, cursor: 'not-allowed' }}>Undo all changes</button>
          </div>
        </div>
      )}

      {/* Spinner animation */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App; 