import React from 'react';
import { Title, Text } from 'react-figma-plugin-ds';
import { Badge } from './Badge';

interface FeatureCardProps {
  title: string;
  description: string;
  iconSrc: string;
  tag?: { text: string; variant?: 'beta' | 'coming-soon' | 'new' };
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  iconSrc, 
  tag, 
  onClick, 
  isActive, 
  disabled 
}) => {
  const cardClassName = [
    'feature-card',
    isActive && !disabled ? 'feature-card--active' : '',
    disabled ? 'feature-card--disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClassName}
      onClick={disabled ? undefined : onClick}
      tabIndex={disabled ? -1 : 0}
      role={onClick ? 'button' : undefined}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="feature-card__content">
        <div className="feature-card__header">
          <div className="feature-card__icon">
            <img src={iconSrc} alt="" width={40} height={40} />
          </div>
          {tag && (
            <div className="feature-card__tag">
              <Badge variant={tag.variant || 'beta'}>
                {tag.text}
              </Badge>
            </div>
          )}
        </div>
        <div className="feature-card__text">
          <Title className="feature-card__title">{title}</Title>
          <Text className="feature-card__description">{description}</Text>
        </div>
      </div>
    </div>
  );
};