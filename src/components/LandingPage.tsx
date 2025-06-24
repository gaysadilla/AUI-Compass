import React from 'react';
import { Title, Text } from 'react-figma-plugin-ds';
import { FeatureCard } from './FeatureCard';

interface LandingPageProps {
  onDeprecationAssistantClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onDeprecationAssistantClick }) => {
  return (
    <div className="landing-page">
      <div className="landing-page__header">
        <div className="landing-page__logo">
          <img 
            src="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/logo.png" 
            alt="AUI Compass Logo"
            width={64}
            height={64}
          />
        </div>
        <div className="landing-page__title">
          <Title size="large">AUI Compass</Title>
          <Text className="landing-page__subtitle">
            AUI's Plugin Suite to take your designs to the next level
          </Text>
        </div>
      </div>

      <div className="landing-page__prompt">
        <Text weight="bold">How can we help you today?</Text>
      </div>

      <div className="feature-cards-grid">
        <FeatureCard
          title="AUI Health Check"
          description="Get a quick status check of your AUI usage across your file"
          iconSrc="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/health-heart-pulse.svg"
          tag={{ text: 'Coming soon', variant: 'coming-soon' }}
          disabled
        />
        <FeatureCard
          title="Deprecation Assistant"
          description="Swap to the newest version of component with no data loss"
          iconSrc="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/data-syncing.svg"
          tag={{ text: 'In Beta', variant: 'beta' }}
          onClick={onDeprecationAssistantClick}
          isActive={true}
        />
        <FeatureCard
          title="Component Modules"
          description="Discover related component and modules for all of AUI's offerings"
          iconSrc="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/window-list.svg"
          tag={{ text: 'Coming soon', variant: 'coming-soon' }}
          disabled
        />
        <FeatureCard
          title="Icon Gallery"
          description="View all available icons from AUI in one easy to view place"
          iconSrc="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/content-book-3.svg"
          tag={{ text: 'Coming soon', variant: 'coming-soon' }}
          disabled
        />
      </div>
    </div>
  );
};