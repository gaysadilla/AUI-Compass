import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'beta' | 'coming-soon' | 'new';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant }) => {
  return (
    <div className={`custom-badge custom-badge--${variant}`}>
      {children}
    </div>
  );
};