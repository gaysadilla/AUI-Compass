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

// Badge component for status indicators
const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant: 'beta' | 'coming-soon' | 'active';
}> = ({ children, variant }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'beta':
        return {
          backgroundColor: '#8B5CF6',
          color: '#ffffff'
        };
      case 'coming-soon':
        return {
          backgroundColor: '#F59E0B',
          color: '#ffffff'  
        };
      case 'active':
        return {
          backgroundColor: '#10B981',
          color: '#ffffff'
        };
      default:
        return {
          backgroundColor: '#6B7280',
          color: '#ffffff'
        };
    }
  };

  return (
    <span
      style={{
        ...getVariantStyles(),
        fontSize: '10px',
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
      }}
    >
      {children}
    </span>
  );
};

// Feature card component
const FeatureCard: React.FC<{
  title: string;
  description: string;
  iconSrc: string;
  badge?: { text: string; variant: 'beta' | 'coming-soon' | 'active' };
  onClick?: () => void;
  isActive?: boolean;
  position: { left: number; top: number };
}> = ({ title, description, iconSrc, badge, onClick, isActive = false, position }) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: '270px',
        height: '155px',
        left: `${position.left}px`,
        top: `${position.top}px`,
        position: 'absolute',
        borderRadius: '5px',
        outline: '1px #E6E6E6 solid',
        outlineOffset: '-1px',
        cursor: onClick ? 'pointer' : 'default',
        background: 'white'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.outline = '2px #1890ff solid';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.outline = '1px #E6E6E6 solid';
        }
      }}
    >
      {/* Main Content */}
      <div style={{
        alignSelf: 'stretch',
        left: '16px',
        top: '16px',
        position: 'absolute',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        display: 'inline-flex'
      }}>
        {/* Icon */}
        <div style={{
          width: '48px',
          height: '48px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Health Check Icon */}
          {iconSrc.includes('health-heart-pulse') && (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M8.208 18C8.086 17.324 8 16.654 8 16C8 11.14 11.14 8 16 8C18.578 8 20.704 9.876 21.574 12H26.426C27.296 9.876 29.422 8 32 8C36.86 8 40 11.14 40 16C40 17.306 39.734 18.648 39.3 20H43.424C43.77 18.664 44 17.326 44 16C44 8.934 39.066 4 32 4C28.812 4 25.86 5.674 24 8.16C22.14 5.674 19.188 4 16 4C8.934 4 4 8.934 4 16C4 16.664 4.076 17.332 4.168 18H8.208Z" fill="#1A1C1E"/>
              <path d="M23.9899 39.42C21.9139 37.686 19.0739 35.054 16.3599 32H11.1179C16.2439 38.44 22.3319 43.238 22.7739 43.58C23.1319 43.86 23.5659 44 23.9999 44C24.4339 44 24.8679 43.86 25.2259 43.58C25.6199 43.274 30.5219 39.412 35.2179 34H29.7919C27.4579 36.404 25.2819 38.33 23.9899 39.42Z" fill="#1A1C1E"/>
              <path d="M34.416 27.3179L39.394 23.9999H46V27.9999H40.606L33.584 32.6819L25.834 22.9959L18 30.8299L12 24.8299L8.828 27.9999H2V23.9999H7.172L12 19.1719L18 25.1719L26.166 17.0059L34.416 27.3179Z" fill="#1A1C1E"/>
            </svg>
          )}
          
          {/* Data Syncing Icon */}
          {iconSrc.includes('data-syncing') && (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M31.172 16.0019H16C11.59 16.0019 8 19.5919 8 24.0019H4C4 17.3839 9.382 12.0019 16 12.0019H31.172L26.586 7.41589L29.414 4.58789L37.414 12.5879C38.196 13.3699 38.196 14.6339 37.414 15.4159L29.414 23.4159L26.586 20.5879L31.172 16.0019Z" fill="#1A1C1E"/>
              <path d="M32 32.002C36.41 32.002 40 28.412 40 24.002H44C44 30.62 38.618 36.002 32 36.002H16.828L21.414 40.588L18.586 43.416L10.586 35.416C9.80401 34.634 9.80401 33.37 10.586 32.588L18.586 24.588L21.414 27.416L16.828 32.002H32Z" fill="#1A1C1E"/>
            </svg>
          )}

          {/* Window List Icon */}
          {iconSrc.includes('window-list') && (
            <svg width="48" height="48" viewBox="0 0 49 48" fill="none">
              <path d="M12.334 24C13.4386 24 14.334 23.1046 14.334 22C14.334 20.8954 13.4386 20 12.334 20C11.2294 20 10.334 20.8954 10.334 22C10.334 23.1046 11.2294 24 12.334 24Z" fill="#1A1C1E"/>
              <path d="M18.334 20H38.334V24H18.334V20Z" fill="#1A1C1E"/>
              <path d="M12.334 30C13.4386 30 14.334 29.1046 14.334 28C14.334 26.8954 13.4386 26 12.334 26C11.2294 26 10.334 26.8954 10.334 28C10.334 29.1046 11.2294 30 12.334 30Z" fill="#1A1C1E"/>
              <path d="M18.334 26H38.334V30H18.334V26Z" fill="#1A1C1E"/>
              <path d="M12.334 36C13.4386 36 14.334 35.1046 14.334 34C14.334 32.8954 13.4386 32 12.334 32C11.2294 32 10.334 32.8954 10.334 34C10.334 35.1046 11.2294 36 12.334 36Z" fill="#1A1C1E"/>
              <path d="M18.334 32H38.334V36H18.334V32Z" fill="#1A1C1E"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M42.334 4H6.33398C4.12798 4 2.33398 5.794 2.33398 8V40C2.33398 42.206 4.12798 44 6.33398 44H42.334C44.54 44 46.334 42.206 46.334 40V8C46.334 5.794 44.54 4 42.334 4ZM42.334 12H26.334V8H42.334V12ZM16.334 12V8H22.334V12H16.334ZM12.334 8V12H6.33398V8H12.334ZM6.33398 40V16H42.332L42.328 40H6.33398Z" fill="#1A1C1E"/>
            </svg>
          )}

          {/* Content Book Icon */}
          {iconSrc.includes('content-book-3') && (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M20 16H14V20H20V16Z" fill="#1A1C1E"/>
              <path d="M10 22H20V26H10V22Z" fill="#1A1C1E"/>
              <path d="M20 28H10V32H20V28Z" fill="#1A1C1E"/>
              <path d="M28 28H38V32H28V28Z" fill="#1A1C1E"/>
              <path d="M38 22H28V26H38V22Z" fill="#1A1C1E"/>
              <path d="M28 16H34V20H28V16Z" fill="#1A1C1E"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M42 8H28C27.468 8 26.96 8.21 26.586 8.586L24 11.172L21.414 8.586C21.04 8.212 20.532 8 20 8H6C4.894 8 4 8.898 4 10V36C4 37.104 4.894 38 6 38H19.172L22.586 41.414C22.976 41.806 23.488 42 24 42C24.512 42 25.024 41.804 25.414 41.414L28.828 38H42C43.106 38 44 37.104 44 36V10C44 8.898 43.106 8 42 8ZM8 34V12H19.172L22 14.83V35.174L21.414 34.588C21.04 34.212 20.532 34 20 34H8ZM40 12V34H28C27.468 34 26.96 34.21 26.586 34.586L26 35.172V14.83L28.828 12H40Z" fill="#1A1C1E"/>
            </svg>
          )}
        </div>

        {/* Title */}
        <div style={{
          alignSelf: 'stretch',
          textAlign: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          color: 'rgba(0, 0, 0, 0.90)',
          fontSize: '18px',
          fontFamily: 'Apercu Pro, Inter, sans-serif',
          fontWeight: '700',
          lineHeight: '23.40px',
          wordWrap: 'break-word'
        }}>
          {title}
        </div>

        {/* Description */}
        <div style={{
          alignSelf: 'stretch',
          textAlign: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          color: 'rgba(0, 0, 0, 0.90)',
          fontSize: '14px',
          fontFamily: 'Apercu Pro, Inter, sans-serif',
          fontWeight: '400',
          lineHeight: '18.20px',
          wordWrap: 'break-word'
        }}>
          {description}
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div style={{
          height: '16px',
          paddingLeft: '4px',
          paddingRight: '4px',
          left: badge.variant === 'beta' ? '211px' : '173px',
          top: '8px',
          position: 'absolute',
          background: badge.variant === 'beta' ? '#9747FF' : '#FFCD29',
          borderRadius: '5px',
          justifyContent: badge.variant === 'beta' ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          gap: '4px',
          display: 'inline-flex'
        }}>
          <div style={{
            textAlign: badge.variant === 'beta' ? 'right' : 'left',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: badge.variant === 'beta' ? 'white' : '#B86200',
            fontSize: '13px',
            fontFamily: 'Inter',
            fontWeight: '450',
            lineHeight: '22px',
            wordWrap: 'break-word'
          }}>
            {badge.text}
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Main render
  console.log('AUI Compass: UI RENDER');

  return (
    <div style={{ 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Enhanced Landing Page - Exact Figma Layout */}
      {screen === Screen.Landing && (
        <div style={{
          width: '620px',
          height: '724px',
          background: 'white',
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          borderRadius: '13px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'inline-flex'
        }}>
          {/* Main Content */}
          <div style={{
            alignSelf: 'stretch',
            paddingLeft: '32px',
            paddingRight: '32px',
            paddingTop: '24px',
            paddingBottom: '24px',
            background: 'white',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '24px',
            display: 'flex'
          }}>
            {/* Title and Logo */}
            <div style={{
              alignSelf: 'stretch',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              display: 'inline-flex'
            }}>
              <div style={{
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: 'rgba(0, 0, 0, 0.90)',
                fontSize: '48px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '56px',
                wordWrap: 'break-word'
              }}>
                AUI Compass
              </div>
              <div style={{
                width: '122px',
                height: '116px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src="./assets/logo.png" 
                  alt="AUI Compass Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.log('PNG failed to load, trying alternative paths...');
                    
                                         // Try different paths
                     const altPaths = [
                       './assets/image%201.png',
                       './assets/image 1.png',
                       'assets/logo.png',
                       'assets/image 1.png',
                       'assets/image%201.png'
                     ];
                    
                    let pathIndex = 0;
                    const tryNextPath = () => {
                      if (pathIndex < altPaths.length) {
                        e.currentTarget.src = altPaths[pathIndex];
                        pathIndex++;
                      } else {
                        // All paths failed, use fallback
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)';
                        e.currentTarget.parentElement!.innerHTML = '<span style="color: white; font-size: 48px; font-weight: bold; transform: rotate(45deg);">↗</span>';
                      }
                    };
                    
                    e.currentTarget.onerror = tryNextPath;
                    tryNextPath();
                  }}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div style={{
              alignSelf: 'stretch',
              textAlign: 'center',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: 'rgba(0, 0, 0, 0.90)',
              fontSize: '16px',
              fontFamily: 'Apercu Pro, Inter, sans-serif',
              fontWeight: '400',
              lineHeight: '20.80px',
              wordWrap: 'break-word'
            }}>
              AUI's Plugin Suite to take your designs to the next level
            </div>

            {/* Divider */}
            <div style={{
              alignSelf: 'stretch',
              height: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '556px',
                height: '1px',
                left: '0px',
                top: '7px',
                position: 'absolute',
                background: 'rgba(0, 0, 0, 0.10)',
                borderRadius: '2px'
              }} />
            </div>

            {/* How can we help you today? */}
            <div style={{
              alignSelf: 'stretch',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: 'rgba(0, 0, 0, 0.90)',
              fontSize: '16px',
              fontFamily: 'Apercu Pro, Inter, sans-serif',
              fontWeight: '400',
              lineHeight: '20.80px',
              wordWrap: 'break-word'
            }}>
              How can we help you today?
            </div>

            {/* Cards Container */}
            <div style={{
              alignSelf: 'stretch',
              height: '326px',
              position: 'relative'
            }}>
              <FeatureCard
                title="AUI Health Check"
                description="Get a quick status check of your AUI usage across your file"
                iconSrc="./assets/health-heart-pulse.svg"
                badge={{ text: 'Coming soon', variant: 'coming-soon' }}
                position={{ left: 0, top: 0 }}
              />
              
              <FeatureCard
                title="Deprecation Assistant"
                description="Swap to the newest version of component with no data loss"
                iconSrc="./assets/data-syncing.svg"
                badge={{ text: 'In Beta', variant: 'beta' }}
                onClick={goToDeprecationAssistant}
                isActive={true}
                position={{ left: 286, top: 0 }}
              />
              
              <FeatureCard
                title="Component Modules"
                description="Discover related component and modules for all of AUI's offerings"
                iconSrc="./assets/window-list.svg"
                badge={{ text: 'Coming soon', variant: 'coming-soon' }}
                position={{ left: 0, top: 171 }}
              />
              
              <FeatureCard
                title="Icon Gallery"
                description="View all available icons from AUI in one easy to view place"
                iconSrc="./assets/content-book-3.svg"
                badge={{ text: 'Coming soon', variant: 'coming-soon' }}
                position={{ left: 286, top: 171 }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            alignSelf: 'stretch',
            height: '40px',
            position: 'relative',
            background: 'white'
          }}>
            <div style={{
              width: '620px',
              height: '0px',
              left: '0px',
              top: '1px',
              position: 'absolute'
            }} />
          </div>
        </div>
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