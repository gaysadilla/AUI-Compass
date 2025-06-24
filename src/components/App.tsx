/// <reference types="react" />

import React, { useState, useEffect } from 'react';
import { DeprecatedComponent } from '../types';
import { registryData } from '../data/registryData';

// Import new ShadCN components
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';

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

      {/* Searching Screen */}
      {screen === Screen.Searching && (
        <div className="flex flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 px-2 self-start">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Searching for deprecated components...
              </h2>
              <p className="text-sm text-muted-foreground">
                Scanning {searchScope} for components that need updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {screen === Screen.Results && results.length > 0 && (
        <div className="flex flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 px-2 self-start">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Found {results.length} deprecated component(s)
              </h2>
              <p className="text-sm text-muted-foreground">
                Select a component to begin migration
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {results.map((component, index) => (
                <Card key={index} className="hover:bg-accent transition-colors">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium text-foreground">
                        {component.displayName || component.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {component.instanceCount} instance(s) found
                      </p>
                    </div>
                    <Button onClick={() => goToMigration(component)}>
                      Migrate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Migration Progress Screen */}
      {screen === Screen.Migration && selectedComponent && (
        <div className="flex flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 px-2 self-start">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Migrating {selectedComponent.displayName || selectedComponent.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Progress: {migrationProgress.completed + migrationProgress.failed} / {migrationProgress.total}
              </p>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <Progress 
                    value={((migrationProgress.completed + migrationProgress.failed) / migrationProgress.total) * 100}
                    className="h-2"
                  />
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed: {migrationProgress.completed}</span>
                    </div>
                    {migrationProgress.failed > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>Failed: {migrationProgress.failed}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
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
                className="w-full"
              >
                Start Migration
              </Button>
            )}

            {/* Complete button when all done */}
            {migrationProgress.completed + migrationProgress.failed === migrationProgress.total && (
              <Button onClick={goToMigrationComplete} className="w-full">
                View Results
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Migration Complete Screen */}
      {screen === Screen.MigrationComplete && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-6 py-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">Migration Complete!</h2>
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Successfully migrated:</span>
                      <span className="font-medium text-green-600">{migrationProgress.completed}</span>
                    </div>
                    {migrationProgress.failed > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Failed:</span>
                        <span className="font-medium text-red-600">{migrationProgress.failed}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t pt-2 mt-2">
                      <span className="text-muted-foreground">Total processed:</span>
                      <span className="font-medium">{migrationProgress.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={goToResults} className="flex-1">
                Back to Results
              </Button>
              <Button onClick={goToLanding} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No Results Screen */}
      {screen === Screen.Results && results.length === 0 && (
        <div className="flex flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 px-2 self-start">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex flex-col items-center gap-6 py-16">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                No deprecated components found
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                No Button components were found in the selected scope.
              </p>
              <Button onClick={goToLanding}>
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App; 