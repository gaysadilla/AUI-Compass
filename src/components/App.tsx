/// <reference types="react" />

import React, { useState, useEffect } from 'react';
import { DeprecatedComponent } from '../types';
import { registryData } from '../data/registryData';

// Screen states
enum Screen {
  Landing,
  DeprecationSearchMode,
  Searching,
  Results,
  Migration,
  MigrationComplete
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.Landing);
  const [results, setResults] = useState<DeprecatedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<DeprecatedComponent | null>(null);
  const [migrationProgress, setMigrationProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
    batchSize: number;
    currentBatch: number;
    performanceMetrics: {
      startTime?: number;
      endTime?: number;
      averageTimePerInstance?: number;
      fastestInstance?: number;
      slowestInstance?: number;
    };
  }>({ total: 0, completed: 0, failed: 0, batchSize: 25, currentBatch: 0, performanceMetrics: {} });

  // Navigation handlers
  const goToDeprecationAssistant = () => setScreen(Screen.DeprecationSearchMode);
  const goToSearch = () => {
    setScreen(Screen.Searching);
    // Send search message to plugin backend
    parent.postMessage({ pluginMessage: { type: 'search', data: { scope: 'page' } } }, '*');
  };
  const goToResults = () => setScreen(Screen.Results);
  const goToLanding = () => setScreen(Screen.Landing);
  const goToMigration = (component: DeprecatedComponent) => {
    setSelectedComponent(component);
    setMigrationProgress({ total: component.instances.length, completed: 0, failed: 0, batchSize: 25, currentBatch: 0, performanceMetrics: {} });
    setScreen(Screen.Migration);
  };

  // Back button component
  const BackButton = () => (
    <button 
      onClick={goToLanding} 
      style={{ 
        background: 'none', 
        border: 'none', 
        color: '#18a0fb', 
        fontSize: 14, 
        marginBottom: 16, 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}
    >
      <span style={{ fontSize: 18 }}>←</span> Back
    </button>
  );

  // Listen for messages from plugin backend
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'search-complete':
        console.log('AUI Compass: UI RECEIVED SEARCH_COMPLETE', msg.data);
        setResults(msg.data.components || []);
        setScreen(Screen.Results);
          break;

        case 'migration-complete':
          if (msg.data.success) {
            setMigrationProgress(prev => ({
              ...prev,
              completed: prev.completed + 1
            }));
          } else {
            setMigrationProgress(prev => ({
              ...prev,
              failed: prev.failed + 1
            }));
          }
          break;

        case 'error':
          console.error('Error from plugin:', msg.data.message);
          break;

        case 'COMPONENT_KEYS_RESULT':
          console.log('🔍 Component Keys Result:', msg.data);
          break;
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
          <BackButton />
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Deprecation Assistant</h2>
          <div style={{ color: '#666', marginBottom: 24 }}>Our Deprecation Assistant automatically updates deprecated design system components across your Figma files, saving hours of manual work while ensuring your designs stay consistent with the latest standards.</div>
          <div style={{ marginBottom: 16, color: '#18a0fb', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>How does this work?</div>
          <button 
            onClick={() => parent.postMessage({ pluginMessage: { type: 'GET_COMPONENT_KEYS' } }, '*')}
            style={{ marginBottom: 16, padding: '8px 16px', background: '#18a0fb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            🔍 Get Component Keys (Debug)
          </button>
          <button 
            onClick={() => parent.postMessage({ pluginMessage: { type: 'ANALYZE_COMPONENTS' } }, '*')}
            style={{ marginBottom: 16, padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            🔬 Analyze Component Properties
          </button>
          <button 
            onClick={() => parent.postMessage({ pluginMessage: { type: 'diagnose-themes' } }, '*')}
            style={{ marginBottom: 16, padding: '8px 16px', background: '#9747ff', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            🔍 Diagnose Theme Setup
          </button>
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
          <BackButton />
          <div className="spinner" style={{ width: 48, height: 48, border: '4px solid #e5e5e5', borderTop: '4px solid #18a0fb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
          <div style={{ fontSize: 18, color: '#666' }}>Searching current page...</div>
        </div>
      )}

      {/* Results Page */}
      {screen === Screen.Results && (
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <BackButton />
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{results.length} deprecated components found</h2>
          <div style={{ color: '#666', marginBottom: 24 }}>Select the component you want to update</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {results.map((item, idx) => (
              <div 
                key={item.key} 
                style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f7f8', cursor: 'pointer' }}
                onClick={() => goToMigration(item)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 17 }}>{item.displayName || item.name}</div>
                  <div style={{ color: '#bfa700', fontSize: 13, fontWeight: 500 }}>{item.instanceCount} instances</div>
                  <div style={{ color: '#888', fontSize: 13 }}>Deprecated: {new Date(item.deprecatedDate).toLocaleString('default', { month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ color: '#18a0fb', fontWeight: 700, fontSize: 22 }}>{'>'}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button
              onClick={goToLanding}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                background: '#f7f7f8',
                color: '#666',
                fontWeight: 500,
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Migration Page */}
      {screen === Screen.Migration && selectedComponent && (
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <BackButton />
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Migrating {selectedComponent.displayName || selectedComponent.name}</h2>
          <div style={{ color: '#666', marginBottom: 24 }}>
            Updating {selectedComponent.instanceCount} instances to the new component
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ 
              height: 8, 
              background: '#f7f7f8', 
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 8
            }}>
              <div style={{
                height: '100%',
                width: `${(migrationProgress.completed / migrationProgress.total) * 100}%`,
                background: '#18a0fb',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666' }}>
              <span>{migrationProgress.completed} completed</span>
              <span>{migrationProgress.failed} failed</span>
              <span>{migrationProgress.total} total</span>
            </div>
          </div>

          {/* Performance Settings */}
          <div style={{ 
            border: '1px solid #e5e5e5', 
            borderRadius: 8, 
            padding: 16,
            marginBottom: 24,
            background: '#f7f7f8'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Performance Settings</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <label style={{ fontSize: 13, color: '#666', minWidth: 80 }}>Batch Size:</label>
              <select 
                value={migrationProgress.batchSize}
                onChange={(e) => setMigrationProgress(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', fontSize: 13 }}
              >
                <option value={10}>10 (Conservative)</option>
                <option value={25}>25 (Recommended)</option>
                <option value={50}>50 (Aggressive)</option>
                <option value={100}>100 (High Memory)</option>
              </select>
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              Lower batch sizes use less memory but may be slower. Higher batch sizes are faster but use more memory.
              <br />Recommended: 25 instances per batch for optimal balance.
            </div>
          </div>

          {/* Migration Details */}
          <div style={{ 
            border: '1px solid #e5e5e5', 
            borderRadius: 8, 
            padding: 16,
            marginBottom: 24,
            background: '#f7f7f8'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Migration Details</h3>
            <div style={{ fontSize: 13, color: '#666' }}>
              <div style={{ marginBottom: 4 }}>From: {selectedComponent.displayName || selectedComponent.name}</div>
              <div>To: {registryData.mappings.find(m => m.sourceComponent.key === selectedComponent.key)?.targetComponent.displayName}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={async () => {
                // Get the target component key from the registry
                const mapping = registryData.mappings.find(m => m.sourceComponent.key === selectedComponent.key);
                if (!mapping?.targetComponent) {
                  console.error('No target component found for', selectedComponent.key);
                  return;
                }

                // Performance tracking
                const performanceTracker = {
                  startTime: performance.now(),
                  completedTimes: [] as number[],
                  totalInstances: selectedComponent.instances.length,
                  batchSize: migrationProgress.batchSize
                };

                console.log(`🚀 PERFORMANCE TEST: Starting migration of ${performanceTracker.totalInstances} instances`);
                console.log(`📦 Using batch size: ${performanceTracker.batchSize} instances per batch`);
                console.log(`🧮 Total batches: ${Math.ceil(performanceTracker.totalInstances / performanceTracker.batchSize)}`);

                // Process in batches to manage memory
                const batches = [];
                for (let i = 0; i < selectedComponent.instances.length; i += performanceTracker.batchSize) {
                  batches.push(selectedComponent.instances.slice(i, i + performanceTracker.batchSize));
                }

                let totalCompleted = 0;
                let totalFailed = 0;

                for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                  const batch = batches[batchIndex];
                  const batchStartTime = performance.now();
                  
                  console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} instances)`);

                  // Process batch in parallel
                  const migrationPromises = batch.map((instance, instanceIndex) => {
                    return new Promise((resolve) => {
                      const instanceStartTime = performance.now();
                      
                      const messageHandler = (event: MessageEvent) => {
                        const msg = event.data.pluginMessage;
                        if (msg && msg.type === 'migration-complete') {
                          window.removeEventListener('message', messageHandler);
                          const instanceEndTime = performance.now();
                          const instanceDuration = instanceEndTime - instanceStartTime;
                          performanceTracker.completedTimes.push(instanceDuration);
                          resolve({ 
                            success: msg.data.success, 
                            duration: instanceDuration,
                            batchIndex,
                            instanceIndex 
                          });
                        }
                      };
                      
                      window.addEventListener('message', messageHandler);
                      
                      // Send migration request
                      parent.postMessage({ 
                        pluginMessage: { 
                          type: 'migrate', 
                          data: { 
                            instanceId: instance.nodeId,
                            targetComponentKey: mapping.targetComponent.key
                          } 
                        } 
                      }, '*');
                    });
                  });

                  // Wait for batch to complete
                  const batchResults = await Promise.allSettled(migrationPromises);
                  const batchEndTime = performance.now();
                  const batchDuration = batchEndTime - batchStartTime;

                  // Count successes and failures for this batch
                  const batchCompleted = batchResults.filter((result: any) => 
                    result.status === 'fulfilled' && result.value.success
                  ).length;
                  const batchFailed = batch.length - batchCompleted;

                  totalCompleted += batchCompleted;
                  totalFailed += batchFailed;

                  console.log(`✅ Batch ${batchIndex + 1} complete: ${batchCompleted} succeeded, ${batchFailed} failed in ${Math.round(batchDuration)}ms`);

                  // Update progress
                  setMigrationProgress(prev => ({
                    ...prev,
                    completed: totalCompleted,
                    failed: totalFailed,
                    currentBatch: batchIndex + 1
                  }));

                  // Small delay between batches to prevent memory issues
                  if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                }

                // Final performance report
                const totalEndTime = performance.now();
                const totalDuration = totalEndTime - performanceTracker.startTime;
                const avgTimePerInstance = performanceTracker.completedTimes.length > 0 
                  ? performanceTracker.completedTimes.reduce((a, b) => a + b, 0) / performanceTracker.completedTimes.length
                  : 0;
                const fastestInstance = Math.min(...performanceTracker.completedTimes);
                const slowestInstance = Math.max(...performanceTracker.completedTimes);

                console.log(`\n📊 FINAL PERFORMANCE REPORT`);
                console.log(`⏱️  Total Migration Time: ${(totalDuration / 1000).toFixed(2)} seconds`);
                console.log(`📈 Instances Per Second: ${(performanceTracker.totalInstances / (totalDuration / 1000)).toFixed(2)}`);
                console.log(`📋 Average Time Per Instance: ${Math.round(avgTimePerInstance)}ms`);
                console.log(`🚀 Fastest Instance: ${Math.round(fastestInstance)}ms`);
                console.log(`🐌 Slowest Instance: ${Math.round(slowestInstance)}ms`);
                console.log(`✅ Success Rate: ${((totalCompleted / performanceTracker.totalInstances) * 100).toFixed(1)}%`);
                console.log(`📦 Batch Size Used: ${performanceTracker.batchSize} instances`);
                
                // Performance assessment
                if (avgTimePerInstance < 1000) {
                  console.log(`🎯 EXCELLENT: Average sub-second per instance`);
                } else if (avgTimePerInstance < 3000) {
                  console.log(`🎯 GOOD: Fast migration performance`);
                } else if (avgTimePerInstance < 10000) {
                  console.log(`⚠️  ACCEPTABLE: Could be optimized further`);
                } else {
                  console.log(`❌ NEEDS OPTIMIZATION: Very slow performance`);
                }
                
                console.log(`📊 END PERFORMANCE REPORT\n`);
              }}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                background: '#18a0fb',
                color: '#fff',
                fontWeight: 500,
                fontSize: 15,
                cursor: 'pointer',
                border: 'none'
              }}
            >
              Start Migration (Batch: {migrationProgress.batchSize})
            </button>
            <button
              onClick={goToResults}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                background: '#f7f7f8',
                color: '#666',
                fontWeight: 500,
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Migration Complete Page */}
      {screen === Screen.MigrationComplete && (
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Migration Complete</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Successfully migrated {migrationProgress.completed} instances
            {migrationProgress.failed > 0 && ` (${migrationProgress.failed} failed)`}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={goToResults}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                background: '#18a0fb',
                color: '#fff',
                fontWeight: 500,
                fontSize: 15,
                cursor: 'pointer',
                border: 'none'
              }}
            >
              Back to Results
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App; 