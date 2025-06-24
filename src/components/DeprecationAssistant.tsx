import React from 'react';
import { Button, Title, Text, Tip, Icon } from 'react-figma-plugin-ds';

interface DeprecationAssistantProps {
  onBack: () => void;
  onSearchSelection: () => void;
  onSearchPage: () => void;
  onSearchFile: () => void;
}

export const DeprecationAssistant: React.FC<DeprecationAssistantProps> = ({
  onBack,
  onSearchSelection,
  onSearchPage,
  onSearchFile
}) => {
  return (
    <div className="deprecation-assistant">
      <div className="deprecation-assistant__header">
        <Button onClick={onBack} isSecondary>
          <Icon name="back" />
          Back
        </Button>
      </div>

      <div className="deprecation-assistant__content">
        <div className="deprecation-assistant__title">
          <div className="deprecation-assistant__icon">
            🔄
          </div>
          <Title size="large">Deprecation Assistant</Title>
        </div>
        
        <Text className="deprecation-assistant__description">
          Our Deprecation Assistant automatically updates deprecated design system 
          components across your Figma files, saving hours of manual work while 
          ensuring your designs stay consistent with the latest standards.
        </Text>
        
        <Tip iconColor="blue">
          <Text>
            <a href="#" className="link">How does this work?</a>
          </Text>
        </Tip>
      </div>

      <div className="deprecation-assistant__actions">
        <Text weight="bold" className="deprecation-assistant__actions-title">
          How would you like to find the components?
        </Text>
        
        <div className="search-options">
          <div className="search-option" onClick={onSearchSelection} role="button" tabIndex={0}>
            <div className="search-option__icon">
              <img src="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/cursor-select-area-1.svg" alt="" width={20} height={20} />
            </div>
            <div className="search-option__content">
              <Text weight="bold">Current selection</Text>
            </div>
          </div>
          
          <div className="search-option" onClick={onSearchPage} role="button" tabIndex={0}>
            <div className="search-option__icon">
              📄
            </div>
            <div className="search-option__content">
              <Text weight="bold">Current page</Text>
            </div>
          </div>
          
          <div className="search-option" onClick={onSearchFile} role="button" tabIndex={0}>
            <div className="search-option__icon">
              <img src="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/file-new-2.svg" alt="" width={20} height={20} />
            </div>
            <div className="search-option__content">
              <Text weight="bold">Entire file</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};