/// <reference types="react" />

import React, { useState, useEffect } from 'react';
import { DeprecatedComponent } from '../types';
import { registryData } from '../data/registryData';

// Import Figma Plugin DS components and styles
import { 
  Button, 
  Title, 
  Text,
  Icon, 
  Tip,
  Disclosure,
  Label
} from 'react-figma-plugin-ds';
import 'react-figma-plugin-ds/figma-plugin-ds.css';

// Import new components
import { LandingPage } from './LandingPage';
import { DeprecationAssistant } from './DeprecationAssistant';

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
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>([]);
  const [searchScope, setSearchScope] = useState<'selection' | 'page' | 'file'>('page');
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

  // Navigation helper to track history
  const navigateToScreen = (newScreen: Screen) => {
    setNavigationHistory(prev => [...prev, screen]);
    setScreen(newScreen);
  };

  // Back navigation
  const goBack = () => {
    if (navigationHistory.length > 0) {
      const previousScreen = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setScreen(previousScreen);
    } else {
      // If no history, go to landing
      setScreen(Screen.Landing);
    }
  };

  // Navigation handlers
  const goToDeprecationAssistant = () => navigateToScreen(Screen.DeprecationSearchMode);
  const goToSearch = (scope: 'selection' | 'page' | 'file') => {
    setSearchScope(scope);
    navigateToScreen(Screen.Searching);
    // Send search message to plugin backend with the correct scope
    parent.postMessage({ pluginMessage: { type: 'search', data: { scope } } }, '*');
  };
  const goToResults = () => navigateToScreen(Screen.Results);
  const goToLanding = () => {
    setNavigationHistory([]);
    setScreen(Screen.Landing);
  };
  const goToMigration = (component: DeprecatedComponent) => {
    setSelectedComponent(component);
    setMigrationProgress({ total: component.instances.length, completed: 0, failed: 0, batchSize: 25, currentBatch: 0, performanceMetrics: {} });
    navigateToScreen(Screen.Migration);
  };
  const goToMigrationComplete = () => navigateToScreen(Screen.MigrationComplete);

  // Back button component using Figma DS Button
  const BackButton = () => (
    <Button onClick={goBack} isSecondary>
      <Icon name="back" />
      Back
    </Button>
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
        case 'MIGRATION_COMPLETE':
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

  // Main render
  console.log('AUI Compass: UI RENDER');

  return (
    <div className="plugin-container">
      {/* Landing Page */}
      {screen === Screen.Landing && (
        <LandingPage onDeprecationAssistantClick={goToDeprecationAssistant} />
      )}

      {/* Deprecation Assistant - Search Mode Selection */}
      {screen === Screen.DeprecationSearchMode && (
        <DeprecationAssistant
          onBack={goBack}
          onSearchSelection={() => goToSearch('selection')}
          onSearchPage={() => goToSearch('page')}
          onSearchFile={() => goToSearch('file')}
        />
      )}

      {/* Other screens remain the same for now */}
      {screen === Screen.Searching && (
        <div className="searching-screen">
          <Button onClick={goBack} isSecondary>
            <Icon name="back" />
            Back
          </Button>
          <div className="searching-content">
            <Title size="large">Searching for deprecated components...</Title>
            <Text>Scanning {searchScope} for components that need updates.</Text>
          </div>
        </div>
      )}

      {screen === Screen.Results && results.length > 0 && (
        <div className="results-screen">
          <Button onClick={goBack} isSecondary>
            <Icon name="back" />
            Back
          </Button>
          <div className="results-content">
            <Title size="large">Found {results.length} deprecated component(s)</Title>
            {results.map((component, index) => (
              <div key={index} className="result-item">
                <div className="result-info">
                  <Text weight="bold">{component.displayName || component.name}</Text>
                  <Text>{component.instanceCount} instance(s) found</Text>
                </div>
                <Button onClick={() => goToMigration(component)}>
                  Migrate
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration Progress Screen */}
      {screen === Screen.Migration && selectedComponent && (
        <div className="migration-screen">
          <Button onClick={goBack} isSecondary>
            <Icon name="back" />
            Back
          </Button>
          <div className="migration-content">
            <Title size="large">Migrating {selectedComponent.displayName || selectedComponent.name}</Title>
            <Text>
              Progress: {migrationProgress.completed + migrationProgress.failed} / {migrationProgress.total}
            </Text>
            <div className="migration-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${((migrationProgress.completed + migrationProgress.failed) / migrationProgress.total) * 100}%`
                  }}
                />
              </div>
              <div className="migration-stats">
                <Text>✅ Completed: {migrationProgress.completed}</Text>
                {migrationProgress.failed > 0 && (
                  <Text>❌ Failed: {migrationProgress.failed}</Text>
                )}
              </div>
            </div>
            
                         {/* Start Migration Button */}
             {migrationProgress.completed === 0 && migrationProgress.failed === 0 && (
               <Button 
                 onClick={() => {
                   // Start migrating instances
                   selectedComponent.instances.forEach((instance, index) => {
                     setTimeout(() => {
                       parent.postMessage({
                         pluginMessage: {
                           type: 'migrate',
                           data: {
                             instanceId: instance.nodeId,
                             targetComponentKey: '090f47fec4dcae8e14a1ee5baf521cc7d9a2cda0' // Action component key
                           }
                         }
                       }, '*');
                     }, index * 100); // Small delay between migrations
                   });
                 }}
               >
                 Start Migration
               </Button>
             )}

            {/* Complete button when all done */}
            {migrationProgress.completed + migrationProgress.failed === migrationProgress.total && (
              <Button onClick={goToMigrationComplete}>
                View Results
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Migration Complete Screen */}
      {screen === Screen.MigrationComplete && (
        <div className="migration-complete-screen">
          <div className="migration-complete-content">
            <Title size="large">Migration Complete!</Title>
            <div className="migration-summary">
              <Text>✅ Successfully migrated: {migrationProgress.completed}</Text>
              {migrationProgress.failed > 0 && (
                <Text>❌ Failed: {migrationProgress.failed}</Text>
              )}
              <Text>Total processed: {migrationProgress.total}</Text>
            </div>
            <div className="migration-actions">
              <Button onClick={goToResults} isSecondary>
                Back to Results
              </Button>
              <Button onClick={goToLanding}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No Results Screen */}
      {screen === Screen.Results && results.length === 0 && (
        <div className="no-results-screen">
          <Button onClick={goBack} isSecondary>
            <Icon name="back" />
            Back
          </Button>
          <div className="no-results-content">
            <Title size="large">No deprecated components found</Title>
            <Text>No Button components were found in the selected scope.</Text>
            <Button onClick={goToLanding}>
              Return to Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App; 